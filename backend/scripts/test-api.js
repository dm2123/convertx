const fs = require('fs')
const path = require('path')

const API = 'https://convertx-api.onrender.com'
const tmp = path.join(__dirname, '..', '..', '..', 'tmp')
const pdf1 = path.join(tmp, 'test1.pdf')
const pdf2 = path.join(tmp, 'test2.pdf')

async function postForm(url, field, files, extra = {}) {
  const form = new FormData()
  for (const f of Array.isArray(files) ? files : [files]) {
    form.append(field, new Blob([fs.readFileSync(f)]), path.basename(f))
  }
  for (const [k, v] of Object.entries(extra)) form.append(k, v)
  const res = await fetch(url, { method: 'POST', body: form })
  const type = res.headers.get('content-type') || ''
  if (res.ok && type.includes('pdf')) {
    const buf = Buffer.from(await res.arrayBuffer())
    return { ok: true, size: buf.length }
  }
  const text = await res.text().catch(() => '')
  return { ok: res.ok, status: res.status, body: text.slice(0, 200) }
}

async function test(name, fn) {
  try {
    const r = await fn()
    if (r.ok) console.log(`PASS  ${name} -> ${r.size} bytes`)
    else console.log(`FAIL  ${name} -> HTTP ${r.status}: ${r.body}`)
  } catch (e) {
    console.log(`ERROR ${name} -> ${e.message}`)
  }
}

async function main() {
  console.log('=== PDF tools ===')
  await test('compress', () => postForm(`${API}/api/pdf/compress`, 'files', pdf1))
  await test('merge (2 files)', () => postForm(`${API}/api/pdf/merge`, 'files', [pdf1, pdf2]))
  await test('merge (1 file, should fail)', () => postForm(`${API}/api/pdf/merge`, 'files', pdf1))
  await test('split', () => postForm(`${API}/api/pdf/split`, 'files', pdf1, { pages: '1-2' }))
  await test('rotate', () => postForm(`${API}/api/pdf/rotate`, 'files', pdf1, { angle: '90' }))
  await test('protect', () => postForm(`${API}/api/pdf/protect`, 'files', pdf1, { password: 'test123' }))
  await test('unlock (wrong password)', () => postForm(`${API}/api/pdf/unlock`, 'files', pdf1, { password: 'wrong' }))

  console.log('=== /api/tools/:slug (frontend DefaultToolPage uses this) ===')
  await test('tools/compress-pdf', () => postForm(`${API}/api/tools/compress-pdf`, 'files', pdf1))
  await test('tools/merge-pdf', () => postForm(`${API}/api/tools/merge-pdf`, 'files', [pdf1, pdf2]))
  await test('tools/rotate-pdf', () => postForm(`${API}/api/tools/rotate-pdf`, 'files', pdf1))
  await test('tools/split-pdf', () => postForm(`${API}/api/tools/split-pdf`, 'files', pdf1))
  await test('tools/delete-pdf-pages', () => postForm(`${API}/api/tools/delete-pdf-pages`, 'files', pdf1))
  await test('tools/protect-pdf', () => postForm(`${API}/api/tools/protect-pdf`, 'files', pdf1))
  await test('tools/unlock-pdf', () => postForm(`${API}/api/tools/unlock-pdf`, 'files', pdf1))
  await test('tools/extract-pdf-pages', () => postForm(`${API}/api/tools/extract-pdf-pages`, 'files', pdf1))
  await test('tools/add-page-numbers', () => postForm(`${API}/api/tools/add-page-numbers`, 'files', pdf1))
  await test('tools/crop-pdf', () => postForm(`${API}/api/tools/crop-pdf`, 'files', pdf1))
  await test('tools/watermark-pdf', () => postForm(`${API}/api/tools/watermark-pdf`, 'files', pdf1))
  await test('tools/flatten-pdf', () => postForm(`${API}/api/tools/flatten-pdf`, 'files', pdf1))
  await test('tools/compare-pdf', () => postForm(`${API}/api/tools/compare-pdf`, 'files', [pdf1, pdf2]))
  await test('tools/repair-pdf', () => postForm(`${API}/api/tools/repair-pdf`, 'files', pdf1))
  await test('tools/redact-pdf', () => postForm(`${API}/api/tools/redact-pdf`, 'files', pdf1))
  await test('tools/ocr-pdf', () => postForm(`${API}/api/tools/ocr-pdf`, 'files', pdf1))
  await test('tools/edit-pdf', () => postForm(`${API}/api/tools/edit-pdf`, 'files', pdf1))
  await test('tools/pdf-annotator', () => postForm(`${API}/api/tools/pdf-annotator`, 'files', pdf1))
  await test('tools/sign-pdf', () => postForm(`${API}/api/tools/sign-pdf`, 'files', pdf1))
  await test('tools/pdf-form-filler', () => postForm(`${API}/api/tools/pdf-form-filler`, 'files', pdf1))
  await test('tools/pdf-forms', () => postForm(`${API}/api/tools/pdf-forms`, 'files', pdf1))
  await test('tools/pdf-to-pdfa', () => postForm(`${API}/api/tools/pdf-to-pdfa`, 'files', pdf1))
  await test('tools/translate-pdf', () => postForm(`${API}/api/tools/translate-pdf`, 'files', pdf1))
  await test('tools/ai-pdf-assistant', () => postForm(`${API}/api/tools/ai-pdf-assistant`, 'files', pdf1))

  console.log('=== Conversion (api/convert) ===')
  await test('convert/pdf-to-word', () => postForm(`${API}/api/convert/pdf-to-word`, 'files', pdf1))
  await test('convert/word-to-pdf', () => postForm(`${API}/api/convert/word-to-pdf`, 'files', pdf1))
  await test('convert/ppt-to-pdf', () => postForm(`${API}/api/convert/ppt-to-pdf`, 'files', pdf1))

  console.log('=== AI ===')
  const aiRes = await fetch(`${API}/api/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'This is a test document about PDF conversion tools.' }),
  })
  console.log(`AI summarize -> HTTP ${aiRes.status}: ${(await aiRes.text()).slice(0, 150)}`)
}

main()