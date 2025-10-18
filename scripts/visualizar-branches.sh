#!/bin/bash

# Script para visualizar a estrutura de branches - Sistema SIRUS

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          Sistema SIRUS - Estrutura de Branches                ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}                            main${NC}"
echo -e "${GREEN}                   (Código Completo)${NC}"
echo "                              │"
echo "                    ┌─────────┴─────────┐"
echo "                    │                   │"
echo -e "${YELLOW}              SirusBot           SirusPag${NC}"
echo -e "${YELLOW}           (Chatbot IA)      (Pagamentos)${NC}"
echo ""
echo "┌──────────────────────────────┬──────────────────────────────┐"
echo "│       SirusBot 🤖            │      SirusPag 💳             │"
echo "├──────────────────────────────┼──────────────────────────────┤"
echo "│ • Gemma Chat Service         │ • Mercado Pago Client        │"
echo "│ • MCP Orchestrator           │ • Ticket Sync Service        │"
echo "│ • Chat Analytics             │ • Face Recognition           │"
echo "│ • Dialog Manager             │ • Checkout Transparente      │"
echo "│ • Entity Extraction          │ • QR Code Validation         │"
echo "│ • Intent Recognition         │ • Gestão de Cardápio         │"
echo "│ • Chat Components            │ • Dashboard de Vendas        │"
echo "│ • API /chat                  │ • API /mercado-pago          │"
echo "│ • Demo Chatbot Page          │ • Admin Panel                │"
echo "│ • Ollama Setup Scripts       │ • Payment Mock               │"
echo "└──────────────────────────────┴──────────────────────────────┘"
echo ""
echo -e "${CYAN}Branch Atual:${NC}"
git rev-parse --abbrev-ref HEAD
echo ""
echo -e "${CYAN}Todas as Branches:${NC}"
git branch -a | grep -E "(SirusBot|SirusPag|main)" | sed 's/^/  /'
echo ""
echo -e "${CYAN}Último Commit em cada Branch:${NC}"
for branch in main SirusBot SirusPag; do
    if git rev-parse --verify "$branch" >/dev/null 2>&1; then
        echo -e "${YELLOW}$branch:${NC}"
        git log "$branch" -1 --oneline | sed 's/^/  /'
    fi
done

