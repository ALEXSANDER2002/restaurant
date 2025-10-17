/**
 * Índice de Exportação dos Serviços MCP
 * Ponto único de acesso para todos os serviços do sistema MCP
 */

// Serviços principais
export { intentRecognitionService, IntentRecognitionService } from './intent-recognition.service';
export { entityExtractionService, EntityExtractionService } from './entity-extraction.service';
export { dialogContextService, DialogContextService } from './dialog-context.service';
export { dialogManagerService, DialogManagerService } from './dialog-manager.service';
export { toolManagerService, ToolManagerService } from './tool-manager.service';
export { mcpOrchestratorService, MCPOrchestratorService } from './mcp-orchestrator.service';

// Tipos
export * from '@/types/mcp.types';

/**
 * Inicialização do sistema MCP
 * Pode ser chamada no início da aplicação se necessário
 */
export function initializeMCP(config?: any): void {
  console.log('🚀 Inicializando sistema MCP...');
  
  // Configurar orquestrador se config for fornecido
  if (config) {
    mcpOrchestratorService.updateConfig(config);
  }
  
  console.log('✅ Sistema MCP inicializado com sucesso!');
}

/**
 * Função auxiliar para processar mensagem
 * Simplifica o uso do orquestrador
 */
export async function processChatMessage(
  sessionId: string,
  message: string,
  options?: {
    userId?: string;
    language?: string;
  }
) {
  return mcpOrchestratorService.processMessage(
    sessionId,
    message,
    options?.userId,
    options?.language
  );
}

/**
 * Obtém estatísticas do sistema
 */
export function getMCPStats() {
  return mcpOrchestratorService.getSystemStats();
}

/**
 * Reseta uma sessão
 */
export function resetMCPSession(sessionId: string) {
  mcpOrchestratorService.resetSession(sessionId);
}

/**
 * Encerra uma sessão
 */
export function endMCPSession(sessionId: string) {
  mcpOrchestratorService.endSession(sessionId);
}


