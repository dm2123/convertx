import { Download, RotateCcw, CheckCircle, FileText } from 'lucide-react'

export default function ResultCard({ fileName, fileSize, onDownload, onReset }) {
  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="w-full p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-2xl animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">Processing complete</p>
          <p className="text-sm text-green-600 dark:text-green-400">Your file is ready for download</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-green-100 dark:border-green-900/30 mb-4">
        <FileText className="w-5 h-5 text-gray-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
          {fileSize && <p className="text-xs text-gray-400">{formatSize(fileSize)}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onDownload} className="flex-1 flex items-center justify-center gap-2 btn-primary">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button onClick={onReset} className="flex items-center justify-center gap-2 btn-secondary !px-4">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  )
}
