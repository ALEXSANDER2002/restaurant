"use client"

import { createContext, useContext, type ReactNode } from "react"
import { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { supabase, isSupabaseAvailable } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

type SupabaseContextType = {
  supabase: SupabaseClient<Database> | null
  isOnline: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(!!supabase)
  
  // Verificar status de conexão ao inicializar
  useEffect(() => {
    const checkConnection = async () => {
      const available = await isSupabaseAvailable()
      setIsOnline(available)
    }
    
    checkConnection()
    
    // Verificar periódicamente
    const interval = setInterval(checkConnection, 60000) // a cada minuto
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <SupabaseContext.Provider value={{ supabase, isOnline }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase deve ser usado dentro de um SupabaseProvider")
  }
  return context
}

