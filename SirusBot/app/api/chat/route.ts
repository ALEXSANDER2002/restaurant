import { NextRequest, NextResponse } from 'next/server';
import { gemmaChatService } from '@/services/gemma-chat-service';
import { processChatMessage } from '@/services/mcp';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Nova requisição para API do chat');
    const { message, messages, language, sessionId, userId, useMCP = true } = await request.json();

    if (!message || typeof message !== 'string') {
      console.log('❌ Mensagem inválida recebida');
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    console.log('💬 Processando mensagem:', message);

    // Decidir qual sistema usar
    if (useMCP) {
      console.log('🎯 Usando sistema MCP');
      
      // Gerar sessionId se não fornecido
      const effectiveSessionId = sessionId || uuidv4();
      const userLanguage = language || 'pt-BR';

      try {
        // Processar com MCP
        const mcpResult = await processChatMessage(effectiveSessionId, message, {
          userId,
          language: userLanguage
        });

        console.log('✅ Resposta MCP gerada com sucesso');
        
        return NextResponse.json({
          response: mcpResult.response.text,
          sessionId: effectiveSessionId,
          intent: mcpResult.intentRecognition.intent,
          confidence: mcpResult.intentRecognition.confidence,
          suggestions: mcpResult.response.suggestions,
          entities: mcpResult.entities.entities,
          usedMCP: true,
          metrics: mcpResult.processingMetrics,
          metadata: mcpResult.response.metadata
        });
      } catch (mcpError) {
        console.error('❌ Erro no MCP, tentando fallback para Gemma:', mcpError);
        // Se MCP falhar, tentar Gemma
      }
    }

    // Fallback para sistema Gemma (antigo)
    console.log('🤖 Usando sistema Gemma (fallback)');
    let response: string;
    const userLanguage = language || 'pt-BR';
    
    if (messages && Array.isArray(messages) && messages.length > 1) {
      console.log('📚 Usando histórico de conversa');
      response = await gemmaChatService.generateResponseWithHistory(messages, userLanguage);
    } else {
      console.log('🆕 Primeira mensagem ou sem histórico');
      response = await gemmaChatService.generateResponse(message, userLanguage);
    }

    console.log('✅ Resposta gerada com sucesso via IA');
    return NextResponse.json({ 
      response, 
      aiGenerated: true,
      usedMCP: false,
      sessionId: sessionId || uuidv4()
    });
  } catch (error) {
    console.error('❌ Erro na API do chat:', error);
    console.log('🔄 Usando resposta de fallback...');
    
    // Resposta de fallback em caso de erro
    const fallbackResponse = 
      "Desculpe, estou com dificuldades técnicas no momento. " +
              "Posso ajudar com informações básicas sobre o RU: horários (11h-14h, apenas almoço), " +
              "preços (estudantes subsidiados R$ 2,00), localização (Campus UNIFESSPA), e cardápio diário. " +
      "Para mais informações, visite o campus ou entre em contato com a administração do RU.";

    return NextResponse.json({ 
      response: fallbackResponse,
      fallback: true,
      usedMCP: false
    });
  }
} 