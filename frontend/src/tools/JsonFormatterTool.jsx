import { useState } from 'react'
import { Copy, Braces } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function JsonFormatterTool({ tool }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('format')
  const [copied, setCopied] = useState(false)

  const run = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input)
      if (mode === 'minify') {
        setOutput(JSON.stringify(parsed))
      } else {
        setOutput(JSON.stringify(parsed, null, 2))
      }
    } catch (e) {
      setError('Invalid JSON: ' + e.message)
      setOutput('')
    }
  }

  const copy = () => {
    navigator.clipboard?.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Braces className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('format')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'format' ? 'bg-teal-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              Format
            </button>
            <button
              onClick={() => setMode('minify')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'minify' ? 'bg-teal-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              Minify
            </button>
          </div>
          <span className="text-xs text-gray-500">Mode: {mode === 'format' ? 'pretty print' : 'compress'}</span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder='{"name": "ConvertX", "tools": 71}'
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button onClick={run} className="w-full btn-primary text-base py-4">
          {mode === 'format' ? 'Format JSON' : 'Minify JSON'}
        </button>

        {output && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Output</span>
              <button onClick={copy} className="text-xs inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
                {copied ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="p-4 bg-gray-900 dark:bg-black rounded-xl text-green-300 text-xs overflow-x-auto max-h-96">{output}</pre>
          </div>
        )}
      </div>
      <FaqSection tool={tool} />
    </div>
  )
}