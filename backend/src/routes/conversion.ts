import { Router } from 'express';
import { upload, cleanupFile } from '../middleware/upload';
import type { FileRequest } from '../types';
import { getFiles } from '../types';
import { officeToPdf, makeWorkDir, removeWorkDir } from '../utils/office';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * Generic conversion endpoint.
 * Office documents are converted via LibreOffice when available.
 * Anything else returns 501 with an honest explanation.
 */
router.post('/:slug', upload.single('file'), async (req: FileRequest, res) => {
  const workDir = makeWorkDir();
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const slug = req.params.slug;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Office -> PDF via LibreOffice
    const officeExts = ['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.ods', '.odp', '.rtf', '.txt', '.csv', '.epub'];
    if (officeExts.includes(ext)) {
      try {
        const converted = await officeToPdf(req.file.path, workDir);
        const buf = fs.readFileSync(converted);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${path.basename(req.file.originalname, ext)}.pdf"`,
        );
        res.send(buf);
      } catch (err) {
        res.status(501).json({
          error: 'Server-side conversion is not available.',
          suggestion: `Install LibreOffice on the server to convert ${ext} files.`,
        });
      }
      cleanupFile(req.file.path);
      removeWorkDir(workDir);
      return;
    }

    // If input is already PDF, return it unchanged
    if (ext === '.pdf') {
      const data = fs.readFileSync(req.file.path);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
      res.send(Buffer.from(data));
      cleanupFile(req.file.path);
      removeWorkDir(workDir);
      return;
    }

    cleanupFile(req.file.path);
    removeWorkDir(workDir);
    res.status(501).json({
      error: `Conversion of ${ext} files is not supported by this endpoint.`,
      suggestion: 'Try one of the dedicated conversion tools instead.',
    });
  } catch {
    cleanupFile(req.file?.path);
    removeWorkDir(workDir);
    res.status(500).json({ error: 'Conversion failed.' });
  }
});

export default router;
