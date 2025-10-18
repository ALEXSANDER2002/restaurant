import { NextRequest, NextResponse } from "next/server"
import { mercadoPagoClient } from "@/services/mercado-pago-client"

// GET - Obter tipos de documento disponíveis
export async function GET(req: NextRequest) {
  try {
    console.log('[IDENTIFICATION-TYPES] Obtendo tipos de documento')

    const types = await mercadoPagoClient.getIdentificationTypes()

    console.log('[IDENTIFICATION-TYPES] Tipos obtidos:', types.length)

    return NextResponse.json({
      success: true,
      identification_types: types
    })

  } catch (error: any) {
    console.error('[IDENTIFICATION-TYPES] Erro ao obter tipos de documento:', error)
    
    return NextResponse.json({ 
      erro: error.message || "Erro ao obter tipos de documento",
      success: false
    }, { status: 500 })
  }
} 