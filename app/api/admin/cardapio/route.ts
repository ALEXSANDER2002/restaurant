import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { cardapio } from "@/lib/drizzle/schema"
import { eq, desc, gte, lte, and } from "drizzle-orm"

// GET /api/admin/cardapio - Buscar cardápio da semana atual ou específica
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const semana = searchParams.get("semana") // formato: 2024-01-15 (segunda-feira)
    
    let dataInicio: Date
    let dataFim: Date
    
    if (semana) {
      // Usar semana específica
      dataInicio = new Date(semana)
      dataFim = new Date(dataInicio)
      dataFim.setDate(dataFim.getDate() + 6) // Sexta-feira
    } else {
      // Usar semana atual
      const hoje = new Date()
      const diaSemana = hoje.getDay() // 0 = domingo, 1 = segunda, etc.
      const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
      
      dataInicio = new Date(hoje)
      dataInicio.setDate(hoje.getDate() + diasParaSegunda)
      dataInicio.setHours(0, 0, 0, 0)
      
      dataFim = new Date(dataInicio)
      dataFim.setDate(dataFim.getDate() + 4) // Sexta-feira
      dataFim.setHours(23, 59, 59, 999)
    }
    
    const cardapioSemana = await db
      .select()
      .from(cardapio)
      .where(
        and(
          gte(cardapio.semana_inicio, dataInicio),
          lte(cardapio.semana_fim, dataFim),
          eq(cardapio.ativo, true)
        )
      )
      .orderBy(cardapio.dia_semana)
    
    return NextResponse.json({
      sucesso: true,
      data: cardapioSemana,
      semana: {
        inicio: dataInicio.toISOString(),
        fim: dataFim.toISOString()
      }
    })
  } catch (error: any) {
    console.error("[GET /api/admin/cardapio]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
}

// POST /api/admin/cardapio - Criar/atualizar cardápio da semana
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cardapioSemana, semanaInicio } = body
    
    if (!cardapioSemana || !Array.isArray(cardapioSemana)) {
      return NextResponse.json(
        { sucesso: false, erro: "Dados do cardápio são obrigatórios" },
        { status: 400 }
      )
    }
    
    const dataInicio = new Date(semanaInicio)
    const dataFim = new Date(dataInicio)
    dataFim.setDate(dataFim.getDate() + 4) // Sexta-feira
    
    // Desativar cardápio existente da mesma semana
    await db
      .update(cardapio)
      .set({ ativo: false, updated_at: new Date() })
      .where(
        and(
          gte(cardapio.semana_inicio, dataInicio),
          lte(cardapio.semana_fim, dataFim)
        )
      )
    
    // Inserir novo cardápio
    const novosCardapios = cardapioSemana.map((item: any) => ({
      dia_semana: item.dia_semana,
      prato_principal: item.prato_principal,
      acompanhamentos: item.acompanhamentos,
      saladas: item.saladas,
      sobremesa: item.sobremesa,
      bebida: item.bebida,
      opcao_vegetariana: item.opcao_vegetariana,
      observacoes: item.observacoes || null,
      semana_inicio: dataInicio,
      semana_fim: dataFim,
      ativo: true,
    }))
    
    const resultado = await db
      .insert(cardapio)
      .values(novosCardapios)
      .returning()
    
    return NextResponse.json({
      sucesso: true,
      data: resultado,
      mensagem: "Cardápio salvo com sucesso!"
    })
  } catch (error: any) {
    console.error("[POST /api/admin/cardapio]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/cardapio - Remover cardápio
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { sucesso: false, erro: "ID do cardápio é obrigatório" },
        { status: 400 }
      )
    }
    
    await db
      .update(cardapio)
      .set({ ativo: false, updated_at: new Date() })
      .where(eq(cardapio.id, id))
    
    return NextResponse.json({
      sucesso: true,
      mensagem: "Cardápio removido com sucesso!"
    })
  } catch (error: any) {
    console.error("[DELETE /api/admin/cardapio]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
} 