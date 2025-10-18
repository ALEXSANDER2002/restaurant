import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { sql } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json()

    // Validações básicas
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    if (nome.trim().length < 2) {
      return NextResponse.json(
        { erro: "Nome deve ter pelo menos 2 caracteres" },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { erro: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { erro: "Email inválido" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const usuarioExistente = await db.execute(
      sql`SELECT id FROM perfis WHERE email = ${email.toLowerCase()}`
    )

    if (usuarioExistente.length > 0) {
      return NextResponse.json(
        { erro: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    // Hash da senha
    const senhaCriptografada = bcrypt.hashSync(senha, 10)

    // Inserir novo usuário
    await db.execute(
      sql`
        INSERT INTO perfis (id, nome, email, password_hash, tipo_usuario) 
        VALUES (gen_random_uuid(), ${nome.trim()}, ${email.toLowerCase()}, ${senhaCriptografada}, 'usuario')
      `
    )

    return NextResponse.json(
      { 
        sucesso: true, 
        mensagem: "Conta criada com sucesso! Você já pode fazer login." 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Erro no cadastro:", error)
    return NextResponse.json(
      { erro: "Erro interno do servidor. Tente novamente." },
      { status: 500 }
    )
  }
} 