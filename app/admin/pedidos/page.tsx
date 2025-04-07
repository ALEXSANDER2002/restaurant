import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ListaPedidosSincronizada } from "@/components/lista-pedidos-sincronizada"
import { ProtecaoRota } from "@/components/protecao-rota"

export default function PaginaPedidos() {
  return (
    <ProtecaoRota tipoPermitido="admin">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento de Pedidos</h1>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>Gerencie os pedidos realizados pelos estudantes</CardDescription>
          </CardHeader>
          <CardContent>
            <ListaPedidosSincronizada />
          </CardContent>
        </Card>
      </div>
    </ProtecaoRota>
  )
}

