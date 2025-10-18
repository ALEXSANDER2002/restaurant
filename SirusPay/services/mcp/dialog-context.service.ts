/**
 * Serviço de Gerenciamento de Contexto de Diálogo
 * Mantém o estado e histórico da conversação
 */

import {
  DialogContext,
  DialogState,
  Slot,
  ConversationTurn,
  Intent,
  Entity,
  EntityType
} from '@/types/mcp.types';

/**
 * Serviço de gerenciamento de contexto robusto
 */
export class DialogContextService {
  private contexts: Map<string, DialogContext> = new Map();
  private readonly MAX_HISTORY_SIZE = 50;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  /**
   * Cria ou recupera um contexto de diálogo
   */
  getOrCreateContext(sessionId: string, language: string = 'pt-BR', userId?: string): DialogContext {
    let context = this.contexts.get(sessionId);

    if (!context) {
      console.log('🆕 Criando novo contexto de diálogo:', sessionId);
      context = this.createNewContext(sessionId, language, userId);
      this.contexts.set(sessionId, context);
    } else {
      // Verificar timeout da sessão
      const now = Date.now();
      if (now - context.metadata.lastUpdateTime > this.SESSION_TIMEOUT) {
        console.log('⏰ Sessão expirada, criando nova:', sessionId);
        context = this.createNewContext(sessionId, language, userId);
        this.contexts.set(sessionId, context);
      }
    }

    return context;
  }

  /**
   * Cria um novo contexto
   */
  private createNewContext(sessionId: string, language: string, userId?: string): DialogContext {
    const now = Date.now();
    return {
      sessionId,
      dialogState: DialogState.INICIO,
      slots: new Map(),
      conversationHistory: [],
      metadata: {
        language,
        userId,
        startTime: now,
        lastUpdateTime: now,
        turnCount: 0
      }
    };
  }

  /**
   * Atualiza o contexto com um novo turno de conversação
   */
  updateContext(
    sessionId: string,
    userMessage: string,
    intent?: Intent,
    entities?: Entity[],
    botResponse?: string
  ): DialogContext {
    const context = this.getOrCreateContext(sessionId, 'pt-BR');
    const now = Date.now();

    // Criar novo turno
    const turn: ConversationTurn = {
      id: `turn_${context.metadata.turnCount + 1}`,
      timestamp: now,
      userMessage,
      botResponse,
      intent,
      entities
    };

    // Adicionar ao histórico
    context.conversationHistory.push(turn);

    // Limitar tamanho do histórico
    if (context.conversationHistory.length > this.MAX_HISTORY_SIZE) {
      context.conversationHistory = context.conversationHistory.slice(-this.MAX_HISTORY_SIZE);
    }

    // Atualizar metadados
    context.metadata.lastUpdateTime = now;
    context.metadata.turnCount++;

    // Atualizar intenção atual
    if (intent) {
      context.currentIntent = intent;
    }

    // Processar entidades e atualizar slots
    if (entities && entities.length > 0) {
      this.updateSlotsFromEntities(context, entities);
    }

    console.log(`📝 Contexto atualizado: ${sessionId}, turno ${context.metadata.turnCount}`);

    return context;
  }

  /**
   * Atualiza slots a partir de entidades extraídas
   */
  private updateSlotsFromEntities(context: DialogContext, entities: Entity[]): void {
    for (const entity of entities) {
      const slotName = this.getSlotNameForEntity(entity.type);
      
      const existingSlot = context.slots.get(slotName);
      
      // Atualizar ou criar slot
      const slot: Slot = {
        name: slotName,
        value: entity.normalizedValue,
        type: entity.type,
        required: this.isSlotRequired(entity.type, context.currentIntent),
        filled: true,
        confidence: entity.confidence
      };

      context.slots.set(slotName, slot);
      
      console.log(`🎰 Slot atualizado: ${slotName} = ${JSON.stringify(entity.normalizedValue)}`);
    }
  }

  /**
   * Converte tipo de entidade para nome de slot
   */
  private getSlotNameForEntity(entityType: EntityType): string {
    const mapping: Record<EntityType, string> = {
      [EntityType.HORARIO]: 'horario',
      [EntityType.DATA]: 'data',
      [EntityType.DIA_SEMANA]: 'dia_semana',
      [EntityType.REFEICAO]: 'tipo_refeicao',
      [EntityType.PRECO]: 'preco',
      [EntityType.CAMPUS]: 'campus',
      [EntityType.TIPO_COMIDA]: 'tipo_comida',
      [EntityType.RESTRICAO_ALIMENTAR]: 'restricao_alimentar',
      [EntityType.FORMA_PAGAMENTO]: 'forma_pagamento',
      [EntityType.NUMERO]: 'numero',
      [EntityType.PERIODO]: 'periodo'
    };

    return mapping[entityType] || entityType.toString();
  }

  /**
   * Verifica se um slot é obrigatório para uma intenção
   */
  private isSlotRequired(entityType: EntityType, intent?: Intent): boolean {
    if (!intent) return false;

    // Definir slots obrigatórios por intenção
    const requiredSlots: Record<Intent, EntityType[]> = {
      [Intent.HORARIO]: [],
      [Intent.PRECO]: [],
      [Intent.LOCALIZACAO]: [EntityType.CAMPUS],
      [Intent.CARDAPIO]: [EntityType.DATA, EntityType.DIA_SEMANA],
      [Intent.OPCAO_VEGETARIANA]: [],
      [Intent.OPCAO_VEGANA]: [],
      [Intent.ALERGIAS_INTOLERANCIA]: [EntityType.RESTRICAO_ALIMENTAR],
      [Intent.FORMAS_PAGAMENTO]: [],
      [Intent.RECARGA_CARTAO]: [],
      [Intent.AUXILIO_ALIMENTACAO]: [],
      [Intent.PROGRAMAS_SOCIAIS]: [],
      [Intent.FILA_ESPERA]: [EntityType.HORARIO],
      [Intent.FUNCIONAMENTO_FERIADO]: [EntityType.DATA, EntityType.DIA_SEMANA],
      [Intent.PROTOCOLO_SANITARIO]: [],
      [Intent.CONTATO]: [],
      [Intent.SAUDACAO]: [],
      [Intent.AGRADECIMENTO]: [],
      [Intent.DESPEDIDA]: [],
      [Intent.DESCONHECIDA]: [],
      [Intent.FORA_ESCOPO]: []
    };

    const required = requiredSlots[intent] || [];
    return required.includes(entityType);
  }

  /**
   * Define o estado do diálogo
   */
  setDialogState(sessionId: string, state: DialogState): void {
    const context = this.getOrCreateContext(sessionId, 'pt-BR');
    context.dialogState = state;
    console.log(`🔄 Estado do diálogo alterado para: ${state}`);
  }

  /**
   * Adiciona ou atualiza um slot manualmente
   */
  setSlot(
    sessionId: string,
    slotName: string,
    value: any,
    type: EntityType,
    required: boolean = false
  ): void {
    const context = this.getOrCreateContext(sessionId, 'pt-BR');
    
    const slot: Slot = {
      name: slotName,
      value,
      type,
      required,
      filled: value !== null && value !== undefined,
      confidence: 1.0
    };

    context.slots.set(slotName, slot);
    console.log(`🎰 Slot definido manualmente: ${slotName} = ${value}`);
  }

  /**
   * Obtém o valor de um slot
   */
  getSlot(sessionId: string, slotName: string): Slot | undefined {
    const context = this.contexts.get(sessionId);
    return context?.slots.get(slotName);
  }

  /**
   * Verifica se todos os slots obrigatórios estão preenchidos
   */
  areRequiredSlotsFilled(sessionId: string): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return true;

    const requiredSlots = Array.from(context.slots.values()).filter(s => s.required);
    
    if (requiredSlots.length === 0) return true;

    return requiredSlots.every(slot => slot.filled);
  }

  /**
   * Obtém slots não preenchidos que são obrigatórios
   */
  getMissingRequiredSlots(sessionId: string): Slot[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];

    return Array.from(context.slots.values())
      .filter(slot => slot.required && !slot.filled);
  }

  /**
   * Limpa todos os slots
   */
  clearSlots(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (context) {
      context.slots.clear();
      console.log('🧹 Slots limpos');
    }
  }

  /**
   * Obtém o histórico de conversação
   */
  getConversationHistory(sessionId: string, limit?: number): ConversationTurn[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];

    const history = context.conversationHistory;
    
    if (limit && limit > 0) {
      return history.slice(-limit);
    }

    return history;
  }

  /**
   * Obtém o último turno de conversação
   */
  getLastTurn(sessionId: string): ConversationTurn | undefined {
    const context = this.contexts.get(sessionId);
    if (!context || context.conversationHistory.length === 0) return undefined;

    return context.conversationHistory[context.conversationHistory.length - 1];
  }

  /**
   * Obtém informações sobre o contexto atual
   */
  getContextSummary(sessionId: string): {
    exists: boolean;
    turnCount: number;
    currentIntent?: Intent;
    dialogState?: DialogState;
    slotsFilled: number;
    totalSlots: number;
    sessionAge: number;
  } {
    const context = this.contexts.get(sessionId);
    
    if (!context) {
      return {
        exists: false,
        turnCount: 0,
        slotsFilled: 0,
        totalSlots: 0,
        sessionAge: 0
      };
    }

    const now = Date.now();
    const filledSlots = Array.from(context.slots.values()).filter(s => s.filled).length;

    return {
      exists: true,
      turnCount: context.metadata.turnCount,
      currentIntent: context.currentIntent,
      dialogState: context.dialogState,
      slotsFilled: filledSlots,
      totalSlots: context.slots.size,
      sessionAge: now - context.metadata.startTime
    };
  }

  /**
   * Remove um contexto (encerra sessão)
   */
  deleteContext(sessionId: string): void {
    const deleted = this.contexts.delete(sessionId);
    if (deleted) {
      console.log(`🗑️ Contexto removido: ${sessionId}`);
    }
  }

  /**
   * Limpa contextos expirados
   */
  cleanupExpiredContexts(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, context] of this.contexts.entries()) {
      if (now - context.metadata.lastUpdateTime > this.SESSION_TIMEOUT) {
        this.contexts.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} contextos expirados removidos`);
    }

    return cleaned;
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    totalTurns: number;
    avgTurnsPerSession: number;
  } {
    const now = Date.now();
    let totalTurns = 0;
    let activeSessions = 0;

    for (const context of this.contexts.values()) {
      totalTurns += context.metadata.turnCount;
      
      if (now - context.metadata.lastUpdateTime < this.SESSION_TIMEOUT) {
        activeSessions++;
      }
    }

    return {
      totalSessions: this.contexts.size,
      activeSessions,
      totalTurns,
      avgTurnsPerSession: this.contexts.size > 0 ? totalTurns / this.contexts.size : 0
    };
  }

  /**
   * Reseta o contexto mantendo a sessão
   */
  resetContext(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (context) {
      const language = context.metadata.language;
      const userId = context.metadata.userId;
      
      const newContext = this.createNewContext(sessionId, language, userId);
      this.contexts.set(sessionId, newContext);
      
      console.log(`🔄 Contexto resetado: ${sessionId}`);
    }
  }
}

// Singleton
export const dialogContextService = new DialogContextService();

// Cleanup periódico de contextos expirados (a cada 5 minutos)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    dialogContextService.cleanupExpiredContexts();
  }, 5 * 60 * 1000);
}






