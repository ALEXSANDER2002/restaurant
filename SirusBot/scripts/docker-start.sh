#!/bin/bash
set -e

echo "🚀 Iniciando Restaurant System..."

# Aguardar PostgreSQL estar disponível
echo "⏳ Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
    echo "⏳ PostgreSQL não está disponível - aguardando..."
    sleep 2
done
echo "✅ PostgreSQL disponível!"

# Aguardar estabilização
sleep 3

# Executar migrações
echo "🔄 Executando migrações do Drizzle..."
if ! pnpm drizzle-kit push; then
    echo "⚠️ Primeira tentativa de migração falhou, tentando novamente..."
    sleep 5
    pnpm drizzle-kit push || echo "⚠️ Migrações falharam, mas continuando..."
fi

echo "✅ Preparação concluída!"

# Iniciar aplicação
echo "🎉 Iniciando aplicação Next.js..."
exec pnpm start 