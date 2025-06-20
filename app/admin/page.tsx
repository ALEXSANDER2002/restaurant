import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardVendas } from "@/components/dashboard-vendas"
import { ListaPedidos } from "@/components/lista-pedidos"
import { ProtecaoRota } from "@/components/protecao-rota"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import Link from "next/link"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
// import { EstatisticasTempoReal } from "@/components/estatisticas-tempo-real"

export default function PaginaAdmin() {
  return (
    <ProtecaoRota>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Painel do Administrador</h1>
            <p className="text-muted-foreground mt-1">Gerencie vendas, pedidos e usuários do sistema</p>
          </div>
        </div>

        <ResponsiveContainer mobileClassName="space-y-4" tabletClassName="space-y-6" desktopClassName="space-y-8">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="w-full mb-8 overflow-x-auto flex flex-nowrap">
              <TabsTrigger value="dashboard" className="flex-1 min-w-[100px]">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="flex-1 min-w-[100px]">
                Pedidos
              </TabsTrigger>
              { /* <TabsTrigger value="usuarios" className="flex-1 min-w-[100px]">Usuários</TabsTrigger> */ }
            </TabsList>

            <TabsContent value="dashboard">
              <Card className="shadow-sm border-t-4 border-t-primary/30 w-full">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30">
                  <div>
                    <CardTitle>Dashboard de Vendas</CardTitle>
                    <CardDescription>Visualize estatísticas e gráficos de vendas de almoço</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <DashboardVendas />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pedidos">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Pedidos</CardTitle>
                  <CardDescription>Gerencie os pedidos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ListaPedidos />
                </CardContent>
              </Card>
            </TabsContent>

            { /* Aba de usuários temporariamente desativada */ }

          </Tabs>
        </ResponsiveContainer>
      </div>
    </ProtecaoRota>
  )
}

