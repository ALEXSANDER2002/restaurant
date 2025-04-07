"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Edit, Search, Trash2, UserPlus, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  buscarTodosUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  type PerfilUsuario,
} from "@/services/usuario-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function GerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<PerfilUsuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busca, setBusca] = useState("")
  const [dialogoAberto, setDialogoAberto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<PerfilUsuario | null>(null)
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  // Formulário
  const [nomeForm, setNomeForm] = useState("")
  const [emailForm, setEmailForm] = useState("")
  const [senhaForm, setSenhaForm] = useState("")
  const [tipoForm, setTipoForm] = useState<"admin" | "estudante">("estudante")
  const [statusForm, setStatusForm] = useState<"ativo" | "inativo">("ativo")
  const [erroForm, setErroForm] = useState<string | null>(null)

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    try {
      setCarregando(true)
      const { usuarios: dadosUsuarios, erro: erroUsuarios } = await buscarTodosUsuarios()

      if (erroUsuarios) {
        setErro(erroUsuarios)
        return
      }

      setUsuarios(dadosUsuarios)
      setUsuariosFiltrados(dadosUsuarios)

      // Check if we're using mock data
      if (dadosUsuarios.length > 0 && dadosUsuarios[0].id.startsWith("mock-")) {
        setAviso(
          "Exibindo dados simulados devido a um erro de conexão com o banco de dados. Alguns recursos podem estar limitados.",
        )
      }
    } catch (error: any) {
      setErro("Erro ao carregar usuários")
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (busca.trim() === "") {
      setUsuariosFiltrados(usuarios)
    } else {
      const filtrados = usuarios.filter(
        (usuario) =>
          usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
          usuario.email.toLowerCase().includes(busca.toLowerCase()),
      )
      setUsuariosFiltrados(filtrados)
    }
  }, [busca, usuarios])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativo
          </Badge>
        )
      case "inativo":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Inativo
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Administrador
          </Badge>
        )
      case "estudante":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Estudante
          </Badge>
        )
      default:
        return <Badge variant="outline">{tipo}</Badge>
    }
  }

  const abrirDialogoEdicao = (usuario: PerfilUsuario) => {
    setUsuarioEditando(usuario)
    setNomeForm(usuario.nome)
    setEmailForm(usuario.email)
    setSenhaForm("")
    setTipoForm(usuario.tipo)
    setStatusForm(usuario.status)
    setErroForm(null)
    setDialogoAberto(true)
  }

  const abrirDialogoNovo = () => {
    setUsuarioEditando(null)
    setNomeForm("")
    setEmailForm("")
    setSenhaForm("")
    setTipoForm("estudante")
    setStatusForm("ativo")
    setErroForm(null)
    setDialogoAberto(true)
  }

  const salvarUsuario = async () => {
    setErroForm(null)
    setCarregandoAcao(true)

    try {
      if (usuarioEditando) {
        // Editar usuário existente
        const { usuario, erro } = await atualizarUsuario(usuarioEditando.id, {
          nome: nomeForm,
          tipo: tipoForm,
          status: statusForm,
        })

        if (erro) {
          setErroForm(erro)
          return
        }

        if (usuario) {
          setUsuarios(usuarios.map((u) => (u.id === usuario.id ? usuario : u)))
          setDialogoAberto(false)

          // If we're using mock data, show a warning
          if (usuarioEditando.id.startsWith("mock-")) {
            setAviso("Operação simulada: as alterações são apenas visuais e não foram salvas no banco de dados.")
          }
        }
      } else {
        // Criar novo usuário
        if (!senhaForm) {
          setErroForm("A senha é obrigatória para novos usuários")
          return
        }

        // If we're using mock data, create a mock user
        if (usuarios.length > 0 && usuarios[0].id.startsWith("mock-")) {
          const novoUsuario: PerfilUsuario = {
            id: `mock-${Date.now()}`,
            nome: nomeForm,
            email: emailForm,
            tipo: tipoForm,
            status: statusForm,
            created_at: new Date().toISOString(),
          }

          setUsuarios([...usuarios, novoUsuario])
          setDialogoAberto(false)
          setAviso("Operação simulada: o novo usuário foi criado apenas visualmente e não foi salvo no banco de dados.")
          return
        }

        const { usuario, erro } = await criarUsuario(emailForm, senhaForm, nomeForm, tipoForm, statusForm)

        if (erro) {
          setErroForm(erro)
          return
        }

        if (usuario) {
          setUsuarios([...usuarios, usuario])
          setDialogoAberto(false)
        }
      }
    } catch (error: any) {
      setErroForm("Erro ao salvar usuário")
      console.error("Erro ao salvar usuário:", error)
    } finally {
      setCarregandoAcao(false)
    }
  }

  const excluirUsuarioHandler = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const { sucesso, erro } = await excluirUsuario(id)

        if (erro) {
          setErro(erro)
          return
        }

        if (sucesso) {
          setUsuarios(usuarios.filter((usuario) => usuario.id !== id))

          // If we're using mock data, show a warning
          if (id.startsWith("mock-")) {
            setAviso(
              "Operação simulada: o usuário foi removido apenas visualmente e não foi excluído do banco de dados.",
            )
          }
        }
      } catch (error: any) {
        setErro("Erro ao excluir usuário")
        console.error("Erro ao excluir usuário:", error)
      }
    }
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
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
    <div className="space-y-4">
      {aviso && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Aviso</AlertTitle>
          <AlertDescription className="text-blue-700">{aviso}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou email..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button onClick={abrirDialogoNovo}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {usuariosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{getTipoBadge(usuario.tipo)}</TableCell>
                  <TableCell>{getStatusBadge(usuario.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => abrirDialogoEdicao(usuario)}
                        aria-label="Editar usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => excluirUsuarioHandler(usuario.id)}
                        aria-label="Excluir usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{usuarioEditando ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {usuarioEditando
                ? "Edite as informações do usuário abaixo."
                : "Preencha as informações para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>

          {erroForm && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erroForm}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nomeForm}
                onChange={(e) => setNomeForm(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emailForm}
                onChange={(e) => setEmailForm(e.target.value)}
                placeholder="email@exemplo.com"
                disabled={!!usuarioEditando}
              />
            </div>

            {!usuarioEditando && (
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senhaForm}
                  onChange={(e) => setSenhaForm(e.target.value)}
                  placeholder="********"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoForm} onValueChange={(value: any) => setTipoForm(value)}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudante">Estudante</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusForm} onValueChange={(value: any) => setStatusForm(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarUsuario} disabled={carregandoAcao}>
              {carregandoAcao ? "Salvando..." : usuarioEditando ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

