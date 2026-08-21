import {
  FileText, Merge, Scissors, RotateCw, Trash2, FileUp, FolderOpen,
  ScanLine, Wrench, Search, Edit3, PenTool, BookOpen, Hash, Crop,
  Droplet, Stamp, FormInput, FileCheck, Share2, Pen, PenLine, Unlock,
  Shield, Layers, GitCompare, Bot, MessageSquare, Sparkles, Languages,
  HelpCircle, Scan, Image, FileSpreadsheet, Presentation, FileCode,
  FileImage, File, FileType, FileOutput, ArrowRightLeft, Grid3X3,
  Maximize2, Minimize2, Eye, EyeOff, Lock, AlignLeft, QrCode, Braces,
  Type, CalendarDays, ArrowDownUp
} from 'lucide-react'

const tools = [
  // PDF TOOLS (1-32)
  { id: 1, name: "Compress PDF", slug: "compress-pdf", category: "PDF", description: "Reduce PDF file size while maintaining quality.", icon: "Minimize2", implemented: true, formats: [".pdf"] },
  { id: 2, name: "Merge PDF", slug: "merge-pdf", category: "PDF", description: "Combine multiple PDF files into one document.", icon: "Merge", implemented: true, formats: [".pdf"] },
  { id: 3, name: "Split PDF", slug: "split-pdf", category: "PDF", description: "Split a PDF into multiple separate files.", icon: "Scissors", implemented: true, formats: [".pdf"] },
  { id: 4, name: "Rotate PDF", slug: "rotate-pdf", category: "PDF", description: "Rotate PDF pages to the correct orientation.", icon: "RotateCw", implemented: true, formats: [".pdf"] },
  { id: 5, name: "Delete PDF Pages", slug: "delete-pdf-pages", category: "PDF", description: "Remove unwanted pages from a PDF document.", icon: "Trash2", implemented: true, formats: [".pdf"] },
  { id: 6, name: "Extract PDF Pages", slug: "extract-pdf-pages", category: "PDF", description: "Extract specific pages from a PDF file.", icon: "FileUp", implemented: true, formats: [".pdf"] },
  { id: 7, name: "Organize PDF", slug: "organize-pdf", category: "PDF", description: "Reorder and organize pages in your PDF.", icon: "FolderOpen", implemented: true, formats: [".pdf"] },
  { id: 8, name: "Scan to PDF", slug: "scan-to-pdf", category: "PDF", description: "Convert scanned images into a PDF document.", icon: "ScanLine", implemented: true, formats: [".jpg", ".jpeg", ".png"] },
  { id: 9, name: "Repair PDF", slug: "repair-pdf", category: "PDF", description: "Fix corrupted or damaged PDF files.", icon: "Wrench", implemented: true, formats: [".pdf"] },
  { id: 10, name: "OCR PDF", slug: "ocr-pdf", category: "PDF", description: "Extract text from scanned documents using OCR.", icon: "Search", comingSoon: true, formats: [".pdf"] },
  { id: 11, name: "Edit PDF", slug: "edit-pdf", category: "PDF", description: "Edit text, images and content in your PDF.", icon: "Edit3", implemented: true, formats: [".pdf"] },
  { id: 12, name: "PDF Annotator", slug: "pdf-annotator", category: "PDF", description: "Add annotations, highlights and notes to PDF.", icon: "PenTool", comingSoon: true, formats: [".pdf"] },
  { id: 13, name: "PDF Reader", slug: "pdf-reader", category: "PDF", description: "Read and view PDF documents online.", icon: "BookOpen", implemented: true, formats: [".pdf"] },
  { id: 14, name: "Add Page Numbers", slug: "add-page-numbers", category: "PDF", description: "Add page numbers to your PDF documents.", icon: "Hash", implemented: true, formats: [".pdf"] },
  { id: 15, name: "Crop PDF", slug: "crop-pdf", category: "PDF", description: "Crop and resize PDF pages.", icon: "Crop", implemented: true, formats: [".pdf"] },
  { id: 16, name: "Redact PDF", slug: "redact-pdf", category: "PDF", description: "Permanently remove sensitive content from PDFs.", icon: "Droplet", implemented: true, formats: [".pdf"] },
  { id: 17, name: "Watermark PDF", slug: "watermark-pdf", category: "PDF", description: "Add text or image watermarks to your PDF.", icon: "Stamp", implemented: true, formats: [".pdf"] },
  { id: 18, name: "PDF Form Filler", slug: "pdf-form-filler", category: "PDF", description: "Fill out PDF forms quickly and easily.", icon: "FormInput", comingSoon: true, formats: [".pdf"] },
  { id: 19, name: "PDF Forms", slug: "pdf-forms", category: "PDF", description: "Create and manage interactive PDF forms.", icon: "FileCheck", comingSoon: true, formats: [".pdf"] },
  { id: 20, name: "Share PDF", slug: "share-pdf", category: "PDF", description: "Share your PDF documents securely online.", icon: "Share2", comingSoon: true, formats: [".pdf"] },
  { id: 21, name: "Sign PDF", slug: "sign-pdf", category: "PDF", description: "Add digital signatures to your PDF documents.", icon: "Pen", comingSoon: true, formats: [".pdf"] },
  { id: 22, name: "Request Signatures", slug: "request-signatures", category: "PDF", description: "Request digital signatures from others.", icon: "PenLine", comingSoon: true, formats: [".pdf"] },
  { id: 23, name: "Unlock PDF", slug: "unlock-pdf", category: "PDF", description: "Remove password protection from PDF files.", icon: "Unlock", implemented: true, formats: [".pdf"] },
  { id: 24, name: "Protect PDF", slug: "protect-pdf", category: "PDF", description: "Add password protection to your PDF files.", icon: "Lock", implemented: true, formats: [".pdf"] },
  { id: 25, name: "Flatten PDF", slug: "flatten-pdf", category: "PDF", description: "Flatten PDF layers and annotations.", icon: "Layers", implemented: true, formats: [".pdf"] },
  { id: 26, name: "Compare PDF", slug: "compare-pdf", category: "PDF", description: "Compare two PDF files and find differences.", icon: "GitCompare", implemented: true, formats: [".pdf"] },
  { id: 27, name: "AI PDF Assistant", slug: "ai-pdf-assistant", category: "AI", description: "AI-powered assistant for your PDF documents.", icon: "Bot", implemented: true, formats: [".pdf"] },
  { id: 28, name: "Chat with PDF", slug: "chat-with-pdf", category: "AI", description: "Have a conversation with your PDF content.", icon: "MessageSquare", implemented: true, formats: [".pdf"] },
  { id: 29, name: "AI PDF Summarizer", slug: "ai-pdf-summarizer", category: "AI", description: "Get AI-generated summaries of your PDFs.", icon: "Sparkles", implemented: true, formats: [".pdf"] },
  { id: 30, name: "Translate PDF", slug: "translate-pdf", category: "AI", description: "Translate PDF documents to any language.", icon: "Languages", comingSoon: true, formats: [".pdf"] },
  { id: 31, name: "AI Question Generator", slug: "ai-question-generator", category: "AI", description: "Generate questions from PDF content using AI.", icon: "HelpCircle", implemented: true, formats: [".pdf"] },
  { id: 32, name: "PDF Scanner", slug: "pdf-scanner", category: "PDF", description: "Scan documents using your camera to create PDFs.", icon: "Scan", implemented: true, formats: [".jpg", ".jpeg", ".png"] },

  // CONVERSION TOOLS (33-61)
  { id: 33, name: "JPG to PDF", slug: "jpg-to-pdf", category: "Convert", description: "Convert JPG images to PDF documents.", icon: "FileImage", implemented: true, formats: [".jpg", ".jpeg"] },
  { id: 34, name: "WORD to PDF", slug: "word-to-pdf", category: "Convert", description: "Convert Word documents to PDF format.", icon: "FileText", implemented: true, formats: [".doc", ".docx"] },
  { id: 35, name: "POWERPOINT to PDF", slug: "powerpoint-to-pdf", category: "Convert", description: "Convert PowerPoint presentations to PDF.", icon: "Presentation", implemented: true, formats: [".ppt", ".pptx"] },
  { id: 36, name: "EXCEL to PDF", slug: "excel-to-pdf", category: "Convert", description: "Convert Excel spreadsheets to PDF format.", icon: "FileSpreadsheet", implemented: true, formats: [".xls", ".xlsx"] },
  { id: 37, name: "HTML to PDF", slug: "html-to-pdf", category: "Convert", description: "Convert HTML pages to PDF documents.", icon: "FileCode", implemented: true, formats: [".html", ".htm"] },
  { id: 38, name: "PDF to JPG", slug: "pdf-to-jpg", category: "Convert", description: "Convert PDF pages to JPG images.", icon: "Image", implemented: true, formats: [".pdf"] },
  { id: 39, name: "PDF to WORD", slug: "pdf-to-word", category: "Convert", description: "Convert PDF to editable Word documents.", icon: "FileText", implemented: true, formats: [".pdf"] },
  { id: 40, name: "PDF to POWERPOINT", slug: "pdf-to-powerpoint", category: "Convert", description: "Convert PDF to PowerPoint presentations.", icon: "Presentation", comingSoon: true, formats: [".pdf"] },
  { id: 41, name: "PDF to EXCEL", slug: "pdf-to-excel", category: "Convert", description: "Convert PDF tables to Excel spreadsheets.", icon: "FileSpreadsheet", comingSoon: true, formats: [".pdf"] },
  { id: 42, name: "PDF to PDF/A", slug: "pdf-to-pdfa", category: "Convert", description: "Convert PDF to archival PDF/A format.", icon: "FileOutput", implemented: true, formats: [".pdf"] },
  { id: 43, name: "PDF to Markdown", slug: "pdf-to-markdown", category: "Convert", description: "Convert PDF content to Markdown format.", icon: "AlignLeft", implemented: true, formats: [".pdf"] },
  { id: 44, name: "Office to PDF", slug: "office-to-pdf", category: "Convert", description: "Convert any Office document to PDF.", icon: "FileType", implemented: true, formats: [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"] },
  { id: 45, name: "Word to PDF", slug: "word-to-pdf-alt", category: "Convert", description: "Convert Word documents to PDF format.", icon: "FileText", implemented: true, formats: [".doc", ".docx"] },
  { id: 46, name: "Excel to PDF", slug: "excel-to-pdf-alt", category: "Convert", description: "Convert Excel spreadsheets to PDF format.", icon: "FileSpreadsheet", implemented: true, formats: [".xls", ".xlsx"] },
  { id: 47, name: "PPT to PDF", slug: "ppt-to-pdf", category: "Convert", description: "Convert PowerPoint presentations to PDF.", icon: "Presentation", implemented: true, formats: [".ppt", ".pptx"] },
  { id: 48, name: "ODT to PDF", slug: "odt-to-pdf", category: "Convert", description: "Convert OpenDocument Text to PDF.", icon: "FileText", implemented: true, formats: [".odt"] },
  { id: 49, name: "ODS to PDF", slug: "ods-to-pdf", category: "Convert", description: "Convert OpenDocument Spreadsheet to PDF.", icon: "FileSpreadsheet", implemented: true, formats: [".ods"] },
  { id: 50, name: "ODP to PDF", slug: "odp-to-pdf", category: "Convert", description: "Convert OpenDocument Presentation to PDF.", icon: "Presentation", implemented: true, formats: [".odp"] },
  { id: 51, name: "TXT to PDF", slug: "txt-to-pdf", category: "Convert", description: "Convert plain text files to PDF format.", icon: "FileText", implemented: true, formats: [".txt"] },
  { id: 52, name: "RTF to PDF", slug: "rtf-to-pdf", category: "Convert", description: "Convert Rich Text Format to PDF.", icon: "FileText", implemented: true, formats: [".rtf"] },
  { id: 53, name: "HWP to PDF", slug: "hwp-to-pdf", category: "Convert", description: "Convert Hancom HWP documents to PDF.", icon: "FileText", comingSoon: true, formats: [".hwp"] },
  { id: 54, name: "EPUB to PDF", slug: "epub-to-pdf", category: "Convert", description: "Convert EPUB ebooks to PDF format.", icon: "BookOpen", implemented: true, formats: [".epub"] },
  { id: 55, name: "ZIP to PDF", slug: "zip-to-pdf", category: "Convert", description: "Convert ZIP archive contents to PDF.", icon: "File", comingSoon: true, formats: [".zip"] },
  { id: 56, name: "CSV to PDF", slug: "csv-to-pdf", category: "Convert", description: "Convert CSV data files to PDF format.", icon: "FileSpreadsheet", implemented: true, formats: [".csv"] },
  { id: 57, name: "Pages to PDF", slug: "pages-to-pdf", category: "Convert", description: "Convert Apple Pages documents to PDF.", icon: "FileText", comingSoon: true, formats: [".pages"] },
  { id: 58, name: "PDF Converter", slug: "pdf-converter", category: "Convert", description: "Universal PDF converter for all file types.", icon: "ArrowRightLeft", implemented: true, formats: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"] },
  { id: 59, name: "PDF to Image", slug: "pdf-to-image", category: "Convert", description: "Convert PDF pages to image files.", icon: "Image", implemented: true, formats: [".pdf"] },
  { id: 60, name: "PDF to Office", slug: "pdf-to-office", category: "Convert", description: "Convert PDF to editable Office documents.", icon: "Grid3X3", implemented: true, formats: [".pdf"] },
  { id: 61, name: "PDF to PPT", slug: "pdf-to-ppt", category: "Convert", description: "Convert PDF to PowerPoint presentations.", icon: "Presentation", comingSoon: true, formats: [".pdf"] },

  // EDITING (62-63)
  { id: 62, name: "Add Watermark", slug: "add-watermark", category: "Edit", description: "Add text or image watermarks to documents.", icon: "Stamp", implemented: true, formats: [".pdf", ".jpg", ".png"] },
  { id: 63, name: "Remove Pages", slug: "remove-pages", category: "Edit", description: "Remove unwanted pages from documents.", icon: "Trash2", implemented: true, formats: [".pdf"] },

  // AI (64-65)
  { id: 64, name: "AI Summarizer", slug: "ai-summarizer", category: "AI", description: "AI-powered document summarization tool.", icon: "Sparkles", implemented: true, formats: [".pdf", ".txt", ".doc", ".docx"] },
  { id: 65, name: "PDF Intelligence", slug: "pdf-intelligence", category: "AI", description: "Advanced AI analysis of your PDF documents.", icon: "Eye", implemented: true, formats: [".pdf"] },

  // DUPLICATES (66-71)
  { id: 66, name: "PDF to PDF/A", slug: "pdf-to-pdfa-2", category: "Convert", description: "Convert PDF to archival PDF/A format.", icon: "FileOutput", implemented: true, formats: [".pdf"], duplicateOf: 42 },
  { id: 67, name: "Rotate PDF", slug: "rotate-pdf-2", category: "PDF", description: "Rotate PDF pages to the correct orientation.", icon: "RotateCw", implemented: true, formats: [".pdf"], duplicateOf: 4 },
  { id: 68, name: "Add Page Numbers", slug: "add-page-numbers-2", category: "PDF", description: "Add page numbers to your PDF documents.", icon: "Hash", implemented: true, formats: [".pdf"], duplicateOf: 14 },
  { id: 69, name: "Crop PDF", slug: "crop-pdf-2", category: "PDF", description: "Crop and resize PDF pages.", icon: "Crop", implemented: true, formats: [".pdf"], duplicateOf: 15 },
  { id: 70, name: "Edit PDF", slug: "edit-pdf-2", category: "PDF", description: "Edit text, images and content in your PDF.", icon: "Edit3", implemented: true, formats: [".pdf"], duplicateOf: 11 },
  { id: 71, name: "PDF Forms", slug: "pdf-forms-2", category: "PDF", description: "Create and manage interactive PDF forms.", icon: "FileCheck", comingSoon: true, formats: [".pdf"], duplicateOf: 19 },

  // UTILITIES (72-79)
  { id: 72, name: "QR Code Generator", slug: "qr-code-generator", category: "Utilities", description: "Generate QR codes for links, text, WiFi and more - free with custom colors.", icon: "QrCode", implemented: true, clientSide: true },
  { id: 73, name: "Image Converter", slug: "image-converter", category: "Utilities", description: "Convert JPG, PNG, WebP images to any format instantly in your browser.", icon: "FileImage", implemented: true, clientSide: true },
  { id: 74, name: "Image Compressor", slug: "image-compressor", category: "Utilities", description: "Compress images online free - reduce JPG, PNG, WebP file size without losing quality.", icon: "Minimize2", implemented: true, clientSide: true },
  { id: 75, name: "Word Counter", slug: "word-counter", category: "Utilities", description: "Count words, characters, sentences and paragraphs in your text instantly.", icon: "Type", implemented: true, clientSide: true },
  { id: 76, name: "Password Generator", slug: "password-generator", category: "Security", description: "Generate strong random passwords with custom length and character types.", icon: "Shield", implemented: true, clientSide: true },
  { id: 77, name: "JSON Formatter", slug: "json-formatter", category: "Utilities", description: "Format, validate and minify JSON data online free.", icon: "Braces", implemented: true, clientSide: true },
  { id: 78, name: "Base64 Encoder/Decoder", slug: "base64-encode-decode", category: "Utilities", description: "Encode text to Base64 or decode Base64 to text instantly.", icon: "ArrowDownUp", implemented: true, clientSide: true },
  { id: 79, name: "Age Calculator", slug: "age-calculator", category: "Utilities", description: "Calculate exact age in years, months, days, weeks and hours online.", icon: "CalendarDays", implemented: true, clientSide: true },

  // SECURITY (80-82)
  { id: 80, name: "Password Strength Checker", slug: "password-strength-checker", category: "Security", description: "Check how strong your password is - score and improvement tips.", icon: "Shield", implemented: true, clientSide: true },
  { id: 81, name: "Hash Generator", slug: "hash-generator", category: "Security", description: "Generate MD5, SHA1, SHA256, SHA512 hashes from any text instantly.", icon: "Hash", implemented: true, clientSide: true },
  { id: 82, name: "File Encryptor", slug: "file-encryptor", category: "Security", description: "Encrypt and decrypt files with AES-256 - 100% browser-based, nothing uploaded.", icon: "Lock", implemented: true, clientSide: true },
]

export const categories = ["All", "PDF", "Convert", "Edit", "Security", "AI", "Utilities"]

export const categoryColors = {
  PDF: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  Convert: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  Edit: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  Security: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  AI: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  Utilities: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
}

export const iconMap = {
  FileText, Merge, Scissors, RotateCw, Trash2, FileUp, FolderOpen,
  ScanLine, Wrench, Search, Edit3, PenTool, BookOpen, Hash, Crop,
  Droplet, Stamp, FormInput, FileCheck, Share2, Pen, PenLine, Unlock,
  Shield, Layers, GitCompare, Bot, MessageSquare, Sparkles, Languages,
  HelpCircle, Scan, Image, FileSpreadsheet, Presentation, FileCode,
  FileImage, File, FileType, FileOutput, ArrowRightLeft, Grid3X3,
  Maximize2, Minimize2, Eye, EyeOff, Lock, AlignLeft, QrCode, Braces,
  Type, CalendarDays, ArrowDownUp, Hash
}

export const getToolBySlug = (slug) => {
  return tools.find(t => t.slug === slug)
}

export const getToolsByCategory = (category) => {
  if (category === "All") return tools
  return tools.filter(t => t.category === category)
}

export const searchTools = (query) => {
  const q = query.toLowerCase().trim()
  if (!q) return tools
  return tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.slug.includes(q)
  )
}

export default tools
