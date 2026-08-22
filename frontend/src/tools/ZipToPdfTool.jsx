import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, File, Image, FileText } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'
import JSZip from 'jszip'

export default function ZipToPdfTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fileList, setFileList] = useState([])
  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleExtract = async () => {
    if (files.length === 0) { setError('Please select a ZIP file.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      setProgress(10)
      const zip = await JSZip.loadAsync(buf)
      const entries = []
      zip.forEach((path, entry) => {
        if (!entry.dir) {
          const ext = path.toLowerCase().split('.').pop()
          if (['jpg','jpeg','png','gif','bmp','webp'].includes(ext) || ['txt','md','csv','json','html','xml','log'].includes(ext)) {
            entries.push({ path, type: ['jpg','jpeg','png','gif','bmp','webp'].includes(ext) ? 'image' : 'text', ext })
          }
        }
      })
      setFileList(entries)
      setProgress(30)

      if (entries.length === 0) { setError('No supported files found in ZIP (images or text).'); setProcessing(false); return }

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      setProgress(50)

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        setProgress(50 + Math.round((i / entries.length) * 40))
        try {
          const data = await zip.file(entry.path).async('uint8array')
          if (entry.type === 'image') {
            try {
              let img
              if (entry.ext === 'png') { img = await pdfDoc.embedPng(data) }
              else if (entry.ext === 'jpg' || entry.ext === 'jpeg') { img = await pdfDoc.embedJpg(data) }
              else {
                const canvas = document.createElement('canvas')
                const blob = new Blob([data])
                const url = URL.createObjectURL(blob)
                const imgEl = await new Promise((resolve, reject) => {
                  const el = new Image(); el.onload = () => resolve(el); el.onerror = reject; el.src = url
                })
                canvas.width = imgEl.width; canvas.height = imgEl.height
                canvas.getContext('2d').drawImage(imgEl, 0, 0)
                URL.revokeObjectURL(url)
                const pngBytes = await new Promise(r => canvas.toBlob(b => b.arrayBuffer().then(r), 'image/png'))
                img = await pdfDoc.embedPng(pngBytes)
              }
              const page = pdfDoc.addPage(PageSizes.A4)
              const { width, height } = page.getSize()
              const scale = Math.min((width - 40) / img.width, (height - 40) / img.height)
              page.drawImage(img, { x: (width - img.width * scale) / 2, y: (height - img.height * scale) / 2, width: img.width * scale, height: img.height * scale })
            } catch {
              const page = pdfDoc.addPage(PageSizes.A4)
              page.drawText(`[Image: ${entry.path}]`, { x: 50, y: page.getSize().height - 50, size: 12, font, color: rgb(0.5, 0.5, 0.5) })
            }
          } else {
            const text = new TextDecoder().decode(data)
            const lines = text.split('\n')
            let page = pdfDoc.addPage(PageSizes.A4)
            let yPos = page.getSize().height - 50
            page.drawText(entry.path, { x: 50, y: yPos, size: 14, font, color: rgb(0.1, 0.1, 0.5) })
            yPos -= 25
            for (const line of lines) {
              if (yPos < 50) { page = pdfDoc.addPage(PageSizes.A4); yPos = page.getSize().height - 50 }
              page.drawText(line.substring(0, 90), { x: 50, y: yPos, size: 10, font, color: rgb(0, 0, 0) })
              yPos -= 14
            }
            yPos -= 15
          }
        } catch {}
      }
      setProgress(95)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setProgress(100)
      setResult({ url: URL.createObjectURL(blob), fileName: files[0].name.replace('.zip', '.pdf'), size: blob.size })
    } catch { setError('Failed to process ZIP file.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setFileList([]) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".zip" onFilesChange={setFiles} label="Drag & Drop your ZIP file here" /></div>
    {fileList.length > 0 && (<div className="card p-4 mb-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Files found: {fileList.length}</h3><div className="flex flex-wrap gap-2">{fileList.slice(0, 20).map((f, i) => (<span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">{f.type === 'image' ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}{f.path.split('/').pop()}</span>))}{fileList.length > 20 && <span className="text-xs text-gray-400">+{fileList.length - 20} more</span>}</div></div>)}
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Converting to PDF..." /></div>}
    <button onClick={handleExtract} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Convert ZIP to PDF'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">ZIP to PDF</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
