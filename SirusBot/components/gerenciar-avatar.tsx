"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Camera, 
  Upload, 
  Trash2, 
  User, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function GerenciarAvatar() {
  const { usuario, atualizarUsuario } = useAuth()
  const [carregandoUpload, setCarregandoUpload] = useState(false) 
  const [carregandoRemover, setCarregandoRemover] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(usuario?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCarregandoUpload(true)
    setErro(null)
    setSucesso(null)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.sucesso) {
        setAvatarUrl(data.avatar_url)
        setSucesso("Foto de perfil atualizada com sucesso!")
        
        // Atualizar dados do usuário no contexto
        await atualizarUsuario()
        
        // Limpar sucesso após 3 segundos
        setTimeout(() => setSucesso(null), 3000)
      } else {
        setErro(data.erro || "Erro ao fazer upload da foto")
      }
    } catch (error) {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setCarregandoUpload(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoverAvatar = async () => {
    setCarregandoRemover(true)
    setErro(null)
    setSucesso(null)

    try {
      const response = await fetch("/api/avatar", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.sucesso) {
        setAvatarUrl(null)
        setSucesso("Foto de perfil removida com sucesso!")
        
        // Atualizar dados do usuário no contexto
        await atualizarUsuario()
        
        // Limpar sucesso após 3 segundos
        setTimeout(() => setSucesso(null), 3000)
      } else {
        setErro(data.erro || "Erro ao remover foto")
      }
    } catch (error) {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setCarregandoRemover(false)
    }
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto de Perfil
        </CardTitle>
        <CardDescription>
          Personalize sua conta com uma foto de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-border">
            <AvatarImage 
              src={avatarUrl || undefined} 
              alt="Foto de perfil" 
            />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {usuario?.email ? getInitials(usuario.email) : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <p className="text-sm font-medium">Sua foto de perfil</p>
            <p className="text-xs text-muted-foreground">
              {avatarUrl ? "Foto personalizada" : "Foto padrão baseada no seu email"}
            </p>
          </div>
        </div>

        {/* Messages */}
        {erro && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={carregandoUpload}
            className="flex-1"
          >
            {carregandoUpload ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {avatarUrl ? "Alterar Foto" : "Adicionar Foto"}
              </>
            )}
          </Button>

          {avatarUrl && (
            <Button
              variant="outline"
              onClick={handleRemoverAvatar}
              disabled={carregandoRemover}
              className="flex-1 sm:flex-none"
            >
              {carregandoRemover ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </>
              )}
            </Button>
          )}
        </div>

        {/* Specs */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Requisitos da foto:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Formatos: JPG, PNG, WEBP ou GIF</li>
              <li>Tamanho máximo: 5MB</li>
              <li>Recomendado: Imagem quadrada para melhor resultado</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 