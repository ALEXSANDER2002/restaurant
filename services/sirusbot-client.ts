/**
 * Cliente HTTP para comunicação com o microserviço SirusBot
 * 
 * Este serviço permite que o SirusPag envie mensagens ao chatbot
 * e consulte analytics.
 */

const SIRUSBOT_API_URL = process.env.SIRUSBOT_API_URL || 'http://localhost:3001/api';
const AUTH_TOKEN = process.env.MICROSERVICE_AUTH_TOKEN || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ChatMessage {
  message: string;
  userId?: string;
  context?: Record<string, any>;
}

interface ChatResponse {
  response: string;
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  timestamp: string;
}

interface ChatbotInfo {
  service: string;
  version: string;
  status: string;
  model: string;
  capabilities: string[];
}

interface Analytics {
  totalConversations: number;
  totalMessages: number;
  averageMessagesPerConversation: number;
  topIntents: Array<{ intent: string; count: number }>;
  satisfactionRate: number;
  period: string;
}

/**
 * Classe para comunicação com SirusBot
 */
class SirusBotClient {
  private baseURL: string;
  private authToken: string;

  constructor() {
    this.baseURL = SIRUSBOT_API_URL;
    this.authToken = AUTH_TOKEN;
  }

  /**
   * Método genérico para fazer requisições HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'X-Microservice': 'SirusPag',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error(`[SirusBotClient] Erro na requisição para ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ==========================================
  // CHAT
  // ==========================================

  /**
   * Envia uma mensagem ao chatbot
   */
  async sendMessage(data: ChatMessage): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Obtém informações sobre o chatbot
   */
  async getChatbotInfo(): Promise<ApiResponse<ChatbotInfo>> {
    return this.request<ChatbotInfo>('/chatbot/message', {
      method: 'GET',
    });
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  /**
   * Busca analytics do chatbot
   */
  async getAnalytics(period: string = '7d', userId?: string): Promise<ApiResponse<Analytics>> {
    const params = new URLSearchParams({ period });
    if (userId) params.append('userId', userId);
    
    return this.request<Analytics>(`/chatbot/analytics?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Registra um evento no chatbot
   */
  async trackEvent(data: {
    event: string;
    userId?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/chatbot/analytics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  /**
   * Verifica se o serviço SirusBot está online
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/api/health`, {
        method: 'GET',
        headers: {
          'X-Microservice': 'SirusPag',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('[SirusBotClient] SirusBot offline:', error);
      return false;
    }
  }

  // ==========================================
  // HELPERS ESPECÍFICOS
  // ==========================================

  /**
   * Envia notificação de compra de ticket ao chatbot
   */
  async notifyTicketPurchase(data: {
    userId: string;
    ticketId: string;
    tipo: string;
    valor: number;
  }) {
    return this.trackEvent({
      event: 'ticket_purchased',
      userId: data.userId,
      metadata: {
        ticketId: data.ticketId,
        ticketType: data.tipo,
        value: data.valor,
        source: 'siruspag',
      },
    });
  }

  /**
   * Envia notificação de pagamento ao chatbot
   */
  async notifyPayment(data: {
    userId: string;
    paymentId: string;
    status: string;
    valor: number;
  }) {
    return this.trackEvent({
      event: 'payment_status',
      userId: data.userId,
      metadata: {
        paymentId: data.paymentId,
        status: data.status,
        value: data.valor,
        source: 'siruspag',
      },
    });
  }

  /**
   * Processa pergunta do usuário através do chatbot
   */
  async processQuestion(question: string, userId: string, context?: Record<string, any>) {
    return this.sendMessage({
      message: question,
      userId,
      context: {
        ...context,
        source: 'siruspag',
      },
    });
  }
}

// Singleton instance
export const sirusBotClient = new SirusBotClient();

