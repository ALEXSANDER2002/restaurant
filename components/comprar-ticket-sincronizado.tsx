"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CreditCard, AlertCircle, HelpCircle, Check, Info, Clock } from "lucide-react"
import { format, addDays, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFeedback } from "@/components/feedback-usuario"
import { iniciarCheckout } from "@/services/checkout-service"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"

// Define ticket types and their prices
const TICKET_TYPES = {
  subsidiado: {
    label: "Subsidiado",
    price: 2.0,
    description: "Para estudantes com subsídio aprovado",
  },
  naoSubsidiado: {
    label: "Não Subsidiado",
    price: 13.0,
    description: "Preço regular sem subsídio",
  },
}

export function ComprarTicketSincronizado() {
  const { mostrarFeedback } = useFeedback()
  const { usuario } = useAuth()
  const [data, setData] = useState<Date | undefined>(undefined)
  const [quantidadeNaoSubsidiado, setQuantidadeNaoSubsidiado] = useState(0)
  const [comprarSubsidiado, setComprarSubsidiado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [redirecionando, setRedirecionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Preços
  const precoSubsidiado = 2.0
  const precoNaoSubsidiado = 13.0
  const precoTotal = (comprarSubsidiado ? precoSubsidiado : 0) + (quantidadeNaoSubsidiado * precoNaoSubsidiado)

  // Validações em tempo real
  const [validacoes, setValidacoes] = useState({
    dataValida: false,
    ticketSelecionado: false,
    quantidadeValida: true
  })

  useEffect(() => {
    setValidacoes({
      dataValida: !!data,
      ticketSelecionado: comprarSubsidiado || quantidadeNaoSubsidiado > 0,
      quantidadeValida: quantidadeNaoSubsidiado >= 0
    })
  }, [data, comprarSubsidiado, quantidadeNaoSubsidiado])

  const getDataDisplayText = (date: Date) => {
    if (isToday(date)) return "Hoje"
    if (isTomorrow(date)) return "Amanhã"
    return format(date, "EEEE, dd/MM", { locale: ptBR })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações com mensagens específicas
    if (!data) {
      setErro("📅 Por favor, selecione uma data para o almoço")
      return
    }
    if (!comprarSubsidiado && quantidadeNaoSubsidiado < 1) {
      setErro("🎫 Selecione pelo menos um ticket para continuar")
      return
    }
    
    setCarregando(true)
    setRedirecionando(false)
    setErro(null)
    
    try {
      if (!usuario?.id) {
        setErro("🔐 É necessário estar logado para comprar tickets")
        return
      }

      const resultado = await iniciarCheckout({
        usuario_id: usuario.id,
        data: (data as Date).toISOString(),
        comprarSubsidiado,
        quantidadeNaoSubsidiado,
      })

      mostrarFeedback(
        `✅ ${resultado.tickets_criados} ticket(s) criado(s) com sucesso! Redirecionando para pagamento...`,
        "sucesso"
      )

      setRedirecionando(true)
      
      setTimeout(() => {
        window.location.href = resultado.checkout_url
      }, 1500)
    } catch (error: any) {
      if (error instanceof Error && error.message) {
        setErro(`❌ ${error.message}`)
      } else {
        setErro("❌ Erro ao processar a compra. Tente novamente em alguns instantes.")
      }
      console.error("Erro ao comprar ticket:", error)
    } finally {
      setCarregando(false)
    }
  }

  if (redirecionando) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Redirecionando para pagamento</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aguarde enquanto te levamos para a página segura do Mercado Pago...
              </p>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header com informações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Comprar Ticket de Almoço
            </CardTitle>
            <CardDescription>
              Selecione a data, tipo e quantidade de tickets que deseja comprar.
              O almoço é servido das 11h às 15h.
            </CardDescription>
          </CardHeader>
        </Card>

        {erro && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                📅 Data do Almoço
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Escolha o dia que deseja almoçar no restaurante universitário.<br/>
                    Não servimos aos finais de semana.</p>
                  </TooltipContent>
                </Tooltip>
                {validacoes.dataValida && <Check className="h-4 w-4 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !data && "text-muted-foreground",
                      validacoes.dataValida && "border-green-500 bg-green-50"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    {data ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getDataDisplayText(data)}</span>
                        <Badge variant="secondary">{format(data, "dd/MM/yyyy")}</Badge>
                      </div>
                    ) : (
                      <span>Clique para selecionar uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => {
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)
                      return date < hoje || date.getDay() === 0 || date.getDay() === 6
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Só é possível comprar tickets para dias úteis (segunda a sexta)
              </p>
            </CardContent>
          </Card>

          {/* Tipos de Ticket */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                🎫 Tipos de Ticket
                {validacoes.ticketSelecionado && <Check className="h-4 w-4 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ticket Subsidiado */}
              <div className={cn(
                "border rounded-lg p-4 transition-all",
                comprarSubsidiado ? "border-primary bg-primary/5" : "border-border"
              )}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="subsidiado"
                    checked={comprarSubsidiado}
                    onChange={e => setComprarSubsidiado(e.target.checked)}
                    className="mt-1 h-5 w-5 text-primary focus:ring-primary rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="subsidiado" className="font-medium">
                        Ticket Subsidiado
                      </Label>
                      <Badge variant="secondary">R$ 2,00</Badge>
                      <Badge variant="outline">Limite: 1 por dia</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      💰 Preço especial para estudantes com subsídio aprovado pela universidade
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Não Subsidiado */}
              <div className={cn(
                "border rounded-lg p-4 transition-all",
                quantidadeNaoSubsidiado > 0 ? "border-primary bg-primary/5" : "border-border"
              )}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Tickets Não Subsidiados</Label>
                    <Badge variant="secondary">R$ 13,00 cada</Badge>
                    <Badge variant="outline">Sem limite</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    🍽️ Preço regular - ideal para visitantes, funcionários ou quem não tem subsídio
                  </p>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="quantidade" className="text-sm">Quantidade:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantidadeNaoSubsidiado(Math.max(0, quantidadeNaoSubsidiado - 1))}
                        disabled={quantidadeNaoSubsidiado <= 0}
                      >
                        -
                      </Button>
                      <Input
                        id="quantidade"
                        type="number"
                        min={0}
                        max={10}
                        value={quantidadeNaoSubsidiado}
                        onChange={e => setQuantidadeNaoSubsidiado(Math.max(0, Number(e.target.value)))}
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantidadeNaoSubsidiado(Math.min(10, quantidadeNaoSubsidiado + 1))}
                        disabled={quantidadeNaoSubsidiado >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Pedido */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📊 Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comprarSubsidiado && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">1x Ticket Subsidiado</span>
                    <span className="font-medium">R$ 2,00</span>
                  </div>
                )}
                {quantidadeNaoSubsidiado > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{quantidadeNaoSubsidiado}x Ticket{quantidadeNaoSubsidiado > 1 ? 's' : ''} Não Subsidiado{quantidadeNaoSubsidiado > 1 ? 's' : ''}</span>
                    <span className="font-medium">R$ {(quantidadeNaoSubsidiado * precoNaoSubsidiado).toFixed(2)}</span>
                  </div>
                )}
                {precoTotal === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Selecione pelo menos um ticket para ver o total</p>
                  </div>
                )}
                {precoTotal > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">R$ {precoTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botão de Compra */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-medium" 
            disabled={carregando || !validacoes.dataValida || !validacoes.ticketSelecionado}
            size="lg"
          >
            {carregando ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando compra...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {precoTotal > 0 ? `Pagar R$ ${precoTotal.toFixed(2)}` : 'Finalizar Compra'}
              </div>
            )}
          </Button>

          {/* Informações de Segurança */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">🔐 Pagamento Seguro</p>
                  <p>Você será redirecionado para o Mercado Pago, nossa plataforma de pagamento segura. Aceitamos PIX, cartão e outras formas de pagamento.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </TooltipProvider>
  )
}

