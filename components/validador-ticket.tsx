"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Camera, CameraOff, Loader2, CheckCircle, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"
import { supabase } from "@/lib/supabase" // Corrigido: usando o cliente Supabase correto

export function ValidadorTicket() {
  const [escaneando, setEscaneando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [scanner, setScanner] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [ticketEscaneado, setTicketEscaneado] = useState<any>(null)
  const [statusValidacao, setStatusValidacao] = useState<"valido" | "invalido" | "expirado" | null>(null)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  // Carregar a biblioteca HTML5-QRCode
  useEffect(() => {
    let isMounted = true

    const carregarBiblioteca = async () => {
      try {
        // Importar a biblioteca dinamicamente
        const { Html5Qrcode } = await import("html5-qrcode")
        if (isMounted) {
          setCarregando(false)
        }
      } catch (err) {
        console.error("Erro ao carregar biblioteca HTML5QrCode:", err)
        if (isMounted) {
          setErro("Erro ao carregar o leitor de QR Code")
          setCarregando(false)
        }
      }
    }

    carregarBiblioteca()

    return () => {
      isMounted = false
    }
  }, [])

  // Inicializar o scanner quando necessário
  const inicializarScanner = async () => {
    if (!qrContainerRef.current) return null

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const novoScanner = new Html5Qrcode("validador-qrcode")
      return novoScanner
    } catch (err) {
      console.error("Erro ao inicializar scanner:", err)
      setErro("Erro ao inicializar o leitor de QR Code")
      return null
    }
  }

  // Limpar o scanner quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch((err: any) => console.error("Erro ao parar o scanner:", err))
      }
    }
  }, [scanner])

  const iniciarEscaneamento = async () => {
    setErro(null)
    setTicketEscaneado(null)
    setStatusValidacao(null)

    // Inicializar o scanner se ainda não estiver inicializado
    const scannerInstance = scanner || (await inicializarScanner())
    if (!scannerInstance) {
      setErro("Não foi possível inicializar o leitor de QR Code")
      return
    }

    setScanner(scannerInstance)
    setEscaneando(true)

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    scannerInstance
      .start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          // Sucesso no escaneamento
          await scannerInstance.stop()
          setEscaneando(false)

          // Processar o QR Code escaneado
          try {
            console.log("QR Code escaneado:", decodedText)

            // Tentar processar como JSON
            let ticketData
            try {
              ticketData = JSON.parse(decodedText)
            } catch (e) {
              throw new Error("QR Code inválido: formato incorreto")
            }

            // Verificar se o ticket tem os campos necessários
            if (!ticketData.id || !ticketData.data || !ticketData.status) {
              throw new Error("QR Code inválido: dados incompletos")
            }

            // Verificar se o ticket está pago
            if (ticketData.status !== "pago") {
              setTicketEscaneado(ticketData)
              setStatusValidacao("invalido")
              return
            }

            // Verificar se o ticket está na data válida
            const dataTicket = parseISO(ticketData.data)
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)

            if (isBefore(dataTicket, hoje)) {
              setTicketEscaneado(ticketData)
              setStatusValidacao("expirado")
              return
            }

            // Se chegou até aqui, o ticket é válido
            setTicketEscaneado(ticketData)
            setStatusValidacao("valido")

            // Atualizar o status do ticket no localStorage (opcional)
            atualizarStatusTicket(ticketData.id)
          } catch (error: any) {
            console.error("Erro ao processar QR code:", error)
            setErro(error.message || "QR Code inválido")
          }
        },
        (errorMessage: string) => {
          // Ignorar erros durante o escaneamento
          console.log("Erro de escaneamento (ignorado):", errorMessage)
        },
      )
      .catch((err: any) => {
        console.error("Erro ao iniciar o scanner:", err)
        setErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
        setEscaneando(false)
      })
  }

  const pararEscaneamento = () => {
    if (scanner && scanner.isScanning) {
      scanner.stop().catch((err: any) => console.error("Erro ao parar o scanner:", err))
      setEscaneando(false)
    }
  }

  // Função para atualizar o status do ticket no localStorage
  const atualizarStatusTicket = (ticketId: string) => {
    try {
      // Obter tickets do localStorage
      const tickets = JSON.parse(localStorage.getItem("tickets") || "[]")

      // Encontrar o ticket pelo ID
      const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)

      if (ticketIndex !== -1) {
        // Marcar como utilizado (você pode adicionar um campo 'utilizado' ou outro status)
        tickets[ticketIndex].utilizado = true
        tickets[ticketIndex].data_utilizacao = new Date().toISOString()

        // Salvar de volta no localStorage
        localStorage.setItem("tickets", JSON.stringify(tickets))
      }
    } catch (error) {
      console.error("Erro ao atualizar status do ticket:", error)
    }
  }

  const reiniciarValidacao = () => {
    setTicketEscaneado(null)
    setStatusValidacao(null)
    setErro(null)
  }

  // Adicionar função para atualizar o status do ticket no Supabase
  const marcarTicketComoUtilizado = async (ticketId: string) => {
    try {
      // Tentar atualizar no Supabase primeiro
      try {
        const { error } = await supabase
          .from("tickets")
          .update({ utilizado: true, data_utilizacao: new Date().toISOString() })
          .eq("id", ticketId)

        if (error) {
          console.warn("Erro ao marcar ticket como utilizado no Supabase:", error)
        }
      } catch (e) {
        console.warn("Erro ao marcar ticket como utilizado:", e)
      }

      // Fallback para localStorage
      try {
        const tickets = JSON.parse(localStorage.getItem("tickets") || "[]")
        const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)

        if (ticketIndex !== -1) {
          tickets[ticketIndex].utilizado = true
          tickets[ticketIndex].data_utilizacao = new Date().toISOString()
          localStorage.setItem("tickets", JSON.stringify(tickets))
        }
      } catch (e) {
        console.warn("Erro ao atualizar localStorage:", e)
      }
    } catch (error) {
      console.error("Erro ao marcar ticket como utilizado:", error)
    }
  }

  return (
    <div className="space-y-4">
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {ticketEscaneado && statusValidacao ? (
        <Card className="border-2 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              Ticket {ticketEscaneado.id}
              <Badge
                variant="outline"
                className={
                  statusValidacao === "valido"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : statusValidacao === "expirado"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {statusValidacao === "valido" ? "Válido" : statusValidacao === "expirado" ? "Expirado" : "Inválido"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span>{format(parseISO(ticketEscaneado.data), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantidade:</span>
              <span>{ticketEscaneado.quantidade || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span>{ticketEscaneado.status}</span>
            </div>

            <div className="pt-4 flex justify-center">
              {statusValidacao === "valido" ? (
                <div className="flex flex-col items-center text-green-600">
                  <CheckCircle className="h-16 w-16 mb-2" />
                  <p className="font-medium">Ticket válido!</p>
                  <p className="text-sm text-muted-foreground">Acesso permitido</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-red-600">
                  <X className="h-16 w-16 mb-2" />
                  <p className="font-medium">
                    {statusValidacao === "expirado" ? "Ticket expirado!" : "Ticket inválido!"}
                  </p>
                  <p className="text-sm text-muted-foreground">Acesso negado</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={reiniciarValidacao}>
              Escanear outro ticket
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="w-full h-64 bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {carregando ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando leitor de QR Code...</p>
              </div>
            ) : (
              <div id="validador-qrcode" ref={qrContainerRef} className="w-full h-full" aria-live="polite" />
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={escaneando ? pararEscaneamento : iniciarEscaneamento}
            disabled={carregando}
          >
            {escaneando ? (
              <>
                <CameraOff className="mr-2 h-4 w-4" />
                Parar Escaneamento
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Escanear Ticket
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Posicione o QR Code do ticket no centro da câmera para validar
          </p>
        </>
      )}
    </div>
  )
}

