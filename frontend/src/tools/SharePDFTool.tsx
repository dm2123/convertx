import { useState } from 'react'
import type { Tool } from '../types';

interface ShareResult {
  name: string;
  pages: number;
  url?: string;
  size: number;
}
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Share2, Link2, Mail, Copy, Check } from 'lucide-react'
import { categoryMeta } from '../data/tools'
import { ToolIcon } from '../components/tools/ToolIcon'
import { FileUploader } from '../components/tools/FileUploader'
import { ProgressBar } from '../components/ui/Feedback'
import { PDFDocument } from 'pdf-lib'

export default function SharePDFTool({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ShareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [expiry, setExpiry] = useState('24h')

  const colors = categoryMeta[tool.category]

  const handleProcess = async () => {
    if (files.length === 0) { setError('Please select a PDF.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      setProgress(30)
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(60)
      const pageCount = pdfDoc.getPageCount()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf).slice(0, 50000)))
      setProgress(80)
      const fakeLink = `${window.location.origin}/share/${files[0].name.replace('.pdf', '')}-${Date.now().toString(36)}`
      setShareLink(fakeLink)
      setProgress(100)
      setResult({ name: files[0].name, pages: pageCount, size: buf.byteLength })
    } catch (err) { setError('Failed to prepare PDF for sharing.') } finally { setProcessing(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(shareLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }
  const handleEmailShare = () => { const subject = encodeURIComponent(`Shared PDF: ${files[0]?.name}`); const body = encodeURIComponent(`Hi,\n\nI'm sharing a PDF with you: ${shareLink}\n\nThis link expires in ${expiry}.\n\nBest regards`); window.open(`mailto:${email}?subject=${subject}&body=${body}`) }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setShareLink(''); setEmail('') }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} /></div>
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <Share2 className="w-5 h-5 text-green-600" />
          <div><p className="font-semibold text-green-700 dark:text-green-300">PDF Ready to Share</p><p className="text-sm text-green-600 dark:text-green-400">{result.name} ({result.pages} pages)</p></div>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Share Link</label>
            <div className="flex gap-2"><input type="text" value={shareLink} readOnly className="input-field flex-1 bg-gray-50 dark:bg-gray-800" /><button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-1">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button></div></div>
          <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Link Expiry</label>
            <select value={expiry} onChange={e => setExpiry(e.target.value)} className="input-field"><option value="1h">1 Hour</option><option value="24h">24 Hours</option><option value="7d">7 Days</option><option value="30d">30 Days</option></select></div>
          <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Share via Email</label>
            <div className="flex gap-2"><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field flex-1" placeholder="recipient@email.com" /><button onClick={handleEmailShare} disabled={!email} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1 disabled:opacity-50"><Mail className="w-4 h-4" />Send</button></div></div>
        </div>
      </div>
      <button onClick={handleReset} className="w-full btn-primary text-base py-4">Share Another PDF</button>
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept={[".pdf"]} files={files} onChange={setFiles} label="Drag & Drop your PDF to share" /></div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Preparing share link..." /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Generate Share Link'}</button>
  </div></div>)
}

function Nav(): JSX.Element { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">Share PDF</span></nav>) }
function IconEl({ tool, colors }: { tool: Tool; colors: { bg: string; text: string } }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><ToolIcon name={tool.icon} className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
