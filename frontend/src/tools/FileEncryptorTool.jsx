import { useState, useRef } from 'react'
import { Lock, Unlock, Download, Upload } from 'lucide-react'
import FaqSection from '../components/FaqSection'

async function deriveKey(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export default function FileEncryptorTool({ tool }) {
  const [password, setPassword] = useState('')
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('encrypt')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const process = async () => {
    setError(null)
    setResult(null)
    if (!file || !password) {
      setError('File aur password dono zaruri hain.')
      return
    }
    setLoading(true)
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const key = await deriveKey(password, salt)
      const buffer = await file.arrayBuffer()

      if (mode === 'encrypt') {
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer)
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
        combined.set(salt, 0)
        combined.set(iv, salt.length)
        combined.set(new Uint8Array(encrypted), salt.length + iv.length)
        const blob = new Blob([combined], { type: 'application/octet-stream' })
        setResult({ blob, name: file.name + '.encrypted', size: blob.size })
      } else {
        const data = new Uint8Array(buffer)
        const fileSalt = data.slice(0, 16)
        const fileIv = data.slice(16, 28)
        const encryptedData = data.slice(28)
        const key2 = await deriveKey(password, fileSalt)
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fileIv }, key2, encryptedData)
        const blob = new Blob([decrypted])
        const origName = file.name.replace('.encrypted', '')
        setResult({ blob, name: origName, size: blob.size })
      }
    } catch {
      setError(mode === 'encrypt' ? 'Encryption failed.' : 'Decryption failed - galat password ya corrupted file.')
    }
    setLoading(false)
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(result.blob)
    a.download = result.name
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <button onClick={() => setMode('encrypt')} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mode === 'encrypt' ? 'bg-red-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
            <Lock className="w-4 h-4 inline mr-2" /> Encrypt
          </button>
          <button onClick={() => setMode('decrypt')} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mode === 'decrypt' ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
            <Unlock className="w-4 h-4 inline mr-2" /> Decrypt
          </button>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-red-500 transition-colors"
        >
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {file ? (
            <p className="text-gray-900 dark:text-white font-medium">{file.name} <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span></p>
          ) : (
            <p className="text-gray-500">{mode === 'encrypt' ? 'File select karo (encrypt karne ke liye)' : 'Encrypted file select karo (.encrypted)'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Strong password daalo..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button onClick={process} disabled={loading} className="w-full btn-primary text-base py-4" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
          {loading ? 'Processing...' : mode === 'encrypt' ? 'Encrypt File' : 'Decrypt File'}
        </button>
      </div>

      {result && (
        <div className="card p-6 text-center animate-scale-in">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Original: {file.name} → Output: {result.name}</p>
          <p className="text-xs text-gray-500 mb-4">Size: {(result.size / 1024).toFixed(1)} KB</p>
          <button onClick={download} className="btn-primary inline-flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <Download className="w-4 h-4" /> Download {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} File
          </button>
        </div>
      )}
      <FaqSection tool={tool} />
    </div>
  )
}