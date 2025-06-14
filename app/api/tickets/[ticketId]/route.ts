import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"

export async function PATCH(req: NextRequest, { params }: { params: { ticketId: string } }) {
  const { ticketId } = params

  try {
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ sucesso: false, erro: "Status é obrigatório" }, { status: 400 })
    }

    const [updated] = await db.update(tickets).set({ status }).where(eq(tickets.id, ticketId)).returning()

    if (!updated) {
      return NextResponse.json({ sucesso: false, erro: "Ticket não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ sucesso: true, ticket: updated })
  } catch (error: any) {
    console.error("[PATCH /api/tickets/:id]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
} 