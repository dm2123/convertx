import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Droplet, Plus, X } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument, rgb } from 'pdf-lib'

export default function PdfRedactTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [redactions, setRedactions] = useState([{ page: 1, x: 50, y: 50, width: 200, height: 50 }])

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles)
    if (newFiles.length > 0) {
      try {
        const buf = await newFiles[0].arrayBuffer()
        const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true })
        setPageCount(pdfDoc.getPageCount())
      } catch {
        setPageCount(0)
      }
    } else {
      setPageCount(0)
    }
  }

  const addRedaction = () => {
    setRedactions([...redactions, { page: 1, x: 50, y: 50, width: 200, height: 50 }])
  }

  const removeRedaction = (index) => {
    if (redactions.length <= 1) return
    setRedactions(redactions.filter((_, i) => i !== index))
  }

  const updateRedaction = (index, field, value) => {
    const updated = [...redactions]
    updated[index] = { ...updated[index], [field]: Number(value) || 0 }
    setRedactions(updated)
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    if (redactions.length === 0) { setError('Please add at least one redaction area.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      setStatus('Reading PDF...')
      setProgress(10)
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      setProgress(40)
      setStatus('Applying redactions...')

      for (let i = 0; i < redactions.length; i++) {
        const r = redactions[i]
        const pageIndex = Math.max(0, Math.min(r.page - 1, pages.length - 1))
        const page = pages[pageIndex]
        const { height } = page.getSize()

        const pdfY = height - r.y - r.height

        page.drawRectangle({
          x: r.x,
          y: pdfY,
          width: r.width,
          height: r.height,
          color: rgb(0, 0, 0),
          opacity: 1,
        })

        setProgress(40 + Math.round(((i + 1) / redactions.length) * 40))
      }

      setProgress(85)
      setStatus('Saving redacted PDF...')

      const redactedBytes = await pdfDoc.save({ useObjectStreams: true })
      const blob = new Blob([redactedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setStatus('Complete!')
      setResult({ url, fileName: `redacted_${file.name}`, size: blob.size })
    } catch (err) {
      setError('Failed to apply redactions. Please check your coordinates and try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click()
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setRedactions([{ page: 1, x: 50, y: 50, width: 200, height: 50 }]); setPageCount(0) }

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
        <FileUploader accept=".pdf" onFilesChange={handleFilesChange} label="Drag & Drop your PDF here" />
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Droplet className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">What does redaction do?</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Redaction permanently covers selected areas with black rectangles. The underlying content is visually hidden. Coordinates use the PDF coordinate system where (0,0) is at the top-left corner of each page.</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Redaction Areas ({redactions.length})</h2>
          <button onClick={addRedaction} className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
            <Plus className="w-4 h-4" /> Add Area
          </button>
        </div>

        <div className="space-y-4">
          {redactions.map((r, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Area {i + 1}</span>
                {redactions.length > 1 && (
                  <button onClick={() => removeRedaction(i)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Page</label>
                  <input type="number" min="1" max={pageCount || 999} value={r.page} onChange={(e) => updateRedaction(i, 'page', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X</label>
                  <input type="number" min="0" value={r.x} onChange={(e) => updateRedaction(i, 'x', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y</label>
                  <input type="number" min="0" value={r.y} onChange={(e) => updateRedaction(i, 'y', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width</label>
                  <input type="number" min="1" value={r.width} onChange={(e) => updateRedaction(i, 'width', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
                  <input type="number" min="1" value={r.height} onChange={(e) => updateRedaction(i, 'height', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
              </div>
              {pageCount > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">File has {pageCount} page{pageCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Redacting...' : 'Apply Redactions'}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is the underlying text still there?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Visually, the content is covered by black rectangles. However, the original text data may still exist in the file. For true permanent removal of sensitive text, consider using a dedicated redaction tool that strips the underlying data.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I find the coordinates?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Use the PDF reader tool to view your document and estimate positions. Coordinates are in PDF points (1 point = 1/72 inch). X is from the left edge, Y is from the top edge of the page.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files never leave your device.</p></div>
    </div>
  )
}
