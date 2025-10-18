import crypto from 'crypto'

/**
 * Valida a assinatura de um webhook do Mercado Pago
 * @param body - Corpo da requisição (string)
 * @param signature - Assinatura recebida no header
 * @param secret - Chave secreta do webhook
 * @returns true se a assinatura for válida
 */
export function validateMercadoPagoWebhook(
  body: string,
  signature: string | null | undefined,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('[WEBHOOK-VALIDATOR] Assinatura ou secret não fornecidos')
    return false
  }

  try {
    // Extrair a assinatura do header (formato: "v1=hash")
    const parts = signature.split('=')
    if (parts.length !== 2 || parts[0] !== 'v1') {
      console.warn('[WEBHOOK-VALIDATOR] Formato de assinatura inválido:', signature)
      return false
    }

    const receivedSignature = parts[1]

    // Gerar hash esperado
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    // Comparar assinaturas
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )

    if (!isValid) {
      console.warn('[WEBHOOK-VALIDATOR] Assinatura inválida')
      console.warn('[WEBHOOK-VALIDATOR] Recebida:', receivedSignature)
      console.warn('[WEBHOOK-VALIDATOR] Esperada:', expectedSignature)
    } else {
      console.log('[WEBHOOK-VALIDATOR] Assinatura válida ✅')
    }

    return isValid

  } catch (error) {
    console.error('[WEBHOOK-VALIDATOR] Erro ao validar assinatura:', error)
    return false
  }
}

/**
 * Extrai o corpo da requisição como string para validação
 */
export function getRequestBody(request: Request): Promise<string> {
  return request.text()
} 