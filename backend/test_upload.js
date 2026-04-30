const fs = require('fs');

async function run() {
  try {
    // 1. Create a dummy PDF
    const dummyPdf = '%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R>> endobj\n4 0 obj <</Length 44>> stream\nBT /F1 24 Tf 100 700 Td (Test Resume) Tj ET\nendstream endobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer <</Size 5 /Root 1 0 R>>\nstartxref\n306\n%%EOF';
    fs.writeFileSync('test_resume.pdf', dummyPdf);

    // 2. Register/Login to get token
    let token = '';
    let loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      loginRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123' })
      });
    }
    const loginData = await loginRes.json();
    token = loginData.token;

    // 3. Upload Resume using FormData
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync('test_resume.pdf')], { type: 'application/pdf' });
    formData.append('resume', blob, 'test_resume.pdf');
    formData.append('targetCompany', 'Google');

    console.log('Sending upload request...');
    const uploadRes = await fetch('http://localhost:5000/api/resume/analyze', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: formData
    });

    const uploadData = await uploadRes.json();
    console.log('Response status:', uploadRes.status);
    console.log('Response body:', uploadData);
  } catch (error) {
    console.error('Script Error:', error);
  }
}
run();
