"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, CameraOff, UserCheck, UserX, Scan, AlertCircle, CheckCircle2 } from "lucide-react"
import { faceRecognitionService } from "@/services/face-recognition-service"
import { useIdioma } from "@/contexts/idioma-context"
import { cn } from "@/lib/utils"

interface LoginFacialProps {
  onSuccess: (email: string) => void
  onError: (message: string) => void
}

export function LoginFacial({ onSuccess, onError }: LoginFacialProps) {
  const { t } = useIdioma()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([])
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Executando cleanup...')
    
    // Parar intervalos
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
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
    setIsScanning(false)
  }, [])

  // Carregar modelos na inicialização
  useEffect(() => {
    loadModels()
    loadRegisteredUsers()
    
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
      console.log('🤖 Iniciando carregamento dos modelos...')
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

  const loadRegisteredUsers = () => {
    try {
      const users = faceRecognitionService.getUsersWithFaceData()
      setRegisteredUsers(users)
      console.log(`👥 ${users.length} usuários registrados encontrados:`, users)
    } catch (error) {
      console.error('❌ Erro ao carregar usuários registrados:', error)
      setRegisteredUsers([])
    }
  }

  const startCamera = async () => {
    try {
      console.log('📹 Iniciando câmera...')
      
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
        setMessage('Câmera ativada com sucesso!')
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

  const startFaceRecognition = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || registeredUsers.length === 0) {
      setMessage('Sistema não está pronto para reconhecimento')
      console.warn('⚠️ Sistema não está pronto:', {
        video: !!videoRef.current,
        modelsLoaded,
        registeredUsers: registeredUsers.length
      })
      return
    }

    // Parar scan anterior se existir
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsScanning(true)
    setStatus('scanning')
    setMessage('Escaneando rosto...')
    console.log('🔍 Iniciando reconhecimento facial para usuários:', registeredUsers)

    let scanCount = 0
    const maxScans = 30 // 30 segundos

    scanIntervalRef.current = setInterval(async () => {
      try {
        scanCount++
        console.log(`🔄 Scan ${scanCount}/${maxScans}`)
        
        if (!videoRef.current || !cameraActive) {
          console.warn('⚠️ Vídeo ou câmera não disponível')
          return
        }
        
        const descriptor = await faceRecognitionService.getFaceDescriptor(videoRef.current)
        
        if (descriptor) {
          console.log('👤 Descritor facial obtido, comparando com usuários registrados...')
          
          // Comparar com todos os usuários registrados
          for (const email of registeredUsers) {
            const storedDescriptor = faceRecognitionService.loadFaceDescriptor(email)
            
            if (storedDescriptor) {
              const distance = faceRecognitionService.compareFaces(descriptor, storedDescriptor)
              const isMatch = faceRecognitionService.isFaceMatch(distance)
              
              console.log(`📊 Comparação com ${email}: distância=${distance.toFixed(4)}, match=${isMatch}`)
              
              if (isMatch) {
                console.log('✅ Match encontrado! Fazendo login para:', email)
                
                // Limpar intervalos
                if (scanIntervalRef.current) {
                  clearInterval(scanIntervalRef.current)
                  scanIntervalRef.current = null
                }
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current)
                  timeoutRef.current = null
                }
                
                setIsScanning(false)
                setStatus('success')
                setMessage('Login realizado com sucesso! Redirecionando...')
                
                // Parar câmera e fazer login
                setTimeout(() => {
                  stopCamera()
                  onSuccess(email)
                }, 1000)
                return
              }
            }
          }
          
          // Se chegou aqui, não encontrou correspondência
          setMessage(`Rosto não reconhecido. Tentativa ${scanCount}/${maxScans}...`)
        } else {
          setMessage(`Nenhum rosto detectado. Tentativa ${scanCount}/${maxScans}...`)
        }
      } catch (error) {
        console.error('❌ Erro durante reconhecimento:', error)
        setMessage('Erro durante o reconhecimento')
      }
    }, 1000) // Escanear a cada 1 segundo

    // Timeout após 30 segundos
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout do reconhecimento facial')
      
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }
      
      if (isScanning) {
        setIsScanning(false)
        setStatus('error')
        setMessage('Tempo limite excedido. Tente novamente.')
      }
    }, 30000)
  }, [modelsLoaded, registeredUsers, isScanning, onSuccess, cameraActive])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Scan className="h-5 w-5 animate-spin" />
      case 'scanning':
        return <Scan className="h-5 w-5 animate-pulse" />
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <UserCheck className="h-5 w-5" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 border-blue-200'
      case 'scanning':
        return 'bg-yellow-50 border-yellow-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <UserCheck className="h-6 w-6 text-blue-600" />
          {t("login.facial.titulo")}
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

        {/* Informações dos usuários registrados */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Usuários registrados:</span>
            <Badge variant="secondary">{registeredUsers.length}</Badge>
          </div>
          {registeredUsers.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Nenhum usuário com dados faciais registrados. 
                Faça login com email/senha primeiro para registrar seu rosto.
              </AlertDescription>
            </Alert>
          )}
        </div>

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
          
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-64 rounded-lg pointer-events-none"
            style={{ display: 'none' }}
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

          {/* Overlay de scanning */}
          {isScanning && (
            <div className="absolute inset-0 border-4 border-blue-500 rounded-lg animate-pulse">
              <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-dashed border-blue-300 rounded-lg"></div>
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
                onClick={startFaceRecognition}
                disabled={isScanning || registeredUsers.length === 0}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <Scan className="h-4 w-4 mr-2 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Reconhecer
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
          <p>• Evite movimentos bruscos durante o scan</p>
          <p>• Permita acesso à câmera quando solicitado</p>
        </div>
      </CardContent>
    </Card>
  )
} 