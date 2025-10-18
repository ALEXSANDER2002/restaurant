/**
 * Serviço de Reconhecimento de Intenções
 * Identifica a intenção do usuário com base na mensagem
 */

import stringSimilarity from 'string-similarity';
import { Intent, IntentRecognitionResult } from '@/types/mcp.types';

/**
 * Padrões de intenção com suas palavras-chave e pesos
 */
interface IntentPattern {
  intent: Intent;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  contextKeywords?: string[];
}

/**
 * Serviço de reconhecimento de intenções robusto
 */
export class IntentRecognitionService {
  private intentPatterns: IntentPattern[] = [
    // Horário e funcionamento
    {
      intent: Intent.HORARIO,
      keywords: [
        'horário', 'horarios', 'hora', 'abre', 'fecha', 'funcionamento',
        'expediente', 'atendimento', 'aberto', 'fechado', 'quando funciona'
      ],
      patterns: [
        /que\s+hora\s+(abre|fecha)/i,
        /horário\s+de\s+funcionamento/i,
        /funciona\s+das/i
      ],
      weight: 1.0
    },
    
    // Preços
    {
      intent: Intent.PRECO,
      keywords: [
        'preço', 'precos', 'valor', 'custo', 'quanto custa', 'pagar',
        'quanto é', 'quanto sai', 'quanto vale', 'caro', 'barato'
      ],
      patterns: [
        /quanto\s+(custa|é|vale)/i,
        /qual\s+o\s+preço/i,
        /valor\s+da\s+refeição/i
      ],
      weight: 1.0
    },
    
    // Localização
    {
      intent: Intent.LOCALIZACAO,
      keywords: [
        'localização', 'localizacao', 'onde', 'endereço', 'endereco',
        'lugar', 'fica', 'unifesspa', 'marabá', 'mapa', 'campus'
      ],
      patterns: [
        /onde\s+(fica|é|está)/i,
        /qual\s+o\s+endereço/i,
        /como\s+chego/i
      ],
      weight: 1.0
    },
    
    // Cardápio
    {
      intent: Intent.CARDAPIO,
      keywords: [
        'cardápio', 'cardapio', 'comida', 'menu', 'refeição', 'refeicao',
        'prato', 'almoço', 'almocar', 'jantar', 'o que tem', 'serve'
      ],
      patterns: [
        /o\s+que\s+(tem|serve)/i,
        /qual\s+o\s+cardápio/i,
        /cardápio\s+de\s+hoje/i
      ],
      weight: 1.0
    },
    
    // Opção vegetariana
    {
      intent: Intent.OPCAO_VEGETARIANA,
      keywords: [
        'vegetariano', 'vegetariana', 'sem carne', 'opção veggie',
        'comida vegetariana', 'prato vegetariano'
      ],
      patterns: [
        /tem\s+opção\s+vegetariana/i,
        /serve\s+vegetariano/i
      ],
      weight: 1.2
    },
    
    // Opção vegana
    {
      intent: Intent.OPCAO_VEGANA,
      keywords: [
        'vegano', 'vegana', 'sem origem animal', 'sem leite',
        'sem ovo', 'plant based', 'comida vegana'
      ],
      patterns: [
        /tem\s+opção\s+vegana/i,
        /serve\s+vegano/i
      ],
      weight: 1.2
    },
    
    // Alergias e intolerâncias
    {
      intent: Intent.ALERGIAS_INTOLERANCIA,
      keywords: [
        'alergia', 'alergias', 'intolerância', 'intolerancia', 'alérgico',
        'alergico', 'glúten', 'gluten', 'lactose', 'alérgeno', 'alergeno',
        'celíaco', 'celiaco'
      ],
      patterns: [
        /tenho\s+alergia/i,
        /sou\s+alérgico/i,
        /intolerância\s+a/i
      ],
      weight: 1.2
    },
    
    // Formas de pagamento
    {
      intent: Intent.FORMAS_PAGAMENTO,
      keywords: [
        'pagamento', 'pagar', 'cartão', 'cartao', 'dinheiro', 'pix',
        'crédito', 'credito', 'débito', 'debito', 'aceita', 'forma de pagar'
      ],
      patterns: [
        /como\s+pago/i,
        /aceita\s+(cartão|pix|dinheiro)/i,
        /formas?\s+de\s+pagamento/i
      ],
      weight: 1.0
    },
    
    // Recarga de cartão
    {
      intent: Intent.RECARGA_CARTAO,
      keywords: [
        'recarga', 'recarregar', 'crédito', 'credito', 'carregar',
        'cartão do estudante', 'colocar crédito', 'adicionar crédito'
      ],
      patterns: [
        /como\s+(recarrego|carrego)/i,
        /recarregar\s+cartão/i,
        /colocar\s+crédito/i
      ],
      weight: 1.1
    },
    
    // Auxílio alimentação
    {
      intent: Intent.AUXILIO_ALIMENTACAO,
      keywords: [
        'auxílio', 'auxilio', 'auxílio alimentação', 'bolsa', 'gratuito',
        'grátis', 'gratis', 'assistência', 'assistencia', 'PRAE'
      ],
      patterns: [
        /auxílio\s+alimentação/i,
        /refeição\s+gratuita/i,
        /como\s+conseguir\s+bolsa/i
      ],
      weight: 1.1
    },
    
    // Programas sociais
    {
      intent: Intent.PROGRAMAS_SOCIAIS,
      keywords: [
        'programa social', 'programas', 'assistência estudantil',
        'benefício', 'beneficio', 'ajuda', 'apoio'
      ],
      patterns: [
        /programas?\s+sociais?/i,
        /assistência\s+estudantil/i
      ],
      weight: 1.0
    },
    
    // Fila e espera
    {
      intent: Intent.FILA_ESPERA,
      keywords: [
        'fila', 'filas', 'lotado', 'cheio', 'espera', 'demora',
        'movimento', 'pico', 'horário de pico'
      ],
      patterns: [
        /tem\s+fila/i,
        /quanto\s+tempo\s+de\s+espera/i,
        /está\s+lotado/i
      ],
      weight: 1.0
    },
    
    // Funcionamento em feriados
    {
      intent: Intent.FUNCIONAMENTO_FERIADO,
      keywords: [
        'sábado', 'sabado', 'domingo', 'feriado', 'fim de semana',
        'final de semana', 'fecha no feriado', 'abre sábado'
      ],
      patterns: [
        /funciona\s+(sábado|domingo|feriado)/i,
        /abre\s+no\s+fim\s+de\s+semana/i
      ],
      weight: 1.1
    },
    
    // Protocolo sanitário
    {
      intent: Intent.PROTOCOLO_SANITARIO,
      keywords: [
        'covid', 'pandemia', 'corona', 'coronavírus', 'coronavirus',
        'máscara', 'mascara', 'protocolo', 'higiene', 'álcool gel',
        'sanitário', 'sanitario', 'segurança'
      ],
      patterns: [
        /protocolo\s+de\s+segurança/i,
        /precisa\s+de\s+máscara/i,
        /medidas\s+sanitárias/i
      ],
      weight: 1.0
    },
    
    // Contato
    {
      intent: Intent.CONTATO,
      keywords: [
        'contato', 'telefone', 'email', 'e-mail', 'falar', 'ouvidoria',
        'reclamação', 'reclamacao', 'sugestão', 'sugestao', 'reclamar'
      ],
      patterns: [
        /como\s+entro\s+em\s+contato/i,
        /telefone\s+do\s+RU/i,
        /fazer\s+reclamação/i
      ],
      weight: 1.0
    },
    
    // Saudação
    {
      intent: Intent.SAUDACAO,
      keywords: [
        'ola', 'olá', 'oi', 'eai', 'e ai', 'hello', 'hi', 'hey',
        'bom dia', 'boa tarde', 'boa noite', 'salve'
      ],
      patterns: [
        /^(ola|olá|oi|hey|hi)/i,
        /bom\s+dia/i,
        /boa\s+(tarde|noite)/i
      ],
      weight: 0.9
    },
    
    // Agradecimento
    {
      intent: Intent.AGRADECIMENTO,
      keywords: [
        'obrigado', 'obrigada', 'valeu', 'thanks', 'thank you',
        'agradecido', 'agradecida', 'grato', 'grata'
      ],
      patterns: [
        /^obrigad[oa]/i,
        /muito\s+obrigado/i,
        /^valeu/i
      ],
      weight: 0.9
    },
    
    // Despedida
    {
      intent: Intent.DESPEDIDA,
      keywords: [
        'tchau', 'adeus', 'ate mais', 'ate logo', 'até mais', 'até logo',
        'bye', 'goodbye', 'falou', 'flw', 'até', 'até a próxima'
      ],
      patterns: [
        /^tchau/i,
        /até\s+(mais|logo|a\s+próxima)/i,
        /^(bye|goodbye)/i
      ],
      weight: 0.9
    }
  ];

  private minConfidenceThreshold = 0.3;

  /**
   * Reconhece a intenção da mensagem do usuário
   */
  async recognize(message: string, context?: any): Promise<IntentRecognitionResult> {
    const startTime = Date.now();
    const normalizedMessage = this.normalizeText(message);
    
    console.log('🎯 Reconhecendo intenção para:', message);

    // Calcular scores para cada intenção
    const intentScores = this.calculateIntentScores(normalizedMessage);

    // Ordenar por score
    intentScores.sort((a, b) => b.score - a.score);

    // Melhor intenção
    const topIntent = intentScores[0];
    
    // Alternativas (com score >= 50% do melhor)
    const alternatives = intentScores
      .slice(1, 4)
      .filter(is => is.score >= topIntent.score * 0.5 && is.score >= this.minConfidenceThreshold)
      .map(is => ({
        intent: is.intent,
        confidence: is.score
      }));

    // Se o score for muito baixo, marcar como desconhecida
    const finalIntent = topIntent.score < this.minConfidenceThreshold 
      ? Intent.DESCONHECIDA 
      : topIntent.intent;
    
    const finalConfidence = topIntent.score < this.minConfidenceThreshold 
      ? topIntent.score * 0.5 
      : topIntent.score;

    const processingTime = Date.now() - startTime;

    console.log(`✅ Intenção reconhecida: ${finalIntent} (confiança: ${finalConfidence.toFixed(2)})`);

    return {
      intent: finalIntent,
      confidence: finalConfidence,
      alternativeIntents: alternatives.length > 0 ? alternatives : undefined,
      metadata: {
        processingTime,
        allScores: intentScores.slice(0, 5)
      }
    };
  }

  /**
   * Calcula scores para todas as intenções
   */
  private calculateIntentScores(normalizedMessage: string): Array<{ intent: Intent; score: number }> {
    const scores: Array<{ intent: Intent; score: number }> = [];

    for (const pattern of this.intentPatterns) {
      let score = 0;
      let matches = 0;

      // 1. Verificar padrões regex (peso alto)
      for (const regex of pattern.patterns) {
        if (regex.test(normalizedMessage)) {
          score += 0.4 * pattern.weight;
          matches++;
        }
      }

      // 2. Verificar palavras-chave exatas (peso médio)
      const normalizedKeywords = pattern.keywords.map(k => this.normalizeText(k));
      for (const keyword of normalizedKeywords) {
        if (normalizedMessage.includes(keyword)) {
          score += 0.3 * pattern.weight;
          matches++;
        }
      }

      // 3. Verificar similaridade de palavras (peso baixo)
      const messageWords = normalizedMessage.split(/\s+/).filter(w => w.length > 2);
      let maxSimilarity = 0;
      
      for (const word of messageWords) {
        for (const keyword of normalizedKeywords) {
          if (Math.abs(word.length - keyword.length) <= 3) {
            const similarity = stringSimilarity.compareTwoStrings(word, keyword);
            if (similarity > maxSimilarity) {
              maxSimilarity = similarity;
            }
          }
        }
      }

      if (maxSimilarity > 0.7) {
        score += 0.2 * maxSimilarity * pattern.weight;
        matches++;
      }

      // 4. Bonus por múltiplas correspondências
      if (matches > 1) {
        score += 0.1 * Math.min(matches - 1, 3);
      }

      // Normalizar score para [0, 1]
      score = Math.min(score, 1.0);

      scores.push({
        intent: pattern.intent,
        score
      });
    }

    // Adicionar intents especiais com score 0 se não foram detectadas
    const detectedIntents = new Set(scores.map(s => s.intent));
    if (!detectedIntents.has(Intent.DESCONHECIDA)) {
      scores.push({ intent: Intent.DESCONHECIDA, score: 0 });
    }
    if (!detectedIntents.has(Intent.FORA_ESCOPO)) {
      scores.push({ intent: Intent.FORA_ESCOPO, score: 0 });
    }

    return scores;
  }

  /**
   * Normaliza texto para comparação
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Atualiza o threshold mínimo de confiança
   */
  setMinConfidenceThreshold(threshold: number): void {
    this.minConfidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Adiciona um novo padrão de intenção
   */
  addIntentPattern(pattern: IntentPattern): void {
    this.intentPatterns.push(pattern);
  }

  /**
   * Remove um padrão de intenção
   */
  removeIntentPattern(intent: Intent): void {
    this.intentPatterns = this.intentPatterns.filter(p => p.intent !== intent);
  }
}

// Singleton
export const intentRecognitionService = new IntentRecognitionService();


