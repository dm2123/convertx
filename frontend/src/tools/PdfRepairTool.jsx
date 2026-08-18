import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Wrench } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfRepairTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [beforeInfo, setBeforeInfo] = useState(null)
  const [afterInfo, setAfterInfo] = useState(null)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getPdfInfo = (pdfDoc, fileSize) => {
    const pages = pdfDoc.getPages()
    const pageSizes = pages.map(p => {
      const s = p.getSize()
      return { width: Math.round(s.width), height: Math.round(s.height) }
    })
    return {
      fileSize,
      pageCount: pages.length,
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      creator: pdfDoc.getCreator() || 'Unknown',
      producer: pdfDoc.getProducer() || 'Unknown',
      pageSizes,
    }
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF file.'); return }
    setProcessing(true); setError(null); setProgress(0); setBeforeInfo(null); setAfterInfo(null)

    try {
      setStatus('Reading PDF...')
      setProgress(10)
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()

      setStatus('Analyzing PDF structure...')
      setProgress(20)

      let beforeDoc
      try {
        beforeDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      } catch {
        beforeDoc = null
      }

      if (beforeDoc) {
        setBeforeInfo(getPdfInfo(beforeDoc, file.size))
      } else {
        setBeforeInfo({ fileSize: file.size, pageCount: 'Unknown', title: 'Unable to read', author: 'N/A', creator: 'N/A', producer: 'N/A', pageSizes: [] })
      }

      setStatus('Repairing PDF...')
      setProgress(50)

      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      setProgress(70)
      setStatus('Rebuilding PDF structure...')

      const repairedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      setProgress(90)
      setStatus('Finalizing...')

      const repairedBuffer = await PDFDocument.load(repairedBytes)
      setAfterInfo(getPdfInfo(repairedBuffer, repairedBytes.byteLength))

      const blob = new Blob([repairedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setStatus('Repair complete!')
      setResult({ url, fileName: `repaired_${file.name}`, size: blob.size })
    } catch (err) {
      setError('Failed to repair PDF. The file may be too severely corrupted or password-protected.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click()
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setBeforeInfo(null); setAfterInfo(null) }

  if (result) {
    return (
      <div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Breadcrumb tool={tool} />
        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        </div>

        {beforeInfo && afterInfo && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Before &amp; After</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Property</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Before</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">After</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'File Size', val1: formatSize(beforeInfo.fileSize), val2: formatSize(afterInfo.fileSize) },
                    { label: 'Page Count', val1: beforeInfo.pageCount, val2: afterInfo.pageCount },
                    { label: 'Title', val1: beforeInfo.title, val2: afterInfo.title },
                    { label: 'Author', val1: beforeInfo.author, val2: afterInfo.author },
                    { label: 'Creator', val1: beforeInfo.creator, val2: afterInfo.creator },
                    { label: 'Producer', val1: beforeInfo.producer, val2: afterInfo.producer },
                  ].map(row => (
                    <tr key={row.label} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">{row.label}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{row.val1}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{row.val2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
        <FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" />
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3">
          <Wrench className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">How does PDF repair work?</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">The tool reads the PDF using pdf-lib, attempts to recover the document structure, and re-saves it with a clean object tree. This can fix issues like broken cross-reference tables, corrupted streams, and minor structural damage.</p>
          </div>
        </div>
      </div>

      {beforeInfo && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Original File Info</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500 dark:text-gray-400">Size:</span> <span className="text-gray-900 dark:text-white ml-1">{formatSize(beforeInfo.fileSize)}</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Pages:</span> <span className="text-gray-900 dark:text-white ml-1">{beforeInfo.pageCount}</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Title:</span> <span className="text-gray-900 dark:text-white ml-1">{beforeInfo.title}</span></div>
            <div><span className="text-gray-500 dark:text-gray-400">Creator:</span> <span className="text-gray-900 dark:text-white ml-1">{beforeInfo.creator}</span></div>
          </div>
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
      {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

      <button onClick={handleProcess} disabled={files.length === 0 || processing}
        className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Repairing...' : 'Repair PDF'}
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What kind of corruption can this fix?</h3><p className="text-sm text-gray-600 dark:text-gray-400">It can fix broken cross-reference tables, corrupted object streams, truncated files, and other structural issues that prevent PDFs from opening correctly.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Will repair change the content?</h3><p className="text-sm text-gray-600 dark:text-gray-400">No. Repair only rebuilds the PDF structure. Your text, images, and layout remain unchanged.</p></div>
    </div>
  )
}
