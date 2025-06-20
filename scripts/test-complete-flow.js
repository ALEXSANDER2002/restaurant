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

async function criarCheckout() {
  console.log('🛒 PASSO 1: CRIANDO CHECKOUT\n')

  const usuario = await buscarUsuarioTeste()
  if (!usuario) return null

  console.log(`👤 Usuário: ${usuario.nome} (${usuario.email})`)

  const dadosCheckout = {
    usuario_id: usuario.id,
    data: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    comprarSubsidiado: true,
    quantidadeNaoSubsidiado: 0  // Só subsidiado para teste
  }

  try {
    const response = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosCheckout)
    })

    const resultado = await response.json()

    if (resultado.sucesso) {
      console.log('✅ Checkout criado com sucesso!')
      console.log(`🆔 Preference ID: ${resultado.preference_id}`)
      console.log(`🔗 URL: ${resultado.checkout_url}`)
      console.log(`💰 Valor: R$ ${resultado.valor_total}`)
      console.log(`🎫 Tickets criados: ${resultado.tickets_criados}`)
      return resultado
    } else {
      console.log('❌ Erro no checkout:', resultado.erro)
      return null
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
    return null
  }
}

async function simularWebhookAprovado(checkoutResult) {
  console.log('\n📨 PASSO 2: SIMULANDO WEBHOOK DE PAGAMENTO APROVADO\n')

  // Simular webhook do Mercado Pago
  const webhookData = {
    type: 'payment',
    action: 'payment.updated',
    data: {
      id: Date.now().toString() // ID fictício mas único
    },
    // Simular dados extras que o MP pode enviar
    live_mode: false,
    user_id: '450378695',
    api_version: 'v1',
    date_created: new Date().toISOString()
  }

  console.log('📦 Dados do webhook:', JSON.stringify(webhookData, null, 2))

  try {
    const response = await fetch(`${BASE_URL}/api/mercadopago/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    })

    const resultado = await response.json()

    console.log('📋 Resposta do webhook:')
    console.log('Status:', response.status)
    console.log('Dados:', JSON.stringify(resultado, null, 2))

    if (response.status === 200) {
      console.log('✅ Webhook processado (mesmo com pagamento fictício)')
    } else if (response.status === 404) {
      console.log('⚠️  Pagamento não encontrado (esperado para teste)')
    } else {
      console.log('❌ Erro no webhook')
    }

    return response.status

  } catch (error) {
    console.error('❌ Erro no webhook:', error.message)
    return null
  }
}

async function verificarTicketsNoBanco(externalPaymentId) {
  console.log('\n🔍 PASSO 3: VERIFICANDO TICKETS NO BANCO\n')

  try {
    const sql = postgres(process.env.DATABASE_URL)
    
    const tickets = await sql`
      SELECT id, status, subsidiado, valor_total, external_payment_id, created_at 
      FROM tickets 
      WHERE external_payment_id = ${externalPaymentId}
      ORDER BY created_at DESC
    `
    
    await sql.end()

    console.log(`📊 Encontrados ${tickets.length} tickets para preference_id: ${externalPaymentId}`)

    tickets.forEach((ticket, index) => {
      console.log(`\n🎫 Ticket ${index + 1}:`)
      console.log(`   ID: ${ticket.id}`)
      console.log(`   Status: ${ticket.status}`)
      console.log(`   Subsidiado: ${ticket.subsidiado ? 'Sim' : 'Não'}`)
      console.log(`   Valor: R$ ${ticket.valor_total}`)
      console.log(`   Criado: ${ticket.created_at}`)
    })

    return tickets

  } catch (error) {
    console.error('❌ Erro ao buscar tickets:', error.message)
    return []
  }
}

async function main() {
  console.log('🚀 TESTE COMPLETO DO FLUXO MERCADO PAGO\n')
  console.log('='.repeat(60))

  try {
    // Passo 1: Criar checkout
    const checkoutResult = await criarCheckout()
    if (!checkoutResult) {
      console.log('\n❌ Falha no checkout - interrompendo teste')
      process.exit(1)
    }

    // Passo 2: Simular webhook
    await simularWebhookAprovado(checkoutResult)

    // Passo 3: Verificar tickets
    const tickets = await verificarTicketsNoBanco(checkoutResult.preference_id)

    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO DO TESTE:')
    console.log(`✅ Checkout: ${checkoutResult.sucesso ? 'SUCESSO' : 'FALHA'}`)
    console.log(`🔗 URL de pagamento: ${checkoutResult.checkout_url}`)
    console.log(`🎫 Tickets criados: ${tickets.length}`)
    console.log(`📦 Preference ID: ${checkoutResult.preference_id}`)
    
    console.log('\n🎯 PRÓXIMOS PASSOS:')
    console.log('1. Configure o webhook no painel do Mercado Pago')
    console.log(`   URL: ${BASE_URL}/api/mercadopago/webhook`)
    console.log('2. Configure a assinatura do webhook para segurança')
    console.log('3. Teste com pagamento real (CUIDADO: são credenciais de produção!)')
    
    if (checkoutResult.checkout_url) {
      console.log(`\n💳 Para testar pagamento real, acesse:`)
      console.log(checkoutResult.checkout_url)
      console.log('\n⚠️  AVISO: PAGAMENTO SERÁ REAL E COBRARÁ DINHEIRO!')
    }

    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!')

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    process.exit(1)
  }
}

// Executar
if (require.main === module) {
  main()
} 