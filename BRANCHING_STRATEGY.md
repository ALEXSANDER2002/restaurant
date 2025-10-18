# Estratégia de Branches - Sistema SIRUS

## Visão Geral

Este projeto utiliza uma estratégia de branches para organizar o desenvolvimento em dois módulos principais:

- **SirusBot**: Módulo de chatbot e assistente virtual
- **SirusPag**: Módulo de pagamentos e gestão do restaurante universitário

## Estrutura de Branches

```
main (branch principal - código completo e estável)
  ├── SirusBot (desenvolvimento do chatbot)
  └── SirusPag (desenvolvimento do sistema de pagamentos)
```

## Branches

### `main`
- **Propósito**: Branch principal com código completo e estável
- **Conteúdo**: Integração completa de SirusBot + SirusPag
- **Proteção**: Deve ser protegida, aceita apenas merges de SirusBot e SirusPag
- **Deploy**: Production

### `SirusBot`
- **Propósito**: Desenvolvimento do módulo de chatbot
- **Foco**: Assistente virtual, análise de conversas, integração com Gemma/Ollama
- **Merge para**: `main` (após testes e aprovação)

#### Arquivos Principais do SirusBot:
```
services/
  ├── gemma-chat-service.ts
  ├── chat-analytics-service.ts
  └── mcp/ (Model Context Protocol)
      ├── dialog-context.service.ts
      ├── dialog-manager.service.ts
      ├── entity-extraction.service.ts
      ├── intent-recognition.service.ts
      ├── mcp-orchestrator.service.ts
      └── tool-manager.service.ts

components/
  ├── chat-bot.tsx
  ├── chat-analytics-dashboard.tsx
  └── demo-chat-unifesspa.tsx

hooks/
  ├── use-chatbot.ts
  └── use-chat-analytics.ts

app/
  ├── api/chat/route.ts
  └── demo-chatbot/page.tsx

types/
  └── mcp.types.ts

scripts/
  ├── setup-ollama.js
  └── test-gemma-migration.js
```

### `SirusPag`
- **Propósito**: Desenvolvimento do módulo de pagamentos e gestão
- **Foco**: Pagamentos, tickets, cardápio, pedidos, gestão de usuários
- **Merge para**: `main` (após testes e aprovação)

#### Arquivos Principais do SirusPag:
```
services/
  ├── mercado-pago-client.ts
  ├── ticket-sync-service.ts
  └── face-recognition-service.ts

components/
  ├── comprar-ticket-melhorado.tsx
  ├── comprar-ticket-sincronizado.tsx
  ├── checkout-transparente.tsx
  ├── ticket-qrcode.tsx
  ├── validador-qr-integrado.tsx
  ├── gerenciar-cardapio.tsx
  ├── lista-pedidos.tsx
  ├── tabela-pedidos.tsx
  └── dashboard-vendas.tsx

app/
  ├── api/mercado-pago/
  ├── api/tickets/
  ├── api/pedidos/
  ├── cardapio/
  ├── admin/
  └── pagamento-mock/
```

## Workflow de Desenvolvimento

### 1. Desenvolvimento de Features

#### Para features do Chatbot:
```bash
# Mude para branch SirusBot
git checkout SirusBot

# Desenvolva a feature
# ... fazer alterações ...

# Commit e push
git add .
git commit -m "feat(chatbot): descrição da feature"
git push origin SirusBot
```

#### Para features de Pagamentos:
```bash
# Mude para branch SirusPag
git checkout SirusPag

# Desenvolva a feature
# ... fazer alterações ...

# Commit e push
git add .
git commit -m "feat(pagamentos): descrição da feature"
git push origin SirusPag
```

### 2. Merge para Main

Após testes e aprovação:

```bash
# Atualizar main com as mudanças
git checkout main
git pull origin main

# Merge da branch de feature
git merge SirusBot  # ou SirusPag
git push origin main
```

### 3. Sincronização de Branches

Manter branches atualizadas com main:

```bash
# Para SirusBot
git checkout SirusBot
git merge main
git push origin SirusBot

# Para SirusPag
git checkout SirusPag
git merge main
git push origin SirusPag
```

## Convenção de Commits

### Prefixos:
- `feat(chatbot):` - Nova funcionalidade do chatbot
- `feat(pagamentos):` - Nova funcionalidade de pagamentos
- `fix(chatbot):` - Correção de bug no chatbot
- `fix(pagamentos):` - Correção de bug em pagamentos
- `refactor(chatbot):` - Refatoração do chatbot
- `refactor(pagamentos):` - Refatoração de pagamentos
- `docs:` - Documentação
- `style:` - Formatação
- `test:` - Testes
- `chore:` - Manutenção

### Exemplos:
```
feat(chatbot): adicionar suporte para múltiplos idiomas no chatbot
fix(pagamentos): corrigir validação de QR code nos tickets
refactor(chatbot): melhorar performance do MCP orchestrator
feat(pagamentos): integrar novo método de pagamento PIX
```

## Resolução de Conflitos

### Conflitos entre SirusBot e SirusPag:
1. Identificar o arquivo em conflito
2. Se for arquivo compartilhado (ex: `package.json`, `layout.tsx`):
   - Resolver manualmente mantendo ambas as funcionalidades
3. Se for arquivo específico de um módulo:
   - Priorizar a branch do módulo responsável

### Arquivos Compartilhados:
```
package.json
app/layout.tsx
app/globals.css
tailwind.config.ts
next.config.mjs
.env
lib/utils.ts
components/ui/
```

## Boas Práticas

1. **Sempre trabalhe na branch correta**
   - Chatbot → `SirusBot`
   - Pagamentos → `SirusPag`

2. **Faça commits frequentes e descritivos**
   - Commits pequenos são mais fáceis de revisar

3. **Teste antes de fazer merge para main**
   - Execute testes locais
   - Verifique integração com outros módulos

4. **Mantenha as branches sincronizadas**
   - Faça merge de `main` regularmente nas branches de feature

5. **Documente mudanças significativas**
   - Atualize README quando necessário
   - Documente novas APIs ou serviços

## Arquitetura Modular

O projeto está organizado de forma que cada módulo seja relativamente independente:

- **SirusBot** pode funcionar como serviço standalone
- **SirusPag** pode funcionar sem o chatbot
- Integração completa acontece na `main`

## Deploy

### Ambientes:
- `main` → Production (aplicação completa)
- `SirusBot` → Development/Staging (apenas chatbot)
- `SirusPag` → Development/Staging (apenas pagamentos)

## Contato e Suporte

Para dúvidas sobre:
- **SirusBot**: Contate equipe de IA/ML
- **SirusPag**: Contate equipe de pagamentos
- **Arquitetura geral**: Contate arquiteto de software

---

**Última atualização**: 2025-10-18

