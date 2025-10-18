import { NextRequest, NextResponse } from 'next/server';
import { gemmaChatService } from '@/services/gemma-chat-service';

/**
 * API REST para enviar mensagens ao chatbot
 * POST /api/chatbot/message
 * 
 * Permite que outros microserviços (como SirusPag) enviem mensagens ao chatbot
 */

// Middleware para validar token de autenticação entre microserviços
function validateMicroserviceAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const microserviceHeader = request.headers.get('x-microservice');
  const expectedToken = process.env.MICROSERVICE_AUTH_TOKEN;

  if (!expectedToken) {
    console.warn('[ChatbotAPI] MICROSERVICE_AUTH_TOKEN não configurado');
    return true; // Em desenvolvimento, permite sem token
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === expectedToken && microserviceHeader !== undefined;
}

export async function POST(request: NextRequest) {
  try {
    // Validar autenticação entre microserviços
    if (!validateMicroserviceAuth(request)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Invalid microservice authentication' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, userId, context } = body;

    // Validar campos obrigatórios
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campo "message" é obrigatório e deve ser uma string' 
        },
        { status: 400 }
      );
    }

    // Processar mensagem com o chatbot
    const response = await gemmaChatService.sendMessage(message, {
      userId: userId || 'anonymous',
      context: context || {},
    });

    return NextResponse.json({
      success: true,
      data: {
        response: response.text,
        intent: response.intent,
        entities: response.entities,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[ChatbotAPI] Erro ao processar mensagem:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno ao processar mensagem',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Obter informações sobre o chatbot
export async function GET(request: NextRequest) {
  try {
    if (!validateMicroserviceAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        service: 'SirusBot',
        version: '1.0.0',
        status: 'online',
        model: process.env.OLLAMA_MODEL || 'gemma:2b',
        capabilities: [
          'natural_language_processing',
          'intent_recognition',
          'entity_extraction',
          'context_management',
          'conversation_analytics',
        ],
      },
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

