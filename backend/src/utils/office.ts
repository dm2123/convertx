import { execFile } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileP = util.promisify(execFile);

/**
 * Serializes LibreOffice conversions — soffice is not safe to run
 * concurrently against the same profile directory.
 */
let conversionQueue: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = conversionQueue.then(fn, fn);
  conversionQueue = run.catch(() => undefined);
  return run;
}

/** Office document extensions convertible to PDF via LibreOffice. */
export const OFFICE_EXTS = new Set([
  '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
  '.odt', '.ods', '.odp', '.rtf', '.txt', '.csv', '.epub',
]);

export function isOfficeFile(fileName: string): boolean {
  return OFFICE_EXTS.has(path.extname(fileName).toLowerCase());
}

async function runSoffice(args: string[], inputPath: string, outDir: string): Promise<void> {
  let stderr = '';
  try {
    await execFileP('soffice', ['--headless', '--norestore', '--nolockcheck', '--nodefault', '--nologo', ...args, '--outdir', outDir, inputPath], {
      timeout: 120_000,
      env: { ...process.env, SAL_USE_VCLPLUGIN: 'svp' },
    });
  } catch (e) {
    stderr = (e as Error).message;
    throw new Error(`LibreOffice conversion failed. ${stderr}`);
  }
}

/** Convert an office document to PDF. Returns the output file path. */
export async function officeToPdf(inputPath: string, outDir: string): Promise<string> {
  return serial(async () => {
    await runSoffice(['--convert-to', 'pdf'], inputPath, outDir);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out = path.join(outDir, `${base}.pdf`);
    if (!fs.existsSync(out)) throw new Error('LibreOffice produced no PDF output.');
    return out;
  });
}

/** Convert a PDF to DOCX. Returns the output file path. */
export async function pdfToDocx(inputPath: string, outDir: string): Promise<string> {
  return serial(async () => {
    await runSoffice(['--infilter=writer_pdf_import', '--convert-to', 'docx'], inputPath, outDir);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out = path.join(outDir, `${base}.docx`);
    if (!fs.existsSync(out)) throw new Error('LibreOffice produced no DOCX output.');
    return out;
  });
}

/** Convert a PDF to PPTX. Returns the output file path. */
export async function pdfToPptx(inputPath: string, outDir: string): Promise<string> {
  return serial(async () => {
    await runSoffice(['--convert-to', 'pptx'], inputPath, outDir);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out = path.join(outDir, `${base}.pptx`);
    if (!fs.existsSync(out)) throw new Error('LibreOffice produced no PPTX output.');
    return out;
  });
}

/** Convert a PDF to XLSX. Returns the output file path. */
export async function pdfToXlsx(inputPath: string, outDir: string): Promise<string> {
  return serial(async () => {
    await runSoffice(['--convert-to', 'xlsx'], inputPath, outDir);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out = path.join(outDir, `${base}.xlsx`);
    if (!fs.existsSync(out)) throw new Error('LibreOffice produced no XLSX output.');
    return out;
  });
}

/** Create a temp working directory for a conversion. */
export function makeWorkDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cx-'));
}

/** Remove a temp working directory. Never throws. */
export function removeWorkDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
