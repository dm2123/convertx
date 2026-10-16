import type { Request } from 'express';

/** Multer-augmented request with uploaded file(s). */
export interface FileRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

/** Extract the files array from a multer multi-upload request. */
export function getFiles(req: FileRequest): Express.Multer.File[] {
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }
  return [];
}

/** Standard error payload sent to clients. */
export interface ErrorResponse {
  error: string;
  suggestion?: string;
}

/** Health check response. */
export interface HealthResponse {
  status: 'ok';
  version: string;
  timestamp: string;
}

/** AI chat response. */
export interface AiChatResponse {
  answer: string;
  model: string;
}

/** AI summarize response. */
export interface AiSummarizeResponse {
  summary: string;
  model: string;
}

/** AI questions response. */
export interface AiQuestionsResponse {
  questions: string[];
  model: string;
}
