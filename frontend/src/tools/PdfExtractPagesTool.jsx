import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfExtractPagesTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [pageRange, setPageRange] = useState('')
  const [totalPages, setTotalPages] = useState(0)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles); setResult(null)
    if (newFiles.length > 0) {
      try {
        const buf = await newFiles[0].arrayBuffer()
        const doc = await PDFDocument.load(buf)
        setTotalPages(doc.getPageCount())
      } catch { setTotalPages(0) }
    }
  }

  const handleProcess = async () => {
    if (!pageRange.trim()) { setError('Please enter pages to extract.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      const srcDoc = await PDFDocument.load(buf)
      setProgress(30)
      const indices = parseRange(pageRange, srcDoc.getPageCount())
      if (indices.length === 0) { setError('No valid pages specified.'); setProcessing(false); return }
      setStatus('Extracting pages...')
      setProgress(60)
      const newDoc = await PDFDocument.create()
      const pages = await newDoc.copyPages(srcDoc, indices)
      pages.forEach(p => newDoc.addPage(p))
      setProgress(85)
      const bytes = await newDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setProgress(100)
      setResult({ url, fileName: `extracted_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to extract pages.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setPageRange(''); setTotalPages(0) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span>{tool.name}</span></nav>
      <div className="text-center mb-8"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span>{tool.name}</span></nav>
    <div className="text-center mb-8"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1><p className="text-gray-600 dark:text-gray-400">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={handleFilesChange} label="Drag & Drop your PDF here" /></div>
    {totalPages > 0 && (<div className="card p-6 mb-6">
      <p className="text-sm text-gray-500 mb-2">Total pages: <strong>{totalPages}</strong></p>
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Pages to Extract</label>
      <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="e.g., 1-3, 5, 7-10" className="input-field" />
      <p className="text-xs text-gray-400 mt-1">Specify pages to extract into a new PDF.</p>
    </div>)}
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">{processing ? 'Extracting...' : 'Extract Pages'}</button>
  </div></div>)
}

function parseRange(str, max) {
  const result = []
  str.split(',').forEach(s => {
    const t = s.trim()
    if (t.includes('-')) {
      const [a, b] = t.split('-').map(Number)
      for (let i = Math.max(1, a); i <= Math.min(max, b); i++) result.push(i - 1)
    } else {
      const n = parseInt(t)
      if (n >= 1 && n <= max) result.push(n - 1)
    }
  })
  return result
}
