"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function QRCodeDemo() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    // Gerar um QR code para demonstração usando uma API pública
    const dadosLogin = {
      email: "estudante@exemplo.com",
      senha: "senha123",
    }

    const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(dadosLogin))}`
    setQrCodeUrl(qrCodeApi)
  }, [])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>QR Code de Demonstração</CardTitle>
        <CardDescription>Use este QR code para testar o login por QR code</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl || "/placeholder.svg"}
            alt="QR Code de demonstração"
            className="w-48 h-48 border rounded-md"
          />
        ) : (
          <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-md">Carregando QR Code...</div>
        )}

        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Este QR code contém as credenciais do usuário estudante para demonstração.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.open(qrCodeUrl || "", "_blank")} className="w-full" disabled={!qrCodeUrl}>
          Abrir QR Code em Nova Aba
        </Button>
      </CardFooter>
    </Card>
  )
}

