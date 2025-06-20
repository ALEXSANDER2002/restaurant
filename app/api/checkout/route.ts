import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { and, eq, gte, lt } from "drizzle-orm"
import { mercadoPagoClient } from "@/services/mercado-pago-client"
import crypto from "crypto"

const PRECO_SUBSIDIADO = 2.0
const PRECO_NAO_SUBSIDIADO = 13.0

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { usuario_id, data, comprarSubsidiado, quantidadeNaoSubsidiado } = body as {
      usuario_id: string
      data: string
      comprarSubsidiado: boolean
      quantidadeNaoSubsidiado: number
    }

    console.log('[CHECKOUT] Iniciando processo de checkout:', {
      usuario_id,
      data,
      comprarSubsidiado,
      quantidadeNaoSubsidiado
    })

    // Validações básicas
    if (!usuario_id || !data) {
      console.error('[CHECKOUT] Dados inválidos:', { usuario_id, data })
      return NextResponse.json({ 
        sucesso: false, 
        erro: "Usuário e data são obrigatórios" 
      }, { status: 400 })
    }

    if (!comprarSubsidiado && (!quantidadeNaoSubsidiado || quantidadeNaoSubsidiado <= 0)) {
      console.error('[CHECKOUT] Quantidade inválida:', { quantidadeNaoSubsidiado })
      return NextResponse.json({ 
        sucesso: false, 
        erro: "Selecione pelo menos um tipo de ticket" 
      }, { status: 400 })
    }

    // Buscar dados do usuário
    const usuario = await db
      .select()
      .from(perfis)
      .where(eq(perfis.id, usuario_id))
      .limit(1)

    if (usuario.length === 0) {
      console.error('[CHECKOUT] Usuário não encontrado:', usuario_id)
      return NextResponse.json({ 
        sucesso: false, 
        erro: "Usuário não encontrado" 
      }, { status: 404 })
    }

    const dadosUsuario = usuario[0]

    // Configurar data do almoço
    const dataAlmoco = new Date(data)
    dataAlmoco.setHours(12, 0, 0, 0) // Meio-dia
    const inicioDia = new Date(dataAlmoco)
    inicioDia.setHours(0, 0, 0, 0)
    const fimDia = new Date(dataAlmoco)
    fimDia.setHours(23, 59, 59, 999)

    console.log('[CHECKOUT] Verificando período:', {
      dataAlmoco: dataAlmoco.toISOString(),
      inicioDia: inicioDia.toISOString(),
      fimDia: fimDia.toISOString()
    })

    // Regra de negócio: apenas 1 ticket subsidiado por dia por usuário
    if (comprarSubsidiado) {
      const ticketsSubsidiadosExistentes = await db
        .select()
        .from(tickets)
        .where(
          and(
            eq(tickets.usuario_id, usuario_id),
            eq(tickets.subsidiado, true),
            gte(tickets.data, inicioDia),
            lt(tickets.data, fimDia),
            // Considerar apenas tickets não cancelados
            eq(tickets.status, "pago") // ou pendente
          ),
        )

      if (ticketsSubsidiadosExistentes.length > 0) {
        console.warn('[CHECKOUT] Ticket subsidiado já existe para o dia:', {
          existentes: ticketsSubsidiadosExistentes.length,
          data: data
        })
        return NextResponse.json({ 
          sucesso: false, 
          erro: "Já existe um ticket subsidiado para este dia" 
        }, { status: 400 })
      }
    }

    // Calcular total
    const valorSubsidiado = comprarSubsidiado ? PRECO_SUBSIDIADO : 0
    const valorNaoSubsidiado = (quantidadeNaoSubsidiado || 0) * PRECO_NAO_SUBSIDIADO
    const valorTotal = valorSubsidiado + valorNaoSubsidiado

    console.log('[CHECKOUT] Cálculo de valores:', {
      comprarSubsidiado,
      quantidadeNaoSubsidiado,
      valorSubsidiado,
      valorNaoSubsidiado,
      valorTotal
    })

    if (valorTotal <= 0) {
      console.error('[CHECKOUT] Valor total inválido:', valorTotal)
      return NextResponse.json({ 
        sucesso: false, 
        erro: "Valor total deve ser maior que zero" 
      }, { status: 400 })
    }

    // Gerar ID único para o pedido
    const external_id = `ticket_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

    // Montar descrição detalhada
    const itens = []
    if (comprarSubsidiado) {
      itens.push("1x Ticket Subsidiado")
    }
    if (quantidadeNaoSubsidiado > 0) {
      itens.push(`${quantidadeNaoSubsidiado}x Ticket${quantidadeNaoSubsidiado > 1 ? 's' : ''} Não Subsidiado${quantidadeNaoSubsidiado > 1 ? 's' : ''}`)
    }
    const descricao = `Almoço ${new Intl.DateTimeFormat('pt-BR').format(dataAlmoco)} - ${itens.join(' + ')}`

    console.log('[CHECKOUT] Criando preferência no Mercado Pago:', {
      external_id,
      descricao,
      valorTotal
    })

    // Configurar URLs de retorno
    const baseUrl = process.env.APP_URL || `http://localhost:3000`
    
    // Criar preferência no Mercado Pago (Checkout Pro)
    try {
      const preferencia = await mercadoPagoClient.createPreference({
        items: [
          {
            id: external_id,
            title: descricao,
            quantity: 1,
            unit_price: valorTotal,
            currency_id: "BRL",
            description: `Sistema Restaurante Universitário - ${descricao}`
          }
        ],
        payer: {
          name: dadosUsuario.nome,
          email: dadosUsuario.email,
          identification: {
            type: "CPF",
            number: dadosUsuario.email // Usar email como fallback se não tiver CPF
          }
        },
        back_urls: {
          success: `${baseUrl}/usuario?pagamento=sucesso`,
          failure: `${baseUrl}/usuario?pagamento=erro`,
          pending: `${baseUrl}/usuario?pagamento=pendente`
        },
        external_reference: external_id,
        statement_descriptor: "RESTAURANTE UNIVERSITARIO",
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        metadata: {
          usuario_id: usuario_id,
          data_almoco: data,
          subsidiado: comprarSubsidiado,
          quantidade_nao_subsidiado: quantidadeNaoSubsidiado || 0,
          tipo: 'ticket_almoco'
        }
      })

      console.log('[CHECKOUT] Preferência criada com sucesso:', {
        preference_id: preferencia.id,
        init_point: preferencia.init_point
      })

      // Criar tickets no banco (status pendente)
      const ticketsParaInserir: any[] = []
      const agora = new Date()

      if (comprarSubsidiado) {
        ticketsParaInserir.push({
          id: crypto.randomUUID(),
          usuario_id,
          data: dataAlmoco,
          quantidade: "1", // String conforme schema
          valor_total: PRECO_SUBSIDIADO.toFixed(2), // String conforme schema
          status: "pendente",
          created_at: agora,
          updated_at: agora,
          subsidiado: true,
          utilizado: false,
          external_payment_id: preferencia.id,
        })
      }

      for (let i = 0; i < (quantidadeNaoSubsidiado || 0); i++) {
        ticketsParaInserir.push({
          id: crypto.randomUUID(),
          usuario_id,
          data: dataAlmoco,
          quantidade: "1", // String conforme schema
          valor_total: PRECO_NAO_SUBSIDIADO.toFixed(2), // String conforme schema
          status: "pendente",
          created_at: agora,
          updated_at: agora,
          subsidiado: false,
          utilizado: false,
          external_payment_id: preferencia.id,
        })
      }

      console.log('[CHECKOUT] Inserindo tickets no banco:', {
        quantidade: ticketsParaInserir.length,
        external_payment_id: preferencia.id
      })

      const ticketsCriados = await db.insert(tickets).values(ticketsParaInserir).returning()

      console.log('[CHECKOUT] Checkout concluído com sucesso:', {
        tickets_criados: ticketsCriados.length,
        preference_id: preferencia.id,
        external_id: external_id,
        valor_total: valorTotal
      })

      return NextResponse.json({ 
        sucesso: true, 
        checkout_url: preferencia.init_point,
        preference_id: preferencia.id,
        external_id: external_id,
        valor_total: valorTotal,
        descricao: descricao,
        tickets_criados: ticketsCriados.length
      })

    } catch (mercadopagoError: any) {
      console.error('[CHECKOUT] Erro na API do Mercado Pago:', mercadopagoError)
      
      // Tentar extrair mensagem de erro mais específica
      let mensagemErro = "Erro ao processar pagamento"
      if (mercadopagoError.message) {
        if (mercadopagoError.message.includes('amount')) {
          mensagemErro = "Valor do pagamento inválido"
        } else if (mercadopagoError.message.includes('payer')) {
          mensagemErro = "Dados do cliente inválidos"
        } else if (mercadopagoError.message.includes('items')) {
          mensagemErro = "Dados do produto inválidos"
        } else {
          mensagemErro = mercadopagoError.message
        }
      }

      return NextResponse.json({ 
        sucesso: false, 
        erro: mensagemErro,
        detalhes: process.env.NODE_ENV === 'development' ? mercadopagoError.message : undefined
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("[CHECKOUT] Erro interno:", error)
    return NextResponse.json({ 
      sucesso: false, 
      erro: "Erro interno do servidor",
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
} 