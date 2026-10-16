import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToolResult } from '../types';
import { processToolFiles, ApiClientError } from '../services/api';

/**
 * Shared processing lifecycle for file-based tools.
 * Gives every tool the same UX contract:
 * idle → processing (with progress) → success (downloadable result) | error (message).
 */
export function useToolProcessor(slug: string) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => () => {
    cancelled.current = true;
  }, []);

  const process = useCallback(
    async (fields: Record<string, string> = {}, fileName: string, minFiles = 1) => {
      if (files.length < minFiles) {
        setError(
          minFiles > 1
            ? `Please select at least ${minFiles} files.`
            : 'Please select a file first.',
        );
        return;
      }
      setProcessing(true);
      setError(null);
      setProgress(0);
      setStatus('Uploading…');

      try {
        const blob = await processToolFiles(slug, files, fields, (pct) => {
          if (cancelled.current) return;
          setProgress(pct);
          setStatus(pct < 50 ? 'Uploading…' : pct < 90 ? 'Processing…' : 'Finalizing…');
        });
        if (cancelled.current) return;
        const url = URL.createObjectURL(blob);
        setProgress(100);
        setStatus('Done');
        setResult({ url, fileName, size: blob.size });
      } catch (err) {
        if (cancelled.current) return;
        const msg =
          err instanceof ApiClientError
            ? err.message
            : 'Something went wrong. Please try again.';
        setError(msg);
      } finally {
        if (!cancelled.current) setProcessing(false);
      }
    },
    [files, slug],
  );

  const reset = useCallback(() => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus('');
  }, []);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [result]);

  return { files, setFiles, processing, progress, status, result, error, setError, process, reset, download };
}

/** Update document.title per page (SEO + tab label). */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
