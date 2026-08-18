import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument, degrees } from 'pdf-lib'

export default function PdfRotateTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [rotation, setRotation] = useState(90)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      setStatus('Rotating pages...')
      setProgress(30)
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(60)
      const pages = pdfDoc.getPages()
      pages.forEach(p => p.setRotation(degrees((p.getRotation().angle + rotation) % 360)))
      setProgress(85)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setProgress(100)
      setResult({ url, fileName: `rotated_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to rotate PDF.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/" className="hover:text-brand-600"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools" className="hover:text-brand-600">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">{tool.name}</span></nav>
      <div className="text-center mb-8"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/" className="hover:text-brand-600"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools" className="hover:text-brand-600">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">{tool.name}</span></nav>
    <div className="text-center mb-8"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1><p className="text-gray-600 dark:text-gray-400">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" /></div>
    <div className="card p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Rotation Angle</label>
      <div className="grid grid-cols-3 gap-3">
        {[{ val: 90, label: '90° Right' }, { val: 180, label: '180°' }, { val: 270, label: '90° Left' }].map(o => (
          <button key={o.val} onClick={() => setRotation(o.val)} className={`p-3 rounded-xl border-2 text-center transition-all ${rotation === o.val ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{o.label}</p>
          </button>
        ))}
      </div>
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">{processing ? 'Rotating...' : 'Rotate PDF'}</button>
  </div></div>)
}
