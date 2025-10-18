import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { sql, eq } from "drizzle-orm"
import jwt from "jsonwebtoken"

export async function GET(
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
      sql`SELECT id, used_at FROM qr_login_tokens 
          WHERE token = ${token} AND used_at IS NULL`
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ 
        erro: "Token não encontrado ou já usado" 
      }, { status: 410 })
    }

    // Buscar dados do usuário
    const usuario = await db
      .select({
        id: perfis.id,
        email: perfis.email,
        tipo_usuario: perfis.tipo_usuario
      })
      .from(perfis)
      .where(eq(perfis.id, payload.userId))
      .limit(1)

    if (usuario.length === 0) {
      return NextResponse.json({ 
        erro: "Usuário não encontrado" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      valido: true,
      usuario: usuario[0]
    })

  } catch (error: any) {
    console.error("[VERIFICAR-QR-LOGIN] Erro:", error)
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 })
  }
} 