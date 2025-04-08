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
      "O Restaurante Universitário funciona de segunda a sexta-feira, nos seguintes horários:\n\n• Almoço: 11h às 14h\n• Jantar: 17h às 19h30\n\nEstamos fechados aos finais de semana e feriados.",
  },
  {
    keywords: ["preço", "precos", "valor", "custo", "quanto custa", "pagar"],
    response:
      "Os preços das refeições no RU são:\n\n• Estudantes: R$ 3,00\n• Professores: R$ 10,00\n• Funcionários: R$ 10,00\n• Visitantes: R$ 15,00",
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
    keywords: ["localização", "localizacao", "onde", "endereço", "endereco", "lugar", "fica"],
    response:
      "O Restaurante Universitário está localizado no Bloco Central do Campus Universitário, próximo à Biblioteca Central. É fácil de encontrar, pois há placas indicativas por todo o campus.",
  },
  {
    keywords: ["fila", "filas", "lotado", "cheio", "espera", "demora"],
    response:
      "As filas costumam ser maiores entre 12h e 13h no almoço, e entre 18h e 19h no jantar. Para evitar filas, recomendamos chegar um pouco antes da abertura ou após os horários de pico.",
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
      "Atualmente, o RU não oferece café da manhã, apenas almoço e jantar. Há algumas lanchonetes no campus que servem café da manhã a partir das 7h.",
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
