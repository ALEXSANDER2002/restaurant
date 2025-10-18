# 🤖 SirusBot - Assistente Virtual Inteligente

Chatbot inteligente com IA para atendimento e suporte ao Restaurante Universitário da UNIFESSPA.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **Ollama/Gemma** - Modelo de IA local
- **Tailwind CSS** - Estilização

## 📦 Funcionalidades

- 🧠 Motor de conversação com IA (Gemma)
- 💬 Interface de chat moderna
- 📊 Analytics e métricas de conversas
- 🎯 Reconhecimento de intenções
- 🔄 Gerenciamento de contexto (MCP)

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- Ollama

## ⚙️ Instalação

```bash
# Clone o repositório
git clone -b SirusBot https://github.com/ALEXSANDER2002/restaurant.git sirusbot
cd sirusbot

# Instale as dependências
pnpm install

# Configure o Ollama
pnpm setup:ollama

# Inicie o servidor
pnpm dev
```

Acesse: `http://localhost:3000`

## 🔧 Configuração do Ollama

```bash
# Instalar Ollama
# Windows: https://ollama.com/download
# Linux/Mac: curl -fsSL https://ollama.com/install.sh | sh

# Baixar o modelo Gemma
ollama pull gemma:2b

# Verificar instalação
ollama list
```

## 📁 Estrutura Principal

```
├── app/
│   ├── api/chat/          # API de conversação
│   └── demo-chatbot/      # Demo do chatbot
├── components/
│   ├── chat-bot.tsx       # Componente principal
│   └── chat-analytics-dashboard.tsx
├── services/
│   ├── gemma-chat-service.ts
│   ├── chat-analytics-service.ts
│   └── mcp/               # Model Context Protocol
└── hooks/
    └── use-chatbot.ts
```

## 📝 Licença

MIT

---

**Desenvolvido para a UNIFESSPA**
