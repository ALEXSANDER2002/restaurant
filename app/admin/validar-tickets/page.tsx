import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ValidadorTicket } from "@/components/validador-ticket"
import { ProtecaoRota } from "@/components/protecao-rota"

export default function PaginaValidarTickets() {
  return (
    <ProtecaoRota tipoPermitido="admin">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Validar Tickets</h1>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Escaneamento de Tickets</CardTitle>
              <CardDescription>Escaneie o QR code do ticket para validar o acesso ao restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <ValidadorTicket />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtecaoRota>
  )
}

