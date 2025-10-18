# 🏗️ Arquitetura de Microserviços - Sistema SIRUS

## Visão Geral

O Sistema SIRUS foi arquitetado como **microserviços independentes** que se comunicam via **API REST**.

```
┌──────────────────────────────────────────────────────────────┐
│                     Sistema SIRUS                             │
│                                                                │
│  ┌────────────────┐         API REST         ┌──────────────┐│
│  │                │ ◄──────────────────────► │              ││
│  │   SirusPag     │                          │  SirusBot    ││
│  │   Port 3000    │   Consulta dados         │  Port 3001   ││
│  │                │   (cardápio, tickets)    │              ││
│  │  - Pagamentos  │                          │  - Chatbot   ││
│  │  - Tickets     │                          │  - IA/NLP    ││
│  │  - Cardápio    │                          │  - Analytics ││
│  │  - Usuários    │                          │  - Gemma     ││
│  └────────┬───────┘                          └──────┬───────┘│
│           │                                         │        │
│           ▼                                         ▼        │
│    PostgreSQL DB                                Ollama       │
│    Port 5432                                   Port 11434    │
└──────────────────────────────────────────────────────────────┘
```

## 📦 Microserviços

### 1. SirusBot (Chatbot)
**Branch:** `SirusBot`  
**Porta:** `3001`  
**Repositório:** https://github.com/ALEXSANDER2002/restaurant/tree/SirusBot

**Responsabilidades:**
- Processamento de linguagem natural (NLP)
- Reconhecimento de intenções
- Extração de entidades
- Gerenciamento de conversas
- Analytics de chatbot

**Dependências:**
- Ollama (IA local)
- SirusPag (consulta dados via API)

**Endpoints principais:**
- `POST /api/chatbot/message` - Enviar mensagem
- `GET /api/chatbot/analytics` - Consultar métricas
- `GET /api/health` - Health check

---

### 2. SirusPag (Pagamentos)
**Branch:** `SirusPag`  
**Porta:** `3000`  
**Repositório:** https://github.com/ALEXSANDER2002/restaurant/tree/SirusPag

**Responsabilidades:**
- Gestão de pagamentos (Mercado Pago)
- Gerenciamento de tickets
- Controle de cardápio
- Gestão de usuários
- Validação de QR codes

**Dependências:**
- PostgreSQL (banco de dados)
- Mercado Pago API
- SirusBot (notificações via API - opcional)

**Endpoints principais:**
- `GET /api/cardapio/*` - APIs de cardápio
- `POST /api/tickets/*` - APIs de tickets
- `POST /api/checkout/*` - APIs de pagamento
- `GET /api/health` - Health check

---

### 3. PostgreSQL
**Porta:** `5432`  
**Imagem:** `postgres:16-alpine`

Banco de dados relacional usado pelo SirusPag.

---

### 4. Ollama
**Porta:** `11434`  
**Imagem:** `ollama/ollama:latest`

Servidor de IA local que executa o modelo Gemma usado pelo SirusBot.

---

## 🚀 Executando os Microserviços

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 2. Inicie todos os serviços
docker-compose -f docker-compose.microservices.yml up -d

# 3. Baixe o modelo Gemma no Ollama (primeira vez)
docker exec -it sirus-ollama ollama pull gemma:2b

# 4. Verifique o status
docker-compose -f docker-compose.microservices.yml ps

# 5. Ver logs
docker-compose -f docker-compose.microservices.yml logs -f
```

**Acessar:**
- SirusPag: http://localhost:3000
- SirusBot: http://localhost:3001
- PostgreSQL: localhost:5432
- Ollama: http://localhost:11434

---

### Opção 2: Desenvolvimento Local

#### Terminal 1 - PostgreSQL
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=siruspag_user \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=siruspag \
  -p 5432:5432 \
  postgres:16-alpine
```

#### Terminal 2 - Ollama
```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  ollama/ollama:latest

# Baixar modelo
docker exec -it ollama ollama pull gemma:2b
```

#### Terminal 3 - SirusBot
```bash
git clone -b SirusBot https://github.com/ALEXSANDER2002/restaurant.git sirusbot
cd sirusbot
pnpm install
cp .env.example .env
# Configure o .env
pnpm dev
# Roda na porta 3001
```

#### Terminal 4 - SirusPag
```bash
git clone -b SirusPag https://github.com/ALEXSANDER2002/restaurant.git siruspag
cd siruspag
pnpm install
cp .env.example .env
# Configure o .env
pnpm dev
# Roda na porta 3000
```

---

## 🔐 Autenticação entre Microserviços

Os microserviços se autenticam usando **Bearer Tokens** configurados na variável `MICROSERVICE_AUTH_TOKEN`.

**Configuração:**

Em ambos os `.env` (SirusBot e SirusPag):
```env
MICROSERVICE_AUTH_TOKEN=seu_token_secreto_compartilhado
```

**Exemplo de requisição:**
```http
POST http://localhost:3001/api/chatbot/message
Authorization: Bearer seu_token_secreto_compartilhado
X-Microservice: SirusPag
Content-Type: application/json

{
  "message": "Qual é o cardápio de hoje?",
  "userId": "user-123"
}
```

---

## 🔄 Comunicação entre Microserviços

### SirusPag → SirusBot

```typescript
// services/sirusbot-client.ts
import { sirusBotClient } from '@/services/sirusbot-client';

// Enviar mensagem ao chatbot
const response = await sirusBotClient.sendMessage({
  message: "Qual é o cardápio de hoje?",
  userId: "user-123"
});

// Notificar compra de ticket
await sirusBotClient.notifyTicketPurchase({
  userId: "user-123",
  ticketId: "ticket-456",
  tipo: "almoco",
  valor: 5.00
});
```

### SirusBot → SirusPag

```typescript
// services/siruspag-client.ts
import { sirusPagClient } from '@/services/siruspag-client';

// Consultar cardápio
const cardapio = await sirusPagClient.getCardapioHoje();

// Validar ticket
const ticket = await sirusPagClient.validarTicket("ticket-123");

// Consultar saldo
const saldo = await sirusPagClient.getSaldoUsuario("user-123");
```

---

## 📊 Monitoramento

### Health Checks

Verifique o status de cada serviço:

```bash
# SirusBot
curl http://localhost:3001/api/health

# SirusPag
curl http://localhost:3000/api/health

# Ollama
curl http://localhost:11434/api/tags

# PostgreSQL
docker exec -it sirus-postgres pg_isready -U siruspag_user
```

### Logs

```bash
# Todos os serviços
docker-compose -f docker-compose.microservices.yml logs -f

# Serviço específico
docker-compose -f docker-compose.microservices.yml logs -f sirusbot
docker-compose -f docker-compose.microservices.yml logs -f siruspag
```

---

## 🛠️ Comandos Úteis

### Parar todos os serviços
```bash
docker-compose -f docker-compose.microservices.yml down
```

### Reconstruir serviços
```bash
docker-compose -f docker-compose.microservices.yml up -d --build
```

### Limpar volumes
```bash
docker-compose -f docker-compose.microservices.yml down -v
```

### Executar migrations (SirusPag)
```bash
docker exec -it sirus-pag pnpm drizzle-kit push
```

---

## 📝 Variáveis de Ambiente

### .env Principal (Raiz do projeto)

```env
# Node
NODE_ENV=production

# PostgreSQL
POSTGRES_USER=siruspag_user
POSTGRES_PASSWORD=senha_forte_aqui
POSTGRES_DB=siruspag

# Ollama
OLLAMA_MODEL=gemma:2b

# Autenticação entre microserviços
MICROSERVICE_AUTH_TOKEN=seu_token_secreto_compartilhado

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
MERCADOPAGO_PUBLIC_KEY=sua_public_key

# JWT
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=7d
```

---

## 🔒 Segurança

1. **Token de Autenticação**: Sempre use tokens fortes para `MICROSERVICE_AUTH_TOKEN`
2. **HTTPS**: Em produção, use HTTPS para todas as comunicações
3. **CORS**: Configure corretamente em `ALLOWED_ORIGINS`
4. **Secrets**: Nunca commite arquivos `.env` no git
5. **Rate Limiting**: Implemente rate limiting nos endpoints públicos

---

## 📖 Documentação das APIs

- **SirusBot API**: Ver `SirusBot/API.md`
- **SirusPag API**: Endpoints existentes em `/api/*`

---

## 🎯 Próximos Passos

1. ✅ Microserviços configurados
2. ✅ Comunicação via REST API
3. ✅ Docker Compose configurado
4. ⏳ Implementar API Gateway (opcional)
5. ⏳ Implementar Message Queue (RabbitMQ/Kafka) para eventos assíncronos
6. ⏳ Kubernetes deployment (opcional)
7. ⏳ CI/CD pipeline

---

## 🆘 Troubleshooting

### Problema: SirusBot não consegue se conectar ao Ollama
```bash
# Verificar se Ollama está rodando
docker ps | grep ollama

# Verificar logs
docker logs sirus-ollama

# Reiniciar Ollama
docker restart sirus-ollama
```

### Problema: SirusPag não consegue conectar ao PostgreSQL
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Testar conexão
docker exec -it sirus-postgres psql -U siruspag_user -d siruspag
```

### Problema: Microserviços não se comunicam
```bash
# Verificar network
docker network inspect sirus-network

# Verificar token de autenticação
# Certifique-se que MICROSERVICE_AUTH_TOKEN é o mesmo em ambos
```

---

**Desenvolvido para a UNIFESSPA**

