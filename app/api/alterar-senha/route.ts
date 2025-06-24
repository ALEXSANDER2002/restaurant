import { NextRequest, NextResponse } from "next/server"
import { verificarToken } from "@/lib/auth"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ 
        erro: "Token de autenticação não encontrado" 
      }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!payload) {
      return NextResponse.json({ 
        erro: "Token inválido" 
      }, { status: 401 })
    }

    // Obter dados da requisição
    const { senhaAtual, novaSenha } = await req.json()

    // Validações
    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ 
        erro: "Senha atual e nova senha são obrigatórias" 
      }, { status: 400 })
    }

    if (novaSenha.length < 8) {
      return NextResponse.json({ 
        erro: "Nova senha deve ter pelo menos 8 caracteres" 
      }, { status: 400 })
    }

    // Buscar usuário no banco
    const usuario = await db
      .select()
      .from(perfis)
      .where(eq(perfis.id, payload.id))
      .limit(1)

    if (usuario.length === 0) {
      return NextResponse.json({ 
        erro: "Usuário não encontrado" 
      }, { status: 404 })
    }

    const dadosUsuario = usuario[0]

    // Verificar senha atual
    const senhaValida = bcrypt.compareSync(senhaAtual, dadosUsuario.password_hash)
    if (!senhaValida) {
      return NextResponse.json({ 
        erro: "Senha atual incorreta" 
      }, { status: 400 })
    }

    // Verificar se nova senha não é igual à atual
    const novaSenhaIgualAtual = bcrypt.compareSync(novaSenha, dadosUsuario.password_hash)
    if (novaSenhaIgualAtual) {
      return NextResponse.json({ 
        erro: "A nova senha deve ser diferente da senha atual" 
      }, { status: 400 })
    }

    // Gerar hash da nova senha
    const novoHash = bcrypt.hashSync(novaSenha, 10)

    // Atualizar senha no banco
    await db
      .update(perfis)
      .set({ 
        password_hash: novoHash,
        updated_at: new Date()
      })
      .where(eq(perfis.id, payload.id))

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Senha alterada com sucesso" 
    })

  } catch (error: any) {
    console.error("[ALTERAR-SENHA] Erro:", error)
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 })
  }
} 