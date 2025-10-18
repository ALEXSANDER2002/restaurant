import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"
import { gerarToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { erro: "Email é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const [usuario] = await db
      .select()
      .from(perfis)
      .where(eq(perfis.email, email))
      .limit(1)

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Gerar token JWT
    const token = gerarToken({
      id: usuario.id,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario || 'usuario',
      avatar_url: usuario.avatar_url || undefined
    })

    // Criar resposta com cookie
    const response = NextResponse.json({
      sucesso: true,
      mensagem: "Login facial realizado com sucesso",
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        avatar_url: usuario.avatar_url
      }
    })

    // Definir cookie de autenticação
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    console.log("✅ Login facial bem-sucedido para:", email)
    console.log("🍪 Cookie 'token' definido com sucesso")

    return response
  } catch (error) {
    console.error("Erro no login facial:", error)
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 