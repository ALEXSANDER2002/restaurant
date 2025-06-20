# 🤖 Melhorias do Chatbot UNIFESSPA com IA

## 📋 Resumo das Melhorias

O chatbot do Restaurante Universitário da UNIFESSPA foi completamente reformulado para incluir inteligência artificial usando a API do Google Gemini, proporcionando respostas mais naturais, contextuais e precisas.

## 🚀 Principais Funcionalidades

### 1. **Integração com Google Gemini AI**
- ✅ API do Google Gemini integrada
- ✅ Respostas naturais e conversacionais  
- ✅ Contexto específico da UNIFESSPA
- ✅ Fallback para respostas pré-programadas

### 2. **Contexto Especializado UNIFESSPA**
- 🏛️ **Campus Múltiplos**: Marabá, Santana do Araguaia, Rondon do Pará, Xinguara
- 📍 **Localização Precisa**: Endereços completos de cada campus
- 🕐 **Horários Atualizados**: 11h-14h (almoço) e 17h-19h30 (jantar)
- 💰 **Preços Corretos**: Estudantes R$ 3,00, Professores/Funcionários R$ 10,00, Visitantes R$ 15,00

### 3. **Funcionalidades Melhoradas**
- 🎯 Respostas contextuais baseadas no histórico da conversa
- 🔄 Sistema de fallback em caso de erro da API
- 📱 Interface responsiva e moderna
- 🎨 Visual atualizado com emojis e formatação

## 🛠️ Arquitetura Técnica

### Estrutura de Arquivos
```
services/
├── gemini-chat-service.ts      # Serviço principal do Gemini
app/api/
├── chat/route.ts              # API endpoint para chat
components/
├── chat-bot.tsx               # Componente principal do chat
├── demo-chat-unifesspa.tsx    # Componente de demonstração
lib/
├── chat-responses.ts          # Respostas de fallback atualizadas
```

### Fluxo de Funcionamento
1. **Usuário** envia mensagem
2. **Frontend** chama API `/api/chat`
3. **API** processa com Gemini AI usando contexto UNIFESSPA
4. **Fallback** usa respostas pré-programadas se IA falhar
5. **Resposta** é enviada de volta formatada

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Google Gemini API
GOOGLE_GEMINI_API_KEY=AIzaSyAP0gGdFkjc_nQrJFexH4uXdznmCKM_faI
```

### Dependências Instaladas
```json
{
  "@google/generative-ai": "^0.21.0"
}
```

## 📊 Contexto da IA

O chatbot possui contexto específico incluindo:

- **Informações da UNIFESSPA**: História, campus, características
- **Detalhes do RU**: Horários, preços, cardápio, localização
- **Programas Sociais**: PRAE, auxílio alimentação, bolsas
- **Diretrizes de Resposta**: Tom cordial, linguagem acessível, foco regional

## 🎯 Casos de Uso

### Perguntas que o chatbot responde melhor agora:
- ❓ "Qual o cardápio de hoje no RU?"
- ❓ "Como faço para solicitar auxílio alimentação?"
- ❓ "Onde fica o RU no campus de Marabá?"
- ❓ "Quais são as formas de pagamento aceitas?"
- ❓ "O RU tem opção vegetariana?"
- ❓ "Como recarregar o cartão do estudante?"

## 🔍 Melhorias na UX

### Antes vs Depois

**Antes:**
- Respostas baseadas apenas em palavras-chave
- Contexto limitado e robótico
- Sem histórico de conversa
- Interface básica

**Depois:**
- Respostas naturais com IA
- Contexto completo da UNIFESSPA
- Histórico de conversa mantido
- Interface moderna com emojis
- Sistema de fallback robusto

## 🚦 Sistema de Fallback

Em caso de falha da API do Gemini:
1. ⚠️ Erro é capturado automaticamente
2. 🔄 Sistema usa respostas pré-programadas melhoradas
3. 📝 Log do erro é registrado
4. ✅ Usuário recebe resposta útil mesmo assim

## 📈 Escalabilidade e Manutenibilidade

### Benefícios da Nova Arquitetura:
- 🔧 **Modular**: Cada componente tem responsabilidade específica
- 🎨 **Customizável**: Fácil atualizar contexto e respostas
- 🔒 **Segura**: Variáveis de ambiente para chaves de API
- 📊 **Monitorável**: Logs para debugging e análise
- 🚀 **Escalável**: Suporta múltiplos tipos de IA no futuro

## 🎉 Demonstração

Acesse `/demo-chatbot` para ver todas as funcionalidades em ação!

---

**Desenvolvido para a UNIFESSPA** - Melhorando a experiência dos estudantes no Restaurante Universitário através de tecnologia inteligente e acessível. 