import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Sparkles, FileText, ArrowRightLeft, Layers } from 'lucide-react'
import tools, { categories, searchTools, getToolsByCategory } from '../data/tools'
import ToolCard from '../components/ToolCard'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import SeoUpdater from '../components/SeoUpdater'

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const displayTools = query
    ? searchTools(query)
    : getToolsByCategory(category)

  const features = [
    { icon: FileText, title: 'PDF Tools', desc: 'Compress, merge, split, edit and manage your PDF files with ease.' },
    { icon: ArrowRightLeft, title: 'File Conversion', desc: 'Convert between PDF, Word, Excel, PowerPoint, images and more.' },
    { icon: Shield, title: 'Security', desc: 'Protect, encrypt and digitally sign your documents securely.' },
    { icon: Sparkles, title: 'AI Powered', desc: 'Summarize, chat and analyze documents with AI assistance.' },
    { icon: Layers, title: 'Batch Processing', desc: 'Process multiple files simultaneously for maximum efficiency.' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized processing engine for instant results in your browser.' },
  ]

  return (
    <div>
      <SeoUpdater
        title="ConvertX - 82+ Free Online File Tools | PDF Converter, Compressor & More"
        description="Convert, compress, merge, split and edit PDFs and documents online for free. 82+ tools, no signup required, no watermarks."
        canonicalPath="/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 dark:bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              82 Professional Tools
            </div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 tracking-wide uppercase">by Maurya Software Technologies</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Powerful File Tools.
              </span>
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
                One Simple Platform.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto animate-slide-up">
              Convert, compress, edit, organize and manage your documents with ConvertX.
              Everything you need for document processing in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link to="/tools" className="btn-primary flex items-center gap-2 text-base">
                Explore All Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="btn-secondary flex items-center gap-2 text-base">
                Learn More
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              { num: '82+', label: 'Tools' },
              { num: '5', label: 'Categories' },
              { num: '100%', label: 'Free' },
              { num: '24/7', label: 'Available' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stat.num}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A complete suite of file processing tools designed for professionals and everyday users alike.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-6 hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Directory */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore 82 Tools</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Find the perfect tool for your document processing needs.
            </p>
            <div className="max-w-xl mx-auto mb-6">
              <SearchBar value={query} onChange={setQuery} placeholder="Search tools... (e.g., PDF, compress, merge)" />
            </div>
            <CategoryFilter selected={category} onSelect={(c) => { setCategory(c); setQuery('') }} />
          </div>

          <div className="mt-8 mb-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            Showing {displayTools.length} tool{displayTools.length !== 1 ? 's' : ''}
            {query && <span> for "{query}"</span>}
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
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</p>
              <p className="text-gray-500 dark:text-gray-400">Try a different search term or category.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/tools" className="btn-primary inline-flex items-center gap-2">
              View All Tools <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Start using ConvertX today and experience the power of professional file tools.
          </p>
          <Link to="/tools" className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl font-semibold hover:bg-brand-50 transition-all duration-200 hover:shadow-xl active:scale-[0.98]">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}


