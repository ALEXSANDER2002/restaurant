"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { QrCode, RefreshCw, AlertCircle, Copy, CheckCircle, Download } from "lucide-react"
import QRCodeLib from "qrcode"

export function QRCodeLogin() {
  const { usuario } = useAuth()
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [qrCodeToken, setQrCodeToken] = useState<string>("")
  const [copiado, setCopiado] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const gerarQRCode = async () => {
    if (!usuario?.id) return

    setGerando(true)
    setErro(null)

    try {
      // Gerar token temporário para o QR Code
      const response = await fetch("/api/gerar-qr-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: usuario.id })
      })

      const data = await response.json()

      if (response.ok) {
        const { token, loginUrl } = data
        setQrCodeToken(token)

        // Gerar QR Code
        const qrCodeDataUrl = await QRCodeLib.toDataURL(loginUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        setQrCodeData(qrCodeDataUrl)
      } else {
        setErro(data.erro || "Erro ao gerar QR Code")
      }
    } catch (error) {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setGerando(false)
    }
  }

  const copiarLink = async () => {
    if (!qrCodeToken) return

    const loginUrl = `${window.location.origin}/login-qr/${qrCodeToken}`
    
    try {
      await navigator.clipboard.writeText(loginUrl)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar:", error)
    }
  }

  const baixarQRCode = () => {
    if (!qrCodeData) return

    const link = document.createElement('a')
    link.download = `qrcode-login-${usuario?.email?.split('@')[0]}.png`
    link.href = qrCodeData
    link.click()
  }

  useEffect(() => {
    gerarQRCode()
  }, [usuario?.id])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code para Login
        </CardTitle>
                 <CardDescription>
           Use este QR Code para fazer login rapidamente em outros dispositivos. 
           O código permanece ativo até que você gere um novo.
         </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          {erro && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          <div className="mx-auto w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 shadow-sm">
            {gerando ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Gerando QR Code...</p>
              </div>
            ) : qrCodeData ? (
              <img 
                src={qrCodeData} 
                alt="QR Code para Login" 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">QR Code não disponível</p>
              </div>
            )}
          </div>

          {qrCodeData && (
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={copiarLink}
                className="flex items-center gap-2"
              >
                {copiado ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar Link
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={baixarQRCode}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={gerarQRCode}
                disabled={gerando}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${gerando ? 'animate-spin' : ''}`} />
                Renovar
              </Button>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
                         <ol className="text-sm text-blue-700 space-y-1 text-left">
               <li><strong>1.</strong> Abra a câmera ou leitor de QR Code no seu dispositivo</li>
               <li><strong>2.</strong> Aponte para o código QR acima</li>
               <li><strong>3.</strong> Será redirecionado automaticamente para o login</li>
               <li><strong>4.</strong> Confirme o login para acessar sua conta</li>
               <li><strong>5.</strong> O código permanece ativo até gerar um novo</li>
             </ol>
          </div>

                     <Alert>
             <AlertCircle className="h-4 w-4" />
             <AlertDescription>
               <strong>Segurança:</strong> Este QR Code contém um token único para você. 
               Não compartilhe este código com outras pessoas. Quando você gerar um novo código, 
               o anterior será automaticamente invalidado.
             </AlertDescription>
           </Alert>

          {/* Informações do QR Code */}
          {qrCodeToken && (
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <h5 className="font-medium text-gray-900 mb-1">Informações do Token:</h5>
              <p className="text-xs text-gray-600 font-mono break-all">
                Token: {qrCodeToken.slice(0, 20)}...
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Usuário: {usuario?.email} • ID: {usuario?.id?.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 