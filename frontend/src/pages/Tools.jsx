import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import tools, { searchTools, getToolsByCategory } from '../data/tools'
import ToolCard from '../components/ToolCard'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'

export default function Tools() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || 'All'

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const c = searchParams.get('category') || 'All'
    setQuery(q)
    setCategory(c)
  }, [searchParams])

  const displayTools = query
    ? searchTools(query)
    : getToolsByCategory(category)

  const handleSearch = (val) => {
    setQuery(val)
    if (val) {
      setSearchParams({ q: val })
    } else {
      setSearchParams({ category })
    }
  }

  const handleCategory = (cat) => {
    setCategory(cat)
    setQuery('')
    if (cat === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ category: cat })
    }
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            All Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Browse our complete collection of {tools.length} professional file processing tools.
          </p>
          <div className="max-w-xl mx-auto mb-6">
            <SearchBar value={query} onChange={handleSearch} placeholder="Search tools..." />
          </div>
          <CategoryFilter selected={category} onSelect={handleCategory} />
        </div>

        <div className="mt-8 mb-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {displayTools.length} tool{displayTools.length !== 1 ? 's' : ''}
        </div>

        {displayTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</p>
            <p className="text-gray-500 dark:text-gray-400">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
