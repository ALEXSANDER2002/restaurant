import { NextRequest, NextResponse } from "next/server"
import { mercadoPagoClient, MP_STATUS_MAPPING } from "@/services/mercado-pago-client"
import { db } from "@/lib/drizzle"
import { tickets } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"
import { validateMercadoPagoWebhook } from "@/lib/webhook-validator"

export async function POST(req: NextRequest) {
  try {
    console.log('[WEBHOOK] Recebido webhook do Mercado Pago')

    // Obter corpo da requisição como texto para validação
    const bodyText = await req.text()
    console.log('[WEBHOOK] Corpo recebido (tamanho):', bodyText.length, 'bytes')

    // Validar assinatura do webhook (apenas em produção)
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
    if (webhookSecret && process.env.NODE_ENV === 'production') {
      const signature = req.headers.get('x-signature')
      const isValid = validateMercadoPagoWebhook(bodyText, signature, webhookSecret)
      
      if (!isValid) {
        console.error('[WEBHOOK] Assinatura inválida - webhook rejeitado')
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
      }
    } else {
      console.log('[WEBHOOK] Validação de assinatura pulada (desenvolvimento)')
    }

    // Parse do JSON
    const body = JSON.parse(bodyText)
    console.log('[WEBHOOK] Dados recebidos:', JSON.stringify(body, null, 2))

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      console.log('[WEBHOOK] Tipo de notificação ignorada:', body.type || body.action)
      return NextResponse.json({ message: "Tipo de notificação não tratada" }, { status: 200 })
    }

    // Extrair ID do pagamento
    const paymentId = body.data?.id
    if (!paymentId) {
      console.error('[WEBHOOK] ID do pagamento não encontrado no webhook')
      return NextResponse.json({ error: "ID do pagamento não encontrado" }, { status: 400 })
    }

    console.log('[WEBHOOK] Processando pagamento ID:', paymentId)

    // Buscar detalhes do pagamento no Mercado Pago
    let pagamento
    try {
      pagamento = await mercadoPagoClient.getPayment(paymentId.toString())
    } catch (error: any) {
      console.error('[WEBHOOK] Erro ao consultar pagamento no Mercado Pago:', error)
      return NextResponse.json({ 
        error: "Erro ao consultar pagamento",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 })
    }

    console.log('[WEBHOOK] Dados do pagamento:', {
      id: pagamento.id,
      status: pagamento.status,
      external_reference: pagamento.external_reference,
      transaction_amount: pagamento.transaction_amount
    })

    // Verificar se temos external_reference
    if (!pagamento.external_reference) {
      console.error('[WEBHOOK] External reference não encontrado no pagamento')
      return NextResponse.json({ error: "External reference não encontrado" }, { status: 400 })
    }

    // Buscar tickets relacionados ao pagamento
    const ticketsRelacionados = await db
      .select()
      .from(tickets)
      .where(eq(tickets.external_payment_id, pagamento.external_reference))

    if (ticketsRelacionados.length === 0) {
      console.warn('[WEBHOOK] Nenhum ticket encontrado para external_reference:', pagamento.external_reference)
      return NextResponse.json({ 
        message: "Nenhum ticket encontrado para este pagamento",
        external_reference: pagamento.external_reference
      }, { status: 404 })
    }

    console.log('[WEBHOOK] Tickets encontrados:', {
      quantidade: ticketsRelacionados.length,
      external_reference: pagamento.external_reference
    })

    // Mapear status do Mercado Pago para nosso sistema
    const statusMercadoPago = pagamento.status as keyof typeof MP_STATUS_MAPPING
    const novoStatus = MP_STATUS_MAPPING[statusMercadoPago] || 'pendente'

    console.log('[WEBHOOK] Mapeamento de status:', {
      status_mercadopago: pagamento.status,
      status_sistema: novoStatus
    })

    // Atualizar status dos tickets
    let ticketsAtualizados = 0
    for (const ticket of ticketsRelacionados) {
      if (ticket.status !== novoStatus) {
        await db
          .update(tickets)
          .set({
            status: novoStatus,
            updated_at: new Date()
          })
          .where(eq(tickets.id, ticket.id))
        
        ticketsAtualizados++
        
        console.log('[WEBHOOK] Ticket atualizado:', {
          ticket_id: ticket.id,
          status_anterior: ticket.status,
          status_novo: novoStatus
        })
      }
    }

    console.log('[WEBHOOK] Processamento concluído:', {
      payment_id: pagamento.id,
      external_reference: pagamento.external_reference,
      status: pagamento.status,
      tickets_atualizados: ticketsAtualizados,
      total_tickets: ticketsRelacionados.length
    })

    return NextResponse.json({
      message: "Webhook processado com sucesso",
      payment_id: pagamento.id,
      external_reference: pagamento.external_reference,
      status: pagamento.status,
      tickets_atualizados: ticketsAtualizados
    }, { status: 200 })

  } catch (error: any) {
    console.error('[WEBHOOK] Erro no processamento:', error)
    return NextResponse.json({
      error: "Erro interno no processamento do webhook",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Endpoint GET para verificação de saúde
export async function GET() {
  return NextResponse.json({
    message: "Webhook do Mercado Pago está funcionando",
    timestamp: new Date().toISOString(),
    status: "healthy"
  })
} 