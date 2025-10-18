# 🤖 SirusBot - Assistente Virtual Inteligente

Chatbot inteligente com IA para atendimento e suporte ao Restaurante Universitário da UNIFESSPA.

> **Nota**: Esta é a branch **SirusBot** que contém apenas o módulo do chatbot. Para o sistema completo, veja a branch `main`.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **Ollama/Gemma** - Modelo de IA local
- **MCP (Model Context Protocol)** - Orquestração de conversas
- **Tailwind CSS** - Estilização

## 📦 Funcionalidades

### 🧠 Inteligência Artificial
- **Gemma Chat Service** - Motor de conversação com IA
- **MCP Orchestrator** - Gerenciamento de contexto e diálogos
- **Dialog Manager** - Gerenciamento de conversas
- **Entity Extraction** - Extração de entidades das mensagens
- **Intent Recognition** - Reconhecimento de intenções do usuário

### 📊 Analytics
- **Chat Analytics** - Análise de conversas e métricas
- **Dashboard de Analytics** - Visualização de dados do chatbot

### 💬 Interface
- **Chat Bot Component** - Interface de chat moderna
- **Demo Chat** - Página de demonstração do chatbot

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- Ollama (para execução local do modelo Gemma)

## ⚙️ Instalação

```bash
# Clone o repositório na branch SirusBot
git clone -b SirusBot https://github.com/ALEXSANDER2002/restaurant.git sirusbot
cd sirusbot

# Instale as dependências
pnpm install

# Configure o Ollama (necessário para o chatbot)
./scripts/setup-ollama.js

# Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse: `http://localhost:3000`

## 🔧 Configuração do Ollama

O SirusBot usa o Ollama para executar o modelo Gemma localmente:

```bash
# Instalar Ollama (Linux/Mac)
curl -fsSL https://ollama.com/install.sh | sh

# Instalar Ollama (Windows)
# Baixe de: https://ollama.com/download

# Baixar o modelo Gemma
ollama pull gemma:2b

# Verificar instalação
ollama list
```

## 🌐 Estrutura do Projeto

```
sirusbot/
├── app/
│   ├── api/chat/          # API de conversação
│   ├── demo-chatbot/      # Página de demonstração
│   └── page.tsx           # Página principal
├── components/
│   ├── chat-bot.tsx       # Componente principal do chat
│   ├── chat-analytics-dashboard.tsx
│   └── demo-chat-unifesspa.tsx
├── services/
│   ├── gemma-chat-service.ts
│   ├── chat-analytics-service.ts
│   └── mcp/               # Model Context Protocol
│       ├── dialog-manager.service.ts
│       ├── entity-extraction.service.ts
│       ├── intent-recognition.service.ts
│       └── mcp-orchestrator.service.ts
├── hooks/
│   ├── use-chatbot.ts
│   └── use-chat-analytics.ts
└── types/
    └── mcp.types.ts
```

## 🎯 Uso

### Integração do Chatbot

```tsx
import { ChatBot } from '@/components/chat-bot'

export default function MyPage() {
  return (
    <div>
      <ChatBot />
    </div>
  )
}
```

### Uso do Hook

```tsx
import { useChatbot } from '@/hooks/use-chatbot'

export default function MyComponent() {
  const { messages, sendMessage, isLoading } = useChatbot()
  
  return (
    // Sua implementação
  )
}
```

## 📊 Analytics

O SirusBot inclui sistema de analytics para monitorar:
- Total de conversas
- Mensagens por dia
- Taxa de satisfação
- Intents mais comuns
- Tempo médio de resposta

Acesse o dashboard em: `/demo-chatbot`

## 🔗 Outras Branches

- **main** - Sistema completo (Chatbot + Pagamentos)
- **SirusPag** - Módulo de pagamentos e gestão do restaurante

## 🤝 Contribuindo

```bash
# Criar feature branch
git checkout -b feature/nova-funcionalidade

# Fazer commit
git commit -m "feat(chatbot): adicionar nova funcionalidade"

# Push
git push origin feature/nova-funcionalidade
```

## 📝 Convenção de Commits

- `feat(chatbot):` - Nova funcionalidade
- `fix(chatbot):` - Correção de bug
- `refactor(chatbot):` - Refatoração
- `docs:` - Documentação
- `test:` - Testes

## 📝 Licença

MIT

---

**Desenvolvido para a UNIFESSPA**
