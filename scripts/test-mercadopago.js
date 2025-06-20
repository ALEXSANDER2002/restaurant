/**
 * Script para testar a integração com o Mercado Pago
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

async function testarCheckout() {
  console.log('🧪 TESTANDO CHECKOUT COM MERCADO PAGO\n')

  try {
    // Dados de teste
    const dadosCheckout = {
      usuario_id: "test-user-123",
      data: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      comprarSubsidiado: true,
      quantidadeNaoSubsidiado: 1
    }

    console.log('📦 Dados do teste:', dadosCheckout)
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
      
      return resultado
    } else {
      console.log('\n❌ ERRO NO CHECKOUT:', resultado.erro)
      return null
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
    return null
  }
}

async function testarWebhook() {
  console.log('\n🔗 TESTANDO WEBHOOK\n')

  try {
    // Testar endpoint GET (health check)
    const healthResponse = await fetch(`${BASE_URL}/api/mercadopago/webhook`)
    const healthData = await healthResponse.json()

    console.log('🏥 Health check do webhook:')
    console.log('Status:', healthResponse.status)
    console.log('Resposta:', JSON.stringify(healthData, null, 2))

    // Simular webhook de pagamento aprovado
    const webhookData = {
      type: 'payment',
      action: 'payment.updated',
      data: {
        id: '123456789' // ID fictício
      }
    }

    console.log('\n📨 Simulando webhook de pagamento...')
    const webhookResponse = await fetch(`${BASE_URL}/api/mercadopago/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    })

    const webhookResult = await webhookResponse.json()

    console.log('📋 Resposta do webhook:')
    console.log('Status:', webhookResponse.status)
    console.log('Dados:', JSON.stringify(webhookResult, null, 2))

  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error.message)
  }
}

async function verificarVariaveisAmbiente() {
  console.log('🔧 VERIFICANDO CONFIGURAÇÃO\n')

  const variaveis = [
    'MERCADO_PAGO_ACCESS_TOKEN',
    'MERCADO_PAGO_PUBLIC_KEY',
    'DATABASE_URL',
    'APP_URL'
  ]

  let todasDefinidas = true

  for (const variavel of variaveis) {
    const valor = process.env[variavel]
    const status = valor ? '✅' : '❌'
    const preview = valor ? `${valor.substring(0, 20)}...` : 'NÃO DEFINIDA'
    
    console.log(`${status} ${variavel}: ${preview}`)
    
    if (!valor) todasDefinidas = false
  }

  console.log()
  
  if (!todasDefinidas) {
    console.log('⚠️  ATENÇÃO: Algumas variáveis de ambiente não estão definidas.')
    console.log('   Verifique seu arquivo .env')
    console.log()
  }

  return todasDefinidas
}

async function main() {
  console.log('🚀 TESTE DE INTEGRAÇÃO - MERCADO PAGO\n')
  console.log('='.repeat(50))
  console.log()

  // Verificar configuração
  const configOk = await verificarVariaveisAmbiente()
  
  if (!configOk) {
    console.log('❌ Configure as variáveis de ambiente antes de continuar.')
    process.exit(1)
  }

  // Testar checkout
  const checkoutResult = await testarCheckout()

  // Testar webhook
  await testarWebhook()

  console.log('\n' + '='.repeat(50))
  
  if (checkoutResult) {
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!')
    console.log('\n📋 PRÓXIMOS PASSOS:')
    console.log('1. Configure o webhook no painel do Mercado Pago')
    console.log(`   URL: ${BASE_URL}/api/mercadopago/webhook`)
    console.log('2. Teste um pagamento real no ambiente sandbox')
    console.log('3. Configure as credenciais de produção quando estiver pronto')
    
    if (checkoutResult.checkout_url) {
      console.log(`4. Acesse: ${checkoutResult.checkout_url}`)
    }
  } else {
    console.log('❌ TESTE FALHOU - Verifique os logs acima')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testarCheckout,
  testarWebhook,
  verificarVariaveisAmbiente
} 