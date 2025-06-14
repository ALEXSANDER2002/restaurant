"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, X, MessageSquare, ChevronDown, ChevronUp, Utensils, ThumbsUp, ThumbsDown, Star, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getResponseByKeywords } from "@/lib/chat-responses"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  isNew?: boolean
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Olá! Sou o assistente do Restaurante Universitário. Como posso ajudar você hoje?",
      role: "assistant",
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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const typingInterval = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isChatOpen, isMinimized])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (typingInterval.current) clearInterval(typingInterval.current)
    }
  }, [])

  // Simulate typing effect for loading text
  const simulateTyping = (text: string) => {
    let currentIndex = 0
    const phrases = [
      "Analisando sua pergunta...",
      "Buscando informações...",
      "Preparando resposta...",
      "Quase pronto...",
    ]

    setLoadingText("")

    if (typingInterval.current) clearInterval(typingInterval.current)

    typingInterval.current = setInterval(() => {
      const currentPhrase = phrases[Math.floor(currentIndex / 20) % phrases.length]
      setLoadingText(currentPhrase.substring(0, (currentIndex % 20) + 1))
      currentIndex++
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      content: input,
      role: "user",
      isNew: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setLoadingProgress(0)
    simulateTyping("Analisando sua pergunta...")

    // Simulate progress
    if (progressInterval.current) clearInterval(progressInterval.current)

    progressInterval.current = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 300)

    // Simulate a small delay for a more natural conversation flow
    setTimeout(() => {
      try {
        // Get response based on keywords
        const response = getResponseByKeywords(input.toLowerCase())

        // Clear intervals
        if (progressInterval.current) clearInterval(progressInterval.current)
        if (typingInterval.current) clearInterval(typingInterval.current)

        setLoadingProgress(100)

        // Add AI response with slight delay for transition
        setTimeout(() => {
          const assistantMessageId = (Date.now() + 1).toString()
          const assistantMessage: Message = {
            id: assistantMessageId,
            content: response,
            role: "assistant",
            isNew: true,
          }

          setMessages((prev) => [...prev, assistantMessage])
          setIsLoading(false)

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
          }, 2000)
        }, 300)
      } catch (error) {
        console.error("Error processing message:", error)

        // Clear intervals
        if (progressInterval.current) clearInterval(progressInterval.current)
        if (typingInterval.current) clearInterval(typingInterval.current)

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente mais tarde.",
          role: "assistant",
          isNew: true,
        }

        setMessages((prev) => [...prev, errorMessage])
        setIsLoading(false)
      }
    }, 2000) // 2000ms delay to simulate thinking
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleCloseChat = () => {
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
          content: "Olá! Sou o assistente do Restaurante Universitário. Como posso ajudar você hoje?",
          role: "assistant",
        },
      ])
      // Reset input if there was any
      setInput("")
      // Reset loading states
      setIsLoading(false)
      setLoadingProgress(0)
      setLoadingText("")
    }, 500)
  }

  const handleSurveySubmit = () => {
    // Here you would typically send the survey data to your backend
    console.log("Survey submitted:", {
      satisfactionRating,
      easeOfUseRating,
      feedback: surveyFeedback,
    })

    // Show thank you message
    setSurveySubmitted(true)

    // Close survey and chat after a delay
    setTimeout(handleSurveyClose, 2000)
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

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
                "bg-white flex flex-col fixed sm:relative bottom-4 right-4 sm:bottom-auto sm:right-auto"
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
                  <CardTitle className="text-lg">Assistente do RU</CardTitle>
                </div>
                <div className="flex items-center gap-2">
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
                          placeholder="Digite sua mensagem..."
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