const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { perfis } = require('../lib/drizzle/schema')
const crypto = require('crypto')

// Carregar variáveis de ambiente
require('dotenv').config()

async function criarUsuarioTeste() {
  console.log('🔧 CRIANDO USUÁRIO TESTE\n')

  try {
    // Conectar ao banco
    const sql = postgres(process.env.DATABASE_URL)
    const db = drizzle(sql)

    // Dados do usuário teste
    const usuarioTeste = {
      id: crypto.randomUUID(),
      nome: "Usuário Teste",
      email: "teste@restaurant.com",
      telefone: "(11) 99999-9999",
      ra: "123456",
      tipo: "estudante",
      ativo: true,
      created_at: new Date(),
      updated_at: new Date()
    }

    console.log('📦 Inserindo usuário:', usuarioTeste)

    // Inserir usuário
    const resultado = await db.insert(perfis).values(usuarioTeste).returning()

    console.log('✅ Usuário criado com sucesso!')
    console.log('🆔 ID:', resultado[0].id)
    console.log('📧 Email:', resultado[0].email)

    console.log('\n📋 Para testar, use este ID:')
    console.log(`usuario_id: "${resultado[0].id}"`)

    // Fechar conexão
    await sql.end()

    return resultado[0].id

  } catch (error) {
    console.error('❌ Erro ao criar usuário teste:', error.message)
    throw error
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarUsuarioTeste()
    .then((id) => {
      console.log(`\n🎯 Usuário teste criado: ${id}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Falha:', error.message)
      process.exit(1)
    })
}

module.exports = { criarUsuarioTeste } 