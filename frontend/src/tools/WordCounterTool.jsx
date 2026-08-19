import { useState } from 'react'
import { Copy, RefreshCw, Type } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function WordCounterTool({ tool }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0
  const minutes = Math.ceil(words / 200)
  const readingTime = words === 0 ? 0 : minutes

  const copyResult = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const stats = [
    { label: 'Words', value: words.toLocaleString() },
    { label: 'Characters', value: chars.toLocaleString() },
    { label: 'Characters (no space)', value: charsNoSpace.toLocaleString() },
    { label: 'Sentences', value: sentences },
    { label: 'Paragraphs', value: paragraphs },
    { label: 'Reading Time', value: readingTime > 0 ? `${readingTime} min` : '0 min' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Type className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Apna text likho ya paste karo</label>
          <button onClick={copyResult} className="text-xs inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
            {copied ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy Text</>}
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Yahan type karo..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
        {text && (
          <button onClick={() => setText('')} className="mt-3 text-xs inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <RefreshCw className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card p-5 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>
      <FaqSection tool={tool} />
    </div>
  )
}