import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets } from "@/lib/drizzle/schema"
import { eq, and } from "drizzle-orm"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params
    const { validado_por, acao } = await req.json()

    if (!ticketId) {
      return NextResponse.json({ erro: "ID do ticket é obrigatório" }, { status: 400 })
    }

    if (!validado_por) {
      return NextResponse.json({ erro: "ID do validador é obrigatório" }, { status: 400 })
    }

    if (acao !== "validar") {
      return NextResponse.json({ erro: "Ação inválida" }, { status: 400 })
    }

    // Buscar o ticket atual
    const ticketAtual = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1)

    if (ticketAtual.length === 0) {
      return NextResponse.json({ erro: "Ticket não encontrado" }, { status: 404 })
    }

    const ticket = ticketAtual[0]

    // Validações
    if (ticket.utilizado) {
      return NextResponse.json({ erro: "Este ticket já foi utilizado" }, { status: 400 })
    }

    if (ticket.status !== "pago") {
      return NextResponse.json({ erro: "Este ticket ainda não foi pago" }, { status: 400 })
    }

    // Validar o ticket
    const agora = new Date()
    const ticketAtualizado = await db
      .update(tickets)
      .set({
        utilizado: true,
        data_utilizacao: agora,
        utilizado_por: validado_por,
        updated_at: agora
      })
      .where(eq(tickets.id, ticketId))
      .returning()

    if (ticketAtualizado.length === 0) {
      return NextResponse.json({ erro: "Erro ao validar ticket" }, { status: 500 })
    }

    console.log(`[TICKET-VALIDACAO] Ticket ${ticketId} validado por ${validado_por}`)

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Ticket validado com sucesso",
      ticket: ticketAtualizado[0]
    })

  } catch (error) {
    console.error("Erro ao validar ticket:", error)
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 })
  }
} 