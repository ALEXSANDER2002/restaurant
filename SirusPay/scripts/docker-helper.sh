#!/bin/bash

# Script Helper para operações Docker - Restaurant System
# Uso: ./scripts/docker-helper.sh [comando]

set -e

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

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
        exit 1
    fi
}

# Função para verificar se o arquivo docker-compose existe
check_compose_file() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "Arquivo docker-compose.yml não encontrado!"
        exit 1
    fi
}

# Função para build completo
build() {
    print_status "Fazendo build completo da aplicação..."
    check_docker
    check_compose_file
    
    print_status "Removendo containers antigos..."
    docker-compose down -v 2>/dev/null || true
    
    print_status "Fazendo build das imagens..."
    docker-compose build --no-cache
    
    print_success "Build concluído!"
}

# Função para iniciar serviços
start() {
    print_status "Iniciando serviços..."
    check_docker
    check_compose_file
    
    docker-compose up -d
    
    print_status "Aguardando serviços ficarem prontos..."
    sleep 10
    
    # Verificar status dos serviços
    if docker-compose ps | grep -q "Up"; then
        print_success "Serviços iniciados com sucesso!"
        print_status "Aplicação disponível em: http://localhost"
        print_status "Banco PostgreSQL disponível em: localhost:5432"
    else
        print_error "Alguns serviços falharam ao iniciar!"
        docker-compose ps
        exit 1
    fi
}

# Função para parar serviços
stop() {
    print_status "Parando serviços..."
    docker-compose down
    print_success "Serviços parados!"
}

# Função para reiniciar
restart() {
    print_status "Reiniciando serviços..."
    stop
    start
}

# Função para ver logs
logs() {
    print_status "Mostrando logs dos serviços..."
    docker-compose logs -f
}

# Função para limpar tudo
clean() {
    print_warning "Esta operação irá remover TODOS os containers, volumes e imagens!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Limpando containers e volumes..."
        docker-compose down -v
        
        print_status "Removendo imagens..."
        docker rmi $(docker images "restaurant*" -q) 2>/dev/null || true
        
        print_status "Limpando sistema Docker..."
        docker system prune -f
        
        print_success "Limpeza concluída!"
    else
        print_status "Operação cancelada."
    fi
}

# Função para status
status() {
    print_status "Status dos serviços:"
    docker-compose ps
    
    print_status "\nUso de recursos:"
    docker stats --no-stream $(docker-compose ps -q) 2>/dev/null || print_warning "Nenhum container rodando"
}

# Função para executar migrations manualmente
migrate() {
    print_status "Executando migrações manualmente..."
    docker-compose exec app pnpm drizzle-kit push
    print_success "Migrações executadas!"
}

# Função para acessar banco
db() {
    print_status "Conectando ao banco PostgreSQL..."
    docker-compose exec postgres psql -U postgres -d restaurant
}

# Função para backup do banco
backup() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_status "Criando backup do banco: $BACKUP_FILE"
    
    docker-compose exec postgres pg_dump -U postgres restaurant > $BACKUP_FILE
    
    print_success "Backup criado: $BACKUP_FILE"
}

# Função para restore do banco
restore() {
    if [ -z "$1" ]; then
        print_error "Uso: $0 restore <arquivo_backup.sql>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Arquivo de backup não encontrado: $1"
        exit 1
    fi
    
    print_warning "Esta operação irá SUBSTITUIR todos os dados do banco!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restaurando backup: $1"
        docker-compose exec -T postgres psql -U postgres restaurant < "$1"
        print_success "Backup restaurado!"
    else
        print_status "Operação cancelada."
    fi
}

# Função para mostrar ajuda
help() {
    echo "Restaurant System - Docker Helper"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build     - Faz build completo da aplicação"
    echo "  start     - Inicia todos os serviços"
    echo "  stop      - Para todos os serviços"
    echo "  restart   - Reinicia todos os serviços"
    echo "  logs      - Mostra logs em tempo real"
    echo "  status    - Mostra status dos serviços"
    echo "  clean     - Remove containers, volumes e imagens"
    echo "  migrate   - Executa migrações manualmente"
    echo "  db        - Conecta ao banco PostgreSQL"
    echo "  backup    - Cria backup do banco"
    echo "  restore   - Restaura backup do banco"
    echo "  help      - Mostra esta ajuda"
    echo ""
}

# Processar comando
case "$1" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    migrate)
        migrate
        ;;
    db)
        db
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo ""
        help
        exit 1
        ;;
esac 