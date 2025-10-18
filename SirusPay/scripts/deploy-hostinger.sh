#!/bin/bash
# deploy-hostinger.sh - Script de Deploy para Hostinger
# Uso: ./scripts/deploy-hostinger.sh

set -e

echo "🚀 DEPLOY SIRUS - SISTEMA DE RESTAURANTE UNIVERSITÁRIO"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script a partir da raiz do projeto!"
fi

log "Iniciando deploy para produção..."

# 1. Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado! Instale o Docker primeiro."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado! Instale o Docker Compose primeiro."
fi

success "Docker e Docker Compose encontrados"

# 2. Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    log "Arquivo .env não encontrado. Copiando template de produção..."
    cp .env.production .env
    warning "Configure o arquivo .env com suas credenciais reais antes de continuar!"
    warning "Principalmente: APP_URL, NEXTAUTH_SECRET e credenciais do Mercado Pago"
    
    echo ""
    echo "Pressione ENTER para continuar após configurar o .env..."
    read -r
fi

# 3. Criar diretórios necessários
log "Criando diretórios necessários..."
mkdir -p data/postgres
mkdir -p uploads
mkdir -p ssl
success "Diretórios criados"

# 4. Parar containers existentes
log "Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
success "Containers parados"

# 5. Limpar imagens antigas (opcional)
log "Limpando imagens antigas..."
docker system prune -f || true

# 6. Construir e iniciar containers
log "Construindo e iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# 7. Aguardar containers ficarem saudáveis
log "Aguardando containers ficarem saudáveis..."
sleep 10

# 8. Verificar status dos containers
log "Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

# 9. Executar health checks
log "Executando health checks..."

# Verificar PostgreSQL
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres -d restaurant > /dev/null 2>&1; then
    success "PostgreSQL está funcionando"
else
    error "PostgreSQL não está respondendo"
fi

# Verificar aplicação (aguardar até 60 segundos)
log "Aguardando aplicação ficar disponível..."
for i in {1..12}; do
    if curl -f http://localhost/api/session > /dev/null 2>&1; then
        success "Aplicação está funcionando"
        break
    fi
    
    if [ $i -eq 12 ]; then
        error "Aplicação não ficou disponível após 60 segundos"
    fi
    
    log "Tentativa $i/12 - aguardando 5 segundos..."
    sleep 5
done

# Verificar Nginx
if curl -f http://localhost/nginx-health > /dev/null 2>&1; then
    success "Nginx está funcionando"
else
    error "Nginx não está respondendo"
fi

# 10. Mostrar logs iniciais
log "Mostrando logs iniciais..."
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================"
echo ""
echo "📋 INFORMAÇÕES DO DEPLOY:"
echo "• Aplicação: http://localhost"
echo "• Status: docker-compose -f docker-compose.prod.yml ps"
echo "• Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "• Parar: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Configure seu domínio para apontar para este servidor"
echo "2. Configure SSL/HTTPS (Let's Encrypt recomendado)"
echo "3. Atualize as credenciais do Mercado Pago para produção"
echo "4. Configure backup automático do banco de dados"
echo ""
echo "📊 MONITORAMENTO:"
echo "• Health Check Nginx: curl http://localhost/nginx-health"
echo "• Health Check App: curl http://localhost/api/session"
echo "• Banco de dados: docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d restaurant"
echo ""

success "Sistema SIRUS pronto para produção! 🎊" 