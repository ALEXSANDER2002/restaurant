/**
 * Orquestrador MCP Principal
 * Coordena todos os serviços MCP e gerencia o fluxo de processamento
 */

import {
  MCPConfig,
  MCPProcessingResult,
  MCPResponse,
  Intent,
  DialogState,
  ResponseType
} from '@/types/mcp.types';

import { intentRecognitionService } from './intent-recognition.service';
import { entityExtractionService } from './entity-extraction.service';
import { dialogContextService } from './dialog-context.service';
import { dialogManagerService } from './dialog-manager.service';
import { toolManagerService } from './tool-manager.service';
import { getResponseByKeywords } from '@/lib/chat-responses';

/**
 * Orquestrador MCP - Coordena todo o sistema
 */
export class MCPOrchestratorService {
  private config: MCPConfig = {
    language: 'pt-BR',
    minConfidenceThreshold: 0.3,
    maxConversationHistory: 50,
    enableContextualMemory: true,
    enableMultiTurn: true,
    enableToolUse: true,
    fallbackEnabled: true,
    cacheEnabled: true,
    debugMode: false
  };

  /**
   * Processa uma mensagem do usuário através de todo o pipeline MCP
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    userId?: string,
    language?: string
  ): Promise<MCPProcessingResult> {
    const startTime = Date.now();
    console.log('🚀 MCP Orquestrador iniciando processamento...');

    // Atualizar configuração de linguagem se fornecida
    if (language) {
      this.config.language = language;
    }

    try {
      // 1. Obter ou criar contexto
      const context = dialogContextService.getOrCreateContext(
        sessionId,
        this.config.language,
        userId
      );

      // 2. Reconhecimento de Intenção
      const intentStartTime = Date.now();
      const intentRecognition = await intentRecognitionService.recognize(
        userMessage,
        context
      );
      const intentTime = Date.now() - intentStartTime;

      console.log(`🎯 Intenção: ${intentRecognition.intent} (${intentRecognition.confidence.toFixed(2)})`);

      // 3. Extração de Entidades
      const entityStartTime = Date.now();
      const entityExtraction = await entityExtractionService.extract(userMessage);
      const entityTime = Date.now() - entityStartTime;

      console.log(`🔍 Entidades extraídas: ${entityExtraction.entities.length}`);

      // 4. Atualizar Contexto
      dialogContextService.updateContext(
        sessionId,
        userMessage,
        intentRecognition.intent,
        entityExtraction.entities
      );

      // 5. Verificar se precisamos usar ferramentas
      let toolResults: any[] = [];
      if (this.config.enableToolUse) {
        const suggestedTools = toolManagerService.suggestTools(intentRecognition.intent);
        
        for (const toolId of suggestedTools) {
          try {
            const toolResult = await toolManagerService.executeTool(
              toolId,
              this.extractToolParams(entityExtraction.entities),
              context
            );
            
            if (toolResult.success) {
              toolResults.push({
                toolId,
                data: toolResult.data
              });
            }
          } catch (error) {
            console.error(`❌ Erro ao executar ferramenta ${toolId}:`, error);
          }
        }
      }

      // 6. Gerenciamento de Diálogo e Geração de Resposta
      const dialogStartTime = Date.now();
      let response: MCPResponse;

      // Verificar se precisamos de clarificação
      const missingSlots = dialogContextService.getMissingRequiredSlots(sessionId);
      
      if (missingSlots.length > 0 && this.config.enableMultiTurn) {
        // Precisa de mais informações
        context.dialogState = DialogState.COLETANDO_INFORMACOES;
        response = await this.generateClarificationResponse(
          missingSlots,
          intentRecognition.intent,
          context
        );
      } else {
        // Tem todas as informações necessárias
        context.dialogState = DialogState.AGUARDANDO_RESPOSTA;
        response = await dialogManagerService.generateResponse(
          intentRecognition.intent,
          context,
          intentRecognition.confidence
        );

        // Enriquecer resposta com dados das ferramentas
        if (toolResults.length > 0) {
          response = this.enrichResponseWithToolData(response, toolResults);
        }
      }

      const dialogTime = Date.now() - dialogStartTime;

      // 7. Atualizar contexto com a resposta do bot
      dialogContextService.updateContext(
        sessionId,
        userMessage,
        intentRecognition.intent,
        entityExtraction.entities,
        response.text
      );

      // 8. Aplicar fallback se necessário e confiança muito baixa
      if (
        this.config.fallbackEnabled &&
        intentRecognition.confidence < this.config.minConfidenceThreshold
      ) {
        console.log('⚠️ Confiança baixa, usando fallback...');
        const fallbackResponse = getResponseByKeywords(userMessage);
        response.text = fallbackResponse;
        response.metadata = response.metadata || {};
        response.metadata.fallbackUsed = true;
      }

      const totalTime = Date.now() - startTime;

      console.log(`✅ Processamento MCP concluído em ${totalTime}ms`);

      return {
        response,
        context,
        intentRecognition,
        entities: entityExtraction,
        processingMetrics: {
          totalTime,
          intentRecognitionTime: intentTime,
          entityExtractionTime: entityTime,
          dialogManagementTime: dialogTime,
          responseGenerationTime: dialogTime
        }
      };
    } catch (error) {
      console.error('❌ Erro no processamento MCP:', error);
      
      // Resposta de erro
      return this.generateErrorResult(
        sessionId,
        userMessage,
        error instanceof Error ? error.message : 'Erro desconhecido',
        Date.now() - startTime
      );
    }
  }

  /**
   * Gera resposta de clarificação
   */
  private async generateClarificationResponse(
    missingSlots: any[],
    intent: Intent,
    context: any
  ): Promise<MCPResponse> {
    const slotQuestions: Record<string, string> = {
      'restricao_alimentar': 'Qual é sua restrição alimentar específica?',
      'campus': 'Para qual campus você gostaria de saber?',
      'data': 'Para qual data você precisa da informação?',
      'dia_semana': 'Para qual dia da semana?',
      'horario': 'Para qual horário específico?'
    };

    const firstMissing = missingSlots[0];
    const question = slotQuestions[firstMissing.name] || 
      'Preciso de mais informações. Pode me ajudar com mais detalhes?';

    return {
      text: question,
      type: ResponseType.CLARIFICATION,
      intent,
      confidence: 0.8,
      requiresAction: true,
      suggestions: this.getContextualSuggestions(intent),
      metadata: {
        missingSlots: missingSlots.map((s: any) => s.name)
      }
    };
  }

  /**
   * Enriquece resposta com dados das ferramentas
   */
  private enrichResponseWithToolData(
    response: MCPResponse,
    toolResults: any[]
  ): MCPResponse {
    if (toolResults.length === 0) return response;

    let enrichedText = response.text;

    // Processar resultados das ferramentas
    for (const result of toolResults) {
      if (result.toolId === 'get_daily_menu' && result.data) {
        enrichedText += `\n\n📅 **Cardápio de hoje:**\n`;
        result.data.items.forEach((item: any) => {
          enrichedText += `• ${item.category}: ${item.item}\n`;
        });
        if (result.data.vegetarian) {
          enrichedText += `\n🥗 Opção vegetariana: ${result.data.vegetarian}`;
        }
      } else if (result.toolId === 'check_queue_status' && result.data) {
        enrichedText += `\n\n⏱️ **Status da fila:** ${result.data.status}\n`;
        if (result.data.estimatedWait > 0) {
          enrichedText += `Tempo estimado: ${result.data.estimatedWait} minutos\n`;
        }
        enrichedText += result.data.bestTime;
      } else if (result.toolId === 'calculate_meal_cost' && result.data) {
        enrichedText += `\n\n💰 **Cálculo:**\n`;
        enrichedText += `• Quantidade: ${result.data.quantity} refeição(ões)\n`;
        enrichedText += `• Preço unitário: R$ ${result.data.pricePerMeal.toFixed(2)}\n`;
        enrichedText += `• **Total: ${result.data.formatted}**`;
      }
    }

    return {
      ...response,
      text: enrichedText,
      metadata: {
        ...response.metadata,
        usedTools: toolResults.map(r => r.toolId)
      }
    };
  }

  /**
   * Extrai parâmetros para ferramentas das entidades
   */
  private extractToolParams(entities: any[]): Record<string, any> {
    const params: Record<string, any> = {};

    for (const entity of entities) {
      // Mapear tipos de entidade para parâmetros de ferramenta
      const paramName = this.entityTypeToParamName(entity.type);
      params[paramName] = entity.normalizedValue;
    }

    return params;
  }

  /**
   * Converte tipo de entidade para nome de parâmetro
   */
  private entityTypeToParamName(entityType: string): string {
    const mapping: Record<string, string> = {
      'data': 'date',
      'campus': 'campus',
      'numero': 'quantity',
      'restricao_alimentar': 'restriction',
      'horario': 'time'
    };

    return mapping[entityType] || entityType;
  }

  /**
   * Obtém sugestões contextuais
   */
  private getContextualSuggestions(intent: Intent): string[] {
    const suggestions: Record<Intent, string[]> = {
      [Intent.HORARIO]: ['Qual o preço?', 'Onde fica?'],
      [Intent.PRECO]: ['Como recarregar?', 'Formas de pagamento'],
      [Intent.CARDAPIO]: ['Tem vegetariano?', 'Qual o preço?'],
      [Intent.LOCALIZACAO]: ['Horário de funcionamento', 'Preços'],
      [Intent.OPCAO_VEGETARIANA]: ['Ver cardápio completo', 'Preços'],
      [Intent.OPCAO_VEGANA]: ['Cardápio de hoje', 'Contato nutrição'],
      [Intent.ALERGIAS_INTOLERANCIA]: ['Falar com nutricionista', 'Ver cardápio'],
      [Intent.FORMAS_PAGAMENTO]: ['Recarregar cartão', 'Preços'],
      [Intent.RECARGA_CARTAO]: ['Formas de pagamento', 'Localização'],
      [Intent.AUXILIO_ALIMENTACAO]: ['Programas sociais', 'Contato PRAE'],
      [Intent.PROGRAMAS_SOCIAIS]: ['Auxílio alimentação', 'Requisitos'],
      [Intent.FILA_ESPERA]: ['Horários', 'Cardápio'],
      [Intent.FUNCIONAMENTO_FERIADO]: ['Horários normais', 'Cardápio'],
      [Intent.PROTOCOLO_SANITARIO]: ['Horário', 'Localização'],
      [Intent.CONTATO]: ['Horário atendimento', 'Localização'],
      [Intent.SAUDACAO]: ['Horário', 'Preços', 'Cardápio'],
      [Intent.AGRADECIMENTO]: ['Mais informações?'],
      [Intent.DESPEDIDA]: [],
      [Intent.DESCONHECIDA]: ['Horário', 'Preços', 'Cardápio'],
      [Intent.FORA_ESCOPO]: ['Sobre o RU', 'Horários']
    };

    return suggestions[intent] || [];
  }

  /**
   * Gera resultado de erro
   */
  private generateErrorResult(
    sessionId: string,
    userMessage: string,
    errorMessage: string,
    processingTime: number
  ): MCPProcessingResult {
    const context = dialogContextService.getOrCreateContext(sessionId, this.config.language);
    
    const response: MCPResponse = {
      text: 'Desculpe, ocorreu um erro ao processar sua mensagem. 😓\n\n' +
            'Posso ajudar com informações sobre:\n' +
            '• Horários\n• Preços\n• Cardápio\n• Localização\n\n' +
            'Tente reformular sua pergunta!',
      type: ResponseType.ERROR,
      confidence: 0,
      suggestions: ['Horário de funcionamento', 'Preços', 'Localização'],
      metadata: {
        error: errorMessage,
        processingTime
      }
    };

    return {
      response,
      context,
      intentRecognition: {
        intent: Intent.DESCONHECIDA,
        confidence: 0
      },
      entities: {
        entities: [],
        rawText: userMessage
      },
      processingMetrics: {
        totalTime: processingTime,
        intentRecognitionTime: 0,
        entityExtractionTime: 0,
        dialogManagementTime: 0,
        responseGenerationTime: 0
      }
    };
  }

  /**
   * Atualiza configuração do MCP
   */
  updateConfig(config: Partial<MCPConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ Configuração MCP atualizada:', this.config);
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): MCPConfig {
    return { ...this.config };
  }

  /**
   * Reseta sessão
   */
  resetSession(sessionId: string): void {
    dialogContextService.resetContext(sessionId);
    console.log(`🔄 Sessão resetada: ${sessionId}`);
  }

  /**
   * Encerra sessão
   */
  endSession(sessionId: string): void {
    dialogContextService.deleteContext(sessionId);
    console.log(`🏁 Sessão encerrada: ${sessionId}`);
  }

  /**
   * Obtém estatísticas do sistema MCP
   */
  getSystemStats(): {
    contextService: any;
    toolService: any;
    config: MCPConfig;
  } {
    return {
      contextService: dialogContextService.getStats(),
      toolService: toolManagerService.getStats(),
      config: this.config
    };
  }

  /**
   * Modo de debug
   */
  setDebugMode(enabled: boolean): void {
    this.config.debugMode = enabled;
    console.log(`🐛 Modo debug: ${enabled ? 'ATIVADO' : 'DESATIVADO'}`);
  }
}

// Singleton
export const mcpOrchestratorService = new MCPOrchestratorService();


