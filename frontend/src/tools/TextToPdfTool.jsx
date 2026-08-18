import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Type, AlignLeft } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89, label: 'A4 (210 x 297 mm)' },
  Letter: { width: 612, height: 792, label: 'Letter (8.5 x 11 in)' },
  Legal: { width: 612, height: 1008, label: 'Legal (8.5 x 14 in)' },
}

export default function TextToPdfTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fontSize, setFontSize] = useState(12)
  const [pageSize, setPageSize] = useState('A4')
  const [margins, setMargins] = useState(50)
  const [textPreview, setTextPreview] = useState('')

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles)
    setError(null)
    setTextPreview('')
    if (newFiles.length > 0) {
      try {
        const text = await newFiles[0].text()
        setTextPreview(text.substring(0, 1500))
      } catch {
        setTextPreview('Unable to preview file content.')
      }
    }
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a .txt file.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      setStatus('Reading text file...')
      setProgress(10)
      const text = await files[0].text()

      setStatus('Creating PDF...')
      setProgress(40)

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont('Helvetica')
      const boldFont = await pdfDoc.embedFont('Helvetica-Bold')

      const size = PAGE_SIZES[pageSize]
      const pageWidth = size.width
      const pageHeight = size.height
      const effectiveWidth = pageWidth - margins * 2
      const effectiveHeight = pageHeight - margins * 2

      const lines = []
      const paragraphs = text.split('\n')

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === '') {
          lines.push('')
          continue
        }
        let remaining = paragraph
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

      const lineHeight = fontSize * 1.5
      const linesPerPage = Math.floor(effectiveHeight / lineHeight)
      let pageNum = 0

      setStatus('Laying out pages...')
      setProgress(60)

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

        setProgress(60 + Math.round(((i + linesPerPage) / lines.length) * 30))
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
      setResult({ url, fileName: files[0].name.replace(/\.txt$/i, '') + '.pdf', size: blob.size })
    } catch (err) {
      setError('Failed to convert text to PDF. Please ensure the file is a valid text file.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click()
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setTextPreview('') }

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
        <FileUploader accept=".txt" onFilesChange={handleFilesChange} label="Drag & Drop your text file here" />
      </div>

      {textPreview && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlignLeft className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-semibold text-gray-900 dark:text-white">Text Preview</label>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">{textPreview}{textPreview.length >= 1500 ? '\n\n... (showing first 1500 characters)' : ''}</pre>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
          <Type className="w-4 h-4" /> Settings
        </label>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Font Size: {fontSize}pt</label>
            <input type="range" min="8" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>8pt</span><span>24pt</span></div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Margins: {margins}px</label>
            <input type="range" min="20" max="100" value={margins} onChange={(e) => setMargins(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>20px</span><span>100px</span></div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Page Size</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PAGE_SIZES).map(([key, val]) => (
                <button key={key} onClick={() => setPageSize(key)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${pageSize === key ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{key}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{val.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What text file formats are supported?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Plain text files (.txt) with UTF-8 encoding are supported. The text is rendered using the standard Helvetica font.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All conversion happens directly in your browser using pdf-lib. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change the font style?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Currently only Helvetica is supported. You can adjust the font size, margins, and page size to customize the layout.</p></div>
    </div>
  )
}
