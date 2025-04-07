"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Usando as novas credenciais fornecidas
const SUPABASE_URL = "https://fkfnvyhfacsfthpewlqd.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZm52eWhmYWNzZnRocGV3bHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NDkzOTgsImV4cCI6MjA1OTUyNTM5OH0.-3RsGgLwCGyEfLMZ6K96CV7BlhVZ9p2M_JgaZIOOXaE"

export function useDatabaseConnection() {
  const [status, setStatus] = useState<"conectado" | "erro" | "tentando">("tentando")
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null)

  // Criando o cliente Supabase com as novas credenciais
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

  const checkConnection = async () => {
    setStatus("tentando")
    setLastAttempt(new Date())

    try {
      // Tenta fazer uma consulta simples para verificar a conexão
      const { error } = await supabase.from("perfis").select("id").limit(1)

      if (error) {
        console.error("Erro ao conectar ao banco de dados:", error)
        setStatus("erro")
        return false
      }

      setStatus("conectado")
      return true
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error)
      setStatus("erro")
      return false
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return {
    status,
    lastAttempt,
    checkConnection,
    isConnected: status === "conectado",
    isError: status === "erro",
    isTrying: status === "tentando",
    supabase, // Exportando o cliente Supabase para uso em outros componentes
  }
}

