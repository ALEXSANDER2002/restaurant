import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gsafbesoehacoojtooit.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzYWZiZXNvZWhhY29vanRvb2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjAyODgsImV4cCI6MjA1OTUzNjI4OH0.lKeamg0WpO1SHvhV_pY4E2fQKm2CekAyj6EJC5U7FUM"

// Criar o cliente Supabase compatível com versão 2.x
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'X-Client-Info': 'ru-app',
    },
  },
})

// Função auxiliar para verificar conexão
export async function verificarConexaoSupabase(): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const { data, error } = await supabase.from("perfis").select("id").limit(1)
    
    if (error) {
      console.error("Erro ao conectar com Supabase:", error)
      return { 
        ok: false, 
        mensagem: `Erro de conexão: ${error.message}` 
      }
    }
    
    return { 
      ok: true, 
      mensagem: "Conexão com Supabase estabelecida com sucesso" 
    }
  } catch (e: any) {
    console.error("Exceção ao conectar com Supabase:", e)
    return { 
      ok: false, 
      mensagem: `Exceção: ${e.message}` 
    }
  }
} 