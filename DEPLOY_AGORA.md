# 🚀 EXECUTE ESTES COMANDOS NA SUA VPS AGORA

## 1. Limpar tudo primeiro:
```bash
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true  
docker system prune -a -f --volumes
```

## 2. Fazer git pull para pegar as correções:
```bash
cd ~/restaurant
git pull origin main
```

## 3. Copiar configuração:
```bash
cp .env.production .env
```

## 4. Build e subir (vai funcionar agora):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 5. Aguardar 30 segundos e criar admin:
```bash
sleep 30
docker compose -f docker-compose.prod.yml exec app node scripts/create-admin.js --test
```

## 6. Verificar se está funcionando:
```bash
curl http://localhost/nginx-health
curl http://localhost/api/session
```

## ✅ Pronto! Acesse:
- **Site**: https://sirus-unifesspa.shop
- **Admin**: https://sirus-unifesspa.shop/admin
- **Login**: admin@unifesspa.edu.br / admin123

---

## 🆘 Se der erro, veja os logs:
```bash
docker compose -f docker-compose.prod.yml logs -f
``` 