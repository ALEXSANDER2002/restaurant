import { NextRequest, NextResponse } from "next/server"
import { verificarToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ autenticado: false })
  }
  const payload = verificarToken(token)
  if (!payload) {
    return NextResponse.json({ autenticado: false })
  }
  return NextResponse.json({ autenticado: true, usuario: payload })
} 