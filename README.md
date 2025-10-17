# 🍽️ Sistema de Restaurante Universitário

Sistema de gerenciamento de tickets e cardápio para o Restaurante Universitário da UNIFESSPA.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **PostgreSQL** - Banco de dados
- **Mercado Pago** - Pagamentos
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

## 📝 Licença

MIT

---

**Desenvolvido para a UNIFESSPA**
