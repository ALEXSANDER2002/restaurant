"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFeedback } from "@/components/feedback-usuario"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase" // Corrigido: usando o cliente Supabase correto

export function NotificacaoPedidos() {
  const { perfil } = useAuth()
  const { mostrarFeedback } = useFeedback()
  const router = useRouter()
  const [ultimosPedidos, setUltimosPedidos] = useState<string[]>([])

  // Apenas administradores devem receber notificações de novos pedidos
  const isAdmin = perfil?.tipo === "admin"

  useEffect(() => {
    if (!isAdmin) return

    // Configurar assinatura para atualizações em tempo real
    const channel = supabase
      .channel("tickets-notificacoes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === "INSERT") {
            // Novo pedido
            // Verificar se já notificamos sobre este pedido
            if (!ultimosPedidos.includes(newRecord.id)) {
              mostrarFeedback("Novo pedido recebido!", "info")
              setUltimosPedidos((prev) => [...prev, newRecord.id])
            }
          } else if (eventType === "UPDATE" && oldRecord.status !== newRecord.status) {
            // Atualização de status
            mostrarFeedback(`Pedido ${newRecord.id} atualizado para ${newRecord.status}`, "info")
          }
        },
      )
      .subscribe()

    // Limpar assinatura ao desmontar
    return () => {
      channel.unsubscribe()
    }
  }, [isAdmin, ultimosPedidos, mostrarFeedback])

  // Limpar lista de últimos pedidos periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setUltimosPedidos([])
    }, 60000) // Limpar a cada minuto

    return () => clearInterval(interval)
  }, [])

  // Componente não renderiza nada visualmente
  return null
}

