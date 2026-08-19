import { useState, useRef } from 'react'
import { Download, RefreshCw, Image as ImageIcon } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function ImageConverterTool({ tool }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(0.9)
  const [resultUrl, setResultUrl] = useState(null)
  const [resultName, setResultName] = useState('')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const convert = async () => {
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

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)

      let mime = 'image/png'
      if (format === 'jpeg') mime = 'image/jpeg'
      if (format === 'webp') mime = 'image/webp'

      const dataUrl = canvas.toDataURL(mime, quality)
      const baseName = file.name.replace(/\.[^.]+$/, '')
      setResultUrl(dataUrl)
      setResultName(`${baseName}.${format}`)
    } catch {
      setError('Image convert nahi hui. Dobara try karo.')
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = resultName
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Convert to</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
              <option value="webp">WEBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality: {Math.round(quality * 100)}%</label>
            <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full mt-2" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button onClick={convert} className="w-full btn-primary text-base py-4">
          Convert Image
        </button>
      </div>

      {resultUrl && (
        <div className="card p-6 text-center animate-scale-in">
          <img src={resultUrl} alt="converted" className="mx-auto max-h-48 mb-4 rounded-xl" />
          <button onClick={download} className="btn-primary inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download {resultName}
          </button>
        </div>
      )}
      <FaqSection tool={tool} />
    </div>
  )
}