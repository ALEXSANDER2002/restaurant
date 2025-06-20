"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CalendarDays,
  Utensils, 
  Leaf, 
  Coffee,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CardapioItem {
  id: string
  dia_semana: string
  prato_principal: string
  acompanhamentos: string
  saladas: string
  sobremesa: string
  bebida: string
  opcao_vegetariana: string
  observacoes?: string
}

const DIAS_SEMANA = [
  { key: 'segunda', label: 'Segunda-feira', emoji: '🌟', cor: 'bg-blue-100 text-blue-800' },
  { key: 'terca', label: 'Terça-feira', emoji: '🔥', cor: 'bg-red-100 text-red-800' },
  { key: 'quarta', label: 'Quarta-feira', emoji: '💚', cor: 'bg-green-100 text-green-800' },
  { key: 'quinta', label: 'Quinta-feira', emoji: '⭐', cor: 'bg-yellow-100 text-yellow-800' },
  { key: 'sexta', label: 'Sexta-feira', emoji: '🎉', cor: 'bg-purple-100 text-purple-800' },
]

export function CardapioSemana() {
  const [cardapio, setCardapio] = useState<CardapioItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [diaAtivo, setDiaAtivo] = useState<string>('')

  useEffect(() => {
    carregarCardapio()
    definirDiaAtual()
  }, [])

  const definirDiaAtual = () => {
    const hoje = new Date()
    const diaSemana = hoje.getDay() // 0 = domingo, 1 = segunda, etc.
    
    const mapaDias: { [key: number]: string } = {
      1: 'segunda',
      2: 'terca', 
      3: 'quarta',
      4: 'quinta',
      5: 'sexta'
    }
    
    const diaHoje = mapaDias[diaSemana] || 'segunda'
    setDiaAtivo(diaHoje)
  }

  const carregarCardapio = async () => {
    try {
      setCarregando(true)
      setErro(null)

      const response = await fetch('/api/cardapio')
      const result = await response.json()

      if (result.sucesso) {
        setCardapio(result.data || [])
      } else {
        setErro('Não foi possível carregar o cardápio')
      }
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
      setErro('Erro ao carregar cardápio')
    } finally {
      setCarregando(false)
    }
  }

  const obterCardapioDia = (dia: string) => {
    return cardapio.find(item => item.dia_semana === dia)
  }

  const navegarDia = (direcao: 'anterior' | 'proximo') => {
    const indiceAtual = DIAS_SEMANA.findIndex(d => d.key === diaAtivo)
    
    if (direcao === 'anterior' && indiceAtual > 0) {
      setDiaAtivo(DIAS_SEMANA[indiceAtual - 1].key)
    } else if (direcao === 'proximo' && indiceAtual < DIAS_SEMANA.length - 1) {
      setDiaAtivo(DIAS_SEMANA[indiceAtual + 1].key)
    }
  }

  if (carregando) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando cardápio...</p>
          </div>
        </div>
      </section>
    )
  }

  if (erro || cardapio.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🍽️ Cardápio da Semana
            </h2>
            <p className="text-gray-600 mb-6">
              {erro || 'Cardápio não disponível no momento. Verifique novamente em breve!'}
            </p>
            <Button 
              onClick={carregarCardapio}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const diaInfo = DIAS_SEMANA.find(d => d.key === diaAtivo)
  const cardapioDia = obterCardapioDia(diaAtivo)

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🍽️ Cardápio da Semana
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Confira o que temos preparado especialmente para você! 
            Refeições saborosas e nutritivas todos os dias.
          </p>
          
          {/* Informações dos Horários */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Badge variant="outline" className="bg-white">
              <Clock className="h-3 w-3 mr-1" />
              Almoço: 11h às 14h
            </Badge>
            <Badge variant="outline" className="bg-white">
              <Clock className="h-3 w-3 mr-1" />
              Jantar: 17h às 19h30
            </Badge>
          </div>
        </div>

        {/* Navegação dos Dias */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DIAS_SEMANA.map(dia => (
            <Button
              key={dia.key}
              variant={diaAtivo === dia.key ? "default" : "outline"}
              onClick={() => setDiaAtivo(dia.key)}
              className={cn(
                "text-sm font-medium transition-all",
                diaAtivo === dia.key 
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg scale-105" 
                  : "border-orange-200 text-orange-700 hover:bg-orange-100"
              )}
            >
              {dia.emoji} {dia.label.split('-')[0]}
            </Button>
          ))}
        </div>

        {/* Navegação Mobile */}
        <div className="flex justify-center items-center gap-4 mb-8 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarDia('anterior')}
            disabled={DIAS_SEMANA.findIndex(d => d.key === diaAtivo) === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Badge className={cn("px-4 py-2 text-sm font-medium", diaInfo?.cor)}>
            {diaInfo?.emoji} {diaInfo?.label}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarDia('proximo')}
            disabled={DIAS_SEMANA.findIndex(d => d.key === diaAtivo) === DIAS_SEMANA.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cardápio do Dia */}
        {cardapioDia ? (
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                {diaInfo?.emoji}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {diaInfo?.label}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Prato Principal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Prato Principal</h3>
                  </div>
                  <p className="text-gray-700 bg-orange-50 p-4 rounded-lg border border-orange-100">
                    {cardapioDia.prato_principal}
                  </p>
                </div>

                {/* Opção Vegetariana */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Opção Vegetariana</h3>
                  </div>
                  <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-100">
                    {cardapioDia.opcao_vegetariana}
                  </p>
                </div>

                {/* Acompanhamentos */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">🍚 Acompanhamentos</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {cardapioDia.acompanhamentos}
                  </p>
                </div>

                {/* Saladas */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">🥗 Saladas</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {cardapioDia.saladas}
                  </p>
                </div>

                {/* Sobremesa */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">🍰 Sobremesa</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {cardapioDia.sobremesa}
                  </p>
                </div>

                {/* Bebida */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Coffee className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Bebida</h3>
                  </div>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    {cardapioDia.bebida}
                  </p>
                </div>
              </div>

              {/* Observações */}
              {cardapioDia.observacoes && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Observações</h3>
                  <p className="text-gray-700">{cardapioDia.observacoes}</p>
                </div>
              )}

              {/* Informações Nutricionais */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">
                  🏥 Informações Importantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <span className="font-medium">💰 Estudantes:</span>
                    <br />R$ 3,00
                  </div>
                  <div className="text-center">
                    <span className="font-medium">👨‍🏫 Servidores:</span>
                    <br />R$ 10,00
                  </div>
                  <div className="text-center">
                    <span className="font-medium">👥 Visitantes:</span>
                    <br />R$ 15,00
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardContent className="text-center py-12">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cardápio não disponível
              </h3>
              <p className="text-gray-600">
                O cardápio para {diaInfo?.label.toLowerCase()} ainda não foi cadastrado.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rodapé da Seção */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            * O cardápio pode sofrer alterações sem aviso prévio
          </p>
        </div>
      </div>
    </section>
  )
} 