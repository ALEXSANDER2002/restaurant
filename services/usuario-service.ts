import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"

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
    const usuarios = await db.select().from(perfis).orderBy(perfis.nome)
    return { usuarios, erro: null }
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error)
    return { usuarios: [], erro: error.message }
  }
}

export async function buscarUsuarioPorId(id: string) {
  try {
    const usuario = await db.select().from(perfis).where(eq(perfis.id, id)).limit(1)
    return { usuario: usuario[0] || null, erro: null }
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
    const inserted = await db
      .insert(perfis)
      .values({ id: crypto.randomUUID(), nome, email, tipo_usuario: tipo, status })
      .returning()

    return { usuario: inserted[0], erro: null }
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
    const updated = await db.update(perfis).set({
      ...(dados.nome && { nome: dados.nome }),
      ...(dados.tipo && { tipo_usuario: dados.tipo }),
      ...(dados.status && { status: dados.status }),
      updated_at: new Date().toISOString(),
    }).where(eq(perfis.id, id)).returning()

    return { usuario: updated[0], erro: null }
  } catch (error: any) {
    throw error
  }
}

export async function excluirUsuario(id: string) {
  try {
    await db.delete(perfis).where(eq(perfis.id, id))
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

