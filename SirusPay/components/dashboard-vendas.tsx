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
  ScatterChart,
  Scatter,
} from "recharts"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loading } from "@/components/ui/loading"
import { StatusAlert } from "@/components/status-alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGerarRelatorioPDF } from "@/hooks/use-gerar-relatorio-pdf"
import { FileText, Download } from "lucide-react"

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
  dadosPorCampus: Array<{
    campus: string
    local: string
    tickets: number
    valor: number
    subsidiados: number
    naoSubsidiados: number
  }>
  tickets: any[]
}

export function DashboardVendas() {
  const [carregando, setCarregando] = useState(true)
  const [conectado, setConectado] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState("mes")
  const [tipoFiltro, setTipoFiltro] = useState('periodo') // 'periodo' ou 'data'
  const [dataEspecifica, setDataEspecifica] = useState('')
  const [dados, setDados] = useState<EstatisticasData | null>(null)
  const [gerandoPDF, setGerandoPDF] = useState(false)
  
  // Estados para tipos de gráfico
  const [tipoGraficoVendas, setTipoGraficoVendas] = useState('bar') // 'bar', 'line', 'area', 'scatter'
  const [tipoGraficoStatus, setTipoGraficoStatus] = useState('pie') // 'pie', 'bar', 'line'
  const [tipoGraficoTipos, setTipoGraficoTipos] = useState('pie') // 'pie', 'bar', 'line'
  const [tipoGraficoUsuarios, setTipoGraficoUsuarios] = useState('bar') // 'bar', 'line', 'scatter'
  const [tipoGraficoCampus, setTipoGraficoCampus] = useState('bar') // 'bar', 'pie', 'line'
  
  const { gerarPDF } = useGerarRelatorioPDF()

  const carregarEstatisticas = async (periodoSelecionado: string = periodo, dataEsp: string = dataEspecifica) => {
    try {
      setCarregando(true)
      setErro(null)

      let url = `/api/admin/estatisticas?periodo=${periodoSelecionado}`
      
      // Se for filtro por data específica, adicionar parâmetro
      if (tipoFiltro === 'data' && dataEsp) {
        url += `&data=${dataEsp}`
      }

      const response = await fetch(url)
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
    if (tipoFiltro === 'periodo') {
      carregarEstatisticas(novoPeriodo)
    }
  }

  const handleTipoFiltroChange = (novoTipo: string) => {
    setTipoFiltro(novoTipo)
    if (novoTipo === 'periodo') {
      carregarEstatisticas(periodo)
    }
  }

  const handleDataChange = (novaData: string) => {
    setDataEspecifica(novaData)
    if (tipoFiltro === 'data' && novaData) {
      carregarEstatisticas('dia', novaData)
    }
  }

  const formatarValor = (valor: number) => {
    return `R$ ${valor.toFixed(2)}`
  }

  // Função para renderizar gráfico de vendas
  const renderGraficoVendas = () => {
    const data = periodo === "hoje" ? dados?.dadosPorHora : dados?.dadosPorDia
    const dataKey = periodo === "hoje" ? "hora" : "dia"
    
    if (!data) return null

    switch (tipoGraficoVendas) {
      case 'line':
        return (
          <LineChart data={data} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [
              name === "valor" ? formatarValor(Number(value)) : value,
              name === "quantidade" ? "Quantidade" : name === "valor" ? "Valor" : name
            ]} />
            <Legend />
            <Line type="monotone" dataKey="quantidade" stroke="#8884d8" name="Quantidade" strokeWidth={2} />
            <Line type="monotone" dataKey="subsidiados" stroke="#82ca9d" name="Subsidiados" strokeWidth={2} />
            <Line type="monotone" dataKey="naoSubsidiados" stroke="#ffc658" name="Não Subsidiados" strokeWidth={2} />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={data} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [
              name === "valor" ? formatarValor(Number(value)) : value,
              name === "quantidade" ? "Quantidade" : name === "valor" ? "Valor" : name
            ]} />
            <Legend />
            <Area type="monotone" dataKey="quantidade" stackId="1" stroke="#8884d8" fill="#8884d8" name="Quantidade" />
            <Area type="monotone" dataKey="subsidiados" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Subsidiados" />
            <Area type="monotone" dataKey="naoSubsidiados" stackId="1" stroke="#ffc658" fill="#ffc658" name="Não Subsidiados" />
          </AreaChart>
        )
      case 'scatter':
        return (
          <ScatterChart data={data} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [
              name === "valor" ? formatarValor(Number(value)) : value,
              name === "quantidade" ? "Quantidade" : name === "valor" ? "Valor" : name
            ]} />
            <Legend />
            <Scatter dataKey="quantidade" fill="#8884d8" name="Quantidade" />
          </ScatterChart>
        )
      default: // 'bar'
        return (
          <BarChart data={data} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [
              name === "valor" ? formatarValor(Number(value)) : value,
              name === "quantidade" ? "Quantidade" : name === "valor" ? "Valor" : name
            ]} />
            <Legend />
            <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
            <Bar dataKey="subsidiados" fill="#82ca9d" name="Subsidiados" />
            <Bar dataKey="naoSubsidiados" fill="#ffc658" name="Não Subsidiados" />
          </BarChart>
        )
    }
  }

  // Função para renderizar gráfico de status
  const renderGraficoStatus = () => {
    if (!dados) return null

    switch (tipoGraficoStatus) {
      case 'bar':
        return (
          <BarChart data={distribuicaoStatus} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="valor" fill="#8884d8" name="Quantidade" />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={distribuicaoStatus} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={2} name="Quantidade" />
          </LineChart>
        )
      default: // 'pie'
        return (
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
        )
    }
  }

  // Função para renderizar gráfico de tipos
  const renderGraficoTipos = () => {
    if (!dados) return null

    switch (tipoGraficoTipos) {
      case 'bar':
        return (
          <BarChart data={tiposTicket} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="valor" fill="#8884d8" name="Quantidade" />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={tiposTicket} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={2} name="Quantidade" />
          </LineChart>
        )
      default: // 'pie'
        return (
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
        )
    }
  }

  // Função para renderizar gráfico de usuários
  const renderGraficoUsuarios = () => {
    if (!dados?.topUsuarios.length) return null

    switch (tipoGraficoUsuarios) {
      case 'line':
        return (
          <LineChart data={dados.topUsuarios} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="quantidade" stroke="#8884d8" strokeWidth={2} name="Quantidade de Tickets" />
          </LineChart>
        )
      case 'scatter':
        return (
          <ScatterChart data={dados.topUsuarios.map((user, index) => ({...user, index}))} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name, props) => [value, `${props.payload.nome}: Quantidade`]} />
            <Scatter dataKey="quantidade" fill="#8884d8" name="Quantidade de Tickets" />
          </ScatterChart>
        )
      default: // 'bar'
        return (
          <BarChart data={dados.topUsuarios} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade de Tickets" />
          </BarChart>
        )
    }
  }

  // Função para renderizar gráfico por campus
  const renderGraficoCampus = () => {
    if (!dados?.dadosPorCampus) return null

    const campusColors = {
      "Campus 1": "#3b82f6", // azul
      "Campus 2": "#10b981", // verde
      "Campus 3": "#8b5cf6", // roxo
    }

    switch (tipoGraficoCampus) {
      case 'pie':
        return (
          <PieChart margin={chartMargins}>
            <Pie
              data={dados.dadosPorCampus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ campus, tickets }) => `${campus}: ${tickets}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="tickets"
            >
              {dados.dadosPorCampus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={campusColors[entry.campus as keyof typeof campusColors] || CORES[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, "Tickets"]} />
            <Legend />
          </PieChart>
        )
      case 'line':
        return (
          <LineChart data={dados.dadosPorCampus} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="campus" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [
              name === "valor" ? formatarValor(Number(value)) : value,
              name === "tickets" ? "Total de Tickets" : 
              name === "subsidiados" ? "Subsidiados" : 
              name === "naoSubsidiados" ? "Não Subsidiados" : name
            ]} />
            <Legend />
            <Line type="monotone" dataKey="tickets" stroke="#3b82f6" name="Total de Tickets" strokeWidth={3} />
            <Line type="monotone" dataKey="subsidiados" stroke="#10b981" name="Subsidiados" strokeWidth={2} />
            <Line type="monotone" dataKey="naoSubsidiados" stroke="#f59e0b" name="Não Subsidiados" strokeWidth={2} />
          </LineChart>
        )
      default: // bar
        return (
          <BarChart data={dados.dadosPorCampus} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="campus" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value, name) => [
              name === "valor" ? formatarValor(Number(value)) : value,
              name === "tickets" ? "Total de Tickets" : 
              name === "subsidiados" ? "Subsidiados" : 
              name === "naoSubsidiados" ? "Não Subsidiados" : name
            ]} />
            <Legend />
            <Bar dataKey="tickets" fill="#3b82f6" name="Total de Tickets" />
            <Bar dataKey="subsidiados" fill="#10b981" name="Subsidiados" />
            <Bar dataKey="naoSubsidiados" fill="#f59e0b" name="Não Subsidiados" />
          </BarChart>
        )
    }
  }

  const handleGerarPDF = async () => {
    if (!dados) return
    
    setGerandoPDF(true)
    try {
      const sucesso = await gerarPDF(dados)
      if (sucesso) {
        // Feedback de sucesso pode ser adicionado aqui
        console.log('PDF gerado com sucesso!')
      } else {
        console.error('Erro ao gerar PDF')
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setGerandoPDF(false)
    }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Seletor de tipo de filtro */}
          <div className="flex items-center gap-2">
            <Label htmlFor="tipo-filtro" className="text-sm font-medium">Filtrar por:</Label>
            <Select value={tipoFiltro} onValueChange={handleTipoFiltroChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="periodo">Período</SelectItem>
                <SelectItem value="data">Data Específica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros condicionais */}
          {tipoFiltro === 'periodo' ? (
            <div className="flex items-center gap-2">
              <Label htmlFor="periodo" className="text-sm font-medium">Período:</Label>
              <Select value={periodo} onValueChange={handlePeriodoChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mês</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="ano">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Label htmlFor="data-especifica" className="text-sm font-medium">Data:</Label>
              <Input
                id="data-especifica"
                type="date"
                value={dataEspecifica}
                onChange={(e) => handleDataChange(e.target.value)}
                className="w-40"
              />
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => carregarEstatisticas()} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGerarPDF} 
              disabled={gerandoPDF || !dados}
              className="flex items-center gap-1"
            >
              {gerandoPDF ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              {gerandoPDF ? 'Gerando...' : 'Gerar PDF'}
            </Button>
          </div>
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="vendas" className="text-sm font-medium">📊 Vendas</TabsTrigger>
            <TabsTrigger value="campus" className="text-sm font-medium">🏫 Campus</TabsTrigger>
            <TabsTrigger value="status" className="text-sm font-medium">📈 Status</TabsTrigger>
            <TabsTrigger value="tipos" className="text-sm font-medium">🎯 Tipos</TabsTrigger>
            <TabsTrigger value="usuarios" className="text-sm font-medium">👥 Top Usuários</TabsTrigger>
          </TabsList>

        <TabsContent value="vendas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>
                {periodo === "hoje" ? "Vendas por Hora" : "Vendas por Dia"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select 
                  value={tipoGraficoVendas} 
                  onChange={(e) => setTipoGraficoVendas(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-white"
                >
                  <option value="bar">📊 Barras</option>
                  <option value="line">📈 Linhas</option>
                  <option value="area">📊 Área</option>
                  <option value="scatter">⚪ Dispersão</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderGraficoVendas()}
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campus">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Vendas por Campus</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select 
                  value={tipoGraficoCampus} 
                  onChange={(e) => setTipoGraficoCampus(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-white"
                >
                  <option value="bar">📊 Barras</option>
                  <option value="pie">🥧 Pizza</option>
                  <option value="line">📈 Linhas</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {dados?.dadosPorCampus && dados.dadosPorCampus.some(campus => campus.tickets > 0) ? (
                <ChartContainer height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderGraficoCampus()}
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma venda por campus ainda 🏫</p>
                </div>
              )}
              
              {/* Informações detalhadas por campus */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {dados?.dadosPorCampus?.map((campus, index) => (
                  <div key={campus.campus} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ 
                          backgroundColor: index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#8b5cf6" 
                        }}
                      />
                      <h4 className="font-semibold">{campus.campus}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{campus.local}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total de tickets:</span>
                        <span className="font-medium">{campus.tickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor total:</span>
                        <span className="font-medium">{formatarValor(campus.valor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subsidiados:</span>
                        <span className="font-medium text-green-600">{campus.subsidiados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Não subsidiados:</span>
                        <span className="font-medium text-orange-600">{campus.naoSubsidiados}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Distribuição por Status</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select 
                  value={tipoGraficoStatus} 
                  onChange={(e) => setTipoGraficoStatus(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-white"
                >
                  <option value="pie">🥧 Pizza</option>
                  <option value="bar">📊 Barras</option>
                  <option value="line">📈 Linhas</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderGraficoStatus()}
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Distribuição por Tipo de Ticket</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select 
                  value={tipoGraficoTipos} 
                  onChange={(e) => setTipoGraficoTipos(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-white"
                >
                  <option value="pie">🥧 Pizza</option>
                  <option value="bar">📊 Barras</option>
                  <option value="line">📈 Linhas</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderGraficoTipos()}
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Top 5 Usuários</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tipo:</label>
                <select 
                  value={tipoGraficoUsuarios} 
                  onChange={(e) => setTipoGraficoUsuarios(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-white"
                >
                  <option value="bar">📊 Barras</option>
                  <option value="line">📈 Linhas</option>
                  <option value="scatter">⚪ Dispersão</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {dados.topUsuarios.length > 0 ? (
                <ChartContainer height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderGraficoUsuarios()}
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

