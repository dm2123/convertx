import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Lock } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import { PDFDocument } from 'pdf-lib'

export default function PdfProtectTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleProcess = async () => {
    if (!password) { setError('Please enter a password.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return }
    if (files.length === 0) { setError('Please select a PDF file.'); return }

    setProcessing(true); setError(null); setProgress(0)
    try {
      setStatus('Reading PDF...')
      setProgress(20)
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      setProgress(50)
      setStatus('Applying password protection...')
      const passwordBytes = new TextEncoder().encode(password)
      const protectedBytes = await pdfDoc.save({
        userPassword: password,
      })
      setProgress(80)
      setStatus('Finalizing...')
      const blob = new Blob([protectedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setProgress(100)
      setResult({ url, fileName: `protected_${files[0].name}`, size: blob.size })
    } catch (err) { setError('Failed to protect PDF. Please try again.') } finally { setProcessing(false) }
  }

  const handleDownload = () => { if (!result) return; const a = document.createElement('a'); a.href = result.url; a.download = result.fileName; a.click() }
  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); setPassword(''); setConfirmPassword('') }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Breadcrumb tool={tool} />
      <div className="text-center mb-8"><ToolIcon tool={tool} colors={colors} Icon={Icon} /></div>
      <ResultCard fileName={result.fileName} fileSize={result.size} onDownload={handleDownload} onReset={handleReset} />
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Breadcrumb tool={tool} />
    <div className="text-center mb-8"><ToolIcon tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF here" /></div>
    <div className="card p-6 mb-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="input-field pl-10" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="input-field pl-10" />
        </div>
      </div>
      {password && confirmPassword && password !== confirmPassword && (
        <p className="text-sm text-red-500">Passwords do not match.</p>
      )}
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status={status} /></div>}
    <button onClick={handleProcess} disabled={files.length === 0 || processing || !password || password !== confirmPassword}
      className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
      {processing ? 'Protecting...' : 'Protect PDF'}
    </button>
    <div className="mt-12 space-y-6"><h2 className="text-xl font-bold text-gray-900 dark:text-white">FAQ</h2>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">How does PDF protection work?</h3><p className="text-sm text-gray-600 dark:text-gray-400">A password is added to the PDF that is required to open the document. This uses standard PDF encryption.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I remove the password later?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Yes, use our Unlock PDF tool to remove the password if you know it.</p></div>
    </div>
  </div></div>)
}

function Breadcrumb({ tool }) {
  return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">{tool.name}</span></nav>)
}

function ToolIcon({ tool, colors, Icon }) {
  return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>)
}
