import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle" // ensure export
import { perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { gerarToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()
    if (!email || !senha) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 400 })
    }
    const usuario = await db.select().from(perfis).where(eq(perfis.email, email)).limit(1)
    if (!usuario.length) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }
    const valido = await bcrypt.compare(senha, usuario[0].password_hash)
    if (!valido) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }
    const token = gerarToken({ id: usuario[0].id, email: usuario[0].email, tipo_usuario: usuario[0].tipo_usuario ?? "usuario" })

    const res = NextResponse.json({ ok: true, usuario: { id: usuario[0].id, nome: usuario[0].nome, email: usuario[0].email, tipo_usuario: usuario[0].tipo_usuario } })
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })
    return res
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 