"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, CreditCard, AlertCircle, HelpCircle, Check, Info, Clock, MapPin } from "lucide-react"
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

// Opções de campus
const CAMPUS_OPTIONS = [
  { value: "1", label: "Campus 1", description: "Folha 31, Quadra 07, Lote Especial - Nova Marabá" },
  { value: "2", label: "Campus 2", description: "Folha 17, Quadra 04, Lote Especial - Nova Marabá" },
  { value: "3", label: "Campus 3", description: "Rod. BR-230, Av. dos Ipês - Cidade Jardim, Marabá" },
]

export function ComprarTicketSincronizado() {
  const { mostrarFeedback } = useFeedback()
  const { usuario, carregando: carregandoAuth } = useAuth()
  const [data, setData] = useState<Date | undefined>(undefined)
  const [quantidadeNaoSubsidiado, setQuantidadeNaoSubsidiado] = useState(0)
  const [comprarSubsidiado, setComprarSubsidiado] = useState(false)
  const [campus, setCampus] = useState<string>("1") // Estado para o campus selecionado
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
    quantidadeValida: true,
    campusSelecionado: true // Campus sempre tem um valor padrão
  })

  useEffect(() => {
    setValidacoes({
      dataValida: !!data,
      ticketSelecionado: comprarSubsidiado || quantidadeNaoSubsidiado > 0,
      quantidadeValida: quantidadeNaoSubsidiado >= 0,
      campusSelecionado: !!campus
    })
  }, [data, comprarSubsidiado, quantidadeNaoSubsidiado, campus])

  const getDataDisplayText = (date: Date) => {
    if (isToday(date)) return "Hoje"
    if (isTomorrow(date)) return "Amanhã"
    return format(date, "EEEE, dd/MM", { locale: ptBR })
  }

  const getCampusLabel = (campusValue: string) => {
    const option = CAMPUS_OPTIONS.find(c => c.value === campusValue)
    return option ? option.label : "Campus 1"
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
    if (!campus) {
      setErro("🏫 Por favor, selecione o campus para retirada")
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

      // Validação adicional dos dados do usuário
      if (!usuario.email || !usuario.tipo_usuario) {
        setErro("🔐 Dados de usuário incompletos. Faça login novamente.")
        return
      }

      console.log('[FRONTEND] Iniciando checkout para usuário:', {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo_usuario,
        campus: campus
      })

      const resultado = await iniciarCheckout({
        usuario_id: usuario.id,
        data: (data as Date).toISOString(),
        comprarSubsidiado,
        quantidadeNaoSubsidiado,
        campus, // Incluir o campus selecionado
      })

      mostrarFeedback(
        `✅ ${resultado.tickets_criados} ticket(s) criado(s) com sucesso para ${getCampusLabel(campus)}! Redirecionando para pagamento...`,
        "sucesso"
      )

      setRedirecionando(true)
      
      setTimeout(() => {
        window.location.href = resultado.checkout_url
      }, 1500)
    } catch (error: any) {
      if (error instanceof Error && error.message) {
        const mensagem = error.message
        
        // Tratamento específico para erro de usuário não encontrado
        if (mensagem.includes("Usuário não encontrado")) {
          setErro("🔐 Sua sessão expirou ou há um problema com sua conta. Faça login novamente.")
        } else {
          setErro(`❌ ${mensagem}`)
        }
      } else {
        setErro("❌ Erro ao processar a compra. Tente novamente em alguns instantes.")
      }
      console.error("Erro ao comprar ticket:", error)
    } finally {
      setCarregando(false)
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (carregandoAuth) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Verificando autenticação...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aguarde enquanto verificamos seus dados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Usuário não autenticado
  if (!usuario) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Login Necessário</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Você precisa estar logado para comprar tickets
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.href = "/login"
              }}
              className="w-full"
            >
              Fazer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
              O almoço é servido das 11h às 14h, de segunda a sexta-feira.
            </CardDescription>
          </CardHeader>
        </Card>

        {erro && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>{erro}</span>
              {erro.includes("sessão expirou") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = "/login"
                  }}
                  className="self-start"
                >
                  Fazer Login Novamente
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                📅 Selecione a Data
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
                      !data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {data ? getDataDisplayText(data) : "Escolha uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      
                      const dateToCheck = new Date(date)
                      dateToCheck.setHours(0, 0, 0, 0)
                      
                      // Não permitir datas passadas ou mais de 30 dias no futuro
                      const maxDate = addDays(today, 30)
                      return dateToCheck < today || dateToCheck > maxDate
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              
              {data && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Almoço para {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seleção de Campus */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                🏫 Campus para Retirada
                {validacoes.campusSelecionado && <Check className="h-4 w-4 text-green-500" />}
              </CardTitle>
              <CardDescription>
                Escolha em qual campus você irá retirar sua refeição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o campus">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{getCampusLabel(campus)} - {CAMPUS_OPTIONS.find(c => c.value === campus)?.description}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CAMPUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

