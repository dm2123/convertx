import type { Request, Response, NextFunction } from 'express';

/**
 * Central error handler — must be registered last.
 * Converts multer/upload errors into clean client-facing messages.
 */
export function errorHandler(
  err: Error & { code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('Error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'File too large. Maximum size is 50 MB.' });
    return;
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({ error: 'Too many files. Please upload fewer files.' });
    return;
  }
  if (err.message.includes('not supported')) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error. Please try again.' });
}

/** 404 for unknown API routes. */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'API endpoint not found.' });
}
