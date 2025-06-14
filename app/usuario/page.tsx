"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComprarTicketSincronizado } from "@/components/comprar-ticket-sincronizado"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtecaoRota } from "@/components/protecao-rota"
import { buscarTicketsUsuario } from "@/services/ticket-sync-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"

export default function UsuarioPage() {
  const { usuario, carregando: carregandoSessao } = useAuth()

  const usuarioId = usuario?.id || null

  const [tickets, setTickets] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

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

  return (
    <ProtecaoRota>
      <Tabs defaultValue="comprar" className="w-full max-w-3xl mx-auto py-6">
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
                            <TableCell>R$ {t.valor_total.toFixed(2)}</TableCell>
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
    </ProtecaoRota>
  )
}

