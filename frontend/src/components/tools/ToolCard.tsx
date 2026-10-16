import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Tool } from '../../types';
import { categoryMeta } from '../../data/tools';
import { ToolIcon } from './ToolIcon';
import { Badge } from '../ui/Feedback';

interface ToolCardProps {
  tool: Tool;
}

/** Clickable card linking to a tool's page. */
export function ToolCard({ tool }: ToolCardProps) {
  const meta = categoryMeta[tool.category];

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      aria-label={`${tool.name} — ${tool.description}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} group-hover:scale-110 transition-transform duration-300`}
        >
          <ToolIcon name={tool.icon} className={`w-5 h-5 ${meta.text}`} />
        </div>
        {tool.duplicateOf !== undefined && (
          <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Alt</Badge>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
        {tool.description}
      </p>
      <div className="flex items-center justify-between">
        <Badge className={`${meta.bg} ${meta.text}`}>{tool.category}</Badge>
        <span className="flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Open <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
