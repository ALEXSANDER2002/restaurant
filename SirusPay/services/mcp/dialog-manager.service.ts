/**
 * Serviço de Gerenciamento de Diálogo Multi-turno
 * Gerencia fluxos de conversação complexos e coleta de informações
 */

import {
  Intent,
  DialogContext,
  DialogState,
  ResponseType,
  MCPResponse,
  Slot
} from '@/types/mcp.types';

/**
 * Template de resposta para cada intenção
 */
interface ResponseTemplate {
  intent: Intent;
  responses: string[];
  followUpQuestions?: string[];
  requiresSlots?: string[];
}

/**
 * Serviço de gerenciamento de diálogo
 */
export class DialogManagerService {
  private responseTemplates: ResponseTemplate[] = [
    {
      intent: Intent.HORARIO,
      responses: [
        'O Restaurante Universitário da UNIFESSPA funciona de segunda a sexta-feira:\n\n🕐 **Horário:**\n• Almoço: 11h00 às 14h00\n\n❌ Não servimos jantar\n❌ Fechado aos finais de semana e feriados.'
      ],
      followUpQuestions: [
        'Posso ajudar com informações sobre preços ou localização?'
      ]
    },
    {
      intent: Intent.PRECO,
      responses: [
        '💰 **Preços das refeições no RU da UNIFESSPA:**\n\n• 🎓 Estudantes Subsidiados: R$ 2,00\n• 👥 Não Subsidiados/Visitantes: R$ 13,00\n\n💡 **Dica:** Estudantes em vulnerabilidade social podem solicitar auxílio alimentação junto à PRAE!'
      ],
      followUpQuestions: [
        'Gostaria de saber sobre formas de pagamento ou auxílio alimentação?'
      ]
    },
    {
      intent: Intent.LOCALIZACAO,
      responses: [
        '📍 **Localização do RU da UNIFESSPA:**\n\n🏛️ **Campus Principal - Marabá:**\nFolha 31, Quadra 07, Lote Especial\nNova Marabá - PA\n\n🗺️ O RU fica no Bloco Central do Campus, próximo à Biblioteca.\n\n🚌 **Transporte:** Acessível por transporte público e possui estacionamento.'
      ]
    },
    {
      intent: Intent.CARDAPIO,
      responses: [
        'Nosso cardápio varia diariamente e sempre inclui:\n\n• Arroz e feijão\n• Prato principal (carne ou frango)\n• Opção vegetariana\n• Guarnição\n• Saladas variadas\n• Sobremesa (fruta ou doce)\n• Suco natural\n\n📅 O cardápio da semana é publicado toda segunda-feira no mural do RU.'
      ],
      followUpQuestions: [
        'Tem alguma restrição alimentar ou gostaria de saber sobre opções vegetarianas?'
      ]
    },
    {
      intent: Intent.OPCAO_VEGETARIANA,
      responses: [
        '🥗 Sim! Oferecemos opção vegetariana em todas as refeições.\n\nNosso cardápio vegetariano é elaborado por nutricionistas para garantir o equilíbrio nutricional e inclui:\n\n• Proteínas vegetais variadas\n• Legumes e verduras frescas\n• Carboidratos integrais\n• Sobremesas sem gelatina animal'
      ]
    },
    {
      intent: Intent.OPCAO_VEGANA,
      responses: [
        '🌱 Trabalhamos para oferecer opções veganas!\n\nAtualmente, várias preparações do nosso cardápio são naturalmente veganas:\n\n• Arroz e feijão\n• Saladas variadas\n• Algumas guarnições\n• Frutas como sobremesa\n\nPara garantir uma refeição 100% vegana, recomendamos consultar o cardápio do dia ou falar com nossa equipe.'
      ]
    },
    {
      intent: Intent.ALERGIAS_INTOLERANCIA,
      responses: [
        '⚠️ **Informações sobre Alérgenos:**\n\nInformamos os principais alérgenos em cada prato do cardápio.\n\nSe você tem alguma alergia ou intolerância alimentar específica, recomendamos:\n\n1. Consultar a equipe de nutrição do RU\n2. Verificar o cardápio diário com informações de alérgenos\n3. Informar sua restrição ao se servir\n\n📞 Entre em contato para orientações personalizadas!'
      ],
      requiresSlots: ['restricao_alimentar']
    },
    {
      intent: Intent.FORMAS_PAGAMENTO,
      responses: [
        '💳 **Formas de Pagamento Aceitas:**\n\n✅ Cartão do estudante (com créditos)\n✅ Dinheiro\n✅ PIX\n\n❌ Não aceitamos cartões de crédito ou débito.\n\n💡 O cartão do estudante pode ser recarregado na Central de Atendimento!'
      ],
      followUpQuestions: [
        'Gostaria de saber como recarregar o cartão do estudante?'
      ]
    },
    {
      intent: Intent.RECARGA_CARTAO,
      responses: [
        '🔄 **Como Recarregar o Cartão do RU:**\n\n📍 **Local:** Central de Atendimento ao Estudante\n(Prédio da Reitoria)\n\n⏰ **Horário:** Segunda a sexta, das 8h às 17h\n\n💻 **Online:** Também é possível fazer recarga pelo portal do estudante!\n\n💡 Os créditos ficam disponíveis imediatamente após a confirmação do pagamento.'
      ]
    },
    {
      intent: Intent.AUXILIO_ALIMENTACAO,
      responses: [
        '🎓 **Auxílio Alimentação:**\n\nEstudantes em situação de vulnerabilidade socioeconômica podem solicitar auxílio junto à **PRAE** (Pró-Reitoria de Assuntos Estudantis).\n\n**Benefícios:**\n• Refeições gratuitas ou com desconto\n• Subsídio mensal para alimentação\n\n**Como Solicitar:**\n1. Acesse o portal da PRAE\n2. Preencha o formulário socioeconômico\n3. Aguarde análise da documentação\n\n📞 Consulte o site da PRAE para mais informações e editais!'
      ]
    },
    {
      intent: Intent.PROGRAMAS_SOCIAIS,
      responses: [
        '🤝 **Programas de Assistência Estudantil:**\n\nA UNIFESSPA oferece diversos programas através da PRAE:\n\n• **Auxílio Alimentação** - Subsídio para refeições\n• **Bolsa Permanência** - Apoio financeiro mensal\n• **Auxílio Moradia** - Para estudantes de outras cidades\n• **Auxílio Transporte** - Ajuda de custo com deslocamento\n\n📋 Os editais são publicados semestralmente.\n🌐 Visite o site da PRAE para mais informações!'
      ]
    },
    {
      intent: Intent.FILA_ESPERA,
      responses: [
        '⏱️ **Sobre Filas e Movimento:**\n\n🔴 **Horários de Pico:**\nEntre 12h e 13h as filas costumam ser maiores.\n\n🟢 **Melhores Horários:**\n• Logo após a abertura (11h)\n• Próximo ao final do horário (13h30)\n\n💡 **Dica:** Chegue alguns minutos antes ou depois do horário de pico para evitar espera!'
      ]
    },
    {
      intent: Intent.FUNCIONAMENTO_FERIADO,
      responses: [
        '📅 **Funcionamento em Finais de Semana e Feriados:**\n\n❌ O Restaurante Universitário **NÃO** funciona:\n• Sábados\n• Domingos\n• Feriados nacionais e municipais\n\n✅ Atendimento apenas de **segunda a sexta-feira**, das 11h às 14h.\n\n💡 Planeje-se para esses dias!'
      ]
    },
    {
      intent: Intent.PROTOCOLO_SANITARIO,
      responses: [
        '🧼 **Protocolos de Segurança Sanitária:**\n\nSeguimos rigorosamente todos os protocolos de segurança:\n\n✅ Higienização constante dos ambientes\n✅ Dispensers de álcool em gel disponíveis\n✅ Equipe com EPIs adequados\n✅ Alimentos manipulados com segurança\n\n😷 Uso de máscara é **opcional** (conforme orientações atuais)\n\n🧴 Recomendamos higienizar as mãos antes das refeições!'
      ]
    },
    {
      intent: Intent.CONTATO,
      responses: [
        '📞 **Entre em Contato com o RU:**\n\n**Presencialmente:**\nAdministração do RU\nSegunda a sexta, 8h às 17h\n\n**E-mail:**\nru@unifesspa.edu.br\n\n**Ouvidoria UNIFESSPA:**\nPara reclamações, sugestões e elogios\n\n🗣️ Sua opinião é importante para melhorarmos nossos serviços!'
      ]
    },
    {
      intent: Intent.SAUDACAO,
      responses: [
        'Olá! 👋 Como posso ajudar você hoje com informações sobre o Restaurante Universitário?',
        'Oi! Seja bem-vindo(a)! 🍽️ Em que posso ajudar sobre o RU da UNIFESSPA?',
        'Olá! Estou aqui para tirar suas dúvidas sobre o Restaurante Universitário! Como posso ajudar?'
      ]
    },
    {
      intent: Intent.AGRADECIMENTO,
      responses: [
        'De nada! 😊 Estou aqui para ajudar. Tem mais alguma pergunta sobre o RU?',
        'Por nada! Fico feliz em ajudar! Precisa de mais alguma informação?',
        'É um prazer ajudar! 🌟 Se tiver outras dúvidas, é só perguntar!'
      ]
    },
    {
      intent: Intent.DESPEDIDA,
      responses: [
        'Até mais! 👋 Se precisar de mais informações sobre o RU, é só voltar. Tenha um ótimo dia!',
        'Tchau! Volte sempre que precisar. Bom apetite! 🍽️',
        'Até logo! Qualquer dúvida sobre o RU, estou aqui. Tenha um excelente dia! ☀️'
      ]
    }
  ];

  /**
   * Gera resposta baseada na intenção e contexto
   */
  async generateResponse(
    intent: Intent,
    context: DialogContext,
    confidence: number
  ): Promise<MCPResponse> {
    console.log(`💬 Gerando resposta para intenção: ${intent}`);

    // Verificar se precisamos coletar mais informações
    const template = this.responseTemplates.find(t => t.intent === intent);

    if (!template) {
      return this.generateFallbackResponse(intent, confidence);
    }

    // Verificar slots obrigatórios
    if (template.requiresSlots && template.requiresSlots.length > 0) {
      const missingSlots = this.checkMissingSlots(context, template.requiresSlots);
      
      if (missingSlots.length > 0) {
        return this.generateClarificationResponse(missingSlots, intent);
      }
    }

    // Escolher resposta (aleatória se houver múltiplas)
    const response = this.selectResponse(template.responses);

    // Adicionar perguntas de follow-up se disponíveis
    const suggestions = template.followUpQuestions || this.getDefaultSuggestions(intent);

    return {
      text: response,
      type: ResponseType.DIRECT_ANSWER,
      intent,
      confidence,
      suggestions,
      metadata: {
        usedTools: [],
        processingTime: 0
      }
    };
  }

  /**
   * Gera resposta de clarificação quando faltam informações
   */
  private generateClarificationResponse(missingSlots: Slot[], intent: Intent): MCPResponse {
    const slotQuestions: Record<string, string> = {
      'restricao_alimentar': 'Qual é sua restrição alimentar específica (glúten, lactose, etc.)?',
      'campus': 'Qual campus você gostaria de saber a localização?',
      'data': 'Para qual data você gostaria de saber o cardápio?',
      'dia_semana': 'Para qual dia da semana você gostaria de saber?',
      'horario': 'Para qual horário específico você está perguntando?',
      'tipo_refeicao': 'Você está perguntando sobre almoço ou jantar?'
    };

    const firstMissingSlot = missingSlots[0];
    const question = slotQuestions[firstMissingSlot.name] || 
      `Preciso de mais informações sobre ${firstMissingSlot.name}. Pode me fornecer?`;

    return {
      text: question,
      type: ResponseType.CLARIFICATION,
      intent,
      confidence: 0.8,
      requiresAction: true,
      metadata: {
        missingSlots: missingSlots.map(s => s.name)
      }
    };
  }

  /**
   * Gera resposta de fallback
   */
  private generateFallbackResponse(intent: Intent, confidence: number): MCPResponse {
    let text: string;
    let suggestions: string[];

    if (confidence < 0.3) {
      text = 'Desculpe, não entendi muito bem sua pergunta. 🤔\n\n' +
             'Posso ajudar com informações sobre:\n\n' +
             '• Horários de funcionamento\n' +
             '• Preços e formas de pagamento\n' +
             '• Cardápio e opções alimentares\n' +
             '• Localização do RU\n' +
             '• Auxílio alimentação\n\n' +
             'Sobre qual desses assuntos você gostaria de saber?';
      
      suggestions = [
        'Qual o horário de funcionamento?',
        'Quanto custa a refeição?',
        'Onde fica o RU?'
      ];
    } else if (intent === Intent.FORA_ESCOPO) {
      text = 'Desculpe, essa pergunta está fora do meu escopo. 😅\n\n' +
             'Sou especializado em informações sobre o Restaurante Universitário da UNIFESSPA.\n\n' +
             'Como posso ajudar com informações sobre o RU?';
      
      suggestions = [
        'Horário de funcionamento',
        'Preços das refeições',
        'Opções vegetarianas'
      ];
    } else {
      text = 'Hmm, não tenho certeza sobre isso. 🤔\n\n' +
             'Posso ajudar com:\n' +
             '• Horários • Preços • Cardápio • Localização • Pagamentos\n\n' +
             'O que você gostaria de saber?';
      
      suggestions = [
        'Horário de funcionamento',
        'Formas de pagamento',
        'Cardápio de hoje'
      ];
    }

    return {
      text,
      type: ResponseType.ERROR,
      confidence: 0.5,
      suggestions,
      metadata: {
        fallbackUsed: true
      }
    };
  }

  /**
   * Verifica slots faltantes
   */
  private checkMissingSlots(context: DialogContext, requiredSlots: string[]): Slot[] {
    const missing: Slot[] = [];

    for (const slotName of requiredSlots) {
      const slot = context.slots.get(slotName);
      if (!slot || !slot.filled) {
        missing.push({
          name: slotName,
          value: null,
          type: slot?.type || 'string' as any,
          required: true,
          filled: false
        });
      }
    }

    return missing;
  }

  /**
   * Seleciona uma resposta (aleatória ou primeira)
   */
  private selectResponse(responses: string[]): string {
    if (responses.length === 1) {
      return responses[0];
    }
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * Retorna sugestões padrão baseadas na intenção
   */
  private getDefaultSuggestions(intent: Intent): string[] {
    const suggestionMap: Record<Intent, string[]> = {
      [Intent.HORARIO]: ['Quais são os preços?', 'Onde fica localizado?'],
      [Intent.PRECO]: ['Como funciona o auxílio?', 'Formas de pagamento'],
      [Intent.LOCALIZACAO]: ['Qual o horário?', 'Tem estacionamento?'],
      [Intent.CARDAPIO]: ['Tem opção vegetariana?', 'Qual o preço?'],
      [Intent.OPCAO_VEGETARIANA]: ['Qual o cardápio?', 'Tem opção vegana?'],
      [Intent.OPCAO_VEGANA]: ['Cardápio completo', 'Opções vegetarianas'],
      [Intent.ALERGIAS_INTOLERANCIA]: ['Cardápio', 'Contato com nutricionista'],
      [Intent.FORMAS_PAGAMENTO]: ['Recarga de cartão', 'Preços'],
      [Intent.RECARGA_CARTAO]: ['Formas de pagamento', 'Horário'],
      [Intent.AUXILIO_ALIMENTACAO]: ['Programas sociais', 'Preços'],
      [Intent.PROGRAMAS_SOCIAIS]: ['Auxílio alimentação', 'Contato PRAE'],
      [Intent.FILA_ESPERA]: ['Horários', 'Cardápio'],
      [Intent.FUNCIONAMENTO_FERIADO]: ['Horários normais', 'Localização'],
      [Intent.PROTOCOLO_SANITARIO]: ['Horário', 'Cardápio'],
      [Intent.CONTATO]: ['Horário', 'Localização'],
      [Intent.SAUDACAO]: ['Horário', 'Preços', 'Cardápio'],
      [Intent.AGRADECIMENTO]: ['Horário', 'Preços', 'Localização'],
      [Intent.DESPEDIDA]: [],
      [Intent.DESCONHECIDA]: ['Horário', 'Preços', 'Cardápio'],
      [Intent.FORA_ESCOPO]: ['Horário', 'Preços', 'Localização']
    };

    return suggestionMap[intent] || [];
  }

  /**
   * Adiciona template de resposta personalizado
   */
  addResponseTemplate(template: ResponseTemplate): void {
    const existingIndex = this.responseTemplates.findIndex(t => t.intent === template.intent);
    
    if (existingIndex >= 0) {
      this.responseTemplates[existingIndex] = template;
    } else {
      this.responseTemplates.push(template);
    }
  }

  /**
   * Gera resposta de confirmação
   */
  generateConfirmationResponse(message: string, intent: Intent): MCPResponse {
    return {
      text: message,
      type: ResponseType.CONFIRMATION,
      intent,
      confidence: 1.0,
      requiresAction: true
    };
  }
}

// Singleton
export const dialogManagerService = new DialogManagerService();






