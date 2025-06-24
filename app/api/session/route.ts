import { NextRequest, NextResponse } from "next/server"
import { verificarToken } from "@/lib/auth"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ autenticado: false })
  }
  
  const payload = verificarToken(token)
  if (!payload) {
    return NextResponse.json({ autenticado: false })
  }
  
  try {
    // Buscar dados completos do usuário no banco
    const [usuario] = await db
      .select({
        id: perfis.id,
        nome: perfis.nome,
        email: perfis.email,
        tipo_usuario: perfis.tipo_usuario,
        avatar_url: perfis.avatar_url
      })
      .from(perfis)
      .where(eq(perfis.id, payload.id))
    
    if (!usuario) {
      return NextResponse.json({ autenticado: false })
    }
    
    return NextResponse.json({ 
      autenticado: true, 
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        avatar_url: usuario.avatar_url
      }
    })
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
    return NextResponse.json({ autenticado: false })
  }
} 