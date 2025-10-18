/**
 * Cliente HTTP para comunicação com o microserviço SirusPag
 * 
 * Este serviço permite que o SirusBot consulte informações do SirusPag
 * como cardápio, pedidos, tickets, etc.
 */

const SIRUSPAG_API_URL = process.env.SIRUSPAG_API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN = process.env.MICROSERVICE_AUTH_TOKEN || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Classe base para comunicação com SirusPag
 */
class SirusPagClient {
  private baseURL: string;
  private authToken: string;

  constructor() {
    this.baseURL = SIRUSPAG_API_URL;
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
          'X-Microservice': 'SirusBot',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`[SirusPagClient] Erro na requisição para ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ==========================================
  // CARDÁPIO
  // ==========================================

  /**
   * Busca o cardápio da semana
   */
  async getCardapioSemana() {
    return this.request('/cardapio/semana', {
      method: 'GET',
    });
  }

  /**
   * Busca o cardápio de um dia específico
   */
  async getCardapioDia(data: string) {
    return this.request(`/cardapio/dia?data=${data}`, {
      method: 'GET',
    });
  }

  /**
   * Busca o cardápio de hoje
   */
  async getCardapioHoje() {
    return this.request('/cardapio/hoje', {
      method: 'GET',
    });
  }

  // ==========================================
  // TICKETS
  // ==========================================

  /**
   * Consulta informações de um ticket
   */
  async getTicket(ticketId: string) {
    return this.request(`/tickets/${ticketId}`, {
      method: 'GET',
    });
  }

  /**
   * Verifica se um ticket é válido
   */
  async validarTicket(ticketId: string) {
    return this.request(`/tickets/${ticketId}/validar`, {
      method: 'POST',
    });
  }

  /**
   * Lista tickets de um usuário
   */
  async getTicketsUsuario(usuarioId: string) {
    return this.request(`/tickets?usuarioId=${usuarioId}`, {
      method: 'GET',
    });
  }

  // ==========================================
  // PEDIDOS
  // ==========================================

  /**
   * Consulta status de um pedido
   */
  async getPedido(pedidoId: string) {
    return this.request(`/pedidos/${pedidoId}`, {
      method: 'GET',
    });
  }

  /**
   * Lista pedidos de um usuário
   */
  async getPedidosUsuario(usuarioId: string) {
    return this.request(`/pedidos?usuarioId=${usuarioId}`, {
      method: 'GET',
    });
  }

  // ==========================================
  // PAGAMENTOS
  // ==========================================

  /**
   * Verifica status de um pagamento
   */
  async getStatusPagamento(paymentId: string) {
    return this.request(`/pagamentos/${paymentId}`, {
      method: 'GET',
    });
  }

  /**
   * Cria um novo pagamento
   */
  async criarPagamento(data: {
    usuarioId: string;
    valor: number;
    descricao: string;
  }) {
    return this.request('/pagamentos/criar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // USUÁRIOS
  // ==========================================

  /**
   * Busca informações de um usuário
   */
  async getUsuario(usuarioId: string) {
    return this.request(`/usuarios/${usuarioId}`, {
      method: 'GET',
    });
  }

  /**
   * Verifica saldo de um usuário
   */
  async getSaldoUsuario(usuarioId: string) {
    return this.request(`/usuarios/${usuarioId}/saldo`, {
      method: 'GET',
    });
  }

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  /**
   * Busca estatísticas gerais do sistema
   */
  async getEstatisticas() {
    return this.request('/admin/estatisticas', {
      method: 'GET',
    });
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  /**
   * Verifica se o serviço SirusPag está online
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'X-Microservice': 'SirusBot',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('[SirusPagClient] SirusPag offline:', error);
      return false;
    }
  }
}

// Singleton instance
export const sirusPagClient = new SirusPagClient();

// Tipos úteis para integração
export interface Cardapio {
  id: string;
  data: string;
  tipo: 'almoco' | 'jantar';
  pratoPrincipal: string;
  guarnicao: string;
  salada: string;
  sobremesa: string;
  suco: string;
}

export interface Ticket {
  id: string;
  usuarioId: string;
  tipo: 'almoco' | 'jantar';
  data: string;
  usado: boolean;
  qrCode: string;
}

export interface Pedido {
  id: string;
  usuarioId: string;
  ticketId: string;
  status: 'pendente' | 'pago' | 'usado' | 'cancelado';
  valor: number;
  createdAt: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  saldo: number;
}

