"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buscarTodosTickets, atualizarStatusTicket } from "@/services/ticket-sync-service"
import { useRealtimeSync } from "@/hooks/use-realtime-sync"
import { useFeedback } from "@/components/feedback-usuario"
import { TabelaPedidos } from "@/components/tabela-pedidos"
import type { Database } from "@/lib/database.types"
import { usePaginacao } from "@/hooks/use-paginacao"
import { useAuth } from "@/contexts/auth-context"

type Ticket = Database["public"]["Tables"]["tickets"]["Row"]
type PedidoExibicao = Omit<Ticket, "updated_at"> & {
  updated_at?: string
  usuario_nome?: string
}

type OrdenacaoColuna = {
  coluna: keyof PedidoExibicao
  direcao: "asc" | "desc"
}

const ITENS_POR_PAGINA = 10

export function ListaPedidosSincronizada() {
  const { perfil } = useAuth()
  const [pedidos, setPedidos] = useState<PedidoExibicao[]>([])
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoExibicao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busca, setBusca] = useState("")
  const [ordenacao, setOrdenacao] = useState<OrdenacaoColuna>({ coluna: "created_at", direcao: "desc" })
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  const [acaoConfirmacao, setAcaoConfirmacao] = useState<{
    pedidoId: string
    novoStatus: "pago" | "pendente" | "cancelado"
    descricao: string
  } | null>(null)
  const { mostrarFeedback } = useFeedback()

  // Configurar paginação
  const {
    dadosPaginados: pedidosProcessados,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    totalItens,
  } = usePaginacao({
    dados: useMemo(() => {
      // Ordenar
      return [...pedidosFiltrados].sort((a, b) => {
        const valorA = a[ordenacao.coluna]
        const valorB = b[ordenacao.coluna]

        if (valorA === undefined || valorB === undefined) return 0

        const comparacao =
          typeof valorA === "string"
            ? valorA.localeCompare(String(valorB))
            : Number(valorA) - Number(valorB)

        return ordenacao.direcao === "asc" ? comparacao : -comparacao
      })
    }, [pedidosFiltrados, ordenacao]),
    itensPorPagina: ITENS_POR_PAGINA,
  })

  // Função para carregar pedidos
  const carregarPedidos = async () => {
    try {
      setCarregando(true)
      setErro(null)
      setAviso(null)

      const { tickets, erro } = await buscarTodosTickets()

      if (erro) {
        // Se o erro for de autenticação e o perfil existe, é um erro de conexão
        if (erro.includes("não autenticado") && perfil) {
          setErro("Erro ao carregar pedidos. Tente novamente mais tarde.")
        } else {
          setErro(erro)
        }
        return
      }

      // Transformar os dados para o formato esperado
      const pedidosFormatados: PedidoExibicao[] = tickets.map((ticket) => ({
        ...ticket,
        usuario_nome: ticket.perfis?.nome || "Usuário desconhecido",
      }))

      setPedidos(pedidosFormatados)
      setPedidosFiltrados(pedidosFormatados)

      // Se estamos usando dados simulados
      if (tickets.length > 0 && tickets[0].id.startsWith("mock-")) {
        setAviso("Exibindo dados simulados. Alguns recursos podem estar limitados.")
      }
    } catch (error: any) {
      setErro("Erro ao carregar pedidos: " + error.message)
      console.error("Erro ao carregar pedidos:", error)
    } finally {
      setCarregando(false)
    }
  }

  // Efeito para carregar pedidos iniciais
  useEffect(() => {
    if (perfil) {
      carregarPedidos()
    } else {
      setErro("Usuário não autenticado. Por favor, faça login.")
    }
  }, [perfil])

  // Configurar sincronização em tempo real
  const { isConnected } = useRealtimeSync({
    channel: "tickets-changes",
    table: "tickets",
    event: "*",
    callback: carregarPedidos,
  })

  // Função para atualizar status do pedido
  const atualizarStatus = async (pedidoId: string, novoStatus: "pago" | "pendente" | "cancelado") => {
    try {
      const { sucesso, erro } = await atualizarStatusTicket(pedidoId, novoStatus)

      if (sucesso) {
        mostrarFeedback("Status atualizado com sucesso!", "sucesso")
        carregarPedidos()
      } else {
        mostrarFeedback(erro || "Erro ao atualizar status", "erro")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error)
      mostrarFeedback("Erro ao atualizar status", "erro")
    }
  }

  // Função para ordenar pedidos
  const ordenarPedidos = (coluna: keyof PedidoExibicao) => {
    const novaDirecao = ordenacao.coluna === coluna && ordenacao.direcao === "asc" ? "desc" : "asc"
    setOrdenacao({ coluna, direcao: novaDirecao })
  }

  // Função para filtrar pedidos
  const filtrarPedidos = (busca: string) => {
    setBusca(busca)
    setPaginaAtual(1) // Resetar para primeira página ao filtrar
    
    if (!busca.trim()) {
      setPedidosFiltrados(pedidos)
      return
    }

    const buscaLower = busca.toLowerCase()
    const filtrados = pedidos.filter(
      (pedido) =>
        pedido.usuario_nome?.toLowerCase().includes(buscaLower) ||
        pedido.id.toLowerCase().includes(buscaLower) ||
        pedido.status.toLowerCase().includes(buscaLower),
    )
    setPedidosFiltrados(filtrados)
  }

  // Função para abrir confirmação
  const abrirConfirmacao = (pedidoId: string, novoStatus: "pago" | "pendente" | "cancelado") => {
    const descricao = novoStatus === "pago" ? "confirmar" : "cancelar"
    setAcaoConfirmacao({ pedidoId, novoStatus, descricao })
    setConfirmacaoAberta(true)
  }

  // Função para confirmar ação
  const confirmarAcao = async () => {
    if (!acaoConfirmacao) return

    await atualizarStatus(acaoConfirmacao.pedidoId, acaoConfirmacao.novoStatus)
    setConfirmacaoAberta(false)
    setAcaoConfirmacao(null)
  }

  return (
    <div className="space-y-4">
      {/* Alertas e avisos */}
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {aviso && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Aviso</AlertTitle>
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}

      {/* Status da conexão */}
      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sem conexão</AlertTitle>
          <AlertDescription>
            Você está offline. Os dados serão sincronizados quando a conexão for restabelecida.
          </AlertDescription>
        </Alert>
      )}

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID, usuário ou status..."
          className="pl-8"
          value={busca}
          onChange={(e) => filtrarPedidos(e.target.value)}
        />
      </div>

      {/* Tabela de pedidos */}
      <TabelaPedidos
        pedidos={pedidosProcessados}
        carregando={carregando}
        ordenacao={ordenacao}
        onOrdenar={ordenarPedidos}
        onAtualizarStatus={abrirConfirmacao}
      />

      {/* Paginação */}
      {!carregando && pedidosFiltrados.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {indiceInicial + 1} a {indiceFinal} de {totalItens} pedidos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual(Math.max(paginaAtual - 1, 1))}
              disabled={paginaAtual === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual(Math.min(paginaAtual + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <AlertDialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja {acaoConfirmacao?.descricao} este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAcaoConfirmacao(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarAcao}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

