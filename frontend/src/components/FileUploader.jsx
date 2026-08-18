import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, File } from 'lucide-react'

export default function FileUploader({ accept, multiple = false, onFilesChange, maxSize = 50 * 1024 * 1024, label }) {
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />
    if (type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    return <File className="w-5 h-5 text-blue-500" />
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const addFiles = (newFiles) => {
    setError(null)
    const arr = Array.from(newFiles)
    const valid = []
    for (const f of arr) {
      if (f.size > maxSize) {
        setError(`File "${f.name}" exceeds maximum size of ${formatSize(maxSize)}`)
        continue
      }
      valid.push(f)
    }
    if (valid.length === 0) return
    const updated = multiple ? [...files, ...valid] : [valid[0]]
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
            dragOver ? 'bg-brand-100 dark:bg-brand-900/50' : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <Upload className={`w-6 h-6 transition-colors ${dragOver ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {label || 'Drag & Drop your files here'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              or <span className="text-brand-600 dark:text-brand-400 font-medium">Browse Files</span>
            </p>
          </div>
          {accept && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Accepted: {accept} &middot; Max: {formatSize(maxSize)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-scale-in"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
