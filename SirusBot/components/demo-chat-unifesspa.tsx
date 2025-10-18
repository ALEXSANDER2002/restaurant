"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles, Utensils, MapPin, Clock, DollarSign } from "lucide-react"

export function DemoChatUNIFESSPA() {
  const [isOpen, setIsOpen] = useState(false)

  const features = [
    {
      icon: <Bot className="h-5 w-5" />,
      title: "Assistente Inteligente",
      description: "Powered by Google Gemini AI para respostas mais naturais e contextuais"
    },
    {
      icon: <Utensils className="h-5 w-5" />,
      title: "Informações do RU",
      description: "Cardápio, preços, horários e informações específicas da UNIFESSPA"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Localização Precisa",
      description: "Informações detalhadas dos campus de Marabá, Santana, Rondon e Xinguara"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Horários Atualizados",
      description: "Funcionamento: Segunda a sexta, 11h-14h (apenas almoço)"
    },
  ]

  const exampleQuestions = [
    "Qual o cardápio de hoje?",
    "Quanto custa uma refeição para estudante?",
    "Onde fica o RU no campus?",
    "Como solicitar auxílio alimentação?",
    "Quais formas de pagamento vocês aceitam?",
    "O RU funciona aos finais de semana?",
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <img src="/Sirus-logo.svg" className="h-8 w-8" alt="SIRUS Logo" />
          <h1 className="text-3xl font-bold text-gray-900">
            Chatbot UNIFESSPA
          </h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Atualizada
          </Badge>
        </div>
        <p className="text-lg text-gray-600">
          Assistente virtual inteligente do Restaurante Universitário da UNIFESSPA
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <DollarSign className="h-5 w-5" />
            Preços Atualizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">R$ 2,00</div>
              <div className="text-sm text-gray-600">Estudantes Subsidiados</div>
              <div className="text-xs text-gray-500">(com cota por escola, cor, renda)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">R$ 13,00</div>
              <div className="text-sm text-gray-600">Não Subsidiados/Visitantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Experimente Perguntas Como:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {exampleQuestions.map((question, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                "{question}"
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          O chatbot está sempre disponível no canto inferior direito da tela
        </p>
        <div className="flex justify-center">
          <div className="animate-bounce">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white shadow-lg">
              <Bot className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}