"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProtecaoRota } from "@/components/protecao-rota"
import { Database, Loader2, CheckCircle, AlertCircle, Users, TicketIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function DatabaseAdmin() {
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)

  const executarSeed = async () => {
    try {
      setCarregando(true)
      setErro(null)
      setResultado(null)

      const response = await fetch('/api/seed-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.ok) {
        setResultado(result)
      } else {
        setErro(result.error || 'Erro desconhecido')
      }
    } catch (error: any) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <ProtecaoRota>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Gerenciamento do Banco de Dados
          </h1>
          <p className="text-muted-foreground mt-1">
            Ferramentas para gerenciar e popular o banco de dados
          </p>
        </div>

        <div className="grid gap-6">
          {/* Card de Seed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Popular Banco com Dados de Teste
              </CardTitle>
              <CardDescription>
                Cria usuários e tickets de teste para demonstrar o sistema. 
                Inclui dados dos últimos 30 dias com distribuição realística.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={executarSeed} 
                  disabled={carregando}
                  className="flex items-center gap-2"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Executar Seed
                    </>
                  )}
                </Button>
              </div>

              {/* Resultado do Seed */}
              {resultado && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-green-800">{resultado.message}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            <Badge variant="secondary">{resultado.usuarios}</Badge> usuários criados
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TicketIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            <Badge variant="secondary">{resultado.tickets}</Badge> tickets criados
                          </span>
                        </div>
                      </div>

                      {resultado.details && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <h4 className="font-medium text-sm mb-2">Detalhes dos dados criados:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-medium">Por tipo:</p>
                              <p>Subsidiados: {resultado.details.ticketsPorTipo.subsidiados}</p>
                              <p>Não subsidiados: {resultado.details.ticketsPorTipo.naoSubsidiados}</p>
                            </div>
                            <div>
                              <p className="font-medium">Por status:</p>
                              <p>Pagos: {resultado.details.ticketsPorStatus.pagos}</p>
                              <p>Pendentes: {resultado.details.ticketsPorStatus.pendentes}</p>
                              <p>Cancelados: {resultado.details.ticketsPorStatus.cancelados}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                        <p><strong>Login Admin:</strong> admin@unifesspa.edu.br</p>
                        <p><strong>Senha:</strong> admin123</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Erro */}
              {erro && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro ao executar seed:</strong> {erro}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• O seed criará 10 usuários (1 admin + 9 usuários normais)</p>
                <p>• Gerará tickets para os últimos 30 dias com distribuição realística</p>
                <p>• 70% dos tickets serão subsidiados (R$ 2,00)</p>
                <p>• 30% dos tickets serão não subsidiados (R$ 13,00)</p>
                <p>• 90% dos tickets estarão pagos, 8% pendentes, 2% cancelados</p>
                <p>• Mais tickets durante dias úteis, menos nos finais de semana</p>
                <p>• Horários concentrados entre 11h e 14h (horário de almoço)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtecaoRota>
  )
}

