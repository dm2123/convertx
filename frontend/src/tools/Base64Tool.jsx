import { useState } from 'react'
import { Copy, ArrowDownUp } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function Base64Tool({ tool }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [copied, setCopied] = useState(false)

  const run = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
    } catch {
      setOutput('')
      if (mode === 'decode') setOutput('Invalid Base64 input')
    }
  }

  const copy = () => {
    navigator.clipboard?.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const swap = () => {
    setInput(output && !output.startsWith('Invalid') ? output : '')
    setOutput('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ArrowDownUp className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-teal-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-teal-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              Decode
            </button>
          </div>
          <button onClick={swap} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors" aria-label="Swap">
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mode === 'encode' ? 'Plain Text' : 'Base64 Text'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={mode === 'encode' ? 'Hello World...' : 'SGVsbG8gV29ybGQ='}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <button onClick={run} className="w-full btn-primary text-base py-4">
          {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
        </button>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              </label>
              {!output.startsWith('Invalid') && (
                <button onClick={copy} className="text-xs inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
                  {copied ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              )}
            </div>
            <pre className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm overflow-x-auto">{output}</pre>
          </div>
        )}
      </div>
      <FaqSection tool={tool} />
    </div>
  )
}