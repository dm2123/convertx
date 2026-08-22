import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Undo2, Download } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default function SignPDFTool({ tool }) {
  const canvasRef = useRef(null)
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [sigColor, setSigColor] = useState('#000000')
  const [sigThickness, setSigThickness] = useState(3)
  const [sigName, setSigName] = useState('')
  const [sigMode, setSigMode] = useState('draw')

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => { e.preventDefault(); setDrawing(true); const ctx = canvasRef.current.getContext('2d'); const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.strokeStyle = sigColor; ctx.lineWidth = sigThickness }
  const draw = (e) => { e.preventDefault(); if (!drawing) return; const ctx = canvasRef.current.getContext('2d'); const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); setHasSignature(true) }
  const endDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF.'); return }
    if (sigMode === 'draw' && !hasSignature) { setError('Draw your signature first.'); return }
    if (sigMode === 'type' && !sigName.trim()) { setError('Type your name for signature.'); return }
    setProcessing(true); setError(null)
    try {
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const pages = pdfDoc.getPages()
      const lastPage = pages[pages.length - 1]
      const { width, height } = lastPage.getSize()
      if (sigMode === 'draw') {
        const canvas = canvasRef.current
        const pngDataUrl = canvas.toDataURL('image/png')
        const pngBytes = Uint8Array.from(atob(pngDataUrl.split(',')[1]), c => c.charCodeAt(0))
        const sigImage = await pdfDoc.embedPng(pngBytes)
        lastPage.drawImage(sigImage, { x: width - 200, y: 60, width: 150, height: 50 })
      } else {
        lastPage.drawText(sigName, { x: width - 200, y: 70, size: 16, font, color: rgb(0, 0, 0) })
        lastPage.drawLine({ start: { x: width - 200, y: 65 }, end: { x: width - 50, y: 65 }, thickness: 1, color: rgb(0, 0, 0) })
        lastPage.drawText('Signature', { x: width - 200, y: 52, size: 8, font, color: rgb(0.5, 0.5, 0.5) })
      }
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), fileName: `signed_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to sign PDF.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); clearCanvas(); setSigName('') }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <div className="card p-6 mb-6 text-center"><div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Download className="w-8 h-8 text-green-600" /></div><h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">PDF Signed Successfully!</h3><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{result.fileName} ({(result.size / 1024).toFixed(1)} KB)</p><button onClick={handleDownload} className="btn-primary px-6 py-3">Download Signed PDF</button></div>
      <button onClick={handleReset} className="w-full btn-primary text-base py-4">Sign Another PDF</button>
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF to sign" /></div>
    <div className="card p-6 mb-6">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSigMode('draw')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${sigMode === 'draw' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Draw Signature</button>
        <button onClick={() => setSigMode('type')} className={`flex-1 py-2 rounded-lg font-medium text-sm ${sigMode === 'type' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Type Signature</button>
      </div>
      {sigMode === 'draw' ? (<div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label><input type="color" value={sigColor} onChange={e => setSigColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" /></div>
          <div className="flex items-center gap-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thickness:</label><input type="range" min="1" max="8" value={sigThickness} onChange={e => setSigThickness(parseInt(e.target.value))} className="w-24" /></div>
          <button onClick={clearCanvas} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Undo2 className="w-4 h-4" />Clear</button>
        </div>
        <canvas ref={canvasRef} width={400} height={120} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair bg-white touch-none" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
        <p className="text-xs text-gray-400 mt-2">Draw your signature in the box above</p>
      </div>) : (<div>
        <input type="text" value={sigName} onChange={e => setSigName(e.target.value)} className="input-field text-2xl font-serif italic" placeholder="Type your name..." style={{ fontFamily: 'Georgia, serif' }} />
        <p className="text-xs text-gray-400 mt-2">Your name will be rendered as a signature</p>
      </div>)}
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Signing...' : 'Sign PDF'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">Sign PDF</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
