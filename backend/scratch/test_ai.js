require('dotenv').config();
const { chatWithAI } = require('../services/aiService');

async function test() {
  console.log('Testing Gemini Integration...');
  const messages = [{ role: 'user', content: 'Explain what React is in 2 sentences.' }];
  try {
    const response = await chatWithAI(messages);
    console.log('\nAI Response:');
    console.log(response);
    console.log('\n✅ Gemini is working perfectly!');
  } catch (error) {
    console.error('❌ Gemini Test Failed:', error);
  }
}

test();
