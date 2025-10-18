#!/bin/bash

# Script para Gerenciamento de Branches - Sistema SIRUS
# Bash Script para Linux/Mac

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

function show_banner {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  Sistema SIRUS - Branch Manager${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
}

function show_help {
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./scripts/gerenciar-branches.sh [acao]"
    echo ""
    echo -e "${YELLOW}Ações disponíveis:${NC}"
    echo "  chatbot     - Muda para branch SirusBot (desenvolvimento do chatbot)"
    echo "  pagamentos  - Muda para branch SirusPag (desenvolvimento de pagamentos)"
    echo "  main        - Muda para branch main (código completo)"
    echo "  sync        - Sincroniza todas as branches com main"
    echo "  status      - Mostra status atual das branches"
    echo "  help        - Mostra esta mensagem de ajuda"
    echo ""
}

function show_status {
    echo -e "${YELLOW}📊 Status atual das branches:${NC}"
    echo ""
    
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo -e "${GREEN}Branch atual: $current_branch${NC}"
    echo ""
    
    echo -e "${YELLOW}Todas as branches:${NC}"
    git branch -a
    echo ""
    
    echo -e "${YELLOW}Arquivos modificados:${NC}"
    git status --short
}

function switch_to_chatbot {
    echo -e "${GREEN}🤖 Mudando para branch SirusBot (Chatbot)...${NC}"
    git checkout SirusBot
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Agora você está na branch SirusBot${NC}"
        echo ""
        echo -e "${YELLOW}📝 Arquivos principais do chatbot:${NC}"
        echo "  - services/gemma-chat-service.ts"
        echo "  - services/chat-analytics-service.ts"
        echo "  - services/mcp/"
        echo "  - components/chat-bot.tsx"
        echo "  - app/api/chat/route.ts"
    else
        echo -e "${RED}❌ Erro ao mudar para branch SirusBot${NC}"
    fi
}

function switch_to_pagamentos {
    echo -e "${GREEN}💳 Mudando para branch SirusPag (Pagamentos)...${NC}"
    git checkout SirusPag
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Agora você está na branch SirusPag${NC}"
        echo ""
        echo -e "${YELLOW}📝 Arquivos principais de pagamentos:${NC}"
        echo "  - services/mercado-pago-client.ts"
        echo "  - services/ticket-sync-service.ts"
        echo "  - components/comprar-ticket-melhorado.tsx"
        echo "  - components/checkout-transparente.tsx"
        echo "  - app/api/mercado-pago/"
    else
        echo -e "${RED}❌ Erro ao mudar para branch SirusPag${NC}"
    fi
}

function switch_to_main {
    echo -e "${GREEN}🏠 Mudando para branch main...${NC}"
    git checkout main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Agora você está na branch main (código completo)${NC}"
    else
        echo -e "${RED}❌ Erro ao mudar para branch main${NC}"
    fi
}

function sync_branches {
    echo -e "${YELLOW}🔄 Sincronizando branches com main...${NC}"
    echo ""
    
    # Salvar branch atual
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Atualizar main
    echo -e "${CYAN}1️⃣  Atualizando main...${NC}"
    git checkout main
    git pull origin main
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao atualizar main${NC}"
        return 1
    fi
    
    # Atualizar SirusBot
    echo ""
    echo -e "${CYAN}2️⃣  Atualizando SirusBot...${NC}"
    git checkout SirusBot
    git merge main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SirusBot atualizado com sucesso${NC}"
        git push origin SirusBot
    else
        echo -e "${YELLOW}⚠️  Conflitos encontrados em SirusBot - resolva manualmente${NC}"
    fi
    
    # Atualizar SirusPag
    echo ""
    echo -e "${CYAN}3️⃣  Atualizando SirusPag...${NC}"
    git checkout SirusPag
    git merge main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SirusPag atualizado com sucesso${NC}"
        git push origin SirusPag
    else
        echo -e "${YELLOW}⚠️  Conflitos encontrados em SirusPag - resolva manualmente${NC}"
    fi
    
    # Voltar para branch original
    echo ""
    echo -e "${CYAN}4️⃣  Voltando para branch $current_branch...${NC}"
    git checkout "$current_branch"
    
    echo ""
    echo -e "${GREEN}✅ Sincronização concluída!${NC}"
}

# Main
show_banner

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    chatbot)
        switch_to_chatbot
        ;;
    pagamentos)
        switch_to_pagamentos
        ;;
    main)
        switch_to_main
        ;;
    sync)
        sync_branches
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Ação inválida: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GRAY}📖 Para mais informações, consulte BRANCHING_STRATEGY.md${NC}"

