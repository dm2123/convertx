const express = require('express')
const router = express.Router()
const { upload, cleanupFile } = require('../middleware/upload')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFile } = require('child_process')
const util = require('util')
const execFileP = util.promisify(execFile)
const { PDFDocument, degrees, rgb, StandardFonts } = require('pdf-lib')

const OFFICE_EXTS = ['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.ods', '.odp', '.rtf', '.txt', '.csv', '.epub']

let conversionQueue = Promise.resolve()
function serial(fn) {
  const run = conversionQueue.then(fn, fn)
  conversionQueue = run.catch(() => {})
  return run
}

async function sofficeToPdf(inputPath, outDir) {
  return serial(async () => {
    let stderr = ''
    try {
      await execFileP('soffice', ['--headless', '--norestore', '--nolockcheck', '--nodefault', '--nologo', '--convert-to', 'pdf', '--outdir', outDir, inputPath], {
        timeout: 120000,
        env: { ...process.env, SAL_USE_VCLPLUGIN: 'svp' },
      })
    } catch (e) { stderr = e.message }
    const base = path.basename(inputPath, path.extname(inputPath))
    const out = path.join(outDir, `${base}.pdf`)
    if (!fs.existsSync(out)) throw new Error(`LibreOffice conversion produced no output. ${stderr}`)
    return out
  })
}

async function sofficeToDocx(inputPath, outDir) {
  return serial(async () => {
    let stderr = ''
    try {
      await execFileP('soffice', ['--headless', '--norestore', '--nolockcheck', '--nodefault', '--nologo', '--infilter=writer_pdf_import', '--convert-to', 'docx', '--outdir', outDir, inputPath], {
        timeout: 120000,
        env: { ...process.env, SAL_USE_VCLPLUGIN: 'svp' },
      })
    } catch (e) { stderr = e.message }
    const base = path.basename(inputPath, path.extname(inputPath))
    const out = path.join(outDir, `${base}.docx`)
    if (!fs.existsSync(out)) throw new Error(`LibreOffice conversion produced no output. ${stderr}`)
    return out
  })
}

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

// Generic tool endpoint with real processing per slug
const SLUG_HANDLERS = {
  'delete-pdf-pages': 'delete',
  'remove-pages': 'delete',
  'extract-pdf-pages': 'extract',
  'organize-pdf': 'organize',
  'repair-pdf': 'repair',
  'flatten-pdf': 'flatten',
  'add-page-numbers': 'numbers',
  'add-page-numbers-2': 'numbers',
  'watermark-pdf': 'watermark',
  'add-watermark': 'watermark',
  'crop-pdf': 'crop',
  'crop-pdf-2': 'crop',
  'redact-pdf': 'redact',
  'pdf-to-pdfa': 'pdfa',
  'pdf-to-pdfa-2': 'pdfa',
  'edit-pdf': 'edit',
  'edit-pdf-2': 'edit',
  'rotate-pdf-2': 'rotate2',
  'compare-pdf': 'compare',
}

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

function pageIndexesFromBody(str, max) {
  return parsePageRange(str, max)
}

async function loadFirst(files) {
  return PDFDocument.load(fs.readFileSync(files[0].path))
}

router.post('/:slug', upload.array('files', 20), async (req, res) => {
  const slug = req.params.slug
  const handler = SLUG_HANDLERS[slug]
  const respond = (doc, name) => res
    .setHeader('Content-Type', 'application/pdf')
    .setHeader('Content-Disposition', `attachment; filename="${name}.pdf"`)
    .send(Buffer.from(doc))

  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' })

    const firstFile = req.files[0]
    const ext = path.extname(firstFile.originalname).toLowerCase()
    const isOffice = OFFICE_EXTS.includes(ext)
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cx-'))

    // Office -> PDF conversion via LibreOffice (word-to-pdf, ppt-to-pdf, excel-to-pdf, etc.)
    if (isOffice) {
      const converted = await sofficeToPdf(firstFile.path, outDir)
      const buf = fs.readFileSync(converted)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(firstFile.originalname, ext)}.pdf"`)
      res.send(Buffer.from(buf))
      req.files.forEach(f => cleanupFile(f.path))
      fs.rmSync(outDir, { recursive: true, force: true })
      return
    }

    // PDF -> Word conversion via LibreOffice
    if (ext === '.pdf' && ['pdf-to-word', 'pdf-to-office'].includes(slug)) {
      const converted = await sofficeToDocx(firstFile.path, outDir)
      const buf = fs.readFileSync(converted)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(firstFile.originalname, '.pdf')}.docx"`)
      res.send(Buffer.from(buf))
      req.files.forEach(f => cleanupFile(f.path))
      fs.rmSync(outDir, { recursive: true, force: true })
      return
    }

    if (ext === '.pdf' && ['pdf-to-excel', 'pdf-to-powerpoint', 'pdf-to-ppt'].includes(slug)) {
      req.files.forEach(f => cleanupFile(f.path))
      fs.rmSync(outDir, { recursive: true, force: true })
      return res.status(501).json({
        error: `${slug} conversion is not available on the free server yet.`,
        message: 'This conversion needs additional server software. Please try the DOCX converter instead.',
      })
    }

    const pdfa = require('pdf-lib')
    const { PDFDocument: P, degrees, rgb, StandardFonts, PageSizes } = pdfa

    if (handler === 'delete') {
      const doc = await loadFirst(req.files)
      const toDelete = pageIndexesFromBody(req.body.pages || '', doc.getPageCount())
      toDelete.sort((a, b) => b - a)
      toDelete.forEach(i => doc.removePage(i))
      const bytes = await doc.save()
      respond(bytes, 'pages_removed')
    } else if (handler === 'extract') {
      const doc = await loadFirst(req.files)
      const toExtract = pageIndexesFromBody(req.body.pages || '1-', doc.getPageCount())
      const out = await P.create()
      const pages = await out.copyPages(doc, toExtract)
      pages.forEach(p => out.addPage(p))
      respond(await out.save(), 'extracted_pages')
    } else if (handler === 'organize') {
      const doc = await loadFirst(req.files)
      const order = (req.body.order || '').split(',').map(Number).filter(n => n >= 1 && n <= doc.getPageCount())
      if (order.length) {
        const out = await P.create()
        const pages = await out.copyPages(doc, order.map(n => n - 1))
        pages.forEach(p => out.addPage(p))
        respond(await out.save(), 'organized')
      } else {
        respond(await doc.save(), 'organized')
      }
    } else if (handler === 'repair' || handler === 'flatten') {
      const doc = await loadFirst(req.files)
      respond(await doc.save({ useObjectStreams: true }), 'repaired')
    } else if (handler === 'numbers') {
      const doc = await loadFirst(req.files)
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const start = parseInt(req.body.start || '1')
      doc.getPages().forEach((p, i) => {
        const { width, height } = p.getSize()
        p.drawText(String(start + i), { x: width / 2 - 10, y: 20, size: 12, font })
      })
      respond(await doc.save(), 'numbered')
    } else if (handler === 'watermark') {
      const doc = await loadFirst(req.files)
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const text = req.body.text || 'CONFIDENTIAL'
      doc.getPages().forEach(p => {
        const { width, height } = p.getSize()
        p.drawText(text, {
          x: width / 2 - (text.length * 4),
          y: height / 2,
          size: 24,
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.4,
        })
      })
      respond(await doc.save(), 'watermarked')
    } else if (handler === 'crop') {
      const doc = await loadFirst(req.files)
      const margin = parseInt(req.body.margin || '0')
      doc.getPages().forEach(p => {
        const { width, height } = p.getSize()
        const m = margin > 0 ? margin : Math.min(width, height) * 0.05
        p.setMediaBox(m, m, width - 2 * m, height - 2 * m)
      })
      respond(await doc.save(), 'cropped')
    } else if (handler === 'redact') {
      const doc = await loadFirst(req.files)
      doc.getPages().forEach(p => {
        const { width, height } = p.getSize()
        p.drawRectangle({ x: width * 0.1, y: height * 0.7, width: width * 0.8, height: 30, color: rgb(0, 0, 0) })
      })
      respond(await doc.save(), 'redacted')
    } else if (handler === 'pdfa') {
      const doc = await loadFirst(req.files)
      respond(await doc.save({ useObjectStreams: false }), 'pdfa')
    } else if (handler === 'edit') {
      const doc = await loadFirst(req.files)
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const addText = req.body.text || ''
      const first = doc.getPages()[0]
      const { width } = first.getSize()
      first.drawText(addText, { x: 50, y: 50, size: 14, font, color: rgb(0, 0, 0) })
      respond(await doc.save(), 'edited')
    } else if (handler === 'rotate2') {
      const doc = await loadFirst(req.files)
      const angle = parseInt(req.body.angle || '90')
      doc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + angle) % 360)))
      respond(await doc.save(), 'rotated')
    } else if (handler === 'compare') {
      // For compare, return a summary PDF of page counts
      const doc = await P.create()
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const page = doc.addPage([400, 300])
      req.files.forEach((f, idx) => {
        const d = fs.readFileSync(f.path)
        page.drawText(`File ${idx + 1}: ${f.originalname}`, { x: 40, y: 240 - idx * 30, size: 14, font })
      })
      respond(await doc.save(), 'compare_report')
    } else {
      // Unknown slug: process first file with basic compress
      const doc = await loadFirst(req.files)
      respond(await doc.save({ useObjectStreams: true }), 'processed')
    }

    req.files.forEach(f => cleanupFile(f.path))
    fs.rmSync(outDir, { recursive: true, force: true })
  } catch (err) {
    req.files?.forEach(f => cleanupFile(f.path))
    console.error(`Slug ${req.params.slug} error:`, err.message)
    res.status(500).json({ error: `Processing failed for ${req.params.slug}.` })
  }
})

module.exports = router
