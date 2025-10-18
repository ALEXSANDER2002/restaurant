# 🍽️ Sistema SIRUS - Restaurante Universitário

Sistema integrado de gerenciamento de tickets, cardápio e assistente virtual para o Restaurante Universitário da UNIFESSPA.

## 📦 Módulos

Este projeto está organizado em dois módulos principais:

- **SirusBot** 🤖 - Assistente virtual inteligente com chatbot e análise de conversas
- **SirusPag** 💳 - Sistema de pagamentos, tickets e gestão do restaurante

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **PostgreSQL** - Banco de dados
- **Mercado Pago** - Pagamentos
- **Ollama/Gemma** - Chatbot IA
- **Tailwind CSS** - Estilização

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL

## ⚙️ Instalação

```bash
# Clone o repositório
git clone https://github.com/ALEXSANDER2002/restaurant.git
cd restaurant

# Instale as dependências
pnpm install

# Configure o arquivo .env com suas credenciais

# Execute as migrações
pnpm drizzle-kit push

# Inicie o servidor
pnpm dev
```

Acesse: `http://localhost:3000`

## 🐳 Docker

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

## 🌳 Gerenciamento de Branches

Este projeto usa uma estratégia de branches para organizar o desenvolvimento:

### Branches Disponíveis

- **main** - Branch principal com código completo e estável
- **SirusBot** - Desenvolvimento do módulo de chatbot
- **SirusPag** - Desenvolvimento do módulo de pagamentos

### Scripts Helper

#### Windows (PowerShell):
```powershell
# Mudar para branch do chatbot
.\scripts\gerenciar-branches.ps1 chatbot

# Mudar para branch de pagamentos
.\scripts\gerenciar-branches.ps1 pagamentos

# Mudar para branch main
.\scripts\gerenciar-branches.ps1 main

# Sincronizar todas as branches com main
.\scripts\gerenciar-branches.ps1 sync

# Ver status das branches
.\scripts\gerenciar-branches.ps1 status
```

#### Linux/Mac (Bash):
```bash
# Tornar o script executável (primeira vez)
chmod +x scripts/gerenciar-branches.sh

# Mudar para branch do chatbot
./scripts/gerenciar-branches.sh chatbot

# Mudar para branch de pagamentos
./scripts/gerenciar-branches.sh pagamentos

# Mudar para branch main
./scripts/gerenciar-branches.sh main

# Sincronizar todas as branches com main
./scripts/gerenciar-branches.sh sync

# Ver status das branches
./scripts/gerenciar-branches.sh status
```

### Workflow de Desenvolvimento

Para mais detalhes sobre a estratégia de branches, convenções de commit e boas práticas, consulte o arquivo `BRANCHING_STRATEGY.md`.

## 📝 Licença

MIT

---

**Desenvolvido para a UNIFESSPA**
