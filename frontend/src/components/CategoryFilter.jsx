import { categories, categoryColors } from '../data/tools'

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex sm:flex-wrap justify-start sm:justify-center gap-2 min-w-max sm:min-w-0">
        {categories.map(cat => {
          const isActive = selected === cat
          const colors = cat !== 'All' ? categoryColors[cat] : null
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
    </div>
  )
}
