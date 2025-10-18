import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';

/**
 * Health Check endpoint
 * GET /api/health
 * 
 * Endpoint para verificar se o serviço está online e funcionando
 */

export async function GET() {
  try {
    // Verificar conexão com o banco de dados
    let dbStatus = 'unknown';
    try {
      await db.execute('SELECT 1');
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'unhealthy';
      console.error('[Health] Database check failed:', error);
    }

    // Verificar se SirusBot está acessível (opcional)
    const sirusBotUrl = process.env.SIRUSBOT_API_URL;
    let sirusBotStatus = 'not_configured';

    if (sirusBotUrl) {
      try {
        const sirusBotResponse = await fetch(sirusBotUrl.replace('/api', '/api/health'), {
          method: 'GET',
          signal: AbortSignal.timeout(2000), // 2 segundos timeout
        });
        sirusBotStatus = sirusBotResponse.ok ? 'connected' : 'unreachable';
      } catch (error) {
        sirusBotStatus = 'offline';
      }
    }

    // Verificar Mercado Pago (opcional)
    const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    let mercadoPagoStatus = mercadoPagoToken ? 'configured' : 'not_configured';

    const isHealthy = dbStatus === 'healthy';

    return NextResponse.json(
      {
        service: 'SirusPag',
        status: isHealthy ? 'healthy' : 'degraded',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: {
          database: dbStatus,
          sirusBot: sirusBotStatus,
          mercadoPago: mercadoPagoStatus,
        },
        environment: process.env.NODE_ENV || 'development',
      },
      { status: isHealthy ? 200 : 503 }
    );

  } catch (error) {
    console.error('[Health] Erro no health check:', error);
    
    return NextResponse.json(
      {
        service: 'SirusPag',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

