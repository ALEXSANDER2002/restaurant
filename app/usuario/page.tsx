"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComprarTicketMelhorado } from "@/components/comprar-ticket-melhorado"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtecaoRota } from "@/components/protecao-rota"
import { buscarTicketsUsuario } from "@/services/ticket-sync-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, XCircle, AlertCircle, User, Key, QrCode, CreditCard, History, Settings } from "lucide-react"
import { PerfilUsuario } from "@/components/perfil-usuario"
import { QRCodeLogin } from "@/components/qrcode-login"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TicketQRCode } from "@/components/ticket-qrcode"
import { Button } from "@/components/ui/button"

function UsuarioPageContent() {
  const { usuario, carregando: carregandoSessao } = useAuth()
  const searchParams = useSearchParams()
  const statusPagamento = searchParams.get('pagamento')

  const usuarioId = usuario?.id || null

  const [tickets, setTickets] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarAlerta, setMostrarAlerta] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ticketSelecionado, setTicketSelecionado] = useState<any | null>(null)

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
      <div className="w-full max-w-4xl mx-auto py-6">
        {renderAlertaPagamento()}
        
        {/* Header do perfil */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-blue-200">
                  <AvatarImage 
                    src={usuario?.avatar_url || undefined} 
                    alt="Foto de perfil" 
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                    {usuario?.email ? usuario.email.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">
                    Olá, {usuario?.nome || 'Usuário'}!
                  </h1>
                  <p className="text-blue-700">
                    {usuario?.email} • {usuario?.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="comprar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comprar" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Comprar
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="qrcode" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comprar">
          <ComprarTicketMelhorado />
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
                          <TableHead>Campus</TableHead>
                          <TableHead>QR Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              {format(parseISO(ticket.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>{ticket.quantidade}</TableCell>
                            <TableCell>R$ {parseFloat(ticket.valor_total).toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {ticket.status === "pago" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : ticket.status === "pendente" ? (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="capitalize">{ticket.status}</span>
                                {ticket.utilizado && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    Utilizado
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              Campus {ticket.campus}
                            </TableCell>
                            <TableCell>
                              {ticket.status === "pago" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTicketSelecionado(ticket)}
                                  className="flex items-center gap-1"
                                >
                                  <QrCode className="h-4 w-4" />
                                  Ver QR
                                </Button>
                              )}
                            </TableCell>
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

        <TabsContent value="perfil">
          <PerfilUsuario />
        </TabsContent>

        <TabsContent value="qrcode">
          <QRCodeLogin />
        </TabsContent>
        </Tabs>
      </div>

      {/* Modal do QR Code */}
      {ticketSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <TicketQRCode 
              ticket={ticketSelecionado} 
              onClose={() => setTicketSelecionado(null)}
            />
          </div>
        </div>
      )}
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

