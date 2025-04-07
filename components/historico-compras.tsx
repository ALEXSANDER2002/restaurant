"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, QrCode } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { TicketQRCode } from "./ticket-qrcode"
import { buscarTicketsUsuario } from "@/services/ticket-service"
import { supabase } from "@/lib/supabase" // Corrigido: usando o cliente Supabase correto

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

export function HistoricoCompras() {
  const { perfil } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(null)

  useEffect(() => {
    const carregarTickets = async () => {
      if (!perfil) {
        setErro("Usuário não autenticado")
        setCarregando(false)
        return
      }

      try {
        // Usar o serviço de tickets atualizado
        const { tickets: ticketsUsuario, erro: erroTickets } = await buscarTicketsUsuario(perfil.id)

        if (erroTickets) {
          setErro(erroTickets)
          return
        }

        // Ordenar por data de criação (mais recentes primeiro)
        const ticketsOrdenados = [...ticketsUsuario].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )

        setTickets(ticketsOrdenados)
      } catch (error: any) {
        setErro("Erro ao carregar histórico de compras")
        console.error("Erro ao carregar tickets:", error)
      } finally {
        setCarregando(false)
      }
    }

    carregarTickets()

    // Configurar assinatura para atualizações em tempo real
    const subscription = supabase
      .channel("tickets-user-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
          filter: perfil ? `usuario_id=eq.${perfil.id}` : undefined,
        },
        (payload) => {
          // Recarregar tickets quando houver mudanças
          carregarTickets()
        },
      )
      .subscribe()

    // Limpar assinatura ao desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [perfil])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Pago
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

  const getUtilizadoBadge = (ticket: Ticket) => {
    if (ticket.utilizado) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Utilizado
        </Badge>
      )
    }
    return null
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

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Você ainda não possui histórico de compras.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>{format(parseISO(ticket.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell>{ticket.quantidade}</TableCell>
                <TableCell>R$ {ticket.valor_total.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(ticket.status)}
                    {getUtilizadoBadge(ticket)}
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTicketSelecionado(ticket)}
                        disabled={ticket.status !== "pago"}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      {ticketSelecionado && <TicketQRCode ticket={ticketSelecionado} />}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

