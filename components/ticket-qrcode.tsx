"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, Share2, Printer } from "lucide-react"
import { useIdioma } from "@/contexts/idioma-context"

interface TicketQRCodeProps {
  ticket: {
    id: string
    data: string
    quantidade: number
    valor_total: number
    status: "pago" | "pendente" | "cancelado"
    subsidiado?: boolean
  }
  onClose?: () => void
}

export function TicketQRCode({ ticket, onClose }: TicketQRCodeProps) {
  const { t } = useIdioma()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  // Dados que serão codificados no QR code
  const ticketData = {
    id: ticket.id,
    data: ticket.data,
    quantidade: ticket.quantidade,
    status: ticket.status,
    timestamp: new Date().toISOString(), // Adiciona timestamp para segurança
  }

  useEffect(() => {
    // Gerar QR code usando API pública
    const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      JSON.stringify(ticketData),
    )}`
    setQrCodeUrl(qrCodeApi)
  }, [ticket.id])

  // Função para baixar o QR code
  const downloadQRCode = async () => {
    try {
      // Criar um elemento de imagem temporário para carregar o QR code
      const img = new Image()
      img.crossOrigin = "anonymous" // Importante para evitar problemas de CORS

      // Criar uma promessa para aguardar o carregamento da imagem
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = qrCodeUrl
      })

      // Criar um canvas para desenhar a imagem
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height

      // Desenhar a imagem no canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0)

        // Converter o canvas para um blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Criar uma URL para o blob
            const url = URL.createObjectURL(blob)

            // Criar um link para download
            const link = document.createElement("a")
            link.href = url
            link.download = `ticket-${ticket.id}.png`
            document.body.appendChild(link)
            link.click()

            // Limpar
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      }
    } catch (error) {
      console.error("Erro ao baixar QR code:", error)
      alert("Não foi possível baixar o QR code. Tente novamente.")
    }
  }

  // Função para compartilhar o ticket (se a API Web Share estiver disponível)
  const compartilharTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket RU - ${format(parseISO(ticket.data), "dd/MM/yyyy", { locale: ptBR })}`,
          text: `Meu ticket para o Restaurante Universitário - ${format(parseISO(ticket.data), "dd/MM/yyyy", { locale: ptBR })}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      alert("Seu navegador não suporta a funcionalidade de compartilhamento")
    }
  }

  // Função para imprimir o ticket
  const imprimirTicket = () => {
    window.print()
  }

  return (
    <Card className="max-w-md mx-auto print:shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Ticket de Almoço</CardTitle>
        <div className="flex justify-center mt-2">
          <Badge
            variant="outline"
            className={
              ticket.status === "pago"
                ? "bg-green-50 text-green-700 border-green-200"
                : ticket.status === "pendente"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }
          >
            {ticket.status === "pago" ? "Pago" : ticket.status === "pendente" ? "Pendente" : "Cancelado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {qrCodeUrl && (
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code do ticket" className="w-48 h-48" />
          </div>
        )}

        <div className="w-full space-y-2 text-center">
          <p className="font-medium">ID: {ticket.id}</p>
          <p>Data: {format(parseISO(ticket.data), "dd/MM/yyyy", { locale: ptBR })}</p>
          <p>Quantidade: {ticket.quantidade}</p>
          <p>Valor: R$ {ticket.valor_total.toFixed(2)}</p>
          <p>Tipo: {ticket.subsidiado ? "Subsidiado" : "Não Subsidiado"}</p>
        </div>

        <div className="text-xs text-center text-muted-foreground mt-4">
          <p>Apresente este QR code no Restaurante Universitário</p>
          <p>Válido apenas para a data indicada</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 print:hidden">
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={downloadQRCode}>
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
          <Button variant="outline" className="flex-1" onClick={compartilharTicket}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="outline" className="flex-1" onClick={imprimirTicket}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>

        {onClose && (
          <Button className="w-full mt-2" onClick={onClose}>
            Fechar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

