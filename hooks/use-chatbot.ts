import { useState, useCallback, useRef, useEffect } from 'react';
import { chatAnalyticsService } from '@/services/chat-analytics-service';

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  isNew?: boolean;
  timestamp: number;
  feedback?: {
    helpful: boolean | null;
    rating?: number;
    comment?: string;
  };
}

interface QuickSuggestion {
  text: string;
  category: string;
  priority: number;
}

interface UseChatbotOptions {
  language?: string;
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: string) => void;
  onError?: (error: string) => void;
}

export function useChatbot(options: UseChatbotOptions = {}) {
  const {
    language = 'pt-BR',
    onMessageSent,
    onResponseReceived,
    onError
  } = options;

  // Estados principais
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Estados de UI
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Estados de acessibilidade
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  
  // Estados de feedback
  const [showSurvey, setShowSurvey] = useState(false);
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);
  const [easeOfUseRating, setEaseOfUseRating] = useState<number | null>(null);
  const [surveyFeedback, setSurveyFeedback] = useState("");
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const typingInterval = useRef<NodeJS.Timeout | null>(null);

  // Sugestões inteligentes
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([]);

  // Detectar preferência de redução de movimento
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: reducedMotion ? "auto" : "smooth" 
    });
  }, [messages, reducedMotion]);

  // Focus no input quando o chat abre
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Cleanup de intervals
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (typingInterval.current) clearInterval(typingInterval.current);
    };
  }, []);

  // Cleanup analytics quando o componente desmonta
  useEffect(() => {
    return () => {
      chatAnalyticsService.endCurrentSession();
    };
  }, []);

  // Gerar sugestões contextuais
  const generateContextualSuggestions = useCallback(() => {
    if (messages.length <= 1) {
      return [
        { text: "Qual o horário de funcionamento?", category: "horario", priority: 1 },
        { text: "Quais são os preços?", category: "preco", priority: 1 },
        { text: "Onde fica localizado?", category: "localizacao", priority: 1 },
        { text: "Qual o cardápio de hoje?", category: "cardapio", priority: 2 },
        { text: "Como funciona o auxílio alimentação?", category: "programas", priority: 2 }
      ];
    }

    const lastMessage = messages[messages.length - 1];
    const lastContent = lastMessage.content.toLowerCase();
    
    if (lastContent.includes('horário') || lastContent.includes('funciona')) {
      return [
        { text: "O RU funciona nos finais de semana?", category: "horario", priority: 2 },
        { text: "Qual o horário de almoço?", category: "horario", priority: 2 },
        { text: "Quais são os preços?", category: "preco", priority: 3 }
      ];
    } else if (lastContent.includes('preço') || lastContent.includes('custo')) {
      return [
        { text: "Como funciona o cartão do estudante?", category: "pagamento", priority: 2 },
        { text: "Quais formas de pagamento aceitam?", category: "pagamento", priority: 2 },
        { text: "Como funciona o auxílio alimentação?", category: "programas", priority: 3 }
      ];
    } else if (lastContent.includes('cardápio') || lastContent.includes('comida')) {
      return [
        { text: "Tem opção vegetariana?", category: "cardapio", priority: 2 },
        { text: "O que inclui o almoço?", category: "cardapio", priority: 2 },
        { text: "Qual o horário de funcionamento?", category: "horario", priority: 3 }
      ];
    }

    return [
      { text: "Qual o horário de funcionamento?", category: "horario", priority: 2 },
      { text: "Quais são os preços?", category: "preco", priority: 2 },
      { text: "Onde fica localizado?", category: "localizacao", priority: 2 }
    ];
  }, [messages]);

  // Atualizar sugestões quando mensagens mudam
  useEffect(() => {
    setQuickSuggestions(generateContextualSuggestions());
  }, [generateContextualSuggestions]);

  // Simular efeito de digitação
  const simulateTyping = useCallback((text: string) => {
    let currentIndex = 0;
    const phrases = [
      "Analisando sua pergunta...",
      "Buscando informações...",
      "Preparando resposta...",
      "Quase pronto..."
    ];

    setLoadingText("");

    if (typingInterval.current) clearInterval(typingInterval.current);

    typingInterval.current = setInterval(() => {
      const currentPhrase = phrases[Math.floor(currentIndex / 20) % phrases.length];
      setLoadingText(currentPhrase.substring(0, (currentIndex % 20) + 1));
      currentIndex++;
    }, 50);
  }, []);

  // Simular progresso
  const simulateProgress = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 25;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);
  }, []);

  // Limpar intervals
  const clearIntervals = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (typingInterval.current) clearInterval(typingInterval.current);
  }, []);

  // Adicionar mensagem do usuário
  const addUserMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      isNew: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    onMessageSent?.(content);
    
    return userMessage;
  }, [onMessageSent]);

  // Adicionar mensagem do assistente
  const addAssistantMessage = useCallback((content: string, isNew = true) => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content,
      role: "assistant",
      isNew,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    onResponseReceived?.(content);
    
    return assistantMessage;
  }, [onResponseReceived]);

  // Remover flag isNew das mensagens
  const removeNewFlag = useCallback((messageIds: string[]) => {
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isNew: false } : msg
        )
      );
    }, reducedMotion ? 0 : 1000);
  }, [reducedMotion]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const startTime = Date.now();
    const userMessage = addUserMessage(content);
    
    setIsLoading(true);
    setLoadingProgress(0);
    simulateTyping("");
    simulateProgress();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: messages.concat([userMessage]),
          language
        }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      clearIntervals();
      setLoadingProgress(100);

      setTimeout(() => {
        const assistantMessage = addAssistantMessage(
          data.response || "Desculpe, não consegui gerar uma resposta adequada.",
          true
        );

        setIsLoading(false);

        // Rastrear interação no analytics
        chatAnalyticsService.trackInteraction(
          content,
          data.response || "Erro na resposta",
          responseTime,
          language
        );

        // Remover flag isNew
        removeNewFlag([userMessage.id, assistantMessage.id]);
      }, reducedMotion ? 0 : 150);

    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      clearIntervals();
      setLoadingProgress(100);

      // Fallback para resposta baseada em palavras-chave
      const fallbackResponse = "Desculpe, estou com dificuldades técnicas. Posso ajudar com informações básicas sobre o RU.";
      
      setTimeout(() => {
        const assistantMessage = addAssistantMessage(fallbackResponse, true);
        setIsLoading(false);

        // Rastrear interação de fallback
        chatAnalyticsService.trackInteraction(
          content,
          fallbackResponse,
          Date.now() - startTime,
          language
        );

        removeNewFlag([userMessage.id, assistantMessage.id]);
      }, reducedMotion ? 0 : 150);

      onError?.("Erro ao processar mensagem. Tente novamente.");
    }
  }, [messages, language, addUserMessage, addAssistantMessage, clearIntervals, simulateTyping, simulateProgress, removeNewFlag, onError]);

  // Lidar com sugestão rápida
  const handleQuickSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Feedback de mensagem
  const handleMessageFeedback = useCallback((messageId: string, helpful: boolean, rating?: number, comment?: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: { helpful, rating, comment } }
        : msg
    ));
    
    chatAnalyticsService.trackFeedback(messageId, helpful, rating, comment);
  }, []);

  // Controles do chat
  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleMinimize = useCallback(() => setIsMinimized(prev => !prev), []);
  
  // Controles de acessibilidade
  const toggleReducedMotion = useCallback(() => setReducedMotion(prev => !prev), []);
  const changeFontSize = useCallback((size: 'small' | 'medium' | 'large') => setFontSize(size), []);
  const toggleHighContrast = useCallback(() => setHighContrast(prev => !prev), []);

  // Controles de sugestões
  const toggleSuggestions = useCallback(() => setShowSuggestions(prev => !prev), []);

  // Controles de feedback
  const openSurvey = useCallback(() => setShowSurvey(true), []);
  const closeSurvey = useCallback(() => setShowSurvey(false), []);
  const submitSurvey = useCallback(() => {
    if (satisfactionRating) {
      chatAnalyticsService.trackFeedback(
        'session_survey',
        satisfactionRating >= 4,
        satisfactionRating,
        surveyFeedback
      );
    }
    setSurveySubmitted(true);
    setTimeout(() => {
      setShowSurvey(false);
      setIsOpen(false);
      // Reset survey
      setSatisfactionRating(null);
      setEaseOfUseRating(null);
      setSurveyFeedback("");
      setSurveySubmitted(false);
    }, 1000);
  }, [satisfactionRating, surveyFeedback]);

  // Reset do chat
  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setLoadingProgress(0);
    setLoadingText("");
    setShowSuggestions(true);
  }, []);

  return {
    // Estados
    messages,
    input,
    isLoading,
    isOpen,
    isMinimized,
    loadingProgress,
    loadingText,
    showSuggestions,
    quickSuggestions,
    reducedMotion,
    fontSize,
    highContrast,
    showSurvey,
    satisfactionRating,
    easeOfUseRating,
    surveyFeedback,
    surveySubmitted,
    
    // Refs
    messagesEndRef,
    inputRef,
    
    // Ações
    setInput,
    sendMessage,
    handleQuickSuggestion,
    handleMessageFeedback,
    openChat,
    closeChat,
    toggleChat,
    toggleMinimize,
    toggleReducedMotion,
    changeFontSize,
    toggleHighContrast,
    toggleSuggestions,
    openSurvey,
    closeSurvey,
    submitSurvey,
    resetChat,
    
    // Setters para feedback
    setSatisfactionRating,
    setEaseOfUseRating,
    setSurveyFeedback,
  };
}
