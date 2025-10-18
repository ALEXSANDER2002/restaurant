"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { GerenciarAvatar } from "@/components/gerenciar-avatar"
import { CadastroFacial } from "@/components/cadastro-facial"
import { 
  User, 
  Mail, 
  Key, 
  Shield, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Scan
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function PerfilUsuario() {
  const { usuario } = useAuth()
  
  // Estados para edição de perfil
  const [editandoNome, setEditandoNome] = useState(false)
  const [novoNome, setNovoNome] = useState(usuario?.email?.split('@')[0] || '')
  
  // Estados para alteração de senha
  const [mostrarFormSenha, setMostrarFormSenha] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false
  })
  const [carregandoSenha, setCarregandoSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState<string | null>(null)
  const [sucessoSenha, setSucessoSenha] = useState(false)
  
  // Estados para cadastro facial
  const [mostrarCadastroFacial, setMostrarCadastroFacial] = useState(false)
  const [sucessoCadastroFacial, setSucessoCadastroFacial] = useState(false)

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoSenha(true)
    setErroSenha(null)
    setSucessoSenha(false)

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErroSenha("Todos os campos são obrigatórios")
      setCarregandoSenha(false)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErroSenha("Nova senha e confirmação devem ser iguais")
      setCarregandoSenha(false)
      return
    }

    if (novaSenha.length < 8) {
      setErroSenha("Nova senha deve ter pelo menos 8 caracteres")
      setCarregandoSenha(false)
      return
    }

    try {
      const response = await fetch("/api/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senhaAtual,
          novaSenha
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSucessoSenha(true)
        setSenhaAtual("")
        setNovaSenha("")
        setConfirmarSenha("")
        setMostrarFormSenha(false)
        
        setTimeout(() => setSucessoSenha(false), 5000)
      } else {
        setErroSenha(data.erro || "Erro ao alterar senha")
      }
    } catch (error) {
      setErroSenha("Erro de conexão. Tente novamente.")
    } finally {
      setCarregandoSenha(false)
    }
  }

  const handleCadastroFacialSucesso = () => {
    setSucessoCadastroFacial(true)
    setMostrarCadastroFacial(false)
    setTimeout(() => setSucessoCadastroFacial(false), 5000)
  }

  const handleCadastroFacialErro = (message: string) => {
    console.error('Erro no cadastro facial:', message)
  }

  const getTipoUsuarioInfo = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return { 
          label: 'Administrador', 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Shield className="h-4 w-4" />
        }
      case 'usuario':
        return { 
          label: 'Usuário', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <User className="h-4 w-4" />
        }
      default:
        return { 
          label: 'Usuário', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <User className="h-4 w-4" />
        }
    }
  }

  const tipoInfo = getTipoUsuarioInfo(usuario?.tipo_usuario || 'usuario')

  return (
    <div className="space-y-6">
      {/* Gerenciar Avatar - Nova seção */}
      <GerenciarAvatar />
      
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Gerencie suas informações básicas de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-gray-900">{usuario?.email}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Verificado
            </Badge>
          </div>

          {/* Tipo de Usuário */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {tipoInfo.icon}
              <div>
                <Label className="text-sm font-medium">Tipo de Conta</Label>
                <p className="text-gray-900">{tipoInfo.label}</p>
              </div>
            </div>
            <Badge className={tipoInfo.color}>
              {tipoInfo.label}
            </Badge>
          </div>

          {/* ID da Conta */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <Label className="text-sm font-medium">ID da Conta</Label>
                <p className="text-gray-900 font-mono text-sm">
                  {usuario?.id?.slice(0, 8)}...{usuario?.id?.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie suas configurações de segurança e senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sucessoSenha && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Senha alterada com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {!mostrarFormSenha ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium">Senha</Label>
                  <p className="text-gray-600">••••••••</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setMostrarFormSenha(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Alterar Senha
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Alterar Senha</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setMostrarFormSenha(false)
                    setSenhaAtual("")
                    setNovaSenha("")
                    setConfirmarSenha("")
                    setErroSenha(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {erroSenha && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{erroSenha}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div>
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="senhaAtual"
                      type={mostrarSenhas.atual ? "text" : "password"}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarSenhas(prev => ({ ...prev, atual: !prev.atual }))}
                    >
                      {mostrarSenhas.atual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={mostrarSenhas.nova ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="pr-10"
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarSenhas(prev => ({ ...prev, nova: !prev.nova }))}
                    >
                      {mostrarSenhas.nova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
                </div>

                <div>
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={mostrarSenhas.confirmar ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarSenhas(prev => ({ ...prev, confirmar: !prev.confirmar }))}
                    >
                      {mostrarSenhas.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={carregandoSenha}
                    className="flex items-center gap-2"
                  >
                    {carregandoSenha ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar Nova Senha
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setMostrarFormSenha(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}

          <Separator />

          {/* Informações de Segurança */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Dicas de Segurança
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use uma senha forte com pelo menos 8 caracteres</li>
              <li>• Combine letras maiúsculas, minúsculas, números e símbolos</li>
              <li>• Não compartilhe sua senha com outras pessoas</li>
              <li>• Altere sua senha regularmente</li>
              <li>• Sempre faça logout em computadores públicos</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Reconhecimento Facial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Reconhecimento Facial
          </CardTitle>
          <CardDescription>
            Configure o login por reconhecimento facial para maior comodidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sucessoCadastroFacial && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Dados faciais cadastrados com sucesso! Agora você pode fazer login usando reconhecimento facial.
              </AlertDescription>
            </Alert>
          )}

          {!mostrarCadastroFacial ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Scan className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium">Login Facial</Label>
                    <p className="text-gray-600">Configure seu rosto para login rápido</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarCadastroFacial(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Cadastrar Rosto
                </Button>
              </div>

              {/* Informações sobre o recurso */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Como Funciona
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Capture 5 amostras do seu rosto para maior precisão</li>
                  <li>• Use em ambientes bem iluminados</li>
                  <li>• Mantenha-se centralizado na câmera</li>
                  <li>• Os dados ficam salvos localmente no seu dispositivo</li>
                  <li>• Você pode remover os dados a qualquer momento</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Cadastrar Reconhecimento Facial</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setMostrarCadastroFacial(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <CadastroFacial 
                onSuccess={handleCadastroFacialSucesso}
                onError={handleCadastroFacialErro}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}