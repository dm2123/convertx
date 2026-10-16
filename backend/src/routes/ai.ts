import { Router, type Response } from 'express';
import { upload, cleanupFile } from '../middleware/upload';
import type { FileRequest } from '../types';
import { getFiles } from '../types';

const router = Router();

/**
 * AI endpoints. These require an AI provider API key (OPENAI_API_KEY).
 * When the key is missing we return 503 with a clear message —
 * never a fake "demo" answer.
 */
function aiUnavailable(res: Response): void {
  res.status(503).json({
    error: 'AI service is not configured on this server.',
    suggestion: 'Set the OPENAI_API_KEY environment variable to enable AI features.',
  });
}

// AI Chat with PDF
router.post('/chat', upload.single('file'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const question = String(req.body.question ?? '').trim();
    if (!question) {
      res.status(400).json({ error: 'Question is required.' });
      cleanupFile(req.file.path);
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      cleanupFile(req.file.path);
      aiUnavailable(res);
      return;
    }

    // TODO: integrate OpenAI chat completions with extracted PDF text.
    cleanupFile(req.file.path);
    res.status(501).json({ error: 'AI chat integration is not implemented yet.' });
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'AI processing failed.' });
  }
});

// AI Summarize
router.post('/summarize', upload.single('file'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      cleanupFile(req.file.path);
      aiUnavailable(res);
      return;
    }

    cleanupFile(req.file.path);
    res.status(501).json({ error: 'AI summarization integration is not implemented yet.' });
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Summarization failed.' });
  }
});

// AI Generate Questions
router.post('/questions', upload.single('file'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      cleanupFile(req.file.path);
      aiUnavailable(res);
      return;
    }

    cleanupFile(req.file.path);
    res.status(501).json({ error: 'AI question generation is not implemented yet.' });
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Question generation failed.' });
  }
});

export default router;
