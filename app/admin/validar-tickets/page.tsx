"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, CheckCircle, XCircle, AlertCircle, QrCode, User, Calendar, MapPin, DollarSign } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { Html5QrcodeScanner } from "html5-qrcode"

interface TicketInfo {
  id: string
  usuario_nome: string
  usuario_email: string
  data: string
  valor_total: number
  subsidiado: boolean
  campus: string
  status: string
  utilizado: boolean
  data_utilizacao?: string
  qr_code: string
}

export default function AdminValidarTicketsPage() {
  const { usuario } = useAuth()
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [escaneando, setEscaneando] = useState(false)
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (erro || sucesso) {
      const timer = setTimeout(() => {
        setErro(null)
        setSucesso(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [erro, sucesso])

  // Inicializar scanner
  const iniciarScanner = () => {
    if (scanner) {
      scanner.clear()
      setScanner(null)
    }

    const novoScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    novoScanner.render(
      async (decodedText) => {
        // QR Code lido com sucesso
        await pararScanner()
        await buscarTicketPorQR(decodedText)
      },
      (error) => {
        // Erro silencioso - não mostrar todos os erros de scan
        console.log("Erro de scan (normal):", error)
      }
    )

    setScanner(novoScanner)
    setEscaneando(true)
    setErro(null)
    setSucesso(null)
  }

  // Parar scanner
  const pararScanner = async () => {
    if (scanner) {
      try {
        await scanner.clear()
        setScanner(null)
      } catch (error) {
        console.log("Erro ao parar scanner:", error)
      }
    }
    setEscaneando(false)
  }

  // Buscar ticket por QR code
  const buscarTicketPorQR = async (qrCode: string) => {
    setCarregando(true)
    setErro(null)
    setSucesso(null)
    setTicketInfo(null)

    try {
      const response = await fetch(`/api/tickets/validar-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: qrCode })
      })

      const data = await response.json()

      if (response.ok) {
        setTicketInfo(data.ticket)
        if (data.ticket.utilizado) {
          setErro("⚠️ Este ticket já foi utilizado!")
        } else if (data.ticket.status !== "pago") {
          setErro("⚠️ Este ticket ainda não foi pago!")
        } else {
          setSucesso("✅ Ticket válido encontrado!")
        }
      } else {
        setErro(data.erro || "QR Code inválido ou ticket não encontrado")
      }
    } catch (error) {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  // Validar/Debitar ticket
  const validarTicket = async () => {
    if (!ticketInfo || !usuario?.id) return

    setCarregando(true)
    setErro(null)

    try {
      const response = await fetch(`/api/tickets/${ticketInfo.id}/validar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          validado_por: usuario.id,
          acao: "validar"
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSucesso("🎉 Ticket validado com sucesso!")
        setTicketInfo(prev => prev ? { ...prev, utilizado: true, data_utilizacao: new Date().toISOString() } : null)
      } else {
        setErro(data.erro || "Erro ao validar ticket")
      }
    } catch (error) {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  // Função para formatar campus
  const formatarCampus = (campus: string) => {
    const campusMap = {
      "1": "Campus 1 - Nova Marabá",
      "2": "Campus 2 - Nova Marabá", 
      "3": "Campus 3 - Cidade Jardim"
    }
    return campusMap[campus as keyof typeof campusMap] || `Campus ${campus}`
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B2F67] mb-2">Validação de Tickets</h1>
        <p className="text-muted-foreground">
          Escaneie o QR code do ticket para validar e debitar o almoço do estudante
        </p>
      </div>

      {/* Mensagens de erro e sucesso */}
      {erro && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Erro</AlertTitle>
          <AlertDescription className="text-red-700">{erro}</AlertDescription>
        </Alert>
      )}

      {sucesso && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sucesso</AlertTitle>
          <AlertDescription className="text-green-700">{sucesso}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner de QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scanner de QR Code
            </CardTitle>
            <CardDescription>
              Posicione o QR code do ticket na câmera para escanear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!escaneando ? (
                <Button onClick={iniciarScanner} className="w-full" size="lg">
                  <Camera className="mr-2 h-4 w-4" />
                  Iniciar Scanner
                </Button>
              ) : (
                <Button onClick={pararScanner} variant="outline" className="w-full" size="lg">
                  Parar Scanner
                </Button>
              )}

              {/* Container do scanner */}
              <div id="qr-reader" className="w-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Ticket
            </CardTitle>
            <CardDescription>
              Detalhes do ticket escaneado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Carregando...</span>
              </div>
            ) : ticketInfo ? (
              <div className="space-y-4">
                {/* Status do ticket */}
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={ticketInfo.utilizado ? "destructive" : ticketInfo.status === "pago" ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {ticketInfo.utilizado ? "UTILIZADO" : ticketInfo.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {ticketInfo.subsidiado ? "Subsidiado" : "Não Subsidiado"}
                  </Badge>
                </div>

                <Separator />

                {/* Informações do usuário */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{ticketInfo.usuario_nome}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{ticketInfo.usuario_email}</p>
                </div>

                <Separator />

                {/* Detalhes do ticket */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Data: {format(parseISO(ticketInfo.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{formatarCampus(ticketInfo.campus)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Valor: R$ {parseFloat(ticketInfo.valor_total.toString()).toFixed(2)}</span>
                  </div>
                </div>

                {ticketInfo.utilizado && ticketInfo.data_utilizacao && (
                  <>
                    <Separator />
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium text-sm">
                        Utilizado em: {format(parseISO(ticketInfo.data_utilizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </>
                )}

                {/* Botão de validação */}
                {!ticketInfo.utilizado && ticketInfo.status === "pago" && (
                  <>
                    <Separator />
                    <Button 
                      onClick={validarTicket} 
                      className="w-full" 
                      size="lg"
                      disabled={carregando}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {carregando ? "Validando..." : "Validar Ticket"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Escaneie um QR code para ver as informações do ticket</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 