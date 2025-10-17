#!/usr/bin/env node

/**
 * Script para configurar automaticamente o arquivo .env
 * Execute: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

function setupEnvironment() {
  console.log('🔧 Configurando variáveis de ambiente...\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  // Verificar se .env.example existe
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ Arquivo .env.example não encontrado!');
    console.log('📋 Certifique-se de que o arquivo existe na raiz do projeto.');
    process.exit(1);
  }
  
  // Verificar se .env já existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env já existe!');
    console.log('📝 Deseja sobrescrever? (y/N)');
    
    // Em modo não-interativo, não sobrescrever
    if (process.env.NODE_ENV === 'production' || process.env.CI) {
      console.log('🚫 Modo não-interativo detectado. Não sobrescrevendo .env');
      return;
    }
    
    // Aguardar input do usuário (simplificado)
    console.log('ℹ️  Para sobrescrever manualmente, execute:');
    console.log('   cp .env.example .env');
    return;
  }
  
  try {
    // Copiar .env.example para .env
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado com sucesso!');
    console.log('📝 Arquivo copiado de .env.example');
    
    // Ler e mostrar as principais configurações
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('\n📋 Principais configurações:');
    console.log('=============================');
    
    // Extrair e mostrar configurações importantes
    const importantVars = [
      'DATABASE_URL',
      'OLLAMA_BASE_URL', 
      'OLLAMA_MODEL',
      'MERCADO_PAGO_ACCESS_TOKEN',
      'NEXTAUTH_SECRET'
    ];
    
    importantVars.forEach(varName => {
      const match = envContent.match(new RegExp(`^${varName}=(.+)$`, 'm'));
      if (match) {
        const value = match[1];
        const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
        console.log(`✅ ${varName}: ${displayValue}`);
      } else {
        console.log(`❌ ${varName}: Não configurado`);
      }
    });
    
    console.log('\n🔧 Próximos passos:');
    console.log('1. ✅ Arquivo .env criado');
    console.log('2. 📝 Edite o arquivo .env com suas configurações específicas');
    console.log('3. 🚀 Execute: pnpm setup:ollama');
    console.log('4. 🧪 Teste: pnpm test:gemma');
    console.log('5. 🐳 Ou use Docker: docker-compose up -d');
    
    console.log('\n📚 Documentação:');
    console.log('- GEMMA_SETUP.md - Configuração completa');
    console.log('- MIGRACAO_GEMMA_RESUMO.md - Resumo da migração');
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo .env:', error.message);
    console.log('\n🔧 Solução manual:');
    console.log('   cp .env.example .env');
    process.exit(1);
  }
}

function validateEnvironment() {
  console.log('\n🔍 Validando configuração do ambiente...\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado!');
    console.log('📋 Execute: node scripts/setup-env.js');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar variáveis obrigatórias
  const requiredVars = [
    'DATABASE_URL',
    'OLLAMA_BASE_URL',
    'OLLAMA_MODEL'
  ];
  
  let allValid = true;
  
  requiredVars.forEach(varName => {
    const match = envContent.match(new RegExp(`^${varName}=(.+)$`, 'm'));
    if (match && match[1].trim() !== '') {
      console.log(`✅ ${varName}: Configurado`);
    } else {
      console.log(`❌ ${varName}: Não configurado ou vazio`);
      allValid = false;
    }
  });
  
  if (allValid) {
    console.log('\n🎉 Todas as variáveis obrigatórias estão configuradas!');
    console.log('🚀 Você pode executar: pnpm setup:ollama');
  } else {
    console.log('\n⚠️  Algumas variáveis obrigatórias não estão configuradas.');
    console.log('📝 Edite o arquivo .env e configure as variáveis necessárias.');
  }
  
  return allValid;
}

function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'validate':
    case '--validate':
    case '-v':
      validateEnvironment();
      break;
      
    case 'setup':
    case '--setup':
    case '-s':
    default:
      setupEnvironment();
      if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
        validateEnvironment();
      }
      break;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  setupEnvironment,
  validateEnvironment
};
