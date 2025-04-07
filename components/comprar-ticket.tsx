"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CreditCard, AlertCircle, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TicketQRCode } from "./ticket-qrcode"
import { comprarTicket } from "@/services/ticket-service"

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

export function ComprarTicket() {
  const { usuario, perfil } = useAuth()
  const [data, setData] = useState<Date | undefined>(undefined)
  const [quantidade, setQuantidade] = useState(1)
  const [tipoTicket, setTipoTicket] = useState<"subsidiado" | "naoSubsidiado">("subsidiado")
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ticketComprado, setTicketComprado] = useState<any>(null)

  // Get price based on selected ticket type
  const precoUnitario = TICKET_TYPES[tipoTicket].price
  const precoTotal = quantidade * precoUnitario

  // Modificar a função handleSubmit para usar o serviço atualizado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!perfil) {
      setErro("Usuário não autenticado")
      return
    }

    if (!data) {
      setErro("Selecione uma data para o almoço")
      return
    }

    setCarregando(true)
    setSucesso(false)
    setErro(null)

    try {
      // Usar o serviço de tickets atualizado
      const { ticket, erro: erroCompra } = await comprarTicket(
        perfil.id,
        data,
        quantidade,
        precoTotal,
        tipoTicket === "subsidiado",
      )

      if (erroCompra) {
        setErro(erroCompra)
        return
      }

      // Armazenar o ticket comprado para exibir o QR code
      setTicketComprado(ticket)
      setSucesso(true)

      // Resetar o formulário
      setData(undefined)
      setQuantidade(1)
      setTipoTicket("subsidiado")
    } catch (error: any) {
      setErro("Erro ao processar a compra. Tente novamente.")
      console.error("Erro ao comprar ticket:", error)
    } finally {
      setCarregando(false)
    }
  }

  const voltarParaCompra = () => {
    setTicketComprado(null)
    setSucesso(false)
  }

  if (sucesso && ticketComprado) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Compra realizada com sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            Seu ticket de almoço foi adquirido. Você pode visualizá-lo no seu histórico de compras.
          </AlertDescription>
        </Alert>

        <div className="mt-4">
          <TicketQRCode ticket={ticketComprado} onClose={voltarParaCompra} />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="data">Data do Almoço</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="data"
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !data && "text-muted-foreground")}
              aria-required="true"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data ? format(data, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data}
              onSelect={setData}
              initialFocus
              locale={ptBR}
              disabled={(date) => {
                // Desabilitar finais de semana e datas passadas
                const hoje = new Date()
                hoje.setHours(0, 0, 0, 0)
                return date < hoje || date.getDay() === 0 || date.getDay() === 6
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tipo-ticket">Tipo de Ticket</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Ajuda sobre tipos de ticket</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Tickets subsidiados são disponíveis apenas para estudantes com subsídio aprovado. Tickets não
                  subsidiados estão disponíveis para todos.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup
          value={tipoTicket}
          onValueChange={(value) => setTipoTicket(value as "subsidiado" | "naoSubsidiado")}
          className="flex flex-col space-y-2"
        >
          {Object.entries(TICKET_TYPES).map(([key, { label, price, description }]) => (
            <div key={key} className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value={key} id={`ticket-${key}`} />
              <Label htmlFor={`ticket-${key}`} className="flex-1 cursor-pointer">
                <div className="font-medium">
                  {label} - R$ {price.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">{description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantidade">Quantidade</Label>
        <Input
          id="quantidade"
          type="number"
          min={1}
          max={5}
          value={quantidade}
          onChange={(e) => setQuantidade(Number.parseInt(e.target.value))}
          required
          aria-required="true"
        />
        <p className="text-sm text-muted-foreground">Máximo de 5 tickets por compra</p>
      </div>

      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Preço unitário:</span>
          <span>R$ {precoUnitario.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>R$ {precoTotal.toFixed(2)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!data || carregando}>
        {carregando ? (
          "Processando..."
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Finalizar Compra
          </>
        )}
      </Button>
    </form>
  )
}

