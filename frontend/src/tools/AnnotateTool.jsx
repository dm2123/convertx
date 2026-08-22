import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default function AnnotateTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [annotations, setAnnotations] = useState([{ text: '', x: 100, y: 700, size: 14, color: '#FF0000' }])
  const [fontSize, setFontSize] = useState(14)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const addAnnotation = () => setAnnotations([...annotations, { text: '', x: 100, y: 700, size: fontSize, color: '#FF0000' }])
  const removeAnnotation = (i) => setAnnotations(annotations.filter((_, idx) => idx !== i))
  const updateAnnotation = (i, field, val) => { const a = [...annotations]; a[i] = { ...a[i], [field]: val }; setAnnotations(a) }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF.'); return }
    if (!annotations.some(a => a.text.trim())) { setError('Add at least one annotation.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(30)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      for (const ann of annotations) {
        if (!ann.text.trim()) continue
        const pageIdx = Math.min(0, pages.length - 1)
        const page = pages[pageIdx]
        const { height } = page.getSize()
        const r = parseInt(ann.color.slice(1, 3), 16) / 255
        const g = parseInt(ann.color.slice(3, 5), 16) / 255
        const b = parseInt(ann.color.slice(5, 7), 16) / 255
        page.drawText(ann.text, {
          x: ann.x, y: height - ann.y,
          size: ann.size, font, color: rgb(r, g, b),
        })
      }
      setProgress(80)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setProgress(100)
      setResult({ url: URL.createObjectURL(blob), fileName: `annotated_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to annotate PDF.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setAnnotations([{ text: '', x: 100, y: 700, size: 14, color: '#FF0000' }]) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" /></div>
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-white">Annotations</h3><button onClick={addAnnotation} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700"><Plus className="w-4 h-4" />Add</button></div>
      <div className="space-y-3">
        {annotations.map((ann, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <input type="text" value={ann.text} onChange={e => updateAnnotation(i, 'text', e.target.value)} className="input-field flex-1" placeholder="Annotation text..." />
            <div className="flex gap-2">
              <input type="number" value={ann.x} onChange={e => updateAnnotation(i, 'x', parseInt(e.target.value) || 0)} className="input-field w-20" title="X position" />
              <input type="number" value={ann.y} onChange={e => updateAnnotation(i, 'y', parseInt(e.target.value) || 0)} className="input-field w-20" title="Y position" />
              <input type="color" value={ann.color} onChange={e => updateAnnotation(i, 'color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              {annotations.length > 1 && <button onClick={() => removeAnnotation(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Annotating PDF..." /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Add Annotations'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">PDF Annotator</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
