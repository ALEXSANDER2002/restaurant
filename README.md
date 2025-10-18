# 🤖 SirusBot - Microserviço de Chatbot

Microserviço independente de chatbot com IA para o Sistema SIRUS da UNIFESSPA.

> **Arquitetura:** Este é um microserviço que se comunica com o **SirusPag** via API REST.

## 🏗️ Arquitetura

```
┌─────────────────┐         API REST          ┌─────────────────┐
│                 │ ◄────────────────────────► │                 │
│   SirusPag      │                            │   SirusBot      │
│   (Port 3000)   │   Consulta dados           │   (Port 3001)   │
│                 │   (cardápio, tickets, etc) │                 │
│  - Pagamentos   │                            │  - IA/Chatbot   │
│  - Tickets      │                            │  - Analytics    │
│  - Cardápio     │                            │  - NLP          │
│  - Usuários     │                            │  - Gemma/Ollama │
└─────────────────┘                            └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
  PostgreSQL DB                                    Ollama (IA)
```

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **Ollama/Gemma** - Modelo de IA local
- **REST API** - Comunicação entre microserviços
- **Docker** - Containerização
- **Tailwind CSS** - Estilização

## 📦 Funcionalidades

### 🧠 Inteligência Artificial
- Motor de conversação com Gemma
- Reconhecimento de intenções (Intent Recognition)
- Extração de entidades (Entity Extraction)
- Gerenciamento de contexto (MCP - Model Context Protocol)
- Análise de sentimento

### 📊 Analytics
- Métricas de conversas em tempo real
- Taxa de satisfação
- Intents mais utilizadas
- Dashboard de analytics

### 🔗 Integração
- **API REST** para comunicação externa
- Cliente HTTP para consumir SirusPag
- Autenticação entre microserviços
- Health check endpoints

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- Ollama
- Docker (opcional)

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone -b SirusBot https://github.com/ALEXSANDER2002/restaurant.git sirusbot
cd sirusbot
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:

```env
# Porta do serviço
PORT=3001

# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b

# SirusPag API (Microserviço de Pagamentos)
SIRUSPAG_API_URL=http://localhost:3000/api
MICROSERVICE_AUTH_TOKEN=seu_token_secreto
```

### 4. Configure o Ollama

```bash
# Instalar Ollama
# Windows: https://ollama.com/download
# Linux/Mac: curl -fsSL https://ollama.com/install.sh | sh

# Baixar o modelo Gemma
ollama pull gemma:2b

# Verificar instalação
ollama list

# Rodar setup
pnpm setup:ollama
```

### 5. Inicie o servidor

```bash
pnpm dev
```

Acesse: `http://localhost:3001`

## 🐳 Docker

### Build

```bash
docker build -t sirusbot:latest .
```

### Run

```bash
docker run -d \
  --name sirusbot \
  -p 3001:3001 \
  -e OLLAMA_HOST=http://host.docker.internal:11434 \
  -e SIRUSPAG_API_URL=http://siruspag:3000/api \
  -e MICROSERVICE_AUTH_TOKEN=seu_token \
  sirusbot:latest
```

## 📡 API REST

O SirusBot expõe endpoints REST para integração com outros serviços.

### Endpoints Principais

#### 1. Enviar Mensagem
```http
POST /api/chatbot/message
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "message": "Qual é o cardápio de hoje?",
  "userId": "user-123"
}
```

#### 2. Health Check
```http
GET /api/health
```

#### 3. Analytics
```http
GET /api/chatbot/analytics?period=7d
Authorization: Bearer TOKEN
```

**📖 Documentação completa:** Ver [API.md](./API.md)

## 🔗 Integração com SirusPag

O SirusBot consome APIs do SirusPag para obter informações:

```typescript
import { sirusPagClient } from '@/services/siruspag-client';

// Consultar cardápio
const cardapio = await sirusPagClient.getCardapioHoje();

// Validar ticket
const ticket = await sirusPagClient.validarTicket('ticket-123');

// Consultar saldo
const saldo = await sirusPagClient.getSaldoUsuario('user-123');
```

## 📁 Estrutura do Projeto

```
sirusbot/
├── app/
│   ├── api/
│   │   ├── chat/              # API de conversação (pública)
│   │   ├── chatbot/           # API REST para microserviços
│   │   │   ├── message/       # Enviar mensagens
│   │   │   └── analytics/     # Métricas
│   │   └── health/            # Health check
│   ├── demo-chatbot/          # Demo do chatbot
│   └── page.tsx               # Página principal
├── components/
│   ├── chat-bot.tsx           # Componente principal
│   ├── chat-analytics-dashboard.tsx
│   └── demo-chat-unifesspa.tsx
├── services/
│   ├── gemma-chat-service.ts  # Serviço de IA
│   ├── chat-analytics-service.ts
│   ├── siruspag-client.ts     # Cliente HTTP SirusPag
│   └── mcp/                   # Model Context Protocol
├── hooks/
│   ├── use-chatbot.ts
│   └── use-chat-analytics.ts
├── Dockerfile                 # Container do microserviço
├── API.md                     # Documentação da API
└── README.md
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento (porta 3001)
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start

# Testes
pnpm test:gemma

# Setup Ollama
pnpm setup:ollama
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do serviço | 3001 |
| `OLLAMA_HOST` | URL do Ollama | http://localhost:11434 |
| `OLLAMA_MODEL` | Modelo de IA | gemma:2b |
| `SIRUSPAG_API_URL` | URL do SirusPag | http://localhost:3000/api |
| `MICROSERVICE_AUTH_TOKEN` | Token de auth | - |

## 🌐 Microserviços Relacionados

- **SirusPag** - Sistema de pagamentos e gestão  
  Branch: `SirusPag`  
  Porta: `3000`  
  Repositório: https://github.com/ALEXSANDER2002/restaurant/tree/SirusPag

- **Main** - Sistema completo (monolito)  
  Branch: `main`  
  Repositório: https://github.com/ALEXSANDER2002/restaurant

## 🔐 Segurança

1. **Autenticação entre microserviços**: Token Bearer obrigatório
2. **CORS**: Configure origins permitidos
3. **Rate Limiting**: Implementar conforme necessidade
4. **Validação de dados**: Zod para validação de schemas

## 📝 Licença

MIT

---

**Desenvolvido para a UNIFESSPA**
