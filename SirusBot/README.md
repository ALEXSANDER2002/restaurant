# 🍽️ Sistema SIRUS - Restaurante Universitário

Sistema integrado de gerenciamento de tickets, cardápio e assistente virtual para o Restaurante Universitário da UNIFESSPA.

> **Arquitetura:** Este projeto está organizado em **microserviços independentes** localizados em pastas separadas.

## 📁 Estrutura do Projeto

```
restaurant/
├── SirusBot/          # Microserviço de Chatbot (Port 3001)
├── SirusPay/          # Microserviço de Pagamentos (Port 3000)
├── docker-compose.yml # Orquestração dos microserviços
└── README.md          # Este arquivo
```

## 🏗️ Arquitetura de Microserviços

```
┌────────────────┐         API REST         ┌──────────────┐
│                │ ◄──────────────────────► │              │
│   SirusPay     │                          │  SirusBot    │
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

### 🤖 SirusBot
**Pasta:** `SirusBot/` | **Porta:** `3001`

Microserviço de chatbot com IA:
- Assistente virtual inteligente
- Processamento de linguagem natural
- Analytics de conversas
- Integração com Gemma/Ollama

[Ver documentação →](./SirusBot/README.md)

---

### 💳 SirusPay
**Pasta:** `SirusPay/` | **Porta:** `3000`

Microserviço de pagamentos e gestão:
- Sistema de pagamentos (Mercado Pago)
- Gerenciamento de tickets
- Controle de cardápio
- Gestão de usuários

[Ver documentação →](./SirusPay/README.md)

---

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
docker-compose up -d

# 4. Baixe o modelo Gemma (primeira vez)
docker exec -it sirus-ollama ollama pull gemma:2b

# 5. Acesse os serviços
# SirusPay: http://localhost:3000
# SirusBot: http://localhost:3001
```

---

## 💻 Desenvolvimento Local

### SirusBot

```bash
cd SirusBot
pnpm install
cp .env.example .env
# Configure o .env
pnpm dev
# Roda na porta 3001
```

### SirusPay

```bash
cd SirusPay
pnpm install
cp .env.example .env
# Configure o .env
pnpm dev
# Roda na porta 3000
```

---

## 🐳 Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Reconstruir
docker-compose up -d --build
```

---

## 🔐 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
# PostgreSQL
POSTGRES_USER=siruspay_user
POSTGRES_PASSWORD=senha_forte_aqui
POSTGRES_DB=siruspay

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

## 📊 Comunicação entre Microserviços

### SirusPay → SirusBot

```typescript
// Enviar mensagem ao chatbot
const response = await fetch('http://localhost:3001/api/chatbot/message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "Qual é o cardápio de hoje?",
    userId: "user-123"
  })
});
```

### SirusBot → SirusPay

```typescript
// Consultar cardápio
const response = await fetch('http://localhost:3000/api/cardapio/hoje', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer seu_token'
  }
});
```

---

## 📖 Documentação

- [Arquitetura de Microserviços](./MICROSERVICES.md)
- [Documentação do SirusBot](./SirusBot/README.md)
- [API do SirusBot](./SirusBot/API.md)
- [Documentação do SirusPay](./SirusPay/README.md)

---

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **PostgreSQL** - Banco de dados
- **Mercado Pago** - Pagamentos
- **Ollama/Gemma** - Chatbot IA
- **Docker** - Containerização
- **Tailwind CSS** - Estilização

---

## 📝 Branches do GitHub

Este repositório possui branches separadas para cada microserviço:

- **main** - Branch principal com estrutura de pastas
- **SirusBot** - Branch isolada do chatbot
- **SirusPay** - Branch isolada de pagamentos

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

MIT

---

**Desenvolvido para a UNIFESSPA**
