"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComprarTicketSincronizado } from "@/components/comprar-ticket-sincronizado"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtecaoRota } from "@/components/protecao-rota"
import { buscarTicketsUsuario } from "@/services/ticket-sync-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

function UsuarioPageContent() {
  const { usuario, carregando: carregandoSessao } = useAuth()
  const searchParams = useSearchParams()
  const statusPagamento = searchParams.get('pagamento')

  const usuarioId = usuario?.id || null

  const [tickets, setTickets] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarAlerta, setMostrarAlerta] = useState(false)

  useEffect(() => {
    if (!usuarioId) return

    const fetchTickets = async () => {
      try {
        const { tickets } = await buscarTicketsUsuario(usuarioId)
        setTickets(tickets)
      } catch (e) {
        console.error(e)
      } finally {
        setCarregando(false)
      }
    }
    fetchTickets()
  }, [usuarioId])

  // Mostrar alerta baseado no status do pagamento
  useEffect(() => {
    if (statusPagamento) {
      setMostrarAlerta(true)
      // Esconder alerta após 10 segundos
      const timer = setTimeout(() => {
        setMostrarAlerta(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [statusPagamento])

  const renderAlertaPagamento = () => {
    if (!mostrarAlerta || !statusPagamento) return null

    switch (statusPagamento) {
      case 'sucesso':
        return (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Pagamento Confirmado!</AlertTitle>
            <AlertDescription className="text-green-700">
              Seu pagamento foi processado com sucesso. Os tickets estão disponíveis no seu histórico.
            </AlertDescription>
          </Alert>
        )
      case 'cancelado':
        return (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Pagamento Cancelado</AlertTitle>
            <AlertDescription className="text-yellow-700">
              O pagamento foi cancelado. Você pode tentar novamente quando quiser.
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  return (
    <ProtecaoRota>
      <div className="w-full max-w-3xl mx-auto py-6">
        {renderAlertaPagamento()}
        <Tabs defaultValue="comprar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comprar">Comprar Ticket</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="comprar">
          <Card>
            <CardHeader>
              <CardTitle>Comprar ticket</CardTitle>
              <CardDescription>Selecione data, quantidade e finalize a compra.</CardDescription>
            </CardHeader>
            <CardContent>
              <ComprarTicketSincronizado />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          {!usuarioId ? (
            <p className="text-muted-foreground py-10">Faça login para visualizar seus tickets.</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de compras</CardTitle>
                <CardDescription>Veja seus tickets adquiridos.</CardDescription>
              </CardHeader>
              <CardContent>
                {carregando ? (
                  <p>Carregando...</p>
                ) : tickets.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum ticket encontrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{format(parseISO(t.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            <TableCell>{t.quantidade}</TableCell>
                            <TableCell>R$ {Number(t.valor_total).toFixed(2)}</TableCell>
                            <TableCell>{t.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </ProtecaoRota>
  )
}

export default function UsuarioPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <UsuarioPageContent />
    </Suspense>
  )
}

