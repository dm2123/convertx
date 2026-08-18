import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Image, X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89, label: 'A4 (210 x 297 mm)' },
  Letter: { width: 612, height: 792, label: 'Letter (8.5 x 11 in)' },
  Fit: { width: 0, height: 0, label: 'Fit to Image' },
}

export default function ImageToPdfTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [pageSize, setPageSize] = useState('A4')
  const [previews, setPreviews] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const addFiles = (newFiles) => {
    setError(null)
    const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
    if (arr.length === 0) { setError('Please select JPG or PNG image files.'); return }

    const updated = [...files, ...arr]
    setFiles(updated)

    arr.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, { name: file.name, size: file.size, dataUrl: e.target.result, type: file.type }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const moveUp = (index) => {
    if (index === 0) return
    const newFiles = [...files]
    ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
    setFiles(newFiles)
    const newPreviews = [...previews]
    ;[newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]]
    setPreviews(newPreviews)
  }

  const moveDown = (index) => {
    if (index === files.length - 1) return
    const newFiles = [...files]
    ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
    setFiles(newFiles)
    const newPreviews = [...previews]
    ;[newPreviews[index], newPreviews[index + 1]] = [newPreviews[index + 1], newPreviews[index]]
    setPreviews(newPreviews)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select at least one image file.'); return }
    setProcessing(true); setError(null); setProgress(0)

    try {
      const pdfDoc = await PDFDocument.create()

      for (let i = 0; i < files.length; i++) {
        setStatus(`Processing image ${i + 1} of ${files.length}...`)
        setProgress(Math.round(((i + 1) / files.length) * 85))

        const file = files[i]
        const arrayBuffer = await file.arrayBuffer()

        let image
        if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer)
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer)
        }

        const imgWidth = image.width
        const imgHeight = image.height

        let pageWidth, pageHeight

        if (pageSize === 'Fit') {
          pageWidth = imgWidth
          pageHeight = imgHeight
        } else {
          const size = PAGE_SIZES[pageSize]
          pageWidth = size.width
          pageHeight = size.height
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight])

        let drawWidth, drawHeight, drawX, drawY

        if (pageSize === 'Fit') {
          drawWidth = imgWidth
          drawHeight = imgHeight
          drawX = 0
          drawY = 0
        } else {
          const scaleX = pageWidth / imgWidth
          const scaleY = pageHeight / imgHeight
          const scale = Math.min(scaleX, scaleY)
          drawWidth = imgWidth * scale
          drawHeight = imgHeight * scale
          drawX = (pageWidth - drawWidth) / 2
          drawY = (pageHeight - drawHeight) / 2
        }

        page.drawImage(image, { x: drawX, y: drawY, width: drawWidth, height: drawHeight })
      }

      setStatus('Saving PDF...')
      setProgress(90)

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true })
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setStatus('Complete!')
      setResult({ url, fileName: 'images.pdf', size: blob.size })
    } catch (err) {
      setError('Failed to create PDF. Please ensure all files are valid images.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click()
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setPreviews([]) }

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
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple
            onChange={(e) => addFiles(e.target.files)} className="hidden" />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
              dragOver ? 'bg-brand-100 dark:bg-brand-900/50' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Image className={`w-6 h-6 transition-colors ${dragOver ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">Drag &amp; Drop your images here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">or <span className="text-brand-600 dark:text-brand-400 font-medium">Browse Files</span></p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Accepted: JPG, PNG &middot; Max: 50 MB per file</p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{files.length} image{files.length !== 1 ? 's' : ''} selected</p>
          </div>
          <div className="space-y-2">
            {previews.map((preview, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <img src={preview.dataUrl} alt={preview.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{preview.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(preview.size)}</p>
                </div>
                <button onClick={() => moveUp(i)} disabled={i === 0}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUp className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => moveDown(i)} disabled={i === files.length - 1}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDown className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => removeFile(i)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Page Size</label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(PAGE_SIZES).map(([key, val]) => (
            <button key={key} onClick={() => setPageSize(key)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${pageSize === key ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{key === 'Fit' ? 'Fit to Image' : key}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{val.label}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Creating PDF...' : 'Convert to PDF'}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What image formats are supported?</h3><p className="text-sm text-gray-600 dark:text-gray-400">JPG (JPEG) and PNG images are supported. Images are embedded at their original quality into the PDF.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What does "Fit to Image" do?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Each PDF page will match the exact dimensions of the image. This is ideal when you want the image to fill the page without any cropping or scaling.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files never leave your device.</p></div>
    </div>
  )
}
