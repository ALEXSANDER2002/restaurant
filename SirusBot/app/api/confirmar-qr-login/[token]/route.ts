import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { sql, eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { gerarToken } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ 
        erro: "Token não fornecido" 
      }, { status: 400 })
    }

    // Verificar se o token JWT é válido
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json({ 
          erro: "Token expirado" 
        }, { status: 410 })
      }
      return NextResponse.json({ 
        erro: "Token inválido" 
      }, { status: 401 })
    }

    // Verificar se é um token de QR login
    if (payload.type !== 'qr-login') {
      return NextResponse.json({ 
        erro: "Tipo de token inválido" 
      }, { status: 401 })
    }

    // Verificar se o token ainda existe no banco e não foi usado
    const tokenResult = await db.execute(
      sql`SELECT id, user_id FROM qr_login_tokens 
          WHERE token = ${token} AND used_at IS NULL`
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ 
        erro: "Token não encontrado ou já usado" 
      }, { status: 410 })
    }

    const tokenData = tokenResult.rows[0]

    // Buscar dados completos do usuário
    const usuario = await db
      .select()
      .from(perfis)
      .where(eq(perfis.id, payload.userId))
      .limit(1)

    if (usuario.length === 0) {
      return NextResponse.json({ 
        erro: "Usuário não encontrado" 
      }, { status: 404 })
    }

    const dadosUsuario = usuario[0]

    // Verificar se os dados do usuário são válidos
    if (!dadosUsuario.id || !dadosUsuario.email || !dadosUsuario.tipo_usuario) {
      return NextResponse.json({ 
        erro: "Dados do usuário inválidos" 
      }, { status: 500 })
    }

    // Marcar token como usado
    await db.execute(
      sql`UPDATE qr_login_tokens SET used_at = NOW() WHERE id = ${tokenData.id}`
    )

    // Gerar novo token de autenticação
    const authToken = gerarToken({
      id: dadosUsuario.id,
      email: dadosUsuario.email,
      tipo_usuario: dadosUsuario.tipo_usuario
    })

    // Criar resposta com cookie de autenticação
    const response = NextResponse.json({ 
      sucesso: true,
      usuario: {
        id: dadosUsuario.id,
        email: dadosUsuario.email,
        tipo_usuario: dadosUsuario.tipo_usuario
      }
    })

    // Definir cookie de autenticação (7 dias)
    response.cookies.set("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    return response

  } catch (error: any) {
    console.error("[CONFIRMAR-QR-LOGIN] Erro:", error)
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 })
  }
} 