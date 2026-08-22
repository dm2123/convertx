import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

export default function HwpToPdfTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select an HWP file.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      setProgress(30)
      const bytes = new Uint8Array(buf)
      let text = ''
      for (let i = 0; i < bytes.length - 1; i++) {
        if (bytes[i] >= 0x20 && bytes[i] < 0x7F) { text += String.fromCharCode(bytes[i]) }
        else if (bytes[i] > 0x7F) {
          const char = String.fromCharCode((bytes[i] << 8) | bytes[i + 1])
          if (char.length === 1 && char !== '\0') text += char
          i++
        }
      }
      setProgress(60)
      if (!text.trim()) { setError('Could not extract text from this HWP file. Please convert to DOCX first using Hancom Office.'); setProcessing(false); return }
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const lines = text.split('\n').filter(l => l.trim())
      let page = pdfDoc.addPage(PageSizes.A4)
      let yPos = page.getSize().height - 50
      for (const line of lines) {
        if (yPos < 50) { page = pdfDoc.addPage(PageSizes.A4); yPos = page.getSize().height - 50 }
        page.drawText(line.substring(0, 90), { x: 50, y: yPos, size: 10, font, color: rgb(0, 0, 0) })
        yPos -= 14
      }
      setProgress(90)
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setProgress(100)
      setResult({ url: URL.createObjectURL(blob), fileName: files[0].name.replace('.hwp', '.pdf'), size: blob.size })
    } catch { setError('Failed to convert HWP file. Try converting to DOCX first.') } finally { setProcessing(false) }
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
    <div className="card p-6 mb-6"><FileUploader accept=".hwp" onFilesChange={setFiles} label="Drag & Drop your HWP file here" /></div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Converting HWP to PDF..." /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Convert HWP to PDF'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">HWP to PDF</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
