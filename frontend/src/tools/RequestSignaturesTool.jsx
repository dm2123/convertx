import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Copy, Check, Mail, Link2 } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'

export default function RequestSignaturesTool({ tool }) {
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [docName, setDocName] = useState('')
  const [message, setMessage] = useState('Please sign the attached document.')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const handleCreate = () => {
    if (!signerName.trim() || !signerEmail.trim() || !docName.trim()) { setError('Please fill all required fields.'); return }
    const link = `${window.location.origin}/sign-pdf?req=${btoa(JSON.stringify({ from: 'User', to: signerName, doc: docName, ts: Date.now() }))}`
    setResult({ link, signerName, signerEmail, docName })
    setError(null)
  }

  const handleCopy = () => { navigator.clipboard.writeText(result.link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }
  const handleEmail = () => { const s = encodeURIComponent(`Signature Request: ${result.docName}`); const b = encodeURIComponent(`Hi ${result.signerName},\n\nYou have been requested to sign "${result.docName}".\n\nPlease sign here: ${result.link}\n\n${message}`); window.open(`mailto:${result.signerEmail}?subject=${s}&body=${b}`) }
  const handleReset = () => { setSignerName(''); setSignerEmail(''); setDocName(''); setMessage('Please sign the attached document.'); setResult(null); setError(null) }

  if (result) {
    return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <div className="card p-6 mb-6">
        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg mb-4">
          <p className="font-semibold text-green-700 dark:text-green-300">Signature Request Created!</p>
          <p className="text-sm text-green-600 dark:text-green-400">For {result.signerName} ({result.signerEmail})</p>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Signature Link</label>
            <div className="flex gap-2"><input type="text" value={result.link} readOnly className="input-field flex-1 bg-gray-50 dark:bg-gray-800 text-sm" /><button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-1">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button></div></div>
          <button onClick={handleEmail} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"><Mail className="w-4 h-4" />Send via Email</button>
        </div>
      </div>
      <button onClick={handleReset} className="w-full btn-primary text-base py-4">Create Another Request</button>
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6 space-y-4">
      <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Signer Name *</label><input type="text" value={signerName} onChange={e => setSignerName(e.target.value)} className="input-field" placeholder="John Doe" /></div>
      <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Signer Email *</label><input type="email" value={signerEmail} onChange={e => setSignerEmail(e.target.value)} className="input-field" placeholder="john@example.com" /></div>
      <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Document Name *</label><input type="text" value={docName} onChange={e => setDocName(e.target.value)} className="input-field" placeholder="Contract 2026" /></div>
      <div><label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Message</label><textarea value={message} onChange={e => setMessage(e.target.value)} className="input-field" rows={3} /></div>
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    <button onClick={handleCreate} className="w-full btn-primary text-base py-4">Create Signature Request</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">Request Signatures</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
