"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CreditCard, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { comprarTicket } from "@/services/ticket-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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

// Form validation schema
const ticketFormSchema = z.object({
  data: z.date({
    required_error: "A data do almoço é obrigatória",
  }),
  tipoTicket: z.enum(["subsidiado", "naoSubsidiado"], {
    required_error: "O tipo de ticket é obrigatório",
  }),
  quantidade: z.coerce
    .number({
      required_error: "A quantidade é obrigatória",
      invalid_type_error: "A quantidade deve ser um número",
    })
    .int({
      message: "A quantidade deve ser um número inteiro",
    })
    .min(1, {
      message: "A quantidade mínima é 1",
    })
    .max(5, {
      message: "A quantidade máxima é 5",
    }),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

export function ComprarTicketValidado() {
  const { usuario } = useAuth()
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Initialize form with default values
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      tipoTicket: "subsidiado",
      quantidade: 1,
    },
  })

  // Watch form values for price calculation
  const tipoTicket = form.watch("tipoTicket")
  const quantidade = form.watch("quantidade") || 0

  // Calculate prices
  const precoUnitario = TICKET_TYPES[tipoTicket]?.price || 0
  const precoTotal = quantidade * precoUnitario

  const onSubmit = async (values: TicketFormValues) => {
    if (!usuario) {
      setErro("Usuário não autenticado")
      return
    }

    setCarregando(true)
    setSucesso(false)
    setErro(null)

    try {
      const { ticket, erro: erroCompra } = await comprarTicket(
        usuario.id,
        values.data,
        values.quantidade,
        precoTotal,
        values.tipoTicket === "subsidiado",
      )

      if (erroCompra) {
        setErro(erroCompra)
        return
      }

      setSucesso(true)
      form.reset({
        tipoTicket: "subsidiado",
        quantidade: 1,
      })
    } catch (error: any) {
      setErro("Erro ao processar a compra. Tente novamente.")
      console.error("Erro ao comprar ticket:", error)
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Compra realizada com sucesso!</AlertTitle>
        <AlertDescription className="text-green-700">
          Seu ticket de almoço foi adquirido. Você pode visualizá-lo no seu histórico de compras.
        </AlertDescription>
        <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => setSucesso(false)}>
          Comprar outro ticket
        </Button>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {erro && (
          <Alert variant="destructive">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Almoço</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)
                      return date < hoje || date.getDay() === 0 || date.getDay() === 6
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Selecione a data para o seu almoço (dias úteis apenas)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipoTicket"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Tipo de Ticket</FormLabel>
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
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  {Object.entries(TICKET_TYPES).map(([key, { label, price, description }]) => (
                    <div key={key} className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value={key} id={`ticket-${key}`} />
                      <FormLabel htmlFor={`ticket-${key}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          {label} - R$ {price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>Máximo de 5 tickets por compra</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button type="submit" className="w-full" disabled={carregando}>
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
    </Form>
  )
}

