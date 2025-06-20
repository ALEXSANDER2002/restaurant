import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { eq, desc } from "drizzle-orm"

// GET /api/tickets
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const usuarioId = searchParams.get("usuario_id")

  try {
    const baseSelect = db
      .select({
        id: tickets.id,
        usuario_id: tickets.usuario_id,
        data: tickets.data,
        quantidade: tickets.quantidade,
        valor_total: tickets.valor_total,
        status: tickets.status,
        created_at: tickets.created_at,
        subsidiado: tickets.subsidiado,
        nome: perfis.nome,
        email: perfis.email,
      })
      .from(tickets)
      .leftJoin(perfis, eq(perfis.id, tickets.usuario_id))

    const query = usuarioId
      ? baseSelect.where(eq(tickets.usuario_id, usuarioId)).orderBy(desc(tickets.created_at))
      : baseSelect.orderBy(desc(tickets.created_at))

    const data = await query

    return NextResponse.json({ sucesso: true, data })
  } catch (error: any) {
    console.error("[GET /api/tickets]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
}

// POST /api/tickets
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const novoTicket = {
      id: body.id ?? crypto.randomUUID(),
      usuario_id: body.usuario_id,
      data: body.data,
      quantidade: String(body.quantidade),
      valor_total: String(body.valor_total),
      status: body.status ?? "pendente",
      created_at: new Date(),
      subsidiado: body.subsidiado ?? false,
    }

    const [ticket] = await db.insert(tickets).values(novoTicket).returning()

    return NextResponse.json({ sucesso: true, ticket }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/tickets]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
} 