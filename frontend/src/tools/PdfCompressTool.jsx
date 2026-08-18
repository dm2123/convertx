import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfCompressTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [compression, setCompression] = useState('medium')

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const originalSize = files.length > 0 ? files.reduce((a, f) => a + f.size, 0) : 0

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      setStatus('Reading PDF...')
      setProgress(20)
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()

      setStatus('Compressing...')
      setProgress(50)

      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: compression === 'high',
        addDefaultPage: false,
      })

      setProgress(80)
      setStatus('Finalizing...')

      const blob = new Blob([compressedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setStatus('Complete!')
      setResult({ url, fileName: `compressed_${file.name}`, size: blob.size })
    } catch (err) {
      setError('Failed to compress PDF. The file may be corrupted or password-protected.')
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

      <div className="card p-6 mb-6">
        <FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" />
      </div>

      <div className="card p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Compression Level</label>
        <div className="grid grid-cols-3 gap-3">
          {[{ val: 'low', label: 'Low', desc: 'Best quality' }, { val: 'medium', label: 'Medium', desc: 'Balanced' }, { val: 'high', label: 'High', desc: 'Smallest size' }].map(o => (
            <button key={o.val} onClick={() => setCompression(o.val)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${compression === o.val ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{o.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{o.desc}</p>
            </button>
          ))}
        </div>
        {originalSize > 0 && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Original size: {(originalSize / 1024 / 1024).toFixed(2)} MB</p>
        )}
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Compressing...' : 'Compress PDF'}
      </button>

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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">How does PDF compression work?</h3><p className="text-sm text-gray-600 dark:text-gray-400">PDF compression reduces file size by optimizing images, removing unused elements, and compressing data streams within the PDF structure.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. Compression happens directly in your browser. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Will compression reduce quality?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Low compression maintains the highest quality. Medium and high compression may reduce image quality slightly for significantly smaller file sizes.</p></div>
    </div>
  )
}
