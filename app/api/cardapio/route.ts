import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { cardapio } from "@/lib/drizzle/schema"
import { eq, gte, lte, and } from "drizzle-orm"

// GET /api/cardapio - Buscar cardápio da semana atual (público)
export async function GET(req: NextRequest) {
  try {
    // Calcular semana atual (segunda a sexta)
    const hoje = new Date()
    const diaSemana = hoje.getDay() // 0 = domingo, 1 = segunda, etc.
    const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
    
    const dataInicio = new Date(hoje)
    dataInicio.setDate(hoje.getDate() + diasParaSegunda)
    dataInicio.setHours(0, 0, 0, 0)
    
    const dataFim = new Date(dataInicio)
    dataFim.setDate(dataFim.getDate() + 4) // Sexta-feira
    dataFim.setHours(23, 59, 59, 999)
    
    const cardapioSemana = await db
      .select({
        id: cardapio.id,
        dia_semana: cardapio.dia_semana,
        prato_principal: cardapio.prato_principal,
        acompanhamentos: cardapio.acompanhamentos,
        saladas: cardapio.saladas,
        sobremesa: cardapio.sobremesa,
        bebida: cardapio.bebida,
        opcao_vegetariana: cardapio.opcao_vegetariana,
        observacoes: cardapio.observacoes,
      })
      .from(cardapio)
      .where(
        and(
          gte(cardapio.semana_inicio, dataInicio),
          lte(cardapio.semana_fim, dataFim),
          eq(cardapio.ativo, true)
        )
      )
      .orderBy(cardapio.dia_semana)
    
    // Ordenar dias da semana corretamente
    const ordemDias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    const cardapioOrdenado = cardapioSemana.sort((a, b) => {
      return ordemDias.indexOf(a.dia_semana) - ordemDias.indexOf(b.dia_semana)
    })
    
    return NextResponse.json({
      sucesso: true,
      data: cardapioOrdenado,
      semana: {
        inicio: dataInicio.toISOString(),
        fim: dataFim.toISOString()
      }
    })
  } catch (error: any) {
    console.error("[GET /api/cardapio]", error)
    return NextResponse.json({ 
      sucesso: false, 
      erro: error.message,
      data: [] // Retorna array vazio em caso de erro
    }, { status: 500 })
  }
} 