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
// import { useSupabase } from "@/contexts/supabase-provider"
import { Button } from "@/components/ui/button"

// Dados simulados para os gráficos
const DADOS_DIARIOS = [
  { dia: "08:00", quantidade: 12, valor: 96.0, subsidiados: 8, naoSubsidiados: 4 },
  { dia: "09:00", quantidade: 18, valor: 144.0, subsidiados: 12, naoSubsidiados: 6 },
  { dia: "10:00", quantidade: 25, valor: 200.0, subsidiados: 15, naoSubsidiados: 10 },
  { dia: "11:00", quantidade: 42, valor: 336.0, subsidiados: 30, naoSubsidiados: 12 },
  { dia: "12:00", quantidade: 58, valor: 464.0, subsidiados: 40, naoSubsidiados: 18 },
  { dia: "13:00", quantidade: 45, valor: 360.0, subsidiados: 32, naoSubsidiados: 13 },
  { dia: "14:00", quantidade: 30, valor: 240.0, subsidiados: 20, naoSubsidiados: 10 },
  { dia: "15:00", quantidade: 15, valor: 120.0, subsidiados: 10, naoSubsidiados: 5 },
]

const DADOS_SEMANAIS = [
  { dia: "Segunda", quantidade: 120, valor: 960.0, subsidiados: 85, naoSubsidiados: 35 },
  { dia: "Terça", quantidade: 145, valor: 1160.0, subsidiados: 100, naoSubsidiados: 45 },
  { dia: "Quarta", quantidade: 160, valor: 1280.0, subsidiados: 110, naoSubsidiados: 50 },
  { dia: "Quinta", quantidade: 155, valor: 1240.0, subsidiados: 105, naoSubsidiados: 50 },
  { dia: "Sexta", quantidade: 180, valor: 1440.0, subsidiados: 125, naoSubsidiados: 55 },
]

const DISTRIBUICAO_STATUS = [
  { nome: "Pagos", valor: 75, cor: "#10b981" },
  { nome: "Pendentes", valor: 18, cor: "#f59e0b" },
  { nome: "Cancelados", valor: 7, cor: "#ef4444" },
]

const TIPOS_TICKET = [
  { nome: "Subsidiado", valor: 70, cor: "#3b82f6", preco: 2.0 },
  { nome: "Não Subsidiado", valor: 30, cor: "#8b5cf6", preco: 13.0 },
]

const TOP_USUARIOS = [
  { nome: "Maria Silva", quantidade: 42 },
  { nome: "João Santos", quantidade: 38 },
  { nome: "Ana Oliveira", quantidade: 31 },
  { nome: "Carlos Souza", quantidade: 27 },
  { nome: "Juliana Costa", quantidade: 23 },
]

const TENDENCIA_MENSAL = [
  { dia: "01/05", quantidade: 110, valor: 880.0, subsidiados: 75, naoSubsidiados: 35 },
  { dia: "05/05", quantidade: 125, valor: 1000.0, subsidiados: 85, naoSubsidiados: 40 },
  { dia: "10/05", quantidade: 140, valor: 1120.0, subsidiados: 95, naoSubsidiados: 45 },
  { dia: "15/05", quantidade: 160, valor: 1280.0, subsidiados: 110, naoSubsidiados: 50 },
  { dia: "20/05", quantidade: 150, valor: 1200.0, subsidiados: 105, naoSubsidiados: 45 },
  { dia: "25/05", quantidade: 170, valor: 1360.0, subsidiados: 120, naoSubsidiados: 50 },
  { dia: "30/05", quantidade: 185, valor: 1480.0, subsidiados: 130, naoSubsidiados: 55 },
]

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

export function DashboardVendas() {
  const [carregando, setCarregando] = useState(true)
  const [conectado, setConectado] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  // const { isOnline } = useSupabase()

  const verificarConexao = async () => {
    try {
      setCarregando(true)
      setErro(null)

      // Conexão supabase removida; assumir conectado em modo offline
      setConectado(true)
    } catch (error) {
      console.error("Erro ao verificar conexão:", error)
      setConectado(false)
      setErro("Erro ao verificar conexão com o banco de dados.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    verificarConexao()
  }, [])

  const [dadosDiarios, setDadosDiarios] = useState(DADOS_DIARIOS)
  const [dadosSemanais, setDadosSemanais] = useState(DADOS_SEMANAIS)
  const [distribuicaoStatus, setDistribuicaoStatus] = useState(DISTRIBUICAO_STATUS)
  const [tiposTicket, setTiposTicket] = useState(TIPOS_TICKET)
  const [topUsuarios, setTopUsuarios] = useState(TOP_USUARIOS)
  const [tendenciaMensal, setTendenciaMensal] = useState(TENDENCIA_MENSAL)

  // Calcular totais
  const totalHoje = {
    quantidade: dadosDiarios.reduce((acc, item) => acc + item.quantidade, 0),
    valor: dadosDiarios.reduce((acc, item) => acc + item.valor, 0),
  }

  // Calcular média semanal
  const mediaSemanal = Math.round(dadosSemanais.reduce((acc, item) => acc + item.quantidade, 0) / dadosSemanais.length)

  const formatarValor = (valor: number) => {
    return `R$ ${valor.toFixed(2)}`
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <Loading size="sm" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <Loading size="sm" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Média Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <Loading size="sm" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard de Vendas</h2>
        <Button variant="outline" size="sm" onClick={verificarConexao} className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Verificar Conexão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Banco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carregando ? (
                "Verificando..."
              ) : conectado ? (
                <span className="text-green-600">Conectado</span>
              ) : (
                <span className="text-red-600">Desconectado</span>
              )}
            </div>
            {erro && <div className="mt-2 text-sm text-red-500">{erro}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm font-medium">Total de Vendas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalHoje.quantidade}</div>
            <p className="text-xs text-muted-foreground">Tickets vendidos hoje</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm font-medium">Valor Total Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">R$ {totalHoje.valor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Faturamento do dia</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-sm font-medium">Média Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{mediaSemanal}</div>
            <p className="text-xs text-muted-foreground">Tickets por dia (média)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diario" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="diario">Vendas Diárias</TabsTrigger>
          <TabsTrigger value="semanal">Vendas Semanais</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          <TabsTrigger value="tendencia">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="diario">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Hora - Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosDiarios} margin={chartMargins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "valor") return `R$ ${(value as number).toFixed(2)}`
                          return value
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: 10 }}
                      />
                      <Bar
                        dataKey="subsidiados"
                        name="Subsidiados (R$ 2,00)"
                        fill="#3b82f6"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="naoSubsidiados"
                        name="Não Subsidiados (R$ 13,00)"
                        fill="#8b5cf6"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="valor"
                        name="Valor Total (R$)"
                        fill="#10b981"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semanal">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia - Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosSemanais} margin={chartMargins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "valor") return `R$ ${(value as number).toFixed(2)}`
                          return value
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="subsidiados"
                        name="Subsidiados (R$ 2,00)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Line
                        type="monotone"
                        dataKey="naoSubsidiados"
                        name="Não Subsidiados (R$ 13,00)"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Line
                        type="monotone"
                        dataKey="valor"
                        name="Valor Total (R$)"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribuicao">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
              <CardContent>
                <ChartContainer height={300}>
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={distribuicaoStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="valor"
                        >
                          {distribuicaoStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tickets`, "Quantidade"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Tickets</CardTitle>
                </CardHeader>
              <CardContent>
                <ChartContainer height={300}>
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={tiposTicket}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="valor"
                        >
                          {tiposTicket.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            const entry = props.payload
                            return [`${value} tickets (R$ ${entry.preco.toFixed(2)} cada)`, entry.nome]
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Usuários</CardTitle>
                </CardHeader>
              <CardContent>
                <ChartContainer height={300}>
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topUsuarios}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="nome" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantidade" name="Tickets Comprados" fill="#8884d8">
                          {topUsuarios.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Vendas - Últimos 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tendenciaMensal} margin={chartMargins}>
                      <defs>
                        <linearGradient id="colorSubsidiados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorNaoSubsidiados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "valor") return [`R$ ${(value as number).toFixed(2)}`, "Valor Total"]
                          if (name === "subsidiados") return [value, "Subsidiados (R$ 2,00)"]
                          if (name === "naoSubsidiados") return [value, "Não Subsidiados (R$ 13,00)"]
                          return [value, name]
                        }}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: 10 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="subsidiados"
                        name="Subsidiados (R$ 2,00)"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorSubsidiados)"
                      />
                      <Area
                        type="monotone"
                        dataKey="naoSubsidiados"
                        name="Não Subsidiados (R$ 13,00)"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorNaoSubsidiados)"
                      />
                      <Area
                        type="monotone"
                        dataKey="valor"
                        name="Valor Total (R$)"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorValor)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
  return (
    <div
      className="w-full relative"
      style={{
        height: `${height}px`,
        minHeight: `${height}px`,
      }}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="md" text="Carregando dados..." />
        </div>
      ) : isEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="w-full h-full">{children}</div>
      )}
    </div>
  )
}

