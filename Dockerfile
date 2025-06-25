# Etapa 1: Build da aplicação
FROM node:20-alpine AS builder
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala as dependências
RUN pnpm store prune && pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Gera o cliente Drizzle
RUN pnpm db:gen

# Build da aplicação Next.js
RUN pnpm build

# Etapa 2: Runner para produção
FROM node:20-alpine AS runner
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia apenas os arquivos necessários para rodar a aplicação
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/components ./components
COPY --from=builder /app/contexts ./contexts
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/services ./services
COPY --from=builder /app/types ./types
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/uploads ./uploads

# Instala apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["pnpm", "start"] 