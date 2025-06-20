"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, CreditCard, Smartphone, QrCode, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentInfo {
  id: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'cancelled'
}

export default function PagamentoMockPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.paymentId as string
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [processando, setProcessando] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao' | null>(null)

  useEffect(() => {
    // Simular busca das informações do pagamento
    const fetchPaymentInfo = async () => {
      try {
        const response = await fetch(`/api/mock-abacatepay/payments/${paymentId}`)
        const data = await response.json()
        
        setPaymentInfo({
          id: data.id,
          amount: data.amount || 15.0, // valor padrão se não vier
          description: data.description || 'Ticket de Almoço - Sistema Restaurante Universitário',
          status: data.status || 'pending'
        })
      } catch (error) {
        console.error('Erro ao buscar informações do pagamento:', error)
        setPaymentInfo({
          id: paymentId,
          amount: 15.0,
          description: 'Ticket de Almoço - Sistema Restaurante Universitário',
          status: 'pending'
        })
      }
    }

    if (paymentId) {
      fetchPaymentInfo()
    }
  }, [paymentId])

  const handlePagamento = async (metodo: 'pix' | 'cartao') => {
    setProcessando(true)
    setMetodoPagamento(metodo)

    // Simular processamento do pagamento
    await new Promise(resolve => setTimeout(resolve, 3000))

    try {
      // Simular webhook para marcar pagamento como pago
      const webhookPayload = {
        id: `evt_mock_${Date.now()}`,
        created_at: new Date().toISOString(),
        type: 'payment.status_changed',
        data: {
          id: paymentId,
          status: 'paid',
          amount: paymentInfo?.amount || 15.0,
          description: paymentInfo?.description || 'Pagamento Mock',
          previous_status: 'pending',
          paid_at: new Date().toISOString()
        }
      }

      // Chamar webhook local para atualizar o status
      await fetch('/api/abacatepay/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      })

      // Atualizar status local
      setPaymentInfo(prev => prev ? { ...prev, status: 'paid' } : null)
      
      // Redirecionar para a página do usuário após pagamento
      setTimeout(() => {
        router.push('/usuario?pagamento=sucesso')
      }, 2000)

    } catch (error) {
      console.error('Erro ao processar pagamento mock:', error)
    }

    setProcessando(false)
  }

  const handleCancelar = () => {
    router.push('/usuario?pagamento=cancelado')
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Carregando informações do pagamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentInfo.status === 'paid') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Pagamento Aprovado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Valor pago</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {paymentInfo.amount.toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Seu ticket foi confirmado! Você será redirecionado automaticamente.
            </p>
            <Button onClick={() => router.push('/usuario')} className="w-full">
              Voltar para Meus Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancelar}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Pagamento Seguro</h1>
          <Badge variant="outline" className="ml-auto">DEMO</Badge>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Ticket de Almoço</p>
                <p className="text-sm text-gray-600">{paymentInfo.description}</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary">R$ {paymentInfo.amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Escolha a forma de pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processando && metodoPagamento === 'pix' ? (
              <div className="border-2 border-primary bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  <div>
                    <p className="font-medium">Processando PIX...</p>
                    <p className="text-sm text-gray-600">Aguarde a confirmação</p>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className={cn(
                  "w-full h-16 flex items-center gap-4 text-left",
                  !processando && "hover:border-primary hover:bg-primary/5"
                )}
                onClick={() => handlePagamento('pix')}
                disabled={processando}
              >
                <QrCode className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-gray-600">Aprovação instantânea</p>
                </div>
              </Button>
            )}

            {processando && metodoPagamento === 'cartao' ? (
              <div className="border-2 border-primary bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  <div>
                    <p className="font-medium">Processando Cartão...</p>
                    <p className="text-sm text-gray-600">Aguarde a aprovação</p>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className={cn(
                  "w-full h-16 flex items-center gap-4 text-left",
                  !processando && "hover:border-primary hover:bg-primary/5"
                )}
                onClick={() => handlePagamento('cartao')}
                disabled={processando}
              >
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-gray-600">Parcelamento disponível</p>
                </div>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">🔒 Ambiente de Demonstração</p>
                <p>Este é um pagamento simulado para fins de teste. Nenhum valor real será cobrado.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={handleCancelar} disabled={processando}>
            Cancelar Pagamento
          </Button>
        </div>
      </div>
    </div>
  )
} 