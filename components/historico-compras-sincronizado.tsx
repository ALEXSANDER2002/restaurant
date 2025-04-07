"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, QrCode, Info, RefreshCw, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { TicketQRCode } from "./ticket-qrcode"
import { buscarTicketsUsuario } from "@/services/ticket-sync-service"
import { useRealtimeSync } from "@/hooks/use-realtime-sync"
import { useFeedback } from "@/components/feedback-usuario"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"
import { TicketIcon } from "@/components/icons/ticket-icon"

interface TicketData {
  id: string
  data_compra: string
  valor: number
  status: string
  subsidiado: boolean
  utilizado: boolean
}

interface SupabaseTicketRaw {
  id: string
  usuario_id: string
  data: string
  quantidade: number
  valor_total: number
  status: "pendente" | "pago" | "cancelado"
  created_at: string
  updated_at?: string
  subsidiado?: boolean
  utilizado?: boolean
  data_utilizacao?: string
  perfis?: {
    nome: string
    email: string
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function HistoricoComprasSincronizado() {
  const { perfil } = useAuth()
  const { mostrarFeedback } = useFeedback()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ticketSelecionado, setTicketSelecionado] = useState<TicketData | null>(null)
  const [atualizacoes, setAtualizacoes] = useState<string[]>([])
  const [conectado, setConectado] = useState(false)

  const converterParaTicketData = (ticket: SupabaseTicketRaw): TicketData | null => {
    if (!ticket?.id || !ticket?.data) {
      console.warn("Ticket com dados incompletos:", ticket)
      return null
    }

    return {
      id: ticket.id,
      data_compra: ticket.data,
      valor: ticket.valor_total,
      status: ticket.status,
      subsidiado: ticket.subsidiado || false,
      utilizado: ticket.utilizado || false
    }
  }

  // Função para verificar conexão
  const verificarConexao = async () => {
    try {
      const { data, error } = await supabase.from("tickets").select("count")
      setConectado(!error)
      return !error
    } catch {
      setConectado(false)
      return false
    }
  }

  // Verificar conexão periodicamente
  useEffect(() => {
    verificarConexao()
    const interval = setInterval(verificarConexao, 30000) // Verificar a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  // Função para carregar tickets
  const carregarPedidos = async () => {
    if (!perfil?.id) {
      setErro("Usuário não autenticado")
      setCarregando(false)
      return
    }

    try {
      setCarregando(true)
      setErro(null)
      setAviso(null)

      // Se o ID não estiver no formato UUID, usar dados simulados
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(perfil.id)) {
        console.log("ID do usuário não está no formato UUID:", perfil.id)
        setAviso("Exibindo dados locais para usuário de teste")
        setTickets(gerarPedidosSimulados())
        return
      }

      // Verificar se o Supabase está disponível
      const { data: testData, error: testError } = await supabase.from("tickets").select("count")
      
      if (testError) {
        console.log("Erro ao testar conexão:", testError)
        const mensagemErro = testError.message || "Erro desconhecido ao testar conexão"
        setAviso(`Exibindo dados locais devido a problemas de conexão: ${mensagemErro}`)
        // Carregar dados simulados
        setTickets(gerarPedidosSimulados())
        return
      }

      // Se a conexão está ok, buscar dados reais
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("usuario_id", perfil.id)
        .order("data", { ascending: false }) as { data: SupabaseTicketRaw[] | null, error: any }

      if (error) {
        const errorDetails = {
          codigo: error?.code || "UNKNOWN",
          mensagem: error?.message || "Erro desconhecido",
          detalhes: error?.details || "Sem detalhes adicionais",
          dica: error?.hint || "Nenhuma dica disponível"
        }
        
        console.error("Erro ao carregar pedidos:", errorDetails)
        
        // Se o erro for relacionado ao formato do UUID, usar dados simulados
        if (error.message?.includes("invalid input syntax for type uuid")) {
          console.log("Usando dados simulados devido a erro de UUID")
          setAviso("Exibindo dados locais para usuário de teste")
          setTickets(gerarPedidosSimulados())
          return
        }
        
        // Tentar identificar o tipo de erro
        let mensagemUsuario = "Erro ao carregar pedidos"
        if (error.code === "PGRST301") {
          mensagemUsuario = "Erro de conexão com o banco de dados"
        } else if (error.code === "PGRST204") {
          mensagemUsuario = "Dados não encontrados"
        } else if (error.code?.startsWith("AUTH")) {
          mensagemUsuario = "Erro de autenticação"
        }

        setErro(`${mensagemUsuario}: ${errorDetails.mensagem}`)
        return
      }

      if (!tickets) {
        console.warn("Nenhum dado retornado da consulta")
        setTickets([])
        return
      }

      // Validar a estrutura dos dados antes de processar
      if (!Array.isArray(tickets)) {
        console.error("Dados retornados não são um array:", tickets)
        setErro("Formato de dados inválido")
        return
      }

      const ticketsFormatados = tickets
        .map(converterParaTicketData)
        .filter((ticket): ticket is TicketData => ticket !== null)

      setTickets(ticketsFormatados)
      setConectado(true)
    } catch (error: any) {
      console.error("Erro ao carregar pedidos:", {
        tipo: error?.constructor?.name || "Desconhecido",
        mensagem: error?.message || "Erro desconhecido",
        stack: error?.stack,
        erro: error
      })
      
      let mensagemErro = "Erro ao carregar pedidos"
      if (error?.message && error.message !== "{}") {
        mensagemErro += `: ${error.message}`
      }
      if (error?.code) {
        mensagemErro += ` (código: ${error.code})`
      }
      
      setErro(mensagemErro)
      setTickets(gerarPedidosSimulados())
      setConectado(false)
    } finally {
      setCarregando(false)
    }
  }

  // Função para gerar dados simulados
  const gerarPedidosSimulados = (): TicketData[] => {
    const quantidadePedidos = Math.floor(Math.random() * 5) + 3 // 3 a 7 pedidos
    const pedidosSimulados: TicketData[] = []

    for (let i = 0; i < quantidadePedidos; i++) {
      const data = new Date()
      data.setDate(data.getDate() - i)

      pedidosSimulados.push({
        id: `mock-${i}`,
        data_compra: data.toISOString().split("T")[0],
        valor: 5.0 * (Math.floor(Math.random() * 3) + 1),
        status: "pago",
        subsidiado: Math.random() < 0.5,
        utilizado: Math.random() < 0.5
      })
    }

    return pedidosSimulados
  }

  const isSupabaseTicket = (obj: any): obj is SupabaseTicketRaw => {
    return obj && typeof obj === "object" && "id" in obj
  }

  // Configurar sincronização em tempo real
  useEffect(() => {
    if (!perfil?.id) return

    const channel = supabase
      .channel("tickets-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tickets",
          filter: `usuario_id=eq.${perfil.id}`,
        },
        (payload: RealtimePostgresChangesPayload<SupabaseTicketRaw>) => {
          if (payload.new && isSupabaseTicket(payload.new)) {
            const novoTicket = converterParaTicketData(payload.new)
            if (novoTicket) {
              setTickets((prev) => [novoTicket, ...prev])
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tickets",
          filter: `usuario_id=eq.${perfil.id}`,
        },
        (payload: RealtimePostgresChangesPayload<SupabaseTicketRaw>) => {
          if (payload.new && isSupabaseTicket(payload.new)) {
            const ticketAtualizado = converterParaTicketData(payload.new)
            if (ticketAtualizado) {
              setTickets((prev) =>
                prev.map((ticket) =>
                  ticket.id === ticketAtualizado.id ? ticketAtualizado : ticket
                )
              )
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tickets",
          filter: `usuario_id=eq.${perfil.id}`,
        },
        (payload: RealtimePostgresChangesPayload<SupabaseTicketRaw>) => {
          if (payload.old && isSupabaseTicket(payload.old)) {
            setTickets((prev) => prev.filter((ticket) => ticket.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [perfil?.id])

  // Carregar tickets iniciais
  useEffect(() => {
    carregarPedidos()
  }, [perfil])

  // Remover destaque de atualizações após 5 segundos
  useEffect(() => {
    if (atualizacoes.length > 0) {
      const timer = setTimeout(() => {
        setAtualizacoes([])
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [atualizacoes])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Pago
            </div>
          </Badge>
        )
      case "pendente":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Pendente
            </div>
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Cancelado
            </div>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium px-3 py-1">
            {status}
          </Badge>
        )
    }
  }

  const getUtilizadoBadge = (ticket: TicketData) => {
    if (ticket.utilizado) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Utilizado
          </div>
        </Badge>
      )
    }
    return null
  }

  const handleShowQRCode = (ticket: TicketData) => {
    // Implementar lógica para exibir QR Code
    console.log("Exibindo QR Code para ticket:", ticket.id)
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (erro) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{erro}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!conectado && (
        <Alert variant="warning" className="mb-6">
          <AlertTitle className="text-amber-800 font-medium">
            Visualizando dados locais
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Você está visualizando dados locais pois não foi possível conectar ao servidor.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Histórico de Compras</h2>
        <Badge variant="outline" className={cn(
          "px-3 py-1 font-medium",
          conectado 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              conectado ? "bg-emerald-500" : "bg-red-500"
            )} />
            {conectado ? "Sincronizado" : "Offline"}
          </div>
        </Badge>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(ticket.status)}
                  {getUtilizadoBadge(ticket)}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Ticket #{ticket.id.slice(-6)}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comprado em {new Date(ticket.data_compra).toLocaleDateString()}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Valor</p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(ticket.valor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Subsidiado</p>
                    <p className="font-medium text-gray-900">
                      {ticket.subsidiado ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={() => handleShowQRCode(ticket)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Ver QR Code
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <TicketIcon className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nenhum ticket encontrado
          </h3>
          <p className="text-gray-600">
            Você ainda não possui nenhum ticket comprado.
          </p>
        </div>
      )}
    </div>
  )
}

