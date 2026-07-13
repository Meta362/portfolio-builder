// test-api-key.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testAPIKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('📝 Testing Gemini API Key...');
  console.log('Key exists:', !!apiKey);
  console.log('Key length:', apiKey?.length || 0);
  console.log('Key starts with AQ:', apiKey?.startsWith('AQ') || false);
  
  if (!apiKey) {
    console.error('❌ No API key found in .env');
    return;
  }
  
  if (!apiKey.startsWith('AQ')) {
    console.error('❌ API key should start with "AQ"');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // សាកល្បង Gemini 3.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello, World!" in Khmer' }] }]
    });
    
    console.log('✅ Gemini 3.5 Flash API Key is valid!');
    console.log('Response:', result.response.text());
  } catch (error: any) {
    console.error('❌ API Key test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPIKey();