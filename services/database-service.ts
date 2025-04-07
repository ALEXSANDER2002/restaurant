import type { Database } from "@/lib/database.types"
import { createClient } from "@supabase/supabase-js"

// Usando as novas credenciais fornecidas
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Criando o cliente Supabase
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

export const databaseService = {
  // Função para verificar a conexão com o banco de dados
  verificarConexao: async () => {
    try {
      const { error } = await supabase.from("perfis").select("id").limit(1)
      return { sucesso: !error, erro: error }
    } catch (error) {
      console.error("Erro ao verificar conexão:", error)
      return { sucesso: false, erro: error }
    }
  },

  // Função para buscar perfis
  buscarPerfis: async () => {
    try {
      const { data, error } = await supabase.from("perfis").select("*").order("nome")

      if (error) throw error

      return { data, erro: null }
    } catch (error) {
      console.error("Erro ao buscar perfis:", error)
      return { data: null, erro: error }
    }
  },

  // Função para buscar tickets
  buscarTickets: async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, perfis(nome)")
        .order("created_at", { ascending: false })

      if (error) throw error

      return { data, erro: null }
    } catch (error) {
      console.error("Erro ao buscar tickets:", error)
      return { data: null, erro: error }
    }
  },

  // Função para buscar estatísticas diárias
  buscarEstatisticasDiarias: async () => {
    try {
      const hoje = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase.from("tickets").select("*").eq("data", hoje)

      if (error) throw error

      // Processar dados para formato de hora
      // Esta é uma implementação simplificada
      const dadosPorHora: Record<
        string,
        { quantidade: number; valor: number; subsidiados: number; naoSubsidiados: number }
      > = {}

      // Inicializar horas de 8 às 15
      for (let i = 8; i <= 15; i++) {
        const hora = `${i.toString().padStart(2, "0")}:00`
        dadosPorHora[hora] = { quantidade: 0, valor: 0, subsidiados: 0, naoSubsidiados: 0 }
      }

      // Processar dados
      if (data) {
        data.forEach((ticket) => {
          const hora = new Date(ticket.created_at).getHours()
          const horaFormatada = `${hora.toString().padStart(2, "0")}:00`

          if (dadosPorHora[horaFormatada]) {
            dadosPorHora[horaFormatada].quantidade += ticket.quantidade
            dadosPorHora[horaFormatada].valor += ticket.valor_total

            if (ticket.subsidiado) {
              dadosPorHora[horaFormatada].subsidiados += ticket.quantidade
            } else {
              dadosPorHora[horaFormatada].naoSubsidiados += ticket.quantidade
            }
          }
        })
      }

      // Converter para array
      const resultado = Object.entries(dadosPorHora).map(([dia, valores]) => ({
        dia,
        ...valores,
      }))

      return { data: resultado, erro: null }
    } catch (error) {
      console.error("Erro ao buscar estatísticas diárias:", error)
      return { data: null, erro: error }
    }
  },

  // Outras funções podem ser adicionadas conforme necessário
}

