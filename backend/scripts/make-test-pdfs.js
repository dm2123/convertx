const { PDFDocument, rgb } = require('pdf-lib')
const fs = require('fs')
const path = require('path')

async function makePdf(file, pages = 3) {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 400])
    page.drawText(`Test page ${i + 1}`, { x: 100, y: 200, size: 24, color: rgb(0, 0, 0) })
  }
  fs.writeFileSync(file, await doc.save())
}

async function main() {
  const tmp = path.join(__dirname, '..', '..', '..', 'tmp')
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })
  const pdf1 = path.join(tmp, 'test1.pdf')
  const pdf2 = path.join(tmp, 'test2.pdf')
  await makePdf(pdf1, 3)
  await makePdf(pdf2, 2)
  console.log('Test PDFs created:', pdf1, fs.statSync(pdf1).size, 'bytes')
}

main().catch(e => { console.error(e); process.exit(1) })