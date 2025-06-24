import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const { qr_code } = await req.json()

    if (!qr_code) {
      return NextResponse.json({ erro: "QR code é obrigatório" }, { status: 400 })
    }

    // Buscar ticket por QR code com informações do usuário
    const resultado = await db
      .select({
        id: tickets.id,
        qr_code: tickets.qr_code,
        data: tickets.data,
        valor_total: tickets.valor_total,
        subsidiado: tickets.subsidiado,
        campus: tickets.campus,
        status: tickets.status,
        utilizado: tickets.utilizado,
        data_utilizacao: tickets.data_utilizacao,
        usuario_nome: perfis.nome,
        usuario_email: perfis.email,
      })
      .from(tickets)
      .innerJoin(perfis, eq(tickets.usuario_id, perfis.id))
      .where(eq(tickets.qr_code, qr_code))
      .limit(1)

    if (resultado.length === 0) {
      return NextResponse.json({ erro: "QR code inválido ou ticket não encontrado" }, { status: 404 })
    }

    const ticket = resultado[0]

    return NextResponse.json({ 
      sucesso: true,
      ticket: {
        ...ticket,
        valor_total: parseFloat(ticket.valor_total.toString())
      }
    })

  } catch (error) {
    console.error("Erro ao validar QR code:", error)
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 })
  }
} 