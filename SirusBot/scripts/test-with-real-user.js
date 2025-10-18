const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')

// Carregar variáveis de ambiente
require('dotenv').config()

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

async function buscarUsuarioTeste() {
  try {
    const sql = postgres(process.env.DATABASE_URL)
    
    const result = await sql`SELECT id, nome, email FROM perfis LIMIT 1`
    
    await sql.end()
    
    if (result.length === 0) {
      throw new Error('Nenhum usuário encontrado no banco')
    }
    
    return result[0]
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error.message)
    return null
  }
}

async function testarCheckoutComUsuarioReal() {
  console.log('🧪 TESTANDO CHECKOUT COM USUÁRIO REAL DO BANCO\n')

  // Buscar usuário real
  const usuario = await buscarUsuarioTeste()
  if (!usuario) {
    console.log('❌ Não foi possível encontrar usuário para teste')
    return null
  }

  console.log('👤 Usuário encontrado:')
  console.log(`   ID: ${usuario.id}`)
  console.log(`   Nome: ${usuario.nome}`)
  console.log(`   Email: ${usuario.email}`)
  console.log()

  try {
    // Dados de teste com usuário real
    const dadosCheckout = {
      usuario_id: usuario.id,
      data: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      comprarSubsidiado: true,
      quantidadeNaoSubsidiado: 1
    }

    console.log('📦 Dados do checkout:', dadosCheckout)
    console.log()

    // Fazer requisição para o checkout
    const response = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosCheckout)
    })

    const resultado = await response.json()

    console.log('📋 Resposta do checkout:')
    console.log('Status:', response.status)
    console.log('Dados:', JSON.stringify(resultado, null, 2))

    if (resultado.sucesso) {
      console.log('\n✅ CHECKOUT CRIADO COM SUCESSO!')
      console.log(`🔗 URL de pagamento: ${resultado.checkout_url}`)
      console.log(`🆔 ID da preferência: ${resultado.preference_id}`)
      console.log(`💰 Valor total: R$ ${resultado.valor_total}`)
      
      console.log('\n🌟 TESTE MERCADO PAGO COM CREDENCIAIS DE PRODUÇÃO FUNCIONANDO!')
      console.log('⚠️  ATENÇÃO: Você está usando credenciais de PRODUÇÃO!')
      console.log('   - Pagamentos serão REAIS se processados')
      console.log('   - Use valores baixos para teste')
      console.log('   - Configure webhook antes de usar em produção')
      
      return resultado
    } else {
      console.log('\n❌ ERRO NO CHECKOUT:', resultado.erro)
      if (resultado.detalhes) {
        console.log('   Detalhes:', resultado.detalhes)
      }
      return null
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
    return null
  }
}

// Executar
if (require.main === module) {
  testarCheckoutComUsuarioReal()
    .then((resultado) => {
      if (resultado) {
        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!')
        process.exit(0)
      } else {
        console.log('\n❌ TESTE FALHOU')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ Erro no teste:', error.message)
      process.exit(1)
    })
} 