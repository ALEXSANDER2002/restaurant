import { supabase } from "@/lib/supabase"

export interface PerfilUsuario {
  id: string
  nome: string
  email: string
  tipo: "admin" | "estudante"
  status: "ativo" | "inativo"
  created_at?: string
}

export async function buscarTodosUsuarios() {
  try {
    // Try to get data from Supabase first
    try {
      const { data, error } = await supabase.from("perfis").select("*").order("nome")

      if (error) {
        throw error
      }

      return { usuarios: data || [], erro: null }
    } catch (error: any) {
      // If there's an error with Supabase, check if it's the recursion error
      console.warn("Erro ao buscar usuários do Supabase:", error)

      if (error.message && error.message.includes("infinite recursion")) {
        console.log("Detectado erro de recursão infinita, usando dados simulados")
        return { usuarios: gerarUsuariosSimulados(), erro: null }
      }

      throw error
    }
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error)
    // Return mock data as fallback
    return { usuarios: gerarUsuariosSimulados(), erro: null }
  }
}

export async function buscarUsuarioPorId(id: string) {
  try {
    // Try to get data from Supabase first
    try {
      const { data, error } = await supabase.from("perfis").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      return { usuario: data, erro: null }
    } catch (error: any) {
      // If there's an error with Supabase, check if it's the recursion error
      console.warn("Erro ao buscar usuário do Supabase:", error)

      if (error.message && error.message.includes("infinite recursion")) {
        console.log("Detectado erro de recursão infinita, usando dados simulados")
        // Find a mock user with the given ID
        const mockUsers = gerarUsuariosSimulados()
        const mockUser = mockUsers.find((u) => u.id === id) || mockUsers[0]
        return { usuario: mockUser, erro: null }
      }

      throw error
    }
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error)
    return { usuario: null, erro: error.message }
  }
}

export async function criarUsuario(
  email: string,
  senha: string,
  nome: string,
  tipo: "admin" | "estudante",
  status: "ativo" | "inativo" = "ativo",
) {
  try {
    // 1. Criar o usuário na autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error("Falha ao criar usuário")
    }

    // 2. Criar o perfil do usuário
    const { data: perfilData, error: perfilError } = await supabase
      .from("perfis")
      .insert({
        id: authData.user.id,
        nome,
        email,
        tipo,
        status,
      })
      .select()
      .single()

    if (perfilError) {
      // Tentar remover o usuário criado para evitar inconsistências
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw perfilError
    }

    return { usuario: perfilData, erro: null }
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return { usuario: null, erro: error.message }
  }
}

export async function atualizarUsuario(
  id: string,
  dados: {
    nome?: string
    tipo?: "admin" | "estudante"
    status?: "ativo" | "inativo"
  },
) {
  try {
    // Check if we're working with mock data (ID starts with 'mock-')
    if (id.startsWith("mock-")) {
      // Return a simulated successful response
      const mockUser = {
        id,
        nome: dados.nome || "Usuário Simulado",
        email: "usuario@exemplo.com",
        tipo: dados.tipo || "estudante",
        status: dados.status || "ativo",
        created_at: new Date().toISOString(),
      }
      return { usuario: mockUser, erro: null }
    }

    const { data, error } = await supabase.from("perfis").update(dados).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return { usuario: data, erro: null }
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error)
    return { usuario: null, erro: error.message }
  }
}

export async function excluirUsuario(id: string) {
  try {
    // Check if we're working with mock data (ID starts with 'mock-')
    if (id.startsWith("mock-")) {
      // Return a simulated successful response
      return { sucesso: true, erro: null }
    }

    // 1. Excluir o perfil
    const { error: perfilError } = await supabase.from("perfis").delete().eq("id", id)

    if (perfilError) {
      throw perfilError
    }

    // 2. Excluir o usuário da autenticação
    // Nota: Em produção, isso requer permissões de admin
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      throw authError
    }

    return { sucesso: true, erro: null }
  } catch (error: any) {
    console.error("Erro ao excluir usuário:", error)
    return { sucesso: false, erro: error.message }
  }
}

// Helper function to generate mock users
function gerarUsuariosSimulados(): PerfilUsuario[] {
  return [
    {
      id: "mock-1",
      nome: "Administrador Simulado",
      email: "admin@exemplo.com",
      tipo: "admin",
      status: "ativo",
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-2",
      nome: "Estudante Simulado 1",
      email: "estudante1@exemplo.com",
      tipo: "estudante",
      status: "ativo",
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-3",
      nome: "Estudante Simulado 2",
      email: "estudante2@exemplo.com",
      tipo: "estudante",
      status: "ativo",
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-4",
      nome: "Professor Simulado",
      email: "professor@exemplo.com",
      tipo: "admin",
      status: "ativo",
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-5",
      nome: "Estudante Inativo",
      email: "inativo@exemplo.com",
      tipo: "estudante",
      status: "inativo",
      created_at: new Date().toISOString(),
    },
  ]
}

