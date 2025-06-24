import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"
import { mercadoPagoClient, CheckoutTransparenteParams } from "@/services/mercado-pago-client"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[CHECKOUT-API] Dados recebidos:', body)

    const {
      usuario_id,
      data,
      quantidadeSubsidiado = 0,
      quantidadeNaoSubsidiado = 0,
      campus,
      paymentMethod,
      token,
      installments,
      issuerId,
      payer
    } = body

    // Validações básicas
    if (!usuario_id) {
      return NextResponse.json({ erro: "ID do usuário é obrigatório" }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ erro: "Data é obrigatória" }, { status: 400 })
    }

    if (!campus || !["1", "2", "3"].includes(campus)) {
      return NextResponse.json({ erro: "Campus deve ser 1, 2 ou 3" }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ erro: "Método de pagamento é obrigatório" }, { status: 400 })
    }

    // Mapear métodos de pagamento para IDs corretos do Mercado Pago
    const paymentMethodMapping: { [key: string]: string } = {
      'pix': 'pix',
      'credit_card': 'visa', // será sobrescrito pela detecção automática
      'debit_card': 'debvisa', // será sobrescrito pela detecção automática
      'visa': 'visa',
      'master': 'master',
      'mastercard': 'master',
      'elo': 'elo',
      'hipercard': 'hipercard',
      'amex': 'amex'
    }

    // Usar o método mapeado ou o original
    const mappedPaymentMethod = paymentMethodMapping[paymentMethod] || paymentMethod
    
    console.log('[CHECKOUT-API] Método de pagamento:', {
      original: paymentMethod,
      mapped: mappedPaymentMethod
    })

    if (!payer?.email) {
      return NextResponse.json({ erro: "Email do pagador é obrigatório" }, { status: 400 })
    }

    // Verificar se há pelo menos uma quantidade
    const totalQuantidade = quantidadeSubsidiado + quantidadeNaoSubsidiado
    if (totalQuantidade <= 0) {
      return NextResponse.json({ erro: "Deve comprar pelo menos 1 ticket" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const usuario = await db
      .select()
      .from(perfis)
      .where(eq(perfis.id, usuario_id))
      .limit(1)

    if (!usuario.length) {
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 })
    }

    // Calcular valores
    const PRECO_SUBSIDIADO = 5.00
    const PRECO_NAO_SUBSIDIADO = 15.00
    
    const valorSubsidiado = quantidadeSubsidiado * PRECO_SUBSIDIADO
    const valorNaoSubsidiado = quantidadeNaoSubsidiado * PRECO_NAO_SUBSIDIADO
    const valorTotal = valorSubsidiado + valorNaoSubsidiado

    // Preparar descrição
    let descricao = `Tickets RU - Campus ${campus}`
    if (quantidadeSubsidiado && quantidadeNaoSubsidiado) {
      descricao += ` (${quantidadeSubsidiado} subsidiado${quantidadeSubsidiado > 1 ? 's' : ''}, ${quantidadeNaoSubsidiado} não subsidiado${quantidadeNaoSubsidiado > 1 ? 's' : ''})`
    } else if (quantidadeSubsidiado) {
      descricao += ` (${quantidadeSubsidiado} subsidiado${quantidadeSubsidiado > 1 ? 's' : ''})`
    } else if (quantidadeNaoSubsidiado) {
      descricao += ` (${quantidadeNaoSubsidiado} não subsidiado${quantidadeNaoSubsidiado > 1 ? 's' : ''})`
    }

    // Preparar external reference único
    const externalReference = `ticket_${usuario_id}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

    // Preparar dados do pagamento
    const paymentData: CheckoutTransparenteParams = {
      transactionAmount: valorTotal,
      description: descricao,
      paymentMethodId: mappedPaymentMethod,
      token: token,
      installments: installments,
      issuerId: issuerId,
      payer: {
        email: payer.email,
        firstName: payer.firstName,
        lastName: payer.lastName,
        identification: payer.identification
      },
      campus: campus,
      externalReference: externalReference
    }

    console.log('[CHECKOUT-API] Criando pagamento:', {
      amount: valorTotal,
      method: mappedPaymentMethod,
      reference: externalReference,
      hasToken: !!token,
      issuerId: issuerId,
      payerEmail: payer.email
    })

    console.log('[CHECKOUT-API] Dados completos do pagamento:', JSON.stringify(paymentData, null, 2))

    // Criar pagamento no Mercado Pago
    const payment = await mercadoPagoClient.createPayment(paymentData)

    console.log('[CHECKOUT-API] Pagamento criado:', {
      id: payment.id,
      status: payment.status,
      method: payment.payment_method_id
    })

    // Criar tickets no banco (apenas se o pagamento foi criado com sucesso)
    const agora = new Date()
    const dataAlmoco = new Date(data)
    const ticketsParaInserir = []

    // Criar tickets subsidiados
    for (let i = 0; i < quantidadeSubsidiado; i++) {
      const ticketId = crypto.randomUUID()
      const qrCode = `SIRUS_TICKET_${ticketId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      
      ticketsParaInserir.push({
        id: ticketId,
        usuario_id,
        data: dataAlmoco,
        quantidade: "1",
        valor_total: PRECO_SUBSIDIADO.toFixed(2),
        status: payment.status === 'approved' ? 'pago' : 'pendente',
        created_at: agora,
        updated_at: agora,
        subsidiado: true,
        utilizado: false,
        external_payment_id: payment.id.toString(),
        campus: campus,
        qr_code: qrCode,
        utilizado_por: null,
      })
    }

    // Criar tickets não subsidiados
    for (let i = 0; i < quantidadeNaoSubsidiado; i++) {
      const ticketId = crypto.randomUUID()
      const qrCode = `SIRUS_TICKET_${ticketId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      
      ticketsParaInserir.push({
        id: ticketId,
        usuario_id,
        data: dataAlmoco,
        quantidade: "1",
        valor_total: PRECO_NAO_SUBSIDIADO.toFixed(2),
        status: payment.status === 'approved' ? 'pago' : 'pendente',
        created_at: agora,
        updated_at: agora,
        subsidiado: false,
        utilizado: false,
        external_payment_id: payment.id.toString(),
        campus: campus,
        qr_code: qrCode,
        utilizado_por: null,
      })
    }

    // Inserir tickets no banco
    if (ticketsParaInserir.length > 0) {
      await db.insert(tickets).values(ticketsParaInserir)
      console.log('[CHECKOUT-API] Tickets criados:', ticketsParaInserir.length)
    }

    // Preparar resposta baseada no tipo de pagamento
    const response: any = {
      success: true,
      payment_id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: externalReference,
      valor_total: valorTotal,
      descricao: descricao,
      tickets_criados: ticketsParaInserir.length
    }

    // Se for PIX, adicionar dados específicos
    if (mappedPaymentMethod === 'pix') {
      response.qr_code = payment.point_of_interaction?.transaction_data?.qr_code
      response.qr_code_base64 = payment.point_of_interaction?.transaction_data?.qr_code_base64
      response.ticket_url = payment.point_of_interaction?.transaction_data?.ticket_url
    }

    console.log('[CHECKOUT-API] Checkout concluído:', {
      payment_id: payment.id,
      status: payment.status,
      tickets: ticketsParaInserir.length
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('[CHECKOUT-API] Erro no checkout:', error)
    
    return NextResponse.json({ 
      erro: error.message || "Erro interno do servidor",
      success: false
    }, { status: 500 })
  }
}

// API para obter métodos de pagamento disponíveis
export async function GET(req: NextRequest) {
  try {
    const methods = await mercadoPagoClient.getPaymentMethods()
    
    // Filtrar apenas os métodos que queremos suportar
    const supportedMethods = methods.filter((method: any) => 
      ['credit_card', 'debit_card', 'pix', 'bolbradesco'].includes(method.id)
    )

    return NextResponse.json({
      success: true,
      payment_methods: supportedMethods
    })

  } catch (error: any) {
    console.error('[CHECKOUT-API] Erro ao obter métodos de pagamento:', error)
    
    return NextResponse.json({ 
      erro: error.message || "Erro ao obter métodos de pagamento",
      success: false
    }, { status: 500 })
  }
} 