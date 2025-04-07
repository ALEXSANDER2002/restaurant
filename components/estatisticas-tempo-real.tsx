"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { useRealtimeSync } from "@/hooks/use-realtime-sync"
import type { Database } from "@/lib/database.types"

type Ticket = Database["public"]["Tables"]["tickets"]["Row"]

export function EstatisticasTempoReal() {
  const [ticketsHoje, setTicketsHoje] = useState(0)
  const [valorHoje, setValorHoje] = useState(0)
  const [ultimosTickets, setUltimosTickets] = useState<Ticket[]>([])
  const [carregando, setCarregando] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const hoje = new Date().toISOString().split("T")[0]

        // Carregar tickets de hoje
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("*")
          .gte("created_at", hoje)
          .lte("created_at", hoje + "T23:59:59")

        if (ticketsError) {
          console.error("Erro ao carregar tickets:", ticketsError)
          return
        }

        // Filtrar tickets pagos
        const ticketsPagos = ticketsData?.filter((ticket) => ticket.status === "pago") || []

        // Calcular estatísticas
        setTicketsHoje(ticketsPagos.length)
        setValorHoje(ticketsPagos.reduce((total, ticket) => total + (ticket.valor_total || 0), 0))

        // Ordenar por data de criação e pegar os 5 últimos
        const ultimos = [...ticketsPagos].sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }).slice(0, 5)

        setUltimosTickets(ultimos)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    carregarDados()
  }, [])

  // Usar o hook useRealtimeSync para atualizações em tempo real
  useRealtimeSync({
    table: "tickets",
    event: "*",
    onInsert: (payload) => {
      const { new: newRecord } = payload
      const hoje = new Date().toISOString().split("T")[0]
      const ticketDate = new Date(newRecord.created_at).toISOString().split("T")[0]

      if (ticketDate === hoje && newRecord.status === "pago") {
        setTicketsHoje((prev) => prev + 1)
        setValorHoje((prev) => prev + (newRecord.valor_total || 0))
        setUltimosTickets((prev) => [newRecord, ...prev].slice(0, 5))
      }
    },
    onUpdate: (payload) => {
      const { new: newRecord, old: oldRecord } = payload
      const hoje = new Date().toISOString().split("T")[0]
      const ticketDate = new Date(newRecord.created_at).toISOString().split("T")[0]

      if (ticketDate === hoje) {
        // Se o status mudou para pago
        if (oldRecord.status !== "pago" && newRecord.status === "pago") {
          setTicketsHoje((prev) => prev + 1)
          setValorHoje((prev) => prev + (newRecord.valor_total || 0))
          setUltimosTickets((prev) => [newRecord, ...prev].slice(0, 5))
        }
        // Se o status mudou de pago para outro
        else if (oldRecord.status === "pago" && newRecord.status !== "pago") {
          setTicketsHoje((prev) => prev - 1)
          setValorHoje((prev) => prev - (newRecord.valor_total || 0))
          setUltimosTickets((prev) => prev.filter((t) => t.id !== newRecord.id))
        }
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade em Tempo Real</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm text-muted-foreground">Tickets Hoje</div>
            <div className="text-2xl font-bold">{ticketsHoje}</div>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm text-muted-foreground">Valor Total</div>
            <div className="text-2xl font-bold">R$ {valorHoje.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Últimos Tickets</h3>
          {ultimosTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum ticket hoje</p>
          ) : (
            <ul className="space-y-2">
              {ultimosTickets.map((ticket) => (
                <li key={ticket.id} className="text-sm border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">#{ticket.id.substring(0, 8)}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      R$ {ticket.valor_total.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">{new Date(ticket.created_at).toLocaleTimeString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

