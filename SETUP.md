# 🔧 Resolução do Erro "Usuário não encontrado"

Este documento explica como resolver o erro **"Usuário não encontrado no sistema. Faça login novamente."**

## 🚨 Problema Identificado

O erro ocorre quando:
- ✅ O frontend mostra que você está "logado"
- ❌ Mas não há token de autenticação válido no backend
- ❌ Ou o usuário não existe no banco de dados

## 🛠️ Solução Rápida

### Opção 1: Script Automático
```bash
npm run setup
```

### Opção 2: Comandos Manuais

1. **Criar usuários de teste:**
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/seed-users" -Method POST

# Linux/Mac
curl -X POST http://localhost:3000/api/seed-users
```

2. **Criar cardápio de exemplo:**
```bash
# PowerShell  
Invoke-WebRequest -Uri "http://localhost:3000/api/seed-cardapio" -Method POST

# Linux/Mac
curl -X POST http://localhost:3000/api/seed-cardapio
```

3. **Fazer login com as credenciais criadas:**
   - Email: `user@gmail.com`
   - Senha: `12345678`

## 👥 Usuários Criados

Após executar o setup, você terá estes usuários:

| Email | Senha | Tipo |
|-------|--------|------|
| `admin@gmail.com` | `admin123` | Administrador |
| `user@gmail.com` | `12345678` | Usuário comum |
| `klbs@gmail.com` | `12345678` | Usuário comum |

## ✅ Verificação

1. Vá para http://localhost:3000/login
2. Digite: `user@gmail.com` / `12345678`
3. Clique em "Entrar"
4. Se logado com sucesso, vá para http://localhost:3000/usuario
5. Teste a compra de tickets

## 🔍 Melhorias Implementadas

### Frontend (`components/comprar-ticket-sincronizado.tsx`)
- ✅ Detecta automaticamente se o usuário não está logado
- ✅ Mostra botão "Fazer Login" quando necessário
- ✅ Mensagens de erro mais claras
- ✅ Loading states para melhor UX

### Backend (`app/api/checkout/route.ts`)
- ✅ Logs detalhados para diagnóstico
- ✅ Verificação robusta de dados do usuário
- ✅ Mensagens de erro mais específicas

## 🚀 Próximos Passos

Após resolver o login:

1. **Teste a compra de tickets** - acesse `/usuario`
2. **Explore o cardápio** - acesse `/cardapio`
3. **Saiba mais sobre o sistema** - acesse `/sobre`
4. **Acesso admin** - use `admin@gmail.com` / `admin123`

## 🐛 Se o Problema Persistir

1. **Limpe o cache do navegador**
2. **Verifique se o servidor está rodando** na porta 3000
3. **Verifique se o banco de dados está configurado**
4. **Execute o seeder novamente**

## ⚡ Comando de Emergência

Se nada funcionar, execute:

```bash
# Limpar e recriar tudo
npm run setup

# Ou manualmente:
# 1. Limpar cookies do navegador
# 2. Executar seeders
# 3. Fazer login novamente
```

---

**💡 Dica:** Sempre que houver problemas de autenticação, execute `npm run setup` para resetar o sistema com dados válidos. 