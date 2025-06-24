"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, QrCode, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CheckoutTransparenteProps {
  data: string
  quantidadeSubsidiado?: number
  quantidadeNaoSubsidiado?: number
  campus: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

interface PaymentMethod {
  id: string
  name: string
  payment_type_id: string
  status: string
  secure_thumbnail: string
}

interface IdentificationType {
  id: string
  name: string
  type: string
  min_length: number
  max_length: number
}

export function CheckoutTransparente({
  data,
  quantidadeSubsidiado = 0,
  quantidadeNaoSubsidiado = 0,
  campus,
  onSuccess,
  onError,
  onCancel
}: CheckoutTransparenteProps) {
  const { usuario } = useAuth()
  
  // Estados do componente
  const [step, setStep] = useState<'method' | 'form' | 'processing' | 'result'>('method')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mpInstance, setMpInstance] = useState<any>(null)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    cardholderName: '',
    cardholderEmail: usuario?.email || '',
    identificationType: '',
    identificationNumber: '',
    installments: 1,
    issuerId: ''
  })
  
  // Estados do resultado
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [cardToken, setCardToken] = useState<string | null>(null)

  // Calcular valores
  const PRECO_SUBSIDIADO = 5.00
  const PRECO_NAO_SUBSIDIADO = 15.00
  const valorTotal = (quantidadeSubsidiado * PRECO_SUBSIDIADO) + (quantidadeNaoSubsidiado * PRECO_NAO_SUBSIDIADO)
  const quantidadeTotal = quantidadeSubsidiado + quantidadeNaoSubsidiado

  // Inicializar Mercado Pago SDK
  useEffect(() => {
    const initMercadoPago = async () => {
      try {
        // Carregar script do Mercado Pago
        if (!window.MercadoPago) {
          const script = document.createElement('script')
          script.src = 'https://sdk.mercadopago.com/js/v2'
          script.async = true
          document.head.appendChild(script)
          
          await new Promise((resolve) => {
            script.onload = resolve
          })
        }

        // Obter public key da API
        const keyResponse = await fetch('/api/mercadopago/public-key')
        const keyData = await keyResponse.json()
        
        if (!keyData.success) {
          throw new Error(keyData.error || 'Erro ao obter chave pública')
        }

        // Inicializar com a public key
        const mp = new window.MercadoPago(keyData.publicKey)
        setMpInstance(mp)

        // Carregar métodos de pagamento e tipos de documento
        await Promise.all([
          loadPaymentMethods(),
          loadIdentificationTypes()
        ])

      } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error)
        setError('Erro ao carregar sistema de pagamento')
      }
    }

    initMercadoPago()
  }, [])

  // Carregar métodos de pagamento
  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/checkout/payment-methods')
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(data.payment_methods)
      } else {
        throw new Error(data.erro)
      }
    } catch (error: any) {
      console.error('Erro ao carregar métodos de pagamento:', error)
      setError('Erro ao carregar métodos de pagamento')
    }
  }

  // Carregar tipos de documento
  const loadIdentificationTypes = async () => {
    try {
      const response = await fetch('/api/checkout/identification-types')
      const data = await response.json()
      
      if (data.success) {
        setIdentificationTypes(data.identification_types)
      } else {
        throw new Error(data.erro)
      }
    } catch (error: any) {
      console.error('Erro ao carregar tipos de documento:', error)
      setError('Erro ao carregar tipos de documento')
    }
  }

  // Selecionar método de pagamento
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setError(null)
    
    if (methodId === 'pix') {
      // Para PIX, ir direto para processamento
      setStep('processing')
      processPixPayment()
    } else {
      // Para cartões, ir para formulário
      setStep('form')
    }
  }

  // Processar pagamento PIX
  const processPixPayment = async () => {
    try {
      setLoading(true)
      
      const paymentData = {
        usuario_id: usuario?.id,
        data: data,
        quantidadeSubsidiado,
        quantidadeNaoSubsidiado,
        campus,
        paymentMethod: 'pix',
        payer: {
          email: usuario?.email,
          firstName: usuario?.nome?.split(' ')[0],
          lastName: usuario?.nome?.split(' ').slice(1).join(' '),
          identification: {
            type: 'CPF',
            number: '00000000000' // Placeholder - em produção usar dados reais
          }
        }
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (result.success) {
        setPaymentResult(result)
        setStep('result')
        onSuccess?.(result)
      } else {
        throw new Error(result.erro)
      }

    } catch (error: any) {
      console.error('Erro no pagamento PIX:', error)
      setError(error.message)
      setStep('method')
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Validar dados do formulário
  const validateCardData = () => {
    const errors = []
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Número do cartão inválido')
    }
    
    if (!formData.cardholderName || formData.cardholderName.trim().length < 2) {
      errors.push('Nome do titular é obrigatório')
    }
    
    if (!formData.expirationDate || formData.expirationDate.length < 5 || !formData.expirationDate.includes('/')) {
      errors.push('Data de validade inválida (MM/AA)')
    } else {
      const [month, year] = formData.expirationDate.split('/')
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      
      if (monthNum < 1 || monthNum > 12) {
        errors.push('Mês inválido (01-12)')
      }
      
      if (yearNum < 25 || yearNum > 50) {
        errors.push('Ano inválido (25-50)')
      }
    }
    
    if (!formData.securityCode || formData.securityCode.length < 3) {
      errors.push('CVV inválido')
    }
    
    if (!formData.cardholderEmail || !formData.cardholderEmail.includes('@')) {
      errors.push('Email inválido')
    }
    
    if (!formData.identificationType) {
      errors.push('Tipo de documento é obrigatório')
    }
    
    if (!formData.identificationNumber || formData.identificationNumber.replace(/\D/g, '').length < 8) {
      errors.push('Número do documento inválido')
    }
    
    return errors
  }

  // Criar token do cartão
  const createCardToken = async () => {
    if (!mpInstance) {
      throw new Error('Mercado Pago não inicializado')
    }

    // Validar dados primeiro
    console.log('Dados do formulário para validação:', {
      cardNumber: formData.cardNumber,
      cardholderName: formData.cardholderName,
      expirationDate: formData.expirationDate,
      securityCode: formData.securityCode,
      cardholderEmail: formData.cardholderEmail,
      identificationType: formData.identificationType,
      identificationNumber: formData.identificationNumber
    })
    
    const validationErrors = validateCardData()
    if (validationErrors.length > 0) {
      console.error('Erros de validação:', validationErrors)
      throw new Error(`Dados inválidos: ${validationErrors.join(', ')}`)
    }

    try {
      // Preparar dados para o token
      const expirationParts = formData.expirationDate.split('/')
      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName.trim(),
        cardExpirationMonth: expirationParts[0],
        cardExpirationYear: '20' + expirationParts[1],
        securityCode: formData.securityCode,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber.replace(/\D/g, '')
      }

      console.log('Criando token com dados:', { 
        ...cardData, 
        cardNumber: cardData.cardNumber.replace(/\d(?=\d{4})/g, '*'),
        securityCode: '***'
      })

      const token = await mpInstance.createCardToken(cardData)
      
      if (!token || !token.id) {
        throw new Error('Token não foi criado corretamente')
      }

      console.log('Token criado com sucesso:', token.id)
      return token.id
    } catch (error: any) {
      console.error('Erro detalhado ao criar token:', error)
      
      // Verificar se é erro específico do Mercado Pago
      if (error.cause && error.cause.length > 0) {
        const mpError = error.cause[0]
        console.error('Erro específico do MP:', mpError)
        throw new Error(`Erro no cartão: ${mpError.description || mpError.message || 'Dados inválidos'}`)
      }
      
      throw new Error(`Erro ao processar cartão: ${error.message || 'Verifique os dados informados'}`)
    }
  }

  // Detectar bandeira do cartão
  const detectCardBrand = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    
    // American Express: 34, 37, 375365 (específico para o teste)
    if (/^3[47]/.test(cleanNumber) || cleanNumber.startsWith('375365')) {
      return 'amex'
    }
    
    // Visa: 4, 4235 (específico para o teste)
    if (cleanNumber.startsWith('4')) {
      return selectedMethod === 'debit_card' ? 'debvisa' : 'visa'
    }
    
    // Mastercard: 51-55, 2221-2720, 5031 (específico para o teste)
    if (/^5[1-5]/.test(cleanNumber) || /^222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720/.test(cleanNumber)) {
      return selectedMethod === 'debit_card' ? 'debmaster' : 'master'
    }
    
    // Elo: 636368, 438935, 504175, 451416, 636297, 5067, 4576, 4011, 506699
    if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(cleanNumber)) {
      return selectedMethod === 'debit_card' ? 'debelo' : 'elo'
    }
    
    // Hipercard: 606282, 3841, 6062
    if (/^(606282|3841|6062)/.test(cleanNumber)) {
      return 'hipercard'
    }
    
    // Fallback baseado no tipo selecionado
    return selectedMethod === 'debit_card' ? 'debvisa' : 'visa'
  }

  // Obter informações do cartão (versão simplificada)
  const getCardInfo = async (cardNumber: string) => {
        // Para cartões de teste, usar informações fixas (dados oficiais do MP)
    const testCards: { [key: string]: any } = {
      '4235647728025682': { // Visa teste oficial
        payment_method_id: 'visa',
        issuer: { id: '25' },
        processing_mode: 'aggregator'
      },
      '5031433215406351': { // Mastercard teste oficial
        payment_method_id: 'master',
        issuer: { id: '25' },
        processing_mode: 'aggregator'
      },
      '375365153556885': { // American Express teste oficial (15 dígitos)
        payment_method_id: 'amex',
        issuer: { id: '25' },
        processing_mode: 'aggregator'
      },
      '50677678388311': { // Elo Débito teste oficial (14 dígitos)
        payment_method_id: 'debelo',
        issuer: { id: '25' },
        processing_mode: 'aggregator'
      }
    }
    
    const cleanNumber = cardNumber.replace(/\s/g, '')
    
    // Verificar se é um cartão de teste conhecido
    if (testCards[cleanNumber]) {
      return testCards[cleanNumber]
    }
    
    // Para outros cartões, tentar obter informações via SDK
    if (!mpInstance) return null
    
    try {
      const bin = cleanNumber.substring(0, 6)
      const cardInfo = await mpInstance.getPaymentMethod({
        bin: bin
      })
      return cardInfo
    } catch (error) {
      console.warn('Não foi possível obter informações do cartão:', error)
      // Retornar informações padrão baseadas na bandeira detectada
      const brand = detectCardBrand(cardNumber)
      return {
        payment_method_id: brand,
        issuer: { id: '25' }, // ID genérico que funciona para testes
        processing_mode: 'aggregator'
      }
    }
  }

  // Processar pagamento com cartão
  const processCardPayment = async () => {
    try {
      setLoading(true)
      setStep('processing')

      // Detectar bandeira do cartão
      const detectedBrand = detectCardBrand(formData.cardNumber)
      console.log('Bandeira detectada:', detectedBrand)

      // Obter informações do cartão
      const cardInfo = await getCardInfo(formData.cardNumber)
      console.log('Informações do cartão:', cardInfo)

      // Criar token do cartão
      const token = await createCardToken()

      // Usar a bandeira das informações do cartão se disponível, senão usar a detectada
      const finalPaymentMethod = cardInfo?.payment_method_id || detectedBrand
      console.log('Método final de pagamento:', finalPaymentMethod)

      const paymentData = {
        usuario_id: usuario?.id,
        data: data,
        quantidadeSubsidiado,
        quantidadeNaoSubsidiado,
        campus,
        paymentMethod: finalPaymentMethod,
        token: token,
        installments: formData.installments,
        issuerId: cardInfo?.issuer?.id || '25', // Usar ID padrão se não encontrar
        payer: {
          email: formData.cardholderEmail,
          firstName: formData.cardholderName.split(' ')[0],
          lastName: formData.cardholderName.split(' ').slice(1).join(' '),
          identification: {
            type: formData.identificationType,
            number: formData.identificationNumber.replace(/\D/g, '')
          }
        }
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (result.success) {
        setPaymentResult(result)
        setStep('result')
        onSuccess?.(result)
      } else {
        throw new Error(result.erro)
      }

    } catch (error: any) {
      console.error('Erro no pagamento:', error)
      setError(error.message)
      setStep('form')
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Renderizar seleção de método
  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Escolha a forma de pagamento</h3>
        <p className="text-sm text-muted-foreground">
          {quantidadeTotal} ticket{quantidadeTotal > 1 ? 's' : ''} - R$ {valorTotal.toFixed(2)}
        </p>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
        {/* PIX */}
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="pix" id="pix" />
          <Label htmlFor="pix" className="flex items-center space-x-3 cursor-pointer flex-1">
            <QrCode className="h-6 w-6 text-green-600" />
            <div>
              <div className="font-medium">PIX</div>
              <div className="text-sm text-muted-foreground">Pagamento instantâneo</div>
            </div>
            <Badge variant="secondary">Recomendado</Badge>
          </Label>
        </div>

        {/* Cartão de Crédito */}
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="credit_card" id="credit_card" />
          <Label htmlFor="credit_card" className="flex items-center space-x-3 cursor-pointer flex-1">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-medium">Cartão de Crédito</div>
              <div className="text-sm text-muted-foreground">Parcelamento disponível</div>
            </div>
          </Label>
        </div>

        {/* Cartão de Débito */}
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="debit_card" id="debit_card" />
          <Label htmlFor="debit_card" className="flex items-center space-x-3 cursor-pointer flex-1">
            <CreditCard className="h-6 w-6 text-purple-600" />
            <div>
              <div className="font-medium">Cartão de Débito</div>
              <div className="text-sm text-muted-foreground">Débito em conta</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )

  // Renderizar formulário de cartão
  const renderCardForm = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Dados do Cartão</h3>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do seu cartão de {selectedMethod === 'credit_card' ? 'crédito' : 'débito'}
        </p>
        
        {/* Botão para preencher dados de teste */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                cardNumber: '4235 6477 2802 5682',
                cardholderName: 'APRO',
                expirationDate: '11/30',
                securityCode: '123',
                cardholderEmail: 'test@example.com',
                identificationType: 'CPF',
                identificationNumber: '12345678909',
                installments: 1,
                issuerId: ''
              })
            }}
          >
            Visa Teste
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                cardNumber: '5031 4332 1540 6351',
                cardholderName: 'APRO',
                expirationDate: '11/30',
                securityCode: '123',
                cardholderEmail: 'test@example.com',
                identificationType: 'CPF',
                identificationNumber: '12345678909',
                installments: 1,
                issuerId: ''
              })
            }}
          >
            Master Teste
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                cardNumber: '3753 651535 56885',
                cardholderName: 'APRO',
                expirationDate: '11/30',
                securityCode: '1234',
                cardholderEmail: 'test@example.com',
                identificationType: 'CPF',
                identificationNumber: '12345678909',
                installments: 1,
                issuerId: ''
              })
            }}
          >
            Amex Teste
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                cardNumber: '5067 7678 3883 11',
                cardholderName: 'APRO',
                expirationDate: '11/30',
                securityCode: '123',
                cardholderEmail: 'test@example.com',
                identificationType: 'CPF',
                identificationNumber: '12345678909',
                installments: 1,
                issuerId: ''
              })
            }}
          >
            Elo Débito
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Número do cartão */}
        <div>
          <Label htmlFor="cardNumber">Número do cartão</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                setFormData(prev => ({ ...prev, cardNumber: value }))
              }}
              maxLength={19}
            />
            {formData.cardNumber.length >= 6 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {detectCardBrand(formData.cardNumber).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expirationDate">Validade</Label>
            <Input
              id="expirationDate"
              placeholder="MM/AA"
              value={formData.expirationDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '')
                
                // Formatar como MM/AA
                if (value.length >= 2) {
                  value = value.substring(0, 2) + '/' + value.substring(2, 4)
                }
                
                setFormData(prev => ({ ...prev, expirationDate: value }))
              }}
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="securityCode">CVV</Label>
            <Input
              id="securityCode"
              placeholder="123"
              value={formData.securityCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData(prev => ({ ...prev, securityCode: value }))
              }}
              maxLength={4}
            />
          </div>
        </div>

        {/* Nome do titular */}
        <div>
          <Label htmlFor="cardholderName">Nome do titular</Label>
          <Input
            id="cardholderName"
            placeholder="Nome como aparece no cartão"
            value={formData.cardholderName}
            onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="cardholderEmail">Email</Label>
          <Input
            id="cardholderEmail"
            type="email"
            placeholder="seu@email.com"
            value={formData.cardholderEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, cardholderEmail: e.target.value }))}
          />
        </div>

        {/* Tipo de documento */}
        <div>
          <Label htmlFor="identificationType">Tipo de documento</Label>
          <Select
            value={formData.identificationType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, identificationType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {identificationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Número do documento */}
        <div>
          <Label htmlFor="identificationNumber">Número do documento</Label>
          <Input
            id="identificationNumber"
            placeholder="000.000.000-00"
            value={formData.identificationNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '')
              
              // Formatar CPF: 000.000.000-00
              if (formData.identificationType === 'CPF' && value.length > 0) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
                value = value.replace(/(\d{3})(\d{3})(\d{2})/, '$1.$2.$3')
                value = value.replace(/(\d{3})(\d{2})/, '$1.$2')
              }
              
              setFormData(prev => ({ ...prev, identificationNumber: value }))
            }}
            maxLength={14}
          />
        </div>

        {/* Parcelas (apenas para crédito) */}
        {selectedMethod === 'credit_card' && (
          <div>
            <Label htmlFor="installments">Parcelas</Label>
            <Select
              value={formData.installments.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, installments: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 6, 12].map((installment) => (
                  <SelectItem key={installment} value={installment.toString()}>
                    {installment}x de R$ {(valorTotal / installment).toFixed(2)}
                    {installment === 1 ? ' (à vista)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
          Voltar
        </Button>
        <Button onClick={processCardPayment} disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pagar R$ {valorTotal.toFixed(2)}
        </Button>
      </div>
    </div>
  )

  // Renderizar processamento
  const renderProcessing = () => (
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
      <h3 className="text-lg font-semibold">Processando pagamento...</h3>
      <p className="text-sm text-muted-foreground">
        Aguarde enquanto processamos seu pagamento
      </p>
    </div>
  )

  // Renderizar resultado
  const renderResult = () => {
    if (!paymentResult) return null

    const isSuccess = paymentResult.status === 'approved'
    const isPending = paymentResult.status === 'pending'

    return (
      <div className="text-center space-y-4">
        {isSuccess && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
            <h3 className="text-lg font-semibold text-green-600">Pagamento Aprovado!</h3>
            <p className="text-sm text-muted-foreground">
              Seu pagamento foi processado com sucesso
            </p>
          </>
        )}

        {isPending && selectedMethod === 'pix' && (
          <>
            <QrCode className="h-12 w-12 mx-auto text-blue-600" />
            <h3 className="text-lg font-semibold">PIX Gerado!</h3>
            <p className="text-sm text-muted-foreground">
              Use o QR Code ou código PIX para finalizar o pagamento
            </p>
            
            {paymentResult.qr_code_base64 && (
              <div className="space-y-3">
                <img 
                  src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="mx-auto max-w-[200px]"
                />
                
                {paymentResult.qr_code && (
                  <div>
                    <Label>PIX Copia e Cola:</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={paymentResult.qr_code}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(paymentResult.qr_code)}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <div className="text-sm">
            <strong>Valor:</strong> R$ {paymentResult.valor_total?.toFixed(2)}
          </div>
          <div className="text-sm">
            <strong>Data:</strong> {format(new Date(data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
          <div className="text-sm">
            <strong>Campus:</strong> {campus}
          </div>
        </div>

        <Button onClick={onCancel} className="w-full">
          Finalizar
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Checkout Transparente</span>
        </CardTitle>
        <CardDescription>
          Pagamento seguro processado pelo Mercado Pago
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'method' && renderMethodSelection()}
        {step === 'form' && renderCardForm()}
        {step === 'processing' && renderProcessing()}
        {step === 'result' && renderResult()}
      </CardContent>
    </Card>
  )
} 