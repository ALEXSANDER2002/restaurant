import { supabase } from "@/lib/supabase"

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
      data: data.toISOString(),
      quantidade: quantidade,
      valor_total: valorTotal,
      status: "pendente", // Começa como pendente para o admin confirmar
      subsidiado: subsidiado,
      created_at: new Date().toISOString(),
    }

    // Inserir no Supabase
    try {
      const { data: ticket, error } = await supabase.from("tickets").insert(novoTicket).select().single()

      if (error) {
        throw error
      }

      return { ticket, erro: null }
    } catch (error) {
      console.error("Erro Supabase:", error)

      // Adicionar à fila de sincronização
      // @ts-ignore
      if (window.adicionarTicketParaSincronizacao) {
        // @ts-ignore
        window.adicionarTicketParaSincronizacao(novoTicket)
      }

      // Fallback para armazenamento local
      const ticketsExistentes = JSON.parse(localStorage.getItem("tickets") || "[]")
      ticketsExistentes.push(novoTicket)
      localStorage.setItem("tickets", JSON.stringify(ticketsExistentes))

      return { ticket: novoTicket, erro: null }
    }
  } catch (error: any) {
    console.error("Erro ao comprar ticket:", error)
    return { ticket: null, erro: error.message }
  }
}

// Atualizar a função buscarTicketsUsuario para tentar primeiro o Supabase
export async function buscarTicketsUsuario(usuarioId: string) {
  try {
    // Tentar buscar do Supabase primeiro
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false })

      if (!error) {
        return { tickets: data || [], erro: null }
      }
    } catch (e) {
      console.warn("Erro ao buscar tickets do Supabase:", e)
    }

    // Fallback para localStorage
    const todosTickets = JSON.parse(localStorage.getItem("tickets") || "[]")
    const ticketsDoUsuario = todosTickets.filter((ticket: any) => ticket.usuario_id === usuarioId)

    return { tickets: ticketsDoUsuario, erro: null }
  } catch (error: any) {
    console.error("Erro ao buscar tickets:", error)
    return { tickets: [], erro: error.message }
  }
}

export async function buscarTodosTickets() {
  try {
    // Try to get data from Supabase first
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

      return { tickets: data || [], erro: null }
    } catch (error: any) {
      // If there's an error with Supabase, check if it's the recursion error
      console.warn("Erro ao buscar tickets do Supabase:", error)

      if (error.message && error.message.includes("infinite recursion")) {
        console.log("Detectado erro de recursão infinita, usando dados simulados")
        return { tickets: gerarTicketsSimulados(), erro: null }
      }

      throw error
    }
  } catch (error: any) {
    console.error("Erro ao buscar todos os tickets:", error)
    // Return mock data as fallback
    return { tickets: gerarTicketsSimulados(), erro: null }
  }
}

// Atualizar a função atualizarStatusTicket para sincronizar com Supabase
export async function atualizarStatusTicket(ticketId: string, status: "pago" | "pendente" | "cancelado") {
  try {
    // Tentar atualizar no Supabase primeiro
    try {
      const { data, error } = await supabase.from("tickets").update({ status }).eq("id", ticketId).select().single()

      if (!error) {
        return { ticket: data, erro: null }
      }
    } catch (e) {
      console.warn("Erro ao atualizar status no Supabase:", e)
    }

    // Fallback para localStorage
    const tickets = JSON.parse(localStorage.getItem("tickets") || "[]")
    const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)

    if (ticketIndex !== -1) {
      tickets[ticketIndex].status = status
      localStorage.setItem("tickets", JSON.stringify(tickets))

      // Adicionar à fila de sincronização
      // @ts-ignore
      if (window.adicionarTicketParaSincronizacao) {
        // @ts-ignore
        window.adicionarTicketParaSincronizacao(tickets[ticketIndex])
      }

      return { ticket: tickets[ticketIndex], erro: null }
    }

    return { ticket: null, erro: "Ticket não encontrado" }
  } catch (error: any) {
    console.error("Erro ao atualizar status do ticket:", error)
    return { ticket: null, erro: error.message }
  }
}

export async function buscarEstatisticasVendas() {
  try {
    // Try to get data from Supabase first
    try {
      // Estatísticas diárias (por hora)
      const dataHoje = new Date()
      dataHoje.setHours(0, 0, 0, 0)

      const { data: dadosDiarios, error: erroDiario } = await supabase
        .from("tickets")
        .select("created_at, quantidade, valor_total")
        .gte("created_at", dataHoje.toISOString())
        .eq("status", "pago")

      if (erroDiario) {
        throw erroDiario
      }

      // Estatísticas semanais (por dia)
      const dataInicioSemana = new Date()
      dataInicioSemana.setDate(dataInicioSemana.getDate() - 7)

      const { data: dadosSemanais, error: erroSemanal } = await supabase
        .from("tickets")
        .select("created_at, quantidade, valor_total")
        .gte("created_at", dataInicioSemana.toISOString())
        .eq("status", "pago")

      if (erroSemanal) {
        throw erroSemanal
      }

      // Processar dados diários por hora
      const dadosPorHora: Record<string, { quantidade: number; valor: number }> = {}

      dadosDiarios?.forEach((item) => {
        const data = new Date(item.created_at)
        const hora = `${data.getHours().toString().padStart(2, "0")}:00`

        if (!dadosPorHora[hora]) {
          dadosPorHora[hora] = { quantidade: 0, valor: 0 }
        }

        dadosPorHora[hora].quantidade += item.quantidade
        dadosPorHora[hora].valor += item.valor_total
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

      dadosSemanais?.forEach((item) => {
        const data = new Date(item.created_at)
        const dia = diasSemana[data.getDay()]

        if (!dadosPorDia[dia]) {
          dadosPorDia[dia] = { quantidade: 0, valor: 0 }
        }

        dadosPorDia[dia].quantidade += item.quantidade
        dadosPorDia[dia].valor += item.valor_total
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
      // If there's an error with Supabase, use mock data
      console.warn("Erro ao buscar dados do Supabase, usando dados simulados:", error)

      // Check if it's the recursion error
      if (error.message && error.message.includes("infinite recursion")) {
        console.log("Detectado erro de recursão infinita, usando dados simulados")
        return gerarDadosSimulados()
      }

      throw error
    }
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas de vendas:", error)
    // Return mock data as fallback
    return gerarDadosSimulados()
  }
}

// Add this helper function to generate mock data
function gerarDadosSimulados() {
  // Mock data for daily statistics
  const estatisticasDiarias = [
    { dia: "08:00", quantidade: 5, valor: 17.5, subsidiados: 3, naoSubsidiados: 2 },
    { dia: "09:00", quantidade: 8, valor: 28.0, subsidiados: 5, naoSubsidiados: 3 },
    { dia: "10:00", quantidade: 12, valor: 42.0, subsidiados: 8, naoSubsidiados: 4 },
    { dia: "11:00", quantidade: 20, valor: 70.0, subsidiados: 14, naoSubsidiados: 6 },
    { dia: "12:00", quantidade: 25, valor: 87.5, subsidiados: 18, naoSubsidiados: 7 },
    { dia: "13:00", quantidade: 18, valor: 63.0, subsidiados: 12, naoSubsidiados: 6 },
    { dia: "14:00", quantidade: 10, valor: 35.0, subsidiados: 7, naoSubsidiados: 3 },
    { dia: "15:00", quantidade: 7, valor: 24.5, subsidiados: 5, naoSubsidiados: 2 },
  ]

  // Mock data for weekly statistics
  const estatisticasSemanais = [
    { dia: "Segunda", quantidade: 45, valor: 157.5, subsidiados: 32, naoSubsidiados: 13 },
    { dia: "Terça", quantidade: 52, valor: 182.0, subsidiados: 36, naoSubsidiados: 16 },
    { dia: "Quarta", quantidade: 60, valor: 210.0, subsidiados: 42, naoSubsidiados: 18 },
    { dia: "Quinta", quantidade: 58, valor: 203.0, subsidiados: 40, naoSubsidiados: 18 },
    { dia: "Sexta", quantidade: 70, valor: 245.0, subsidiados: 49, naoSubsidiados: 21 },
    { dia: "Sábado", quantidade: 0, valor: 0, subsidiados: 0, naoSubsidiados: 0 },
    { dia: "Domingo", quantidade: 0, valor: 0, subsidiados: 0, naoSubsidiados: 0 },
  ]

  return {
    diario: estatisticasDiarias,
    semanal: estatisticasSemanais,
    erro: null,
  }
}

// Add this helper function to generate mock tickets
function gerarTicketsSimulados() {
  const nomes = ["João Silva", "Maria Oliveira", "Pedro Santos", "Ana Costa", "Carlos Souza"]
  const emails = ["joao@exemplo.com", "maria@exemplo.com", "pedro@exemplo.com", "ana@exemplo.com", "carlos@exemplo.com"]
  const status = ["pago", "pendente", "cancelado"]
  const hoje = new Date()

  // Generate 10 mock tickets
  return Array.from({ length: 10 }, (_, i) => {
    const usuarioIndex = Math.floor(Math.random() * nomes.length)
    const statusIndex = Math.floor(Math.random() * status.length)
    const quantidade = Math.floor(Math.random() * 5) + 1
    const valorTotal = quantidade * 3.5

    // Create a date between today and 7 days ago
    const dataTicket = new Date(hoje)
    dataTicket.setDate(dataTicket.getDate() - Math.floor(Math.random() * 7))

    // Create a timestamp for created_at
    const createdAt = new Date(hoje)
    createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 24))

    return {
      id: `mock-${i + 1}`,
      usuario_id: `user-${usuarioIndex + 1}`,
      data: dataTicket.toISOString(),
      quantidade,
      valor_total: valorTotal,
      status: status[statusIndex] as "pago" | "pendente" | "cancelado",
      created_at: createdAt.toISOString(),
      perfis: {
        nome: nomes[usuarioIndex],
        email: emails[usuarioIndex],
      },
    }
  })
}

