import { Link } from 'react-router-dom'
import { Github, Instagram, Mail } from 'lucide-react'
import { Capacitor } from '@capacitor/core'

export default function Footer() {
  const isApp = Capacitor.isNativePlatform()
  const toolCategories = [
    { label: 'PDF Tools', to: '/tools?category=PDF' },
    { label: 'Convert', to: '/tools?category=Convert' },
    { label: 'Edit', to: '/tools?category=Edit' },
    { label: 'Security', to: '/tools?category=Security' },
    { label: 'AI Tools', to: '/tools?category=AI' },
  ]

  const pages = [
    ...(!isApp ? [{ label: 'Downloads', to: '/downloads' }] : []),
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ]

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="ConvertX logo" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">ConvertX</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              One Platform. Multiple File Tools. Created by Dinesh Maurya.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Built with HTML, CSS, JavaScript and modern web technologies.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tools</h3>
            <ul className="space-y-2">
              {toolCategories.map(cat => (
                <li key={cat.label}>
                  <Link to={cat.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {pages.map(page => (
                <li key={page.to}>
                  <Link to={page.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Popular Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/tools/compress-pdf" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Compress PDF</Link></li>
              <li><Link to="/tools/merge-pdf" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Merge PDF</Link></li>
              <li><Link to="/tools/jpg-to-pdf" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">JPG to PDF</Link></li>
              <li><Link to="/tools/pdf-to-word" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">PDF to Word</Link></li>
              <li><Link to="/tools/protect-pdf" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Protect PDF</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} ConvertX by Maurya Software Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://github.com/dm2123/convertx" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/mr_dinesh_hacker" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="mailto:dm7178072@gmail.com" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Email">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}