import { supabase } from "@/lib/supabase"
import { useFeedback } from "@/components/feedback-usuario"

// Tipo para tickets
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
  data_utilizacao?: string
}

// Função para salvar um ticket (tanto no Supabase quanto no localStorage)
export async function salvarTicket(ticket: Ticket): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    // Tentar salvar no Supabase primeiro
    try {
      const { error } = await supabase.from("tickets").insert(ticket)

      if (error) {
        throw error
      }

      // Se não houver erro, salvar também no localStorage como backup
      const ticketsExistentes = JSON.parse(localStorage.getItem("tickets") || "[]")
      ticketsExistentes.push(ticket)
      localStorage.setItem("tickets", JSON.stringify(ticketsExistentes))

      return { sucesso: true }
    } catch (error) {
      console.warn("Erro ao salvar no Supabase, salvando apenas no localStorage:", error)

      // Salvar no localStorage como fallback
      const ticketsExistentes = JSON.parse(localStorage.getItem("tickets") || "[]")
      ticketsExistentes.push(ticket)
      localStorage.setItem("tickets", JSON.stringify(ticketsExistentes))

      return { sucesso: true, erro: "Salvo apenas localmente devido a problemas de conexão" }
    }
  } catch (error: any) {
    console.error("Erro ao salvar ticket:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Função para buscar todos os tickets
export async function buscarTodosTickets(): Promise<{ tickets: Ticket[]; erro?: string }> {
  try {
    // Tentar buscar do Supabase primeiro
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          perfis (nome, email)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return { tickets: data || [] }
    } catch (error) {
      console.warn("Erro ao buscar do Supabase, usando localStorage:", error)

      // Usar localStorage como fallback
      const ticketsLocais = JSON.parse(localStorage.getItem("tickets") || "[]")
      return {
        tickets: ticketsLocais,
        erro: "Exibindo dados locais devido a problemas de conexão",
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar tickets:", error)

    // Último recurso: retornar array vazio
    return { tickets: [], erro: error.message }
  }
}

// Função para buscar tickets de um usuário específico
export async function buscarTicketsUsuario(usuarioId: string): Promise<{ tickets: Ticket[]; erro?: string }> {
  try {
    // Tentar buscar do Supabase primeiro
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return { tickets: data || [] }
    } catch (error) {
      console.warn("Erro ao buscar do Supabase, usando localStorage:", error)

      // Usar localStorage como fallback
      const ticketsLocais = JSON.parse(localStorage.getItem("tickets") || "[]")
      const ticketsDoUsuario = ticketsLocais.filter((t: Ticket) => t.usuario_id === usuarioId)

      return {
        tickets: ticketsDoUsuario,
        erro: "Exibindo dados locais devido a problemas de conexão",
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar tickets do usuário:", error)

    // Último recurso: retornar array vazio
    return { tickets: [], erro: error.message }
  }
}

// Função para atualizar o status de um ticket
export async function atualizarStatusTicket(
  ticketId: string,
  status: "pago" | "pendente" | "cancelado",
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    // Tentar atualizar no Supabase primeiro
    try {
      const { error } = await supabase.from("tickets").update({ status }).eq("id", ticketId)

      if (error) {
        throw error
      }

      // Se não houver erro, atualizar também no localStorage
      const ticketsExistentes = JSON.parse(localStorage.getItem("tickets") || "[]")
      const ticketIndex = ticketsExistentes.findIndex((t: Ticket) => t.id === ticketId)

      if (ticketIndex !== -1) {
        ticketsExistentes[ticketIndex].status = status
        localStorage.setItem("tickets", JSON.stringify(ticketsExistentes))
      }

      return { sucesso: true }
    } catch (error) {
      console.warn("Erro ao atualizar no Supabase, atualizando apenas no localStorage:", error)

      // Atualizar no localStorage como fallback
      const ticketsExistentes = JSON.parse(localStorage.getItem("tickets") || "[]")
      const ticketIndex = ticketsExistentes.findIndex((t: Ticket) => t.id === ticketId)

      if (ticketIndex !== -1) {
        ticketsExistentes[ticketIndex].status = status
        localStorage.setItem("tickets", JSON.stringify(ticketsExistentes))

        return { sucesso: true, erro: "Atualizado apenas localmente devido a problemas de conexão" }
      } else {
        return { sucesso: false, erro: "Ticket não encontrado no armazenamento local" }
      }
    }
  } catch (error: any) {
    console.error("Erro ao atualizar status do ticket:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Hook para configurar uma assinatura em tempo real para tickets
export function useTicketSubscription(callback: () => void) {
  const { mostrarFeedback } = useFeedback()

  // Configurar assinatura para mudanças na tabela tickets
  const configurarAssinatura = () => {
    try {
      const channel = supabase
        .channel("tickets-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tickets",
          },
          (payload) => {
            console.log("Mudança detectada:", payload)

            // Notificar sobre a mudança
            if (payload.eventType === "INSERT") {
              mostrarFeedback("Novo ticket adicionado", "info")
            } else if (payload.eventType === "UPDATE") {
              mostrarFeedback("Ticket atualizado", "info")
            }

            // Executar callback para atualizar dados
            callback()
          },
        )
        .subscribe()

      // Retornar função para cancelar assinatura
      return () => {
        channel.unsubscribe()
      }
    } catch (error) {
      console.error("Erro ao configurar assinatura em tempo real:", error)
      return () => {}
    }
  }

  return { configurarAssinatura }
}

