"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, CheckCircle, XCircle, AlertCircle, QrCode, User, Calendar, MapPin, DollarSign, Upload } from "lucide-react"
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

export function ValidadorQRIntegrado() {
  const { usuario } = useAuth()
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [escaneando, setEscaneando] = useState(false)
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(true)

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

  // Verificar suporte da câmera
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        console.log("Verificando suporte da câmera...")
        
        // Verificar se getUserMedia está disponível
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log("getUserMedia não disponível")
          setCameraSupported(false)
          return
        }

        // Tentar obter acesso à câmera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        console.log("Câmera detectada com sucesso")
        
        // Parar o stream imediatamente
        stream.getTracks().forEach(track => track.stop())
        setCameraSupported(true)
      } catch (error) {
        console.error("Erro ao verificar câmera:", error)
        setCameraSupported(false)
      }
    }

    checkCameraSupport()
  }, [])

  // Limpar scanner ao desmontar componente
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {})
        setScanner(null)
      }
    }
  }, [scanner])

  // Inicializar scanner
  const iniciarScanner = async () => {
    setErro(null)
    setSucesso(null)

    try {
      console.log("Inicializando scanner...")
      
      // Verificar novamente se a câmera está disponível
      if (!cameraSupported) {
        console.log("Câmera não suportada, tentando verificar novamente...")
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          setCameraSupported(true)
          console.log("Câmera agora disponível!")
        } catch (error) {
          console.error("Câmera ainda não disponível:", error)
          setErro("❌ Câmera não está disponível. Use a opção de enviar imagem.")
          return
        }
      }

      // Importar Html5QrcodeScanner dinamicamente
      const { Html5QrcodeScanner } = await import("html5-qrcode")
      console.log("Html5QrcodeScanner importado com sucesso")
      
      const novoScanner = new Html5QrcodeScanner(
        "qr-reader-integrado",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      )

      console.log("Scanner criado, iniciando render...")

      novoScanner.render(
        async (decodedText: string) => {
          console.log("QR Code detectado pelo scanner:", decodedText)
          // QR Code lido com sucesso
          await pararScanner()
          await buscarTicketPorQR(decodedText)
        },
        (error: string) => {
          // Apenas log para erros relacionados à câmera
          if (error.includes("Permission") || error.includes("NotAllowed")) {
            console.error("Erro de permissão:", error)
            setErro("❌ Permissão da câmera negada. Permitir acesso à câmera para escanear QR codes.")
          }
          // Não mostrar outros erros de scan (são muito frequentes)
        }
      )

      setScanner(novoScanner)
      setEscaneando(true)
      console.log("Scanner iniciado com sucesso")
    } catch (error) {
      console.error("Erro ao inicializar scanner:", error)
      setErro(`Erro ao inicializar o scanner: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
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

    console.log("=== DEBUG VALIDAÇÃO QR ===")
    console.log("QR Code original recebido:", qrCode)

    try {
      // Processar QR code - pode ser JSON ou string simples
      let codigoTicket = qrCode

      // Se o QR code for JSON, extrair o qr_code
      try {
        const qrData = JSON.parse(qrCode)
        if (qrData.qr_code) {
          codigoTicket = qrData.qr_code
          console.log("QR code extraído do JSON:", codigoTicket)
        }
      } catch {
        // Se não for JSON, usar o código como está
        console.log("QR code usado diretamente:", codigoTicket)
      }

      console.log("Fazendo requisição para API com:", codigoTicket)
      console.log("URL da API:", `/api/tickets/validar-qr`)

      const response = await fetch(`/api/tickets/validar-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: codigoTicket })
      })

      console.log("Status da resposta:", response.status)
      console.log("Headers da resposta:", response.headers)

      const data = await response.json()
      console.log("Resposta completa da API:", data)

      if (response.ok) {
        console.log("✅ Resposta OK, processando ticket")
        setTicketInfo(data.ticket)
        if (data.ticket.utilizado) {
          setErro("⚠️ Este ticket já foi utilizado!")
        } else if (data.ticket.status !== "pago") {
          setErro("⚠️ Este ticket ainda não foi pago!")
        } else {
          setSucesso("✅ Ticket válido encontrado!")
        }
      } else {
        console.log("❌ Erro na resposta:", data.erro)
        setErro(data.erro || "QR Code inválido ou ticket não encontrado")
      }
    } catch (error) {
      console.error("❌ Erro geral ao buscar ticket:", error)
      setErro(`Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setCarregando(false)
      console.log("=== FIM DEBUG ===")
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

  // Processar imagem de QR code
  const processarImagemQR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setErro(null)
    setSucesso(null)

    try {
      // Importar Html5Qrcode dinamicamente
      const { Html5Qrcode } = await import("html5-qrcode")
      const html5QrCode = new Html5Qrcode("qr-file-reader")

      const qrCodeMessage = await html5QrCode.scanFile(file, /* showImage= */ false)
      console.log("QR Code da imagem:", qrCodeMessage)
      
      await buscarTicketPorQR(qrCodeMessage)
      
      // Limpar input
      event.target.value = ""
    } catch (error) {
      console.error("Erro ao ler QR code da imagem:", error)
      setErro("❌ Não foi possível ler o QR code da imagem. Certifique-se de que a imagem contém um QR code válido.")
      event.target.value = ""
    } finally {
      setUploadingImage(false)
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Mensagens de erro e sucesso */}
      {erro && (
        <div className="md:col-span-2">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Erro</AlertTitle>
            <AlertDescription className="text-red-700">{erro}</AlertDescription>
          </Alert>
        </div>
      )}

      {sucesso && (
        <div className="md:col-span-2">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Sucesso</AlertTitle>
            <AlertDescription className="text-green-700">{sucesso}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Scanner de QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scanner de QR Code
          </CardTitle>
          <CardDescription>
            Use a câmera ou envie uma imagem para escanear o QR code do ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!escaneando ? (
              <div className="space-y-3">
                <Button 
                  onClick={iniciarScanner} 
                  className="w-full" 
                  size="lg"
                  disabled={!cameraSupported}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {cameraSupported ? "Iniciar Scanner da Câmera" : "Câmera Não Disponível"}
                </Button>
                
                {!cameraSupported && (
                  <div className="text-sm text-muted-foreground text-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                    ⚠️ Câmera não disponível. Motivos possíveis:<br/>
                    • Permissão de câmera negada<br/>
                    • Navegador não suporta<br/>
                    • Conexão não é HTTPS<br/>
                    Use a opção de enviar imagem abaixo.
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={processarImagemQR}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingImage}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Imagem do QR Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={pararScanner} variant="outline" className="w-full" size="lg">
                Parar Scanner
              </Button>
            )}

            {/* Container do scanner */}
            <div id="qr-reader-integrado" className="w-full"></div>
            {/* Container invisível para processar imagens */}
            <div id="qr-file-reader" className="hidden"></div>
            
            {/* Campo de teste manual */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">
                Teste Manual - Cole o QR Code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cole aqui o código QR para teste..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const valor = (e.target as HTMLInputElement).value.trim()
                      if (valor) {
                        console.log("Teste manual com QR:", valor)
                        await buscarTicketPorQR(valor)
                        ;(e.target as HTMLInputElement).value = ""
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async (e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                    const valor = input?.value.trim()
                    if (valor) {
                      console.log("Teste manual com QR:", valor)
                      await buscarTicketPorQR(valor)
                      input.value = ""
                    }
                  }}
                >
                  Testar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para debug: cole um QR code aqui para testar sem usar a câmera
              </p>
            </div>
            
            {/* Botão para testar com QR simulado */}
            <div className="border-t pt-3">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={async () => {
                  // Criar um QR code de teste
                  const qrCodeTeste = `TICKET_${crypto.randomUUID()}_${Date.now()}`
                  console.log("Testando com QR simulado:", qrCodeTeste)
                  await buscarTicketPorQR(qrCodeTeste)
                }}
              >
                🧪 Testar com QR Simulado
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Gera um QR code fictício para testar o sistema
              </p>
            </div>
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
  )
} 