import type { ReactNode } from 'react';

/** Surface card — the base container for content blocks. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Page section wrapper with consistent vertical rhythm. */
export function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`py-12 ${className}`}>{children}</section>;
}

/** Centered content container. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-2xl mx-auto px-4 sm:px-6 ${className}`}>{children}</div>;
}
