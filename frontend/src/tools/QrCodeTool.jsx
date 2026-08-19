import { useState } from 'react'
import QRCode from 'qrcode'
import { Download, RefreshCw, QrCode } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function QrCodeTool({ tool }) {
  const [text, setText] = useState('https://convertx2026.netlify.app')
  const [size, setSize] = useState(300)
  const [fg, setFg] = useState('#111827')
  const [bg, setBg] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState(null)
  const [error, setError] = useState(null)

  const generate = async () => {
    setError(null)
    if (!text.trim()) {
      setError('Pehle kuch text ya link likho.')
      return
    }
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: fg, light: bg },
        errorCorrectionLevel: 'M',
      })
      setDataUrl(url)
    } catch (e) {
      setError('QR generate nahi hua. Chhota text try karo.')
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'convertx-qr-code.png'
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text ya URL</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="https://... ya koi bhi text"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</label>
            <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value={200}>Small (200px)</option>
              <option value={300}>Medium (300px)</option>
              <option value={500}>Large (500px)</option>
              <option value={800}>Extra Large (800px)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors</label>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs text-gray-500">FG</span>
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
              </div>
              <div>
                <span className="text-xs text-gray-500">BG</span>
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={generate}
          className="w-full btn-primary text-base py-4"
        >
          Generate QR Code
        </button>
      </div>

      {dataUrl && (
        <div className="card p-6 text-center animate-scale-in">
          <img src={dataUrl} alt="Generated QR code" className="mx-auto mb-4 max-w-full" style={{ width: Math.min(size, 380) }} />
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="btn-primary inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={generate} className="btn-secondary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
        </div>
      )}
      <FaqSection tool={tool} />
    </div>
  )
}