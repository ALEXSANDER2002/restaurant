"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Send, X, MessageSquare, ChevronDown, ChevronUp, Utensils, ThumbsUp, ThumbsDown, Star, MessageCircle, Lightbulb, RefreshCw, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getResponseByKeywords } from "@/lib/chat-responses"
import { useIdioma } from "@/contexts/idioma-context"
import { chatAnalyticsService } from "@/services/chat-analytics-service"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  isNew?: boolean
  timestamp: number
  feedback?: {
    helpful: boolean | null
    rating?: number
    comment?: string
  }
}

interface QuickSuggestion {
  text: string
  category: string
  priority: number
}

export function ChatBot() {
  const { idioma, t } = useIdioma()
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  const getInitialMessage = () => {
    switch (idioma) {
      case 'en-US':
        return "Hello! I'm the virtual assistant for UNIFESSPA's University Restaurant! 🍽️ I can help with information about schedules, menu, prices, location and much more. How can I help you today?"
      case 'es':
        return "¡Hola! ¡Soy el asistente virtual del Restaurante Universitario de UNIFESSPA! 🍽️ Puedo ayudar con información sobre horarios, menú, precios, ubicación y mucho más. ¿Cómo puedo ayudarte hoy?"
      case 'fr':
        return "Bonjour ! Je suis l'assistant virtuel du Restaurant Universitaire de l'UNIFESSPA ! 🍽️ Je peux vous aider avec des informations sur les horaires, le menu, les prix, l'emplacement et bien plus encore. Comment puis-je vous aider aujourd'hui ?"
      default:
        return "Olá! Sou o assistente virtual do Restaurante Universitário da UNIFESSPA! 🍽️ Posso ajudar com informações sobre horários, cardápio, preços, localização e muito mais. Como posso ajudar você hoje?"
    }
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: getInitialMessage(),
      role: "assistant",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("")
  const [showSurvey, setShowSurvey] = useState(false)
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null)
  const [easeOfUseRating, setEaseOfUseRating] = useState<number | null>(null)
  const [surveyFeedback, setSurveyFeedback] = useState("")
  const [surveySubmitted, setSurveySubmitted] = useState(false)
  
  // Novos estados para funcionalidades avançadas
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [highContrast, setHighContrast] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const typingInterval = useRef<NodeJS.Timeout | null>(null)

  // Sugestões inteligentes baseadas no contexto
  const getContextualSuggestions = useCallback(() => {
    if (messages.length <= 1) {
      // Sugestões iniciais de alta prioridade
      return [
        { text: "Qual o horário de funcionamento?", category: "horario", priority: 1 },
        { text: "Quais são os preços?", category: "preco", priority: 1 },
        { text: "Onde fica localizado?", category: "localizacao", priority: 1 },
        { text: "Qual o cardápio de hoje?", category: "cardapio", priority: 2 },
        { text: "Como funciona o auxílio alimentação?", category: "programas", priority: 2 }
      ];
    }

    // Analisar última mensagem para sugestões contextuais
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

    // Sugestões gerais se não houver contexto específico
    return [
      { text: "Qual o horário de funcionamento?", category: "horario", priority: 2 },
      { text: "Quais são os preços?", category: "preco", priority: 2 },
      { text: "Onde fica localizado?", category: "localizacao", priority: 2 }
    ];
  }, [messages]);

  // Atualizar sugestões quando mensagens mudam
  useEffect(() => {
    setQuickSuggestions(getContextualSuggestions());
  }, [messages, getContextualSuggestions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
  }, [messages, reducedMotion])

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isChatOpen, isMinimized])

  // Update initial message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: getInitialMessage(),
        role: "assistant",
        timestamp: Date.now(),
      },
    ])
  }, [idioma])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (typingInterval.current) clearInterval(typingInterval.current)
    }
  }, [])

  // Detectar preferência de redução de movimento
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getLoadingPhrases = () => {
    switch (idioma) {
      case 'en-US':
        return [
          "Analyzing your question...",
          "Searching for information...",
          "Preparing response...",
          "Almost ready...",
        ]
      case 'es':
        return [
          "Analizando su pregunta...",
          "Buscando información...",
          "Preparando respuesta...",
          "Casi listo...",
        ]
      case 'fr':
        return [
          "Analyse de votre question...",
          "Recherche d'informations...",
          "Préparation de la réponse...",
          "Presque prêt...",
        ]
      default:
        return [
          "Analisando sua pergunta...",
          "Buscando informações...",
          "Preparando resposta...",
          "Quase pronto...",
        ]
    }
  }

  // Simulate typing effect for loading text
  const simulateTyping = (text: string) => {
    let currentIndex = 0
    const phrases = getLoadingPhrases()

    setLoadingText("")

    if (typingInterval.current) clearInterval(typingInterval.current)

    typingInterval.current = setInterval(() => {
      const currentPhrase = phrases[Math.floor(currentIndex / 20) % phrases.length]
      setLoadingText(currentPhrase.substring(0, (currentIndex % 20) + 1))
      currentIndex++
    }, 50)
  }

  // Função para lidar com sugestões rápidas
  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
    // Focar no input para permitir edição se necessário
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Função para feedback de mensagens individuais
  const handleMessageFeedback = (messageId: string, helpful: boolean, rating?: number, comment?: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: { helpful, rating, comment } }
        : msg
    ));
    
    // Rastrear feedback no analytics
    chatAnalyticsService.trackFeedback(messageId, helpful, rating, comment);
    
    console.log('Feedback da mensagem:', { messageId, helpful, rating, comment });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const startTime = Date.now();

    // Add user message
    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      content: input,
      role: "user",
      isNew: true,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setLoadingProgress(0)
    simulateTyping("")

    // Simulate progress
    if (progressInterval.current) clearInterval(progressInterval.current)

    progressInterval.current = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 25
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 150)

    // Processar mensagem com IA (usando MCP)
    try {
      // Fazer chamada para API do chat com MCP
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          messages: messages.concat([userMessage]),
          language: idioma,
          sessionId: sessionId,
          useMCP: true // Ativar sistema MCP
        }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Clear intervals
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (typingInterval.current) clearInterval(typingInterval.current)

      setLoadingProgress(100)

      // Atualizar sugestões contextuais se o MCP retornou sugestões
      if (data.suggestions && data.suggestions.length > 0) {
        setQuickSuggestions(data.suggestions.map((text: string, index: number) => ({
          text,
          category: data.intent || 'geral',
          priority: index + 1
        })));
      }

      // Add AI response with slight delay for transition
      setTimeout(() => {
        const assistantMessageId = (Date.now() + 1).toString()
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: data.response || t("chatbot.erro"),
          role: "assistant",
          isNew: true,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)

        // Rastrear interação no analytics
        chatAnalyticsService.trackInteraction(
          input,
          data.response || t("chatbot.erro"),
          responseTime,
          idioma
        );

        // Log informações do MCP em desenvolvimento
        if (data.usedMCP) {
          console.log('🎯 MCP Ativo:', {
            intent: data.intent,
            confidence: data.confidence,
            entities: data.entities,
            metrics: data.metrics
          });
        }

        // Remove isNew flag after animation
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === userMessageId || msg.id === assistantMessageId) {
                return { ...msg, isNew: false }
              }
              return msg
            }),
          )
        }, reducedMotion ? 0 : 1000)
      }, reducedMotion ? 0 : 150)
    } catch (error) {
      console.error("Error processing message:", error)

      // Clear intervals
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (typingInterval.current) clearInterval(typingInterval.current)

      // Fallback to keyword-based response in case of API error
      const fallbackResponse = getResponseByKeywords(input.toLowerCase())
      const responseTime = Date.now() - startTime;
      
      setLoadingProgress(100)

      setTimeout(() => {
        const assistantMessageId = (Date.now() + 1).toString()
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: fallbackResponse,
          role: "assistant",
          isNew: true,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)

        // Rastrear interação de fallback no analytics
        chatAnalyticsService.trackInteraction(
          input,
          fallbackResponse,
          responseTime,
          idioma
        );

        // Remove isNew flag after animation
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === userMessageId || msg.id === assistantMessageId) {
                return { ...msg, isNew: false }
              }
              return msg
            }),
          )
        }, reducedMotion ? 0 : 1000)
      }, reducedMotion ? 0 : 150)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleCloseChat = () => {
    // Finalizar sessão atual no analytics
    chatAnalyticsService.endCurrentSession();
    
    // Show survey instead of closing chat immediately
    setShowSurvey(true)
  }

  const handleSurveyClose = () => {
    // Close survey and chat
    setShowSurvey(false)
    setIsChatOpen(false)

    // Reset survey for next time
    setTimeout(() => {
      setSatisfactionRating(null)
      setEaseOfUseRating(null)
      setSurveyFeedback("")
      setSurveySubmitted(false)
      // Reset messages to initial state
      setMessages([
        {
          id: "1",
          content: "Olá! Sou o assistente virtual do Restaurante Universitário da UNIFESSPA! 🍽️ Posso ajudar com informações sobre horários, cardápio, preços, localização e muito mais. Como posso ajudar você hoje?",
          role: "assistant",
          timestamp: Date.now(),
        },
      ])
      // Reset input if there was any
      setInput("")
      // Reset loading states
      setIsLoading(false)
      setLoadingProgress(0)
      setLoadingText("")
    }, 250)
  }

  const handleSurveySubmit = () => {
    // Here you would typically send the survey data to your backend
    console.log("Survey submitted:", {
      satisfactionRating,
      easeOfUseRating,
      feedback: surveyFeedback,
    })

    // Rastrear feedback da sessão no analytics
    if (satisfactionRating) {
      chatAnalyticsService.trackFeedback(
        'session_survey',
        satisfactionRating >= 4,
        satisfactionRating,
        surveyFeedback
      );
    }

    // Show thank you message
    setSurveySubmitted(true)

    // Close survey and chat after a delay
    setTimeout(handleSurveyClose, 1000)
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Funções de acessibilidade
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleHighContrast = () => setHighContrast(!highContrast);
  const changeFontSize = (size: 'small' | 'medium' | 'large') => setFontSize(size);

  // Classes CSS baseadas nas configurações de acessibilidade
  const getAccessibilityClasses = () => {
    const baseClasses = "transition-all duration-300";
    const fontSizeClasses = {
      small: "text-xs",
      medium: "text-sm",
      large: "text-base"
    };
    const contrastClasses = highContrast 
      ? "bg-white text-black border-2 border-black" 
      : "bg-white text-gray-900";
    
    return `${baseClasses} ${fontSizeClasses[fontSize]} ${contrastClasses}`;
  };

  // Cleanup analytics when component unmounts
  useEffect(() => {
    return () => {
      chatAnalyticsService.endCurrentSession();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-4">
      {showSurvey && (
        <Card className="w-[90vw] sm:w-[450px] max-w-[450px] shadow-xl animate-pop-in bg-white">
          <CardContent className="p-6 space-y-6">
            {!surveySubmitted ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-base font-medium text-gray-900">Você ficou satisfeito com o atendimento?</h3>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSatisfactionRating(rating)}
                          className={`h-10 w-10 rounded-full border ${
                            satisfactionRating === rating
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 text-gray-600 hover:border-blue-600"
                          } flex items-center justify-center text-sm transition-colors`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 px-2">
                      <span>Insatisfeito</span>
                      <span>Muito satisfeito</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-medium text-gray-900">Foi fácil utilizar o chat?</h3>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setEaseOfUseRating(0)}
                        className={`flex items-center justify-center h-10 w-10 rounded-full border ${
                          easeOfUseRating === 0
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 text-gray-600 hover:border-blue-600"
                        } transition-colors`}
                      >
                        <ThumbsDown className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEaseOfUseRating(1)}
                        className={`flex items-center justify-center h-10 w-10 rounded-full border ${
                          easeOfUseRating === 1
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 text-gray-600 hover:border-blue-600"
                        } transition-colors`}
                      >
                        <ThumbsUp className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-medium text-gray-900">Comentários adicionais (opcional)</h3>
                    <textarea
                      value={surveyFeedback}
                      onChange={(e) => setSurveyFeedback(e.target.value)}
                      className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none bg-white text-gray-900"
                      placeholder="Compartilhe sua experiência ou sugestões..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      onClick={handleSurveyClose}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Pular
                    </Button>
                    <Button
                      onClick={handleSurveySubmit}
                      disabled={!satisfactionRating || easeOfUseRating === null}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Enviar Feedback
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Obrigado pelo seu feedback!</h3>
                  <p className="text-gray-600">Sua opinião nos ajuda a melhorar cada vez mais.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {!showSurvey && (
        <>
          {isChatOpen && (
            <Card
              className={cn(
                "w-[90vw] sm:w-[450px] max-w-[450px] shadow-xl transition-all duration-300",
                isMinimized ? "h-16" : "h-[70vh] max-h-[600px] sm:h-[500px]",
                "bg-white flex flex-col fixed sm:relative bottom-4 right-4 sm:bottom-auto sm:right-auto",
                getAccessibilityClasses()
              )}
            >
              <CardHeader
                className={cn(
                  "flex flex-row items-center justify-between py-3 px-4 rounded-t-lg",
                  "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-white flex items-center justify-center">
                    <img 
                      src="/Sirus-logo.svg" 
                      className="h-6 w-6" 
                      alt="SIRUS Logo" 
                    />
                  </Avatar>
                  <CardTitle className="text-lg">{t("chatbot.titulo")}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {/* Botões de acessibilidade */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 text-white hover:bg-blue-700/30 rounded-full transition-all duration-300"
                    title={isMuted ? "Ativar som" : "Desativar som"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMinimize}
                    className="h-9 w-9 text-white hover:bg-blue-700/30 rounded-full transition-all duration-300"
                  >
                    {isMinimized ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseChat}
                    className="h-9 w-9 text-white hover:bg-blue-700/30 rounded-full transition-all duration-300 hover:rotate-90"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                    {/* Sugestões rápidas */}
                    {showSuggestions && quickSuggestions.length > 0 && (
                      <div className="p-3 border-b bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium text-gray-700">Sugestões:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                          >
                            {showSuggestions ? "Ocultar" : "Mostrar"}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickSuggestion(suggestion.text)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors border border-blue-200"
                            >
                              {suggestion.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-3 text-sm ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            
                            {/* Feedback para mensagens do assistente */}
                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                                <span className="text-xs text-gray-500">Esta resposta foi útil?</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleMessageFeedback(message.id, true)}
                                    className={`p-1 rounded ${
                                      message.feedback?.helpful === true 
                                        ? "bg-green-100 text-green-700" 
                                        : "text-gray-400 hover:text-green-600"
                                    }`}
                                    title="Sim, útil"
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMessageFeedback(message.id, false)}
                                    className={`p-1 rounded ${
                                      message.feedback?.helpful === false 
                                        ? "bg-red-100 text-red-700" 
                                        : "text-gray-400 hover:text-red-600"
                                    }`}
                                    title="Não, não útil"
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t p-3">
                      <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={t("chatbot.placeholder")}
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          )}
          <Button
            onClick={toggleChat}
            className={cn(
              "rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-lg bg-gradient-to-r from-blue-600 to-blue-800",
              "hover:shadow-xl transition-all duration-300 hover:scale-105",
              "flex items-center justify-center text-white"
            )}
          >
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />
          </Button>
        </>
      )}
    </div>
  )
}