/**
 * Serviço de Gerenciamento de Ferramentas MCP
 * Gerencia ferramentas e recursos externos que o chatbot pode usar
 */

import {
  MCPTool,
  ToolType,
  ToolResult,
  DialogContext,
  Intent,
  ToolParameter
} from '@/types/mcp.types';

/**
 * Serviço de gerenciamento de ferramentas
 */
export class ToolManagerService {
  private tools: Map<string, MCPTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  /**
   * Registra ferramentas padrão
   */
  private registerDefaultTools(): void {
    // Ferramenta: Consultar cardápio do dia
    this.registerTool({
      id: 'get_daily_menu',
      name: 'Consultar Cardápio do Dia',
      type: ToolType.DATABASE_QUERY,
      description: 'Consulta o cardápio diário do restaurante universitário',
      parameters: [
        {
          name: 'date',
          type: 'string',
          required: false,
          description: 'Data no formato YYYY-MM-DD (padrão: hoje)'
        },
        {
          name: 'campus',
          type: 'string',
          required: false,
          description: 'Campus específico'
        }
      ],
      execute: async (params, context) => {
        try {
          const date = params.date || new Date().toISOString().split('T')[0];
          const campus = params.campus || 'Marabá';
          
          console.log(`🍽️ Consultando cardápio para ${date} - Campus ${campus}`);
          
          // Aqui integraria com o banco de dados real
          // Por enquanto, retorna dados de exemplo
          const menu = {
            date,
            campus,
            items: [
              { category: 'Principal', item: 'Arroz e Feijão' },
              { category: 'Proteína', item: 'Frango Grelhado' },
              { category: 'Guarnição', item: 'Batata Doce' },
              { category: 'Salada', item: 'Salada Verde' },
              { category: 'Sobremesa', item: 'Fruta da época' },
              { category: 'Bebida', item: 'Suco de Maracujá' }
            ],
            vegetarian: 'PVT (Proteína Vegetal Texturizada)',
            available: true
          };

          return {
            success: true,
            data: menu
          };
        } catch (error) {
          console.error('❌ Erro ao consultar cardápio:', error);
          return {
            success: false,
            error: 'Erro ao consultar cardápio'
          };
        }
      }
    });

    // Ferramenta: Verificar disponibilidade de vagas
    this.registerTool({
      id: 'check_queue_status',
      name: 'Verificar Status da Fila',
      type: ToolType.INFORMATION_RETRIEVAL,
      description: 'Verifica o status atual da fila do RU',
      parameters: [
        {
          name: 'campus',
          type: 'string',
          required: false,
          description: 'Campus específico'
        }
      ],
      execute: async (params, context) => {
        try {
          const campus = params.campus || 'Marabá';
          const currentHour = new Date().getHours();
          
          // Lógica simples baseada no horário
          let status: string;
          let estimatedWait: number;
          
          if (currentHour >= 12 && currentHour <= 13) {
            status = 'alta';
            estimatedWait = 15;
          } else if (currentHour === 11 || currentHour === 14) {
            status = 'média';
            estimatedWait = 5;
          } else {
            status = 'baixa';
            estimatedWait = 0;
          }

          return {
            success: true,
            data: {
              campus,
              status,
              estimatedWait,
              bestTime: status === 'alta' ? 'Recomendamos vir após 13h30' : 'Ótimo horário!'
            }
          };
        } catch (error) {
          console.error('❌ Erro ao verificar fila:', error);
          return {
            success: false,
            error: 'Erro ao verificar status da fila'
          };
        }
      }
    });

    // Ferramenta: Calcular preço total
    this.registerTool({
      id: 'calculate_meal_cost',
      name: 'Calcular Custo da Refeição',
      type: ToolType.CALCULATION,
      description: 'Calcula o custo total de refeições',
      parameters: [
        {
          name: 'quantity',
          type: 'number',
          required: true,
          description: 'Quantidade de refeições'
        },
        {
          name: 'subsidized',
          type: 'boolean',
          required: false,
          description: 'Se é estudante subsidiado',
          defaultValue: true
        }
      ],
      execute: async (params, context) => {
        try {
          const quantity = params.quantity || 1;
          const subsidized = params.subsidized !== false;
          
          const pricePerMeal = subsidized ? 2.00 : 13.00;
          const total = quantity * pricePerMeal;
          
          return {
            success: true,
            data: {
              quantity,
              subsidized,
              pricePerMeal,
              total,
              formatted: `R$ ${total.toFixed(2).replace('.', ',')}`
            }
          };
        } catch (error) {
          console.error('❌ Erro ao calcular custo:', error);
          return {
            success: false,
            error: 'Erro ao calcular custo'
          };
        }
      }
    });

    // Ferramenta: Buscar informações de contato
    this.registerTool({
      id: 'get_contact_info',
      name: 'Obter Informações de Contato',
      type: ToolType.INFORMATION_RETRIEVAL,
      description: 'Obtém informações de contato do RU ou departamentos',
      parameters: [
        {
          name: 'department',
          type: 'string',
          required: false,
          description: 'Departamento específico (RU, PRAE, Nutrição, etc.)'
        }
      ],
      execute: async (params, context) => {
        try {
          const department = params.department?.toLowerCase() || 'ru';
          
          const contacts: Record<string, any> = {
            'ru': {
              name: 'Restaurante Universitário',
              email: 'ru@unifesspa.edu.br',
              phone: '(94) XXXX-XXXX',
              hours: 'Segunda a sexta, 8h às 17h',
              location: 'Bloco Central do Campus'
            },
            'prae': {
              name: 'PRAE - Pró-Reitoria de Assuntos Estudantis',
              email: 'prae@unifesspa.edu.br',
              phone: '(94) XXXX-XXXX',
              hours: 'Segunda a sexta, 8h às 12h e 14h às 18h',
              website: 'https://prae.unifesspa.edu.br'
            },
            'nutricao': {
              name: 'Equipe de Nutrição do RU',
              email: 'nutricao.ru@unifesspa.edu.br',
              hours: 'Segunda a sexta, 9h às 16h',
              note: 'Agende consulta prévia'
            }
          };

          const info = contacts[department] || contacts['ru'];

          return {
            success: true,
            data: info
          };
        } catch (error) {
          console.error('❌ Erro ao buscar contato:', error);
          return {
            success: false,
            error: 'Erro ao buscar informações de contato'
          };
        }
      }
    });

    // Ferramenta: Verificar disponibilidade de auxílio
    this.registerTool({
      id: 'check_financial_aid',
      name: 'Verificar Auxílio Alimentação',
      type: ToolType.INFORMATION_RETRIEVAL,
      description: 'Verifica informações sobre auxílio alimentação',
      parameters: [],
      execute: async (params, context) => {
        try {
          return {
            success: true,
            data: {
              available: true,
              types: [
                {
                  name: 'Auxílio Alimentação Integral',
                  description: 'Refeições gratuitas',
                  eligibility: 'Renda familiar per capita até 1 salário mínimo'
                },
                {
                  name: 'Auxílio Alimentação Parcial',
                  description: 'Refeições subsidiadas',
                  eligibility: 'Renda familiar per capita até 1.5 salários mínimos'
                }
              ],
              howToApply: 'Através do portal da PRAE durante período de inscrições',
              contact: 'prae@unifesspa.edu.br'
            }
          };
        } catch (error) {
          console.error('❌ Erro ao verificar auxílio:', error);
          return {
            success: false,
            error: 'Erro ao verificar auxílio'
          };
        }
      }
    });

    // Ferramenta: Buscar informações sobre restrições alimentares
    this.registerTool({
      id: 'get_dietary_restrictions_info',
      name: 'Informações sobre Restrições Alimentares',
      type: ToolType.CONTEXTUAL_SEARCH,
      description: 'Busca informações sobre como o RU lida com restrições alimentares',
      parameters: [
        {
          name: 'restriction',
          type: 'string',
          required: false,
          description: 'Tipo de restrição (glúten, lactose, etc.)'
        }
      ],
      execute: async (params, context) => {
        try {
          const restriction = params.restriction?.toLowerCase();
          
          const restrictions: Record<string, any> = {
            'gluten': {
              available: true,
              options: 'Opções sem glúten disponíveis diariamente',
              identification: 'Pratos identificados no buffet',
              contact: 'Consulte a nutricionista para cardápio personalizado'
            },
            'lactose': {
              available: true,
              options: 'Bebidas vegetais disponíveis',
              identification: 'Pratos com lactose são identificados',
              contact: 'Equipe de nutrição disponível para orientações'
            },
            'default': {
              available: true,
              message: 'O RU trabalha com identificação de alérgenos principais',
              recommendation: 'Consulte a equipe de nutrição para orientações específicas',
              contact: 'nutricao.ru@unifesspa.edu.br'
            }
          };

          const info = restrictions[restriction || 'default'] || restrictions['default'];

          return {
            success: true,
            data: info
          };
        } catch (error) {
          console.error('❌ Erro ao buscar restrições:', error);
          return {
            success: false,
            error: 'Erro ao buscar informações sobre restrições'
          };
        }
      }
    });

    console.log('🔧 Ferramentas MCP registradas:', this.tools.size);
  }

  /**
   * Registra uma nova ferramenta
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.id, tool);
    console.log(`✅ Ferramenta registrada: ${tool.name} (${tool.id})`);
  }

  /**
   * Remove uma ferramenta
   */
  unregisterTool(toolId: string): boolean {
    const removed = this.tools.delete(toolId);
    if (removed) {
      console.log(`🗑️ Ferramenta removida: ${toolId}`);
    }
    return removed;
  }

  /**
   * Obtém uma ferramenta por ID
   */
  getTool(toolId: string): MCPTool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Lista todas as ferramentas disponíveis
   */
  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Busca ferramentas por tipo
   */
  getToolsByType(type: ToolType): MCPTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.type === type);
  }

  /**
   * Executa uma ferramenta
   */
  async executeTool(
    toolId: string,
    params: Record<string, any>,
    context: DialogContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolId);

    if (!tool) {
      console.error(`❌ Ferramenta não encontrada: ${toolId}`);
      return {
        success: false,
        error: `Ferramenta não encontrada: ${toolId}`
      };
    }

    console.log(`🔧 Executando ferramenta: ${tool.name}`);

    try {
      // Validar parâmetros obrigatórios
      const missingParams = tool.parameters
        .filter(p => p.required && !(p.name in params))
        .map(p => p.name);

      if (missingParams.length > 0) {
        return {
          success: false,
          error: `Parâmetros obrigatórios faltando: ${missingParams.join(', ')}`
        };
      }

      // Executar ferramenta
      const result = await tool.execute(params, context);
      
      console.log(`✅ Ferramenta executada com sucesso: ${tool.name}`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao executar ferramenta ${tool.name}:`, error);
      return {
        success: false,
        error: `Erro ao executar ferramenta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Sugere ferramentas com base na intenção
   */
  suggestTools(intent: Intent): string[] {
    const intentToolMap: Record<Intent, string[]> = {
      [Intent.CARDAPIO]: ['get_daily_menu'],
      [Intent.PRECO]: ['calculate_meal_cost'],
      [Intent.FILA_ESPERA]: ['check_queue_status'],
      [Intent.CONTATO]: ['get_contact_info'],
      [Intent.AUXILIO_ALIMENTACAO]: ['check_financial_aid'],
      [Intent.ALERGIAS_INTOLERANCIA]: ['get_dietary_restrictions_info'],
      [Intent.HORARIO]: [],
      [Intent.LOCALIZACAO]: [],
      [Intent.OPCAO_VEGETARIANA]: ['get_daily_menu'],
      [Intent.OPCAO_VEGANA]: ['get_daily_menu'],
      [Intent.FORMAS_PAGAMENTO]: [],
      [Intent.RECARGA_CARTAO]: [],
      [Intent.PROGRAMAS_SOCIAIS]: ['check_financial_aid'],
      [Intent.FUNCIONAMENTO_FERIADO]: [],
      [Intent.PROTOCOLO_SANITARIO]: [],
      [Intent.SAUDACAO]: [],
      [Intent.AGRADECIMENTO]: [],
      [Intent.DESPEDIDA]: [],
      [Intent.DESCONHECIDA]: [],
      [Intent.FORA_ESCOPO]: []
    };

    return intentToolMap[intent] || [];
  }

  /**
   * Verifica se uma ferramenta está disponível
   */
  isToolAvailable(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * Obtém estatísticas das ferramentas
   */
  getStats(): {
    totalTools: number;
    toolsByType: Record<ToolType, number>;
  } {
    const toolsByType: Record<ToolType, number> = {} as any;
    
    for (const tool of this.tools.values()) {
      toolsByType[tool.type] = (toolsByType[tool.type] || 0) + 1;
    }

    return {
      totalTools: this.tools.size,
      toolsByType
    };
  }
}

// Singleton
export const toolManagerService = new ToolManagerService();





