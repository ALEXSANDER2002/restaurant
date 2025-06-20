# Configuração do Mercado Pago

Este documento explica como configurar a integração com o Mercado Pago no sistema de restaurante universitário.

## 🔧 Configuração Inicial

### 1. Credenciais

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Mercado Pago - Teste (Development)
MERCADO_PAGO_ACCESS_TOKEN=TEST-123456789-010203-abc123def456ghi789jkl012mno345-123456789
MERCADO_PAGO_PUBLIC_KEY=TEST-abc123def-456g-789h-012i-345jkl678mno

# Mercado Pago - Produção (Production)
# MERCADO_PAGO_ACCESS_TOKEN=APP_USR-123456789-010203-abc123def456ghi789jkl012mno345-123456789
# MERCADO_PAGO_PUBLIC_KEY=APP_USR-abc123def-456g-789h-012i-345jkl678mno

# URL da aplicação (importante para webhooks)
APP_URL=http://localhost:3000

# Webhook secret (configure no painel do MP)
MERCADO_PAGO_WEBHOOK_SECRET=sua-chave-secreta-aqui
```

### 2. Onde obter as credenciais

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Faça login com sua conta
3. Vá em "Suas integrações" > "Suas aplicações"
4. Crie uma nova aplicação ou use uma existente
5. Copie as credenciais de **Teste** (para desenvolvimento)

## 🧪 Testando Pagamentos

### 💳 Cartões de Teste (RECOMENDADO)

**Cartões que SEMPRE aprovam:**
```
💳 VISA APROVADO:
Número: 4013 4013 4013 4013
Vencimento: 12/25
CVV: 123
Nome: APRO

💳 MASTERCARD APROVADO:
Número: 5555 5555 5555 5557  
Vencimento: 12/25
CVV: 123
Nome: APRO

💳 AMEX APROVADO:
Número: 371449635398431
Vencimento: 12/25
CVV: 1234
Nome: APRO
```

**Cartões que SEMPRE rejeitam (para testar erro):**
```
💳 VISA REJEITADO:
Número: 4013 4013 4013 4014
Vencimento: 12/25  
CVV: 123
Nome: OTHE
```

### 📱 PIX de Teste

No checkout, escolha PIX e use:
- **CPF**: `11144477735` (CPF de teste válido)
- **Email**: Qualquer email válido
- O PIX será **aprovado automaticamente** no ambiente de teste

### 💰 Saldo em Conta (Ambiente de Teste)

Para usar saldo na conta de teste:

1. **Acesse**: https://www.mercadopago.com.br
2. **Faça login** com sua conta de teste do Mercado Pago
3. **Vá em "Adicionar dinheiro"** na carteira
4. **Use um cartão de teste** para adicionar saldo (cartões acima)
5. **Depois use esse saldo** para pagar no checkout

## 🚀 Fluxo de Pagamento

### Como funciona:

1. **Usuário compra ticket** → Sistema cria preferência no Mercado Pago
2. **Redirecionamento** → Usuário vai para o Checkout Pro do Mercado Pago
3. **Pagamento** → Usuário paga via PIX, cartão, etc.
4. **Webhook** → Mercado Pago notifica nosso sistema sobre o status
5. **Atualização** → Sistema atualiza o status do ticket no banco de dados
6. **Retorno** → Usuário volta para a aplicação com feedback

## 📱 Endpoints

### Checkout
- **POST** `/api/checkout`
- Cria preferência de pagamento
- Retorna URL do Checkout Pro

### Webhook
- **POST** `/api/mercadopago/webhook`
- Recebe notificações do Mercado Pago
- Atualiza status dos tickets automaticamente

## 🔗 Configuração do Webhook

### No painel do Mercado Pago:

1. Acesse sua aplicação no [developers.mercadopago.com](https://developers.mercadopago.com)
2. Vá em "Webhooks"
3. Adicione uma nova URL de webhook:
   - **URL**: `https://seu-dominio.com/api/mercadopago/webhook`
   - **Eventos**: Selecione "Payments"
4. Configure a **assinatura secreta** para segurança
5. Salve a configuração

### Para desenvolvimento local:

Use uma ferramenta como **ngrok** para expor localhost:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Use a URL gerada (ex: https://abc123.ngrok.io)
# Configure no Mercado Pago: https://abc123.ngrok.io/api/mercadopago/webhook
```

## 🧪 Testando a integração

Execute o script de teste:

```bash
node scripts/test-mercadopago.js
```

Ou teste manualmente:

1. **Teste de checkout**:
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "usuario_id": "test-user",
       "data": "2024-01-15",
       "comprarSubsidiado": true,
       "quantidadeNaoSubsidiado": 1
     }'
   ```

2. **Teste de webhook**:
   ```bash
   curl -X GET http://localhost:3000/api/mercadopago/webhook
   ```

## 💳 Mapeamento de Status

| Status Mercado Pago | Status Sistema | Descrição |
|---------------------|----------------|-----------|
| `pending` | `pendente` | Pagamento aguardando processamento |
| `approved` | `pago` | Pagamento aprovado |
| `authorized` | `pago` | Pagamento autorizado |
| `in_process` | `pendente` | Pagamento sendo processado |
| `in_mediation` | `pendente` | Pagamento em mediação |
| `rejected` | `cancelado` | Pagamento rejeitado |
| `cancelled` | `cancelado` | Pagamento cancelado |
| `refunded` | `cancelado` | Pagamento estornado |
| `charged_back` | `cancelado` | Pagamento com chargeback |

## 🛡️ Segurança

### Validação de Webhooks

O sistema implementa validação de assinatura usando HMAC-SHA256:

```javascript
// Exemplo de validação automática
const isValid = validateMercadoPagoWebhook(bodyText, signature, webhookSecret)
```

## 🚨 Troubleshooting

### Erros comuns:

1. **"Não foi possível processar seu pagamento"**
   - ✅ Use cartões de teste: `4013 4013 4013 4013`
   - ✅ Ou use PIX com CPF: `11144477735`
   - ✅ Adicione saldo na conta de teste usando cartão válido

2. **"Access token inválido"**
   - Verifique se o token está correto
   - Confirme se está usando credenciais de teste/produção apropriadas

3. **"Webhook não está sendo chamado"**
   - Confirme se a URL do webhook está correta
   - Verifique se a aplicação está acessível externamente
   - Use ngrok para desenvolvimento local

4. **"Tickets não estão sendo atualizados"**
   - Verifique os logs do webhook
   - Confirme se o `external_reference` está correto
   - Verifique se o banco de dados está acessível

### Logs úteis:

```bash
# Ver logs do Next.js
npm run dev

# Logs específicos do webhook
grep "WEBHOOK" .next/server.log
```

## 📖 Recursos Adicionais

- [Documentação oficial](https://www.mercadopago.com.br/developers/pt/docs)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/webhooks)
- [Credenciais](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials)
- [Cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards)

## 🔄 Migração de Produção

Quando estiver pronto para produção:

1. Obtenha credenciais de produção no painel do Mercado Pago
2. Substitua as variáveis de ambiente
3. Configure o webhook com a URL de produção
4. Teste com pagamentos reais pequenos
5. Monitore os logs inicialmente 