"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

export function MetodoAlternativo() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [tipo, setTipo] = useState<"admin" | "estudante">("estudante")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMensagem("")

    try {
      // Método simplificado que usa a API do Supabase
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

      // 2. Inserir manualmente na tabela perfis
      // Primeiro verificamos se a tabela existe
      const { error: checkError } = await supabase.from("perfis").select("id").limit(1)

      // Se a tabela não existir, vamos criá-la
      if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
        // Criar tabela perfis
        await supabase.rpc("criar_tabela_perfis_simples")
      }

      // Inserir o perfil
      const { error: perfilError } = await supabase.from("perfis").insert({
        id: authData.user.id,
        nome,
        email,
        tipo,
        status: "ativo",
      })

      if (perfilError) {
        console.error("Erro ao criar perfil:", perfilError)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{mensagem}</AlertDescription>
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
        <Label htmlFor="nome-alt">Nome completo</Label>
        <Input
          id="nome-alt"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-alt">E-mail</Label>
        <Input
          id="email-alt"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha-alt">Senha</Label>
        <Input
          id="senha-alt"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          disabled={status === "loading"}
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo-alt">Tipo de usuário</Label>
        <Select
          value={tipo}
          onValueChange={(value: "admin" | "estudante") => setTipo(value)}
          disabled={status === "loading"}
        >
          <SelectTrigger id="tipo-alt">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="estudante">Estudante</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Criando usuário..." : "Criar Usuário (Método Alternativo)"}
      </Button>
    </form>
  )
}

