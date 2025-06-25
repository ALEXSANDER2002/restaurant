# Base image - Node.js oficial com Debian slim
FROM node:18-slim

# Configurar timezone
ENV TZ=America/Sao_Paulo
ENV DEBIAN_FRONTEND=noninteractive

# Instalar apenas o essencial - postgresql-client
RUN apt-get update || true && \
    apt-get install -y postgresql-client curl bash || true && \
    apt-get clean || true && \
    rm -rf /var/lib/apt/lists/* || true

# Criar usuário não-root para segurança
RUN groupadd -g 1001 nodejs || true && \
    useradd -r -u 1001 -g nodejs nextjs || true

# Configurar diretório de trabalho
WORKDIR /app

# Instalar pnpm globalmente (node:18 já tem corepack)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar dependências com timeout maior
RUN pnpm config set network-timeout 300000 && \
    pnpm install --frozen-lockfile || \
    (sleep 10 && pnpm install --frozen-lockfile)

# Copiar código fonte
COPY . .

# Gerar Drizzle
RUN pnpm db:gen || echo "Warning: db:gen failed, but continuing..."

# Build da aplicação
RUN pnpm run build

# Copiar e dar permissão ao script de entrada
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Criar diretório uploads
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app

# Mudar propriedade dos arquivos
RUN chown -R nextjs:nodejs /app

# Mudar para usuário não-root
USER nextjs

# Exposição da porta
EXPOSE 3000

# Comando de inicialização
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pnpm", "start"] 