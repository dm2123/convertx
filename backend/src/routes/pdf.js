const express = require('express')
const router = express.Router()
const { PDFDocument } = require('pdf-lib')
const fs = require('fs')
const path = require('path')
const { upload, cleanupFile } = require('../middleware/upload')

// Compress PDF
router.post('/compress', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const buf = fs.readFileSync(req.file.path)
    const pdfDoc = await PDFDocument.load(buf)
    const compressed = await pdfDoc.save({ useObjectStreams: true })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="compressed_${req.file.originalname}"`)
    res.send(Buffer.from(compressed))
    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Failed to compress PDF.' })
  }
})

// Merge PDFs
router.post('/merge', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 PDF files required.' })
    const mergedPdf = await PDFDocument.create()
    for (const file of req.files) {
      const buf = fs.readFileSync(file.path)
      const pdf = await PDFDocument.load(buf)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(p => mergedPdf.addPage(p))
      cleanupFile(file.path)
    }
    const merged = await mergedPdf.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"')
    res.send(Buffer.from(merged))
  } catch (err) {
    req.files?.forEach(f => cleanupFile(f.path))
    res.status(500).json({ error: 'Failed to merge PDFs.' })
  }
})

// Split PDF
router.post('/split', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const { pages } = req.body
    const buf = fs.readFileSync(req.file.path)
    const srcDoc = await PDFDocument.load(buf)
    const newDoc = await PDFDocument.create()
    const indices = parsePageRange(pages || '1-', srcDoc.getPageCount())
    const copiedPages = await newDoc.copyPages(srcDoc, indices)
    copiedPages.forEach(p => newDoc.addPage(p))
    const bytes = await newDoc.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="split.pdf"')
    res.send(Buffer.from(bytes))
    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Failed to split PDF.' })
  }
})

// Rotate PDF
router.post('/rotate', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const { angle = 90 } = req.body
    const buf = fs.readFileSync(req.file.path)
    const pdfDoc = await PDFDocument.load(buf)
    const { degrees } = require('pdf-lib')
    pdfDoc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + parseInt(angle)) % 360)))
    const bytes = await pdfDoc.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="rotated_${req.file.originalname}"`)
    res.send(Buffer.from(bytes))
    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Failed to rotate PDF.' })
  }
})

// Protect PDF
router.post('/protect', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const { password } = req.body
    if (!password) return res.status(400).json({ error: 'Password is required.' })
    const buf = fs.readFileSync(req.file.path)
    const pdfDoc = await PDFDocument.load(buf)
    const protectedBytes = await pdfDoc.save({ userPassword: password })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="protected_${req.file.originalname}"`)
    res.send(Buffer.from(protectedBytes))
    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Failed to protect PDF.' })
  }
})

// Unlock PDF
router.post('/unlock', upload.single('files'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const buf = fs.readFileSync(req.file.path)
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true })
    const bytes = await pdfDoc.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="unlocked_${req.file.originalname}"`)
    res.send(Buffer.from(bytes))
    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Failed to unlock PDF.' })
  }
})

// Generic tool endpoint
router.post('/:slug', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' })
    // For now, return the first PDF as-is
    const firstFile = req.files[0]
    const data = fs.readFileSync(firstFile.path)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="processed_${firstFile.originalname}"`)
    res.send(Buffer.from(data))
    req.files.forEach(f => cleanupFile(f.path))
  } catch (err) {
    req.files?.forEach(f => cleanupFile(f.path))
    res.status(500).json({ error: 'Processing failed.' })
  }
})

function parsePageRange(str, max) {
  const result = []
  str.split(',').forEach(s => {
    const t = s.trim()
    if (t.includes('-')) {
      const [a, b] = t.split('-').map(Number)
      for (let i = Math.max(1, a || 1); i <= Math.min(max, b || max); i++) result.push(i - 1)
    } else {
      const n = parseInt(t)
      if (n >= 1 && n <= max) result.push(n - 1)
    }
  })
  return result.length > 0 ? result : Array.from({ length: max }, (_, i) => i)
}

module.exports = router
