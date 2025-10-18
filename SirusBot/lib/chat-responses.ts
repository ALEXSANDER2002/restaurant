import stringSimilarity from "string-similarity"

// Banco de dados de respostas baseadas em palavras-chave
type ResponseData = {
  keywords: string[]
  response: string
}

const responseDatabase: ResponseData[] = [
  {
    keywords: ["horário", "horarios", "hora", "abre", "fecha", "funcionamento", "expediente"],
    response:
      "O Restaurante Universitário da UNIFESSPA funciona de segunda a sexta-feira:\n\n🕐 **Horário:**\n• Almoço: 11h00 às 14h00\n\n❌ Não servimos jantar\n❌ Fechado aos finais de semana e feriados.\n\n📍 Localizado no Campus de Marabá - Folha 31, Quadra 07, Lote Especial, Nova Marabá.",
  },
  {
    keywords: ["preço", "precos", "valor", "custo", "quanto custa", "pagar"],
    response:
      "💰 **Preços das refeições no RU da UNIFESSPA:**\n\n• 🎓 Estudantes Subsidiados: R$ 2,00 (com cota por escola, cor, renda)\n• 👥 Não Subsidiados/Visitantes: R$ 13,00\n\n💡 **Dica:** Estudantes em vulnerabilidade social podem solicitar auxílio alimentação junto à PRAE para refeições gratuitas ou com desconto!",
  },
  {
    keywords: [
      "cardápio",
      "cardapio",
      "comida",
      "menu",
      "refeição",
      "refeicao",
      "prato",
      "almoço",
      "almocar",
      "jantar",
    ],
    response:
      "Nosso cardápio varia diariamente e sempre inclui:\n\n• Arroz e feijão\n• Prato principal (carne ou frango)\n• Opção vegetariana\n• Guarnição\n• Saladas variadas\n• Sobremesa (fruta ou doce)\n• Suco\n\nO cardápio da semana é publicado toda segunda-feira no mural do RU e no site da universidade.",
  },
  {
    keywords: ["vegetariano", "vegano", "vegetariana", "vegana", "sem carne"],
    response:
      "Sim, oferecemos opção vegetariana em todas as refeições! Nosso cardápio vegetariano é elaborado por nutricionistas para garantir o equilíbrio nutricional.",
  },
  {
    keywords: ["pagamento", "pagar", "cartão", "cartao", "dinheiro", "pix", "crédito", "credito", "débito", "debito"],
    response:
      "Aceitamos as seguintes formas de pagamento:\n\n• Cartão do estudante (com créditos)\n• Dinheiro\n• Pix\n\nNão aceitamos cartões de crédito ou débito.",
  },
  {
    keywords: ["localização", "localizacao", "onde", "endereço", "endereco", "lugar", "fica", "unifesspa", "marabá"],
    response:
      "📍 **Localização do RU da UNIFESSPA:**\n\n🏛️ **Campus Principal - Marabá:**\nFolha 31, Quadra 07, Lote Especial\nNova Marabá - PA\n\n🗺️ O RU fica no Bloco Central do Campus, próximo à Biblioteca. Há placas indicativas por todo o campus para facilitar a localização.\n\n🚌 **Transporte:** Acessível por transporte público e possui estacionamento para veículos.",
  },
  {
    keywords: ["fila", "filas", "lotado", "cheio", "espera", "demora"],
    response:
      "As filas costumam ser maiores entre 12h e 13h. Para evitar filas, recomendamos chegar logo após a abertura (11h) ou próximo ao final do horário (13h30).",
  },
  {
    keywords: ["crédito", "credito", "recarga", "carregar", "cartão", "cartao"],
    response:
      "Você pode recarregar os créditos do seu cartão do RU na Central de Atendimento ao Estudante, localizada no prédio da Reitoria, de segunda a sexta, das 8h às 17h. Também é possível fazer recarga online pelo portal do estudante.",
  },
  {
    keywords: ["bolsa", "auxílio", "auxilio", "assistência", "assistencia", "gratuito", "grátis", "gratis"],
    response:
      "Estudantes em situação de vulnerabilidade socioeconômica podem solicitar auxílio alimentação junto à Pró-Reitoria de Assuntos Estudantis. Com esse auxílio, as refeições podem ser gratuitas ou ter desconto. Consulte o site da PRAE para mais informações.",
  },
  {
    keywords: [
      "contato",
      "telefone",
      "email",
      "e-mail",
      "falar",
      "ouvidoria",
      "reclamação",
      "reclamacao",
      "sugestão",
      "sugestao",
    ],
    response:
      "Para entrar em contato com a administração do RU:\n\n• Telefone: (XX) XXXX-XXXX\n• E-mail: ru@universidade.edu.br\n• Presencialmente: Na administração do RU, de segunda a sexta, das 8h às 17h.",
  },
  {
    keywords: ["covid", "pandemia", "corona", "coronavírus", "coronavirus", "máscara", "mascara", "protocolo"],
    response:
      "Seguimos todos os protocolos de segurança sanitária. Atualmente, o uso de máscara é opcional, mas mantemos dispensers de álcool em gel em vários pontos do restaurante e realizamos higienização constante dos ambientes.",
  },
  {
    keywords: [
      "alergia",
      "alergias",
      "intolerância",
      "intolerancia",
      "alérgico",
      "alergico",
      "glúten",
      "gluten",
      "lactose",
    ],
    response:
      "Informamos os principais alérgenos em cada prato do cardápio. Se você tem alguma alergia ou intolerância alimentar específica, recomendamos consultar a equipe de nutrição do RU para orientações personalizadas.",
  },
  {
    keywords: ["sábado", "sabado", "domingo", "feriado", "fim de semana", "final de semana"],
    response:
      "O Restaurante Universitário não funciona aos sábados, domingos e feriados. Nosso atendimento é apenas de segunda a sexta-feira.",
  },
  {
    keywords: ["café", "cafe", "café da manhã", "cafe da manha", "desjejum", "breakfast"],
    response:
      "Atualmente, o RU oferece apenas almoço, não temos café da manhã nem jantar. Há algumas lanchonetes no campus para outras refeições.",
  },
]

// Resposta padrão quando nenhuma palavra-chave é encontrada
const defaultResponse =
  "Não tenho informações específicas sobre isso. Posso ajudar com horários, preços, cardápio, localização, formas de pagamento e outros assuntos relacionados ao Restaurante Universitário. Como posso ajudar?"

// Função para remover acentos de uma string
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Função para normalizar texto (remover acentos, converter para minúsculas)
function normalizeText(text: string): string {
  return removeAccents(text.toLowerCase())
}

// Função para extrair palavras de uma frase
function extractWords(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((word) => word.length > 2) // Ignorar palavras muito curtas
    .map((word) => normalizeText(word))
}

export function getResponseByKeywords(userInput: string): string {
  const normalizedInput = normalizeText(userInput)
  const userWords = extractWords(userInput)

  // Verificar saudações comuns
  if (normalizedInput.match(/ola|oi|eai|hello|hi|hey/)) {
    return "Olá! Como posso ajudar você hoje com informações sobre o Restaurante Universitário?"
  }

  // Verificar agradecimentos
  if (normalizedInput.match(/obrigado|obrigada|valeu|thanks|thank you|agradecido|agradecida/)) {
    return "De nada! Estou aqui para ajudar. Tem mais alguma pergunta sobre o RU?"
  }

  // Verificar despedidas
  if (normalizedInput.match(/tchau|adeus|ate mais|ate logo|bye|goodbye/)) {
    return "Até mais! Se precisar de mais informações sobre o RU, é só voltar aqui. Tenha um bom dia!"
  }

  // Pontuação mínima de similaridade para considerar uma correspondência
  const SIMILARITY_THRESHOLD = 0.7

  // Armazenar a melhor correspondência encontrada
  let bestMatch = {
    response: "",
    score: 0,
  }

  // Para cada conjunto de palavras-chave no banco de dados
  for (const data of responseDatabase) {
    // Normalizar todas as palavras-chave
    const normalizedKeywords = data.keywords.map(normalizeText)

    // Verificar correspondência exata
    if (normalizedKeywords.some((keyword) => normalizedInput.includes(keyword))) {
      return data.response
    }

    // Verificar similaridade entre palavras
    let maxScore = 0

    // Para cada palavra do usuário
    for (const userWord of userWords) {
      // Verificar similaridade com cada palavra-chave
      for (const keyword of normalizedKeywords) {
        // Calcular similaridade apenas para palavras com comprimento similar
        if (Math.abs(userWord.length - keyword.length) <= 3) {
          const similarity = stringSimilarity.compareTwoStrings(userWord, keyword)
          if (similarity > maxScore) {
            maxScore = similarity
          }
        }
      }
    }

    // Se encontramos uma correspondência melhor
    if (maxScore > bestMatch.score) {
      bestMatch = {
        response: data.response,
        score: maxScore,
      }
    }
  }

  // Se a melhor correspondência encontrada supera o limiar
  if (bestMatch.score >= SIMILARITY_THRESHOLD) {
    return bestMatch.response
  }

  // Se nenhuma correspondência for encontrada, retornar resposta padrão
  return defaultResponse
}
