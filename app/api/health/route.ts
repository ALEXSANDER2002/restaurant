import { NextResponse } from 'next/server';

/**
 * Health Check endpoint
 * GET /api/health
 * 
 * Endpoint para verificar se o serviço está online e funcionando
 */

export async function GET() {
  try {
    // Verificar se o Ollama está acessível
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    let ollamaStatus = 'unknown';

    try {
      const ollamaResponse = await fetch(`${ollamaHost}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 segundos timeout
      });
      ollamaStatus = ollamaResponse.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      ollamaStatus = 'offline';
    }

    // Verificar se SirusPag está acessível (opcional)
    const sirusPagUrl = process.env.SIRUSPAG_API_URL;
    let sirusPagStatus = 'not_configured';

    if (sirusPagUrl) {
      try {
        const sirusPagResponse = await fetch(sirusPagUrl.replace('/api', '/health'), {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        sirusPagStatus = sirusPagResponse.ok ? 'connected' : 'unreachable';
      } catch (error) {
        sirusPagStatus = 'offline';
      }
    }

    const isHealthy = ollamaStatus === 'healthy';

    return NextResponse.json(
      {
        service: 'SirusBot',
        status: isHealthy ? 'healthy' : 'degraded',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: {
          ollama: ollamaStatus,
          sirusPag: sirusPagStatus,
        },
        environment: process.env.NODE_ENV || 'development',
      },
      { status: isHealthy ? 200 : 503 }
    );

  } catch (error) {
    console.error('[Health] Erro no health check:', error);
    
    return NextResponse.json(
      {
        service: 'SirusBot',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

