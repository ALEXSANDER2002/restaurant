import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { eq, and, desc, gte } from "drizzle-orm"

export interface Ticket {
  id: string
  usuario_id: string
  data: string
  quantidade: number
  valor_total: number
  status: "pago" | "pendente" | "cancelado"
  created_at: string
  subsidiado?: boolean
}

// Atualizar a função comprarTicket para usar o Supabase e emitir eventos
export async function comprarTicket(
  usuarioId: string,
  data: Date,
  quantidade: number,
  valorTotal: number,
  subsidiado = false,
) {
  try {
    // Gerar um ID único para o ticket
    const ticketId = crypto.randomUUID()

    // Criar o objeto do ticket
    const novoTicket = {
      id: ticketId,
      usuario_id: usuarioId,
      data,
      quantidade: quantidade.toString(),
      valor_total: valorTotal.toString(),
      status: "pendente", // Começa como pendente para o admin confirmar
      subsidiado: subsidiado,
      created_at: new Date(),
    }

    // Inserir via Drizzle
    const [ticket] = await db.insert(tickets).values(novoTicket).returning()

    return { ticket, erro: null }
  } catch (error: any) {
    console.error("Erro ao comprar ticket:", error)
    return { ticket: null, erro: error.message }
  }
}

// Atualizar a função buscarTicketsUsuario para tentar primeiro o Supabase
export async function buscarTicketsUsuario(usuarioId: string) {
  try {
    const lista = await db.select().from(tickets).where(eq(tickets.usuario_id, usuarioId)).orderBy(desc(tickets.created_at))
    return { tickets: lista, erro: null }
  } catch (error: any) {
    console.error("Erro ao buscar tickets:", error)
    return { tickets: [], erro: error.message }
  }
}

export async function buscarTodosTickets() {
  try {
    const rows = await db
      .select({
        id: tickets.id,
        usuario_id: tickets.usuario_id,
        data: tickets.data,
        quantidade: tickets.quantidade,
        valor_total: tickets.valor_total,
        status: tickets.status,
        created_at: tickets.created_at,
        subsidiado: tickets.subsidiado,
        nome: perfis.nome,
        email: perfis.email,
      })
      .from(tickets)
      .leftJoin(perfis, eq(perfis.id, tickets.usuario_id))
      .orderBy(desc(tickets.created_at))

    return { tickets: rows, erro: null }
  } catch (error: any) {
    console.error("Erro ao buscar todos os tickets:", error)
    return { tickets: [], erro: error.message }
  }
}

// Atualizar a função atualizarStatusTicket para sincronizar com Supabase
export async function atualizarStatusTicket(ticketId: string, status: "pago" | "pendente" | "cancelado") {
  try {
    // Tentar atualizar no Supabase primeiro
    const [updated] = await db.update(tickets).set({ status }).where(eq(tickets.id, ticketId)).returning()
    return { ticket: updated, erro: null }
  } catch (e) {
    console.warn("Erro ao atualizar status no banco:", e)
    return { ticket: null, erro: "Erro ao atualizar status do ticket" }
  }
}

export async function buscarEstatisticasVendas() {
  try {
    // Try to get data from Supabase first
    try {
      // Estatísticas diárias (por hora)
      const dataHoje = new Date()
      dataHoje.setHours(0, 0, 0, 0)

      const dadosDiarios = await db
        .select({
          created_at: tickets.created_at,
          quantidade: tickets.quantidade,
          valor_total: tickets.valor_total,
        })
        .from(tickets)
        .where(and(eq(tickets.status, "pago"), gte(tickets.created_at, dataHoje)))

      // Estatísticas semanais (por dia)
      const dataInicioSemana = new Date()
      dataInicioSemana.setDate(dataInicioSemana.getDate() - 7)

      const dadosSemanais = await db
        .select({
          created_at: tickets.created_at,
          quantidade: tickets.quantidade,
          valor_total: tickets.valor_total,
        })
        .from(tickets)
        .where(and(eq(tickets.status, "pago"), gte(tickets.created_at, dataInicioSemana)))

      // Processar dados diários por hora
      const dadosPorHora: Record<string, { quantidade: number; valor: number }> = {}

      dadosDiarios.forEach((item) => {
        if (!item.created_at) return
        const data = new Date(item.created_at)
        const hora = `${data.getHours().toString().padStart(2, "0")}:00`

        if (!dadosPorHora[hora]) {
          dadosPorHora[hora] = { quantidade: 0, valor: 0 }
        }

        dadosPorHora[hora].quantidade += Number(item.quantidade)
        dadosPorHora[hora].valor += Number(item.valor_total)
      })

      const estatisticasDiarias = Object.entries(dadosPorHora)
        .map(([hora, dados]) => ({
          dia: hora,
          quantidade: dados.quantidade,
          valor: dados.valor,
        }))
        .sort((a, b) => a.dia.localeCompare(b.dia))

      // Processar dados semanais por dia
      const dadosPorDia: Record<string, { quantidade: number; valor: number }> = {}
      const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

      dadosSemanais.forEach((item) => {
        if (!item.created_at) return
        const data = new Date(item.created_at)
        const dia = diasSemana[data.getDay()]

        if (!dadosPorDia[dia]) {
          dadosPorDia[dia] = { quantidade: 0, valor: 0 }
        }

        dadosPorDia[dia].quantidade += Number(item.quantidade)
        dadosPorDia[dia].valor += Number(item.valor_total)
      })

      // Ordenar dias da semana corretamente
      const ordemDias = { Segunda: 1, Terça: 2, Quarta: 3, Quinta: 4, Sexta: 5, Sábado: 6, Domingo: 7 }

      const estatisticasSemanais = Object.entries(dadosPorDia)
        .map(([dia, dados]) => ({
          dia,
          quantidade: dados.quantidade,
          valor: dados.valor,
        }))
        .sort((a, b) => ordemDias[a.dia as keyof typeof ordemDias] - ordemDias[b.dia as keyof typeof ordemDias])

      return {
        diario: estatisticasDiarias,
        semanal: estatisticasSemanais,
        erro: null,
      }
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas de vendas:", error)
      return { diario: [], semanal: [], erro: error.message }
    }
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas de vendas:", error)
    return { diario: [], semanal: [], erro: error.message }
  }
}

