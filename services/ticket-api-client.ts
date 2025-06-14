import type { Ticket } from "./ticket-service"

const BASE_URL = "/api/tickets"

export async function listarTodos(): Promise<Ticket[]> {
  const res = await fetch(BASE_URL, { cache: "no-store" })
  const json = await res.json()
  if (!json.sucesso) throw new Error(json.erro || "Erro ao listar tickets")
  return json.data
}

export async function listarPorUsuario(usuarioId: string): Promise<Ticket[]> {
  const res = await fetch(`${BASE_URL}?usuario_id=${usuarioId}`, { cache: "no-store" })
  const json = await res.json()
  if (!json.sucesso) throw new Error(json.erro || "Erro ao listar tickets do usuário")
  return json.data
}

export async function criar(ticket: Partial<Ticket>): Promise<Ticket> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticket),
  })
  const json = await res.json()
  if (!json.sucesso) throw new Error(json.erro || "Erro ao criar ticket")
  return json.ticket
}

export async function atualizarStatus(ticketId: string, status: Ticket["status"]): Promise<Ticket> {
  const res = await fetch(`${BASE_URL}/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const json = await res.json()
  if (!json.sucesso) throw new Error(json.erro || "Erro ao atualizar status")
  return json.ticket
} 