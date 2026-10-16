/** Download a Blob as a file. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Download a data-URL (e.g. generated QR / canvas) as a file. */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Human-readable file size, e.g. 1.4 MB. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const v = bytes / Math.pow(1024, i);
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

/** Check a file's extension against an allow-list. */
export function hasAllowedExtension(fileName: string, allowed: string[]): boolean {
  const lower = fileName.toLowerCase();
  return allowed.some((ext) => lower.endsWith(ext.toLowerCase()));
}

/** Read a File as ArrayBuffer. */
export function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

/** Parse "1-3,5" style page ranges into 0-based indices. */
export function parsePageRange(input: string, pageCount: number): number[] {
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
  return [...out].sort((x, y) => x - y);
}
