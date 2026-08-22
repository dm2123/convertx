const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

const testPdf = 'C:/Users/PARMOD~1/AppData/Local/Temp/opencode/test.pdf';

async function testTool(name, endpoint, fields) {
  return new Promise((resolve) => {
    const form = new FormData();
    if (fields.files) fields.files.forEach(f => form.append('files', fs.createReadStream(f)));
    if (fields.pages) form.append('pages', fields.pages);
    if (fields.text) form.append('text', fields.text);
    if (fields.start) form.append('start', fields.start);

    const url = new URL(endpoint, 'https://convertx-api-libre.onrender.com');
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: form.getHeaders(),
      timeout: 60000,
    }, (res) => {
      let body = '';
      res.on('data', c => body += c.toString());
      res.on('end', () => {
        console.log(name + ': HTTP ' + res.statusCode);
        if (res.statusCode !== 200) {
          try { console.log('  Response:', JSON.parse(body)); } catch(e) { console.log('  Response:', body.substring(0, 300)); }
        } else {
          console.log('  OK - ' + Buffer.byteLength(body) + ' bytes');
        }
        resolve();
      });
    });
    req.on('error', (e) => { console.log(name + ': ERROR ' + e.message); resolve(); });
    req.on('timeout', () => { req.destroy(); console.log(name + ': TIMEOUT'); resolve(); });
    form.pipe(req);
  });
}

async function run() {
  console.log('Testing flatten-pdf...');
  await testTool('flatten-pdf', '/api/tools/flatten-pdf', {files:[testPdf]});
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Testing add-page-numbers...');
  await testTool('add-page-numbers', '/api/tools/add-page-numbers', {files:[testPdf], start:'1'});
  
  await new Promise(r => setTimeout(r, 3000));

  console.log('Testing pdf-to-word...');
  await testTool('pdf-to-word', '/api/tools/pdf-to-word', {files:[testPdf]});
}

run();
