import { mercadoPagoClient, CheckoutTransparenteParams, PaymentResponse } from './mercado-pago-client'

export interface CheckoutParams {
  usuario_id: string
  data: Date
  quantidadeSubsidiado?: number
  quantidadeNaoSubsidiado?: number
  campus: string
  // Dados específicos do checkout transparente
  paymentMethod: string
  token?: string // Para cartões
  installments?: number
  issuerId?: string
  payer: {
    email: string
    firstName?: string
    lastName?: string
    identification?: {
      type: string
      number: string
    }
  }
}

export interface CheckoutResult {
  success: boolean
  paymentId?: number
  status?: string
  statusDetail?: string
  qrCode?: string
  qrCodeBase64?: string
  ticketUrl?: string
  error?: string
}

export async function iniciarCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  try {
    console.log('[CHECKOUT] Iniciando checkout transparente:', {
      usuario: params.usuario_id,
      data: params.data,
      quantidadeSubsidiado: params.quantidadeSubsidiado,
      quantidadeNaoSubsidiado: params.quantidadeNaoSubsidiado,
      campus: params.campus,
      paymentMethod: params.paymentMethod
    })

    // Calcular valores
    const PRECO_SUBSIDIADO = 5.00
    const PRECO_NAO_SUBSIDIADO = 15.00
    
    const valorSubsidiado = (params.quantidadeSubsidiado || 0) * PRECO_SUBSIDIADO
    const valorNaoSubsidiado = (params.quantidadeNaoSubsidiado || 0) * PRECO_NAO_SUBSIDIADO
    const valorTotal = valorSubsidiado + valorNaoSubsidiado
    
    const quantidadeTotal = (params.quantidadeSubsidiado || 0) + (params.quantidadeNaoSubsidiado || 0)

    // Preparar descrição
    let descricao = `Tickets RU - Campus ${params.campus}`
    if (params.quantidadeSubsidiado && params.quantidadeNaoSubsidiado) {
      descricao += ` (${params.quantidadeSubsidiado} subsidiado${params.quantidadeSubsidiado > 1 ? 's' : ''}, ${params.quantidadeNaoSubsidiado} não subsidiado${params.quantidadeNaoSubsidiado > 1 ? 's' : ''})`
    } else if (params.quantidadeSubsidiado) {
      descricao += ` (${params.quantidadeSubsidiado} subsidiado${params.quantidadeSubsidiado > 1 ? 's' : ''})`
    } else if (params.quantidadeNaoSubsidiado) {
      descricao += ` (${params.quantidadeNaoSubsidiado} não subsidiado${params.quantidadeNaoSubsidiado > 1 ? 's' : ''})`
    }

    // Preparar dados do pagamento
    const paymentData: CheckoutTransparenteParams = {
      transactionAmount: valorTotal,
      description: descricao,
      paymentMethodId: params.paymentMethod,
      token: params.token,
      installments: params.installments,
      issuerId: params.issuerId,
      payer: params.payer,
      campus: params.campus,
      externalReference: `ticket_${params.usuario_id}_${Date.now()}`
    }

    // Criar pagamento
    const payment = await mercadoPagoClient.createPayment(paymentData)

    console.log('[CHECKOUT] Pagamento criado:', {
      id: payment.id,
      status: payment.status,
      method: payment.payment_method_id
    })

    // Preparar resposta baseada no tipo de pagamento
    const result: CheckoutResult = {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail
    }

    // Se for PIX, adicionar dados específicos
    if (params.paymentMethod === 'pix') {
      result.qrCode = payment.point_of_interaction?.transaction_data?.qr_code
      result.qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64
      result.ticketUrl = payment.point_of_interaction?.transaction_data?.ticket_url
    }

    return result

  } catch (error: any) {
    console.error('[CHECKOUT] Erro no checkout:', error)
    
    return {
      success: false,
      error: error.message || 'Erro interno do servidor'
    }
  }
}

// Função para obter métodos de pagamento
export async function obterMetodosPagamento() {
  try {
    const methods = await mercadoPagoClient.getPaymentMethods()
    return methods.filter((method: any) => 
      ['credit_card', 'debit_card', 'pix', 'bolbradesco'].includes(method.id)
    )
  } catch (error: any) {
    console.error('[CHECKOUT] Erro ao obter métodos de pagamento:', error)
    throw error
  }
}

// Função para obter tipos de documento
export async function obterTiposDocumento() {
  try {
    return await mercadoPagoClient.getIdentificationTypes()
  } catch (error: any) {
    console.error('[CHECKOUT] Erro ao obter tipos de documento:', error)
    throw error
  }
} 