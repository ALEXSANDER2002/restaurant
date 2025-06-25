# 🚀 DEPLOY RÁPIDO - HOSTINGER

## ⚡ Para fazer deploy AGORA mesmo na Hostinger:

### 1. **Clone e configure** (2 minutos)
```bash
git clone https://github.com/seu-usuario/restaurant.git
cd restaurant
cp .env.production .env
nano .env  # Configure seu domínio e credenciais
```

### 2. **Deploy com um comando** (5 minutos)
```bash
# Linux/Mac
./scripts/deploy-hostinger.sh

# Windows (Git Bash)
bash scripts/deploy-hostinger.sh

# Manualmente
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. **Criar admin** (1 minuto)
```bash
docker compose -f docker-compose.prod.yml exec app node scripts/create-admin.js --test
```

### 4. **Acessar**
- **Site**: http://seu-ip
- **Admin**: http://seu-ip/admin
- **Login**: admin@unifesspa.edu.br / admin123

---

## ✅ Que está funcionando:

- ✅ **Login e Cadastro** com autenticação JWT
- ✅ **Login Facial** com reconhecimento por câmera
- ✅ **Compra de Tickets** com Mercado Pago
- ✅ **Seleção de Campus** (1, 2 ou 3)
- ✅ **QR Codes** para cada ticket
- ✅ **Scanner QR** no painel admin
- ✅ **Dashboard** com gráficos por campus
- ✅ **Chatbot** com Google Gemini
- ✅ **Cardápio Semanal** configurável
- ✅ **Upload de Avatar** para usuários
- ✅ **Acessibilidade** com VLibras

## 🔧 Comandos úteis:

```bash
# Ver status
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Backup banco
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres restaurant > backup.sql

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Reiniciar
docker compose -f docker-compose.prod.yml restart
```

## 🎯 URLs importantes:

- `/` - Página inicial
- `/login` - Login de usuários
- `/cadastro` - Cadastro de novos usuários
- `/usuario` - Painel do usuário
- `/admin` - Painel administrativo
- `/cardapio` - Cardápio da semana
- `/api/session` - Health check da API

## 📱 Fluxo completo:

1. **Usuário se cadastra** → `/cadastro`
2. **Faz login** → `/login` ou login facial
3. **Compra tickets** → `/usuario` (aba Comprar)
4. **Vê QR codes** → `/usuario` (aba Histórico)
5. **Admin valida QR** → `/admin/validar-tickets`
6. **Ticket é debitado** → Sistema registra uso

## 🔒 Para produção:

1. **Configure domínio real** no `.env`
2. **Gere NEXTAUTH_SECRET forte**: `openssl rand -base64 32`
3. **Use credenciais PROD** do Mercado Pago
4. **Configure SSL** com Let's Encrypt
5. **Altere senha do admin** depois do primeiro login

---

**🎉 TUDO PRONTO! O SIRUS funciona 100% com este comando:**
```bash
docker compose -f docker-compose.prod.yml up -d --build
``` 