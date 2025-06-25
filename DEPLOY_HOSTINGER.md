# 🚀 Deploy SIRUS na Hostinger

Guia completo para fazer deploy do Sistema de Restaurante Universitário (SIRUS) na Hostinger.

## 📋 Pré-requisitos

### Na Hostinger:
- VPS com Ubuntu 20.04+ ou CentOS 7+
- Mínimo 2GB RAM, 2 CPU cores
- Docker e Docker Compose instalados
- Porta 80 e 443 liberadas no firewall

### Credenciais necessárias:
- Conta no Mercado Pago (para pagamentos)
- API Key do Google Gemini (para chatbot)
- Domínio configurado (opcional, mas recomendado)

## 🔧 Instalação do Docker (se necessário)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

## 📦 Deploy Automático

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/restaurant.git
cd restaurant
```

### 2. Configure as variáveis de ambiente
```bash
# Copie o template de produção
cp .env.production .env

# Edite as configurações (IMPORTANTE!)
nano .env
```

**Variáveis obrigatórias para alterar:**
```bash
# SEU DOMÍNIO
APP_URL=https://seudominio.com
NEXTAUTH_URL=https://seudominio.com

# CHAVE SECRETA (gere uma nova)
NEXTAUTH_SECRET=sua_chave_super_secreta_aqui

# CREDENCIAIS DO MERCADO PAGO (PRODUÇÃO)
MERCADO_PAGO_ACCESS_TOKEN=PROD-xxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=PROD-xxxxxxxxxxxxxxxx
```

### 3. Execute o deploy
```bash
# Dar permissão ao script
chmod +x scripts/deploy-hostinger.sh

# Executar deploy
./scripts/deploy-hostinger.sh
```

## 🌐 Acesso ao Sistema

Após o deploy bem-sucedido:

- **Aplicação**: http://seu-ip ou https://seudominio.com
- **Admin**: /admin (criar conta admin primeiro)
- **Banco**: Acessível apenas internamente

## 👥 Primeiro Acesso

### 1. Criar usuário administrador
```bash
# Acessar container da aplicação
docker-compose -f docker-compose.prod.yml exec app bash

# Executar script de criação de admin
node scripts/create-admin.js
```

### 2. Configurar dados iniciais
- Acesse `/admin` com as credenciais criadas
- Configure o cardápio da semana
- Teste as funcionalidades de pagamento
- Verifique os QR codes

## 🔒 SSL/HTTPS (Recomendado)

### Opção 1: Let's Encrypt (Grátis)
```bash
# Instalar certbot
sudo apt install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*

# Editar nginx.prod.conf e descomentar bloco HTTPS
nano nginx.prod.conf

# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Opção 2: Certificado próprio
```bash
# Gerar certificado self-signed (apenas para testes)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem \
  -subj "/C=BR/ST=PA/L=Maraba/O=UNIFESSPA/CN=seudominio.com"
```

## 📊 Monitoramento

### Comandos úteis:
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs postgres

# Health checks
curl http://localhost/nginx-health
curl http://localhost/api/session

# Uso de recursos
docker stats

# Acesso ao banco
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d restaurant
```

### Backup do banco de dados:
```bash
# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres restaurant > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres restaurant < backup.sql
```

## 🔄 Atualizações

### Deploy de nova versão:
```bash
# Fazer pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml up -d --build

# Ou usar o script
./scripts/deploy-hostinger.sh
```

## 🐛 Troubleshooting

### Problemas comuns:

#### 1. Aplicação não inicia
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs app

# Possíveis causas:
# - Erro na conexão com banco
# - Variáveis de ambiente incorretas
# - Falta de memória
```

#### 2. Banco não conecta
```bash
# Verificar status do PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Verificar logs
docker-compose -f docker-compose.prod.yml logs postgres
```

#### 3. Nginx não responde
```bash
# Testar configuração
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Verificar logs
docker-compose -f docker-compose.prod.yml logs nginx
```

#### 4. Pagamentos não funcionam
```bash
# Verificar credenciais do Mercado Pago
grep MERCADO_PAGO .env

# Testar webhook
curl -X POST http://localhost/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{"action":"payment.created","data":{"id":"test"}}'
```

### Reiniciar tudo do zero:
```bash
# Parar e remover tudo
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a -f

# Remover dados persistentes (CUIDADO!)
sudo rm -rf data/postgres/*

# Deploy novamente
./scripts/deploy-hostinger.sh
```

## 📈 Performance

### Otimizações recomendadas:

#### 1. Configurar swap (se necessário)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 2. Configurar firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

#### 3. Monitoramento automatizado
```bash
# Adicionar ao crontab
echo "*/5 * * * * curl -s http://localhost/nginx-health > /dev/null || systemctl restart docker" | crontab -
```

## 🆘 Suporte

Em caso de problemas:

1. **Logs detalhados**: `docker-compose -f docker-compose.prod.yml logs --tail=100`
2. **Status dos serviços**: `docker-compose -f docker-compose.prod.yml ps`
3. **Recursos do sistema**: `htop` ou `docker stats`
4. **Conectividade**: `curl -v http://localhost/api/session`

## ✅ Checklist de Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env` configurado corretamente
- [ ] Domínio apontando para o servidor
- [ ] Portas 80/443 liberadas no firewall
- [ ] SSL configurado (opcional)
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Usuário admin criado
- [ ] Cardápio configurado
- [ ] Testes de pagamento realizados
- [ ] QR codes funcionando

---

**🎉 Parabéns! O SIRUS está rodando em produção na Hostinger!**

Para suporte adicional, consulte a documentação completa em `README.md`. 