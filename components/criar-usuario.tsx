"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

export function CriarUsuario() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [tipo, setTipo] = useState<"admin" | "estudante">("estudante")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "info">("idle")
  const [mensagem, setMensagem] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMensagem("")

    try {
      // 1. Criar o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            tipo,
          },
        },
      })

      if (authError) {
        throw new Error(`Erro na autenticação: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error("Falha ao criar usuário")
      }

      // 2. Verificar se a tabela perfis existe
      const { error: checkError } = await supabase.from("perfis").select("id").limit(1)

      if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
        setStatus("info")
        setMensagem("A tabela 'perfis' não existe. Clique no botão abaixo para criá-la.")
        return
      }

      // 3. Inserir o perfil
      const { error: perfilError } = await supabase.from("perfis").insert({
        id: authData.user.id,
        nome,
        email,
        tipo,
        status: "ativo",
      })

      if (perfilError) {
        console.warn("Aviso: Erro ao criar perfil:", perfilError)
        // Não vamos falhar aqui, apenas registrar o erro
      }

      setStatus("success")
      setMensagem(`Usuário ${nome} criado com sucesso! Você já pode fazer login.
      
ID: ${authData.user.id}
Email: ${authData.user.email}

Nota: Se você receber um email de confirmação, clique no link para ativar sua conta.`)

      // Limpar o formulário
      setNome("")
      setEmail("")
      setSenha("")
      setTipo("estudante")
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error)
      setStatus("error")
      setMensagem(error.message)
    }
  }

  const criarTabelaPerfis = async () => {
    setStatus("loading")
    setMensagem("Criando tabela perfis...")

    try {
      // Criar a tabela perfis
      await supabase.rpc("criar_tabela_perfis_simples")

      setStatus("success")
      setMensagem("Tabela 'perfis' criada com sucesso! Agora você pode criar usuários.")
    } catch (error: any) {
      console.error("Erro ao criar tabela:", error)
      setStatus("error")
      setMensagem(`Erro ao criar tabela: ${error.message}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{mensagem}</AlertDescription>
        </Alert>
      )}

      {status === "info" && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Informação</AlertTitle>
          <AlertDescription className="text-blue-700">{mensagem}</AlertDescription>
          <Button onClick={criarTabelaPerfis} className="mt-2 bg-blue-600 hover:bg-blue-700" size="sm">
            Criar Tabela Perfis
          </Button>
        </Alert>
      )}

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sucesso</AlertTitle>
          <AlertDescription className="text-green-700 whitespace-pre-line">{mensagem}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          disabled={status === "loading"}
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de usuário</Label>
        <Select
          value={tipo}
          onValueChange={(value: "admin" | "estudante") => setTipo(value)}
          disabled={status === "loading"}
        >
          <SelectTrigger id="tipo">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="estudante">Estudante</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Criando usuário..." : "Criar Usuário"}
      </Button>
    </form>
  )
}

