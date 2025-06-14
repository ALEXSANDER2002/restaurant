import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { eq, desc } from "drizzle-orm"

// GET /api/tickets
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const usuarioId = searchParams.get("usuario_id")

  try {
    let query = db
      .select({
        ...tickets,
        nome: perfis.nome,
        email: perfis.email,
      })
      .from(tickets)
      .leftJoin(perfis, eq(perfis.id, tickets.usuario_id))
      .orderBy(desc(tickets.created_at))

    if (usuarioId) {
      query = query.where(eq(tickets.usuario_id, usuarioId))
    }

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
      quantidade: body.quantidade,
      valor_total: body.valor_total,
      status: body.status ?? "pendente",
      created_at: new Date().toISOString(),
      subsidiado: body.subsidiado ?? false,
    }

    const [ticket] = await db.insert(tickets).values(novoTicket).returning()

    return NextResponse.json({ sucesso: true, ticket }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/tickets]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
} 