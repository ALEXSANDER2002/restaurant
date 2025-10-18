import { NextRequest, NextResponse } from "next/server"
import { verificarToken } from "@/lib/auth"
import { db } from "@/lib/drizzle"
import { sql } from "drizzle-orm"
import jwt from "jsonwebtoken"

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

    const { userId } = await req.json()

    // Verificar se o userId corresponde ao usuário autenticado
    if (userId !== payload.id) {
      return NextResponse.json({ 
        erro: "Não autorizado" 
      }, { status: 403 })
    }

    // Invalidar todos os tokens QR anteriores deste usuário
    await db.execute(
      sql`UPDATE qr_login_tokens SET used_at = NOW() 
          WHERE user_id = ${payload.id} AND used_at IS NULL`
    )

    // Gerar token único para QR Code (sem expiração por tempo)
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
    const qrToken = jwt.sign(
      { 
        userId: payload.id,
        type: 'qr-login',
        timestamp: Date.now()
      },
      JWT_SECRET
      // Removido: { expiresIn: '10m' }
    )

    // Salvar novo token no banco
    await db.execute(
      sql`INSERT INTO qr_login_tokens (id, user_id, token, created_at) 
          VALUES (gen_random_uuid(), ${payload.id}, ${qrToken}, NOW())`
    )

    // Construir URL de login
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const loginUrl = `${baseUrl}/login-qr/${qrToken}`

    return NextResponse.json({ 
      token: qrToken,
      loginUrl,
      persistent: true // QR Code não expira por tempo
    })

  } catch (error: any) {
    console.error("[GERAR-QR-LOGIN] Erro:", error)
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 })
  }
} 