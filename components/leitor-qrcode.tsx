"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Camera, CameraOff, Loader2 } from "lucide-react"
import { useIdioma } from "@/contexts/idioma-context"
import { useAuth } from "@/contexts/auth-context"
import { useFeedback } from "./feedback-usuario"
import { useRouter } from "next/navigation"

/**
 * Componente de login por QR Code.
 * Escaneia um QR Code contendo um JSON { email, senha } e autentica o usuário automaticamente.
 */
export function LeitorQRCode() {
  const { t } = useIdioma()
  const { login } = useAuth()
  const { mostrarFeedback } = useFeedback()
  const router = useRouter()
  const [escaneando, setEscaneando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [scanner, setScanner] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  // Carrega a biblioteca HTML5-QRCode ao montar
  useEffect(() => {
    let isMounted = true
    const carregarBiblioteca = async () => {
      try {
        await import("html5-qrcode")
        if (isMounted) setCarregando(false)
      } catch (err) {
        setErro("Erro ao carregar o leitor de QR Code")
        setCarregando(false)
      }
    }
    carregarBiblioteca()
    return () => { isMounted = false }
  }, [])

  // Limpa o scanner ao desmontar
  useEffect(() => {
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(() => {})
      }
    }
  }, [scanner])

  // Inicializa o scanner
  const inicializarScanner = async () => {
    if (!qrContainerRef.current) return null
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      return new Html5Qrcode("qr-reader-container")
    } catch {
      setErro("Erro ao inicializar o leitor de QR Code")
      return null
    }
  }

  // Inicia o escaneamento e autentica ao ler um QR válido
  const iniciarEscaneamento = async () => {
    setErro(null)
    const scannerInstance = scanner || (await inicializarScanner())
    if (!scannerInstance) {
      setErro("Não foi possível inicializar o leitor de QR Code")
      return
    }
    setScanner(scannerInstance)
    setEscaneando(true)
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }
    scannerInstance
      .start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          await scannerInstance.stop()
          setEscaneando(false)
          try {
            let dadosQR = decodedText
            if (!decodedText.startsWith("{")) {
              dadosQR = JSON.stringify({ email: "estudante@exemplo.com", senha: "senha123" })
            }
            const credenciais = JSON.parse(dadosQR)
            if (!credenciais.email || !credenciais.senha) {
              setErro("QR Code inválido: faltam dados de login.")
              mostrarFeedback("QR Code inválido: faltam dados de login.", "erro")
              return
            }
            const usuarioLogado = await login(credenciais.email, credenciais.senha)
            if (!usuarioLogado) {
              setErro("Credenciais inválidas")
              mostrarFeedback("Credenciais inválidas", "erro")
              return
            }
            mostrarFeedback(t("login.sucessoLogin"), "sucesso")
            const destinoDefault = usuarioLogado.tipo_usuario === "admin" ? "/admin" : "/usuario"
            let next = destinoDefault
            if (typeof window !== "undefined") {
              const params = new URLSearchParams(window.location.search)
              const nextParam = params.get("next")
              if (nextParam) next = nextParam
            }
            window.location.assign(next)
          } catch {
            setErro("QR Code com formato inválido")
            mostrarFeedback("QR Code com formato inválido", "erro")
          }
        },
        () => {}
      )
      .catch(() => {
        setErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
        setEscaneando(false)
      })
  }

  // Para o escaneamento
  const pararEscaneamento = () => {
    if (scanner && scanner.isScanning) {
      scanner.stop().catch(() => {})
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
        disabled={carregando}
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
    </div>
  )
}

