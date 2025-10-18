"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  CalendarIcon, 
  CreditCard, 
  AlertCircle, 
  Check, 
  Clock, 
  Users, 
  DollarSign,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Calendar as CalendarLucide,
  Plus,
  Minus,
  Info,
  ChefHat,
  Star,
  MapPin
} from "lucide-react"
import { format, addDays, isToday, isTomorrow, startOfDay, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useFeedback } from "@/components/feedback-usuario"
import { iniciarCheckout } from "@/services/checkout-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { CheckoutTransparente } from "./checkout-transparente"

// Opções de campus
const CAMPUS_OPTIONS = [
  { value: "1", label: "Campus 1", description: "Folha 31, Quadra 07, Lote Especial - Nova Marabá" },
  { value: "2", label: "Campus 2", description: "Folha 17, Quadra 04, Lote Especial - Nova Marabá" },
  { value: "3", label: "Campus 3", description: "Rod. BR-230, Av. dos Ipês - Cidade Jardim, Marabá" },
]

// Componente de Step Indicator Responsivo
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center mb-6 sm:mb-8 px-4">
    <div className="flex items-center space-x-2 sm:space-x-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all",
              currentStep >= step
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              step
            )}
          </div>
          {step < 3 && (
            <div
              className={cn(
                "w-6 sm:w-12 h-0.5 transition-all",
                currentStep > step ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  </div>
)

// Componente de Date Picker Melhorado
const DatePickerMelhorado = ({ 
  data, 
  setData, 
  onNext 
}: { 
  data: Date | undefined
  setData: (date: Date | undefined) => void
  onNext: () => void
}) => {
  const getDataDisplayText = (date: Date) => {
    if (isToday(date)) return "Hoje"
    if (isTomorrow(date)) return "Amanhã"
    return format(date, "EEEE, dd/MM", { locale: ptBR })
  }

  const proximosDias = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      date,
      isDisabled: date.getDay() === 0 || date.getDay() === 6,
      isToday: isToday(date),
      isTomorrow: isTomorrow(date)
    }
  }).filter(day => !day.isDisabled)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 px-4 sm:px-0"
    >
      {/* Quick Date Selection */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <CalendarLucide className="h-5 w-5 text-primary" />
          Selecione o dia do seu almoço
        </h3>
        <div className="grid grid-cols-1 gap-3 mb-4 sm:mb-6">
          {proximosDias.slice(0, 4).map(({ date, isToday: today, isTomorrow: tomorrow }) => (
            <motion.button
              key={date.toISOString()}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setData(date)}
              className={cn(
                "p-4 sm:p-5 rounded-lg border-2 text-left transition-all hover:shadow-md touch-manipulation min-h-[64px]",
                data && isSameDay(data, date)
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-base sm:text-lg">
                    {today ? "Hoje" : tomorrow ? "Amanhã" : format(date, "EEEE", { locale: ptBR })}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">
                    {format(date, "dd/MM/yyyy")}
                  </div>
                </div>
                {today && (
                  <Badge variant="secondary" className="text-xs">
                    Hoje
                  </Badge>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Calendar Picker */}
      <div>
        <h4 className="font-medium mb-3 text-sm sm:text-base">Ou escolha outra data:</h4>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-12 sm:h-14 text-sm sm:text-base touch-manipulation",
                !data && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {data ? (
                <span>{getDataDisplayText(data)} - {format(data, "dd/MM/yyyy")}</span>
              ) : (
                <span>Selecionar data personalizada</span>
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
                const hoje = startOfDay(new Date())
                return date < hoje || date.getDay() === 0 || date.getDay() === 6
              }}
              className="rounded-md border"
              classNames={{
                day: "h-10 w-10 text-sm",
                day_selected: "bg-primary text-primary-foreground",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-800">
            <p className="font-medium mb-1">Horário de funcionamento</p>
            <p>O restaurante serve almoço das <strong>11h às 14h</strong>, de segunda a sexta-feira.</p>
          </div>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        disabled={!data}
        className="w-full h-12 sm:h-14 text-base sm:text-lg touch-manipulation"
        size="lg"
      >
        Continuar
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  )
}

// Componente de Seleção de Campus
const CampusSelector = ({ 
  campus,
  setCampus,
  onNext,
  onBack 
}: {
  campus: string
  setCampus: (value: string) => void
  onNext: () => void
  onBack: () => void
}) => {
  const getCampusInfo = (campusValue: string) => {
    return CAMPUS_OPTIONS.find(c => c.value === campusValue) || CAMPUS_OPTIONS[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 px-4 sm:px-0"
    >
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Escolha o campus para retirada
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          Selecione em qual campus você irá retirar sua refeição.
        </p>
      </div>

      <div className="space-y-3">
        {CAMPUS_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={cn(
              "border rounded-xl p-4 sm:p-6 cursor-pointer transition-all hover:shadow-md",
              campus === option.value 
                ? "border-primary bg-primary/5 shadow-md" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => setCampus(option.value)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                campus === option.value 
                  ? "border-primary bg-primary" 
                  : "border-gray-300"
              )}>
                {campus === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base sm:text-lg">{option.label}</h4>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="h-12 sm:w-auto order-2 sm:order-1 touch-manipulation"
        >
          Voltar
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1 h-12 text-base sm:text-lg order-1 sm:order-2 touch-manipulation"
          size="lg"
        >
          Escolher Tickets
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  )
}

// Componente de Seleção de Tickets Melhorado
const TicketSelector = ({ 
  comprarSubsidiado,
  setComprarSubsidiado,
  quantidadeNaoSubsidiado,
  setQuantidadeNaoSubsidiado,
  onNext,
  onBack 
}: {
  comprarSubsidiado: boolean
  setComprarSubsidiado: (value: boolean) => void
  quantidadeNaoSubsidiado: number
  setQuantidadeNaoSubsidiado: (value: number) => void
  onNext: () => void
  onBack: () => void
}) => {
  const total = (comprarSubsidiado ? 2 : 0) + (quantidadeNaoSubsidiado * 13)
  const temTickets = comprarSubsidiado || quantidadeNaoSubsidiado > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 px-4 sm:px-0"
    >
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          Escolha seus tickets
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          Selecione o tipo e quantidade de tickets que deseja comprar.
        </p>
      </div>

      {/* Ticket Subsidiado */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={cn(
          "border-2 rounded-xl p-4 sm:p-6 transition-all cursor-pointer touch-manipulation",
          comprarSubsidiado 
            ? "border-primary bg-primary/5 shadow-md" 
            : "border-border hover:border-primary/50"
        )}
        onClick={() => setComprarSubsidiado(!comprarSubsidiado)}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center mt-0.5 sm:mt-1">
            {comprarSubsidiado && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-primary rounded-full"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h4 className="font-semibold text-base sm:text-lg">Ticket Subsidiado</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm font-medium">
                  R$ 2,00
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Estudante
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3">
              Preço especial para estudantes com subsídio aprovado pela universidade. 
              Máximo de 1 ticket por dia.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-700 font-medium">Economia de R$ 11,00!</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ticket Não Subsidiado */}
      <div className="border-2 rounded-xl p-4 sm:p-6 border-border">
        <div className="flex items-start gap-3 sm:gap-4">
          <Users className="h-6 w-6 text-primary mt-0.5 sm:mt-1" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h4 className="font-semibold text-base sm:text-lg">Ticket Não Subsidiado</h4>
              <Badge variant="secondary" className="text-sm font-medium">
                R$ 13,00 cada
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mb-4">
              Preço regular para visitantes, funcionários ou quem não possui subsídio. 
              Sem limite de quantidade.
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Label className="text-sm font-medium">Quantidade:</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantidadeNaoSubsidiado(Math.max(0, quantidadeNaoSubsidiado - 1))}
                  disabled={quantidadeNaoSubsidiado <= 0}
                  className="h-12 w-12 sm:h-10 sm:w-10 p-0 touch-manipulation"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 h-12 sm:h-10 border rounded-md flex items-center justify-center font-medium text-base">
                  {quantidadeNaoSubsidiado}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantidadeNaoSubsidiado(Math.min(10, quantidadeNaoSubsidiado + 1))}
                  disabled={quantidadeNaoSubsidiado >= 10}
                  className="h-12 w-12 sm:h-10 sm:w-10 p-0 touch-manipulation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                (máximo 10)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <AnimatePresence>
        {temTickets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 sm:p-6 border border-primary/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total do pedido</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p>
              </div>
              <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground">
                {comprarSubsidiado && <div>1x Subsidiado</div>}
                {quantidadeNaoSubsidiado > 0 && (
                  <div>{quantidadeNaoSubsidiado}x Não Subsidiado</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 sm:w-auto order-2 sm:order-1 touch-manipulation">
          Voltar
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!temTickets}
          className="flex-1 h-12 text-base sm:text-lg order-1 sm:order-2 touch-manipulation"
          size="lg"
        >
          Revisar Pedido
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  )
}

// Componente de Confirmação Final
const ConfirmacaoFinal = ({ 
  data,
  campus,
  comprarSubsidiado,
  quantidadeNaoSubsidiado,
  onBack,
  onConfirm,
  carregando 
}: {
  data: Date | undefined
  campus: string
  comprarSubsidiado: boolean
  quantidadeNaoSubsidiado: number
  onBack: () => void
  onConfirm: () => void
  carregando: boolean
}) => {
  const total = (comprarSubsidiado ? 2 : 0) + (quantidadeNaoSubsidiado * 13)
  
  const getDataDisplayText = (date: Date) => {
    if (isToday(date)) return "Hoje"
    if (isTomorrow(date)) return "Amanhã"
    return format(date, "EEEE, dd/MM", { locale: ptBR })
  }

  const campusInfo = CAMPUS_OPTIONS.find(c => c.value === campus)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 px-4 sm:px-0"
    >
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Confirme seu pedido
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Revise os detalhes antes de finalizar a compra.
        </p>
      </div>

      {/* Resumo do Pedido */}
      <Card className="border-2">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarLucide className="h-5 w-5" />
            {data && getDataDisplayText(data)}
          </CardTitle>
          <CardDescription className="text-sm">
            {data && format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {comprarSubsidiado && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Ticket Subsidiado</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Estudante</p>
                </div>
              </div>
              <p className="font-semibold text-sm sm:text-base">R$ 2,00</p>
            </div>
          )}
          
          {quantidadeNaoSubsidiado > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {quantidadeNaoSubsidiado}x Ticket{quantidadeNaoSubsidiado > 1 ? 's' : ''} Não Subsidiado{quantidadeNaoSubsidiado > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">R$ {(quantidadeNaoSubsidiado * 13).toFixed(2)}</p>
                </div>
              </div>
              <p className="font-semibold text-sm sm:text-base">R$ {(quantidadeNaoSubsidiado * 13).toFixed(2)}</p>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between text-base sm:text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Pagamento */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-3 sm:pt-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" />
            <div className="text-xs sm:text-sm text-blue-800">
              <p className="font-medium mb-1">Pagamento Seguro via Mercado Pago</p>
              <p>Você será redirecionado para nossa plataforma de pagamento segura. Aceitamos PIX, cartão de crédito, débito e outras formas de pagamento.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 sm:w-auto order-2 sm:order-1 touch-manipulation" disabled={carregando}>
          Voltar
        </Button>
        <Button 
          onClick={onConfirm} 
          className="flex-1 h-12 text-base sm:text-lg order-1 sm:order-2 touch-manipulation"
          size="lg"
          disabled={carregando}
        >
          {carregando ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Finalizar Compra
            </div>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export function ComprarTicketMelhorado() {
  const { mostrarFeedback } = useFeedback()
  const { usuario, carregando: carregandoAuth } = useAuth()
  
  // Estados principais
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [data, setData] = useState<Date | undefined>(undefined)
  const [campus, setCampus] = useState<string>("1") // Estado para campus
  const [quantidadeNaoSubsidiado, setQuantidadeNaoSubsidiado] = useState(0)
  const [comprarSubsidiado, setComprarSubsidiado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [redirecionando, setRedirecionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)
  const [mostrarCheckout, setMostrarCheckout] = useState(false)

  const handleSubmit = async () => {
    if (!data || (!comprarSubsidiado && quantidadeNaoSubsidiado < 1) || !campus) {
      setErro("Dados incompletos para finalizar a compra")
      return
    }
    
    if (!usuario?.id) {
      setErro("É necessário estar logado para comprar tickets")
      return
    }

    // Ir para o checkout transparente
    setMostrarCheckout(true)
    setErro(null)
  }

  const handleCheckoutSuccess = (result: any) => {
    const campusInfo = CAMPUS_OPTIONS.find(c => c.value === campus)
    
    if (result.status === 'approved') {
      mostrarFeedback(
        `✅ Pagamento aprovado! Tickets criados com sucesso para ${campusInfo?.label}!`,
        "sucesso"
      )
    } else if (result.status === 'pending') {
      mostrarFeedback(
        `⏳ Pagamento pendente. Finalize o pagamento para ativar seus tickets.`,
        "info"
      )
    }

    setMensagemSucesso("Pedido processado com sucesso!")
    
    // Redirecionar para a página do usuário após 2 segundos
    setTimeout(() => {
      window.location.href = '/usuario'
    }, 2000)
  }

  const handleCheckoutError = (error: string) => {
    setErro(error)
    setMostrarCheckout(false)
  }

  const handleCheckoutCancel = () => {
    setMostrarCheckout(false)
  }

  // Loading de autenticação
  if (carregandoAuth) {
    return (
      <Card className="w-full max-w-md mx-4 sm:mx-auto">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Verificando autenticação...</h3>
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
      <Card className="w-full max-w-md mx-4 sm:mx-auto">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Login Necessário</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Você precisa estar logado para comprar tickets
              </p>
            </div>
            <Button
              onClick={() => window.location.href = "/login"}
              className="w-full h-12 touch-manipulation"
            >
              Fazer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Tela de sucesso
  if (mensagemSucesso) {
    return (
      <Card className="w-full max-w-md mx-4 sm:mx-auto">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">{mensagemSucesso}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Redirecionando para seus tickets...
              </p>
            </div>
            <Progress value={100} className="w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar Checkout Transparente
  if (mostrarCheckout && data) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
        <CheckoutTransparente
          data={data.toISOString()}
          quantidadeSubsidiado={comprarSubsidiado ? 1 : 0}
          quantidadeNaoSubsidiado={quantidadeNaoSubsidiado}
          campus={campus}
          onSuccess={handleCheckoutSuccess}
          onError={handleCheckoutError}
          onCancel={handleCheckoutCancel}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Progress Indicator */}
      <StepIndicator currentStep={etapaAtual} />

      {/* Error Alert */}
      <AnimatePresence>
        {erro && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive" className="mx-4 sm:mx-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Card className="mx-4 sm:mx-0">
        <CardContent className="pt-4 sm:pt-6">
          <AnimatePresence mode="wait">
            {etapaAtual === 1 && (
              <DatePickerMelhorado
                key="step1"
                data={data}
                setData={setData}
                onNext={() => setEtapaAtual(2)}
              />
            )}
            
            {etapaAtual === 2 && (
              <CampusSelector
                key="step2"
                campus={campus}
                setCampus={setCampus}
                onNext={() => setEtapaAtual(3)}
                onBack={() => setEtapaAtual(1)}
              />
            )}
            
            {etapaAtual === 3 && (
              <TicketSelector
                key="step3"
                comprarSubsidiado={comprarSubsidiado}
                setComprarSubsidiado={setComprarSubsidiado}
                quantidadeNaoSubsidiado={quantidadeNaoSubsidiado}
                setQuantidadeNaoSubsidiado={setQuantidadeNaoSubsidiado}
                onNext={() => setEtapaAtual(4)}
                onBack={() => setEtapaAtual(2)}
              />
            )}
            
            {etapaAtual === 4 && (
              <ConfirmacaoFinal
                key="step4"
                data={data}
                campus={campus}
                comprarSubsidiado={comprarSubsidiado}
                quantidadeNaoSubsidiado={quantidadeNaoSubsidiado}
                onBack={() => setEtapaAtual(3)}
                onConfirm={handleSubmit}
                carregando={carregando}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}