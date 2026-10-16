import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, { box: string; icon: typeof AlertCircle; text: string }> = {
  error: {
    box: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    icon: XCircle,
    text: 'text-red-600 dark:text-red-400',
  },
  success: {
    box: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    icon: CheckCircle2,
    text: 'text-green-600 dark:text-green-400',
  },
  info: {
    box: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    icon: Info,
    text: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    box: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
    text: 'text-amber-600 dark:text-amber-400',
  },
};

/** Contextual feedback banner (error / success / info / warning). */
export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const s = styles[variant];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-3 p-4 border rounded-xl ${s.box} ${className}`} role="alert">
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.text}`} />
      <div className="flex-1">
        {title && <p className={`font-semibold text-sm mb-1 ${s.text}`}>{title}</p>}
        <div className={`text-sm ${s.text}`}>{children}</div>
      </div>
    </div>
  );
}

/** Thin progress bar with status text, used during file processing. */
export function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{clamped}%</p>
      </div>
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/** Small pill badge, e.g. for categories or counts. */
export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
