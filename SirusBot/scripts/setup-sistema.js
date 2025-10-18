const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function makeRequest(url, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Configurando Sistema SIRUS...\n');

  const baseUrl = await question('Digite a URL do sistema (padrão: http://localhost:3000): ') || 'http://localhost:3000';

  console.log('\n📝 Criando usuários de teste...');
  
  const seedUsers = await makeRequest(`${baseUrl}/api/seed-users`, 'POST');
  
  if (seedUsers.success) {
    console.log('✅ Usuários criados com sucesso!');
    console.log('   - admin@gmail.com (senha: admin123)');
    console.log('   - user@gmail.com (senha: 12345678)');
    console.log('   - klbs@gmail.com (senha: 12345678)');
  } else {
    console.log('❌ Erro ao criar usuários:', seedUsers.data?.error || seedUsers.error);
  }

  console.log('\n🍽️ Criando cardápio da semana...');
  
  const seedCardapio = await makeRequest(`${baseUrl}/api/seed-cardapio`, 'POST');
  
  if (seedCardapio.success) {
    console.log('✅ Cardápio criado com sucesso!');
  } else {
    console.log('❌ Erro ao criar cardápio:', seedCardapio.data?.error || seedCardapio.error);
  }

  console.log('\n🎯 Sistema configurado!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Acesse o sistema em:', baseUrl);
  console.log('2. Faça login com: user@gmail.com / 12345678');
  console.log('3. Teste a compra de tickets');
  console.log('4. Acesse o admin com: admin@gmail.com / admin123');

  rl.close();
}

main().catch(console.error); 