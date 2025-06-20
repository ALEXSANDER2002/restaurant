# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS base

# Instalar dependências necessárias apenas se não estiverem presentes
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Stage para instalar dependências
FROM base AS deps
# Instalar apenas as dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Stage para instalar todas as dependências e fazer build
FROM base AS builder
# Instalar todas as dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente do Drizzle
RUN pnpm db:gen

# Fazer build da aplicação
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Stage de produção
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários para produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations

# Copiar scripts de inicialização
COPY --from=builder /app/scripts ./scripts

# Instalar pnpm no container de produção
RUN npm install -g pnpm

# Definir permissões
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"] 