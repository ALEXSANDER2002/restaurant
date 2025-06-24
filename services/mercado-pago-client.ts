import { MercadoPagoConfig, Payment } from 'mercadopago';
import "server-only";

// Função para obter configurações em runtime
function getConfig() {
  const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  const PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || '';
  
  if (!ACCESS_TOKEN) {
    console.warn('MERCADO_PAGO_ACCESS_TOKEN não está definido nas variáveis de ambiente');
  }
  
  return { ACCESS_TOKEN, PUBLIC_KEY };
}

// Interface para dados do pagamento
export interface CheckoutTransparenteParams {
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  token?: string; // Para cartões
  installments?: number;
  issuerId?: string;
  payer: {
    email: string;
    firstName?: string;
    lastName?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  campus: string;
  externalReference: string;
}

// Interface para resposta do pagamento
export interface PaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  transaction_details?: {
    qr_code_base64?: string;
    qr_code?: string;
    ticket_url?: string;
  };
  point_of_interaction?: {
    transaction_data?: {
      qr_code_base64?: string;
      qr_code?: string;
      ticket_url?: string;
    };
  };
}

// Classe principal do Mercado Pago
export class MercadoPagoClient {
  private client: MercadoPagoConfig;
  private payment: Payment;

  constructor() {
    const { ACCESS_TOKEN } = getConfig();
    
    this.client = new MercadoPagoConfig({
      accessToken: ACCESS_TOKEN,
    });
    
    this.payment = new Payment(this.client);
  }

  // Método principal para criar pagamentos
  async createPayment(params: CheckoutTransparenteParams): Promise<PaymentResponse> {
    try {
      console.log('[MERCADO-PAGO] Criando pagamento transparente:', {
        amount: params.transactionAmount,
        method: params.paymentMethodId,
        payer: params.payer.email,
        campus: params.campus
      });

      // Preparar dados do pagamento
      const paymentData: any = {
        transaction_amount: params.transactionAmount,
        description: params.description,
        payment_method_id: params.paymentMethodId,
        payer: {
          email: params.payer.email,
          ...(params.payer.firstName && { first_name: params.payer.firstName }),
          ...(params.payer.lastName && { last_name: params.payer.lastName }),
          ...(params.payer.identification && { identification: params.payer.identification })
        },
        external_reference: params.externalReference,
        metadata: {
          campus: params.campus
        }
      };

      // Se for cartão, adicionar dados específicos
      if (params.token) {
        paymentData.token = params.token;
        paymentData.installments = params.installments || 1;
        if (params.issuerId) {
          paymentData.issuer_id = params.issuerId;
        }
        
        console.log('[MERCADO-PAGO] Dados do cartão:', {
          token: params.token,
          installments: paymentData.installments,
          issuer_id: paymentData.issuer_id,
          payment_method_id: paymentData.payment_method_id
        });
      }

      console.log('[MERCADO-PAGO] Dados finais do pagamento:', JSON.stringify(paymentData, null, 2));

      // Criar o pagamento
      const result = await this.payment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey: `${params.externalReference}_${Date.now()}`
        }
      });

      console.log('[MERCADO-PAGO] Pagamento criado:', result.id);

      return result as PaymentResponse;
    } catch (error: any) {
      console.error('[MERCADO-PAGO] Erro detalhado ao criar pagamento:', error);
      
      // Capturar detalhes específicos do erro do Mercado Pago
      if (error.cause && Array.isArray(error.cause)) {
        const mpErrors = error.cause.map((err: any) => `${err.code}: ${err.description}`).join(', ');
        throw new Error(`Erro no Mercado Pago: ${mpErrors}`);
      }
      
      if (error.message) {
        throw new Error(`Erro no Mercado Pago: ${error.message}`);
      }
      
      throw new Error(`Erro no Mercado Pago: ${JSON.stringify(error)}`);
    }
  }

  // Obter métodos de pagamento disponíveis
  async getPaymentMethods() {
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${getConfig().ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[MERCADO-PAGO] Métodos de pagamento obtidos:', data);
      
      return data;
    } catch (error) {
      console.error('[MERCADO-PAGO] Erro ao obter métodos de pagamento:', error);
      throw error;
    }
  }

  // Obter tipos de documento
  async getIdentificationTypes() {
    try {
      const response = await fetch('https://api.mercadopago.com/v1/identification_types', {
        headers: {
          'Authorization': `Bearer ${getConfig().ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[MERCADO-PAGO] Tipos de documento obtidos:', data);
      
      return data;
    } catch (error) {
      console.error('[MERCADO-PAGO] Erro ao obter tipos de documento:', error);
      throw error;
    }
  }

  // Obter detalhes do pagamento
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const result = await this.payment.get({ id: paymentId });
      return result as PaymentResponse;
    } catch (error) {
      console.error('[MERCADO-PAGO] Erro ao obter pagamento:', error);
      throw error;
    }
  }
}

// Instância singleton
export const mercadoPagoClient = new MercadoPagoClient();

// Exportar constantes úteis
export const MP_STATUS_MAPPING = {
  'pending': 'pendente',
  'approved': 'pago',
  'authorized': 'pago',
  'in_process': 'pendente',
  'in_mediation': 'pendente',
  'rejected': 'cancelado',
  'cancelled': 'cancelado',
  'refunded': 'cancelado',
  'charged_back': 'cancelado'
} as const;

// Exportar função para obter chave pública
export function getPublicKey(): string {
  const { PUBLIC_KEY } = getConfig();
  return PUBLIC_KEY;
} 