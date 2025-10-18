interface CachedResponse {
  response: string;
  timestamp: number;
  expiresAt: number;
  questionType: string;
  confidence: number;
}

interface ChatMessage {
  role: string;
  content: string;
}

interface QuickSuggestion {
  text: string;
  category: string;
  priority: number;
}

// Serviço de chat usando Gemma 2B local via Ollama
const CONTEXT = `
Você é um assistente virtual especializado no Restaurante Universitário (RU) da UNIFESSPA (Universidade Federal do Sul e Sudeste do Pará).

INFORMAÇÕES IMPORTANTES SOBRE O RU DA UNIFESSPA:

**Localização e Campus:**
- Campus de Marabá: Folha 31, Quadra 07, Lote Especial - Nova Marabá
- Campus de Santana do Araguaia: PA-287, Km 14, Zona Rural
- Campus de Rondon do Pará: Rua Raimundo Nonato, 1240 - Centro
- Campus de Xinguara: Rua Coronel Fontoura, 515 - Centro

**Horários de Funcionamento:**
- Almoço: 11h00 às 14h00 (apenas almoço, não servimos jantar)
- Funcionamento: Segunda a sexta-feira
- Fechado aos finais de semana e feriados

**Preços:**
- Estudantes Subsidiados: R$ 2,00 por refeição (com cota por escola, cor, renda)
- Não Subsidiados/Visitantes: R$ 13,00 por refeição

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

export class GemmaChatService {
  private baseUrl: string;
  private model: string;
  private context: string;
  private cache: Map<string, CachedResponse> = new Map();
  private readonly MAX_CACHE_SIZE = 200;
  private readonly COMMON_QUESTIONS = new Map([
    ['horário', 'O RU da UNIFESSPA funciona de segunda a sexta-feira, das 11h00 às 14h00, somente para almoço.'],
    ['local', 'O RU da UNIFESSPA está localizado no campus da universidade, próximo ao bloco administrativo.'],
    ['preço', 'O preço do almoço no RU é subsidiado pela universidade, sendo muito acessível para estudantes.'],
    ['cardápio', 'O cardápio é variado e inclui arroz, feijão, proteína (carne ou frango), salada e sobremesa.'],
    ['funcionamento', 'O RU funciona de segunda a sexta-feira, das 11h00 às 14h00, servindo apenas almoço.']
  ]);

  // Sugestões inteligentes organizadas por categoria
  private readonly QUICK_SUGGESTIONS: QuickSuggestion[] = [
    { text: "Qual o horário de funcionamento?", category: "horario", priority: 1 },
    { text: "Quais são os preços?", category: "preco", priority: 1 },
    { text: "Onde fica localizado?", category: "localizacao", priority: 1 },
    { text: "Qual o cardápio de hoje?", category: "cardapio", priority: 2 },
    { text: "Como funciona o auxílio alimentação?", category: "programas", priority: 2 },
    { text: "Quais formas de pagamento aceitam?", category: "pagamento", priority: 2 },
    { text: "O RU funciona nos finais de semana?", category: "horario", priority: 3 },
    { text: "Tem opção vegetariana?", category: "cardapio", priority: 3 },
    { text: "Como funciona o cartão do estudante?", category: "pagamento", priority: 3 },
    { text: "Quais são os programas sociais?", category: "programas", priority: 3 }
  ];

  constructor() {
    // Configuração para Ollama rodando localmente
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'gemma2b';
    this.context = this.buildContext();
  }

  // Obter sugestões baseadas no contexto da conversa
  getContextualSuggestions(conversationHistory: ChatMessage[] = [], maxSuggestions: number = 5): QuickSuggestion[] {
    if (conversationHistory.length === 0) {
      // Retornar sugestões de maior prioridade para conversas novas
      return this.QUICK_SUGGESTIONS
        .filter(s => s.priority === 1)
        .slice(0, maxSuggestions);
    }

    // Analisar histórico para sugerir perguntas relacionadas
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return this.QUICK_SUGGESTIONS.slice(0, maxSuggestions);
    }

    const lastContent = lastMessage.content.toLowerCase();
    let relevantSuggestions: QuickSuggestion[] = [];

    // Identificar categoria da última pergunta
    if (lastContent.includes('horário') || lastContent.includes('funciona')) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.category === 'horario');
    } else if (lastContent.includes('preço') || lastContent.includes('custo')) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.category === 'preco');
    } else if (lastContent.includes('local') || lastContent.includes('onde')) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.category === 'localizacao');
    } else if (lastContent.includes('cardápio') || lastContent.includes('comida')) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.category === 'cardapio');
    } else if (lastContent.includes('pagamento') || lastContent.includes('cartão')) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.category === 'pagamento');
    } else if (lastContent.includes('auxílio') || lastContent.includes('programa')) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.category === 'programas');
    }

    // Se não encontrou sugestões específicas, retornar sugestões gerais
    if (relevantSuggestions.length === 0) {
      relevantSuggestions = this.QUICK_SUGGESTIONS.filter(s => s.priority <= 2);
    }

    return relevantSuggestions.slice(0, maxSuggestions);
  }

  private getLanguageInstruction(language: string): string {
    switch (language) {
      case 'en-US':
        return 'Always respond in English.';
      case 'es':
        return 'Siempre responde en español.';
      case 'fr':
        return 'Répondez toujours en français.';
      default:
        return 'Responda sempre em português brasileiro.';
    }
  }

  private buildContext(): string {
    return CONTEXT;
  }

  // Cache inteligente com TTL variável baseado no tipo de pergunta
  private getCacheTTL(questionType: string): number {
    switch (questionType) {
      case 'horario':
        return 24 * 60 * 60 * 1000; // 24h - horários mudam raramente
      case 'cardapio':
        return 60 * 60 * 1000; // 1h - cardápio pode mudar diariamente
      case 'preco':
        return 7 * 24 * 60 * 60 * 1000; // 7 dias - preços mudam raramente
      case 'localizacao':
        return 30 * 24 * 60 * 60 * 1000; // 30 dias - localização é fixa
      case 'programas':
        return 24 * 60 * 60 * 1000; // 24h - programas podem ter mudanças
      default:
        return 5 * 60 * 1000; // 5 min - padrão para outras perguntas
    }
  }

  // Identificar tipo de pergunta para cache inteligente
  private identifyQuestionType(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('horário') || lowerMessage.includes('funciona') || lowerMessage.includes('aberto')) {
      return 'horario';
    } else if (lowerMessage.includes('cardápio') || lowerMessage.includes('comida') || lowerMessage.includes('menu')) {
      return 'cardapio';
    } else if (lowerMessage.includes('preço') || lowerMessage.includes('custo') || lowerMessage.includes('valor')) {
      return 'preco';
    } else if (lowerMessage.includes('local') || lowerMessage.includes('onde') || lowerMessage.includes('endereço')) {
      return 'localizacao';
    } else if (lowerMessage.includes('auxílio') || lowerMessage.includes('programa') || lowerMessage.includes('bolsa')) {
      return 'programas';
    } else if (lowerMessage.includes('pagamento') || lowerMessage.includes('cartão') || lowerMessage.includes('pix')) {
      return 'pagamento';
    }
    
    return 'geral';
  }

  private getCachedResponse(message: string): string | null {
    const key = message.toLowerCase().trim();
    const cached = this.cache.get(key);
    
    if (cached && Date.now() < cached.expiresAt) {
      console.log('🚀 Resposta do cache encontrada!');
      return cached.response;
    }
    
    // Limpar cache expirado
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCachedResponse(message: string, response: string, questionType: string = 'geral'): void {
    const key = message.toLowerCase().trim();
    const now = Date.now();
    const ttl = this.getCacheTTL(questionType);
    
    this.cache.set(key, {
      response,
      timestamp: now,
      expiresAt: now + ttl,
      questionType,
      confidence: 0.9
    });
    
    // Limpar cache antigo se ficar muito grande
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.cleanupCache();
    }
  }

  // Limpeza inteligente do cache
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Ordenar por prioridade (menor TTL primeiro) e remover os mais antigos
    entries.sort((a, b) => {
      const aPriority = this.getCacheTTL(a[1].questionType);
      const bPriority = this.getCacheTTL(b[1].questionType);
      return aPriority - bPriority;
    });
    
    // Remover 20% dos itens mais antigos
    const itemsToRemove = Math.floor(this.cache.size * 0.2);
    for (let i = 0; i < itemsToRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`🧹 Cache limpo: ${itemsToRemove} itens removidos`);
  }

  private getQuickResponse(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, response] of this.COMMON_QUESTIONS) {
      if (lowerMessage.includes(keyword)) {
        console.log(`⚡ Resposta rápida para: ${keyword}`);
        return response;
      }
    }
    
    return null;
  }

  async generateResponse(message: string, language: string = 'pt-BR'): Promise<string> {
    console.log(`🤖 Gerando resposta com Gemma 2B para: ${message}`);
    
    // 1. Verificar cache primeiro
    const cached = this.getCachedResponse(message);
    if (cached) return cached;
    
    // 2. Verificar respostas rápidas
    const quickResponse = this.getQuickResponse(message);
    if (quickResponse) {
      const questionType = this.identifyQuestionType(message);
      this.setCachedResponse(message, quickResponse, questionType);
      return quickResponse;
    }
    
    // 3. Usar IA se necessário
    try {
      const languageInstruction = this.getLanguageInstruction(language);
      const prompt = this.buildPrompt(message, languageInstruction);
      const response = await this.callOllama(prompt);
      
      // Cache da resposta da IA com tipo identificado
      const questionType = this.identifyQuestionType(message);
      this.setCachedResponse(message, response, questionType);
      
      console.log('✅ Resposta gerada com sucesso');
      return response;
    } catch (error) {
      console.error('❌ Erro ao gerar resposta:', error);
      throw error;
    }
  }

  async generateResponseWithHistory(
    history: ChatMessage[], 
    language: string = 'pt-BR'
  ): Promise<string> {
    console.log(`🧠 Gerando resposta com histórico, mensagens: ${history.length}`);
    
    // Pegar a última mensagem do usuário
    const lastUserMessage = history[history.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user' || !lastUserMessage.content) {
      throw new Error('Mensagem do usuário não encontrada');
    }
    
    const message = lastUserMessage.content;
    
    // 1. Verificar cache primeiro
    const cacheKey = `${message}_${history.length}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;
    
    // 2. Verificar respostas rápidas para mensagens simples
    if (history.length <= 2) {
      const quickResponse = this.getQuickResponse(message);
      if (quickResponse) {
        const questionType = this.identifyQuestionType(message);
        this.setCachedResponse(cacheKey, quickResponse, questionType);
        return quickResponse;
      }
    }
    
    // 3. Usar IA com histórico
    try {
      const languageInstruction = this.getLanguageInstruction(language);
      const prompt = this.buildPromptWithHistory(history, languageInstruction);
      const response = await this.callOllama(prompt);
      
      // Cache da resposta da IA
      const questionType = this.identifyQuestionType(message);
      this.setCachedResponse(cacheKey, response, questionType);
      
      console.log('✅ Resposta com histórico gerada com sucesso');
      return response;
    } catch (error) {
      console.error('❌ Erro ao gerar resposta com histórico:', error);
      throw error;
    }
  }

  private buildPrompt(userMessage: string, languageInstruction: string): string {
    return `${this.context}\n\n${languageInstruction}\n\nPergunta do usuário: ${userMessage}\n\nResposta:`;
  }

  private buildPromptWithHistory(history: ChatMessage[], languageInstruction: string): string {
    let conversationHistory = `${this.context}\n\n${languageInstruction}\n\nHistórico da conversa:\n`;
    
    history.forEach((msg, index) => {
      if (index === 0) return; // Pular mensagem inicial do sistema
      const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
      conversationHistory += `${role}: ${msg.content}\n`;
    });
    
    // Última mensagem do usuário
    const lastUserMessage = history[history.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user' && lastUserMessage.content) {
      conversationHistory += `\nPergunta atual: ${lastUserMessage.content}\n\nResposta:`;
    }
    
    return conversationHistory;
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API Ollama: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'Desculpe, não consegui gerar uma resposta adequada.';
    } catch (error) {
      console.error('❌ Erro na chamada para Ollama:', error);
      throw new Error('Erro de conexão com o modelo local. Verifique se o Ollama está rodando.');
    }
  }

  // Método para verificar se o modelo está disponível
  async checkModelAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        return models.some((model: any) => model.name === this.model);
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade do modelo:', error);
      return false;
    }
  }

  // Método para baixar o modelo se não estiver disponível
  async downloadModel(): Promise<void> {
    try {
      console.log(`📥 Baixando modelo ${this.model}...`);
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao baixar modelo: ${response.status}`);
      }

      console.log(`✅ Modelo ${this.model} baixado com sucesso!`);
    } catch (error) {
      console.error('❌ Erro ao baixar modelo:', error);
      throw new Error(`Falha ao baixar o modelo ${this.model}`);
    }
  }

  // Método para obter estatísticas do cache
  getCacheStats(): { size: number; hitRate: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    let totalHits = 0;
    
    this.cache.forEach((value) => {
      types[value.questionType] = (types[value.questionType] || 0) + 1;
      if (Date.now() < value.expiresAt) {
        totalHits++;
      }
    });
    
    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      types
    };
  }
}

export const gemmaChatService = new GemmaChatService();
