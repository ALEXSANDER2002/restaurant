# Base image - Ubuntu para melhor compatibilidade
FROM ubuntu:20.04

# Configurar timezone para evitar prompt interativo
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# Instalar Node.js 18 e dependências
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    postgresql-client \
    ca-certificates \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN groupadd -g 1001 nodejs \
    && useradd -r -u 1001 -g nodejs nextjs

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

# Gerar Drizzle
RUN pnpm db:gen

# Build da aplicação
RUN pnpm run build

# Copiar e dar permissão ao script de entrada
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Mudar para usuário não-root
USER nextjs

# Exposição da porta
EXPOSE 3000

# Comando de inicialização
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pnpm", "start"] 