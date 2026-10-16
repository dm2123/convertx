import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pdfRoutes from './routes/pdf';
import conversionRoutes from './routes/conversion';
import aiRoutes from './routes/ai';
import { errorHandler, notFound } from './middleware/errorHandler';
import { cleanupTempFiles } from './middleware/upload';
import type { HealthResponse } from './types';

const app = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);
const FRONTEND_URLS = (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? 'http://localhost:5173')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

// --- middleware -----------------------------------------------------------
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || FRONTEND_URLS.includes(origin)) cb(null, true);
      else cb(null, false);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
});
app.use('/api/', limiter);

// --- routes ---------------------------------------------------------------
app.use('/api/pdf', pdfRoutes);
app.use('/api/convert', conversionRoutes);
app.use('/api/ai', aiRoutes);
// Backwards-compatible alias used by the frontend
app.use('/api/tools', pdfRoutes);

app.get('/api/health', (_req, res) => {
  const body: HealthResponse = {
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  };
  res.json(body);
});

// --- error handling (must be last) ----------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- housekeeping ----------------------------------------------------------
setInterval(cleanupTempFiles, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`ConvertX API running on port ${PORT}`);
  console.log(`Frontend URLs: ${FRONTEND_URLS.join(', ')}`);
});
