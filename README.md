# 🍽️ Sistema SIRUS - Restaurante Universitário

Sistema integrado de gerenciamento de tickets, cardápio e assistente virtual para o Restaurante Universitário da UNIFESSPA.

> **Arquitetura:** Este projeto está organizado em **microserviços independentes** que se comunicam via API REST.

## 🏗️ Arquitetura de Microserviços

```
┌────────────────┐         API REST         ┌──────────────┐
│                │ ◄──────────────────────► │              │
│   SirusPag     │                          │  SirusBot    │
│   (Port 3000)  │   Consulta dados         │  (Port 3001) │
│                │   (cardápio, tickets)    │              │
│  - Pagamentos  │                          │  - Chatbot   │
│  - Tickets     │                          │  - IA/NLP    │
│  - Cardápio    │                          │  - Analytics │
│  - Usuários    │                          │  - Gemma     │
└────────┬───────┘                          └──────┬───────┘
         │                                         │
         ▼                                         ▼
  PostgreSQL DB                                Ollama
  (Port 5432)                                (Port 11434)
```

## 📦 Microserviços

### SirusBot 🤖
**Branch:** `SirusBot` | **Porta:** `3001`

Microserviço de chatbot com IA:
- Assistente virtual inteligente
- Processamento de linguagem natural
- Analytics de conversas
- Integração com Gemma/Ollama

[Ver documentação →](https://github.com/ALEXSANDER2002/restaurant/tree/SirusBot)

### SirusPag 💳
**Branch:** `SirusPag` | **Porta:** `3000`

Microserviço de pagamentos e gestão:
- Sistema de pagamentos (Mercado Pago)
- Gerenciamento de tickets
- Controle de cardápio
- Gestão de usuários

[Ver documentação →](https://github.com/ALEXSANDER2002/restaurant/tree/SirusPag)

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

## 🚀 Instalação Rápida (Docker Compose)

### Iniciar todos os microserviços:

```bash
# 1. Clone o repositório
git clone https://github.com/ALEXSANDER2002/restaurant.git
cd restaurant

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 3. Inicie todos os serviços
docker-compose -f docker-compose.microservices.yml up -d

# 4. Baixe o modelo Gemma (primeira vez)
docker exec -it sirus-ollama ollama pull gemma:2b

# 5. Acesse os serviços
# SirusPag: http://localhost:3000
# SirusBot: http://localhost:3001
```

**📖 Documentação completa:** Ver [MICROSERVICES.md](./MICROSERVICES.md)

## 🐳 Docker (Modo Completo)

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
