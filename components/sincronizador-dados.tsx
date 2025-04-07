"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFeedback } from "@/components/feedback-usuario"
import { supabase } from "@/lib/supabase"

// Chave para armazenamento local de tickets pendentes de sincronização
const PENDING_SYNC_KEY = "ru_pending_sync_tickets"

export function SincronizadorDados() {
  const { perfil } = useAuth()
  const { mostrarFeedback } = useFeedback()
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Verificar status de conexão
  useEffect(() => {
    // Definir estado inicial
    setIsOnline(navigator.onLine)

    // Adicionar event listeners para mudanças de status de conexão
    const handleOnline = () => {
      setIsOnline(true)
      sincronizarDadosPendentes()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Limpar event listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Sincronizar dados pendentes quando o usuário estiver online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      sincronizarDadosPendentes()
    }
  }, [isOnline, perfil])

  // Sincronizar dados periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!isOnline) return

    const interval = setInterval(
      () => {
        sincronizarDadosPendentes()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [isOnline])

  // Função para sincronizar dados pendentes
  const sincronizarDadosPendentes = async () => {
    if (!isOnline || isSyncing || !perfil) return

    try {
      setIsSyncing(true)

      // Obter tickets pendentes de sincronização
      const pendingTicketsJson = localStorage.getItem(PENDING_SYNC_KEY)
      if (!pendingTicketsJson) {
        setIsSyncing(false)
        return
      }

      const pendingTickets = JSON.parse(pendingTicketsJson)
      if (!pendingTickets.length) {
        setIsSyncing(false)
        return
      }

      // Sincronizar cada ticket pendente
      let syncedCount = 0
      let failedCount = 0

      for (const ticket of pendingTickets) {
        try {
          // Verificar se o ticket já existe no Supabase
          const { data: existingTicket } = await supabase.from("tickets").select("id").eq("id", ticket.id).single()

          if (existingTicket) {
            // Se o ticket já existe, atualizar
            const { error: updateError } = await supabase.from("tickets").update(ticket).eq("id", ticket.id)

            if (updateError) throw updateError
          } else {
            // Se o ticket não existe, inserir
            const { error: insertError } = await supabase.from("tickets").insert(ticket)

            if (insertError) throw insertError
          }

          syncedCount++
        } catch (error) {
          console.error("Erro ao sincronizar ticket:", error)
          failedCount++
        }
      }

      // Remover tickets sincronizados do armazenamento local
      if (syncedCount > 0) {
        localStorage.removeItem(PENDING_SYNC_KEY)
        mostrarFeedback(`${syncedCount} tickets sincronizados com sucesso!`, "sucesso")
      }

      if (failedCount > 0) {
        mostrarFeedback(`${failedCount} tickets não puderam ser sincronizados.`, "erro")
      }

      setLastSyncTime(new Date())
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Adicionar ticket à fila de sincronização
  const adicionarTicketParaSincronizacao = (ticket: any) => {
    try {
      const pendingTicketsJson = localStorage.getItem(PENDING_SYNC_KEY) || "[]"
      const pendingTickets = JSON.parse(pendingTicketsJson)

      // Verificar se o ticket já está na fila
      const existingIndex = pendingTickets.findIndex((t: any) => t.id === ticket.id)

      if (existingIndex >= 0) {
        // Atualizar ticket existente
        pendingTickets[existingIndex] = ticket
      } else {
        // Adicionar novo ticket
        pendingTickets.push(ticket)
      }

      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingTickets))

      // Tentar sincronizar imediatamente se estiver online
      if (isOnline) {
        sincronizarDadosPendentes()
      }
    } catch (error) {
      console.error("Erro ao adicionar ticket para sincronização:", error)
    }
  }

  // Expor função de sincronização globalmente
  useEffect(() => {
    // @ts-ignore
    window.adicionarTicketParaSincronizacao = adicionarTicketParaSincronizacao
  }, [])

  // Este componente não renderiza nada visualmente
  return null
}

