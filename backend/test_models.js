const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello");
      console.log(`  Success with ${m}: ${result.response.text().slice(0, 20)}...`);
    } catch (e) {
      console.log(`  Failed with ${m}: ${e.message}`);
    }
  }
}

testModel();
