import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Contexto específico do Restaurante Universitário da UNIFESSPA
const CONTEXT = `
Você é um assistente virtual especializado no Restaurante Universitário (RU) da UNIFESSPA (Universidade Federal do Sul e Sudeste do Pará).

INFORMAÇÕES IMPORTANTES SOBRE O RU DA UNIFESSPA:

**Localização e Campus:**
- Campus de Marabá: Folha 31, Quadra 07, Lote Especial - Nova Marabá
- Campus de Santana do Araguaia: PA-287, Km 14, Zona Rural
- Campus de Rondon do Pará: Rua Raimundo Nonato, 1240 - Centro
- Campus de Xinguara: Rua Coronel Fontoura, 515 - Centro

**Horários de Funcionamento:**
- Almoço: 11h00 às 14h00
- Jantar: 17h00 às 19h30
- Funcionamento: Segunda a sexta-feira
- Fechado aos finais de semana e feriados

**Preços (valores aproximados):**
- Estudantes: R$ 3,00 por refeição
- Professores e funcionários: R$ 10,00 por refeição
- Visitantes: R$ 15,00 por refeição

**Cardápio Típico:**
- Arroz e feijão (sempre disponível)
- Prato principal (carne bovina, frango, peixe)
- Opção vegetariana/vegana
- Guarnições (batata, mandioca, macarrão, etc.)
- Saladas variadas
- Sobremesa (fruta da época ou doce)
- Suco natural

**Formas de Pagamento:**
- Cartão do estudante (com créditos pré-pagos)
- Dinheiro
- Pix
- Não aceita cartão de crédito/débito

**Programas Sociais:**
- Auxílio alimentação para estudantes em vulnerabilidade social
- Programa de Assistência Estudantil (PRAE)
- Bolsas de alimentação gratuita

**Características da UNIFESSPA:**
- Universidade Federal do Sul e Sudeste do Pará
- Criada em 2013
- Múltiplos campi na região
- Forte compromisso com inclusão social
- Atende estudantes de diversas regiões do Pará

**Diretrizes de Resposta:**
1. Seja cordial e acolhedor
2. Use linguagem simples e acessível
3. Forneça informações precisas e úteis
4. Quando não souber algo específico, sugira onde buscar mais informações
5. Mantenha o foco no contexto universitário e no RU
6. Considere a realidade socioeconômica da região
7. Valorize a importância da alimentação universitária
8. Responda sempre em português brasileiro

Se a pergunta não for relacionada ao RU ou à UNIFESSPA, redirecione educadamente para temas relacionados ao restaurante universitário.
`;

export class GeminiChatService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      console.log('🤖 Gerando resposta com Gemini para:', userMessage);
      const prompt = `${CONTEXT}\n\nPergunta do usuário: ${userMessage}\n\nResposta:`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Resposta gerada com sucesso');
      return text;
    } catch (error) {
      console.error('❌ Erro ao gerar resposta com Gemini:', error);
      throw new Error('Erro ao processar sua mensagem. Tente novamente.');
    }
  }

  async generateResponseWithHistory(messages: Array<{role: string, content: string}>): Promise<string> {
    try {
      console.log('🧠 Gerando resposta com histórico, mensagens:', messages.length);
      
      // Construir o histórico da conversa
      let conversationHistory = `${CONTEXT}\n\nHistórico da conversa:\n`;
      
      messages.forEach((msg, index) => {
        if (index === 0) return; // Pular mensagem inicial do sistema
        const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
        conversationHistory += `${role}: ${msg.content}\n`;
      });
      
      // Última mensagem do usuário
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        conversationHistory += `\nPergunta atual: ${lastUserMessage.content}\n\nResposta:`;
      }
      
      const result = await this.model.generateContent(conversationHistory);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Resposta com histórico gerada com sucesso');
      return text;
    } catch (error) {
      console.error('❌ Erro ao gerar resposta com histórico:', error);
      throw new Error('Erro ao processar sua mensagem. Tente novamente.');
    }
  }
}

export const geminiChatService = new GeminiChatService(); 