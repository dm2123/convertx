import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default function FormFillerTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState([{ name: 'Name', value: '' }, { name: 'Email', value: '' }, { name: 'Phone', value: '' }, { name: 'Date', value: '' }, { name: 'Address', value: '' }])

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const updateField = (i, field, val) => { const f = [...fields]; f[i] = { ...f[i], [field]: val }; setFields(f) }
  const addField = () => setFields([...fields, { name: '', value: '' }])
  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i))

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF form.'); return }
    const filledFields = fields.filter(f => f.value.trim())
    if (filledFields.length === 0) { setError('Fill at least one field.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(20)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const page = pages[0]
      const { width, height } = page.getSize()
      setProgress(50)
      let yPos = height - 80
      for (const field of filledFields) {
        if (yPos < 60) break
        page.drawText(`${field.name}:`, { x: 60, y: yPos, size: 12, font, color: rgb(0, 0, 0) })
        page.drawText(field.value, { x: 200, y: yPos, size: 12, font, color: rgb(0.1, 0.1, 0.7) })
        yPos -= 25
      }
      setProgress(80)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setProgress(100)
      setResult({ url: URL.createObjectURL(blob), fileName: `filled_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to fill form.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF form here" /></div>
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-white">Form Fields</h3><button onClick={addField} className="text-sm text-brand-600 hover:text-brand-700 font-medium">+ Add Field</button></div>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={field.name} onChange={e => updateField(i, 'name', e.target.value)} className="input-field w-1/3" placeholder="Field name" />
            <input type="text" value={field.value} onChange={e => updateField(i, 'value', e.target.value)} className="input-field flex-1" placeholder="Fill value..." />
            {fields.length > 3 && <button onClick={() => removeField(i)} className="text-red-500 hover:text-red-700 px-2">X</button>}
          </div>
        ))}
      </div>
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Filling form..." /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Fill Form'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">PDF Form Filler</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
