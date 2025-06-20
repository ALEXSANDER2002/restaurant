# 🍽️ Sistema de Restaurante Universitário UNIFESSPA

Sistema completo de gerenciamento de tickets e cardápio para o Restaurante Universitário da UNIFESSPA, desenvolvido com Next.js, React e tecnologias modernas.

## ✨ Funcionalidades Principais

### 🎯 Para Usuários
- **Compra de Tickets**: Integração completa com Mercado Pago
- **Cardápio Semanal**: Visualização do menu da semana com opções vegetarianas
- **QR Code**: Geração de códigos QR para validação na entrada
- **Chatbot Inteligente**: Assistente com IA (Google Gemini) para dúvidas
- **Multilíngua**: Suporte a português, inglês e espanhol
- **Acessibilidade**: VLibras e funcionalidades de alta acessibilidade

### 🔧 Para Administradores
- **Dashboard Completo**: Estatísticas e métricas em tempo real
- **Gestão de Cardápio**: CRUD completo para cardápio semanal
- **Gerenciamento de Pedidos**: Validação e controle de tickets
- **Gestão de Usuários**: Administração de perfis e permissões
- **Validação de Tickets**: Sistema de QR Code para entrada no RU

### 🤖 Chatbot com IA
- **Google Gemini AI**: Respostas inteligentes sobre o RU
- **Contexto UNIFESSPA**: Informações específicas sobre preços, horários e campus
- **Fallback Inteligente**: Sistema de respostas alternativas
- **Histórico de Conversa**: Mantém contexto durante a sessão

## 🚀 Tecnologias Utilizadas

### Frontend & Framework
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de interface de usuário
- **TypeScript** - Linguagem tipada
- **Tailwind CSS** - Framework de CSS utilitário

### Backend & Banco de Dados
- **Drizzle ORM** - ORM TypeScript-first
- **PostgreSQL** - Banco de dados relacional
- **Next.js API Routes** - APIs serverless

### Integrações
- **Mercado Pago API** - Processamento de pagamentos
- **Google Gemini AI** - Chatbot inteligente
- **QR Code Generator** - Geração de códigos QR

### UI/UX & Acessibilidade
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações fluidas
- **VLibras** - Tradução para LIBRAS
- **shadcn/ui** - Sistema de design moderno

### Validação & Formulários
- **Zod** - Validação de esquemas TypeScript
- **React Hook Form** - Gerenciamento de formulários

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **pnpm** (gerenciador de pacotes)
- **PostgreSQL** (banco de dados local ou remoto)
- **Conta Mercado Pago** (para processamento de pagamentos)
- **Google AI API Key** (para o chatbot com Gemini)

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/ALEXSANDER2002/restaurant.git
cd restaurant
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Configure o banco de dados:**
```bash
# Execute as migrações do Drizzle
pnpm drizzle-kit push
```

4. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto:
```env
# Banco de Dados
DATABASE_URL=postgres://usuario:senha@localhost:5433/restaurante

# Mercado Pago (Produção)
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
MERCADO_PAGO_PUBLIC_KEY=sua_public_key
MERCADO_PAGO_CLIENT_ID=seu_client_id
MERCADO_PAGO_CLIENT_SECRET=seu_client_secret
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret

# URL da Aplicação
APP_URL=http://localhost:3000

# Autenticação
NEXTAUTH_SECRET=sua_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=sua_api_key_do_gemini
```

5. **Popule o banco com dados iniciais:**
```bash
# Criar cardápio da semana via API
curl -X POST http://localhost:3000/api/seed-cardapio
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
pnpm dev
```
O projeto estará disponível em `http://localhost:3000`

### Produção
```bash
pnpm build
pnpm start
```

## 🎯 Principais Rotas

### Páginas Públicas
- `/` - Página inicial com cardápio da semana
- `/cadastro` - Registro de novos usuários
- `/entrar` - Login de usuários
- `/faq` - Perguntas frequentes
- `/demo-chatbot` - Demonstração do chatbot

### Área Administrativa (`/admin`)
- `/admin` - Dashboard principal
- `/admin/cardapio` - Gestão do cardápio semanal
- `/admin/pedidos` - Gerenciamento de pedidos
- `/admin/usuarios` - Administração de usuários
- `/admin/validar-tickets` - Validação de QR codes

### APIs Principais
- `/api/cardapio` - API pública do cardápio
- `/api/admin/cardapio` - CRUD do cardápio (admin)
- `/api/tickets` - Gestão de tickets
- `/api/chat` - Chatbot com IA
- `/api/checkout` - Processamento de pagamentos

## 📦 Scripts Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Cria a versão de produção
- `pnpm start` - Inicia o servidor de produção
- `pnpm lint` - Executa o linter para verificar erros
- `pnpm type-check` - Verificação de tipos TypeScript
- `drizzle-kit push` - Aplica migrações do banco
- `drizzle-kit studio` - Interface visual do banco

## 🏗️ Estrutura do Projeto

```
restaurant/
├── app/                    # App Router do Next.js
│   ├── admin/             # Páginas administrativas
│   ├── api/               # Routes de API
│   ├── (auth)/            # Páginas de autenticação
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── chat-bot.tsx      # Chatbot com IA
│   ├── cardapio-semana.tsx # Exibição do cardápio
│   └── gerenciar-cardapio.tsx # Admin do cardápio
├── contexts/             # Contextos React
├── hooks/                # Hooks personalizados
├── lib/                  # Utilitários e configurações
│   ├── drizzle/         # Schema e ORM
│   ├── auth.ts          # Configuração de autenticação
│   └── utils.ts         # Funções utilitárias
├── services/             # Serviços e integrações
│   ├── mercado-pago-client.ts # Cliente Mercado Pago
│   ├── gemini-chat-service.ts # Serviço de IA
│   └── ticket-service.ts      # Gestão de tickets
├── migrations/           # Migrações do banco de dados
├── public/              # Arquivos estáticos
├── scripts/             # Scripts utilitários
├── styles/              # Estilos globais
└── types/               # Definições de tipos
```

## 🔧 Configurações Importantes

### Banco de Dados
O projeto utiliza PostgreSQL com Drizzle ORM. As tabelas principais:
- `perfis` - Usuários do sistema
- `tickets` - Tickets de refeição
- `cardapio` - Cardápio semanal

### Pagamentos
Integração completa com Mercado Pago:
- Checkout transparente
- Webhooks para confirmação
- Suporte a PIX, cartão e outras formas

### Chatbot IA
- Utiliza Google Gemini AI
- Contexto específico da UNIFESSPA
- Fallback para respostas pré-definidas

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conecte seu repositório GitHub à Vercel
# Configure as variáveis de ambiente
# Deploy automático a cada push
```

### Docker 🐳

#### Desenvolvimento
```bash
# Build e start com docker-compose
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

#### Produção
```bash
# Build e start com configuração de produção
docker-compose -f docker-compose.prod.yml up -d --build

# Deploy automatizado
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Para instruções completas de deploy na VPS, veja [DOCKER_DEPLOY.md](DOCKER_DEPLOY.md).

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/NovaFuncionalidade`)
5. **Abra** um Pull Request

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/ALEXSANDER2002/restaurant/issues)
- **Email**: suporte@unifesspa.edu.br
- **Documentação**: Veja os arquivos `.md` na pasta do projeto

## 🏛️ Instituição

Desenvolvido para a **Universidade Federal do Sul e Sudeste do Pará (UNIFESSPA)**
- Campus Marabá, Santana do Araguaia, Rondon do Pará e Xinguara
- Programa de Assistência Estudantil (PRAE)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Feito com ❤️ para a comunidade acadêmica da UNIFESSPA** 