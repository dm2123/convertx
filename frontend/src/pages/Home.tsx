import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Gauge, MonitorSmartphone, Search } from 'lucide-react';
import { categories, searchTools, getToolsByCategory, getUniqueTools } from '../data/tools';
import type { ToolCategory } from '../types';
import { ToolCard } from '../components/tools/ToolCard';
import { Seo } from '../components/Seo';
import { useDocumentTitle } from '../hooks/useToolProcessor';

const TOOL_COUNT = getUniqueTools().length;

const FEATURES = [
  {
    icon: Shield,
    title: 'Private by design',
    desc: 'Client-side tools never upload your files. Server tools delete everything after processing.',
  },
  {
    icon: Gauge,
    title: 'Fast to navigate',
    desc: 'Search and category filters bring the right tool into view instantly.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Works everywhere',
    desc: 'Clean, responsive workspace across desktop, tablet and mobile — plus dark mode.',
  },
] as const;

export function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | ToolCategory>('All');

  useDocumentTitle('ConvertX — Free Online File Tools');

  const displayTools = query ? searchTools(query) : getToolsByCategory(category);

  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pickCategory = (cat: 'All' | ToolCategory) => {
    setCategory(cat);
    setQuery('');
    scrollToTools();
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    scrollToTools();
  };

  return (
    <div>
      <Seo
        title={`ConvertX — ${TOOL_COUNT} Free Online File Tools | PDF Converter, Compressor & More`}
        description="Every file tool you need in one place. Merge, split, compress, convert and secure PDFs and documents online for free. No signup required."
        canonicalPath="/"
        keywords={['pdf tools', 'compress pdf', 'merge pdf', 'jpg to pdf', 'free online tools']}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/70 via-white to-white dark:from-brand-950/20 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-brand-400/10 dark:bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-14 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            {TOOL_COUNT} professional tools — 100% free
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 max-w-3xl mx-auto text-gray-900 dark:text-white">
            Every file tool you need,{' '}
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
              in one place
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-9 max-w-2xl mx-auto">
            Merge, split, compress, convert and secure your files with just a few clicks. All tools
            are free and easy to use.
          </p>

          <form onSubmit={submitSearch} className="max-w-xl mx-auto relative" role="search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={scrollToTools}
              placeholder="What do you want to do with your file?"
              aria-label="Search tools"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => pickCategory(cat)}
                aria-pressed={category === cat && !query}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  category === cat && !query
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools directory */}
      <section id="tools" className="py-14 md:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                {query ? 'Search results' : category === 'All' ? 'Popular tools' : `${category} tools`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Pick a task and get straight to work.</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap" aria-live="polite">
              {displayTools.length} tool{displayTools.length !== 1 ? 's' : ''}
              {query && <span> for &ldquo;{query}&rdquo;</span>}
            </p>
          </div>

          {displayTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</p>
              <p className="text-gray-500 dark:text-gray-400">
                Try a shorter search such as &ldquo;PDF&rdquo;, &ldquo;image&rdquo; or &ldquo;password&rdquo;.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all hover:shadow-lg"
            >
              View all tools <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature band */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" aria-label="Why ConvertX">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`py-10 md:py-12 px-2 md:px-8 flex gap-4 ${
                i > 0 ? 'md:border-l border-gray-200 dark:border-gray-800 border-t md:border-t-0' : ''
              }`}
            >
              <f.icon className="w-6 h-6 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Find your next tool
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Browse the complete collection by category, or search for the exact task you have in mind.
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all hover:shadow-lg text-base"
          >
            Browse all tools <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
