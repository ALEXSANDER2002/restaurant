"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { useFeedback } from "@/components/feedback-usuario"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Table = keyof Database["public"]["Tables"]
type Event = "INSERT" | "UPDATE" | "DELETE" | "*"

interface SyncOptions<T extends Table> {
  channel?: string
  table: T
  event?: Event
  schema?: string
  filter?: string
  callback?: () => void
  onInsert?: (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>) => void
  onAny?: (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>) => void
  showNotifications?: boolean
}

// Cache global de canais ativos
const activeChannels = new Map<string, { channel: RealtimeChannel; subscribers: number }>()

export function useRealtimeSync<T extends Table>(options: SyncOptions<T>) {
  const {
    channel: channelName,
    table,
    event = "*",
    schema = "public",
    filter,
    callback,
    onInsert,
    onUpdate,
    onDelete,
    onAny,
    showNotifications = false,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]> | null>(null)
  const { mostrarFeedback } = useFeedback()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const channelIdRef = useRef<string>("")

  // Gerar um ID de canal estável baseado nas opções
  const getStableChannelId = useCallback(() => {
    const baseId = channelName || `${table}-${event}-${filter || "no-filter"}`
    return baseId.replace(/[^a-zA-Z0-9-_]/g, "_")
  }, [channelName, table, event, filter])

  // Memoizar a função de setup do canal para evitar recriações desnecessárias
  const setupChannel = useCallback(() => {
    try {
      const stableChannelId = getStableChannelId()
      
      // Verificar se já existe um canal ativo para esta combinação
      const existingChannelData = activeChannels.get(stableChannelId)
      if (existingChannelData) {
        channelRef.current = existingChannelData.channel
        channelIdRef.current = stableChannelId
        existingChannelData.subscribers += 1
        activeChannels.set(stableChannelId, existingChannelData)
        setIsConnected(true)
        return
      }

      // Configurar o canal de tempo real
      const channel = supabase.channel(stableChannelId)

      // Configurar o listener para mudanças no banco
      channel.on(
        'postgres_changes' as never,
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>) => {
          setLastEvent(payload)

          if (callback) {
            callback()
          }

          if (payload.eventType === "INSERT" && onInsert) {
            onInsert(payload)
            if (showNotifications) {
              mostrarFeedback(`Novo registro em ${table}`, "info")
            }
          } else if (payload.eventType === "UPDATE" && onUpdate) {
            onUpdate(payload)
            if (showNotifications) {
              mostrarFeedback(`Registro atualizado em ${table}`, "info")
            }
          } else if (payload.eventType === "DELETE" && onDelete) {
            onDelete(payload)
            if (showNotifications) {
              mostrarFeedback(`Registro excluído em ${table}`, "info")
            }
          }

          if (onAny) {
            onAny(payload)
          }
        },
      )

      // Subscrever no canal
      channel.subscribe((status) => {
        const isSubscribed = status === "SUBSCRIBED"
        setIsConnected(isSubscribed)
        
        if (isSubscribed) {
          activeChannels.set(stableChannelId, { channel, subscribers: 1 })
        }
      })

      // Armazenar referências
      channelRef.current = channel
      channelIdRef.current = stableChannelId

    } catch (error) {
      console.error("Erro ao configurar sincronização em tempo real:", error)
      setIsConnected(false)
    }
  }, [table, event, schema, filter, callback, onInsert, onUpdate, onDelete, onAny, showNotifications, mostrarFeedback, getStableChannelId])

  // Iniciar a sincronização
  useEffect(() => {
    setupChannel()

    // Limpar a assinatura quando o componente for desmontado
    return () => {
      const stableChannelId = getStableChannelId()
      
      // Verificar se outros componentes ainda estão usando este canal
      const channelData = activeChannels.get(stableChannelId)
      if (channelData) {
        channelData.subscribers -= 1
        
        // Remover apenas se este for o último componente usando o canal
        if (channelData.subscribers <= 0) {
          activeChannels.delete(stableChannelId)
          supabase.removeChannel(channelData.channel)
        } else {
          activeChannels.set(stableChannelId, channelData)
        }
      }
      
      channelRef.current = null
      channelIdRef.current = ""
    }
  }, [setupChannel, getStableChannelId])

  return {
    isConnected,
    lastEvent,
    channelId: channelIdRef.current,
  }
}

