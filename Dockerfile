# Dockerfile para Restaurant System - Produção
FROM node:18-alpine3.18

# Atualizar repositórios e instalar dependências
RUN apk update && apk add --no-cache \
    libc6-compat \
    postgresql-client \
    curl \
    bash

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente Drizzle (importante para as migrações)
RUN pnpm db:gen

# Build da aplicação
RUN pnpm run build

# Copiar e dar permissão ao script de entrada
COPY scripts/docker-start.sh /usr/local/bin/docker-start.sh
RUN chmod +x /usr/local/bin/docker-start.sh

# Criar diretório para uploads e dar permissões
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nextjs:nodejs /app /usr/local/bin/docker-start.sh
USER nextjs

# Expor porta da aplicação
EXPOSE 3000

# Usar script de entrada personalizado
CMD ["/usr/local/bin/docker-start.sh"] 