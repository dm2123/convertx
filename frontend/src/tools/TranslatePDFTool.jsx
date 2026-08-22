import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Copy, Check, Download } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' }, { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' }, { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' }, { code: 'bn', name: 'Bengali' },
]

const DICT = {
  hi: { the:'वह', is:'है', and:'और', to:'को', of:'का', in:'में', hello:'नमस्ते', thank:'धन्यवाद', please:'कृपया', good:'अच्छा', file:'फ़ाइल', page:'पृष्ठ', text:'पाठ', document:'दस्तावेज़', you:'आप', we:'हम', this:'यह', from:'से', or:'या', not:'नहीं' },
  es: { the:'el', is:'es', and:'y', to:'a', of:'de', in:'en', hello:'hola', thank:'gracias', please:'por favor', good:'bueno', file:'archivo', page:'página', text:'texto', document:'documento' },
  fr: { the:'le', is:'est', and:'et', of:'de', in:'dans', hello:'bonjour', thank:'merci', good:'bon', file:'fichier', page:'page', text:'texte', document:'document' },
  de: { the:'der', is:'ist', and:'und', of:'von', in:'in', hello:'hallo', thank:'danke', please:'bitte', good:'gut', file:'Datei', page:'Seite', text:'Text', document:'Dokument' },
}

export default function TranslatePDFTool({ tool }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [targetLang, setTargetLang] = useState('hi')
  const [extractedText, setExtractedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState('upload')
  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const translate = (text, lang) => {
    const dict = DICT[lang] || {}
    let r = text
    Object.entries(dict).forEach(([en, tr]) => { r = r.replace(new RegExp('\\b' + en + '\\b', 'gi'), tr) })
    return r
  }

  const handleExtract = async () => {
    if (files.length === 0) { setError('Please select a PDF.'); return }
    setProcessing(true); setError(null); setProgress(0)
    try {
      const buf = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true })
      setProgress(30)
      const pages = pdfDoc.getPages()
      let text = ''
      for (const page of pages) {
        try {
          const content = await page.node.contents()
          if (content && content.toString) {
            const raw = content.toString()
            const texts = raw.match(/\(([^)]+)\)/g) || []
            text += texts.map(t => t.slice(1, -1)).join(' ') + '\n'
          }
        } catch { text += '[Page content]\n' }
      }
      setExtractedText(text || 'No text content found.')
      setProgress(60)
      setTranslatedText(translate(text, targetLang))
      setProgress(100)
      setStep('result')
    } catch { setError('Failed to extract text.') } finally { setProcessing(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(translatedText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }

  const handleDownloadPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const lines = translatedText.split('\n')
      let page = pdfDoc.addPage(PageSizes.A4)
      let yPos = page.getSize().height - 50
      for (const line of lines) {
        if (yPos < 50) { page = pdfDoc.addPage(PageSizes.A4); yPos = page.getSize().height - 50 }
        page.drawText(line.substring(0, 80), { x: 50, y: yPos, size: 10, font, color: rgb(0, 0, 0) })
        yPos -= 15
      }
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'translated.pdf'; a.click()
    } catch { setError('Failed to create PDF.') }
  }

  const handleReset = () => { setFiles([]); setError(null); setProgress(0); setExtractedText(''); setTranslatedText(''); setStep('upload') }

  if (step === 'result') {
    return (<div className="py-12"><div className="max-w-3xl mx-auto px-4 sm:px-6">
      <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4"><h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Original</h3><pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded max-h-60 overflow-auto whitespace-pre-wrap">{extractedText}</pre></div>
        <div className="card p-4"><h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Translated ({LANGUAGES.find(l => l.code === targetLang)?.name})</h3><pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded max-h-60 overflow-auto whitespace-pre-wrap">{translatedText}</pre></div>
      </div>
      <div className="flex gap-3 mb-6">
        <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-medium">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button>
        <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"><Download className="w-4 h-4" />Download PDF</button>
      </div>
      <button onClick={handleReset} className="w-full btn-primary text-base py-4">Translate Another</button>
    </div></div>)
  }

  return (<div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
    <Nav /><div className="text-center mb-8"><IconEl tool={tool} colors={colors} Icon={Icon} /><p className="text-gray-600 dark:text-gray-400 mt-2">{tool.description}</p></div>
    <div className="card p-6 mb-6"><FileUploader accept=".pdf" onFilesChange={setFiles} label="Drag & Drop your PDF to translate" /></div>
    <div className="card p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Translate to</label>
      <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="input-field">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
      <p className="text-xs text-gray-400 mt-2">Built-in dictionary for common words.</p>
    </div>
    {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
    {processing && <div className="mb-6"><ProgressBar progress={progress} status="Extracting and translating..." /></div>}
    <button onClick={handleExtract} disabled={files.length === 0 || processing} className="w-full btn-primary text-base py-4 disabled:opacity-50">{processing ? 'Processing...' : 'Translate PDF'}</button>
  </div></div>)
}

function Nav() { return (<nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8"><Link to="/"><Home className="w-4 h-4" /></Link><ChevronRight className="w-4 h-4" /><Link to="/tools">Tools</Link><ChevronRight className="w-4 h-4" /><span className="text-gray-900 dark:text-white">Translate PDF</span></nav>) }
function IconEl({ tool, colors, Icon }) { return (<><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1></>) }
