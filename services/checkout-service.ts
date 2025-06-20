import type { Ticket } from "./ticket-sync-service"

export interface CheckoutParams {
  usuario_id: string
  data: string
  comprarSubsidiado: boolean
  quantidadeNaoSubsidiado: number
}

export interface CheckoutResponse {
  checkout_url: string
  preference_id: string
  external_id: string
  valor_total: number
  descricao: string
  tickets_criados: number
}

export interface CheckoutError {
  erro: string
  detalhes?: string
}

export async function iniciarCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
  try {
    console.log('[CHECKOUT-SERVICE] Iniciando checkout:', params)
    
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(params),
    })

    // Verificar se a resposta é JSON válido
    let json: any
    try {
      json = await res.json()
    } catch (parseError) {
      console.error('[CHECKOUT-SERVICE] Erro ao fazer parse da resposta:', parseError)
      throw new Error("Erro de comunicação com o servidor")
    }

    console.log('[CHECKOUT-SERVICE] Resposta recebida:', {
      status: res.status,
      sucesso: json.sucesso,
      erro: json.erro
    })

    if (!res.ok) {
      // Tratar diferentes tipos de erro HTTP
      if (res.status === 400) {
        throw new Error(json.erro || "Dados de entrada inválidos")
      } else if (res.status === 404) {
        throw new Error(json.erro || "Usuário não encontrado")
      } else if (res.status === 500) {
        throw new Error(json.erro || "Erro interno do servidor")
      } else {
        throw new Error(json.erro || `Erro HTTP ${res.status}`)
      }
    }

    if (!json.sucesso) {
      console.error('[CHECKOUT-SERVICE] Checkout falhou:', json.erro)
      throw new Error(json.erro || "Erro ao processar checkout")
    }

    // Validar campos obrigatórios na resposta
    if (!json.checkout_url) {
      console.error('[CHECKOUT-SERVICE] URL de checkout não recebida')
      throw new Error("URL de pagamento não foi gerada")
    }

    if (!json.preference_id) {
      console.error('[CHECKOUT-SERVICE] ID da preferência não recebido')
      throw new Error("ID da preferência não foi gerado")
    }

    console.log('[CHECKOUT-SERVICE] Checkout concluído com sucesso:', {
      preference_id: json.preference_id,
      valor_total: json.valor_total,
      tickets_criados: json.tickets_criados
    })

    return {
      checkout_url: json.checkout_url,
      preference_id: json.preference_id,
      external_id: json.external_id,
      valor_total: json.valor_total,
      descricao: json.descricao,
      tickets_criados: json.tickets_criados
    }

  } catch (error) {
    console.error('[CHECKOUT-SERVICE] Erro no checkout:', error)
    
    // Re-throw o erro para o componente frontend lidar
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Erro desconhecido ao processar checkout")
    }
  }
} 