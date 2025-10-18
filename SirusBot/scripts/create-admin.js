#!/usr/bin/env node
// create-admin.js - Script para criar usuário administrador

const { db } = require('../lib/drizzle')
const { perfis } = require('../lib/drizzle/schema')
const { eq } = require('drizzle-orm')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const readline = require('readline')

// Interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Função para fazer pergunta
function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

// Função para entrada de senha (oculta)
function passwordQuestion(query) {
  return new Promise(resolve => {
    process.stdout.write(query)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    
    let password = ''
    process.stdin.on('data', function(char) {
      char = char + ''
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdout.write('\n')
          resolve(password)
          break
        case '\u0003':
          process.exit()
          break
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1)
            process.stdout.write('\b \b')
          }
          break
        default:
          password += char
          process.stdout.write('*')
          break
      }
    })
  })
}

async function createAdmin() {
  console.log('🔧 CRIAÇÃO DE USUÁRIO ADMINISTRADOR')
  console.log('=====================================')
  console.log('')

  try {
    // Verificar conexão com banco
    console.log('🔍 Verificando conexão com banco de dados...')
    await db.select().from(perfis).limit(1)
    console.log('✅ Conexão com banco estabelecida!')
    console.log('')

    // Coletar informações do admin
    const nome = await question('👤 Nome completo do administrador: ')
    const email = await question('📧 Email do administrador: ')
    
    if (!nome || !email) {
      console.log('❌ Nome e email são obrigatórios!')
      process.exit(1)
    }

    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(perfis)
      .where(eq(perfis.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      console.log('❌ Já existe um usuário com este email!')
      process.exit(1)
    }

    const senha = await passwordQuestion('🔒 Senha do administrador (não será exibida): ')
    const confirmarSenha = await passwordQuestion('🔒 Confirme a senha: ')

    if (senha !== confirmarSenha) {
      console.log('❌ Senhas não coincidem!')
      process.exit(1)
    }

    if (senha.length < 6) {
      console.log('❌ Senha deve ter pelo menos 6 caracteres!')
      process.exit(1)
    }

    console.log('')
    console.log('⏳ Criando usuário administrador...')

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12)

    // Criar usuário admin
    const novoAdmin = await db
      .insert(perfis)
      .values({
        id: crypto.randomUUID(),
        nome: nome,
        email: email,
        password_hash: senhaHash,
        tipo_usuario: 'admin',
        status: 'ativo',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()

    console.log('✅ Usuário administrador criado com sucesso!')
    console.log('')
    console.log('📋 INFORMAÇÕES DO ADMINISTRADOR:')
    console.log(`• Nome: ${nome}`)
    console.log(`• Email: ${email}`)
    console.log(`• Tipo: Administrador`)
    console.log(`• Status: Ativo`)
    console.log('')
    console.log('🌐 ACESSO AO SISTEMA:')
    console.log('• URL: /admin')
    console.log(`• Login: ${email}`)
    console.log('• Senha: [a senha que você definiu]')
    console.log('')
    console.log('🎉 Pronto! Você já pode acessar o painel administrativo.')

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error.message)
    
    if (error.message.includes('connect')) {
      console.log('')
      console.log('💡 DICAS PARA RESOLVER:')
      console.log('1. Verifique se o PostgreSQL está rodando')
      console.log('2. Verifique a variável DATABASE_URL no .env')
      console.log('3. Execute: docker-compose ps')
    }
    
    process.exit(1)
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Função para criar admin de teste (não interativo)
async function createTestAdmin() {
  console.log('🧪 Criando administrador de teste...')
  
  try {
    const testEmail = 'admin@unifesspa.edu.br'
    
    // Verificar se já existe
    const existing = await db
      .select()
      .from(perfis)
      .where(eq(perfis.email, testEmail))
      .limit(1)

    if (existing.length > 0) {
      console.log('ℹ️ Administrador de teste já existe!')
      console.log(`• Email: ${testEmail}`)
      console.log('• Senha: admin123')
      return
    }

    const senhaHash = await bcrypt.hash('admin123', 12)

    await db
      .insert(perfis)
      .values({
        id: crypto.randomUUID(),
        nome: 'Administrador UNIFESSPA',
        email: testEmail,
        password_hash: senhaHash,
        tipo_usuario: 'admin',
        status: 'ativo',
        created_at: new Date(),
        updated_at: new Date()
      })

    console.log('✅ Administrador de teste criado!')
    console.log('')
    console.log('📋 CREDENCIAIS DE TESTE:')
    console.log(`• Email: ${testEmail}`)
    console.log('• Senha: admin123')
    console.log('')
    console.log('⚠️ IMPORTANTE: Altere esta senha em produção!')

  } catch (error) {
    console.error('❌ Erro ao criar admin de teste:', error.message)
    throw error
  }
}

// Verificar argumentos da linha de comando
if (process.argv.includes('--test')) {
  createTestAdmin()
} else {
  createAdmin()
}

module.exports = { createAdmin, createTestAdmin } 