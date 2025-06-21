# Dockerfile simples - apenas funcional
FROM node:18

# Diretório de trabalho
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar todas as dependências
RUN pnpm install

# Copiar todo o código
COPY . .

# Gerar cliente Drizzle
RUN pnpm db:gen

# Build da aplicação Next.js
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "start"] 