# Dockerfile para Restaurant System - Produção
FROM node:18-alpine3.18

# Instalar dependências do sistema necessárias
RUN apk add --no-cache curl bash netcat-openbsd

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Diretório de trabalho
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependências em modo de produção
RUN pnpm install --frozen-lockfile --prod=false

# Copiar código fonte
COPY . .

# Gerar cliente Drizzle (importante para as migrações)
RUN pnpm db:gen

# Build da aplicação Next.js
RUN pnpm build

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