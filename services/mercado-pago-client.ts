import { MercadoPagoConfig, Payment, Preference } from "mercadopago"

// Mapeamento de status do Mercado Pago para o sistema
export const MP_STATUS_MAPPING = {
  approved: "aprovado",
  pending: "pendente",
  in_process: "processando",
  rejected: "rejeitado",
  cancelled: "cancelado",
  refunded: "reembolsado",
  charged_back: "estornado",
} as const

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
  options: {
    timeout: 5000,
  },
})

// Cliente para gerenciar pagamentos
const payment = new Payment(client)

// Cliente para gerenciar preferências de checkout
const preference = new Preference(client)

export const mercadoPagoClient = {
  // Criar preferência de pagamento
  async createPreference(data: any) {
    try {
      return await preference.create({ body: data })
    } catch (error) {
      console.error("[MercadoPago] Erro ao criar preferência:", error)
      throw error
    }
  },

  // Obter informações de um pagamento
  async getPayment(paymentId: string) {
    try {
      return await payment.get({ id: paymentId })
    } catch (error) {
      console.error("[MercadoPago] Erro ao obter pagamento:", error)
      throw error
    }
  },

  // Obter tipos de identificação disponíveis
  async getIdentificationTypes() {
    try {
      const response = await fetch(
        "https://api.mercadopago.com/v1/identification_types",
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }
      )
      return await response.json()
    } catch (error) {
      console.error("[MercadoPago] Erro ao obter tipos de identificação:", error)
      throw error
    }
  },

  // Obter métodos de pagamento disponíveis
  async getPaymentMethods() {
    try {
      const response = await fetch(
        "https://api.mercadopago.com/v1/payment_methods",
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }
      )
      return await response.json()
    } catch (error) {
      console.error("[MercadoPago] Erro ao obter métodos de pagamento:", error)
      throw error
    }
  },
}

