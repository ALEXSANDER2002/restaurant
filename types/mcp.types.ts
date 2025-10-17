/**
 * Tipos e interfaces para o sistema MCP (Model Context Protocol)
 * Sistema robusto de gerenciamento de contexto e intenções para o chatbot
 */

// ============================================================================
// TIPOS DE INTENÇÕES
// ============================================================================

/**
 * Intenções que o chatbot pode reconhecer
 */
export enum Intent {
  // Informações básicas
  HORARIO = 'horario',
  PRECO = 'preco',
  LOCALIZACAO = 'localizacao',
  CARDAPIO = 'cardapio',
  CONTATO = 'contato',
  
  // Pagamentos e serviços
  FORMAS_PAGAMENTO = 'formas_pagamento',
  RECARGA_CARTAO = 'recarga_cartao',
  
  // Programas e auxílios
  AUXILIO_ALIMENTACAO = 'auxilio_alimentacao',
  PROGRAMAS_SOCIAIS = 'programas_sociais',
  
  // Dietéticas e preferências
  OPCAO_VEGETARIANA = 'opcao_vegetariana',
  OPCAO_VEGANA = 'opcao_vegana',
  ALERGIAS_INTOLERANCIA = 'alergias_intolerancia',
  
  // Outras questões
  FILA_ESPERA = 'fila_espera',
  FUNCIONAMENTO_FERIADO = 'funcionamento_feriado',
  PROTOCOLO_SANITARIO = 'protocolo_sanitario',
  
  // Interações sociais
  SAUDACAO = 'saudacao',
  AGRADECIMENTO = 'agradecimento',
  DESPEDIDA = 'despedida',
  
  // Fallback
  DESCONHECIDA = 'desconhecida',
  FORA_ESCOPO = 'fora_escopo'
}

/**
 * Resultado do reconhecimento de intenção
 */
export interface IntentRecognitionResult {
  intent: Intent;
  confidence: number;
  alternativeIntents?: Array<{
    intent: Intent;
    confidence: number;
  }>;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE ENTIDADES
// ============================================================================

/**
 * Tipos de entidades que podem ser extraídas
 */
export enum EntityType {
  HORARIO = 'horario',
  DATA = 'data',
  DIA_SEMANA = 'dia_semana',
  REFEICAO = 'refeicao',
  PRECO = 'preco',
  CAMPUS = 'campus',
  TIPO_COMIDA = 'tipo_comida',
  RESTRICAO_ALIMENTAR = 'restricao_alimentar',
  FORMA_PAGAMENTO = 'forma_pagamento',
  NUMERO = 'numero',
  PERIODO = 'periodo'
}

/**
 * Entidade extraída do texto
 */
export interface Entity {
  type: EntityType;
  value: string;
  normalizedValue: any;
  confidence: number;
  startPos?: number;
  endPos?: number;
}

/**
 * Resultado da extração de entidades
 */
export interface EntityExtractionResult {
  entities: Entity[];
  rawText: string;
}

// ============================================================================
// CONTEXTO DE DIÁLOGO
// ============================================================================

/**
 * Estado do diálogo
 */
export enum DialogState {
  INICIO = 'inicio',
  AGUARDANDO_RESPOSTA = 'aguardando_resposta',
  COLETANDO_INFORMACOES = 'coletando_informacoes',
  CONFIRMACAO = 'confirmacao',
  FINALIZADO = 'finalizado',
  ERRO = 'erro'
}

/**
 * Slot para armazenar informações coletadas
 */
export interface Slot {
  name: string;
  value: any;
  type: EntityType;
  required: boolean;
  filled: boolean;
  confidence?: number;
  questionToAsk?: string;
}

/**
 * Contexto de diálogo
 */
export interface DialogContext {
  sessionId: string;
  currentIntent?: Intent;
  dialogState: DialogState;
  slots: Map<string, Slot>;
  conversationHistory: ConversationTurn[];
  metadata: {
    language: string;
    userId?: string;
    startTime: number;
    lastUpdateTime: number;
    turnCount: number;
  };
}

/**
 * Turno de conversação
 */
export interface ConversationTurn {
  id: string;
  timestamp: number;
  userMessage: string;
  botResponse?: string;
  intent?: Intent;
  entities?: Entity[];
  confidence?: number;
}

// ============================================================================
// FERRAMENTAS MCP
// ============================================================================

/**
 * Tipo de ferramenta MCP
 */
export enum ToolType {
  DATABASE_QUERY = 'database_query',
  API_CALL = 'api_call',
  CALCULATION = 'calculation',
  INFORMATION_RETRIEVAL = 'information_retrieval',
  CONTEXTUAL_SEARCH = 'contextual_search'
}

/**
 * Definição de ferramenta MCP
 */
export interface MCPTool {
  id: string;
  name: string;
  type: ToolType;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>, context: DialogContext) => Promise<ToolResult>;
}

/**
 * Parâmetro de ferramenta
 */
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
}

/**
 * Resultado da execução de ferramenta
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// RESPOSTA DO MCP
// ============================================================================

/**
 * Tipo de resposta
 */
export enum ResponseType {
  DIRECT_ANSWER = 'direct_answer',
  CLARIFICATION = 'clarification',
  CONFIRMATION = 'confirmation',
  ERROR = 'error',
  OUT_OF_SCOPE = 'out_of_scope'
}

/**
 * Resposta gerada pelo MCP
 */
export interface MCPResponse {
  text: string;
  type: ResponseType;
  intent?: Intent;
  confidence: number;
  suggestions?: string[];
  requiresAction?: boolean;
  metadata?: {
    usedTools?: string[];
    processingTime?: number;
    fallbackUsed?: boolean;
  };
}

// ============================================================================
// CONFIGURAÇÃO DO MCP
// ============================================================================

/**
 * Configuração do sistema MCP
 */
export interface MCPConfig {
  language: string;
  minConfidenceThreshold: number;
  maxConversationHistory: number;
  enableContextualMemory: boolean;
  enableMultiTurn: boolean;
  enableToolUse: boolean;
  fallbackEnabled: boolean;
  cacheEnabled: boolean;
  debugMode?: boolean;
}

// ============================================================================
// RESULTADO DO PROCESSAMENTO MCP
// ============================================================================

/**
 * Resultado completo do processamento MCP
 */
export interface MCPProcessingResult {
  response: MCPResponse;
  context: DialogContext;
  intentRecognition: IntentRecognitionResult;
  entities: EntityExtractionResult;
  processingMetrics: {
    totalTime: number;
    intentRecognitionTime: number;
    entityExtractionTime: number;
    dialogManagementTime: number;
    responseGenerationTime: number;
  };
}


