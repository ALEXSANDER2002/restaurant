interface ChatInteraction {
  id: string;
  timestamp: number;
  message: string;
  response: string;
  responseTime: number;
  language: string;
  userAgent: string;
  sessionId: string;
}

interface UserFeedback {
  messageId: string;
  helpful: boolean;
  rating?: number;
  comment?: string;
  timestamp: number;
  sessionId: string;
}

interface ChatSession {
  id: string;
  startTime: number;
  endTime?: number;
  messageCount: number;
  language: string;
  userAgent: string;
  satisfactionScore?: number;
  topics: string[];
}

interface ChatMetrics {
  totalInteractions: number;
  averageResponseTime: number;
  satisfactionRate: number;
  popularTopics: Array<{ topic: string; count: number }>;
  languageDistribution: Record<string, number>;
  sessionMetrics: {
    averageSessionLength: number;
    averageMessagesPerSession: number;
    totalSessions: number;
  };
}

export class ChatAnalyticsService {
  private interactions: ChatInteraction[] = [];
  private feedback: UserFeedback[] = [];
  private sessions: Map<string, ChatSession> = new Map();
  private currentSessionId: string | null = null;
  private readonly MAX_STORAGE_SIZE = 1000;

  constructor() {
    this.initializeSession();
    this.loadFromStorage();
  }

  private initializeSession(): void {
    this.currentSessionId = this.generateSessionId();
    const session: ChatSession = {
      id: this.currentSessionId,
      startTime: Date.now(),
      messageCount: 0,
      language: 'pt-BR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      topics: []
    };
    this.sessions.set(this.currentSessionId, session);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      // Carregar dados do localStorage se disponível
      if (typeof window !== 'undefined') {
        const storedInteractions = localStorage.getItem('chat_interactions');
        const storedFeedback = localStorage.getItem('chat_feedback');
        const storedSessions = localStorage.getItem('chat_sessions');

        if (storedInteractions) {
          this.interactions = JSON.parse(storedInteractions);
        }
        if (storedFeedback) {
          this.feedback = JSON.parse(storedFeedback);
        }
        if (storedSessions) {
          const sessionsArray = JSON.parse(storedSessions);
          sessionsArray.forEach((session: ChatSession) => {
            this.sessions.set(session.id, session);
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_interactions', JSON.stringify(this.interactions));
        localStorage.setItem('chat_feedback', JSON.stringify(this.feedback));
        localStorage.setItem('chat_sessions', JSON.stringify(Array.from(this.sessions.values())));
      }
    } catch (error) {
      console.error('Erro ao salvar dados de analytics:', error);
    }
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Limpar interações antigas (mais de 7 dias)
    this.interactions = this.interactions.filter(
      interaction => now - interaction.timestamp < 7 * oneDay
    );

    // Limpar feedback antigo (mais de 30 dias)
    this.feedback = this.feedback.filter(
      feedback => now - feedback.timestamp < 30 * oneDay
    );

    // Limpar sessões antigas (mais de 30 dias)
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.endTime && now - session.endTime > 30 * oneDay) {
        this.sessions.delete(sessionId);
      }
    }

    // Limitar tamanho dos arrays
    if (this.interactions.length > this.MAX_STORAGE_SIZE) {
      this.interactions = this.interactions.slice(-this.MAX_STORAGE_SIZE);
    }
    if (this.feedback.length > this.MAX_STORAGE_SIZE) {
      this.feedback = this.feedback.slice(-this.MAX_STORAGE_SIZE);
    }
  }

  // Rastrear nova interação
  trackInteraction(
    message: string,
    response: string,
    responseTime: number,
    language: string = 'pt-BR'
  ): void {
    if (!this.currentSessionId) return;

    const interaction: ChatInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message,
      response,
      responseTime,
      language,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionId: this.currentSessionId
    };

    this.interactions.push(interaction);

    // Atualizar sessão atual
    const currentSession = this.sessions.get(this.currentSessionId);
    if (currentSession) {
      currentSession.messageCount++;
      currentSession.topics.push(this.identifyTopic(message));
    }

    this.saveToStorage();
    this.cleanupOldData();
  }

  // Rastrear feedback do usuário
  trackFeedback(
    messageId: string,
    helpful: boolean,
    rating?: number,
    comment?: string
  ): void {
    const feedback: UserFeedback = {
      messageId,
      helpful,
      rating,
      comment,
      timestamp: Date.now(),
      sessionId: this.currentSessionId || 'unknown'
    };

    this.feedback.push(feedback);
    this.saveToStorage();
  }

  // Finalizar sessão atual
  endCurrentSession(): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.endTime = Date.now();
      
      // Calcular score de satisfação baseado no feedback
      const sessionFeedback = this.feedback.filter(f => f.sessionId === this.currentSessionId);
      if (sessionFeedback.length > 0) {
        const helpfulCount = sessionFeedback.filter(f => f.helpful).length;
        session.satisfactionScore = helpfulCount / sessionFeedback.length;
      }
    }

    this.saveToStorage();
    this.initializeSession(); // Iniciar nova sessão
  }

  // Identificar tópico da mensagem
  private identifyTopic(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('horário') || lowerMessage.includes('funciona')) {
      return 'horario';
    } else if (lowerMessage.includes('cardápio') || lowerMessage.includes('comida')) {
      return 'cardapio';
    } else if (lowerMessage.includes('preço') || lowerMessage.includes('custo')) {
      return 'preco';
    } else if (lowerMessage.includes('local') || lowerMessage.includes('onde')) {
      return 'localizacao';
    } else if (lowerMessage.includes('auxílio') || lowerMessage.includes('programa')) {
      return 'programas';
    } else if (lowerMessage.includes('pagamento') || lowerMessage.includes('cartão')) {
      return 'pagamento';
    } else if (lowerMessage.includes('vegetariano') || lowerMessage.includes('vegano')) {
      return 'dietas_especiais';
    } else if (lowerMessage.includes('campus') || lowerMessage.includes('unifesspa')) {
      return 'institucional';
    }
    
    return 'outros';
  }

  // Obter métricas gerais
  getMetrics(): ChatMetrics {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Filtrar dados dos últimos 7 dias
    const recentInteractions = this.interactions.filter(
      interaction => now - interaction.timestamp < 7 * oneDay
    );

    // Calcular tempo médio de resposta
    const totalResponseTime = recentInteractions.reduce((sum, interaction) => sum + interaction.responseTime, 0);
    const averageResponseTime = recentInteractions.length > 0 ? totalResponseTime / recentInteractions.length : 0;

    // Calcular taxa de satisfação
    const recentFeedback = this.feedback.filter(
      feedback => now - feedback.timestamp < 7 * oneDay
    );
    const satisfactionRate = recentFeedback.length > 0 
      ? recentFeedback.filter(f => f.helpful).length / recentFeedback.length 
      : 0;

    // Calcular tópicos populares
    const topicCounts: Record<string, number> = {};
    recentInteractions.forEach(interaction => {
      const topic = this.identifyTopic(interaction.message);
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const popularTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calcular distribuição de idiomas
    const languageDistribution: Record<string, number> = {};
    recentInteractions.forEach(interaction => {
      languageDistribution[interaction.language] = (languageDistribution[interaction.language] || 0) + 1;
    });

    // Calcular métricas de sessão
    const completedSessions = Array.from(this.sessions.values()).filter(s => s.endTime);
    const averageSessionLength = completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => sum + (session.endTime! - session.startTime), 0) / completedSessions.length
      : 0;

    const averageMessagesPerSession = completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => sum + session.messageCount, 0) / completedSessions.length
      : 0;

    return {
      totalInteractions: recentInteractions.length,
      averageResponseTime,
      satisfactionRate,
      popularTopics,
      languageDistribution,
      sessionMetrics: {
        averageSessionLength,
        averageMessagesPerSession,
        totalSessions: completedSessions.length
      }
    };
  }

  // Obter insights específicos
  getInsights(): Array<{ type: string; message: string; priority: 'low' | 'medium' | 'high' }> {
    const metrics = this.getMetrics();
    const insights: Array<{ type: string; message: string; priority: 'low' | 'medium' | 'high' }> = [];

    // Análise de satisfação
    if (metrics.satisfactionRate < 0.7) {
      insights.push({
        type: 'satisfaction',
        message: 'Taxa de satisfação baixa. Considere revisar as respostas do chatbot.',
        priority: 'high'
      });
    }

    // Análise de tempo de resposta
    if (metrics.averageResponseTime > 3000) {
      insights.push({
        type: 'performance',
        message: 'Tempo de resposta alto. Considere otimizar o modelo de IA.',
        priority: 'medium'
      });
    }

    // Análise de tópicos populares
    const topTopic = metrics.popularTopics[0];
    if (topTopic && topTopic.count > metrics.totalInteractions * 0.3) {
      insights.push({
        type: 'usage',
        message: `Muitas perguntas sobre "${topTopic.topic}". Considere criar uma FAQ específica.`,
        priority: 'medium'
      });
    }

    // Análise de sessões
    if (metrics.sessionMetrics.averageMessagesPerSession < 2) {
      insights.push({
        type: 'engagement',
        message: 'Sessões muito curtas. Considere melhorar o engajamento do usuário.',
        priority: 'low'
      });
    }

    return insights;
  }

  // Exportar dados para análise
  exportData(): string {
    const exportData = {
      interactions: this.interactions,
      feedback: this.feedback,
      sessions: Array.from(this.sessions.values()),
      metrics: this.getMetrics(),
      insights: this.getInsights(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Limpar todos os dados (útil para testes)
  clearAllData(): void {
    this.interactions = [];
    this.feedback = [];
    this.sessions.clear();
    this.initializeSession();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_interactions');
      localStorage.removeItem('chat_feedback');
      localStorage.removeItem('chat_sessions');
    }
  }

  // Obter estatísticas em tempo real
  getRealTimeStats(): {
    activeSessions: number;
    interactionsToday: number;
    averageResponseTimeToday: number;
    satisfactionToday: number;
  } {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const activeSessions = Array.from(this.sessions.values()).filter(
      session => !session.endTime || (now - session.endTime) < oneDay
    ).length;

    const interactionsToday = this.interactions.filter(
      interaction => now - interaction.timestamp < oneDay
    ).length;

    const interactionsTodayData = this.interactions.filter(
      interaction => now - interaction.timestamp < oneDay
    );

    const averageResponseTimeToday = interactionsTodayData.length > 0
      ? interactionsTodayData.reduce((sum, interaction) => sum + interaction.responseTime, 0) / interactionsTodayData.length
      : 0;

    const feedbackToday = this.feedback.filter(
      feedback => now - feedback.timestamp < oneDay
    );

    const satisfactionToday = feedbackToday.length > 0
      ? feedbackToday.filter(f => f.helpful).length / feedbackToday.length
      : 0;

    return {
      activeSessions,
      interactionsToday,
      averageResponseTimeToday,
      satisfactionToday
    };
  }
}

export const chatAnalyticsService = new ChatAnalyticsService();
