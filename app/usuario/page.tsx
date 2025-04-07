import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComprarTicketSincronizado } from "@/components/comprar-ticket-sincronizado"
import { HistoricoComprasSincronizado } from "@/components/historico-compras-sincronizado"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtecaoRota } from "@/components/protecao-rota"

export default function PaginaUsuario() {
  return (
    <ProtecaoRota tipoPermitido="usuario">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Painel do Estudante</h1>

        <Tabs defaultValue="comprar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="comprar">Comprar Ticket</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="comprar">
            <Card>
              <CardHeader>
                <CardTitle>Comprar Ticket de Almoço</CardTitle>
                <CardDescription>Adquira seu ticket para o almoço no Restaurante Universitário</CardDescription>
              </CardHeader>
              <CardContent>
                <ComprarTicketSincronizado />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Compras</CardTitle>
                <CardDescription>Visualize suas compras anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricoComprasSincronizado />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Conta</CardTitle>
                <CardDescription>Gerencie suas preferências e configurações de acessibilidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Preferências de Notificação</h3>
                    {/* Conteúdo de configurações */}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Acessibilidade</h3>
                    {/* Conteúdo de acessibilidade */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtecaoRota>
  )
}

