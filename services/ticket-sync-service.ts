export interface Ticket {
  id: string
  usuario_id: string
  tipo: string
  status: string
  valor: number
  qr_code?: string
  created_at: string
  updated_at: string
  utilizado?: boolean
  data_utilizacao?: string
  mercadopago_payment_id?: string
  mercadopago_status?: string
}

// Buscar todos os tickets
export async function buscarTodosTickets(): Promise<{
  tickets: Ticket[]
  erro?: string
}> {
  try {
    const response = await fetch("/api/admin/tickets")
    
    if (!response.ok) {
      throw new Error("Erro ao buscar tickets")
    }

    const data = await response.json()
    return { tickets: data.tickets || [] }
  } catch (error: any) {
    console.error("[TicketSync] Erro ao buscar tickets:", error)
    return { tickets: [], erro: error.message }
  }
}

// Atualizar status de um ticket
export async function atualizarStatusTicket(
  ticketId: string,
  novoStatus: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const response = await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: novoStatus }),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar status do ticket")
    }

    return { sucesso: true }
  } catch (error: any) {
    console.error("[TicketSync] Erro ao atualizar ticket:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Buscar tickets de um usuário específico
export async function buscarTicketsUsuario(
  usuarioId: string
): Promise<{ tickets: Ticket[]; erro?: string }> {
  try {
    const response = await fetch(`/api/tickets?usuario_id=${usuarioId}`)

    if (!response.ok) {
      throw new Error("Erro ao buscar tickets do usuário")
    }

    const data = await response.json()
    return { tickets: data.tickets || [] }
  } catch (error: any) {
    console.error("[TicketSync] Erro ao buscar tickets do usuário:", error)
    return { tickets: [], erro: error.message }
  }
}

// Validar um ticket
export async function validarTicket(
  ticketId: string
): Promise<{ sucesso: boolean; erro?: string; ticket?: Ticket }> {
  try {
    const response = await fetch(`/api/tickets/${ticketId}/validar`, {
      method: "POST",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.erro || "Erro ao validar ticket")
    }

    const data = await response.json()
    return { sucesso: true, ticket: data.ticket }
  } catch (error: any) {
    console.error("[TicketSync] Erro ao validar ticket:", error)
    return { sucesso: false, erro: error.message }
  }
}

