import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, X, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/database.types"

type Ticket = Database["public"]["Tables"]["tickets"]["Row"]
type PedidoExibicao = Omit<Ticket, "updated_at"> & {
  updated_at?: string
  usuario_nome?: string
}

type OrdenacaoColuna = {
  coluna: keyof PedidoExibicao
  direcao: "asc" | "desc"
}

interface TabelaPedidosProps {
  pedidos: PedidoExibicao[]
  carregando: boolean
  ordenacao: OrdenacaoColuna
  onOrdenar: (coluna: keyof PedidoExibicao) => void
  onAtualizarStatus: (pedidoId: string, novoStatus: "pago" | "pendente" | "cancelado") => void
}

export function TabelaPedidos({
  pedidos,
  carregando,
  ordenacao,
  onOrdenar,
  onAtualizarStatus,
}: TabelaPedidosProps) {
  // Função auxiliar para formatar valor monetário de forma segura
  const formatarValor = (valor: any): string => {
    if (valor === null || valor === undefined) return "0,00"
    
    const numeroValor = typeof valor === 'string' ? parseFloat(valor) : valor
    
    if (isNaN(numeroValor)) return "0,00"
    
    return numeroValor.toFixed(2).replace('.', ',')
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onOrdenar("id")}
                className="h-8 w-full justify-start text-left font-medium"
              >
                ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onOrdenar("usuario_nome")}
                className="h-8 w-full justify-start text-left font-medium"
              >
                Usuário
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onOrdenar("data")}
                className="h-8 w-full justify-start text-left font-medium"
              >
                Data
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onOrdenar("quantidade")}
                className="h-8 w-full justify-start text-left font-medium"
              >
                Quantidade
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onOrdenar("valor_total")}
                className="h-8 w-full justify-start text-left font-medium"
              >
                Valor Total
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onOrdenar("status")}
                className="h-8 w-full justify-start text-left font-medium"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carregando ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Carregando pedidos...
              </TableCell>
            </TableRow>
          ) : pedidos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Nenhum pedido encontrado.
              </TableCell>
            </TableRow>
          ) : (
            pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell className="font-medium">{pedido.id}</TableCell>
                <TableCell>{pedido.usuario_nome}</TableCell>
                <TableCell>{format(parseISO(pedido.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                <TableCell>{pedido.quantidade}</TableCell>
                <TableCell>R$ {formatarValor(pedido.valor_total)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      pedido.status === "pago"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : pedido.status === "pendente"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {pedido.status === "pago"
                      ? "Confirmado"
                      : pedido.status === "pendente"
                      ? "Pendente"
                      : "Cancelado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pedido.status === "pendente" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 text-green-600"
                        onClick={() => onAtualizarStatus(pedido.id, "pago")}
                        aria-label="Confirmar pedido"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => onAtualizarStatus(pedido.id, "cancelado")}
                        aria-label="Cancelar pedido"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 