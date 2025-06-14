import * as api from "./ticket-api-client"

export interface Ticket {
  id: string
  usuario_id: string
  data: string
  quantidade: number
  valor_total: number
  status: "pago" | "pendente" | "cancelado"
  created_at: string
  subsidiado?: boolean
  utilizado?: boolean
  data_utilizacao?: string | null
}

export function generateTicketId() {
  return `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export async function salvarTicket(ticket: Partial<Ticket>) {
  return { sucesso: true, ticket: await api.criar(ticket), erro: null as string | null }
}

export async function buscarTodosTickets() {
  return { tickets: await api.listarTodos(), erro: null as string | null }
}

export async function buscarTicketsUsuario(usuarioId: string) {
  return { tickets: await api.listarPorUsuario(usuarioId), erro: null as string | null }
}

export async function atualizarStatusTicket(ticketId: string, status: Ticket["status"]) {
  return { sucesso: true, ticket: await api.atualizarStatus(ticketId, status), erro: null as string | null }
}

export async function comprarTicket(ticket: Partial<Ticket>) {
  return salvarTicket(ticket)
} 