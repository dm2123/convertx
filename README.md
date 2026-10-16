# ConvertX

> **One platform. Every file tool you need.**

A modern, professional file-tools platform with **76 unique tools** (82 registry entries) for PDF processing, file conversion, editing, security, AI-assisted workflows and everyday utilities — free, no signup, no watermarks.

**Live:** https://dm2123.github.io/convertx/

---

## Features

- **76 unique tools** across 6 categories: PDF, Convert, Edit, Security, AI, Utilities
- **PDF tools** — compress, merge, split, rotate, delete/extract pages, protect, unlock, watermark, page numbers, crop, compare, flatten, repair, redact, PDF→image
- **Conversion** — JPG→PDF, text→PDF, HTML→PDF, office→PDF, PDF→Word/PowerPoint/Excel (server)
- **Security** — password generator, strength checker, hash generator (MD5/SHA), file encryptor (AES-GCM)
- **Utilities** — QR generator, JSON formatter, Base64, word counter, age calculator, image converter/compressor
- **AI tools** — chat with PDF, summarizer, question generator *(require `OPENAI_API_KEY` on the server)*
- **Dark / light mode** with persistent preference
- **Fully responsive**, mobile-first
- **Client-side processing** wherever possible (pdf-lib, canvas) — files never leave the browser
- **SEO** — per-page title, meta description, canonical URL and JSON-LD

---

## Tech stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS             |
| Backend  | TypeScript + Express.js                                 |
| PDF      | pdf-lib (client), LibreOffice (server office converts)  |
| Deploy   | GitHub Pages (frontend), Node.js (backend)              |

---

## Project structure

```
convertx/
├── frontend/                 # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── ui/           # Button, Input, Alert, ProgressBar, Badge…
│       │   ├── layout/       # Header, Footer
│       │   └── tools/        # FileUploader, ToolCard, ToolPageLayout, FaqSection
│       ├── data/             # tools.ts (registry), seo.ts
│       ├── hooks/            # useTheme, useToolProcessor
│       ├── pages/            # Home, Tools, ToolPage, About, Contact…
│       ├── services/         # api.ts — typed backend client
│       ├── tools/            # 45 tool implementations (.tsx)
│       ├── types/            # shared TypeScript interfaces
│       └── utils/            # file helpers
├── backend/                  # TypeScript + Express
│   └── src/
│       ├── routes/           # pdf.ts, conversion.ts, ai.ts
│       ├── middleware/       # upload.ts, errorHandler.ts
│       ├── utils/            # office.ts (LibreOffice)
│       ├── types/
│       └── server.ts
└── .github/workflows/        # Pages deploy
```

---

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
```

### Backend

```bash
cd backend
npm install
npm run dev        # ts-node, http://localhost:5000
npm run build      # tsc → dist/
npm start          # node dist/server.js
```

The frontend proxies `/api` to `http://localhost:5000` in dev. In production set `VITE_API_URL`.

### Environment

| Variable          | Default                 | Purpose                              |
|-------------------|-------------------------|--------------------------------------|
| `PORT`            | `5000`                  | Backend port                         |
| `FRONTEND_URLS`   | `http://localhost:5173` | CORS allow-list (comma-separated)    |
| `MAX_FILE_SIZE`   | `52428800` (50 MB)      | Upload limit in bytes                |
| `OPENAI_API_KEY`  | —                       | Enables AI endpoints (else 503)      |

Office→PDF / PDF→Office conversions need **LibreOffice** (`soffice`) on the server.

---

## API

| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| GET    | `/api/health`          | Health check                             |
| POST   | `/api/pdf/compress`    | Compress PDF                             |
| POST   | `/api/pdf/merge`       | Merge PDFs (2–20 files)                  |
| POST   | `/api/pdf/split`       | Split by page range                      |
| POST   | `/api/pdf/rotate`      | Rotate pages                             |
| POST   | `/api/pdf/protect`     | Password-protect PDF                     |
| POST   | `/api/pdf/unlock`      | Remove password                          |
| POST   | `/api/tools/:slug`     | Generic handler (delete/extract/watermark/…) + office conversions |
| POST   | `/api/convert/:slug`   | Generic conversion endpoint              |
| POST   | `/api/ai/chat`         | Chat with PDF *(needs API key)*          |
| POST   | `/api/ai/summarize`    | Summarize PDF *(needs API key)*          |
| POST   | `/api/ai/questions`    | Generate questions *(needs API key)*    |

All file endpoints accept `multipart/form-data` with a `files` field and return the processed file as a download. Errors are JSON: `{ "error": "…", "suggestion": "…" }`.

---

## Tool count

The registry (`frontend/src/data/tools.ts`) holds **82 entries**: **76 unique tools** + 6 duplicate aliases (e.g. `rotate-pdf-2`) that share the canonical tool's page.

---

## License

All rights reserved — ConvertX.
