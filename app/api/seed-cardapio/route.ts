import { NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { cardapio } from '@/lib/drizzle/schema'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não encontrada')
}

const client = postgres(DATABASE_URL)
const db = drizzle(client)

export async function POST() {
  try {
    console.log('🌱 Iniciando seed do cardápio...')

    // Calcular início e fim da semana atual (segunda a sexta)
    const hoje = new Date()
    const diaSemana = hoje.getDay() // 0 = domingo, 1 = segunda, etc.
    const segundaFeira = new Date(hoje)
    segundaFeira.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1))
    
    const sextaFeira = new Date(segundaFeira)
    sextaFeira.setDate(segundaFeira.getDate() + 4)

    const cardapioSemana = [
      {
        dia_semana: 'segunda',
        prato_principal: 'Frango grelhado com temperos especiais',
        acompanhamentos: 'Arroz branco, feijão preto, batata doce cozida',
        saladas: 'Salada de alface com tomate, Salada de cenoura ralada',
        sobremesa: 'Gelatina de frutas vermelhas',
        bebida: 'Suco de laranja natural, Água',
        opcao_vegetariana: 'Hambúrguer de grão-de-bico com quinoa',
        observacoes: 'Opções sem glúten disponíveis mediante solicitação'
      },
      {
        dia_semana: 'terca',
        prato_principal: 'Peixe assado com ervas finas',
        acompanhamentos: 'Arroz integral, feijão carioca, purê de abóbora',
        saladas: 'Salada verde mista, Salada de beterraba',
        sobremesa: 'Pudim de leite condensado',
        bebida: 'Suco de maracujá, Água',
        opcao_vegetariana: 'Lasanha de berinjela com ricota',
        observacoes: 'Peixes de origem sustentável'
      },
      {
        dia_semana: 'quarta',
        prato_principal: 'Carne bovina refogada com cebolas',
        acompanhamentos: 'Arroz branco, feijão preto, mandioca cozida',
        saladas: 'Salada de pepino com iogurte, Salada de repolho',
        sobremesa: 'Mousse de chocolate',
        bebida: 'Suco de goiaba, Água',
        opcao_vegetariana: 'Curry de lentilha com legumes',
        observacoes: 'Carne de fornecedores locais certificados'
      },
      {
        dia_semana: 'quinta',
        prato_principal: 'Frango ao molho de tomate caseiro',
        acompanhamentos: 'Arroz com açafrão, feijão carioca, batata inglesa',
        saladas: 'Salada de rúcula com tomate cereja, Salada de acelga',
        sobremesa: 'Doce de mamão com coco',
        bebida: 'Suco de acerola, Água',
        opcao_vegetariana: 'Escondidinho de batata com proteína de soja',
        observacoes: 'Molho caseiro feito com tomates orgânicos'
      },
      {
        dia_semana: 'sexta',
        prato_principal: 'Peixe cozido com limão e coentro',
        acompanhamentos: 'Arroz branco, feijão preto, farofa de milho',
        saladas: 'Salada tropical com mamão, Salada de couve refogada',
        sobremesa: 'Brigadeiro tradicional',
        bebida: 'Suco de caju, Água',
        opcao_vegetariana: 'Moqueca de banana da terra com leite de coco',
        observacoes: 'Sexta-feira especial com sabores regionais'
      }
    ]

    // Limpar cardápio existente ativo
    console.log('🗑️ Removendo cardápio existente...')
    await db.delete(cardapio).where(eq(cardapio.ativo, true))

    // Inserir novo cardápio
    console.log('📝 Inserindo novo cardápio...')
    for (const item of cardapioSemana) {
      await db.insert(cardapio).values({
        ...item,
        semana_inicio: segundaFeira,
        semana_fim: sextaFeira,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      })
    }

    console.log('✅ Cardápio da semana criado com sucesso!')
    console.log(`📅 Período: ${segundaFeira.toLocaleDateString('pt-BR')} a ${sextaFeira.toLocaleDateString('pt-BR')}`)
    console.log('🍽️ 5 dias de cardápio adicionados')

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Cardápio da semana criado com sucesso!',
      periodo: {
        inicio: segundaFeira.toLocaleDateString('pt-BR'),
        fim: sextaFeira.toLocaleDateString('pt-BR')
      },
      dias_adicionados: 5
    })

  } catch (error) {
    console.error('❌ Erro ao criar cardápio:', error)
    return NextResponse.json(
      {
        sucesso: false,
        erro: 'Erro ao criar cardápio',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 