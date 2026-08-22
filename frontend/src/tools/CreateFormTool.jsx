import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import ProgressBar from '../components/ProgressBar'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

export default function CreateFormTool({ tool }) {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [formTitle, setFormTitle] = useState('My Form')
  const [fields, setFields] = useState([
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Email Address', type: 'text', required: true },
    { label: 'Phone Number', type: 'text', required: false },
  ])

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const addField = () => setFields([...fields, { label: '', type: 'text', required: false }])
  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i))
  const updateField = (i, field, val) => { const f = [...fields]; f[i] = { ...f[i], [field]: val }; setFields(f) }

  const handleProcess = async () => {
    if (!formTitle.trim()) { setError('Enter a form title.'); return }
    if (fields.length === 0) { setError('Add at least one field.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      setProgress(30)
      const page = pdfDoc.addPage(PageSizes.A4)
      const { width, height } = page.getSize()
      let yPos = height - 60
      page.drawText(formTitle, { x: 60, y: yPos, size: 20, font: boldFont, color: rgb(0.1, 0.1, 0.5) })
      yPos -= 40
      page.drawLine({ start: { x: 60, y: yPos }, end: { x: width - 60, y: yPos }, thickness: 1, color: rgb(0.7, 0.7, 0.7) })
      yPos -= 30
      setProgress(60)
      for (const field of fields) {
        if (yPos < 100) {
          const p = pdfDoc.addPage(PageSizes.A4)
          yPos = p.getSize().height - 60
        }
        const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
        lastPage.drawText(`${field.label}${field.required ? ' *' : ''}`, { x: 60, y: yPos, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.2) })
        yPos -= 18
        lastPage.drawRectangle({ x: 60, y: yPos - 5, width: width - 120, height: 22, borderWidth: 0.5, color: rgb(0.95, 0.95, 0.95), borderColor: rgb(0.7, 0.7, 0.7) })
        yPos -= 35
      }
      setProgress(80)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setProgress(100)
      setResult({ url: URL.createObjectURL(blob), fileName: `${formTitle.replace(/\s+/g, '_')}_form.pdf`, size: blob.size })
    } catch (err) { setError('Failed to create form.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setResult(null); setError(null); setProgress(0) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6 space-y-4">
      <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Form Title</label>
        <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="input-field" placeholder="Enter form title" /></div>
      <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900 dark:text-white">Form Fields</h3><button onClick={addField} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700"><Plus className="w-4 h-4" />Add Field</button></div>
      <div className="space-y-2">
        {fields.map((field, i) => (
          <div key={i} className="flex gap-2 items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <input type="text" value={field.label} onChange={e => updateField(i, 'label', e.target.value)} className="input-field flex-1" placeholder="Field label" />
            <select value={field.type} onChange={e => updateField(i, 'type', e.target.value)} className="input-field w-28"><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option></select>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={field.required} onChange={e => updateField(i, 'required', e.target.checked)} className="rounded" />Req</label>
            <button onClick={() => removeField(i)} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Creating form..." /></div>}
    <button onClick={handleProcess} disabled={processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Create PDF Form'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">PDF Forms</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
