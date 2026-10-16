/**
 * Core domain types for ConvertX.
 * Every tool, page and API interaction is typed through these interfaces —
 * no `any` leaks past this boundary.
 */

/** Tool categories shown in the UI filter. */
export type ToolCategory = 'PDF' | 'Convert' | 'Edit' | 'Security' | 'AI' | 'Utilities';

/** A single tool entry in the registry. */
export interface Tool {
  id: number;
  name: string;
  /** URL-safe identifier, used in /tools/:slug routes. */
  slug: string;
  category: ToolCategory;
  /** One-line description shown on cards. */
  description: string;
  /** Lucide icon name key. */
  icon: string;
  /** False when the tool page is a "coming soon" placeholder. */
  implemented: boolean;
  /** Accepted file extensions, e.g. ['.pdf']. */
  formats?: string[];
  /** True when the tool runs 100% in the browser (no backend call). */
  clientSide?: boolean;
  /** Points at the canonical tool id when this entry is an alias/duplicate. */
  duplicateOf?: number;
}

/** Result of a file-processing operation, ready for download. */
export interface ToolResult {
  url: string;
  fileName: string;
  size: number;
}

/** Standard shape for backend error responses. */
export interface ApiError {
  error: string;
  message?: string;
  suggestion?: string;
}

/** Category metadata for filters and badges. */
export interface CategoryMeta {
  bg: string;
  text: string;
  border: string;
  label: string;
  description: string;
}

/** Processing lifecycle for tool pages. */
export type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

/** FAQ entry rendered under tool pages. */
export interface Faq {
  q: string;
  a: string;
}
