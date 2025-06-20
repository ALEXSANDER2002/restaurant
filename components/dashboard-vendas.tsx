"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loading } from "@/components/ui/loading"
import { StatusAlert } from "@/components/status-alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Cores para os gráficos
const CORES = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"]
const CORES_STATUS = {
  pago: "#10b981", // verde
  pendente: "#f59e0b", // amarelo
  cancelado: "#ef4444", // vermelho
}

// Ajustar as margens dos gráficos para dar mais espaço
const chartMargins = { top: 20, right: 30, left: 20, bottom: 30 }

interface ChartContainerProps {
  children: React.ReactNode
  height?: number
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
}

interface EstatisticasData {
  periodo: string
  totalVendas: number
  valorTotal: number
  ticketsSubsidiados: number
  ticketsNaoSubsidiados: number
  statusStats: {
    pagos: number
    pendentes: number
    cancelados: number
  }
  topUsuarios: { nome: string; quantidade: number }[]
  dadosPorHora: Array<{
    hora: string
    quantidade: number
    valor: number
    subsidiados: number
    naoSubsidiados: number
  }>
  dadosPorDia: Array<{
    dia: string
    quantidade: number
    valor: number
    subsidiados: number
    naoSubsidiados: number
  }>
}

export function DashboardVendas() {
  const [carregando, setCarregando] = useState(true)
  const [conectado, setConectado] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState("hoje")
  const [dados, setDados] = useState<EstatisticasData | null>(null)

  const carregarEstatisticas = async (periodoSelecionado: string = periodo) => {
    try {
      setCarregando(true)
      setErro(null)

      const response = await fetch(`/api/admin/estatisticas?periodo=${periodoSelecionado}`)
      const result = await response.json()

      if (!result.sucesso) {
        throw new Error(result.erro || "Erro ao carregar estatísticas")
      }

      setDados(result.data)
      setConectado(true)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      setConectado(false)
      setErro("Erro ao carregar estatísticas do banco de dados.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const handlePeriodoChange = (novoPeriodo: string) => {
    setPeriodo(novoPeriodo)
    carregarEstatisticas(novoPeriodo)
  }

  const formatarValor = (valor: number) => {
    return `R$ ${valor.toFixed(2)}`
  }

  // Preparar dados para gráficos
  const distribuicaoStatus = dados ? [
    { nome: "Pagos", valor: dados.statusStats.pagos, cor: "#10b981" },
    { nome: "Pendentes", valor: dados.statusStats.pendentes, cor: "#f59e0b" },
    { nome: "Cancelados", valor: dados.statusStats.cancelados, cor: "#ef4444" },
  ] : []

  const tiposTicket = dados ? [
    { nome: "Subsidiado", valor: dados.ticketsSubsidiados, cor: "#3b82f6", preco: 2.0 },
    { nome: "Não Subsidiado", valor: dados.ticketsNaoSubsidiados, cor: "#8b5cf6", preco: 13.0 },
  ] : []

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Dashboard de Vendas</h2>
          <div className="flex items-center gap-2">
            <Select disabled>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Carregando..." />
              </SelectTrigger>
            </Select>
            <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-700">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-12 flex items-center">
                <Loading size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">tickets vendidos</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-700">Valor Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-12 flex items-center">
                <Loading size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">receita total</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-700">Tickets Subsidiados</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-12 flex items-center">
                <Loading size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">R$ 2,00 cada</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-700">Tickets Não Subsidiados</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-12 flex items-center">
                <Loading size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">R$ 13,00 cada</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Carregando dados...</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <Loading text="Carregando estatísticas..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (erro) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{erro}</AlertDescription>
      </Alert>
    )
  }

  if (!dados) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nenhum dado disponível</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard de Vendas</h2>
          <p className="text-muted-foreground mt-1">Visualize estatísticas e gráficos de vendas em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={handlePeriodoChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="mes">Mês</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => carregarEstatisticas()} className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </Button>
        </div>
      </div>

      {!conectado && (
        <StatusAlert 
          type="error" 
          title="Erro de Conexão" 
          message="Erro ao conectar com o banco de dados. Alguns dados podem estar desatualizados." 
          onRetry={() => carregarEstatisticas()}
        />
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <Card className="border-2 hover:border-blue-200 transition-colors duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-700">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">{dados.totalVendas}</div>
            <p className="text-sm text-muted-foreground">tickets vendidos</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-green-200 transition-colors duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-700">Valor Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">{formatarValor(dados.valorTotal)}</div>
            <p className="text-sm text-muted-foreground">receita total</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-purple-200 transition-colors duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-700">Tickets Subsidiados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">{dados.ticketsSubsidiados}</div>
            <p className="text-sm text-muted-foreground">R$ 2,00 cada</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-orange-200 transition-colors duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-gray-700">Tickets Não Subsidiados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">{dados.ticketsNaoSubsidiados}</div>
            <p className="text-sm text-muted-foreground">R$ 13,00 cada</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="bg-white rounded-lg border-2 p-6">
        <Tabs defaultValue="vendas" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-6">
            <TabsTrigger value="vendas" className="text-sm font-medium">📊 Vendas</TabsTrigger>
            <TabsTrigger value="status" className="text-sm font-medium">📈 Status</TabsTrigger>
            <TabsTrigger value="tipos" className="text-sm font-medium">🎯 Tipos</TabsTrigger>
            <TabsTrigger value="usuarios" className="text-sm font-medium">👥 Top Usuários</TabsTrigger>
          </TabsList>

        <TabsContent value="vendas">
          <Card>
            <CardHeader>
              <CardTitle>
                {periodo === "hoje" ? "Vendas por Hora" : "Vendas por Dia"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={periodo === "hoje" ? dados.dadosPorHora : dados.dadosPorDia}
                    margin={chartMargins}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={periodo === "hoje" ? "hora" : "dia"} 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === "valor" ? formatarValor(Number(value)) : value,
                        name === "quantidade" ? "Quantidade" : name === "valor" ? "Valor" : name
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
                    <Bar dataKey="subsidiados" fill="#82ca9d" name="Subsidiados" />
                    <Bar dataKey="naoSubsidiados" fill="#ffc658" name="Não Subsidiados" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuicaoStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, valor, percent }) => `${nome}: ${valor} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {distribuicaoStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo de Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tiposTicket}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, valor, percent }) => `${nome}: ${valor} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {tiposTicket.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              {dados.topUsuarios.length > 0 ? (
                <ChartContainer height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dados.topUsuarios}
                      margin={chartMargins}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="nome" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade de Tickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum dado de usuário disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

export function ChartContainer({
  children,
  height = 300,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "Nenhum dado disponível",
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loading text="Carregando gráfico..." />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        {emptyMessage}
      </div>
    )
  }

  return <div style={{ height }}>{children}</div>
}

