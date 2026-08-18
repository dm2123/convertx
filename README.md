# ConvertX

> **One Platform. Multiple File Tools.**

A modern, professional file-tools platform with 71 tools for PDF processing, file conversion, editing, security, and AI-assisted document workflows.

Created by **Dinesh Maurya**.

---

## Features

- **71 Professional Tools** across 5 categories
- **PDF Tools** - Compress, merge, split, rotate, edit, protect, watermark, and more
- **Conversion Tools** - JPG to PDF, Word to PDF, PDF to Word, and 30+ formats
- **Editing Tools** - Add watermarks, remove pages, annotate documents
- **Security Tools** - Password protect, unlock, redact, digitally sign PDFs
- **AI Tools** - Chat with PDF, summarize documents, generate questions
- **Dark/Light Mode** with persistent preference
- **Fully Responsive** - Works on phones, tablets, laptops, and desktops
- **Client-Side Processing** - Many tools work entirely in your browser
- **Professional SaaS UI** - Clean, modern design with smooth animations

---

## Project Structure

```
convertx/
  frontend/          # React + Vite + Tailwind CSS
    src/
      components/    # Reusable UI components
      pages/         # Route pages
      tools/         # Individual tool implementations
      data/          # Tool metadata (71 tools)
      hooks/         # Custom React hooks
      services/      # API service layer
  backend/           # Express.js API server
    src/
      routes/        # API route handlers
      middleware/     # File upload, validation
      services/      # Business logic
```

---

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:5000`

---

## Environment Variables

### Frontend

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

### Backend

Copy `backend/.env.example` to `backend/.env`:

```
PORT=5000
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=52428800
OPENAI_API_KEY=your_key_here  # Optional: for AI features
```

---

## Tool Categories

| Category | Count | Description |
|----------|-------|-------------|
| PDF | 32 | Compress, merge, split, rotate, edit, protect, and more |
| Convert | 29 | File format conversions (PDF, Word, Excel, PPT, images) |
| Edit | 2 | Watermark, page removal |
| Security | 0 (tools in PDF) | Password protection, unlocking, redaction |
| AI | 6 | Chat with PDF, summarizer, question generator |

---

## Client-Side Tools (Work Without Backend)

The following tools process files entirely in the browser using pdf-lib:

- Compress PDF
- Merge PDF
- Split PDF
- Rotate PDF
- Delete PDF Pages
- Extract PDF Pages
- Protect PDF (password)
- Unlock PDF
- Watermark PDF
- Add Page Numbers
- Crop PDF
- Compare PDF
- Flatten PDF
- Repair PDF
- Redact PDF
- JPG to PDF
- TXT to PDF
- HTML to PDF
- PDF to Image (using pdf.js)

---

## Server-Side Tools (Require Backend)

These tools require server-side processing:

- Word/Excel/PPT to PDF (requires LibreOffice)
- AI features (requires OpenAI API key)
- Advanced OCR
- Complex format conversions

To enable full server-side conversions, install LibreOffice:

```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# macOS
brew install libreoffice

# Windows
# Download from https://www.libreoffice.org/
```

---

## Tech Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **pdf-lib** - Client-side PDF manipulation
- **pdf.js** - PDF rendering
- **Lucide React** - Icons

### Backend

- **Express.js** - API framework
- **Multer** - File upload handling
- **pdf-lib** - PDF processing
- **CORS** - Cross-origin support
- **Rate Limiting** - API protection

---

## API Endpoints

```
POST /api/pdf/compress     # Compress a PDF
POST /api/pdf/merge        # Merge multiple PDFs
POST /api/pdf/split        # Split a PDF
POST /api/pdf/rotate       # Rotate PDF pages
POST /api/pdf/protect      # Add password protection
POST /api/pdf/unlock       # Remove password protection
POST /api/convert/:slug    # Generic file conversion
POST /api/ai/chat          # AI chat with PDF
POST /api/ai/summarize     # AI document summarization
GET  /api/health           # Health check
```

---

## License

MIT License. Created by Dinesh Maurya.
