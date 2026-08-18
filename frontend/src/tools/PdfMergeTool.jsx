import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, GripVertical, Trash2 } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfMergeTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fileOrder, setFileOrder] = useState([])

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles)
    setFileOrder(newFiles.map((_, i) => i))
  }

  const removeFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx)
    setFiles(newFiles)
    setFileOrder(newFiles.map((_, i) => i))
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    const newOrder = [...fileOrder]
    ;[newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    setFileOrder(newOrder)
  }

  const moveDown = (idx) => {
    if (idx === fileOrder.length - 1) return
    const newOrder = [...fileOrder]
    ;[newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]]
    setFileOrder(newOrder)
  }

  const handleProcess = async () => {
    if (files.length < 2) { setError('Please select at least 2 PDF files to merge.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      const mergedPdf = await PDFDocument.create()
      const orderedFiles = fileOrder.map(i => files[i])

      for (let i = 0; i < orderedFiles.length; i++) {
        setStatus(`Merging file ${i + 1} of ${orderedFiles.length}...`)
        setProgress(Math.round(((i + 1) / orderedFiles.length) * 90))
        const arrayBuffer = await orderedFiles[i].arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      setStatus('Finalizing...')
      setProgress(95)
      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setResult({ url, fileName: 'merged.pdf', size: blob.size })
    } catch (err) {
      setError('Failed to merge PDFs. Please ensure all files are valid PDFs.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setFileOrder([]); setResult(null); setError(null); setProgress(0) }

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
        <FileUploader accept=".pdf" multiple onFilesChange={handleFilesChange} label="Drag & Drop your PDFs here" />
      </div>

      {files.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">File Order (click arrows to reorder)</p>
          <div className="space-y-2">
            {fileOrder.map((fileIdx, pos) => (
              <div key={fileIdx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-mono text-gray-400 w-6">{pos + 1}.</span>
                <p className="flex-1 text-sm text-gray-900 dark:text-white truncate">{files[fileIdx].name}</p>
                <button onClick={() => moveUp(pos)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-xs">↑</button>
                <button onClick={() => moveDown(pos)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-xs">↓</button>
                <button onClick={() => removeFile(pos)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length < 2 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Merging...' : 'Merge PDFs'}
      </button>
    </div></div>
  )
}
