"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loading } from "@/components/ui/loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDays, 
  Save, 
  RefreshCw, 
  Utensils, 
  Leaf, 
  Coffee,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

interface CardapioItem {
  id?: string
  dia_semana: string
  prato_principal: string
  acompanhamentos: string
  saladas: string
  sobremesa: string
  bebida: string
  opcao_vegetariana: string
  observacoes?: string
}

interface CardapioSemana {
  [key: string]: CardapioItem
}

const DIAS_SEMANA = [
  { key: 'segunda', label: 'Segunda-feira', emoji: '🌟' },
  { key: 'terca', label: 'Terça-feira', emoji: '🔥' },
  { key: 'quarta', label: 'Quarta-feira', emoji: '💚' },
  { key: 'quinta', label: 'Quinta-feira', emoji: '⭐' },
  { key: 'sexta', label: 'Sexta-feira', emoji: '🎉' },
]

const TEMPLATE_CARDAPIO: CardapioItem = {
  dia_semana: '',
  prato_principal: '',
  acompanhamentos: 'Arroz, Feijão',
  saladas: '',
  sobremesa: '',
  bebida: 'Suco Natural',
  opcao_vegetariana: '',
  observacoes: '',
}

export function GerenciarCardapio() {
  const [cardapio, setCardapio] = useState<CardapioSemana>({})
  const [semanaAtual, setSemanaAtual] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  // Calcular semana atual (segunda-feira)
  const obterSegundaFeira = (data?: Date) => {
    const hoje = data || new Date()
    const diaSemana = hoje.getDay() // 0 = domingo, 1 = segunda, etc.
    const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
    
    const segunda = new Date(hoje)
    segunda.setDate(hoje.getDate() + diasParaSegunda)
    return segunda.toISOString().split('T')[0] // YYYY-MM-DD
  }

  useEffect(() => {
    const segunda = obterSegundaFeira()
    setSemanaAtual(segunda)
    carregarCardapio(segunda)
  }, [])

  const carregarCardapio = async (semana: string) => {
    try {
      setCarregando(true)
      setErro(null)

      const response = await fetch(`/api/admin/cardapio?semana=${semana}`)
      const result = await response.json()

      if (result.sucesso) {
        // Converter array para objeto indexado por dia
        const cardapioObj: CardapioSemana = {}
        
        DIAS_SEMANA.forEach(dia => {
          const cardapioExistente = result.data.find((item: CardapioItem) => item.dia_semana === dia.key)
          cardapioObj[dia.key] = cardapioExistente || {
            ...TEMPLATE_CARDAPIO,
            dia_semana: dia.key
          }
        })

        setCardapio(cardapioObj)
      } else {
        // Se não existe cardápio, criar template vazio
        const cardapioVazio: CardapioSemana = {}
        DIAS_SEMANA.forEach(dia => {
          cardapioVazio[dia.key] = {
            ...TEMPLATE_CARDAPIO,
            dia_semana: dia.key
          }
        })
        setCardapio(cardapioVazio)
      }
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
      setErro('Erro ao carregar cardápio. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const salvarCardapio = async () => {
    try {
      setSalvando(true)
      setErro(null)
      setSucesso(null)

      // Validar campos obrigatórios
      const cardapiosValidos = Object.values(cardapio).filter(item => 
        item.prato_principal.trim() || 
        item.saladas.trim() || 
        item.sobremesa.trim() || 
        item.opcao_vegetariana.trim()
      )

      if (cardapiosValidos.length === 0) {
        setErro('Preencha pelo menos um dia da semana com as informações do cardápio.')
        return
      }

      const response = await fetch('/api/admin/cardapio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardapioSemana: Object.values(cardapio),
          semanaInicio: semanaAtual
        }),
      })

      const result = await response.json()

      if (result.sucesso) {
        setSucesso('Cardápio salvo com sucesso!')
        toast.success('Cardápio da semana salvo!')
        carregarCardapio(semanaAtual) // Recarregar para obter IDs
      } else {
        setErro(result.erro || 'Erro ao salvar cardápio')
        toast.error('Erro ao salvar cardápio')
      }
    } catch (error) {
      console.error('Erro ao salvar cardápio:', error)
      setErro('Erro ao salvar cardápio. Tente novamente.')
      toast.error('Erro ao salvar cardápio')
    } finally {
      setSalvando(false)
    }
  }

  const atualizarCardapio = (dia: string, campo: keyof CardapioItem, valor: string) => {
    setCardapio(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }))
  }

  const copiarDiaAnterior = (diaAtual: string) => {
    const indiceAtual = DIAS_SEMANA.findIndex(d => d.key === diaAtual)
    if (indiceAtual > 0) {
      const diaAnterior = DIAS_SEMANA[indiceAtual - 1].key
      const cardapioAnterior = cardapio[diaAnterior]
      
      setCardapio(prev => ({
        ...prev,
        [diaAtual]: {
          ...cardapioAnterior,
          dia_semana: diaAtual,
          id: prev[diaAtual]?.id // Manter ID se existir
        }
      }))
    }
  }

  const limparDia = (dia: string) => {
    setCardapio(prev => ({
      ...prev,
      [dia]: {
        ...TEMPLATE_CARDAPIO,
        dia_semana: dia
      }
    }))
  }

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loading text="Carregando cardápio..." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="h-8 w-8 text-orange-600" />
            Gerenciar Cardápio
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure o cardápio da semana que será exibido na página inicial
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={semanaAtual}
            onChange={(e) => {
              setSemanaAtual(e.target.value)
              carregarCardapio(e.target.value)
            }}
            className="w-40"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => carregarCardapio(semanaAtual)}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {sucesso && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{sucesso}</AlertDescription>
        </Alert>
      )}

      {/* Informações da Semana */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <CalendarDays className="h-5 w-5" />
            <span className="font-medium">
              Semana de {new Date(semanaAtual).toLocaleDateString('pt-BR')} a{' '}
              {new Date(new Date(semanaAtual).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cardápio por Dia */}
      <Tabs defaultValue="segunda" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {DIAS_SEMANA.map(dia => (
            <TabsTrigger key={dia.key} value={dia.key} className="text-xs">
              {dia.emoji} {dia.label.split('-')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {DIAS_SEMANA.map(dia => (
          <TabsContent key={dia.key} value={dia.key}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {dia.emoji} {dia.label}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copiarDiaAnterior(dia.key)}
                      disabled={DIAS_SEMANA.findIndex(d => d.key === dia.key) === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Copiar Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => limparDia(dia.key)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prato Principal */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-orange-600" />
                      Prato Principal *
                    </Label>
                    <Input
                      placeholder="Ex: Frango grelhado com molho de ervas"
                      value={cardapio[dia.key]?.prato_principal || ''}
                      onChange={(e) => atualizarCardapio(dia.key, 'prato_principal', e.target.value)}
                    />
                  </div>

                  {/* Acompanhamentos */}
                  <div className="space-y-2">
                    <Label>Acompanhamentos</Label>
                    <Input
                      placeholder="Ex: Arroz, Feijão, Batata corada"
                      value={cardapio[dia.key]?.acompanhamentos || ''}
                      onChange={(e) => atualizarCardapio(dia.key, 'acompanhamentos', e.target.value)}
                    />
                  </div>

                  {/* Saladas */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Saladas *
                    </Label>
                    <Input
                      placeholder="Ex: Salada de alface, tomate e cenoura"
                      value={cardapio[dia.key]?.saladas || ''}
                      onChange={(e) => atualizarCardapio(dia.key, 'saladas', e.target.value)}
                    />
                  </div>

                  {/* Sobremesa */}
                  <div className="space-y-2">
                    <Label>Sobremesa</Label>
                    <Input
                      placeholder="Ex: Fruta da época ou doce caseiro"
                      value={cardapio[dia.key]?.sobremesa || ''}
                      onChange={(e) => atualizarCardapio(dia.key, 'sobremesa', e.target.value)}
                    />
                  </div>

                  {/* Bebida */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-blue-600" />
                      Bebida
                    </Label>
                    <Input
                      placeholder="Ex: Suco de laranja natural"
                      value={cardapio[dia.key]?.bebida || ''}
                      onChange={(e) => atualizarCardapio(dia.key, 'bebida', e.target.value)}
                    />
                  </div>

                  {/* Opção Vegetariana */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Opção Vegetariana *
                    </Label>
                    <Input
                      placeholder="Ex: Hambúrguer de lentilha"
                      value={cardapio[dia.key]?.opcao_vegetariana || ''}
                      onChange={(e) => atualizarCardapio(dia.key, 'opcao_vegetariana', e.target.value)}
                    />
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Informações adicionais sobre o cardápio do dia..."
                    value={cardapio[dia.key]?.observacoes || ''}
                    onChange={(e) => atualizarCardapio(dia.key, 'observacoes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={salvarCardapio} 
          disabled={salvando}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          size="lg"
        >
          {salvando ? (
            <>
              <Loading size="sm" />
              <span className="ml-2">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Cardápio da Semana
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 