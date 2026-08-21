import { Capacitor } from '@capacitor/core'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon, Menu, X, Zap } from 'lucide-react'
import AppNav from './AppNav'

export default function AppLayout({ children }) {
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const isApp = Capacitor.isNativePlatform()

  if (!isApp) return children

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 bg-brand-600/95 backdrop-blur-xl shadow-lg shadow-brand-600/20">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ConvertX</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {children}
      </main>

      <AppNav />
    </div>
  )
}
