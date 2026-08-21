import { Link } from 'react-router-dom'
import { iconMap, categoryColors } from '../data/tools'
import { ArrowRight } from 'lucide-react'

export default function ToolCard({ tool, index }) {
  const Icon = iconMap[tool.icon] || iconMap.FileText
  const colors = categoryColors[tool.category] || categoryColors.PDF

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="card group p-5 hover:-translate-y-1 cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
          #{String(tool.id).padStart(2, '0')}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
        {tool.description}
      </p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {tool.category}
        </span>
        {tool.comingSoon ? (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            Coming Soon
          </span>
        ) : (
          <div className="flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Open <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </Link>
  )
}
