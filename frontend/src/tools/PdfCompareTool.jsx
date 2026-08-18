import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import { PDFDocument } from 'pdf-lib'

export default function PdfCompareTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleProcess = async () => {
    if (files.length < 2) { setError('Please select 2 PDF files to compare.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      setStatus('Loading first PDF...')
      setProgress(10)
      const buf1 = await files[0].arrayBuffer()
      const pdfDoc1 = await PDFDocument.load(buf1)
      setProgress(30)
      setStatus('Loading second PDF...')
      const buf2 = await files[1].arrayBuffer()
      const pdfDoc2 = await PDFDocument.load(buf2)
      setProgress(60)
      setStatus('Comparing...')
      const pages1 = pdfDoc1.getPages()
      const pages2 = pdfDoc2.getPages()
      const meta1 = pdfDoc1.getTitle() || 'Untitled'
      const meta2 = pdfDoc2.getTitle() || 'Untitled'
      const author1 = pdfDoc1.getAuthor() || 'Unknown'
      const author2 = pdfDoc2.getAuthor() || 'Unknown'
      const subject1 = pdfDoc1.getSubject() || ''
      const subject2 = pdfDoc2.getSubject() || ''
      const creator1 = pdfDoc1.getCreator() || ''
      const creator2 = pdfDoc2.getCreator() || ''
      const producer1 = pdfDoc1.getProducer() || ''
      const producer2 = pdfDoc2.getProducer() || ''
      const pageSizes1 = pages1.map(p => { const s = p.getSize(); return `${Math.round(s.width)}x${Math.round(s.height)}` })
      const pageSizes2 = pages2.map(p => { const s = p.getSize(); return `${Math.round(s.width)}x${s.height}` })
      setProgress(80)
      setStatus('Finalizing comparison...')
      const comparison = {
        file1: { name: files[0].name, size: files[0].size, pageCount: pages1.length, title: meta1, author: author1, subject: subject1, creator: creator1, producer: producer1, pageSizes: pageSizes1 },
        file2: { name: files[1].name, size: files[1].size, pageCount: pages2.length, title: meta2, author: author2, subject: subject2, creator: creator2, producer: producer2, pageSizes: pageSizes2 },
      }
      setProgress(100)
      setResult(comparison)
    } catch (err) { setError('Failed to compare PDFs. Please ensure both files are valid PDFs.') } finally { setProcessing(false) }
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0) }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const DiffBadge = ({ val1, val2 }) => {
    if (val1 === val2) return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Same</span>
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Different</span>
  }

  if (result) {
    const { file1, file2 } = result
    return (<div className="py-12"><div className="max-w-3xl mx-auto px-4 sm:px-6">
      <Breadcrumb tool={tool} />
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comparison Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Property</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">{file1.name}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">{file2.name}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'File Size', val1: formatSize(file1.size), val2: formatSize(file2.size), same: file1.size === file2.size },
                { label: 'Page Count', val1: file1.pageCount, val2: file2.pageCount, same: file1.pageCount === file2.pageCount },
                { label: 'Title', val1: file1.title || '—', val2: file2.title || '—', same: file1.title === file2.title },
                { label: 'Author', val1: file1.author || '—', val2: file2.author || '—', same: file1.author === file2.author },
                { label: 'Subject', val1: file1.subject || '—', val2: file2.subject || '—', same: file1.subject === file2.subject },
                { label: 'Creator', val1: file1.creator || '—', val2: file2.creator || '—', same: file1.creator === file2.creator },
                { label: 'Producer', val1: file1.producer || '—', val2: file2.producer || '—', same: file1.producer === file2.producer },
              ].map(row => (
                <tr key={row.label} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">{row.label}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{row.val1}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{row.val2}</td>
                  <td className="py-3 px-4 text-center"><DiffBadge val1={row.val1} val2={row.val2} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={handleReset}
        className="w-full btn-primary text-base py-4">
        Compare Another Pair
      </button>

      <FaqSection />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Breadcrumb tool={tool} />
    <div className="text-center mb-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
      <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
    </div>

    <div className="card p-6 mb-6">
      <FileUploader accept=".pdf" multiple onFilesChange={setFiles} label="Drag & Drop 2 PDF files here" />
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.slice(0, 2).map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-xs font-mono text-gray-400 w-6">{i + 1}.</span>
              <p className="flex-1 text-sm text-gray-900 dark:text-white truncate">{f.name}</p>
              <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>

    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}

    <button onClick={handleProcess} disabled={files.length < 2 || processing}
      className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
      {processing ? 'Comparing...' : 'Compare PDFs'}
    </button>

    <FaqSection />
  </div></div>)
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
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What does PDF comparison check?</h3><p className="text-sm text-gray-600 dark:text-gray-400">The tool compares page count, file size, title, author, subject, creator, and producer metadata between two PDF files.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes. All processing happens directly in your browser. Your files never leave your device.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Does it compare visual content?</h3><p className="text-sm text-gray-600 dark:text-gray-400">No. This tool compares metadata and basic properties. It does not perform visual or pixel-level comparison of page content.</p></div>
    </div>
  )
}
