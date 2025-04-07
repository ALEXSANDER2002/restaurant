import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gsafbesoehacoojtooit.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzYWZiZXNvZWhhY29vanRvb2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjAyODgsImV4cCI6MjA1OTUzNjI4OH0.lKeamg0WpO1SHvhV_pY4E2fQKm2CekAyj6EJC5U7FUM"

// Opções para tempo limite mais curto
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Reduzir tempo de espera para não travar a interface
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'ru-app',
    },
  },
  // Definir timeout reduzido para não bloquear a UI
  realtime: {
    timeout: 3000 // 3 segundos
  }
}

// Criar cliente Supabase com tratamento de erros
let supabaseClient: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, options);
  } else {
    console.warn("Credenciais do Supabase não encontradas. Modo offline ativado.");
  }
} catch (error) {
  console.error("Erro ao criar cliente Supabase:", error);
}

// Exportar o cliente
export const supabase = supabaseClient;

// Função para verificar se o Supabase está acessível
export async function isSupabaseAvailable(): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase.from("perfis").select("id").limit(1);
    return !error;
  } catch (error) {
    console.warn("Falha ao verificar disponibilidade do Supabase:", error);
    return false;
  }
}

// Função para verificar conexão e retornar status detalhado
export async function verificarConexaoSupabase(): Promise<{ ok: boolean; mensagem: string }> {
  if (!supabase) {
    return { 
      ok: false, 
      mensagem: "Cliente Supabase não inicializado" 
    };
  }

  try {
    const { data, error } = await supabase.from("perfis").select("id").limit(1);
    
    if (error) {
      return { 
        ok: false, 
        mensagem: `Erro de conexão: ${error.message}` 
      };
    }
    
    return { 
      ok: true, 
      mensagem: "Conexão com Supabase estabelecida com sucesso" 
    };
  } catch (e: any) {
    return { 
      ok: false, 
      mensagem: `Exceção: ${e.message}` 
    };
  }
}

// Cache de canais ativos para evitar duplicação
const activeChannels: Map<string, boolean> = new Map()

// Função para limpar todas as inscrições realtime
export function cleanupRealtimeSubscriptions() {
  if (!supabase) return;
  
  try {
    // Tipagem explícita para canais
    type Channel = { subscribe: () => { topic: string } };
    
    const channels = supabase.getChannels() as Channel[];
    channels.forEach((channel: Channel) => {
      const channelId = channel.subscribe().topic;
      activeChannels.delete(channelId);
      supabase.removeChannel(channel as any);
    });
  } catch (error) {
    console.warn("Erro ao limpar inscrições realtime:", error);
  }
}

// Função para gerar ID único de canal
export function generateChannelId(table: string, event: string = "*"): string {
  return `${table}-${event}-${Date.now()}`
}

// Função para verificar se um canal já existe
export function channelExists(channelId: string): boolean {
  return activeChannels.has(channelId)
}

// Função para registrar um novo canal
export function registerChannel(channelId: string) {
  activeChannels.set(channelId, true)
}

// Função para remover registro de um canal
export function unregisterChannel(channelId: string) {
  activeChannels.delete(channelId)
}

// Singleton pattern para garantir apenas um cliente
let supabaseInstance: typeof supabase = null;

export function getSupabaseClient(): typeof supabase {
  if (!supabaseInstance) {
    supabaseInstance = supabase;
  }
  return supabaseInstance;
}

// Connection status checker with timeout
export async function checkSupabaseConnection(timeoutMs: number = 5000): Promise<{
  connected: boolean
  error?: string
  latency?: number
}> {
  const startTime = performance.now()

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout")), timeoutMs)
    })

    const connectionPromise = supabase.from("perfis").select("count").limit(1).single()

    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any

    const latency = performance.now() - startTime

    if (error) {
      return {
        connected: false,
        error: error.message,
        latency,
      }
    }

    return {
      connected: true,
      latency,
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || "Unknown error",
      latency: performance.now() - startTime,
    }
  }
}

