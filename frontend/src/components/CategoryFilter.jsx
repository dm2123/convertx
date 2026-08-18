import { categories, categoryColors } from '../data/tools'

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map(cat => {
        const isActive = selected === cat
        const colors = cat !== 'All' ? categoryColors[cat] : null
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                : colors
                  ? `${colors.bg} ${colors.text} hover:shadow-md`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
