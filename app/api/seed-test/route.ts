import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { perfis } from "@/lib/drizzle/schema"
import { sql } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST() {
  const email = "teste@gmail.com"
  const nome = "Teste"
  const senha = "12345678"
  const hash = bcrypt.hashSync(senha, 10)

  try {
    await db.execute(sql`INSERT INTO perfis (id, nome, email, password_hash) VALUES (gen_random_uuid(), ${nome}, ${email}, ${hash}) ON CONFLICT (email) DO NOTHING`)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
} 