import { NextRequest, NextResponse } from 'next/server';
import { geminiChatService } from '@/services/gemini-chat-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Nova requisição para API do chat');
    const { message, messages } = await request.json();

    if (!message || typeof message !== 'string') {
      console.log('❌ Mensagem inválida recebida');
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    console.log('💬 Processando mensagem:', message);
    
    // Se temos histórico de mensagens, usa o contexto completo
    let response: string;
    if (messages && Array.isArray(messages) && messages.length > 1) {
      console.log('📚 Usando histórico de conversa');
      response = await geminiChatService.generateResponseWithHistory(messages);
    } else {
      console.log('🆕 Primeira mensagem ou sem histórico');
      response = await geminiChatService.generateResponse(message);
    }

    console.log('✅ Resposta gerada com sucesso via IA');
    return NextResponse.json({ response, aiGenerated: true });
  } catch (error) {
    console.error('❌ Erro na API do chat:', error);
    console.log('🔄 Usando resposta de fallback...');
    
    // Resposta de fallback em caso de erro
    const fallbackResponse = 
      "Desculpe, estou com dificuldades técnicas no momento. " +
      "Posso ajudar com informações básicas sobre o RU: horários (11h-14h e 17h-19h30), " +
      "preços (estudantes R$ 3,00), localização (Campus UNIFESSPA), e cardápio diário. " +
      "Para mais informações, visite o campus ou entre em contato com a administração do RU.";

    return NextResponse.json({ 
      response: fallbackResponse,
      fallback: true 
    });
  }
} 