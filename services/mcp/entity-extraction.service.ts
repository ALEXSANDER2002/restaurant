/**
 * Serviço de Extração de Entidades
 * Identifica e extrai entidades relevantes das mensagens do usuário
 */

import { Entity, EntityType, EntityExtractionResult } from '@/types/mcp.types';

/**
 * Padrão de extração para cada tipo de entidade
 */
interface EntityPattern {
  type: EntityType;
  patterns: RegExp[];
  normalizer?: (value: string) => any;
  validator?: (value: any) => boolean;
}

/**
 * Serviço robusto de extração de entidades
 */
export class EntityExtractionService {
  private entityPatterns: EntityPattern[] = [
    // Horário
    {
      type: EntityType.HORARIO,
      patterns: [
        /(\d{1,2}):(\d{2})/g,
        /(\d{1,2})h(\d{2})?/g,
        /(\d{1,2})\s*(horas?|hrs?)/gi
      ],
      normalizer: (value: string) => {
        const match = value.match(/(\d{1,2}):?h?(\d{2})?/i);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = match[2] ? parseInt(match[2]) : 0;
          return { hours, minutes, formatted: `${hours}:${minutes.toString().padStart(2, '0')}` };
        }
        return null;
      },
      validator: (value: any) => {
        return value && value.hours >= 0 && value.hours < 24 && value.minutes >= 0 && value.minutes < 60;
      }
    },

    // Data
    {
      type: EntityType.DATA,
      patterns: [
        /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
        /(\d{1,2})-(\d{1,2})-(\d{2,4})/g,
        /(\d{1,2})\s+de\s+(\w+)/gi
      ],
      normalizer: (value: string) => {
        // Formato dd/mm/yyyy ou dd-mm-yyyy
        let match = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
        if (match) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]);
          let year = parseInt(match[3]);
          if (year < 100) year += 2000;
          return { day, month, year, formatted: `${day}/${month}/${year}` };
        }
        
        // Formato "dd de mês"
        match = value.match(/(\d{1,2})\s+de\s+(\w+)/i);
        if (match) {
          const day = parseInt(match[1]);
          const monthName = match[2].toLowerCase();
          const month = this.getMonthNumber(monthName);
          const year = new Date().getFullYear();
          if (month) {
            return { day, month, year, formatted: `${day}/${month}/${year}` };
          }
        }
        
        return null;
      }
    },

    // Dia da semana
    {
      type: EntityType.DIA_SEMANA,
      patterns: [
        /(segunda|terça|terca|quarta|quinta|sexta|sabado|sábado|domingo)(-feira)?/gi,
        /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi
      ],
      normalizer: (value: string) => {
        const dayMap: Record<string, string> = {
          'segunda': 'segunda-feira',
          'terça': 'terça-feira',
          'terca': 'terça-feira',
          'quarta': 'quarta-feira',
          'quinta': 'quinta-feira',
          'sexta': 'sexta-feira',
          'sabado': 'sábado',
          'sábado': 'sábado',
          'domingo': 'domingo',
          'monday': 'segunda-feira',
          'tuesday': 'terça-feira',
          'wednesday': 'quarta-feira',
          'thursday': 'quinta-feira',
          'friday': 'sexta-feira',
          'saturday': 'sábado',
          'sunday': 'domingo'
        };
        
        const normalized = value.toLowerCase().replace('-feira', '');
        return dayMap[normalized] || value;
      }
    },

    // Tipo de refeição
    {
      type: EntityType.REFEICAO,
      patterns: [
        /(café\s+da\s+manhã|almoço|almoco|jantar|lanche|desjejum)/gi,
        /(breakfast|lunch|dinner)/gi
      ],
      normalizer: (value: string) => {
        const refeicaoMap: Record<string, string> = {
          'café da manhã': 'café da manhã',
          'cafe da manha': 'café da manhã',
          'breakfast': 'café da manhã',
          'almoço': 'almoço',
          'almoco': 'almoço',
          'lunch': 'almoço',
          'jantar': 'jantar',
          'dinner': 'jantar',
          'lanche': 'lanche',
          'desjejum': 'café da manhã'
        };
        
        const normalized = this.normalizeText(value);
        return refeicaoMap[normalized] || value;
      }
    },

    // Preço/Valor
    {
      type: EntityType.PRECO,
      patterns: [
        /R\$\s*(\d+(?:[.,]\d{2})?)/gi,
        /(\d+(?:[.,]\d{2})?)\s*reais?/gi
      ],
      normalizer: (value: string) => {
        const match = value.match(/(\d+(?:[.,]\d{2})?)/);
        if (match) {
          const numValue = parseFloat(match[1].replace(',', '.'));
          return {
            value: numValue,
            formatted: `R$ ${numValue.toFixed(2).replace('.', ',')}`
          };
        }
        return null;
      }
    },

    // Campus
    {
      type: EntityType.CAMPUS,
      patterns: [
        /(marabá|maraba|santana\s+do\s+araguaia|rondon\s+do\s+pará|rondon\s+do\s+para|xinguara)/gi,
        /(campus\s+de\s+\w+)/gi
      ],
      normalizer: (value: string) => {
        const campusMap: Record<string, string> = {
          'maraba': 'Marabá',
          'marabá': 'Marabá',
          'santana do araguaia': 'Santana do Araguaia',
          'rondon do para': 'Rondon do Pará',
          'rondon do pará': 'Rondon do Pará',
          'xinguara': 'Xinguara'
        };
        
        const normalized = this.normalizeText(value).replace('campus de ', '');
        return campusMap[normalized] || value;
      }
    },

    // Tipo de comida
    {
      type: EntityType.TIPO_COMIDA,
      patterns: [
        /(carne|frango|peixe|arroz|feijão|feijao|salada|macarrão|macarrao|batata)/gi,
        /(vegetariano|vegano|vegana)/gi
      ],
      normalizer: (value: string) => {
        return this.capitalizeFirst(this.normalizeText(value));
      }
    },

    // Restrição alimentar
    {
      type: EntityType.RESTRICAO_ALIMENTAR,
      patterns: [
        /(vegetarian[oa]|vegan[oa]|sem\s+carne|sem\s+lactose|sem\s+glúten|sem\s+gluten)/gi,
        /(alérgico\s+a|alergia\s+a|intolerância\s+a|intolerancia\s+a)\s+(\w+)/gi,
        /(celíaco|celiaco)/gi
      ],
      normalizer: (value: string) => {
        const restricaoMap: Record<string, string> = {
          'vegetariano': 'vegetariano',
          'vegetariana': 'vegetariano',
          'vegano': 'vegano',
          'vegana': 'vegano',
          'sem carne': 'vegetariano',
          'sem lactose': 'intolerância à lactose',
          'sem gluten': 'intolerância ao glúten',
          'sem glúten': 'intolerância ao glúten',
          'celiaco': 'celíaco',
          'celíaco': 'celíaco'
        };
        
        const normalized = this.normalizeText(value);
        return restricaoMap[normalized] || value;
      }
    },

    // Forma de pagamento
    {
      type: EntityType.FORMA_PAGAMENTO,
      patterns: [
        /(cartão|cartao|pix|dinheiro|crédito|credito|débito|debito)/gi,
        /(card|cash|credit)/gi
      ],
      normalizer: (value: string) => {
        const pagamentoMap: Record<string, string> = {
          'cartao': 'cartão',
          'cartão': 'cartão',
          'card': 'cartão',
          'pix': 'PIX',
          'dinheiro': 'dinheiro',
          'cash': 'dinheiro',
          'credito': 'crédito',
          'crédito': 'crédito',
          'credit': 'crédito',
          'debito': 'débito',
          'débito': 'débito'
        };
        
        const normalized = this.normalizeText(value);
        return pagamentoMap[normalized] || value;
      }
    },

    // Número
    {
      type: EntityType.NUMERO,
      patterns: [
        /\b(\d+(?:[.,]\d+)?)\b/g
      ],
      normalizer: (value: string) => {
        return parseFloat(value.replace(',', '.'));
      }
    },

    // Período (hoje, amanhã, próxima semana, etc.)
    {
      type: EntityType.PERIODO,
      patterns: [
        /(hoje|amanhã|amanha|ontem|essa\s+semana|próxima\s+semana|proxima\s+semana)/gi,
        /(agora|atualmente|no\s+momento)/gi
      ],
      normalizer: (value: string) => {
        const periodoMap: Record<string, string> = {
          'hoje': 'hoje',
          'amanha': 'amanhã',
          'amanhã': 'amanhã',
          'ontem': 'ontem',
          'essa semana': 'esta semana',
          'proxima semana': 'próxima semana',
          'próxima semana': 'próxima semana',
          'agora': 'agora',
          'atualmente': 'atualmente',
          'no momento': 'no momento'
        };
        
        const normalized = this.normalizeText(value);
        return periodoMap[normalized] || value;
      }
    }
  ];

  /**
   * Extrai todas as entidades de uma mensagem
   */
  async extract(message: string): Promise<EntityExtractionResult> {
    const startTime = Date.now();
    const entities: Entity[] = [];

    console.log('🔍 Extraindo entidades de:', message);

    for (const pattern of this.entityPatterns) {
      for (const regex of pattern.patterns) {
        const matches = Array.from(message.matchAll(regex));
        
        for (const match of matches) {
          const rawValue = match[0];
          let normalizedValue = rawValue;
          let confidence = 0.8;

          // Aplicar normalizador se existir
          if (pattern.normalizer) {
            const normalized = pattern.normalizer(rawValue);
            if (normalized !== null && normalized !== undefined) {
              normalizedValue = normalized;
              confidence = 0.9;
            } else {
              continue; // Pular se normalização falhar
            }
          }

          // Aplicar validador se existir
          if (pattern.validator) {
            if (!pattern.validator(normalizedValue)) {
              continue; // Pular se validação falhar
            }
            confidence = 0.95;
          }

          // Adicionar entidade
          entities.push({
            type: pattern.type,
            value: rawValue,
            normalizedValue,
            confidence,
            startPos: match.index,
            endPos: match.index ? match.index + rawValue.length : undefined
          });
        }
      }
    }

    // Remover duplicatas (mesma posição e tipo)
    const uniqueEntities = this.removeDuplicates(entities);

    const processingTime = Date.now() - startTime;
    console.log(`✅ ${uniqueEntities.length} entidades extraídas em ${processingTime}ms`);

    return {
      entities: uniqueEntities,
      rawText: message
    };
  }

  /**
   * Extrai entidades de um tipo específico
   */
  async extractByType(message: string, type: EntityType): Promise<Entity[]> {
    const result = await this.extract(message);
    return result.entities.filter(e => e.type === type);
  }

  /**
   * Remove entidades duplicadas
   */
  private removeDuplicates(entities: Entity[]): Entity[] {
    const seen = new Set<string>();
    const unique: Entity[] = [];

    for (const entity of entities) {
      const key = `${entity.type}-${entity.startPos}-${entity.endPos}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entity);
      }
    }

    return unique;
  }

  /**
   * Normaliza texto
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Capitaliza primeira letra
   */
  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Converte nome do mês para número
   */
  private getMonthNumber(monthName: string): number | null {
    const months: Record<string, number> = {
      'janeiro': 1, 'jan': 1,
      'fevereiro': 2, 'fev': 2,
      'março': 3, 'marco': 3, 'mar': 3,
      'abril': 4, 'abr': 4,
      'maio': 5, 'mai': 5,
      'junho': 6, 'jun': 6,
      'julho': 7, 'jul': 7,
      'agosto': 8, 'ago': 8,
      'setembro': 9, 'set': 9,
      'outubro': 10, 'out': 10,
      'novembro': 11, 'nov': 11,
      'dezembro': 12, 'dez': 12
    };

    const normalized = this.normalizeText(monthName);
    return months[normalized] || null;
  }

  /**
   * Adiciona um novo padrão de entidade
   */
  addEntityPattern(pattern: EntityPattern): void {
    this.entityPatterns.push(pattern);
  }

  /**
   * Remove um padrão de entidade
   */
  removeEntityPattern(type: EntityType): void {
    this.entityPatterns = this.entityPatterns.filter(p => p.type !== type);
  }
}

// Singleton
export const entityExtractionService = new EntityExtractionService();





