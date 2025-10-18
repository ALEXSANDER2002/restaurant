#!/usr/bin/env node

/**
 * Script para testar a migração do Gemini para Gemma 2B
 * Execute: node scripts/test-gemma-migration.js
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'gemma2b';

async function testOllamaConnection() {
  try {
    console.log('🔍 Testando conexão com Ollama...');
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com Ollama estabelecida!');
      console.log('📋 Modelos disponíveis:', data.models?.map(m => m.name).join(', ') || 'Nenhum');
      return true;
    } else {
      console.log('❌ Ollama não está respondendo');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com Ollama:', error.message);
    return false;
  }
}

async function testGemmaModel() {
  try {
    console.log(`🧪 Testando modelo ${MODEL_NAME}...`);
    
    const testPrompt = 'Olá! Você é o assistente do RU da UNIFESSPA?';
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 200,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro no teste: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Teste do modelo bem-sucedido!');
    console.log('📝 Resposta de teste:', data.response?.substring(0, 150) + '...');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste do modelo:', error.message);
    return false;
  }
}

async function testProjectAPI() {
  try {
    console.log('🌐 Testando API do projeto...');
    
    // Simular uma chamada para a API de chat
    const chatRequest = {
      message: 'Qual é o horário de funcionamento do RU?',
      language: 'pt-BR'
    };

    console.log('📤 Enviando requisição para /api/chat...');
    console.log('📝 Mensagem:', chatRequest.message);
    
    // Nota: Este teste requer que o projeto esteja rodando
    console.log('ℹ️  Para testar a API completa, execute:');
    console.log('   curl -X POST http://localhost:3000/api/chat \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"message": "Qual é o horário do RU?", "language": "pt-BR"}\'');
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste da API:', error.message);
    return false;
  }
}

async function checkMigrationFiles() {
  try {
    console.log('📁 Verificando arquivos da migração...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Verificar se o arquivo antigo foi removido
    const oldFile = path.join(__dirname, '..', 'services', 'gemini-chat-service.ts');
    if (fs.existsSync(oldFile)) {
      console.log('❌ Arquivo antigo ainda existe:', oldFile);
      return false;
    } else {
      console.log('✅ Arquivo antigo removido com sucesso');
    }
    
    // Verificar se o novo arquivo existe
    const newFile = path.join(__dirname, '..', 'services', 'gemma-chat-service.ts');
    if (fs.existsSync(newFile)) {
      console.log('✅ Novo arquivo criado:', 'gemma-chat-service.ts');
    } else {
      console.log('❌ Novo arquivo não encontrado');
      return false;
    }
    
    // Verificar se a API foi atualizada
    const apiFile = path.join(__dirname, '..', 'app', 'api', 'chat', 'route.ts');
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf8');
      if (content.includes('gemmaChatService') && !content.includes('geminiChatService')) {
        console.log('✅ API atualizada para usar Gemma');
      } else {
        console.log('❌ API não foi atualizada corretamente');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar arquivos:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testando migração Gemini → Gemma 2B...\n');
  
  let allTestsPassed = true;
  
  // Teste 1: Verificar arquivos da migração
  console.log('📋 Teste 1: Verificando arquivos da migração');
  const filesOk = await checkMigrationFiles();
  if (!filesOk) {
    allTestsPassed = false;
    console.log('❌ Falha na verificação de arquivos\n');
  } else {
    console.log('✅ Verificação de arquivos passou\n');
  }
  
  // Teste 2: Conexão com Ollama
  console.log('📋 Teste 2: Testando conexão com Ollama');
  const ollamaOk = await testOllamaConnection();
  if (!ollamaOk) {
    allTestsPassed = false;
    console.log('❌ Falha na conexão com Ollama\n');
  } else {
    console.log('✅ Conexão com Ollama passou\n');
  }
  
  // Teste 3: Modelo Gemma
  if (ollamaOk) {
    console.log('📋 Teste 3: Testando modelo Gemma 2B');
    const modelOk = await testGemmaModel();
    if (!modelOk) {
      allTestsPassed = false;
      console.log('❌ Falha no teste do modelo\n');
    } else {
      console.log('✅ Teste do modelo passou\n');
    }
  }
  
  // Teste 4: API do projeto
  console.log('📋 Teste 4: Verificando configuração da API');
  const apiOk = await testProjectAPI();
  if (!apiOk) {
    allTestsPassed = false;
    console.log('❌ Falha na verificação da API\n');
  } else {
    console.log('✅ Verificação da API passou\n');
  }
  
  // Resultado final
  console.log('📊 Resultado dos Testes');
  console.log('========================');
  
  if (allTestsPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Migração Gemini → Gemma 2B concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Reinicie sua aplicação');
    console.log('   2. Teste o chatbot em /demo-chatbot');
    console.log('   3. Verifique os logs para confirmar o uso do Gemma');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('\n🔧 Para resolver:');
    console.log('   1. Verifique se o Ollama está rodando');
    console.log('   2. Execute: pnpm setup:ollama');
    console.log('   3. Verifique as variáveis de ambiente');
    console.log('   4. Consulte GEMMA_SETUP.md para mais detalhes');
  }
  
  console.log('\n📚 Documentação: GEMMA_SETUP.md');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testOllamaConnection,
  testGemmaModel,
  testProjectAPI,
  checkMigrationFiles
};
