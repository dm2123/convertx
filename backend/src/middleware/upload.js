const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

const tempDir = path.join(__dirname, '../../temp')
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '')
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.rtf', '.html', '.htm', '.csv', '.odt', '.ods', '.odp',
    '.epub', '.zip', '.svg', '.webp',
  ]
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`File type "${ext}" is not supported.`))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
  },
})

// Cleanup helper
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (e) {
    console.error('Cleanup error:', e.message)
  }
}

// Cleanup old temp files (older than 1 hour)
function cleanupTempFiles() {
  const oneHour = 60 * 60 * 1000
  try {
    const files = fs.readdirSync(tempDir)
    for (const file of files) {
      const filePath = path.join(tempDir, file)
      const stat = fs.statSync(filePath)
      if (Date.now() - stat.mtimeMs > oneHour) {
        fs.unlinkSync(filePath)
      }
    }
  } catch (e) {
    // ignore
  }
}

setInterval(cleanupTempFiles, 30 * 60 * 1000)

module.exports = { upload, cleanupFile, tempDir }
