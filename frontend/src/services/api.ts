import type { ApiError } from '../types';

/**
 * Typed API client for the ConvertX backend.
 * Every request goes through here so error handling stays consistent:
 * network failures, non-JSON errors and backend { error } payloads
 * all surface as a single Error with a human-readable message.
 */

const API_BASE: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ApiError;
    if (data?.error) return data.suggestion ? `${data.error} ${data.suggestion}` : data.error;
  } catch {
    /* not JSON — fall through */
  }
  return `Request failed (HTTP ${res.status}). Please try again.`;
}

/** POST files to a tool endpoint, receive the processed file as a Blob. */
export async function processToolFiles(
  slug: string,
  files: File[],
  fields: Record<string, string> = {},
  onProgress?: (pct: number) => void,
): Promise<Blob> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));

  onProgress?.(10);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/tools/${slug}`, { method: 'POST', body: form });
  } catch {
    throw new ApiClientError('Could not reach the server. Check your connection and try again.');
  }
  onProgress?.(90);

  if (!res.ok) throw new ApiClientError(await parseError(res), res.status);
  onProgress?.(100);
  return res.blob();
}

/** POST JSON to an AI endpoint. */
export async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError('Could not reach the server. Check your connection and try again.');
  }
  if (!res.ok) throw new ApiClientError(await parseError(res), res.status);
  return (await res.json()) as T;
}

/** Health check used by the footer/status indicator. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}
