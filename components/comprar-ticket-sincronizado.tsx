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
import { useFeedback } from "@/components/feedback-usuario"
import { generateTicketId, salvarTicket } from "@/services/ticket-sync-service"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TicketQRCode } from "@/components/ticket-qrcode"
import { useEffect } from "react"

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
  // const { usuario, perfil } = useAuth()
  const { mostrarFeedback } = useFeedback()
  const [data, setData] = useState<Date | undefined>(undefined)
  const [quantidadeNaoSubsidiado, setQuantidadeNaoSubsidiado] = useState(0)
  const [comprarSubsidiado, setComprarSubsidiado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ticketsComprados, setTicketsComprados] = useState<any[]>([])

  // Preço fixo
  const precoSubsidiado = 2.0
  const precoNaoSubsidiado = 13.0
  const precoTotal = (comprarSubsidiado ? precoSubsidiado : 0) + (quantidadeNaoSubsidiado * precoNaoSubsidiado)

  // Validação: só pode 1 subsidiado por dia
  // (Aqui, para demo, não checamos se já existe no backend, mas pode ser feito via API)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data) {
      setErro("Selecione uma data para o almoço")
      return
    }
    if (!comprarSubsidiado && quantidadeNaoSubsidiado < 1) {
      setErro("Selecione pelo menos um ticket para comprar")
      return
    }
    if (comprarSubsidiado && quantidadeNaoSubsidiado > 0 && quantidadeNaoSubsidiado < 1) {
      setErro("Quantidade inválida de tickets não subsidiados")
      return
    }
    setCarregando(true)
    setSucesso(false)
    setErro(null)
    try {
      const tickets: any[] = []
      if (comprarSubsidiado) {
        tickets.push({
          id: generateTicketId(),
          usuario_id: "anon",
          data: data instanceof Date ? data.toISOString() : data,
          quantidade: 1,
          valor_total: precoSubsidiado,
          status: "pendente",
          created_at: new Date().toISOString(),
          subsidiado: true,
        })
      }
      for (let i = 0; i < quantidadeNaoSubsidiado; i++) {
        tickets.push({
          id: generateTicketId(),
          usuario_id: "anon",
          data: data instanceof Date ? data.toISOString() : data,
          quantidade: 1,
          valor_total: precoNaoSubsidiado,
          status: "pendente",
          created_at: new Date().toISOString(),
          subsidiado: false,
        })
      }
      const ticketsSalvos: any[] = []
      for (const ticket of tickets) {
        const { sucesso, erro: erroSalvar, ticket: ticketSalvo } = await salvarTicket(ticket)
        if (!sucesso) throw new Error(erroSalvar || "Erro ao salvar ticket")
        ticketsSalvos.push(ticketSalvo || ticket)
      }
      setTicketsComprados(ticketsSalvos)
      setSucesso(true)
      mostrarFeedback("Tickets comprados com sucesso!", "sucesso")
      setData(undefined)
      setQuantidadeNaoSubsidiado(0)
      setComprarSubsidiado(false)
    } catch (error: any) {
      setErro("Erro ao processar a compra. Tente novamente.")
      console.error("Erro ao comprar ticket:", error)
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso && ticketsComprados.length > 0) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Compra realizada com sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            Seus tickets de almoço foram adquiridos. Você pode visualizá-los no seu histórico de compras. O administrador irá
            confirmar seu pedido em breve.
          </AlertDescription>
        </Alert>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ticketsComprados.map((ticket, idx) => (
            <TicketQRCode key={ticket.id || idx} ticket={ticket} onClose={() => setSucesso(false)} />
          ))}
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
        <Label>Ticket Subsidiado</Label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="subsidiado"
            checked={comprarSubsidiado}
            onChange={e => setComprarSubsidiado(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="text-sm">Comprar 1 ticket subsidiado (R$ 2,00)</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantidade-nao-subsidiado">Tickets Não Subsidiados</Label>
        <Input
          id="quantidade-nao-subsidiado"
          type="number"
          min={0}
          value={quantidadeNaoSubsidiado}
          onChange={e => setQuantidadeNaoSubsidiado(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-xs text-gray-500">R$ 13,00 cada. Quantos quiser por dia.</span>
      </div>
      <div className="flex items-center justify-between font-semibold text-lg">
        <span>Total:</span>
        <span>R$ {precoTotal.toFixed(2)}</span>
      </div>
      <Button type="submit" className="w-full" disabled={carregando} aria-busy={carregando}>
        {carregando ? "Processando..." : "Comprar"}
      </Button>
    </form>
  )
}

