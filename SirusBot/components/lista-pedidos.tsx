"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Search, X, AlertCircle, Info } from "lucide-react"
import { buscarTodosTickets, atualizarStatusTicket, type Ticket } from "@/services/ticket-sync-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PedidoExibicao extends Ticket {
  usuario_nome?: string
  nome?: string
  email?: string
  campus?: string
  utilizado?: boolean
  data_utilizacao?: string
}

export function ListaPedidos() {
  const [pedidos, setPedidos] = useState<PedidoExibicao[]>([])
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoExibicao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busca, setBusca] = useState("")

  // Função auxiliar para formatar valor monetário de forma segura
  const formatarValor = (valor: any): string => {
    if (valor === null || valor === undefined) return "0,00"
    
    const numeroValor = typeof valor === 'string' ? parseFloat(valor) : valor
    
    if (isNaN(numeroValor)) return "0,00"
    
    return numeroValor.toFixed(2).replace('.', ',')
  }

  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        setCarregando(true)
        const { tickets, erro: erroTickets } = await buscarTodosTickets()

        if (erroTickets) {
          setErro(erroTickets)
          return
        }

        // Transformar os dados para o formato esperado
        const pedidosFormatados = tickets.map((ticket: any) => ({
          ...ticket,
          usuario_nome: ticket.nome ?? "Usuário",
        }))

        setPedidos(pedidosFormatados)
        setPedidosFiltrados(pedidosFormatados)

        // Se estamos usando dados simulados, mostrar um aviso
        if (tickets.length > 0 && tickets[0].id.startsWith("mock-")) {
          setAviso(
            "Exibindo dados simulados devido a um erro de conexão com o banco de dados. Alguns recursos podem estar limitados.",
          )
        }
      } catch (error: any) {
        console.error("Erro ao carregar pedidos:", error)
        setErro("Erro ao carregar pedidos. Tente novamente mais tarde.")
      } finally {
        setCarregando(false)
      }
    }

    carregarPedidos()
  }, [])

  useEffect(() => {
    if (busca.trim() === "") {
      setPedidosFiltrados(pedidos)
    } else {
      const filtrados = pedidos.filter(
        (pedido) =>
          pedido.id.toLowerCase().includes(busca.toLowerCase()) ||
          (pedido.usuario_nome && pedido.usuario_nome.toLowerCase().includes(busca.toLowerCase())),
      )
      setPedidosFiltrados(filtrados)
    }
  }, [busca, pedidos])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Confirmado
          </Badge>
        )
      case "pendente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const confirmarPedido = async (id: string) => {
    try {
      // Se estamos usando dados simulados, apenas atualizar o estado local
      if (id.startsWith("mock-")) {
        setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, status: "pago" } : pedido)))
        setAviso("Operação simulada: o pedido foi marcado como confirmado localmente.")
        return
      }

      const { ticket, erro } = await atualizarStatusTicket(id, "pago")

      if (erro) {
        setErro(erro)
        return
      }

      if (ticket) {
        setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, status: "pago" } : pedido)))
      }
    } catch (error: any) {
      setErro("Erro ao confirmar pedido")
      console.error("Erro ao confirmar pedido:", error)
    }
  }

  const cancelarPedido = async (id: string) => {
    try {
      // Se estamos usando dados simulados, apenas atualizar o estado local
      if (id.startsWith("mock-")) {
        setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, status: "cancelado" } : pedido)))
        setAviso("Operação simulada: o pedido foi marcado como cancelado localmente.")
        return
      }

      const { ticket, erro } = await atualizarStatusTicket(id, "cancelado")

      if (erro) {
        setErro(erro)
        return
      }

      if (ticket) {
        setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, status: "cancelado" } : pedido)))
      }
    } catch (error: any) {
      setErro("Erro ao cancelar pedido")
      console.error("Erro ao cancelar pedido:", error)
    }
  }

  // Mapear campus para exibição
  const getCampusInfo = (campus: string | undefined) => {
    const campusMap = {
      "1": { nome: "Campus 1", local: "Nova Marabá - Folha 31", cor: "bg-blue-50 text-blue-700 border-blue-200" },
      "2": { nome: "Campus 2", local: "Nova Marabá - Folha 17", cor: "bg-green-50 text-green-700 border-green-200" },
      "3": { nome: "Campus 3", local: "Cidade Jardim - Marabá", cor: "bg-purple-50 text-purple-700 border-purple-200" },
    }
    
    return campusMap[campus as keyof typeof campusMap] || { 
      nome: "Campus 1", 
      local: "Nova Marabá - Folha 31", 
      cor: "bg-gray-50 text-gray-700 border-gray-200" 
    }
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
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
    <div className="space-y-4">
      {aviso && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Aviso</AlertTitle>
          <AlertDescription className="text-blue-700">{aviso}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID ou nome do usuário..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Utilização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.map((pedido) => {
                const campusInfo = getCampusInfo(pedido.campus)
                return (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[120px] truncate" title={pedido.id}>
                        {pedido.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={pedido.usuario_nome}>
                        {pedido.usuario_nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(parseISO(pedido.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(pedido.data), "EEEE", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={campusInfo.cor}>
                        <div className="flex flex-col items-center text-xs">
                          <span className="font-medium">{campusInfo.nome}</span>
                          <span className="text-[10px] opacity-75">{campusInfo.local}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {pedido.subsidiado ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Subsidiado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                            Não Subsidiado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {pedido.quantidade}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {formatarValor(pedido.valor_total)}
                    </TableCell>
                    <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                    <TableCell>
                      {pedido.status === "pago" ? (
                        pedido.utilizado ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                              ✅ Utilizado
                            </Badge>
                            {pedido.data_utilizacao && (
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(pedido.data_utilizacao), "dd/MM HH:mm", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            🎫 Disponível
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                          - - -
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {pedido.status === "pendente" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                            onClick={() => confirmarPedido(pedido.id)}
                            aria-label="Confirmar pedido"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => cancelarPedido(pedido.id)}
                            aria-label="Cancelar pedido"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

