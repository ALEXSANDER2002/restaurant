import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GOOGLE_GEMINI_API_KEY não encontrada no .env');
  process.exit(1);
}

console.log('🔑 Chave API encontrada:', API_KEY.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(API_KEY);

async function testGeminiAPI() {
  try {
    console.log('🤖 Testando conexão com Gemini API...');
    
    // Testar modelo gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Olá! Você está funcionando?";
    
    console.log('📤 Enviando prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API funcionando!');
    console.log('📥 Resposta:', text);
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    
    // Tentar listar modelos disponíveis
    try {
      console.log('📋 Tentando listar modelos disponíveis...');
      // Este método pode não estar disponível em todas as versões
      const models = await genAI.listModels?.();
      if (models) {
        console.log('📋 Modelos disponíveis:', models);
      }
    } catch (listError) {
      console.log('ℹ️ Não foi possível listar modelos');
    }
  }
}

testGeminiAPI(); 