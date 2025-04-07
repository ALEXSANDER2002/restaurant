"use client"

import { useState, useEffect } from "react"
import { supabase, cleanupRealtimeSubscriptions } from "@/lib/supabase/client"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Table = keyof Database["public"]["Tables"]

export function useSupabase() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [subscriptions, setSubscriptions] = useState<RealtimeChannel[]>([])

  // Check connection on mount and cleanup on unmount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase.from("perfis").select("count").limit(1)
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
        console.error("Supabase connection error:", error)
      }
    }

    checkConnection()

    // Cleanup function
    return () => {
      // Limpar todas as inscrições ao desmontar
      cleanupRealtimeSubscriptions()
      setSubscriptions([])
    }
  }, [])

  /**
   * Subscribe to realtime changes on a table with automatic cleanup
   */
  const subscribeToTable = <T extends Table>(
    table: T,
    callback: (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>) => void,
    filter?: {
      event?: "INSERT" | "UPDATE" | "DELETE" | "*"
      schema?: string
      filter?: string
    },
  ) => {
    const { event = "*", schema = "public", filter: filterString } = filter || {}

    // Criar um ID único para o canal
    const channelId = `table-changes-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event,
          schema,
          table,
          filter: filterString,
        },
        (payload) => {
          callback(payload as RealtimePostgresChangesPayload<Database["public"]["Tables"][T]["Row"]>)
        },
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelId}:`, status)
      })

    setSubscriptions((prev) => [...prev, channel])

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from ${channelId}`)
      supabase.removeChannel(channel)
      setSubscriptions((prev) => prev.filter((sub) => sub !== channel))
    }
  }

  return {
    supabase,
    isConnected,
    subscribeToTable,
  }
}

