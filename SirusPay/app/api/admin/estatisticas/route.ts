import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { tickets, perfis } from "@/lib/drizzle/schema"
import { eq, desc, gte, lte, and, count, sum } from "drizzle-orm"

// GET /api/admin/estatisticas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const periodo = searchParams.get("periodo") || "hoje"
    const dataEspecifica = searchParams.get("data") // Nova opção para data específica
    
    const agora = new Date()
    let dataInicio: Date
    let dataFim: Date
    
    // Se foi fornecida uma data específica, usar ela
    if (dataEspecifica) {
      const dataParseada = new Date(dataEspecifica)
      dataInicio = new Date(dataParseada.getFullYear(), dataParseada.getMonth(), dataParseada.getDate())
      dataFim = new Date(dataParseada.getFullYear(), dataParseada.getMonth(), dataParseada.getDate() + 1)
    } else {
      // Usar os períodos pré-definidos
      switch (periodo) {
        case "hoje":
          dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
          dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)
          break
        case "semana":
          dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
          dataFim = agora
          break
        case "mes":
          dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
          dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
          break
        case "trimestre":
          const trimestreAtual = Math.floor(agora.getMonth() / 3)
          dataInicio = new Date(agora.getFullYear(), trimestreAtual * 3, 1)
          dataFim = new Date(agora.getFullYear(), (trimestreAtual + 1) * 3, 1)
          break
        case "ano":
          dataInicio = new Date(agora.getFullYear(), 0, 1)
          dataFim = new Date(agora.getFullYear() + 1, 0, 1)
          break
        default:
          dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
          dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)
      }
    }
    
    // Buscar todos os tickets do período
    const ticketsPeriodo = await db
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
        campus: tickets.campus,
      })
      .from(tickets)
      .leftJoin(perfis, eq(perfis.id, tickets.usuario_id))
      .where(
        and(
          gte(tickets.created_at, dataInicio),
          lte(tickets.created_at, dataFim)
        )
      )
      .orderBy(desc(tickets.created_at))
    
    // Calcular estatísticas básicas (apenas tickets pagos)
    const ticketsPagos = ticketsPeriodo.filter(t => t.status === "pago")
    const totalVendas = ticketsPagos.length
    const valorTotal = ticketsPagos.reduce((acc, ticket) => acc + parseFloat(ticket.valor_total), 0)
    const ticketsSubsidiados = ticketsPagos.filter(t => t.subsidiado).length
    const ticketsNaoSubsidiados = ticketsPagos.filter(t => !t.subsidiado).length
    
    // Estatísticas por status
    const statusStats = {
      pagos: ticketsPeriodo.filter(t => t.status === "pago").length,
      pendentes: ticketsPeriodo.filter(t => t.status === "pendente").length,
      cancelados: ticketsPeriodo.filter(t => t.status === "cancelado").length,
    }
    
    // Top usuários por quantidade de tickets
    const usuariosMap = new Map()
    ticketsPeriodo.forEach(ticket => {
      const nome = ticket.nome || "Usuário"
      const atual = usuariosMap.get(nome) || 0
      usuariosMap.set(nome, atual + 1)
    })
    
    const topUsuarios = Array.from(usuariosMap.entries())
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)
    
    // Estatísticas por campus
    const campusStats = {
      "1": {
        nome: "Campus 1",
        local: "Nova Marabá - Folha 31",
        tickets: ticketsPagos.filter(t => t.campus === "1").length,
        valor: ticketsPagos.filter(t => t.campus === "1").reduce((acc, ticket) => acc + parseFloat(ticket.valor_total), 0),
        subsidiados: ticketsPagos.filter(t => t.campus === "1" && t.subsidiado).length,
        naoSubsidiados: ticketsPagos.filter(t => t.campus === "1" && !t.subsidiado).length,
      },
      "2": {
        nome: "Campus 2", 
        local: "Nova Marabá - Folha 17",
        tickets: ticketsPagos.filter(t => t.campus === "2").length,
        valor: ticketsPagos.filter(t => t.campus === "2").reduce((acc, ticket) => acc + parseFloat(ticket.valor_total), 0),
        subsidiados: ticketsPagos.filter(t => t.campus === "2" && t.subsidiado).length,
        naoSubsidiados: ticketsPagos.filter(t => t.campus === "2" && !t.subsidiado).length,
      },
      "3": {
        nome: "Campus 3",
        local: "Cidade Jardim - Marabá", 
        tickets: ticketsPagos.filter(t => t.campus === "3").length,
        valor: ticketsPagos.filter(t => t.campus === "3").reduce((acc, ticket) => acc + parseFloat(ticket.valor_total), 0),
        subsidiados: ticketsPagos.filter(t => t.campus === "3" && t.subsidiado).length,
        naoSubsidiados: ticketsPagos.filter(t => t.campus === "3" && !t.subsidiado).length,
      }
    }

    // Dados por campus formatados para gráficos
    const dadosPorCampus = Object.entries(campusStats).map(([id, stats]) => ({
      campus: stats.nome,
      local: stats.local,
      tickets: stats.tickets,
      valor: stats.valor,
      subsidiados: stats.subsidiados,
      naoSubsidiados: stats.naoSubsidiados,
    }))
    
    // Dados por hora (para hoje)
    const dadosPorHora = Array.from({ length: 24 }, (_, hora) => {
      const ticketsHora = ticketsPeriodo.filter(ticket => {
        const ticketHora = ticket.created_at ? new Date(ticket.created_at).getHours() : -1
        return ticketHora === hora
      })
      
      return {
        hora: `${hora.toString().padStart(2, '0')}:00`,
        quantidade: ticketsHora.length,
        valor: ticketsHora.reduce((acc, t) => acc + parseFloat(t.valor_total), 0),
        subsidiados: ticketsHora.filter(t => t.subsidiado).length,
        naoSubsidiados: ticketsHora.filter(t => !t.subsidiado).length,
      }
    }).filter(h => h.quantidade > 0)
    
    // Dados por dia da semana (para semana)
    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    const dadosPorDia = diasSemana.map((dia, index) => {
      const ticketsDia = ticketsPeriodo.filter(ticket => {
        const ticketDia = ticket.created_at ? new Date(ticket.created_at).getDay() : -1
        return ticketDia === index
      })
      
      return {
        dia,
        quantidade: ticketsDia.length,
        valor: ticketsDia.reduce((acc, t) => acc + parseFloat(t.valor_total), 0),
        subsidiados: ticketsDia.filter(t => t.subsidiado).length,
        naoSubsidiados: ticketsDia.filter(t => !t.subsidiado).length,
      }
    }).filter(d => d.quantidade > 0)
    
    return NextResponse.json({
      sucesso: true,
      data: {
        periodo: dataEspecifica ? `Data: ${dataEspecifica}` : periodo,
        totalVendas,
        valorTotal,
        ticketsSubsidiados,
        ticketsNaoSubsidiados,
        statusStats,
        topUsuarios,
        dadosPorHora,
        dadosPorDia,
        dadosPorCampus,
        tickets: ticketsPeriodo,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        filtroAplicado: dataEspecifica ? 'data' : 'periodo'
      }
    })
  } catch (error: any) {
    console.error("[GET /api/admin/estatisticas]", error)
    return NextResponse.json({ sucesso: false, erro: error.message }, { status: 500 })
  }
} 