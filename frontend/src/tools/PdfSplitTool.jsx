import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfSplitTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [splitMode, setSplitMode] = useState('all')
  const [pageRange, setPageRange] = useState('')
  const [everyN, setEveryN] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfDoc, setPdfDoc] = useState(null)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles)
    setResult(null)
    if (newFiles.length > 0) {
      try {
        const buf = await newFiles[0].arrayBuffer()
        const doc = await PDFDocument.load(buf)
        setPdfDoc(doc)
        setTotalPages(doc.getPageCount())
      } catch { setTotalPages(0); setPdfDoc(null) }
    }
  }

  const handleProcess = async () => {
    if (!pdfDoc) { setError('Please select a PDF file.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      let indices = []
      if (splitMode === 'all') {
        indices = pdfDoc.getPageIndices()
      } else if (splitMode === 'range' && pageRange) {
        indices = parsePageRange(pageRange, totalPages)
      } else if (splitMode === 'every') {
        for (let i = 0; i < totalPages; i += everyN) indices.push(i)
      } else if (splitMode === 'first') {
        indices = [0]
      } else if (splitMode === 'last') {
        indices = [totalPages - 1]
      }

      if (indices.length === 0) { setError('No valid pages selected.'); setProcessing(false); return }

      setStatus('Splitting PDF...')
      setProgress(50)

      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdfDoc, indices)
      pages.forEach(p => newPdf.addPage(p))

      setProgress(80)
      const bytes = await newPdf.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setResult({ url, fileName: 'split.pdf', size: blob.size })
    } catch (err) {
      setError('Failed to split PDF. Please check your page range.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setPdfDoc(null); setTotalPages(0) }

  if (result) {
    return (
      <div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-brand-600"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" />
          <Link to="/tools" className="hover:text-brand-600">Tools</Link><ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">{tool.name}</span>
        </nav>
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
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link to="/" className="hover:text-brand-600"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" />
        <Link to="/tools" className="hover:text-brand-600">Tools</Link><ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{tool.name}</span>
      </nav>
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6">
        <FileUploader accept=".pdf" onFilesChange={handleFilesChange} label="Drag & Drop your PDF here" />
      </div>

      {totalPages > 0 && (
        <div className="card p-6 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Total pages: <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span></p>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Split Mode</label>
          <div className="space-y-2">
            {[{ val: 'all', label: 'Extract all pages' }, { val: 'range', label: 'Extract page range' }, { val: 'every', label: 'Extract every N pages' }, { val: 'first', label: 'First page only' }, { val: 'last', label: 'Last page only' }].map(o => (
              <label key={o.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${splitMode === o.val ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <input type="radio" name="splitMode" value={o.val} checked={splitMode === o.val} onChange={() => setSplitMode(o.val)} className="text-brand-600" />
                <span className="text-sm text-gray-900 dark:text-white">{o.label}</span>
              </label>
            ))}
          </div>
          {splitMode === 'range' && (
            <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="e.g., 1-5, 8, 10-12"
              className="input-field mt-3" />
          )}
          {splitMode === 'every' && (
            <input type="number" value={everyN} onChange={e => setEveryN(parseInt(e.target.value) || 1)} min={1} max={totalPages}
              className="input-field mt-3" placeholder="Every N pages" />
          )}
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={!pdfDoc || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Splitting...' : 'Split PDF'}
      </button>
    </div></div>
  )
}

function parsePageRange(range, max) {
  const indices = []
  const parts = range.split(',').map(s => s.trim())
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      for (let i = Math.max(1, start); i <= Math.min(max, end); i++) indices.push(i - 1)
    } else {
      const n = parseInt(part)
      if (n >= 1 && n <= max) indices.push(n - 1)
    }
  }
  return indices
}
