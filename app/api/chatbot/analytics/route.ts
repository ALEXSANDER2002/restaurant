import { NextRequest, NextResponse } from 'next/server';
import { chatAnalyticsService } from '@/services/chat-analytics-service';

/**
 * API REST para analytics do chatbot
 * GET /api/chatbot/analytics
 * 
 * Permite que outros microserviços consultem métricas e analytics do chatbot
 */

function validateMicroserviceAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.MICROSERVICE_AUTH_TOKEN;

  if (!expectedToken) return true;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === expectedToken;
}

export async function GET(request: NextRequest) {
  try {
    if (!validateMicroserviceAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    const userId = searchParams.get('userId');

    // Buscar analytics
    const analytics = await chatAnalyticsService.getAnalytics({
      period,
      userId: userId || undefined,
    });

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('[ChatbotAPI] Erro ao buscar analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar analytics',
      },
      { status: 500 }
    );
  }
}

// POST - Registrar evento de analytics
export async function POST(request: NextRequest) {
  try {
    if (!validateMicroserviceAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event, userId, metadata } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Campo "event" é obrigatório' },
        { status: 400 }
      );
    }

    // Registrar evento
    await chatAnalyticsService.trackEvent({
      event,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Evento registrado com sucesso',
    });

  } catch (error) {
    console.error('[ChatbotAPI] Erro ao registrar evento:', error);
    
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar evento' },
      { status: 500 }
    );
  }
}

