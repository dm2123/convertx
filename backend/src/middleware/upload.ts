import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';

const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.rtf', '.html', '.htm', '.csv',
  '.odt', '.ods', '.odp', '.epub', '.zip',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${ext}" is not supported.`));
  }
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? '', 10) || 50 * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/** Best-effort deletion of a temp file. Never throws. */
export function cleanupFile(filePath: string | undefined): void {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Cleanup error:', (err as Error).message);
  }
}

/** Remove temp files older than one hour. */
export function cleanupTempFiles(): void {
  const oneHour = 60 * 60 * 1000;
  try {
    for (const file of fs.readdirSync(tempDir)) {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      if (Date.now() - stat.mtimeMs > oneHour) {
        fs.unlinkSync(filePath);
      }
    }
  } catch {
    /* temp dir may not exist yet — ignore */
  }
}

export { tempDir };
