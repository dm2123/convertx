import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument, rgb } from 'pdf-lib'

export default function PdfPageNumbersTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [position, setPosition] = useState('bottom-center')
  const [fontSize, setFontSize] = useState(12)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      setStatus('Reading PDF...')
      setProgress(10)
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(30)
      setStatus('Adding page numbers...')
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont('Helvetica')
      const totalPages = pages.length
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const pageNum = `${i + 1} / ${totalPages}`
        const textWidth = font.widthOfTextAtSize(pageNum, fontSize)
        let x, y
        if (position === 'bottom-center') {
          x = width / 2 - textWidth / 2
          y = 30
        } else if (position === 'bottom-right') {
          x = width - textWidth - 40
          y = 30
        } else if (position === 'top-center') {
          x = width / 2 - textWidth / 2
          y = height - 30
        } else {
          x = width - textWidth - 40
          y = height - 30
        }
        page.drawText(pageNum, {
          x, y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        })
        setProgress(30 + Math.round(((i + 1) / totalPages) * 55))
      }
      setStatus('Saving...')
      setProgress(90)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setProgress(100)
      setResult({ url, fileName: `numbered_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to add page numbers.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0) }

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

    <div className="card p-6 mb-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Page Number Position</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ val: 'bottom-center', label: 'Bottom Center' }, { val: 'bottom-right', label: 'Bottom Right' }, { val: 'top-center', label: 'Top Center' }, { val: 'top-right', label: 'Top Right' }].map(o => (
            <button key={o.val} onClick={() => setPosition(o.val)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${position === o.val ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{o.label}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Font Size: {fontSize}pt</label>
        <input type="range" min="8" max="24" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full" />
      </div>
    </div>

    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

    <button onClick={handleProcess} disabled={files.length === 0 || processing}
      className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
      {processing ? 'Processing...' : 'Add Page Numbers'}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What page number format is used?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Page numbers are displayed as "Page X of Y" format, e.g., "1 / 5", on each page.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change the font size?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes, use the font size slider to adjust from 8pt to 24pt before processing.</p></div>
    </div>
  )
}
