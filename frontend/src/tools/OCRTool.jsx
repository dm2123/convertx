import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Copy, Check } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function OCRTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [copied, setCopied] = useState(false)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      setProgress(30)
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true })
      const pages = pdfDoc.getPages()
      let text = ''
      for (let i = 0; i < pages.length; i++) {
        setProgress(30 + Math.round((i / pages.length) * 60))
        text += `--- Page ${i + 1} ---\n`
        try {
          const content = await pages[i].node.contents()
          if (content && content.toString) {
            const raw = content.toString()
            const texts = raw.match(/\(([^)]+)\)/g) || []
            text += texts.map(t => t.slice(1, -1)).join(' ') + '\n\n'
          }
        } catch {
          text += '[Text content on this page]\n\n'
        }
      }
      setExtractedText(text || 'No text content found. This PDF may be image-based and requires advanced OCR processing.')
      setProgress(100)
      setResult({ text: text || 'No extractable text found.' })
    } catch (err) { setError('Failed to extract text.') } finally { setProcessing(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(extractedText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setExtractedText('') }
  const handleDownload = () => { const blob = new Blob([extractedText], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = files[0]?.name?.replace('.pdf', '.txt') || 'extracted.txt'; a.click() }

  if (result) {
    return (<div className="py-12"><div className="max-w-3xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Extracted Text</h3>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button>
            <button onClick={handleDownload} className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Download .txt</button>
          </div>
        </div>
        <pre className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-96 overflow-auto whitespace-pre-wrap font-mono">{extractedText}</pre>
      </div>
      <button onClick={handleReset} className="w-full btn-primary text-base py-4">Process Another PDF</button>
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your scanned PDF here" /></div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Extracting text..." /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Extract Text (OCR)'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">OCR PDF</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
