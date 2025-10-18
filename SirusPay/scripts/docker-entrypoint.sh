#!/bin/bash
set -e

echo "🚀 Iniciando entrypoint do Docker..."

# Função para aguardar o banco estar disponível
wait_for_postgres() {
    echo "⏳ Aguardando PostgreSQL estar disponível..."
    
    while ! nc -z postgres 5432; do
        echo "⏳ PostgreSQL não está disponível ainda - aguardando..."
        sleep 2
    done
    
    echo "✅ PostgreSQL está disponível!"
}

# Função para executar migrações
run_migrations() {
    echo "🔄 Executando migrações do Drizzle..."
    
    # Tenta executar as migrações
    if pnpm drizzle-kit push; then
        echo "✅ Migrações executadas com sucesso!"
    else
        echo "❌ Erro ao executar migrações. Tentando novamente em 5 segundos..."
        sleep 5
        if pnpm drizzle-kit push; then
            echo "✅ Migrações executadas com sucesso na segunda tentativa!"
        else
            echo "❌ Falha crítica nas migrações. Abortando..."
            exit 1
        fi
    fi
}

# Função para verificar se o banco tem as tabelas
check_database() {
    echo "🔍 Verificando estrutura do banco..."
    
    # Query simples para verificar se há tabelas
    if node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \$1', ['public'])
        .then(result => {
            console.log('Tabelas encontradas:', result.rows[0].count);
            process.exit(0);
        })
        .catch(err => {
            console.error('Erro ao verificar banco:', err.message);
            process.exit(1);
        });
    "; then
        echo "✅ Banco verificado com sucesso!"
    else
        echo "❌ Erro ao verificar banco"
        exit 1
    fi
}

# Função para fazer seed inicial se necessário
run_initial_seed() {
    echo "🌱 Verificando se precisa executar seed inicial..."
    
    # Verifica se já existe dados (exemplo: verifica se existe pelo menos um usuário)
    USER_COUNT=$(node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.query('SELECT COUNT(*) FROM users')
        .then(result => {
            console.log(result.rows[0].count);
            process.exit(0);
        })
        .catch(err => {
            console.log('0');
            process.exit(0);
        });
    " 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" = "0" ]; then
        echo "🌱 Executando seed inicial..."
        
        # Executa os seeds se disponíveis
        if [ -f "scripts/setup-sistema.js" ]; then
            node scripts/setup-sistema.js || echo "⚠️ Aviso: Seed falhou, mas continuando..."
        fi
        
        echo "✅ Seed inicial concluído!"
    else
        echo "✅ Banco já possui dados, pulando seed inicial"
    fi
}

# Executar verificações e preparações
echo "🔧 Preparando ambiente..."

# Aguardar banco estar disponível
wait_for_postgres

# Aguardar um pouco mais para garantir que está totalmente pronto
echo "⏳ Aguardando estabilização do banco..."
sleep 5

# Executar migrações
run_migrations

# Verificar banco
check_database

# Executar seed inicial se necessário
run_initial_seed

echo "🎉 Preparação concluída! Iniciando aplicação..."

# Executar o comando passado como parâmetro (normalmente "pnpm start")
exec "$@" 