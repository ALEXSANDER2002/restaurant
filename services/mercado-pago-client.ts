import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
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

// Configurar cliente (apenas se o token estiver disponível)
let client: MercadoPagoConfig | null = null;
let preference: Preference | null = null;
let payment: Payment | null = null;

// Função para inicializar o cliente se necessário
function initializeClient() {
  const { ACCESS_TOKEN } = getConfig();
  
  if (!client && ACCESS_TOKEN) {
    client = new MercadoPagoConfig({ 
      accessToken: ACCESS_TOKEN,
      options: { 
        timeout: 5000,
        integratorId: process.env.MERCADO_PAGO_INTEGRATOR_ID || 'dev_24c65fb163bf11ea96500242ac130004'
      } 
    });
    
    preference = new Preference(client);
    payment = new Payment(client);
  }
}

// Interfaces simplificadas
export interface CreatePreferenceRequest {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
    description?: string;
  }>;
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: number;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
  metadata?: Record<string, any>;
}

class MercadoPagoClient {
  /**
   * Cria uma preferência de pagamento (Checkout Pro)
   */
  async createPreference(request: any): Promise<any> {
    initializeClient();
    
    if (!preference) {
      throw new Error('Cliente do Mercado Pago não foi configurado. Verifique as credenciais.');
    }

    try {
      console.log('[MERCADO-PAGO] Criando preferência de pagamento:', {
        items: request.items?.length,
        external_reference: request.external_reference
      });

      const result = await preference.create({
        body: request
      });

      console.log('[MERCADO-PAGO] Preferência criada com sucesso:', {
        id: result.id,
        init_point: result.init_point
      });

      return result;
    } catch (error: any) {
      console.error('[MERCADO-PAGO] Erro ao criar preferência:', error);
      throw new Error(`Erro no Mercado Pago: ${error.message}`);
    }
  }

  /**
   * Consulta um pagamento pelo ID
   */
  async getPayment(paymentId: string): Promise<any> {
    initializeClient();
    
    if (!payment) {
      throw new Error('Cliente do Mercado Pago não foi configurado. Verifique as credenciais.');
    }

    try {
      console.log('[MERCADO-PAGO] Consultando pagamento:', paymentId);

      const result = await payment.get({
        id: paymentId
      });

      console.log('[MERCADO-PAGO] Pagamento consultado:', {
        id: result.id,
        status: result.status,
        external_reference: result.external_reference
      });

      return result;
    } catch (error: any) {
      console.error('[MERCADO-PAGO] Erro ao consultar pagamento:', error);
      throw new Error(`Erro no Mercado Pago: ${error.message}`);
    }
  }

  /**
   * Busca uma preferência pelo ID
   */
  async getPreference(preferenceId: string): Promise<any> {
    initializeClient();
    
    if (!preference) {
      throw new Error('Cliente do Mercado Pago não foi configurado. Verifique as credenciais.');
    }

    try {
      console.log('[MERCADO-PAGO] Consultando preferência:', preferenceId);

      const result = await preference.get({
        preferenceId: preferenceId
      });

      console.log('[MERCADO-PAGO] Preferência consultada:', {
        id: result.id,
        external_reference: result.external_reference
      });

      return result;
    } catch (error: any) {
      console.error('[MERCADO-PAGO] Erro ao consultar preferência:', error);
      throw new Error(`Erro no Mercado Pago: ${error.message}`);
    }
  }
}

// Instância do cliente
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