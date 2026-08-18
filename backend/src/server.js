require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const pdfRoutes = require('./routes/pdf')
const conversionRoutes = require('./routes/conversion')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))

app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
})
app.use('/api/', limiter)

// Routes
app.use('/api/pdf', pdfRoutes)
app.use('/api/convert', conversionRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/tools', pdfRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 50MB.' })
  }
  if (err.message.includes('Multer')) {
    return res.status(400).json({ error: 'File upload error.' })
  }
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(PORT, () => {
  console.log(`ConvertX API running on port ${PORT}`)
  console.log(`Frontend URL: ${FRONTEND_URL}`)
})
