import { Link, useLocation } from 'react-router-dom'
import { Home, Grid3X3, Search, Info } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tools', icon: Grid3X3, label: 'Tools' },
  { to: '/tools?q=search', icon: Search, label: 'Search' },
  { to: '/about', icon: Info, label: 'About' },
]

export default function AppNav() {
  const { pathname, search } = useLocation()
  const current = pathname + search

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? (current === '/' || current === '/?category=All') : current.startsWith(to.split('?')[0])
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
