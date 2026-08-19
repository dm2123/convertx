import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getToolBySlug, iconMap, categoryColors } from '../data/tools'
import { getSeoForSlug } from '../data/seoContent'
import { ChevronRight, Home, AlertCircle } from 'lucide-react'
import SeoUpdater from '../components/SeoUpdater'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import PdfCompressTool from '../tools/PdfCompressTool'
import PdfMergeTool from '../tools/PdfMergeTool'
import PdfSplitTool from '../tools/PdfSplitTool'
import PdfRotateTool from '../tools/PdfRotateTool'
import PdfDeletePagesTool from '../tools/PdfDeletePagesTool'
import PdfExtractPagesTool from '../tools/PdfExtractPagesTool'
import PdfProtectTool from '../tools/PdfProtectTool'
import PdfUnlockTool from '../tools/PdfUnlockTool'
import PdfWatermarkTool from '../tools/PdfWatermarkTool'
import PdfPageNumbersTool from '../tools/PdfPageNumbersTool'
import PdfCropTool from '../tools/PdfCropTool'
import PdfCompareTool from '../tools/PdfCompareTool'
import PdfFlattenTool from '../tools/PdfFlattenTool'
import PdfRepairTool from '../tools/PdfRepairTool'
import PdfRedactTool from '../tools/PdfRedactTool'
import PdfToImageTool from '../tools/PdfToImageTool'
import PdfReaderTool from '../tools/PdfReaderTool'
import ImageToPdfTool from '../tools/ImageToPdfTool'
import TextToPdfTool from '../tools/TextToPdfTool'
import HtmlToPdfTool from '../tools/HtmlToPdfTool'
import GenericConversionTool from '../tools/GenericConversionTool'
import AiChatTool from '../tools/AiChatTool'
import AiSummarizerTool from '../tools/AiSummarizerTool'
import QrCodeTool from '../tools/QrCodeTool'
import ImageConverterTool from '../tools/ImageConverterTool'
import ImageCompressorTool from '../tools/ImageCompressorTool'
import WordCounterTool from '../tools/WordCounterTool'
import PasswordGeneratorTool from '../tools/PasswordGeneratorTool'
import JsonFormatterTool from '../tools/JsonFormatterTool'
import Base64Tool from '../tools/Base64Tool'
import AgeCalculatorTool from '../tools/AgeCalculatorTool'
import PasswordStrengthTool from '../tools/PasswordStrengthTool'
import HashGeneratorTool from '../tools/HashGeneratorTool'
import FileEncryptorTool from '../tools/FileEncryptorTool'

const toolComponents = {
  'compress-pdf': PdfCompressTool,
  'merge-pdf': PdfMergeTool,
  'split-pdf': PdfSplitTool,
  'rotate-pdf': PdfRotateTool,
  'rotate-pdf-2': PdfRotateTool,
  'delete-pdf-pages': PdfDeletePagesTool,
  'extract-pdf-pages': PdfExtractPagesTool,
  'organize-pdf': PdfExtractPagesTool,
  'protect-pdf': PdfProtectTool,
  'unlock-pdf': PdfUnlockTool,
  'watermark-pdf': PdfWatermarkTool,
  'add-page-numbers': PdfPageNumbersTool,
  'add-page-numbers-2': PdfPageNumbersTool,
  'crop-pdf': PdfCropTool,
  'crop-pdf-2': PdfCropTool,
  'compare-pdf': PdfCompareTool,
  'flatten-pdf': PdfFlattenTool,
  'repair-pdf': PdfRepairTool,
  'redact-pdf': PdfRedactTool,
  'pdf-to-jpg': PdfToImageTool,
  'pdf-to-image': PdfToImageTool,
  'pdf-reader': PdfReaderTool,
  'jpg-to-pdf': ImageToPdfTool,
  'scan-to-pdf': ImageToPdfTool,
  'pdf-scanner': ImageToPdfTool,
  'txt-to-pdf': TextToPdfTool,
  'html-to-pdf': HtmlToPdfTool,
  'ai-pdf-assistant': AiChatTool,
  'chat-with-pdf': AiChatTool,
  'ai-pdf-summarizer': AiSummarizerTool,
  'ai-summarizer': AiSummarizerTool,
  'pdf-intelligence': AiSummarizerTool,
  'ai-question-generator': AiSummarizerTool,
  'qr-code-generator': QrCodeTool,
  'image-converter': ImageConverterTool,
  'image-compressor': ImageCompressorTool,
  'word-counter': WordCounterTool,
  'password-generator': PasswordGeneratorTool,
  'json-formatter': JsonFormatterTool,
  'base64-encode-decode': Base64Tool,
  'age-calculator': AgeCalculatorTool,
  'password-strength-checker': PasswordStrengthTool,
  'hash-generator': HashGeneratorTool,
  'file-encryptor': FileEncryptorTool,
}

function DefaultToolPage({ tool, extraFaqs = [], seoDescription }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const colors = categoryColors[tool.category] || categoryColors.PDF
  const Icon = iconMap[tool.icon] || iconMap.FileText

  const accept = tool.formats?.join(',') || '.pdf'

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('Please select at least one file.')
      return
    }
    setProcessing(true)
    setError(null)
    setProgress(0)
    setStatus('Uploading...')

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))

      const intervals = [10, 25, 40, 55, 70, 85]
      let idx = 0
      const timer = setInterval(() => {
        if (idx < intervals.length) {
          setProgress(intervals[idx])
          setStatus(['Uploading...', 'Processing...', 'Converting...', 'Finalizing...'][Math.min(Math.floor(idx / 2), 3)])
          idx++
        }
      }, 500)

      const apiUrl = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${apiUrl}/api/tools/${tool.slug}`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(timer)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Processing failed' }))
        throw new Error(errData.error || `Server error: ${res.status}`)
      }

      setProgress(100)
      setStatus('Complete!')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const ext = tool.slug.includes('to-jpg') || tool.slug.includes('to-image') ? '.zip' : '.pdf'
      const fileName = `converted${ext}`

      setResult({ url, fileName, size: blob.size })
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.fileName
    a.click()
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setError(null)
    setProgress(0)
    setStatus('')
  }

  const faqs = [
    ...(extraFaqs || []),
    { q: `How does ${tool.name} work?`, a: `${tool.name} processes your files directly in your browser or through our secure server. Simply upload your file, configure options, and download the result.` },
    { q: 'Is my data safe?', a: 'Yes. We process files securely and do not store your data. All files are automatically deleted from our servers after processing.' },
    { q: 'What file formats are supported?', a: `${tool.name} supports ${tool.formats?.join(', ') || 'various formats'}. More formats are added regularly.` },
  ]

  if (result) {
    return (
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Home className="w-4 h-4" /></Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/tools" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Tools</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white">{tool.name}</span>
          </nav>

          <div className="text-center mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}>
              <Icon className={`w-7 h-7 ${colors.text}`} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
          </div>

          <ResultCard
            fileName={result.fileName}
            fileSize={result.size}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Home className="w-4 h-4" /></Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/tools" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Tools</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">{tool.name}</span>
        </nav>

        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}>
            <Icon className={`w-7 h-7 ${colors.text}`} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{seoDescription || tool.description}</p>
        </div>

        <div className="card p-6 mb-8">
          <FileUploader
            accept={accept}
            multiple={tool.slug === 'merge-pdf'}
            onFilesChange={setFiles}
            label={`Drag & Drop your ${tool.formats?.join(', ') || 'files'} here`}
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6 animate-scale-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {processing && (
          <div className="mb-6 animate-fade-in">
            <ProgressBar progress={progress} status={status} />
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={files.length === 0 || processing}
          className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : tool.name}
        </button>

        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ToolPage() {
  const { slug } = useParams()
  const tool = getToolBySlug(slug)

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <SeoUpdater title="Tool Not Found | ConvertX" canonicalPath="/tools" />
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tool Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The tool you're looking for doesn't exist.</p>
        <Link to="/tools" className="btn-primary">Browse All Tools</Link>
      </div>
    )
  }

  const seo = getSeoForSlug(slug)
  const seoTitle = `${tool.name} Online Free - No Signup Required | ConvertX`
  const seoDesc = seo?.description || `${tool.name} online free tool. ${tool.description} Fast, secure and no registration needed. ${tool.formats?.join(', ') || 'PDF'} supported.`
  const seoKeywords = seo?.keywords || [`${tool.name} online free`, tool.name.toLowerCase()]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} - ConvertX`,
    url: `https://convertx2026.netlify.app/tools/${slug}`,
    description: seoDesc,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: {
      '@type': 'Organization',
      name: 'ConvertX',
      url: 'https://convertx2026.netlify.app',
      logo: { '@type': 'ImageObject', url: 'https://convertx2026.netlify.app/logo.svg' },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://convertx2026.netlify.app/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://convertx2026.netlify.app/tools' },
      { '@type': 'ListItem', position: 3, name: tool.name, item: `https://convertx2026.netlify.app/tools/${slug}` },
    ],
  }

  const ToolComponent = toolComponents[slug]
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How does ${tool.name} work?`,
        acceptedAnswer: { '@type': 'Answer', text: `${tool.name} processes your files directly in your browser or through our secure server. Simply upload your file, configure options, and download the result.` },
      },
      {
        '@type': 'Question',
        name: 'Is my data safe?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. We process files securely and do not store your data. All files are automatically deleted from our servers after processing.' },
      },
      {
        '@type': 'Question',
        name: 'What file formats are supported?',
        acceptedAnswer: { '@type': 'Answer', text: `${tool.name} supports ${tool.formats?.join(', ') || 'various formats'}. More formats are added regularly.` },
      },
    ],
  }

  if (ToolComponent) {
    return (
      <>
        <SeoUpdater title={seoTitle} description={seoDesc} canonicalPath={`/tools/${slug}`} jsonLd={[jsonLd, breadcrumbJsonLd]} keywords={seoKeywords} />
        <ToolComponent tool={tool} />
      </>
    )
  }

  const extraFaqs = seo?.faqs || []
  return (
    <>
      <SeoUpdater title={seoTitle} description={seoDesc} canonicalPath={`/tools/${slug}`} jsonLd={[faqJsonLd, breadcrumbJsonLd]} keywords={seoKeywords} />
      <DefaultToolPage tool={tool} extraFaqs={extraFaqs} seoDescription={seo?.description} />
    </>
  )
}
