const fs = require('fs')
const path = require('path')

const API = 'http://localhost:4000'
const tmp = path.join(__dirname, '..', '..', '..', 'tmp')
const pdf1 = path.join(tmp, 'test1.pdf')
const pdf2 = path.join(tmp, 'test2.pdf')

async function postForm(url, files, extra = {}) {
  const form = new FormData()
  for (const f of Array.isArray(files) ? files : [files]) {
    form.append('files', new Blob([fs.readFileSync(f)]), path.basename(f))
  }
  for (const [k, v] of Object.entries(extra)) form.append(k, v)
  const res = await fetch(url, { method: 'POST', body: form })
  const type = res.headers.get('content-type') || ''
  if (res.ok && type.includes('pdf')) {
    const buf = Buffer.from(await res.arrayBuffer())
    return { ok: true, size: buf.length, name: (res.headers.get('content-disposition') || '').slice(0, 60) }
  }
  const text = await res.text().catch(() => '')
  return { ok: res.ok, status: res.status, body: text.slice(0, 150) }
}

async function test(name, fn) {
  try {
    const r = await fn()
    if (r.ok) console.log(`PASS  ${name} -> ${r.size} bytes ${r.name}`)
    else console.log(`FAIL  ${name} -> HTTP ${r.status}: ${r.body}`)
  } catch (e) {
    console.log(`ERROR ${name} -> ${e.message}`)
  }
}

async function main() {
  console.log('=== /api/tools/:slug generic handlers ===')
  await test('delete-pdf-pages (pages=1)', () => postForm(`${API}/api/tools/delete-pdf-pages`, pdf1, { pages: '1' }))
  await test('extract-pdf-pages (pages=2-3)', () => postForm(`${API}/api/tools/extract-pdf-pages`, pdf1, { pages: '2-3' }))
  await test('organize-pdf', () => postForm(`${API}/api/tools/organize-pdf`, pdf1, { order: '3,1,2' }))
  await test('repair-pdf', () => postForm(`${API}/api/tools/repair-pdf`, pdf1))
  await test('flatten-pdf', () => postForm(`${API}/api/tools/flatten-pdf`, pdf1))
  await test('add-page-numbers', () => postForm(`${API}/api/tools/add-page-numbers`, pdf1, { start: '5' }))
  await test('watermark-pdf', () => postForm(`${API}/api/tools/watermark-pdf`, pdf1, { text: 'CONFIDENTIAL' }))
  await test('add-watermark', () => postForm(`${API}/api/tools/add-watermark`, pdf1, { text: 'TEST' }))
  await test('crop-pdf', () => postForm(`${API}/api/tools/crop-pdf`, pdf1, { margin: '40' }))
  await test('redact-pdf', () => postForm(`${API}/api/tools/redact-pdf`, pdf1))
  await test('pdf-to-pdfa', () => postForm(`${API}/api/tools/pdf-to-pdfa`, pdf1))
  await test('edit-pdf', () => postForm(`${API}/api/tools/edit-pdf`, pdf1, { text: 'Hello' }))
  await test('rotate-pdf-2', () => postForm(`${API}/api/tools/rotate-pdf-2`, pdf1, { angle: '90' }))
  await test('compare-pdf', () => postForm(`${API}/api/tools/compare-pdf`, [pdf1, pdf2]))
  await test('ocr-pdf (no handler -> passthrough)', () => postForm(`${API}/api/tools/ocr-pdf`, pdf1))
  await test('share-pdf (no handler -> passthrough)', () => postForm(`${API}/api/tools/share-pdf`, pdf1))
  await test('pdf-to-word (needs LO)', () => postForm(`${API}/api/tools/pdf-to-word`, pdf1))
  await test('pdf-to-excel (should 501)', () => postForm(`${API}/api/tools/pdf-to-excel`, pdf1))
  await test('translate-pdf (no handler)', () => postForm(`${API}/api/tools/translate-pdf`, pdf1))
  await test('word-to-pdf with pdf (passthrough)', () => postForm(`${API}/api/tools/word-to-pdf`, pdf1))
}

main()