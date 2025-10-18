import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { cardapio } from "@/lib/drizzle/schema"
import { eq } from "drizzle-orm"

export async function POST() {
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

    const cardapioSemana = [
      {
        dia_semana: "segunda",
        prato_principal: "Frango Grelhado com Molho de Ervas",
        acompanhamentos: "Arroz branco, feijão carioca, batata doce assada",
        saladas: "Salada verde com tomate, cenoura ralada e beterraba",
        sobremesa: "Gelatina de frutas vermelhas",
        // bebida: "Suco de laranja natural", // Removido - não servimos bebidas
        opcao_vegetariana: "Hambúrguer de lentilha com quinoa",
        observacoes: "Cardápio balanceado com baixo teor de sódio"
      },
      {
        dia_semana: "terca",
        prato_principal: "Peixe Assado com Temperos Naturais",
        acompanhamentos: "Arroz integral, feijão preto, mandioca cozida",
        saladas: "Mix de folhas verdes, pepino e tomate cereja",
        sobremesa: "Mousse de maracujá",
        // bebida: "Suco de acerola", // Removido - não servimos bebidas
        opcao_vegetariana: "Escondidinho de batata doce com proteína de soja",
        observacoes: "Rico em ômega 3 e fibras"
      },
      {
        dia_semana: "quarta",
        prato_principal: "Carne Bovina Refogada com Legumes",
        acompanhamentos: "Arroz com açafrão, feijão tropeiro, purê de abóbora",
        saladas: "Salada de repolho roxo com cenoura e milho",
        sobremesa: "Pudim de leite",
        // bebida: "Suco de goiaba", // Removido - não servimos bebidas
        opcao_vegetariana: "Risoto de cogumelos com ervas finas",
        observacoes: "Alto valor protéico"
      },
      {
        dia_semana: "quinta",
        prato_principal: "Frango Ensopado com Quiabo",
        acompanhamentos: "Arroz branco, tutu de feijão, batata cozida",
        saladas: "Salada de alface americana com tomate e cebola roxa",
        sobremesa: "Doce de mamão com coco",
        // bebida: "Suco de manga", // Removido - não servimos bebidas
        opcao_vegetariana: "Curry de grão-de-bico com batata",
        observacoes: "Prato tradicional brasileiro"
      },
      {
        dia_semana: "sexta",
        prato_principal: "Peixe à Brasileira com Molho de Tomate",
        acompanhamentos: "Arroz com brócolis, feijão fradinho, macaxeira",
        saladas: "Salada de rúcula com tomate seco e queijo",
        sobremesa: "Salada de frutas da estação",
        // bebida: "Suco de caju", // Removido - não servimos bebidas
        opcao_vegetariana: "Lasanha de berinjela com queijo",
        observacoes: "Cardápio especial de sexta-feira"
      }
    ]

    // Limpar cardápio existente ativo
    await db.delete(cardapio).where(eq(cardapio.ativo, true))

    // Inserir novo cardápio
    for (const item of cardapioSemana) {
      await db.insert(cardapio).values({
        dia_semana: item.dia_semana,
        prato_principal: item.prato_principal,
        acompanhamentos: item.acompanhamentos,
        saladas: item.saladas,
        sobremesa: item.sobremesa,
        opcao_vegetariana: item.opcao_vegetariana,
        observacoes: item.observacoes,
        semana_inicio: dataInicio,
        semana_fim: dataFim,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cardápio da semana criado com sucesso!",
      periodo: {
        inicio: dataInicio.toISOString(),
        fim: dataFim.toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 