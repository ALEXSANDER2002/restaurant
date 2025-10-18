# SirusBot - Documentação da API REST

## 🔗 Visão Geral

O SirusBot é um microserviço independente que fornece funcionalidades de chatbot com IA. Ele pode ser consumido por outros serviços através de uma API REST.

**URL Base (Desenvolvimento):** `http://localhost:3001/api`  
**URL Base (Produção):** `https://sirusbot.unifesspa.edu.br/api`

## 🔐 Autenticação

Todas as requisições devem incluir um token de autenticação no header:

```http
Authorization: Bearer SEU_TOKEN_AQUI
X-Microservice: NomeDoSeuServico
```

Configure o token no arquivo `.env`:
```env
MICROSERVICE_AUTH_TOKEN=seu_token_secreto_aqui
```

---

## 📡 Endpoints

### 1. Health Check

Verifica se o serviço está online e funcionando.

**Endpoint:** `GET /health`

**Headers:** Nenhum header obrigatório para este endpoint

**Resposta de Sucesso (200):**
```json
{
  "service": "SirusBot",
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-18T10:30:00.000Z",
  "uptime": 12345.67,
  "dependencies": {
    "ollama": "healthy",
    "sirusPag": "connected"
  },
  "environment": "production"
}
```

---

### 2. Enviar Mensagem ao Chatbot

Envia uma mensagem ao chatbot e recebe uma resposta processada pela IA.

**Endpoint:** `POST /chatbot/message`

**Headers:**
```http
Authorization: Bearer seu_token_aqui
X-Microservice: SirusPag
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Qual é o cardápio de hoje?",
  "userId": "user-123",
  "context": {
    "previousIntent": "greeting",
    "sessionId": "session-abc"
  }
}
```

**Parâmetros:**
- `message` (string, obrigatório): A mensagem do usuário
- `userId` (string, opcional): ID do usuário para tracking
- `context` (object, opcional): Contexto adicional da conversa

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "response": "O cardápio de hoje inclui arroz, feijão, frango grelhado...",
    "intent": "cardapio_consulta",
    "entities": {
      "data": "hoje",
      "tipo_refeicao": "almoco"
    },
    "confidence": 0.95,
    "timestamp": "2025-01-18T10:30:00.000Z"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "success": false,
  "error": "Unauthorized: Invalid microservice authentication"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "Campo 'message' é obrigatório e deve ser uma string"
}
```

---

### 3. Informações do Chatbot

Obtém informações sobre o chatbot e suas capacidades.

**Endpoint:** `GET /chatbot/message`

**Headers:**
```http
Authorization: Bearer seu_token_aqui
X-Microservice: SirusPag
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "service": "SirusBot",
    "version": "1.0.0",
    "status": "online",
    "model": "gemma:2b",
    "capabilities": [
      "natural_language_processing",
      "intent_recognition",
      "entity_extraction",
      "context_management",
      "conversation_analytics"
    ]
  }
}
```

---

### 4. Analytics do Chatbot

Consulta métricas e analytics das conversas.

**Endpoint:** `GET /chatbot/analytics?period=7d&userId=user-123`

**Headers:**
```http
Authorization: Bearer seu_token_aqui
X-Microservice: SirusPag
```

**Query Parameters:**
- `period` (string, opcional): Período de análise (7d, 30d, 90d). Padrão: 7d
- `userId` (string, opcional): Filtrar por usuário específico

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "totalConversations": 150,
    "totalMessages": 450,
    "averageMessagesPerConversation": 3.0,
    "topIntents": [
      { "intent": "cardapio_consulta", "count": 45 },
      { "intent": "ticket_status", "count": 30 },
      { "intent": "saldo_consulta", "count": 25 }
    ],
    "satisfactionRate": 0.87,
    "period": "7d"
  }
}
```

---

### 5. Registrar Evento de Analytics

Registra um evento customizado de analytics.

**Endpoint:** `POST /chatbot/analytics`

**Headers:**
```http
Authorization: Bearer seu_token_aqui
X-Microservice: SirusPag
Content-Type: application/json
```

**Body:**
```json
{
  "event": "ticket_purchased",
  "userId": "user-123",
  "metadata": {
    "ticketType": "almoco",
    "value": 5.00,
    "source": "chatbot"
  }
}
```

**Parâmetros:**
- `event` (string, obrigatório): Nome do evento
- `userId` (string, opcional): ID do usuário
- `metadata` (object, opcional): Dados adicionais do evento

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Evento registrado com sucesso"
}
```

---

## 🔄 Integração com SirusPag

O SirusBot se conecta ao SirusPag para obter informações em tempo real.

### Configuração

No arquivo `.env` do SirusBot:

```env
# URL do serviço SirusPag
SIRUSPAG_API_URL=http://localhost:3000/api

# Token para autenticação
MICROSERVICE_AUTH_TOKEN=seu_token_secreto
```

### Exemplo de Uso (Node.js)

```typescript
import { sirusPagClient } from '@/services/siruspag-client';

// Consultar cardápio
const cardapio = await sirusPagClient.getCardapioHoje();

// Validar ticket
const ticket = await sirusPagClient.validarTicket('ticket-123');

// Consultar saldo
const saldo = await sirusPagClient.getSaldoUsuario('user-123');

// Health check
const isOnline = await sirusPagClient.healthCheck();
```

---

## 🐳 Docker

### Build da Imagem

```bash
docker build -t sirusbot:latest .
```

### Executar Container

```bash
docker run -d \
  --name sirusbot \
  -p 3001:3001 \
  -e OLLAMA_HOST=http://ollama:11434 \
  -e SIRUSPAG_API_URL=http://siruspag:3000/api \
  -e MICROSERVICE_AUTH_TOKEN=seu_token \
  sirusbot:latest
```

---

## 📊 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - Token inválido |
| 500 | Internal Server Error - Erro no servidor |
| 503 | Service Unavailable - Serviço offline |

---

## 🔍 Exemplos de Intents Reconhecidas

- `cardapio_consulta` - Consulta sobre o cardápio
- `ticket_status` - Status de tickets
- `saldo_consulta` - Consulta de saldo
- `horario_funcionamento` - Horários de funcionamento
- `localizacao` - Localização do restaurante
- `ajuda` - Pedido de ajuda
- `saudacao` - Saudação inicial
- `despedida` - Despedida

---

## 📝 Notas

1. **Rate Limiting**: Atualmente não há limite de requisições, mas isso pode ser implementado futuramente.
2. **Timeout**: Requisições têm timeout de 30 segundos.
3. **CORS**: Configure os origins permitidos na variável `ALLOWED_ORIGINS`.

---

## 🆘 Suporte

Para dúvidas ou problemas, contate a equipe de desenvolvimento:
- Email: dev@unifesspa.edu.br
- GitHub: https://github.com/ALEXSANDER2002/restaurant/tree/SirusBot

