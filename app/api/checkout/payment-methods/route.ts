import { NextRequest, NextResponse } from "next/server"
import { mercadoPagoClient } from "@/services/mercado-pago-client"

// GET - Obter métodos de pagamento disponíveis
export async function GET(req: NextRequest) {
  try {
    console.log('[PAYMENT-METHODS] Obtendo métodos de pagamento')

    const methods = await mercadoPagoClient.getPaymentMethods()
    console.log('[PAYMENT-METHODS] Resposta da API:', methods)
    
    // Verificar se methods é um array, se não for, tentar acessar a propriedade correta
    const methodsArray = Array.isArray(methods) ? methods : (methods as any)?.results || []
    
    // Filtrar apenas os métodos que queremos suportar
    const supportedMethods = methodsArray.filter((method: any) => 
      ['credit_card', 'debit_card', 'pix', 'bolbradesco'].includes(method.id)
    )

    // Organizar métodos por categoria
    const organizedMethods = {
      cards: supportedMethods.filter((method: any) => 
        ['credit_card', 'debit_card'].includes(method.id)
      ),
      instant: supportedMethods.filter((method: any) => 
        method.id === 'pix'
      ),
      offline: supportedMethods.filter((method: any) => 
        method.id === 'bolbradesco'
      )
    }

    console.log('[PAYMENT-METHODS] Métodos obtidos:', {
      total: supportedMethods.length,
      cards: organizedMethods.cards.length,
      instant: organizedMethods.instant.length,
      offline: organizedMethods.offline.length
    })

    return NextResponse.json({
      success: true,
      payment_methods: supportedMethods,
      organized: organizedMethods
    })

  } catch (error: any) {
    console.error('[PAYMENT-METHODS] Erro ao obter métodos de pagamento:', error)
    
    return NextResponse.json({ 
      erro: error.message || "Erro ao obter métodos de pagamento",
      success: false
    }, { status: 500 })
  }
} 