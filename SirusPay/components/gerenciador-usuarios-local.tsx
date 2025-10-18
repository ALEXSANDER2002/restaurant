"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, UserPlus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Tipo para usuários locais
interface UsuarioLocal {
  id: string
  nome: string
  email: string
  senha: string
  tipo: "admin" | "estudante"
}

// Usuários padrão
const USUARIOS_PADRAO: UsuarioLocal[] = [
  {
    id: "admin-id-123456",
    nome: "Administrador",
    email: "admin@exemplo.com",
    senha: "admin123",
    tipo: "admin",
  },
  {
    id: "estudante-id-123456",
    nome: "Estudante Exemplo",
    email: "estudante@exemplo.com",
    senha: "senha123",
    tipo: "estudante",
  },
]

export default function GerenciadorUsuariosLocal() {
  const [usuarios, setUsuarios] = useState<UsuarioLocal[]>([])
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [tipo, setTipo] = useState<"admin" | "estudante">("estudante")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  // Carregar usuários do localStorage ao iniciar
  useEffect(() => {
    const usuariosArmazenados = localStorage.getItem("usuariosLocais")
    if (usuariosArmazenados) {
      setUsuarios(JSON.parse(usuariosArmazenados))
    } else {
      // Se não houver usuários, inicializar com os padrão
      setUsuarios(USUARIOS_PADRAO)
      localStorage.setItem("usuariosLocais", JSON.stringify(USUARIOS_PADRAO))
    }
  }, [])

  // Salvar usuários no localStorage quando mudar
  useEffect(() => {
    if (usuarios.length > 0) {
      localStorage.setItem("usuariosLocais", JSON.stringify(usuarios))
    }
  }, [usuarios])

  const adicionarUsuario = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos
    if (!nome || !email || !senha) {
      setStatus("error")
      setMensagem("Todos os campos são obrigatórios")
      return
    }

    // Verificar se email já existe
    if (usuarios.some((u) => u.email === email)) {
      setStatus("error")
      setMensagem("Este email já está em uso")
      return
    }

    // Criar novo usuário
    const novoUsuario: UsuarioLocal = {
      id: crypto.randomUUID(),
      nome,
      email,
      senha,
      tipo,
    }

    // Adicionar à lista
    setUsuarios([...usuarios, novoUsuario])

    // Limpar formulário
    setNome("")
    setEmail("")
    setSenha("")
    setTipo("estudante")

    // Mostrar mensagem de sucesso
    setStatus("success")
    setMensagem(`Usuário ${nome} criado com sucesso!`)
  }

  const excluirUsuario = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id))
      setStatus("success")
      setMensagem("Usuário excluído com sucesso")
    }
  }

  const resetarUsuarios = () => {
    if (
      confirm("Tem certeza que deseja resetar para os usuários padrão? Isso excluirá todos os usuários personalizados.")
    ) {
      setUsuarios(USUARIOS_PADRAO)
      localStorage.setItem("usuariosLocais", JSON.stringify(USUARIOS_PADRAO))
      setStatus("success")
      setMensagem("Usuários resetados para os padrão")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciador de Usuários Local</CardTitle>
        <CardDescription>Gerencie usuários localmente sem depender do Supabase Auth</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{mensagem}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Sucesso</AlertTitle>
            <AlertDescription className="text-green-700">{mensagem}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={adicionarUsuario} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de usuário</Label>
            <Select value={tipo} onValueChange={(value: "admin" | "estudante") => setTipo(value)}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estudante">Estudante</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </form>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-4">Usuários Cadastrados</h3>

          {usuarios.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum usuário cadastrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.tipo === "admin" ? "Administrador" : "Estudante"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirUsuario(usuario.id)}
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Button variant="outline" className="mt-4 w-full" onClick={resetarUsuarios}>
            Resetar para Usuários Padrão
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>Os usuários são armazenados apenas no navegador local</p>
      </CardFooter>
    </Card>
  )
}

