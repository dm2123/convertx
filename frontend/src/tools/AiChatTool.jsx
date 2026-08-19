import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, AlertCircle, Bot, Send, User, Copy, Trash2, Upload } from 'lucide-react'
import { iconMap, categoryColors } from '../data/tools'
import FileUploader from '../components/FileUploader'

export default function AiChatTool({ tool }) {
  const [file, setFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const colors = categoryColors[tool.category]
  const Icon = iconMap[tool.icon]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const handleFilesChange = (newFiles) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0])
      setError(null)
      setMessages([{
        role: 'system',
        content: `Loaded: ${newFiles[0].name} (${(newFiles[0].size / 1024).toFixed(1)} KB). Ask me anything about this document!`,
      }])
    }
  }

  const handleSend = async () => {
    const question = input.trim()
    if (!question || processing) return

    setError(null)
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setProcessing(true)

    try {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('question', question)

        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/chat`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Failed to get AI response')

        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer || data.response || data.message }])
      } else {
        throw new Error('no-api')
      }
    } catch (err) {
      if (err.message === 'no-api' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: getMockResponse(question),
          isMock: true,
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          isError: true,
        }])
      }
    } finally {
      setProcessing(false)
    }
  }

  const getMockResponse = (q) => {
    const lower = q.toLowerCase()
    if (lower.includes('summary') || lower.includes('summarize')) {
      return '📄 [Demo Mode] I would provide a summary of the document here. In production, this would be powered by an AI model analyzing the actual PDF content. Upload a file and ensure the server is running for real AI responses.'
    }
    if (lower.includes('key') || lower.includes('main')) {
      return '📋 [Demo Mode] The key points of this document would be extracted here. This is a demo response — connect to the backend API for actual AI-powered analysis.'
    }
    if (lower.includes('hello') || lower.includes('hi')) {
      return '👋 Hello! I\'m your PDF assistant. Please upload a PDF and ask me questions about its content. This is currently running in demo mode — start the server for real AI capabilities.'
    }
    return `🤖 [Demo Mode] You asked: "${q}"\n\nIn production, I would analyze the uploaded PDF and provide an accurate, context-aware answer. This is a placeholder response. Please start the backend server for real AI functionality.`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const handleClear = () => {
    setMessages([])
    setError(null)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setMessages([])
  }

  return (
    <div className="py-12"><div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Breadcrumb tool={tool} />
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}><Icon className={`w-7 h-7 ${colors.text}`} /></div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      {!file ? (
        <div className="card p-6 mb-6">
          <FileUploader accept=".pdf" onFilesChange={handleFilesChange} label="Drag & Drop your PDF here" />
        </div>
      ) : (
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30">
              <Upload className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleRemoveFile}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="card p-0 mb-6 overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-4">
                <Bot className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                {file ? 'Ask me anything about this document!' : 'Upload a PDF first, then ask questions about it.'}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/30 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : msg.isError
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && !msg.isError && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => handleCopy(msg.content)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    {msg.isMock && <span className="text-xs text-amber-500 italic">Demo response</span>}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-gray-700 flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {processing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/30 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length > 0 && (
        <div className="flex justify-end mb-4">
          <button onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear chat
          </button>
        </div>
      )}

      {error && <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}

      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={file ? 'Ask a question about the document...' : 'Upload a PDF first...'}
          disabled={processing}
          className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
        />
        <button onClick={handleSend} disabled={!input.trim() || processing}
          className="px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed">
          <Send className="w-5 h-5" />
        </button>
      </div>

      <FaqSection />
    </div></div>
  )
}

function Breadcrumb({ tool }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
      <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Home className="w-4 h-4" /></Link>
      <ChevronRight className="w-4 h-4" />
      <Link to="/tools" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Tools</Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 dark:text-white">{tool.name}</span>
    </nav>
  )
}

function FaqSection() {
  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">How does the AI chat work?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Upload a PDF document and ask questions about its content. The AI analyzes the document and provides context-aware answers based on the text within the PDF.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">What are demo responses?</h3><p className="text-sm text-gray-600 dark:text-gray-400">When the backend server is not running, the tool provides placeholder responses to demonstrate the UI. Start the server for real AI-powered analysis.</p></div>
      <div className="card p-5"><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3><p className="text-sm text-gray-600 dark:text-gray-400">Your PDF is processed securely. Document content is not stored permanently and is only used to answer your questions during the session.</p></div>
    </div>
  )
}
