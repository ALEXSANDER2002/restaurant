import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { perfis, tickets } from "@/lib/drizzle/schema"
import { sql } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Criar usuários de teste
    const usuariosTest = [
      { nome: "Admin Sistema", email: "admin@unifesspa.edu.br", senha: "admin123", tipo: "admin" },
      { nome: "Maria Silva", email: "maria@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "João Santos", email: "joao@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Ana Oliveira", email: "ana@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Carlos Souza", email: "carlos@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Juliana Costa", email: "juliana@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Pedro Almeida", email: "pedro@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Lucia Ferreira", email: "lucia@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Roberto Lima", email: "roberto@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
      { nome: "Fernanda Rocha", email: "fernanda@unifesspa.edu.br", senha: "12345678", tipo: "usuario" },
    ]

    const usuariosInseridos = []
    
    for (const usuario of usuariosTest) {
      const hash = bcrypt.hashSync(usuario.senha, 10)
      const result = await db.execute(sql`
        INSERT INTO perfis (id, nome, email, password_hash, tipo_usuario) 
        VALUES (gen_random_uuid(), ${usuario.nome}, ${usuario.email}, ${hash}, ${usuario.tipo}) 
        ON CONFLICT (email) DO UPDATE SET 
          nome = EXCLUDED.nome,
          password_hash = EXCLUDED.password_hash,
          tipo_usuario = EXCLUDED.tipo_usuario
        RETURNING id
      `)
      
      if (result.rows && result.rows.length > 0) {
        usuariosInseridos.push({ id: result.rows[0].id, ...usuario })
      }
    }

    // Criar tickets de teste para os últimos 30 dias
    const agora = new Date()
    const ticketsTest = []
    
    // Gerar dados dos últimos 30 dias
    for (let i = 29; i >= 0; i--) {
      const data = new Date(agora)
      data.setDate(data.getDate() - i)
      
      // Simular diferentes quantidades por dia (mais tickets durante a semana)
      const diaSemana = data.getDay()
      const isWeekend = diaSemana === 0 || diaSemana === 6
      
      const baseTickets = isWeekend ? 20 : 80
      const variacao = Math.floor(Math.random() * 40) - 20
      const totalTicketsHoje = Math.max(5, baseTickets + variacao)
      
      // Distribuir tickets ao longo do dia (horários de almoço: 11h-15h)
      for (let j = 0; j < totalTicketsHoje; j++) {
        const usuario = usuariosInseridos[Math.floor(Math.random() * usuariosInseridos.length)]
        if (!usuario || usuario.tipo === "admin") continue
        
        // Horário aleatório entre 11h e 15h
        const hora = 11 + Math.floor(Math.random() * 4)
        const minuto = Math.floor(Math.random() * 60)
        
        const dataTicket = new Date(data)
        dataTicket.setHours(hora, minuto, 0, 0)
        
        // 70% subsidiado, 30% não subsidiado
        const subsidiado = Math.random() < 0.7
        const valorTotal = subsidiado ? 2.0 : 13.0
        
        // 90% pagos, 8% pendentes, 2% cancelados
        const rand = Math.random()
        let status = "pago"
        if (rand < 0.02) status = "cancelado"
        else if (rand < 0.1) status = "pendente"
        
        ticketsTest.push({
          id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${j}`,
          usuario_id: usuario.id,
          data: dataTicket.toISOString(),
          quantidade: "1",
          valor_total: valorTotal.toString(),
          status,
          subsidiado,
          created_at: dataTicket,
        })
      }
    }
    
    // Inserir tickets em lotes
    const batchSize = 50
    let ticketsInseridos = 0
    
    for (let i = 0; i < ticketsTest.length; i += batchSize) {
      const batch = ticketsTest.slice(i, i + batchSize)
      
      for (const ticket of batch) {
        try {
          await db.execute(sql`
            INSERT INTO tickets (id, usuario_id, data, quantidade, valor_total, status, subsidiado, created_at) 
            VALUES (${ticket.id}, ${ticket.usuario_id}, ${ticket.data}, ${ticket.quantidade}, ${ticket.valor_total}, ${ticket.status}, ${ticket.subsidiado}, ${ticket.created_at}) 
            ON CONFLICT (id) DO NOTHING
          `)
          ticketsInseridos++
        } catch (error) {
          console.error(`Erro ao inserir ticket ${ticket.id}:`, error)
        }
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Dados de teste criados com sucesso!`,
      usuarios: usuariosInseridos.length,
      tickets: ticketsInseridos,
      details: {
        usuariosInseridos: usuariosInseridos.map(u => ({ nome: u.nome, email: u.email, tipo: u.tipo })),
        periodoDados: "Últimos 30 dias",
        ticketsPorTipo: {
          subsidiados: ticketsTest.filter(t => t.subsidiado).length,
          naoSubsidiados: ticketsTest.filter(t => !t.subsidiado).length,
        },
        ticketsPorStatus: {
          pagos: ticketsTest.filter(t => t.status === "pago").length,
          pendentes: ticketsTest.filter(t => t.status === "pendente").length,
          cancelados: ticketsTest.filter(t => t.status === "cancelado").length,
        }
      }
    })
  } catch (e: any) {
    console.error("Erro ao criar dados de teste:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
} 