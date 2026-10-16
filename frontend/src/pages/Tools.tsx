import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { searchTools, getToolsByCategory, getUniqueTools, categories } from '../data/tools';
import type { ToolCategory } from '../types';
import { ToolCard } from '../components/tools/ToolCard';
import { Seo } from '../components/Seo';
import { Input } from '../components/ui/Input';
import { useDocumentTitle } from '../hooks/useToolProcessor';

type CategoryFilter = 'All' | ToolCategory;

const TOOL_COUNT = getUniqueTools().length;

export function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<CategoryFilter>(
    (searchParams.get('category') as CategoryFilter) || 'All',
  );

  useDocumentTitle('All Tools — ConvertX');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setCategory((searchParams.get('category') as CategoryFilter) || 'All');
  }, [searchParams]);

  const displayTools = query ? searchTools(query) : getToolsByCategory(category);

  const handleSearch = (val: string) => {
    setQuery(val);
    setSearchParams(val ? { q: val } : category !== 'All' ? { category } : {});
  };

  const handleCategory = (cat: CategoryFilter) => {
    setCategory(cat);
    setQuery('');
    setSearchParams(cat === 'All' ? {} : { category: cat });
  };

  return (
    <div className="py-12">
      <Seo
        title={`All Tools — ${TOOL_COUNT} Free Online File Tools | ConvertX`}
        description={`Browse all ${TOOL_COUNT} free online file tools at ConvertX. Compress, merge, split, convert, edit and secure your documents — no signup required.`}
        canonicalPath="/tools"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            All tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Browse our complete collection of {TOOL_COUNT} professional file tools.
          </p>
          <div className="max-w-xl mx-auto mb-6 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              type="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tools…"
              aria-label="Search tools"
              className="pl-12"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                aria-pressed={category === cat}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  category === cat
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 text-center" aria-live="polite">
          Showing {displayTools.length} tool{displayTools.length !== 1 ? 's' : ''}
        </p>

        {displayTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</p>
            <p className="text-gray-500 dark:text-gray-400">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
