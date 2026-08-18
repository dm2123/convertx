const express = require('express')
const router = express.Router()
const { upload, cleanupFile } = require('../middleware/upload')
const fs = require('fs')

// Generic conversion endpoint
router.post('/:slug', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })

    const slug = req.params.slug
    console.log(`Conversion requested: ${slug}`)

    // For server-side conversions (WORD to PDF, PPT to PDF, etc.)
    // This requires external libraries like LibreOffice or CloudConvert
    // Return a message indicating server-side processing is needed

    const ext = require('path').extname(req.file.originalname).toLowerCase()

    // If input is already PDF, just return it
    if (ext === '.pdf') {
      const data = fs.readFileSync(req.file.path)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="converted.pdf"`)
      res.send(Buffer.from(data))
      cleanupFile(req.file.path)
      return
    }

    // For non-PDF inputs, indicate server-side processing needed
    res.status(501).json({
      error: 'Server-side conversion for this format is not yet available.',
      message: `To convert ${ext} files, please install LibreOffice on the server.`,
      slug,
      suggestion: 'This conversion requires server-side processing. Consider using LibreOffice or a cloud conversion service.',
    })

    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Conversion failed.' })
  }
})

// PPT to PDF specific endpoint
router.post('/ppt-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PowerPoint file uploaded.' })

    console.log('PPT to PDF conversion requested')

    // This requires LibreOffice or similar tool for real conversion
    res.status(501).json({
      error: 'PPT to PDF conversion requires server-side processing.',
      message: 'Install LibreOffice on the server: sudo apt-get install libreoffice',
      setup: 'See README.md for server setup instructions.',
    })

    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Conversion failed.' })
  }
})

module.exports = router
