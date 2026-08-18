import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Image, Download, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export default function PdfToImageTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [previews, setPreviews] = useState([])
  const [scale] = useState(2)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const renderPages = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const totalPages = pdf.numPages
    const rendered = []

    for (let i = 1; i <= totalPages; i++) {
      setStatus(`Rendering page ${i} of ${totalPages}...`)
      setProgress(Math.round((i / totalPages) * 80))

      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')

      await page.render({ canvasContext: ctx, viewport }).promise

      const dataUrl = canvas.toDataURL('image/png')
      rendered.push({ pageNumber: i, dataUrl, width: viewport.width, height: viewport.height })
    }

    return rendered
  }, [scale])

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    setProcessing(true); setError(null); setProgress(0); setPreviews([])

    try {
      setStatus('Loading PDF...')
      setProgress(5)
      const file = files[0]
      const rendered = await renderPages(file)

      setProgress(90)
      setStatus('Finalizing...')

      setProgress(100)
      setStatus('Complete!')
      setPreviews(rendered)
      setResult({ fileName: file.name, pageCount: rendered.length })
    } catch (err) {
      setError('Failed to convert PDF to images. The file may be corrupted or password-protected.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadImage = (preview) => {
    const a = document.createElement('a')
    a.href = preview.dataUrl
    a.download = `${result.fileName.replace('.pdf', '')}_page_${preview.pageNumber}.png`
    a.click()
  }

  const downloadAll = () => {
    previews.forEach((preview) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = preview.dataUrl
        a.download = `${result.fileName.replace('.pdf', '')}_page_${preview.pageNumber}.png`
        a.click()
      }, 100 * preview.pageNumber)
    })
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setPreviews([]) }

  if (result) {
    return (
      <div className="py-12"><div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Breadcrumb tool={tool} />
        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{result.pageCount} page{result.pageCount !== 1 ? 's' : ''} converted</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button onClick={downloadAll} className="flex-1 flex items-center justify-center gap-2 btn-primary">
            <Download className="w-4 h-4" />
            Download All as PNG
          </button>
          <button onClick={handleReset} className="flex items-center justify-center gap-2 btn-secondary !px-4">
            Convert Another
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((preview) => (
            <div key={preview.pageNumber} className="card overflow-hidden group">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 flex items-center justify-center" style={{ minHeight: '200px' }}>
                <img src={preview.dataUrl} alt={`Page ${preview.pageNumber}`}
                  className="max-w-full max-h-64 object-contain rounded shadow-sm" />
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Page {preview.pageNumber}</span>
                <button onClick={() => downloadImage(preview)}
                  className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
                  <Download className="w-4 h-4" /> PNG
                </button>
              </div>
            </div>
          ))}
        </div>
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
        <FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" />
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3">
          <Image className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">How does PDF to image conversion work?</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Each PDF page is rendered to a canvas element using pdf.js, then exported as a high-resolution PNG image. You can download individual pages or all at once.</p>
          </div>
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Converting...' : 'Convert to Images'}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What image format is used?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Pages are exported as high-resolution PNG images at 2x scale for crisp, clear output.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser using pdf.js. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Why is it slow for large PDFs?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Rendering each page to a canvas at high resolution takes processing power. Large PDFs with many pages may take a moment.</p></div>
    </div>
  )
}
