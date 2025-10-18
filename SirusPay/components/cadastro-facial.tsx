"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, CameraOff, UserPlus, CheckCircle2, AlertCircle, Scan } from "lucide-react"
import { faceRecognitionService } from "@/services/face-recognition-service"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface CadastroFacialProps {
  onSuccess: () => void
  onError: (message: string) => void
}

export function CadastroFacial({ onSuccess, onError }: CadastroFacialProps) {
  const { usuario } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'capturing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [captureCount, setCaptureCount] = useState(0)
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([])
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Executando cleanup do cadastro facial...')
    
    // Parar intervalos
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Parar câmera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log(`🔴 Parando track: ${track.kind}`)
        track.stop()
      })
      streamRef.current = null
    }
    
    // Limpar vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.pause()
    }
    
    setCameraActive(false)
    setIsCapturing(false)
  }, [])

  useEffect(() => {
    loadModels()
    
    // Cleanup quando componente desmonta
    return cleanup
  }, [cleanup])

  // Verificar compatibilidade do navegador
  const checkBrowserCompatibility = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Seu navegador não suporta acesso à câmera')
    }
    
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      throw new Error('Acesso à câmera requer HTTPS')
    }
  }

  const loadModels = async () => {
    setStatus('loading')
    setMessage('Carregando modelos de IA...')
    setLoadingProgress(0)

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      console.log('🤖 Iniciando carregamento dos modelos para cadastro...')
      const success = await faceRecognitionService.initialize()
      clearInterval(progressInterval)
      
      if (success) {
        setLoadingProgress(100)
        setModelsLoaded(true)
        setStatus('idle')
        setMessage('Modelos carregados com sucesso!')
        console.log('✅ Modelos carregados com sucesso')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setStatus('error')
        setMessage('Erro ao carregar modelos de IA')
        console.error('❌ Falha no carregamento dos modelos')
      }
    } catch (error) {
      clearInterval(progressInterval)
      setStatus('error')
      setMessage('Erro ao inicializar reconhecimento facial')
      console.error('❌ Erro ao carregar modelos:', error)
    }
  }

  const startCamera = async () => {
    try {
      console.log('📹 Iniciando câmera para cadastro...')
      
      // Verificar compatibilidade
      checkBrowserCompatibility()
      
      setIsLoading(true)
      setCameraError(null)
      
      // Parar câmera anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      }
      
      console.log('🎥 Solicitando acesso à câmera com constraints:', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('✅ Stream da câmera obtido:', {
        tracks: stream.getTracks().length,
        video: stream.getVideoTracks().length,
        active: stream.active
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Aguardar o vídeo carregar
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Elemento de vídeo não encontrado'))
            return
          }
          
          const video = videoRef.current
          
          const onLoadedMetadata = () => {
            console.log('📺 Metadados do vídeo carregados:', {
              width: video.videoWidth,
              height: video.videoHeight,
              duration: video.duration
            })
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            video.removeEventListener('error', onError)
            resolve()
          }
          
          const onError = (error: Event) => {
            console.error('❌ Erro no elemento de vídeo:', error)
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            video.removeEventListener('error', onError)
            reject(new Error('Erro ao carregar vídeo'))
          }
          
          video.addEventListener('loadedmetadata', onLoadedMetadata)
          video.addEventListener('error', onError)
          
          // Timeout de 10 segundos
          setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            video.removeEventListener('error', onError)
            reject(new Error('Timeout ao carregar vídeo'))
          }, 10000)
        })
        
        setCameraActive(true)
        setMessage('Câmera ativada. Posicione seu rosto na tela.')
        console.log('✅ Câmera ativada com sucesso')
      }
    } catch (error: any) {
      console.error('❌ Erro ao acessar câmera:', error)
      
      let errorMessage = 'Erro ao acessar a câmera'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Permita o acesso e tente novamente.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Configurações da câmera não suportadas.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setCameraError(errorMessage)
      setMessage(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    console.log('🛑 Parando câmera...')
    cleanup()
    setMessage('Câmera desativada')
  }

  const startCapture = async () => {
    if (!videoRef.current || !modelsLoaded || !usuario) {
      setMessage('Sistema não está pronto para captura')
      console.warn('⚠️ Sistema não está pronto para captura:', {
        video: !!videoRef.current,
        modelsLoaded,
        usuario: !!usuario
      })
      return
    }

    // Parar captura anterior se existir
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsCapturing(true)
    setStatus('capturing')
    setCaptureCount(0)
    setCapturedDescriptors([])
    setMessage('Iniciando captura... Mantenha-se imóvel')
    console.log('📸 Iniciando captura facial para:', usuario.email)

    captureIntervalRef.current = setInterval(async () => {
      try {
        if (!videoRef.current || !cameraActive) {
          console.warn('⚠️ Vídeo ou câmera não disponível')
          return
        }
        
        const descriptor = await faceRecognitionService.getFaceDescriptor(videoRef.current)
        
        if (descriptor) {
          console.log(`📸 Captura ${captureCount + 1}/5 realizada`)
          setCapturedDescriptors(prev => [...prev, descriptor])
          setCaptureCount(prev => {
            const newCount = prev + 1
            setMessage(`Captura ${newCount}/5 realizada`)
            
            if (newCount >= 5) {
              // Limpar intervalo
              if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current)
                captureIntervalRef.current = null
              }
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
              }
              
              finalizeCadastro([...capturedDescriptors, descriptor])
            }
            
            return newCount
          })
        } else {
          console.warn('⚠️ Nenhum rosto detectado na captura')
          setMessage('Nenhum rosto detectado. Posicione-se melhor na câmera.')
        }
      } catch (error) {
        console.error('❌ Erro durante a captura:', error)
        setMessage('Erro durante a captura')
      }
    }, 2000) // Capturar a cada 2 segundos

    // Timeout após 30 segundos
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout da captura facial')
      
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
      
      if (isCapturing && captureCount < 5) {
        setIsCapturing(false)
        setStatus('error')
        setMessage('Tempo limite excedido. Tente novamente.')
      }
    }, 30000)
  }

  const finalizeCadastro = async (descriptors: Float32Array[]) => {
    if (!usuario || descriptors.length === 0) {
      setStatus('error')
      setMessage('Erro: dados insuficientes para cadastro')
      console.error('❌ Dados insuficientes:', { usuario: !!usuario, descriptors: descriptors.length })
      return
    }

    try {
      console.log(`🧮 Calculando descritor médio de ${descriptors.length} amostras...`)
      
      // Calcular descritor médio para maior precisão
      const avgDescriptor = new Float32Array(descriptors[0].length)
      
      for (let i = 0; i < avgDescriptor.length; i++) {
        let sum = 0
        for (const descriptor of descriptors) {
          sum += descriptor[i]
        }
        avgDescriptor[i] = sum / descriptors.length
      }

      // Salvar o descritor médio
      faceRecognitionService.saveFaceDescriptor(usuario.email, avgDescriptor)
      
      setIsCapturing(false)
      setStatus('success')
      setMessage(`Cadastro facial realizado com sucesso! ${descriptors.length} amostras capturadas.`)
      console.log(`✅ Cadastro facial salvo para ${usuario.email}`)
      
      // Parar câmera e notificar sucesso
      setTimeout(() => {
        stopCamera()
        onSuccess()
      }, 2000)
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados faciais:', error)
      setStatus('error')
      setMessage('Erro ao salvar dados faciais')
      onError('Erro ao salvar dados faciais')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Scan className="h-5 w-5 animate-spin" />
      case 'capturing':
        return <Scan className="h-5 w-5 animate-pulse" />
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <UserPlus className="h-5 w-5" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 border-blue-200'
      case 'capturing':
        return 'bg-green-50 border-green-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (!usuario) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar logado para cadastrar dados faciais.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6 text-green-600" />
          Cadastro Facial
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status dos modelos */}
        {status === 'loading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Carregando modelos...</span>
              <span>{loadingProgress}%</span>
            </div>
            <Progress value={loadingProgress} className="h-2" />
          </div>
        )}

        {/* Informações do usuário */}
        {usuario && (
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">Cadastrando para:</p>
            <p className="text-lg font-bold text-blue-600">{usuario.nome}</p>
            <p className="text-xs text-gray-500">{usuario.email}</p>
          </div>
        )}

        {/* Vídeo da câmera */}
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={cn(
              "w-full h-64 bg-gray-100 rounded-lg object-cover",
              !cameraActive && "hidden"
            )}
            onLoadedMetadata={() => {
              console.log('📺 Metadados carregados, iniciando reprodução...')
              if (videoRef.current) {
                videoRef.current.play().catch(error => {
                  console.error('❌ Erro ao iniciar reprodução:', error)
                })
              }
            }}
            onError={(error) => {
              console.error('❌ Erro no elemento de vídeo:', error)
              setCameraError('Erro na reprodução do vídeo')
            }}
          />
          
          {!cameraActive && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Câmera desativada</p>
                {cameraError && (
                  <p className="text-xs text-red-500 mt-2">{cameraError}</p>
                )}
              </div>
            </div>
          )}

          {/* Overlay de captura */}
          {isCapturing && (
            <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse">
              <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-dashed border-green-300 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {captureCount}/5
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status message */}
        {message && (
          <Alert className={getStatusColor()}>
            {getStatusIcon()}
            <AlertDescription className="ml-2">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          {!cameraActive ? (
            <Button
              onClick={startCamera}
              disabled={!modelsLoaded || isLoading}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isLoading ? 'Ativando...' : 'Ativar Câmera'}
            </Button>
          ) : (
            <>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="flex-1"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Parar
              </Button>
              
              <Button
                onClick={startCapture}
                disabled={isCapturing || !usuario}
                className="flex-1"
              >
                {isCapturing ? (
                  <>
                    <Scan className="h-4 w-4 mr-2 animate-spin" />
                    Capturando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Iniciar Cadastro
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Instruções */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Posicione seu rosto centralizado na câmera</p>
          <p>• Mantenha boa iluminação</p>
          <p>• Permaneça imóvel durante as 5 capturas</p>
          <p>• O processo leva cerca de 10 segundos</p>
          <p>• Permita acesso à câmera quando solicitado</p>
        </div>
      </CardContent>
    </Card>
  )
} 