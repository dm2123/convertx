import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfCropTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 })

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const updateMargin = (key, val) => {
    setMargins(prev => ({ ...prev, [key]: Math.max(0, parseInt(val) || 0) }))
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    const totalMargin = margins.top + margins.bottom + margins.left + margins.right
    if (totalMargin === 0) { setError('Please enter at least one margin value greater than 0.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      setStatus('Reading PDF...')
      setProgress(10)
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(30)
      setStatus('Cropping pages...')
      const pages = pdfDoc.getPages()
      const totalPages = pages.length
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const newWidth = width - margins.left - margins.right
        const newHeight = height - margins.top - margins.bottom
        if (newWidth <= 0 || newHeight <= 0) {
          setError(`Margins are too large for page ${i + 1} (${Math.round(width)}x${Math.round(height)} pts).`)
          setProcessing(false)
          return
        }
        page.setCropBox(margins.left, margins.bottom, newWidth, newHeight)
        setProgress(30 + Math.round(((i + 1) / totalPages) * 55))
      }
      setStatus('Saving...')
      setProgress(90)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setProgress(100)
      setResult({ url, fileName: `cropped_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to crop PDF.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setMargins({ top: 0, bottom: 0, left: 0, right: 0 }) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Breadcrumb tool={tool} />
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
      </div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Breadcrumb tool={tool} />
    <div className="text-center mb-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
      <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
    </div>

    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" /></div>

    <div className="card p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Crop Margins (points)</label>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'top', label: 'Top' },
          { key: 'bottom', label: 'Bottom' },
          { key: 'left', label: 'Left' },
          { key: 'right', label: 'Right' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
            <input type="number" min="0" value={margins[key]} onChange={e => updateMargin(key, e.target.value)}
              className="input-field w-full" placeholder="0" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">1 inch = 72 points. Example: 36pt = 0.5 inch margin.</p>
    </div>

    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

    <button onClick={handleProcess} disabled={files.length === 0 || processing}
      className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
      {processing ? 'Cropping...' : 'Crop PDF'}
    </button>

    <FaqSection />
  </div></div>)
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What are points?</h3><p className="text-sm text-gray-600 dark:text-gray-400">PDF uses points as the unit of measurement. 1 point = 1/72 of an inch. So 72pt = 1 inch, 36pt = 0.5 inch.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Will cropping remove content?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Cropping hides content outside the crop area by setting the crop box. The original content is not deleted from the PDF structure.</p></div>
    </div>
  )
}
