# 🐳 Guia de Deploy Docker - Restaurant UNIFESSPA

Este guia detalha como dockerizar e fazer deploy da aplicação na VPS da Hostinger usando Docker e Docker Compose.

## 📋 Pré-requisitos na VPS

### 1. Instalar Docker na VPS Hostinger

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Configurar Firewall

```bash
# Permitir portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 🚀 Deploy Passo a Passo

### 1. Clonar o Repositório na VPS

```bash
# Conectar via SSH à VPS
ssh seu_usuario@ip_da_vps

# Clonar repositório
git clone https://github.com/ALEXSANDER2002/restaurant.git
cd restaurant
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

Configure as seguintes variáveis essenciais:

```env
# Banco de dados
DATABASE_URL=postgresql://postgres:sua_senha_segura@postgres:5432/restaurant

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_producao
MERCADO_PAGO_PUBLIC_KEY=sua_public_key_producao
MERCADO_PAGO_CLIENT_ID=seu_client_id
MERCADO_PAGO_CLIENT_SECRET=seu_client_secret
MERCADO_PAGO_WEBHOOK_SECRET=sua_webhook_secret

# Domínio
DOMAIN=seu-dominio.com
APP_URL=https://seu-dominio.com
NEXTAUTH_URL=https://seu-dominio.com

# Senha segura do PostgreSQL
POSTGRES_PASSWORD=uma_senha_muito_segura_aqui

# Autenticação (gere uma chave forte)
NEXTAUTH_SECRET=sua_chave_secreta_muito_forte_de_32_chars

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=sua_api_key_do_gemini
```

### 3. Executar Deploy

```bash
# Dar permissão ao script
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh
```

**OU execute manualmente:**

```bash
# Build e start dos containers
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Configurar SSL/HTTPS (Recomendado)

#### Usando Let's Encrypt (Certbot)

```bash
# Instalar certbot
sudo apt install certbot

# Gerar certificados
sudo certbot certonly --standalone -d seu-dominio.com

# Copiar certificados para pasta do projeto
sudo mkdir -p ~/restaurant/ssl
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ~/restaurant/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ~/restaurant/ssl/key.pem
sudo chown $USER:$USER ~/restaurant/ssl/*
```

#### Configurar Nginx para SSL

```bash
# Editar configuração do Nginx
nano nginx.conf
```

Descomente e configure as linhas SSL:

```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
# ... outras configurações SSL
```

```bash
# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

#### Renovação Automática de Certificados

```bash
# Adicionar cronjob para renovação
sudo crontab -e

# Adicionar linha (renovar a cada 2 meses às 2h)
0 2 1 */2 * certbot renew --quiet && cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ~/restaurant/ssl/cert.pem && cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ~/restaurant/ssl/key.pem && docker-compose -f ~/restaurant/docker-compose.prod.yml restart nginx
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f nginx

# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Reiniciar um serviço específico
docker-compose -f docker-compose.prod.yml restart app

# Rebuild de um serviço
docker-compose -f docker-compose.prod.yml up -d --build app
```

### Banco de Dados

```bash
# Acessar banco PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d restaurant

# Backup do banco
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres restaurant > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres restaurant < backup_file.sql

# Executar migrações manualmente
docker-compose -f docker-compose.prod.yml exec app npx drizzle-kit push --config=drizzle.config.ts
```

### Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver espaço em disco usado por Docker
docker system df

# Limpar cache e containers parados
docker system prune -f

# Ver logs do sistema
journalctl -u docker.service
```

## 🔒 Segurança

### 1. Configurar Usuário SSH

```bash
# Criar usuário não-root
sudo adduser restaurant_user
sudo usermod -aG sudo restaurant_user
sudo usermod -aG docker restaurant_user

# Configurar chaves SSH (recomendado)
# ... configurar authorized_keys
```

### 2. Configurar Firewall

```bash
# Instalar e configurar UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Backup Automático

```bash
# Criar script de backup
nano ~/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
docker-compose -f ~/restaurant/docker-compose.prod.yml exec -T postgres pg_dump -U postgres restaurant > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ~/restaurant/uploads/

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Tornar executável e agendar
chmod +x ~/backup.sh
crontab -e
# Adicionar: 0 2 * * * /home/$USER/backup.sh
```

## 🌐 Configuração de Domínio

### 1. DNS na Hostinger

No painel da Hostinger, configure:

```
Tipo: A
Nome: @
Valor: IP_DA_SUA_VPS
TTL: 300

Tipo: A  
Nome: www
Valor: IP_DA_SUA_VPS
TTL: 300
```

### 2. Verificar Propagação

```bash
# Verificar se o domínio está apontando para a VPS
nslookup seu-dominio.com
ping seu-dominio.com
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Container não inicia

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs app

# Verificar recursos
free -h
df -h
```

#### 2. Banco não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Resetar banco (CUIDADO - apaga dados)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. SSL não funciona

```bash
# Verificar certificados
sudo certbot certificates

# Verificar configuração nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Verificar logs nginx
docker-compose -f docker-compose.prod.yml logs nginx
```

#### 4. Performance baixa

```bash
# Verificar uso de recursos
docker stats

# Verificar logs de erro
docker-compose -f docker-compose.prod.yml logs | grep -i error

# Otimizar banco
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "VACUUM ANALYZE;"
```

## 📈 Monitoramento e Logs

### 1. Logs da Aplicação

```bash
# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Filtrar logs por nível
docker-compose -f docker-compose.prod.yml logs | grep ERROR
```

### 2. Health Checks

```bash
# Verificar saúde dos serviços
curl http://localhost/health
docker-compose -f docker-compose.prod.yml ps
```

### 3. Alertas (Opcional)

Configure monitoramento com Uptime Robot ou similar para alertas automáticos.

---

## 🎉 Deploy Completo!

Após seguir este guia, sua aplicação estará rodando em:

- **HTTP**: `http://seu-dominio.com`
- **HTTPS**: `https://seu-dominio.com` (se SSL configurado)
- **Health Check**: `https://seu-dominio.com/health`

### Próximos Passos

1. ✅ Configure certificados SSL
2. ✅ Configure backups automáticos  
3. ✅ Configure monitoramento
4. ✅ Teste todas as funcionalidades
5. ✅ Configure Mercado Pago para produção
6. ✅ Popule dados iniciais via admin

**Suporte**: Em caso de problemas, verifique os logs e troubleshooting acima. 