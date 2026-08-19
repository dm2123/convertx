import { useState, useRef } from 'react'
import { Download, RefreshCw, FileText } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function ImageCompressorTool({ tool }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [quality, setQuality] = useState(0.5)
  const [resultUrl, setResultUrl] = useState(null)
  const [resultName, setResultName] = useState('')
  const [origSize, setOrigSize] = useState(0)
  const [newSize, setNewSize] = useState(0)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const compress = async () => {
    setError(null)
    setResultUrl(null)
    if (!file) {
      setError('Pehle image select karo.')
      return
    }
    try {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })

      let width = img.naturalWidth
      let height = img.naturalHeight
      const MAX = 2000
      if (width > MAX || height > MAX) {
        const scale = Math.min(MAX / width, MAX / height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(type, quality)
      const sizeBytes = Math.round((dataUrl.length - 'data:image/png;base64,'.length) * 3 / 4)

      setOrigSize(file.size)
      setNewSize(sizeBytes)
      const baseName = file.name.replace(/\.[^.]+$/, '')
      setResultName(`${baseName}-compressed.jpg`)
      setResultUrl(dataUrl)
    } catch {
      setError('Compress nahi hua. Dobara try karo.')
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = resultName
    a.click()
  }

  const saved = origSize > 0 ? Math.max(0, Math.round((1 - newSize / origSize) * 100)) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setFile(f)
                setPreview(URL.createObjectURL(f))
                setResultUrl(null)
              }
            }}
          />
          {preview ? (
            <img src={preview} alt="preview" className="mx-auto max-h-48 rounded-xl" />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Image click karke select karo (JPG, PNG, WebP)</p>
          )}
          {file && <p className="text-xs text-gray-500 mt-2">{file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compression Level: {Math.round(quality * 100)}%</label>
          <input type="range" min="0.05" max="0.95" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">Kam % = chhoti file, thodi quality loss. 50% best balance hai.</p>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button onClick={compress} className="w-full btn-primary text-base py-4">
          Compress Image
        </button>
      </div>

      {resultUrl && (
        <div className="card p-6 text-center animate-scale-in">
          <img src={resultUrl} alt="compressed" className="mx-auto max-h-48 mb-4 rounded-xl" />
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Original: {(origSize / 1024).toFixed(1)} KB → Compressed: {(newSize / 1024).toFixed(1)} KB
            <span className="font-bold text-green-600 dark:text-green-400"> ({saved}% saved)</span>
          </div>
          <button onClick={download} className="btn-primary inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Compressed Image
          </button>
        </div>
      )}
      <FaqSection tool={tool} />
    </div>
  )
}