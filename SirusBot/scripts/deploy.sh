#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOY PARA VPS HOSTINGER - RESTAURANT UNIFESSPA
# =============================================================================
# Este script automatiza o processo de deploy da aplicação dockerizada

set -e  # Para o script se algum comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado na pasta raiz do projeto"
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado. Instale primeiro o Docker."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado. Instale primeiro o Docker Compose."
    exit 1
fi

print_status "=== Iniciando Deploy do Restaurant UNIFESSPA ==="

# 1. Verificar arquivo .env
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado. Copiando .env.example..."
    cp .env.example .env
    print_error "Configure o arquivo .env com suas credenciais antes de continuar!"
    exit 1
fi

# 2. Parar containers existentes
print_status "Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# 3. Remover imagens antigas (opcional - descomente se quiser)
# print_status "Removendo imagens antigas..."
# docker system prune -f || true

# 4. Build da nova imagem
print_status "Fazendo build da aplicação..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 5. Iniciar serviços
print_status "Iniciando serviços..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Aguardar serviços ficarem prontos
print_status "Aguardando serviços ficarem prontos..."
sleep 30

# 7. Verificar se os serviços estão rodando
print_status "Verificando status dos serviços..."

# Verificar PostgreSQL
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres &> /dev/null; then
    print_success "PostgreSQL está rodando"
else
    print_error "PostgreSQL não está respondendo"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

# Verificar aplicação Next.js
if curl -f http://localhost:3000/health &> /dev/null; then
    print_success "Aplicação Next.js está rodando"
else
    print_warning "Aplicação Next.js não está respondendo na porta 3000"
    print_status "Verificando logs da aplicação..."
    docker-compose -f docker-compose.prod.yml logs app
fi

# Verificar Nginx
if curl -f http://localhost/health &> /dev/null; then
    print_success "Nginx está rodando"
else
    print_warning "Nginx não está respondendo na porta 80"
    print_status "Verificando logs do Nginx..."
    docker-compose -f docker-compose.prod.yml logs nginx
fi

# 8. Mostrar status final
print_status "=== Status Final dos Containers ==="
docker-compose -f docker-compose.prod.yml ps

# 9. Mostrar informações úteis
echo ""
print_success "=== Deploy Concluído! ==="
echo ""
echo "🌐 URLs disponíveis:"
echo "   - Aplicação: http://localhost"
echo "   - Health Check: http://localhost/health"
echo ""
echo "📊 Comandos úteis:"
echo "   - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Parar: docker-compose -f docker-compose.prod.yml down"
echo "   - Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "   - Status: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🔧 Para configurar SSL/HTTPS:"
echo "   1. Adicione seus certificados na pasta ./ssl/"
echo "   2. Descomente as linhas SSL no nginx.conf"
echo "   3. Reinicie o nginx: docker-compose -f docker-compose.prod.yml restart nginx"
echo ""

# 10. Opcional: executar seeds de dados iniciais
read -p "Deseja popular o banco com dados iniciais? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Populando banco com dados iniciais..."
    
    # Aguardar aplicação estar completamente pronta
    sleep 10
    
    # Executar seeds via API
    curl -X POST http://localhost/api/seed-cardapio || print_warning "Erro ao popular cardápio"
    # curl -X POST http://localhost/api/seed-users || print_warning "Erro ao criar usuários"
    
    print_success "Dados iniciais populados!"
fi

print_success "Deploy finalizado com sucesso! 🚀" 