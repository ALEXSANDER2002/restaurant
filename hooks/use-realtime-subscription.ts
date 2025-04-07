"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase" // Corrigido: usando o cliente Supabase correto

type SubscriptionCallback = (payload: any) => void

export function useRealtimeSubscription(
  table: string,
  callback: SubscriptionCallback,
  options?: {
    event?: "INSERT" | "UPDATE" | "DELETE" | "*"
    filter?: string
  },
) {
  useEffect(() => {
    const { event = "*", filter } = options || {}

    // Criar um canal único para esta assinatura
    const channel = supabase
      .channel(`${table}-changes-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter,
        },
        (payload) => {
          callback(payload)
        },
      )
      .subscribe()

    // Limpar assinatura ao desmontar
    return () => {
      channel.unsubscribe()
    }
  }, [table, callback, options])
}

