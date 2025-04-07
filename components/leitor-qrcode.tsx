"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Camera, CameraOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useIdioma } from "@/contexts/idioma-context"

export function LeitorQRCode() {
  const { entrarComQRCode, carregando: carregandoAuth } = useAuth()
  const { t } = useIdioma()
  const [escaneando, setEscaneando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [scanner, setScanner] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
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
      const novoScanner = new Html5Qrcode("qr-reader-container")
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

            // Tentar processar como JSON, ou usar texto simples
            let dadosQR = decodedText

            // Se o texto não parece ser JSON, criar um objeto simulado
            if (!decodedText.startsWith("{")) {
              dadosQR = JSON.stringify({
                email: "estudante@exemplo.com",
                senha: "senha123",
              })
            }

            const { erro: erroLogin } = await entrarComQRCode(dadosQR)

            if (erroLogin) {
              setErro(erroLogin)
            }
          } catch (error) {
            console.error("Erro ao processar QR code:", error)
            setErro("QR Code com formato inválido")
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

  return (
    <div className="space-y-4">
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="w-full h-64 bg-muted rounded-md overflow-hidden flex items-center justify-center">
        {carregando ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando leitor de QR Code...</p>
          </div>
        ) : (
          <div id="qr-reader-container" ref={qrContainerRef} className="w-full h-full" aria-live="polite" />
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={escaneando ? pararEscaneamento : iniciarEscaneamento}
        disabled={carregandoAuth || carregando}
      >
        {escaneando ? (
          <>
            <CameraOff className="mr-2 h-4 w-4" />
            {t("login.qrcode.parar")}
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            {t("login.qrcode.iniciar")}
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">{t("login.qrcode.instrucao")}</p>

      {/* Instruções para teste */}
      <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Para testar o QR Code:</h3>
        <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-1">
          <li>
            Gere um QR code com o texto:{" "}
            <code className="bg-blue-100 px-1 rounded">{"{'email':'estudante@exemplo.com','senha':'senha123'}"}</code>
          </li>
          <li>Ou use qualquer QR code - o sistema simulará um login de estudante para demonstração</li>
          <li>Permita o acesso à câmera quando solicitado pelo navegador</li>
        </ol>
      </div>
    </div>
  )
}

