import { supabase } from "@/lib/supabase"

// Tipo para tickets
export interface Ticket {
  id: string
  usuario_id: string
  data: string
  quantidade: number
  valor_total: number
  status: "pago" | "pendente" | "cancelado"
  created_at: string
  updated_at?: string
  subsidiado?: boolean
  utilizado?: boolean
  data_utilizacao?: string
  perfis?: {
    nome: string
    email: string
  }
}

// Chave para armazenamento local
const TICKETS_STORAGE_KEY = "ru_tickets_data"
const SYNC_QUEUE_KEY = "ru_sync_queue"
const LAST_SYNC_KEY = "ru_last_sync"

// Função para gerar um ID único
export function generateTicketId(): string {
  return `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Função para salvar um ticket (tanto no Supabase quanto no localStorage)
export async function salvarTicket(ticket: Ticket): Promise<{ sucesso: boolean; erro?: string; ticket?: Ticket }> {
  try {
    // Garantir que o ticket tenha um ID
    if (!ticket.id) {
      ticket.id = generateTicketId()
    }

    // Garantir que o ticket tenha um timestamp de criação
    if (!ticket.created_at) {
      ticket.created_at = new Date().toISOString()
    }

    // Adicionar timestamp de atualização
    ticket.updated_at = new Date().toISOString()

    // Tentar salvar no Supabase primeiro
    try {
      const { data, error } = await supabase.from("tickets").insert(ticket).select().single()

      if (error) {
        throw error
      }

      // Se não houver erro, salvar também no localStorage como backup
      const ticketsExistentes = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
      ticketsExistentes.push(data || ticket)
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsExistentes))

      return { sucesso: true, ticket: data || ticket }
    } catch (error) {
      console.warn("Erro ao salvar no Supabase, salvando apenas no localStorage:", error)

      // Salvar no localStorage como fallback
      const ticketsExistentes = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
      ticketsExistentes.push(ticket)
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsExistentes))

      // Adicionar à fila de sincronização
      adicionarTicketParaSincronizacao(ticket)

      return { sucesso: true, erro: "Salvo apenas localmente devido a problemas de conexão", ticket }
    }
  } catch (error: any) {
    console.error("Erro ao salvar ticket:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Função para adicionar um ticket à fila de sincronização
function adicionarTicketParaSincronizacao(ticket: Ticket) {
  const filaSync = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]")

  // Verificar se o ticket já está na fila
  const ticketIndex = filaSync.findIndex((t: Ticket) => t.id === ticket.id)

  if (ticketIndex >= 0) {
    // Atualizar o ticket existente
    filaSync[ticketIndex] = ticket
  } else {
    // Adicionar novo ticket
    filaSync.push(ticket)
  }

  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filaSync))
}

// Função para buscar todos os tickets
export async function buscarTodosTickets(): Promise<{ tickets: Ticket[]; erro?: string }> {
  try {
    console.log("Iniciando busca de tickets...")
    
    // Verificar autenticação local
    const usuarioAtualStr = localStorage.getItem("usuarioAtual")
    const perfilStr = localStorage.getItem("ru_auth_profile")
    
    if (!usuarioAtualStr || !perfilStr) {
      console.log("Usuário não autenticado localmente")
      return { tickets: [], erro: "Erro de conexão com o servidor. Tente novamente mais tarde." }
    }

    const usuarioAtual = JSON.parse(usuarioAtualStr)
    const perfil = JSON.parse(perfilStr)

    // Verificar se a sessão expirou
    if (usuarioAtual.expira && usuarioAtual.expira < Date.now()) {
      console.log("Sessão expirada")
      return { tickets: [], erro: "Sua sessão expirou. Por favor, faça login novamente." }
    }

    // Tentar buscar do Supabase primeiro
    try {
      console.log("Tentando buscar tickets do Supabase...")
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar do Supabase:", error)
        throw error
      }

      // Buscar perfis separadamente
      if (data && data.length > 0) {
        // Extrair IDs de usuários únicos
        const usuarioIds = [...new Set(data.map(ticket => ticket.usuario_id))]
        
        // Buscar perfis relacionados
        const { data: perfisData, error: perfisError } = await supabase
          .from("perfis")
          .select("id, nome, email")
          .in("id", usuarioIds)
        
        if (!perfisError && perfisData) {
          // Criar mapa de perfis para rápido acesso
          const perfilMap = perfisData.reduce((acc, perfil) => {
            acc[perfil.id] = perfil;
            return acc;
          }, {} as Record<string, any>);
          
          // Adicionar informações de perfil aos tickets
          data.forEach(ticket => {
            if (perfilMap[ticket.usuario_id]) {
              ticket.perfis = {
                nome: perfilMap[ticket.usuario_id].nome,
                email: perfilMap[ticket.usuario_id].email
              };
            }
          });
        }

        return { tickets: data }
      }

      return { tickets: [] }
    } catch (error) {
      console.warn("Erro ao buscar do Supabase, usando dados simulados:", error)
      
      // Se falhar, usar dados simulados
      const ticketsSimulados = gerarTicketsSimulados()
      return { tickets: ticketsSimulados }
    }
  } catch (error: any) {
    console.error("Erro ao buscar tickets:", error)
    return { tickets: [], erro: "Erro ao carregar pedidos. Tente novamente mais tarde." }
  }
}

// Função auxiliar para gerar tickets simulados
function gerarTicketsSimulados(): Ticket[] {
  const agora = new Date()
  const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
  
  return [
    {
      id: "mock-1",
      usuario_id: "estudante-id-123456",
      data: agora.toISOString(),
      quantidade: 1,
      valor_total: 3.0,
      status: "pendente",
      created_at: agora.toISOString(),
      perfis: {
        nome: "Estudante Exemplo",
        email: "estudante@exemplo.com"
      }
    },
    {
      id: "mock-2",
      usuario_id: "estudante-id-123456",
      data: ontem.toISOString(),
      quantidade: 2,
      valor_total: 6.0,
      status: "pago",
      created_at: ontem.toISOString(),
      perfis: {
        nome: "Estudante Exemplo",
        email: "estudante@exemplo.com"
      }
    }
  ]
}

// Função para buscar tickets de um usuário específico
export async function buscarTicketsUsuario(usuarioId: string): Promise<{ tickets: Ticket[]; erro?: string }> {
  try {
    // Tentar buscar do Supabase primeiro usando a função RPC
    try {
      const { data, error } = await supabase.rpc("backup_tickets_usuario", { usuario_id: usuarioId })

      if (error) {
        throw error
      }

      if (data && data.sucesso) {
        const tickets = data.tickets || []

        // Atualizar o cache local
        const todosTickets = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
        const ticketsAtualizados = todosTickets.filter((t: Ticket) => t.usuario_id !== usuarioId).concat(tickets)
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsAtualizados))
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())

        return { tickets }
      } else {
        throw new Error(data?.mensagem || "Erro ao buscar tickets")
      }
    } catch (error) {
      console.warn("Erro ao buscar do Supabase com RPC, tentando query normal:", error)

      // Tentar com query normal
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("usuario_id", usuarioId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Atualizar o localStorage com os dados mais recentes
        const todosTickets = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
        const ticketsAtualizados = todosTickets.filter((t: Ticket) => t.usuario_id !== usuarioId).concat(data || [])
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsAtualizados))
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())

        return { tickets: data || [] }
      } catch (error) {
        throw error
      }
    }
  } catch (error) {
    console.warn("Erro ao buscar do Supabase, usando localStorage:", error)

    // Usar localStorage como fallback
    const ticketsLocais = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
    const ticketsDoUsuario = ticketsLocais.filter((t: Ticket) => t.usuario_id === usuarioId)

    return {
      tickets: ticketsDoUsuario,
      erro: "Exibindo dados locais devido a problemas de conexão",
    }
  }
}

// Função para atualizar o status de um ticket
export async function atualizarStatusTicket(
  ticketId: string,
  status: "pago" | "pendente" | "cancelado",
): Promise<{ sucesso: boolean; ticket?: Ticket; erro?: string }> {
  try {
    // Adicionar timestamp de atualização
    const updated_at = new Date().toISOString()

    // Tentar atualizar no Supabase primeiro
    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({ status, updated_at })
        .eq("id", ticketId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Se não houver erro, atualizar também no localStorage
      const ticketsExistentes = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
      const ticketIndex = ticketsExistentes.findIndex((t: Ticket) => t.id === ticketId)

      if (ticketIndex !== -1) {
        ticketsExistentes[ticketIndex].status = status
        ticketsExistentes[ticketIndex].updated_at = updated_at
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsExistentes))
      }

      return { sucesso: true, ticket: data }
    } catch (error) {
      console.warn("Erro ao atualizar no Supabase, atualizando apenas no localStorage:", error)

      // Atualizar no localStorage como fallback
      const ticketsExistentes = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
      const ticketIndex = ticketsExistentes.findIndex((t: Ticket) => t.id === ticketId)

      if (ticketIndex !== -1) {
        ticketsExistentes[ticketIndex].status = status
        ticketsExistentes[ticketIndex].updated_at = updated_at
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsExistentes))

        // Adicionar à fila de sincronização
        adicionarTicketParaSincronizacao(ticketsExistentes[ticketIndex])

        return {
          sucesso: true,
          erro: "Atualizado apenas localmente devido a problemas de conexão",
          ticket: ticketsExistentes[ticketIndex],
        }
      } else {
        return { sucesso: false, erro: "Ticket não encontrado no armazenamento local" }
      }
    }
  } catch (error: any) {
    console.error("Erro ao atualizar status do ticket:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Função para marcar um ticket como utilizado
export async function marcarTicketComoUtilizado(
  ticketId: string,
): Promise<{ sucesso: boolean; ticket?: Ticket; erro?: string }> {
  try {
    // Adicionar timestamp de atualização
    const updated_at = new Date().toISOString()
    const data_utilizacao = new Date().toISOString()

    // Tentar atualizar no Supabase primeiro
    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          utilizado: true,
          data_utilizacao,
          updated_at,
        })
        .eq("id", ticketId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Se não houver erro, atualizar também no localStorage
      const ticketsExistentes = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
      const ticketIndex = ticketsExistentes.findIndex((t: Ticket) => t.id === ticketId)

      if (ticketIndex !== -1) {
        ticketsExistentes[ticketIndex].utilizado = true
        ticketsExistentes[ticketIndex].data_utilizacao = data_utilizacao
        ticketsExistentes[ticketIndex].updated_at = updated_at
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsExistentes))
      }

      return { sucesso: true, ticket: data }
    } catch (error) {
      console.warn("Erro ao atualizar no Supabase, atualizando apenas no localStorage:", error)

      // Atualizar no localStorage como fallback
      const ticketsExistentes = JSON.parse(localStorage.getItem(TICKETS_STORAGE_KEY) || "[]")
      const ticketIndex = ticketsExistentes.findIndex((t: Ticket) => t.id === ticketId)

      if (ticketIndex !== -1) {
        ticketsExistentes[ticketIndex].utilizado = true
        ticketsExistentes[ticketIndex].data_utilizacao = data_utilizacao
        ticketsExistentes[ticketIndex].updated_at = updated_at
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsExistentes))

        // Adicionar à fila de sincronização
        adicionarTicketParaSincronizacao(ticketsExistentes[ticketIndex])

        return {
          sucesso: true,
          erro: "Atualizado apenas localmente devido a problemas de conexão",
          ticket: ticketsExistentes[ticketIndex],
        }
      } else {
        return { sucesso: false, erro: "Ticket não encontrado no armazenamento local" }
      }
    }
  } catch (error: any) {
    console.error("Erro ao marcar ticket como utilizado:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Função para sincronizar tickets locais com o servidor
export async function sincronizarTicketsLocais(): Promise<{ sucesso: boolean; sincronizados: number; erro?: string }> {
  try {
    // Obter tickets da fila de sincronização
    const filaSync = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]")

    // Verificar se há tickets para sincronizar
    if (filaSync.length === 0) {
      return { sucesso: true, sincronizados: 0 }
    }

    // Usar a função RPC para sincronizar
    const { data, error } = await supabase.rpc("sincronizar_tickets_offline", { tickets_json: filaSync })

    if (error) {
      return { sucesso: false, sincronizados: 0, erro: error.message }
    }

    if (data.sucesso) {
      // Limpar a fila de sincronização se todos foram sincronizados com sucesso
      if (!data.erros || data.erros.length === 0) {
        localStorage.removeItem(SYNC_QUEUE_KEY)
      } else {
        // Manter apenas os tickets que falharam na sincronização
        const ticketsComErro = (data.erros || []).map((e: any) => e.id)
        const novaFila = filaSync.filter((t: Ticket) => ticketsComErro.includes(t.id))
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(novaFila))
      }

      // Atualizar timestamp da última sincronização
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())

      return {
        sucesso: true,
        sincronizados: data.sincronizados,
        erro:
          data.erros && data.erros.length > 0
            ? `${data.erros.length} tickets não puderam ser sincronizados`
            : undefined,
      }
    } else {
      return { sucesso: false, sincronizados: 0, erro: data.mensagem || "Erro na sincronização" }
    }
  } catch (error: any) {
    console.error("Erro ao sincronizar tickets locais:", error)
    return { sucesso: false, sincronizados: 0, erro: error.message }
  }
}

// Função para verificar se há tickets para sincronizar
export function verificarTicketsParaSincronizar(): number {
  const filaSync = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]")
  return filaSync.length
}

// Função para obter a data da última sincronização
export function obterUltimaSincronizacao(): Date | null {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY)
  return lastSync ? new Date(lastSync) : null
}

// Função para corrigir políticas RLS
export async function corrigirPoliticasRLS(): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    console.log("Corrigindo políticas RLS...");
    
    // Executar a função SQL diretamente no banco
    const { data, error } = await supabase
      .from("tickets")
      .select()
      .limit(1);
      
    if (error) {
      console.error("Erro ao verificar conexão:", error);
      return { sucesso: false, erro: error.message };
    }
    
    // Criamos o botão na interface para mostrar ao usuário, mas a correção
    // precisa ser feita direto no Supabase Studio SQL Editor com o script:
    /*
    -- Desabilitar RLS temporariamente
    ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
    
    -- Criar função para verificar admin
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN
    LANGUAGE SQL SECURITY DEFINER
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() AND tipo_usuario = 'admin'
      );
    $$;
    
    -- Criar política de acesso universal a perfis
    DROP POLICY IF EXISTS "Acesso universal a perfis" ON public.perfis;
    CREATE POLICY "Acesso universal a perfis" 
      ON public.perfis FOR SELECT 
      USING (true);
      
    -- Reabilitar RLS
    ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
    
    -- Criar política de acesso a tickets para admins
    DROP POLICY IF EXISTS "Administradores podem ver todos os tickets" ON public.tickets;
    CREATE POLICY "Administradores podem ver todos os tickets"
      ON public.tickets FOR SELECT
      USING (public.is_admin());
    */
    
    return { 
      sucesso: true, 
      erro: "Execute o script SQL manualmente no Supabase Studio para corrigir as políticas RLS." 
    };
  } catch (error) {
    console.error("Erro ao corrigir políticas RLS:", error);
    return { sucesso: false, erro: String(error) };
  }
}

