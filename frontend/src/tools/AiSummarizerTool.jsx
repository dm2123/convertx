import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Sparkles, Copy, RotateCcw, FileText, Check } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

export default function AiSummarizerTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles)
    setError(null)
    setSummary(null)
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a file to summarize.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      setStatus('Uploading document...')
      setProgress(10)

      const formData = new FormData()
      formData.append('file', files[0])

      setProgress(30)
      setStatus('Analyzing content with AI...')

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/summarize`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to summarize')

      setProgress(80)
      setStatus('Generating summary...')

      const data = await response.json()

      setProgress(100)
      setStatus('Complete!')
      setSummary(data.summary || data.result || data.content || 'No summary generated.')
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const fallbackText = getMockSummary()
        setSummary(fallbackText)
        setProgress(100)
        setStatus('Complete (demo)')
      } else {
        setError(err.message || 'Failed to generate summary. Please try again.')
      }
    } finally {
      setProcessing(false)
    }
  }

  const getMockSummary = () => {
    return `📄 Document Summary (Demo Mode)

This is a placeholder summary generated in demo mode. To get real AI-powered summaries, please start the backend server.

The actual summary would include:
• Key topics and themes covered in the document
• Main arguments or findings
• Important data points and conclusions
• Actionable insights

Connect the backend API at POST /api/ai/summarize for actual AI analysis of your document.`
  }

  const handleCopy = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const handleReset = () => { setFiles([]); setSummary(null); setError(null); setProgress(0); setCopied(false) }

  return (
    <div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Breadcrumb tool={tool} />
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      {!summary && (
        <div className="card p-6 mb-6">
          <FileUploader accept=".pdf,.txt,.doc,.docx" onFilesChange={handleFilesChange} label="Drag & Drop your document here" />
        </div>
      )}

      {files.length > 0 && !summary && (
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{files[0].name}</p>
              <p className="text-xs text-gray-400">{(files[0].size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      {processing && (
        <div className="flex flex-col items-center py-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-brand-200 dark:border-brand-800 border-t-brand-500 animate-spin" />
            <Sparkles className="w-8 h-8 text-brand-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI is analyzing your document...</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This may take a moment for large documents</p>
        </div>
      )}

      {!processing && !summary && (
        <button onClick={handleProcess} disabled={files.length === 0 || processing}
          className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
          Summarize Document
        </button>
      )}

      {summary && (
        <div className="card p-0 mb-6 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI Summary</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  copied ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> New
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}

      <FaqSection />
    </div></div>
  )
}

function Breadcrumb({ tool }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
      <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Home className="w-4 h-4" /></Link>
      <ChevronRight className="w-4 h-4" />
      <Link to="/tools" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Tools</Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 dark:text-white">{tool.name}</span>
    </nav>
  )
}

function FaqSection() {
  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What file types can be summarized?</h3><p className="text-sm text-gray-600 dark:text-gray-400">PDF, TXT, DOC, and DOCX files are supported. The AI extracts text content and generates a concise summary of the key points.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What are demo summaries?</h3><p className="text-sm text-gray-600 dark:text-gray-400">When the backend server is not available, a placeholder summary is shown to demonstrate the interface. Start the server for real AI-powered summarization.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">How accurate are the summaries?</h3><p className="text-sm text-gray-600 dark:text-gray-400">AI summaries capture the main topics, key arguments, and important findings. For very technical or complex documents, we recommend reviewing the original document alongside the summary.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. Your document is processed securely and is not stored permanently. Content is only used to generate the summary and is discarded afterward.</p></div>
    </div>
  )
}
