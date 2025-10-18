import { NextResponse } from "next/server"

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
    
    if (!publicKey) {
      return NextResponse.json({ 
        error: "Public key não configurada" 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      publicKey,
      success: true 
    })
  } catch (error) {
    console.error('Erro ao obter public key:', error)
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 })
  }
} 