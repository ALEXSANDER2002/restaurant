import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { sql } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST() {
  const usuarios = [
    { nome: "Administrador", email: "admin@gmail.com", senha: "admin123", tipo: "admin" },
    { nome: "Usuário", email: "user@gmail.com", senha: "12345678", tipo: "usuario" },
    { nome: "Kalleb", email: "klbs@gmail.com", senha: "12345678", tipo: "usuario" },
    { nome: "Ana", email: "ana@gmail.com", senha: "23252013", tipo: "usuario" },
  ]

  try {
    for (const u of usuarios) {
      const hash = bcrypt.hashSync(u.senha, 10)
      await db.execute(
        sql`INSERT INTO perfis (id, nome, email, password_hash, tipo_usuario) VALUES (gen_random_uuid(), ${u.nome}, ${u.email}, ${hash}, ${u.tipo})
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, tipo_usuario = EXCLUDED.tipo_usuario`,
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
} 