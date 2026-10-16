import type { Faq, Tool } from '../../types';

/** FAQ block rendered at the bottom of tool pages. */
export function FaqSection({ tool, extra = [] }: { tool: Tool; extra?: Faq[] }) {
  const generic: Faq[] = [
    {
      q: `How does ${tool.name} work?`,
      a: `${tool.name} runs right in your browser or on our secure server. Upload your file, adjust any options, and download the result — no signup needed.`,
    },
    {
      q: 'Is my data safe?',
      a: 'Yes. Files are processed securely and never stored. Server-processed files are deleted automatically after conversion.',
    },
  ];
  const faqs = [...extra, ...generic];

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 p-5">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              {f.q}
            </summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
