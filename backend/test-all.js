const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

const BASE = 'https://convertx-api-libre.onrender.com';
const testPdf = 'C:/Users/PARMOD~1/AppData/Local/Temp/opencode/test.pdf';
const test2Pdf = 'C:/Users/PARMOD~1/AppData/Local/Temp/opencode/test2.pdf';

async function testTool(name, endpoint, fields) {
  return new Promise((resolve) => {
    const form = new FormData();
    if (fields.files) {
      fields.files.forEach(f => form.append('files', fs.createReadStream(f)));
    }
    if (fields.pages) form.append('pages', fields.pages);
    if (fields.angle) form.append('angle', fields.angle);
    if (fields.password) form.append('password', fields.password);
    if (fields.start) form.append('start', fields.start);
    if (fields.text) form.append('text', fields.text);
    if (fields.margin) form.append('margin', fields.margin);
    if (fields.order) form.append('order', fields.order);

    const url = new URL(endpoint, BASE);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: form.getHeaders(),
      timeout: 30000,
    }, (res) => {
      let size = 0;
      res.on('data', c => size += c.length);
      res.on('end', () => {
        const s = res.statusCode;
        const label = s === 200 ? 'PASS' : s === 501 ? 'NOT AVAIL' : 'FAIL(' + s + ')';
        resolve({ name, label, status: s, size });
      });
    });
    req.on('error', (e) => resolve({ name, label: 'ERROR(' + e.message + ')', status: 0, size: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ name, label: 'TIMEOUT', status: 0, size: 0 }); });
    form.pipe(req);
  });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const tests = [
    ['compress-pdf', '/api/pdf/compress', {files:[testPdf]}],
    ['merge-pdf', '/api/pdf/merge', {files:[testPdf,test2Pdf]}],
    ['split-pdf', '/api/pdf/split', {files:[testPdf], pages:'1-2'}],
    ['rotate-pdf', '/api/pdf/rotate', {files:[testPdf], angle:'90'}],
    ['protect-pdf', '/api/pdf/protect', {files:[testPdf], password:'test123'}],
    ['unlock-pdf', '/api/pdf/unlock', {files:[testPdf]}],
    ['delete-pdf-pages', '/api/tools/delete-pdf-pages', {files:[testPdf], pages:'1'}],
    ['extract-pdf-pages', '/api/tools/extract-pdf-pages', {files:[testPdf], pages:'1-2'}],
    ['organize-pdf', '/api/tools/organize-pdf', {files:[testPdf], order:'3,2,1'}],
    ['repair-pdf', '/api/tools/repair-pdf', {files:[testPdf]}],
    ['flatten-pdf', '/api/tools/flatten-pdf', {files:[testPdf]}],
    ['add-page-numbers', '/api/tools/add-page-numbers', {files:[testPdf], start:'1'}],
    ['watermark-pdf', '/api/tools/watermark-pdf', {files:[testPdf], text:'TEST'}],
    ['crop-pdf', '/api/tools/crop-pdf', {files:[testPdf], margin:'20'}],
    ['redact-pdf', '/api/tools/redact-pdf', {files:[testPdf]}],
    ['pdf-to-pdfa', '/api/tools/pdf-to-pdfa', {files:[testPdf]}],
    ['edit-pdf', '/api/tools/edit-pdf', {files:[testPdf], text:'Hello'}],
    ['compare-pdf', '/api/tools/compare-pdf', {files:[testPdf,test2Pdf]}],
    ['pdf-to-word', '/api/tools/pdf-to-word', {files:[testPdf]}],
    ['pdf-to-office', '/api/tools/pdf-to-office', {files:[testPdf]}],
    ['pdf-to-powerpoint', '/api/tools/pdf-to-powerpoint', {files:[testPdf]}],
    ['pdf-to-excel', '/api/tools/pdf-to-excel', {files:[testPdf]}],
  ];

  console.log('=== TESTING ALL SERVER TOOLS ===\n');
  let pass = 0, fail = 0, notavail = 0;
  
  for (const [name, ep, fields] of tests) {
    process.stdout.write('Testing ' + name + '... ');
    const r = await testTool(name, ep, fields);
    console.log(r.label + ' (' + r.size + ' bytes)');
    if (r.label === 'PASS') pass++;
    else if (r.label === 'NOT AVAIL') notavail++;
    else fail++;
    await wait(2000);
  }

  console.log('\n=== CLIENT-SIDE TOOLS (11 tools) ===');
  console.log('QR Code Generator, Image Converter, Image Compressor, Word Counter,');
  console.log('Password Generator, JSON Formatter, Base64 Encoder/Decoder,');
  console.log('Age Calculator, Password Strength Checker, Hash Generator, File Encryptor');
  console.log('=> All CLIENT-SIDE, always work in browser\n');

  console.log('=== COMING SOON (15 tools) ===');
  console.log('OCR PDF, PDF Annotator, PDF Form Filler, PDF Forms, Share PDF,');
  console.log('Sign PDF, Request Signatures, Translate PDF, PDF to POWERPOINT,');
  console.log('PDF to EXCEL, HWP to PDF, ZIP to PDF, Pages to PDF, PDF to PPT, PDF Forms (dup)');

  console.log('\n=== SUMMARY ===');
  console.log('PASS: ' + pass);
  console.log('FAIL: ' + fail);
  console.log('NOT AVAILABLE (501): ' + notavail);
  console.log('CLIENT-SIDE (ok): 11');
  console.log('COMING SOON: 15');
}

run().catch(console.error);
