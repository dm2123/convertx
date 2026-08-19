import { getSeoForSlug } from '../data/seoContent'

export default function FaqSection({ tool }) {
  const seo = getSeoForSlug(tool?.slug)
  const faqs = seo?.faqs?.length ? seo.faqs : [
    { q: `How does ${tool?.name || 'this'} tool work?`, a: 'Everything happens in your browser - no upload needed. Use the tool above and get your result instantly.' },
    { q: 'Is this tool free?', a: 'Yes, 100% free with unlimited use. No signup, no watermark.' },
    { q: 'Is my data safe?', a: 'Yes. Files and text are processed locally in your browser and never uploaded to any server.' },
    { q: 'Does it work on mobile?', a: 'Yes, it works on any device with a modern browser - phone, tablet or desktop.' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group card p-0 overflow-hidden cursor-pointer"
          >
            <summary className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white list-none">
              {f.q}
              <span className="text-teal-600 dark:text-teal-400 transition-transform group-open:rotate-45 flex-shrink-0 text-lg leading-none">+</span>
            </summary>
            <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}