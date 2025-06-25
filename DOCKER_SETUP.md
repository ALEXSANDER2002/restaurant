# 🐳 Configuração Docker - Restaurant System

Este guia explica como executar a aplicação completa usando Docker com **PostgreSQL**, **Nginx** e **migrações automáticas**.

## 🎯 O que você consegue com esta configuração

- ✅ **PostgreSQL** rodando em container com persistência de dados
- ✅ **Nginx** como proxy reverso na porta 80
- ✅ **Migrações automáticas** do Drizzle executadas na inicialização
- ✅ **Seed automático** se o banco estiver vazio
- ✅ **Health checks** para garantir que tudo está funcionando
- ✅ **Rede isolada** para comunicação entre containers
- ✅ **Volumes persistentes** para dados e uploads

## 🚀 Execução Rápida

```bash
# Clonar e entrar no diretório
git clone <seu-repo>
cd restaurant

# Executar tudo com um comando
docker-compose up -d

# Ou usar o helper script
./scripts/docker-helper.sh start
```

**Pronto!** A aplicação estará disponível em: http://localhost

## 📁 Estrutura dos Serviços

### 1. PostgreSQL (`postgres`)
- **Porta**: 5432
- **Database**: restaurant
- **Usuário**: postgres
- **Senha**: postgres123
- **Volume**: `postgres_data` (dados persistentes)

### 2. Aplicação Next.js (`app`)
- **Porta interna**: 3000
- **Migrações**: Executadas automaticamente na inicialização
- **Dependências**: Aguarda PostgreSQL estar saudável
- **Volume**: `./uploads` montado para persistir uploads

### 3. Nginx (`nginx`)
- **Porta HTTP**: 80
- **Porta HTTPS**: 443 (opcional, desabilitada por padrão)
- **Proxy**: Encaminha requisições para a aplicação
- **Configuração**: `nginx.conf`

## 🛠️ Scripts Helper

Use o script helper para operações comuns:

```bash
# Ver todos os comandos disponíveis
./scripts/docker-helper.sh help

# Build completo
./scripts/docker-helper.sh build

# Iniciar serviços
./scripts/docker-helper.sh start

# Ver logs em tempo real
./scripts/docker-helper.sh logs

# Ver status dos serviços
./scripts/docker-helper.sh status

# Parar serviços
./scripts/docker-helper.sh stop

# Limpar tudo (containers, volumes, imagens)
./scripts/docker-helper.sh clean

# Executar migrações manualmente
./scripts/docker-helper.sh migrate

# Conectar ao banco
./scripts/docker-helper.sh db

# Backup do banco
./scripts/docker-helper.sh backup

# Restaurar backup
./scripts/docker-helper.sh restore backup_20240101_120000.sql
```

## 🔧 Configuração Manual

### 1. Preparar ambiente

```bash
# Instalar Docker e Docker Compose
# https://docs.docker.com/get-docker/

# Verificar se estão instalados
docker --version
docker-compose --version
```

### 2. Configurar variáveis de ambiente

As variáveis estão configuradas diretamente no `docker-compose.yml`. Para produção, considere usar arquivo `.env`:

```bash
# Copiar exemplo
cp .env.example .env

# Editar as variáveis necessárias
nano .env
```

### 3. Build e execução

```bash
# Build das imagens
docker-compose build

# Iniciar em modo detached
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar status
docker-compose ps
```

## 🔍 Troubleshooting

### Problema: Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Verificar health check
docker inspect restaurant_postgres | grep Health -A 10
```

### Problema: Migrações falhando

```bash
# Executar migrações manualmente
docker-compose exec app pnpm drizzle-kit push

# Ver logs da aplicação
docker-compose logs app

# Reiniciar apenas a aplicação
docker-compose restart app
```

### Problema: Nginx não está funcionando

```bash
# Verificar configuração do Nginx
docker-compose exec nginx nginx -t

# Ver logs do Nginx
docker-compose logs nginx

# Verificar se a aplicação está respondendo
docker-compose exec nginx curl -f http://app:3000/api/session
```

### Problema: Porta já está em uso

```bash
# Verificar o que está usando a porta 80
netstat -tulpn | grep :80

# Ou usar uma porta diferente editando o docker-compose.yml
# Mudar "80:80" para "8080:80" na seção do nginx
```

## 🗂️ Estrutura de Arquivos Docker

```
restaurant/
├── docker-compose.yml           # Configuração principal
├── Dockerfile                   # Build da aplicação
├── nginx.conf                   # Configuração do Nginx
├── .dockerignore               # Arquivos ignorados no build
├── init-db.sql                 # Script de inicialização do banco
└── scripts/
    ├── docker-entrypoint.sh    # Script de entrada da aplicação
    └── docker-helper.sh         # Script helper para operações
```

## 🔒 Segurança e Produção

### Para ambiente de produção:

1. **Alterar senhas padrão**:
   ```yaml
   environment:
     POSTGRES_PASSWORD: senha_super_segura
     NEXTAUTH_SECRET: chave_secreta_super_longa
   ```

2. **Habilitar HTTPS**:
   - Descomente a seção HTTPS no `nginx.conf`
   - Configure certificados SSL
   - Monte o volume SSL no docker-compose

3. **Usar arquivo .env**:
   ```bash
   # No docker-compose.yml, referencie variáveis
   environment:
     - DATABASE_URL=${DATABASE_URL}
     - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
   ```

4. **Configurar firewall**:
   ```bash
   # Permitir apenas portas necessárias
   ufw allow 80
   ufw allow 443
   ```

## 📊 Monitoramento

### Ver recursos utilizados:
```bash
# CPU e Memória em tempo real
docker stats

# Espaço em disco dos volumes
docker system df

# Logs de um serviço específico
docker-compose logs -f postgres
```

### Health checks automáticos:
Todos os serviços têm health checks configurados:
- **PostgreSQL**: `pg_isready`
- **Aplicação**: Teste na rota `/api/session`
- **Nginx**: Verificação de configuração

## 🎯 Comandos Úteis

```bash
# Reconstruir apenas um serviço
docker-compose build app

# Executar comando dentro do container
docker-compose exec app pnpm db:studio

# Copiar arquivo para/do container
docker cp arquivo.txt restaurant_app:/app/

# Ver todos os containers (incluindo parados)
docker ps -a

# Limpar containers órfãos
docker-compose down --remove-orphans

# Ver logs de inicialização
docker-compose up
```

## 💡 Dicas

1. **Desenvolvimento**: Use `docker-compose logs -f` para ver logs em tempo real
2. **Primeira execução**: Pode levar alguns minutos para baixar as imagens
3. **Dados persistentes**: Os dados do PostgreSQL ficam no volume `postgres_data`
4. **Hot reload**: O código da aplicação não é montado como volume por padrão para melhor performance
5. **Backup regular**: Use `./scripts/docker-helper.sh backup` regularmente

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Verifique o status: `docker-compose ps`
3. Tente rebuild: `docker-compose build --no-cache`
4. Limpe tudo: `./scripts/docker-helper.sh clean`

---

✨ **Sucesso!** Sua aplicação Restaurant System está rodando com Docker! 