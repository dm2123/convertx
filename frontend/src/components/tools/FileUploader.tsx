import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { formatBytes, hasAllowedExtension } from '../../utils/file';

interface FileUploaderProps {
  /** Accepted extensions, e.g. ['.pdf']. Defaults to any file. */
  accept?: string[];
  /** Allow selecting multiple files. */
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
  maxSizeMB?: number;
}

/**
 * Drag-and-drop file input with validation.
 * Shows selected files with sizes and per-file remove buttons.
 */
export function FileUploader({
  accept = [],
  multiple = false,
  files,
  onChange,
  label = 'Drag & drop files here, or click to browse',
  maxSizeMB = 50,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptAttr = accept.join(',');

  const validateAndSet = (incoming: File[]) => {
    setError(null);
    const maxBytes = maxSizeMB * 1024 * 1024;
    for (const f of incoming) {
      if (accept.length > 0 && !hasAllowedExtension(f.name, accept)) {
        setError(`"${f.name}" is not supported. Allowed: ${accept.join(', ')}`);
        return;
      }
      if (f.size > maxBytes) {
        setError(`"${f.name}" is larger than ${maxSizeMB} MB.`);
        return;
      }
    }
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) validateAndSet(dropped);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) validateAndSet(picked);
    e.target.value = '';
  };

  const removeAt = (idx: number) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
            : 'border-gray-300 dark:border-gray-600 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <UploadCloud className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {accept.length > 0 ? `Supports ${accept.join(', ')}` : 'Any file type'} · max {maxSizeMB} MB
          {multiple ? ' · multiple files allowed' : ''}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr || undefined}
          multiple={multiple}
          onChange={handleInput}
          className="hidden"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(f.size)}</p>
              </div>
              <button
                onClick={() => removeAt(i)}
                aria-label={`Remove ${f.name}`}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
