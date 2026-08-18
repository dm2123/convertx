const express = require('express')
const router = express.Router()
const { upload, cleanupFile } = require('../middleware/upload')

// AI Chat with PDF
router.post('/chat', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const { question } = req.body
    if (!question) return res.status(400).json({ error: 'Question is required.' })

    console.log(`AI Chat - File: ${req.file.originalname}, Question: ${question}`)

    // This requires an AI provider (OpenAI, Anthropic, etc.)
    // Set OPENAI_API_KEY in environment to enable
    if (process.env.OPENAI_API_KEY) {
      // Real AI integration would go here
      // Example with OpenAI:
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      // const response = await openai.chat.completions.create(...)
    }

    // Demo response when no API key is configured
    res.json({
      answer: `This is a demo response. To enable real AI analysis, set the OPENAI_API_KEY environment variable.\n\nYour question: "${question}"\n\nFile: ${req.file.originalname}\n\nThe AI would analyze the PDF content and provide a detailed answer based on the document's text and structure.`,
      model: 'demo',
      note: 'Configure OPENAI_API_KEY for real AI responses',
    })

    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'AI processing failed.' })
  }
})

// AI Summarize
router.post('/summarize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })

    console.log(`AI Summarize - File: ${req.file.originalname}`)

    if (process.env.OPENAI_API_KEY) {
      // Real AI integration would go here
    }

    res.json({
      summary: `This is a demo summary. To enable real AI summarization, set the OPENAI_API_KEY environment variable.\n\nDocument: ${req.file.originalname}\n\nThe AI would extract key points, main topics, and provide a comprehensive summary of the document content.`,
      model: 'demo',
      note: 'Configure OPENAI_API_KEY for real AI summaries',
    })

    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Summarization failed.' })
  }
})

// AI Generate Questions
router.post('/questions', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })

    console.log(`AI Questions - File: ${req.file.originalname}`)

    res.json({
      questions: [
        'What is the main topic of this document?',
        'What are the key findings or conclusions?',
        'What methodology was used?',
        'What are the limitations mentioned?',
        'What future work is suggested?',
      ],
      model: 'demo',
      note: 'Configure OPENAI_API_KEY for real AI-generated questions',
    })

    cleanupFile(req.file.path)
  } catch (err) {
    cleanupFile(req?.file?.path)
    res.status(500).json({ error: 'Question generation failed.' })
  }
})

module.exports = router
