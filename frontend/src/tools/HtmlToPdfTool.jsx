import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Code, FileCode, Clipboard, Trash2 } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function HtmlToPdfTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [inputMode, setInputMode] = useState('paste')

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles)
    setError(null)
  }

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  const handleProcess = async () => {
    const hasFile = inputMode === 'upload' && files.length > 0
    const hasText = inputMode === 'paste' && htmlContent.trim().length > 0

    if (!hasFile && !hasText) {
      setError(inputMode === 'paste' ? 'Please enter some HTML content.' : 'Please select an HTML file.')
      return
    }

    setProcessing(true); setError(null); setProgress(0)

    try {
      setStatus('Reading HTML content...')
      setProgress(10)

      let rawText = ''
      if (hasFile) {
        rawText = await files[0].text()
      } else {
        rawText = htmlContent
      }

      setStatus('Extracting text...')
      setProgress(30)
      const plainText = stripHtml(rawText)

      if (plainText.trim().length === 0) {
        setError('No readable text content found in the HTML.')
        setProcessing(false)
        return
      }

      setStatus('Creating PDF...')
      setProgress(50)

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont('Helvetica')
      const boldFont = await PDFDocument.prototype.embedFont
        ? await pdfDoc.embedFont('Helvetica-Bold')
        : font

      const pageWidth = 595.28
      const pageHeight = 841.89
      const margins = 50
      const effectiveWidth = pageWidth - margins * 2
      const fontSize = 11
      const lineHeight = fontSize * 1.5

      const paragraphs = plainText.split('\n')
      const lines = []

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === '') {
          lines.push('')
          continue
        }
        let remaining = paragraph.trim()
        while (remaining.length > 0) {
          let end = remaining.length
          while (end > 0 && font.widthOfTextAtSize(remaining.substring(0, end), fontSize) > effectiveWidth) {
            end--
          }
          if (end === 0) end = 1
          lines.push(remaining.substring(0, end))
          remaining = remaining.substring(end)
        }
      }

      const linesPerPage = Math.floor((pageHeight - margins * 2) / lineHeight)
      let pageNum = 0

      setStatus('Laying out pages...')
      setProgress(70)

      for (let i = 0; i < lines.length; i += linesPerPage) {
        pageNum++
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        const pageLines = lines.slice(i, i + linesPerPage)

        for (let j = 0; j < pageLines.length; j++) {
          if (pageLines[j] === '') continue
          const y = pageHeight - margins - (j + 1) * lineHeight
          page.drawText(pageLines[j], {
            x: margins,
            y,
            size: fontSize,
            font,
            color: { r: 0.1, g: 0.1, b: 0.1 },
          })
        }

        setProgress(70 + Math.round(((i + linesPerPage) / lines.length) * 25))
        setStatus(`Rendering page ${pageNum}...`)
      }

      if (pageNum === 0) {
        pdfDoc.addPage([pageWidth, pageHeight])
      }

      setStatus('Saving PDF...')
      setProgress(95)

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true })
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setStatus('Complete!')

      const baseName = hasFile ? files[0].name.replace(/\.html?$/i, '') : 'converted'
      setResult({ url, fileName: baseName + '.pdf', size: blob.size })
    } catch (err) {
      setError('Failed to convert HTML to PDF. Please check your HTML content.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click()
  }

  const handleReset = () => { setFiles([]); setHtmlContent(''); setResult(null); setError(null); setProgress(0) }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setHtmlContent(text)
    } catch {
      // clipboard access denied
    }
  }

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
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Input Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setInputMode('paste')}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${inputMode === 'paste' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
            <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Paste HTML</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Write or paste code</p>
            </div>
          </button>
          <button onClick={() => setInputMode('upload')}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${inputMode === 'upload' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
            <FileCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Upload File</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select .html file</p>
            </div>
          </button>
        </div>
      </div>

      {inputMode === 'paste' ? (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Code className="w-4 h-4" /> HTML Content
            </label>
            <div className="flex gap-2">
              <button onClick={handlePasteFromClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Clipboard className="w-3.5 h-3.5" /> Paste
              </button>
              <button onClick={() => setHtmlContent('')} disabled={!htmlContent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={htmlContent}
            onChange={(e) => { setHtmlContent(e.target.value); setError(null) }}
            placeholder='<html><head><title>My Page</title></head><body><h1>Hello World</h1><p>This is my content.</p></body></html>'
            rows={12}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-900 dark:text-white font-mono placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          />
          {htmlContent && (
            <p className="mt-2 text-xs text-gray-400">{htmlContent.length.toLocaleString()} characters</p>
          )}
        </div>
      ) : (
        <div className="card p-6 mb-6">
          <FileUploader accept=".html,.htm" onFilesChange={handleFilesChange} label="Drag & Drop your HTML file here" />
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={(inputMode === 'paste' && !htmlContent.trim()) || (inputMode === 'upload' && files.length === 0) || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Converting...' : 'Convert to PDF'}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Will the PDF look exactly like my HTML page?</h3><p className="text-sm text-gray-600 dark:text-gray-400">This tool extracts text content from your HTML and creates a clean PDF. CSS styling, images, and complex layouts are not rendered. For full-fidelity conversion, use a server-based solution.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files and content never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What HTML elements are supported?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Text content from all HTML elements is extracted. Tags are stripped and the text is laid out in a clean, readable PDF format with proper spacing.</p></div>
    </div>
  )
}
