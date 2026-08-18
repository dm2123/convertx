import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, BookOpen, ChevronLeft, ChevronRightIcon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export default function PdfReaderTool({ tool }) {
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1.5)
  const [fileName, setFileName] = useState('')
  const canvasRef = useRef(null)
  const renderingRef = useRef(false)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const renderPage = useCallback(async (pdf, pageNum, scale) => {
    if (renderingRef.current) return
    renderingRef.current = true

    try {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      await page.render({ canvasContext: ctx, viewport }).promise
    } catch (err) {
      console.error('Failed to render page:', err)
    } finally {
      renderingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= totalPages) {
      renderPage(pdfDoc, currentPage, zoom)
    }
  }, [pdfDoc, currentPage, totalPages, zoom, renderPage])

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles)
    setPdfDoc(null)
    setCurrentPage(1)
    setTotalPages(0)
    setZoom(1.5)
    setError(null)
    setFileName('')

    if (newFiles.length > 0) {
      setLoading(true)
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setFileName(newFiles[0].name)
      } catch (err) {
        setError('Failed to load PDF. The file may be corrupted or password-protected.')
      } finally {
        setLoading(false)
      }
    }
  }

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(p)
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const resetZoom = () => setZoom(1.5)

  const handleReset = () => {
    setFiles([])
    setPdfDoc(null)
    setCurrentPage(1)
    setTotalPages(0)
    setZoom(1.5)
    setError(null)
    setFileName('')
  }

  if (pdfDoc) {
    return (
      <div className="py-12"><div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Breadcrumb tool={tool} />
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tool.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{fileName}</p>
        </div>

        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-1.5 text-sm">
                <input type="number" min="1" max={totalPages} value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="w-14 px-2 py-1 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                <span className="text-gray-500 dark:text-gray-400">/ {totalPages}</span>
              </div>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRightIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={zoomOut} disabled={zoom <= 0.5}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-14 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} disabled={zoom >= 4}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button onClick={resetZoom}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <button onClick={handleReset}
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
              Open Different File
            </button>
          </div>
        </div>

        {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-4"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}

        <div className="card p-4 overflow-auto flex justify-center" style={{ maxHeight: '70vh' }}>
          <canvas ref={canvasRef} className="shadow-lg rounded-lg max-w-full" />
        </div>

        <FaqSection />
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
        <FileUploader accept=".pdf" onFilesChange={handleFilesChange} label="Drag & Drop your PDF here" />
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">PDF Reader</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View your PDF documents directly in the browser. Navigate between pages, zoom in and out, and read your content without any downloads.</p>
          </div>
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {loading && <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl mb-6"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><p className="text-sm text-blue-600 dark:text-blue-400">Loading PDF...</p></div>}

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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What PDF features are supported?</h3><p className="text-sm text-gray-600 dark:text-gray-400">The reader renders text, images, and basic graphics. Complex interactive elements like forms and multimedia may not be fully supported.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. The PDF is rendered entirely in your browser using pdf.js. Your file never leaves your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I print from the reader?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. You can use your browser's print function (Ctrl+P / Cmd+P) to print the rendered page.</p></div>
    </div>
  )
}
