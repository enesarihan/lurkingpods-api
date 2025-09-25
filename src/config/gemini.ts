import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';

if (!apiKey) {
  throw new Error('Missing Google Gemini API key');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export default genAI;
