"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function InicializarUsuarios() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  const criarUsuarios = async () => {
    setStatus("loading")
    setMensagem("Criando usuários...")

    try {
      // Criar usuário administrador
      const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signUp({
        email: "admin@exemplo.com",
        password: "admin123",
      })

      if (adminAuthError) {
        throw new Error(`Erro ao criar autenticação do admin: ${adminAuthError.message}`)
      }

      if (!adminAuthData.user) {
        throw new Error("Falha ao criar usuário admin")
      }

      // Criar perfil do administrador
      const { error: adminPerfilError } = await supabase.from("perfis").insert({
        id: adminAuthData.user.id,
        nome: "Administrador",
        email: "admin@exemplo.com",
        tipo: "admin",
        status: "ativo",
      })

      if (adminPerfilError) {
        throw new Error(`Erro ao criar perfil do admin: ${adminPerfilError.message}`)
      }

      // Criar usuário estudante
      const { data: estudanteAuthData, error: estudanteAuthError } = await supabase.auth.signUp({
        email: "estudante@exemplo.com",
        password: "senha123",
      })

      if (estudanteAuthError) {
        throw new Error(`Erro ao criar autenticação do estudante: ${estudanteAuthError.message}`)
      }

      if (!estudanteAuthData.user) {
        throw new Error("Falha ao criar usuário estudante")
      }

      // Criar perfil do estudante
      const { error: estudantePerfilError } = await supabase.from("perfis").insert({
        id: estudanteAuthData.user.id,
        nome: "Estudante Exemplo",
        email: "estudante@exemplo.com",
        tipo: "estudante",
        status: "ativo",
      })

      if (estudantePerfilError) {
        throw new Error(`Erro ao criar perfil do estudante: ${estudantePerfilError.message}`)
      }

      setStatus("success")
      setMensagem(
        "Usuários criados com sucesso!\n\nAdmin: admin@exemplo.com / admin123\nEstudante: estudante@exemplo.com / senha123",
      )
    } catch (error: any) {
      console.error("Erro ao criar usuários:", error)
      setStatus("error")
      setMensagem(`Erro ao criar usuários: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Inicializar Usuários</CardTitle>
          <CardDescription>Crie usuários padrão para o sistema do Restaurante Universitário</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{mensagem}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="whitespace-pre-line text-green-800">{mensagem}</AlertDescription>
            </Alert>
          )}

          <p className="mb-4">Este utilitário criará dois usuários padrão no sistema:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>
              <strong>Administrador</strong>
              <br />
              Email: admin@exemplo.com
              <br />
              Senha: admin123
            </li>
            <li>
              <strong>Estudante</strong>
              <br />
              Email: estudante@exemplo.com
              <br />
              Senha: senha123
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Nota: Este componente deve ser usado apenas durante o desenvolvimento para inicializar o banco de dados.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={criarUsuarios} disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Criando usuários..." : "Criar Usuários Padrão"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

