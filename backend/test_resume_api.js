const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAnalyze() {
  const formData = new FormData();
  // Using a known valid PDF from node_modules
  const filePath = path.join(__dirname, 'node_modules', 'pdf-parse', 'test', 'data', '01-valid.pdf');
  
  if (!fs.existsSync(filePath)) {
    console.error('Test file not found at:', filePath);
    return;
  }

  formData.append('resume', fs.createReadStream(filePath));
  formData.append('targetCompany', 'Google');

  try {
    console.log('Sending request to http://localhost:5000/api/resume/analyze...');
    const res = await axios.post('http://localhost:5000/api/resume/analyze', formData, {
      headers: formData.getHeaders(),
      timeout: 60000 // 60s
    });
    console.log('Response Success:', res.data.success);
    console.log('Analysis result keys:', Object.keys(res.data.analysis));
    console.log('ATS Score:', res.data.analysis.atsScore);
  } catch (err) {
    console.error('Error status:', err.response?.status);
    console.error('Error message:', err.response?.data?.message || err.message);
    if (err.response?.data?.error) {
      console.error('Error details:', err.response.data.error);
    }
  }
}

testAnalyze();
