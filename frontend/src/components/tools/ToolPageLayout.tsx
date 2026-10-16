import { Link } from 'react-router-dom';
import { ChevronRight, Home, Download, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tool, Faq } from '../../types';
import { categoryMeta } from '../../data/tools';
import { ToolIcon } from './ToolIcon';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, ProgressBar } from '../ui/Feedback';
import { formatBytes } from '../../utils/file';

interface ToolPageLayoutProps {
  tool: Tool;
  /** Main interactive area: uploader + options + action button. */
  children: ReactNode;
  /** Extra FAQs appended after the generic ones. */
  faqs?: Faq[];
}

/**
 * Shared shell for every tool page — breadcrumb, header, FAQ and SEO.
 * Individual tools only provide their interactive `children`.
 */
export function ToolPageLayout({ tool, children, faqs = [] }: ToolPageLayoutProps) {
  const meta = categoryMeta[tool.category];
  const genericFaqs: Faq[] = [
    {
      q: `How does ${tool.name} work?`,
      a: `${tool.name} runs right in your browser or on our secure server. Upload your file, adjust any options, and download the result — no signup needed.`,
    },
    {
      q: 'Is my data safe?',
      a: 'Yes. Files are processed securely and never stored. Server-processed files are deleted automatically after conversion.',
    },
    {
      q: 'Is it really free?',
      a: `Yes — ${tool.name} is 100% free with no watermarks, no signup and no hidden limits on file count.`,
    },
  ];

  return (
    <div className="py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors" aria-label="Home">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/tools" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate">{tool.name}</span>
        </nav>

        <header className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${meta.bg}`}>
            <ToolIcon name={tool.icon} className={`w-7 h-7 ${meta.text}`} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
        </header>

        {children}

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {[...faqs, ...genericFaqs].map((f, i) => (
              <details key={i} className="card p-5 group">
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResultCardProps {
  fileName: string;
  fileSize: number;
  onDownload: () => void;
  onReset: () => void;
}

/** Success state after processing — download + start-over actions. */
export function ResultCard({ fileName, fileSize, onDownload, onReset }: ResultCardProps) {
  return (
    <Card className="p-8 text-center animate-scale-in">
      <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
        <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your file is ready</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {fileName} · {formatBytes(fileSize)}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onDownload} icon={<Download className="w-4 h-4" />}>
          Download
        </Button>
        <Button variant="secondary" onClick={onReset} icon={<RotateCcw className="w-4 h-4" />}>
          Process another
        </Button>
      </div>
    </Card>
  );
}

interface ProcessingSectionProps {
  processing: boolean;
  progress: number;
  status: string;
  error: string | null;
}

/** Progress + error block shared by file-based tools. */
export function ProcessingSection({ processing, progress, status, error }: ProcessingSectionProps) {
  return (
    <>
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}
      {processing && (
        <div className="mb-6 animate-fade-in">
          <ProgressBar progress={progress} status={status} />
        </div>
      )}
    </>
  );
}
