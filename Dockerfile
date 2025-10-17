FROM node:20-alpine

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala dependências
RUN pnpm install

# Copia o código
COPY . .

# Build da aplicação
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
