import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, ArrowRightLeft, Server, Info } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'

export default function GenericConversionTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const acceptFormats = tool.formats ? tool.formats.join(',') : '*'

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles)
    setError(null)
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a file to convert.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      setStatus('Uploading file...')
      setProgress(10)

      const formData = new FormData()
      formData.append('file', files[0])

      setProgress(20)
      setStatus('Converting on server...')

      const response = await fetch(`/api/convert/${tool.slug}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || errorData?.message || `Conversion failed (${response.status})`)
      }

      setProgress(80)
      setStatus('Preparing download...')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const contentDisposition = response.headers.get('content-disposition')
      let fileName = files[0].name.replace(/\.[^.]+$/, '') + '_converted'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/)
        if (match) fileName = match[1]
      }

      setProgress(100)
      setStatus('Complete!')
      setResult({ url, fileName, size: blob.size })
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('load')) {
        setError('Server is not available. This conversion requires server-side processing. Please ensure the backend is running.')
      } else {
        setError(err.message || 'Conversion failed. Please try again later.')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click()
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0) }

  if (result) {
    return (
      <div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Breadcrumb tool={tool} />
        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        </div>
        <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
      </div></div>
    )
  }

  return (
    <div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Breadcrumb tool={tool} />
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl mb-6">
        <Server className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Server-side processing required</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">This conversion requires the backend server to be running. Complex format conversions (like Word, Excel, PowerPoint) need specialized libraries that run on the server.</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <FileUploader accept={acceptFormats} onFilesChange={handleFilesChange} label={`Drag & Drop your file here`} />
      </div>

      {files.length > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{files[0].name}</p>
              <p className="text-xs text-gray-400">{(files[0].size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-brand-500" />
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30`}>
                <span className="text-xs font-bold text-green-600 dark:text-green-400">PDF</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Converting...' : `Convert ${tool.name.replace(' to PDF', '').replace('To PDF', '')} to PDF`}
      </button>

      <FaqSection tool={tool} />
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

function FaqSection({ tool }) {
  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Why does this need a server?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Complex document formats like Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) contain rich formatting, embedded objects, and complex structures that require specialized server-side libraries to parse and convert accurately.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my file secure?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. Your file is sent over an encrypted connection and is not stored permanently. Files are processed and immediately discarded after conversion.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What file formats are supported?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Supported input formats: {tool.formats ? tool.formats.join(', ') : 'Various document formats'}. The output is always a PDF file.</p></div>
    </div>
  )
}
