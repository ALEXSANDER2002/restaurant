#!/usr/bin/env node

/**
 * Script para configurar o Ollama e baixar o modelo Gemma 2B
 * Execute: node scripts/setup-ollama.js
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'gemma2b';

async function checkOllamaStatus() {
  try {
    console.log('🔍 Verificando status do Ollama...');
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama está rodando!');
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

async function checkModelAvailability() {
  try {
    console.log(`🔍 Verificando se o modelo ${MODEL_NAME} está disponível...`);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      const modelExists = data.models?.some(m => m.name === MODEL_NAME);
      
      if (modelExists) {
        console.log(`✅ Modelo ${MODEL_NAME} já está disponível!`);
        return true;
      } else {
        console.log(`❌ Modelo ${MODEL_NAME} não encontrado`);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.log('❌ Erro ao verificar modelo:', error.message);
    return false;
  }
}

async function downloadModel() {
  try {
    console.log(`📥 Baixando modelo ${MODEL_NAME}...`);
    console.log('⚠️  Isso pode demorar alguns minutos dependendo da sua conexão...');
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: MODEL_NAME,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar modelo: ${response.status}`);
    }

    console.log(`✅ Modelo ${MODEL_NAME} baixado com sucesso!`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao baixar modelo:', error.message);
    return false;
  }
}

async function testModel() {
  try {
    console.log('🧪 Testando o modelo...');
    
    const testPrompt = 'Olá! Como você está?';
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
          max_tokens: 100,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro no teste: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Teste bem-sucedido!');
    console.log('📝 Resposta de teste:', data.response?.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Configurando Ollama para Gemma 2B...\n');
  
  // Verificar se o Ollama está rodando
  const ollamaRunning = await checkOllamaStatus();
  if (!ollamaRunning) {
    console.log('\n❌ Ollama não está rodando!');
    console.log('📋 Para resolver:');
    console.log('   1. Instale o Ollama: https://ollama.ai/');
    console.log('   2. Execute: ollama serve');
    console.log('   3. Ou use Docker: docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama');
    console.log('   4. Execute este script novamente');
    process.exit(1);
  }

  // Verificar se o modelo já está disponível
  const modelAvailable = await checkModelAvailability();
  
  if (!modelAvailable) {
    console.log(`\n📥 Modelo ${MODEL_NAME} não encontrado. Baixando...`);
    const downloadSuccess = await downloadModel();
    
    if (!downloadSuccess) {
      console.log('\n❌ Falha ao baixar o modelo');
      process.exit(1);
    }
  }

  // Testar o modelo
  console.log('\n🧪 Testando o modelo...');
  const testSuccess = await testModel();
  
  if (testSuccess) {
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log(`✅ Ollama está rodando em: ${OLLAMA_BASE_URL}`);
    console.log(`✅ Modelo ${MODEL_NAME} está disponível e funcionando`);
    console.log('\n📋 Para usar em produção:');
    console.log('   - Configure as variáveis de ambiente:');
    console.log(`     OLLAMA_BASE_URL=${OLLAMA_BASE_URL}`);
    console.log(`     OLLAMA_MODEL=${MODEL_NAME}`);
    console.log('   - Reinicie sua aplicação');
  } else {
    console.log('\n❌ Falha no teste do modelo');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkOllamaStatus,
  checkModelAvailability,
  downloadModel,
  testModel
};
