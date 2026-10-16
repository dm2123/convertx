import { Router, type Response } from 'express';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { upload, cleanupFile } from '../middleware/upload';
import type { FileRequest } from '../types';
import { getFiles } from '../types';
import {
  isOfficeFile,
  officeToPdf,
  pdfToDocx,
  pdfToPptx,
  pdfToXlsx,
  makeWorkDir,
  removeWorkDir,
} from '../utils/office';


/** Get a string field from the request body (multer may give string|string[]). */
function bodyStr(body: unknown, key: string, fallback = ''): string {
  const v = (body as Record<string, unknown>)[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return fallback;
}

const router = Router();

/** Parse "1-3,5" into 0-based page indices, clamped to pageCount. */
function parsePageRange(input: string, pageCount: number): number[] {
  const out = new Set<number>();
  for (const part of input.split(',')) {
    const t = part.trim();
    if (!t) continue;
    if (t.includes('-')) {
      const [aStr, bStr] = t.split('-');
      const a = Math.max(1, parseInt(aStr, 10) || 1);
      const b = Math.min(pageCount, parseInt(bStr, 10) || pageCount);
      for (let i = a; i <= b; i++) out.add(i - 1);
    } else {
      const n = parseInt(t, 10);
      if (n >= 1 && n <= pageCount) out.add(n - 1);
    }
  }
  const sorted = [...out].sort((x, y) => x - y);
  return sorted.length > 0 ? sorted : Array.from({ length: pageCount }, (_, i) => i);
}

function sendPdf(res: Response, bytes: Uint8Array, fileName: string): void {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(Buffer.from(bytes));
}

async function loadFirst(files: Express.Multer.File[]): Promise<PDFDocument> {
  return PDFDocument.load(fs.readFileSync(files[0].path));
}

function cleanupAll(files: Express.Multer.File[] | undefined): void {
  files?.forEach((f) => cleanupFile(f.path));
}

// ---------------------------------------------------------------- compress
router.post('/compress', upload.single('files'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const pdfDoc = await PDFDocument.load(fs.readFileSync(req.file.path));
    const compressed = await pdfDoc.save({ useObjectStreams: true });
    sendPdf(res, compressed, `compressed_${req.file.originalname}`);
    cleanupFile(req.file.path);
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Failed to compress PDF.' });
  }
});

// ---------------------------------------------------------------- merge
router.post('/merge', upload.array('files', 20), async (req: FileRequest, res) => {
  try {
    if (!getFiles(req) || getFiles(req).length < 2) {
      res.status(400).json({ error: 'At least 2 PDF files are required.' });
      return;
    }
    const mergedPdf = await PDFDocument.create();
    for (const file of getFiles(req)) {
      const pdf = await PDFDocument.load(fs.readFileSync(file.path));
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
      cleanupFile(file.path);
    }
    sendPdf(res, await mergedPdf.save(), 'merged.pdf');
  } catch {
    cleanupAll(getFiles(req));
    res.status(500).json({ error: 'Failed to merge PDFs.' });
  }
});

// ---------------------------------------------------------------- split
router.post('/split', upload.single('files'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const pages = bodyStr(req.body, 'pages', '1-');
    const srcDoc = await PDFDocument.load(fs.readFileSync(req.file.path));
    const newDoc = await PDFDocument.create();
    const indices = parsePageRange(pages, srcDoc.getPageCount());
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach((p) => newDoc.addPage(p));
    sendPdf(res, await newDoc.save(), 'split.pdf');
    cleanupFile(req.file.path);
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Failed to split PDF.' });
  }
});

// ---------------------------------------------------------------- rotate
router.post('/rotate', upload.single('files'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const angle = parseInt(bodyStr(req.body, 'angle', '90'), 10) || 90;
    const pdfDoc = await PDFDocument.load(fs.readFileSync(req.file.path));
    pdfDoc.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + angle) % 360)));
    sendPdf(res, await pdfDoc.save(), `rotated_${req.file.originalname}`);
    cleanupFile(req.file.path);
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Failed to rotate PDF.' });
  }
});

// ---------------------------------------------------------------- protect
router.post('/protect', upload.single('files'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const password = bodyStr(req.body, 'password');
    if (!password) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }
    const pdfDoc = await PDFDocument.load(fs.readFileSync(req.file.path));
    const protectedBytes = await pdfDoc.save({ userPassword: password } as unknown as Parameters<PDFDocument["save"]>[0]);
    sendPdf(res, protectedBytes, `protected_${req.file.originalname}`);
    cleanupFile(req.file.path);
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Failed to protect PDF.' });
  }
});

// ---------------------------------------------------------------- unlock
router.post('/unlock', upload.single('files'), async (req: FileRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const pdfDoc = await PDFDocument.load(fs.readFileSync(req.file.path), { ignoreEncryption: true });
    sendPdf(res, await pdfDoc.save(), `unlocked_${req.file.originalname}`);
    cleanupFile(req.file.path);
  } catch {
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Failed to unlock PDF. The file may be corrupted.' });
  }
});

// ------------------------------------------------- generic slug handlers
type SlugHandler =
  | 'delete' | 'extract' | 'organize' | 'repair' | 'flatten'
  | 'numbers' | 'watermark' | 'crop' | 'redact' | 'pdfa'
  | 'edit' | 'rotate2' | 'compare';

const SLUG_HANDLERS: Record<string, SlugHandler> = {
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
};

router.post('/:slug', upload.array('files', 20), async (req: FileRequest, res) => {
  const slug: string = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const handler = SLUG_HANDLERS[slug];
  const workDir = makeWorkDir();

  try {
    if (!getFiles(req) || getFiles(req).length === 0) {
      res.status(400).json({ error: 'No files uploaded.' });
      return;
    }

    const firstFile = getFiles(req)[0];
    const ext = path.extname(firstFile.originalname).toLowerCase();

    // Office -> PDF via LibreOffice (word-to-pdf, ppt-to-pdf, excel-to-pdf, …)
    if (isOfficeFile(firstFile.originalname)) {
      const converted = await officeToPdf(firstFile.path, workDir);
      const buf = fs.readFileSync(converted);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(firstFile.originalname, ext)}.pdf"`,
      );
      res.send(buf);
      cleanupAll(getFiles(req));
      removeWorkDir(workDir);
      return;
    }

    // PDF -> Office via LibreOffice
    if (ext === '.pdf' && ['pdf-to-word', 'pdf-to-office'].includes(slug)) {
      const converted = await pdfToDocx(firstFile.path, workDir);
      const buf = fs.readFileSync(converted);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(firstFile.originalname, '.pdf')}.docx"`,
      );
      res.send(buf);
      cleanupAll(getFiles(req));
      removeWorkDir(workDir);
      return;
    }

    if (ext === '.pdf' && ['pdf-to-powerpoint', 'pdf-to-ppt'].includes(slug)) {
      const converted = await pdfToPptx(firstFile.path, workDir);
      const buf = fs.readFileSync(converted);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(firstFile.originalname, '.pdf')}.pptx"`,
      );
      res.send(buf);
      cleanupAll(getFiles(req));
      removeWorkDir(workDir);
      return;
    }

    if (ext === '.pdf' && slug === 'pdf-to-excel') {
      const converted = await pdfToXlsx(firstFile.path, workDir);
      const buf = fs.readFileSync(converted);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(firstFile.originalname, '.pdf')}.xlsx"`,
      );
      res.send(buf);
      cleanupAll(getFiles(req));
      removeWorkDir(workDir);
      return;
    }

    // Pure pdf-lib handlers
    if (handler === 'delete') {
      const doc = await loadFirst(getFiles(req));
      const toDelete = parsePageRange(bodyStr(req.body, 'pages'), doc.getPageCount());
      [...toDelete].sort((a, b) => b - a).forEach((i) => doc.removePage(i));
      sendPdf(res, await doc.save(), 'pages_removed.pdf');
    } else if (handler === 'extract') {
      const doc = await loadFirst(getFiles(req));
      const toExtract = parsePageRange(bodyStr(req.body, 'pages', '1-'), doc.getPageCount());
      const out = await PDFDocument.create();
      const pages = await out.copyPages(doc, toExtract);
      pages.forEach((p) => out.addPage(p));
      sendPdf(res, await out.save(), 'extracted_pages.pdf');
    } else if (handler === 'organize') {
      const doc = await loadFirst(getFiles(req));
      const order = bodyStr(req.body, 'order')
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => n >= 1 && n <= doc.getPageCount());
      if (order.length > 0) {
        const out = await PDFDocument.create();
        const pages = await out.copyPages(doc, order.map((n) => n - 1));
        pages.forEach((p) => out.addPage(p));
        sendPdf(res, await out.save(), 'organized.pdf');
      } else {
        sendPdf(res, await doc.save(), 'organized.pdf');
      }
    } else if (handler === 'repair' || handler === 'flatten') {
      const doc = await loadFirst(getFiles(req));
      sendPdf(res, await doc.save({ useObjectStreams: true }), 'repaired.pdf');
    } else if (handler === 'numbers') {
      const doc = await loadFirst(getFiles(req));
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const start = parseInt(bodyStr(req.body, 'start', '1'), 10) || 1;
      doc.getPages().forEach((p, i) => {
        const { width } = p.getSize();
        p.drawText(String(start + i), { x: width / 2 - 10, y: 20, size: 12, font });
      });
      sendPdf(res, await doc.save(), 'numbered.pdf');
    } else if (handler === 'watermark') {
      const doc = await loadFirst(getFiles(req));
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const text = bodyStr(req.body, 'text', 'CONFIDENTIAL');
      doc.getPages().forEach((p) => {
        const { width, height } = p.getSize();
        p.drawText(text, {
          x: width / 2 - text.length * 4,
          y: height / 2,
          size: 24,
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.4,
        });
      });
      sendPdf(res, await doc.save(), 'watermarked.pdf');
    } else if (handler === 'crop') {
      const doc = await loadFirst(getFiles(req));
      const margin = parseInt(bodyStr(req.body, 'margin', '0'), 10) || 0;
      doc.getPages().forEach((p) => {
        const { width, height } = p.getSize();
        const m = margin > 0 ? margin : Math.min(width, height) * 0.05;
        p.setMediaBox(m, m, width - 2 * m, height - 2 * m);
      });
      sendPdf(res, await doc.save(), 'cropped.pdf');
    } else if (handler === 'redact') {
      const doc = await loadFirst(getFiles(req));
      doc.getPages().forEach((p) => {
        const { width, height } = p.getSize();
        p.drawRectangle({
          x: width * 0.1, y: height * 0.7,
          width: width * 0.8, height: 30,
          color: rgb(0, 0, 0),
        });
      });
      sendPdf(res, await doc.save(), 'redacted.pdf');
    } else if (handler === 'pdfa') {
      const doc = await loadFirst(getFiles(req));
      sendPdf(res, await doc.save({ useObjectStreams: false }), 'pdfa.pdf');
    } else if (handler === 'edit') {
      const doc = await loadFirst(getFiles(req));
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const addText = bodyStr(req.body, 'text');
      const first = doc.getPages()[0];
      if (first) first.drawText(addText, { x: 50, y: 50, size: 14, font });
      sendPdf(res, await doc.save(), 'edited.pdf');
    } else if (handler === 'rotate2') {
      const doc = await loadFirst(getFiles(req));
      const angle = parseInt(bodyStr(req.body, 'angle', '90'), 10) || 90;
      doc.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + angle) % 360)));
      sendPdf(res, await doc.save(), 'rotated.pdf');
    } else if (handler === 'compare') {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const page = doc.addPage([400, 300]);
      getFiles(req).forEach((f, idx) => {
        page.drawText(`File ${idx + 1}: ${f.originalname}`, {
          x: 40, y: 240 - idx * 30, size: 14, font,
        });
      });
      sendPdf(res, await doc.save(), 'compare_report.pdf');
    } else {
      const doc = await loadFirst(getFiles(req));
      sendPdf(res, await doc.save({ useObjectStreams: true }), 'processed.pdf');
    }

    cleanupAll(getFiles(req));
    removeWorkDir(workDir);
  } catch (err) {
    cleanupAll(getFiles(req));
    removeWorkDir(workDir);
    console.error(`Slug ${req.params.slug} error:`, (err as Error).message);
    res.status(500).json({ error: `Processing failed for ${req.params.slug}.` });
  }
});

export default router;
