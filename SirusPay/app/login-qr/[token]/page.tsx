"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function LoginQRPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'error'>('loading')
  const [dadosUsuario, setDadosUsuario] = useState<any>(null)
  const [processandoLogin, setProcessandoLogin] = useState(false)

  const verificarToken = async () => {
    try {
      const response = await fetch(`/api/verificar-qr-login/${token}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('valid')
        setDadosUsuario(data.usuario)
      } else if (response.status === 410) {
        setStatus('expired')
      } else {
        setStatus('invalid')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const confirmarLogin = async () => {
    setProcessandoLogin(true)

    try {
      const response = await fetch(`/api/confirmar-qr-login/${token}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        // Login bem-sucedido, redirecionar
        router.push('/?qr-login=success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    } finally {
      setProcessandoLogin(false)
    }
  }

  useEffect(() => {
    if (token) {
      verificarToken()
    }
  }, [token])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
                <h2 className="text-xl font-semibold">Verificando QR Code...</h2>
                <p className="text-gray-600">Aguarde enquanto validamos seu código</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'valid':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Confirmar Login</CardTitle>
              <CardDescription>
                QR Code válido! Confirme o login para acessar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dadosUsuario && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Dados da Conta:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p><strong>Email:</strong> {dadosUsuario.email}</p>
                    <p><strong>Tipo:</strong> {dadosUsuario.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}</p>
                    <p><strong>ID:</strong> {dadosUsuario.id?.slice(0, 8)}...</p>
                  </div>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ao confirmar, você será logado automaticamente neste dispositivo. 
                  Certifique-se de que é você quem está fazendo esta ação.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  onClick={confirmarLogin}
                  disabled={processandoLogin}
                  className="flex-1"
                >
                  {processandoLogin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Login
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'expired':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                               <h2 className="text-xl font-semibold text-yellow-800">QR Code Inválido</h2>
               <p className="text-gray-600">
                 Este código QR foi invalidado. Isso acontece quando um novo código é gerado.
               </p>
                <Button onClick={() => router.push('/usuario')} className="w-full">
                  Gerar Novo QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'invalid':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-800">QR Code Inválido</h2>
                <p className="text-gray-600">
                  Este código QR não é válido ou já foi usado. Verifique se o código está correto.
                </p>
                <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'error':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-800">Erro</h2>
                <p className="text-gray-600">
                  Ocorreu um erro ao processar o QR Code. Tente novamente.
                </p>
                <div className="flex gap-2">
                  <Button onClick={verificarToken} variant="outline" className="flex-1">
                    Tentar Novamente
                  </Button>
                  <Button onClick={() => router.push('/')} className="flex-1">
                    Voltar ao Início
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  )
} 