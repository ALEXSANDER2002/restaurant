"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function InicializacaoDireta() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  const inicializarSistema = async () => {
    setStatus("loading")
    setMensagem("Inicializando o sistema...")

    try {
      // 1. Verificar se a tabela perfis existe e criar se não existir
      try {
        const { error: checkError } = await supabase.from("perfis").select("id").limit(1)

        if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
          // Criar tabela perfis
          await supabase.rpc("criar_tabela_perfis_simples")
          setMensagem((prev) => prev + "\n✅ Tabela 'perfis' criada com sucesso!")
        } else {
          setMensagem((prev) => prev + "\n✅ Tabela 'perfis' já existe!")
        }
      } catch (error: any) {
        setMensagem((prev) => prev + `\n❌ Erro ao verificar/criar tabela: ${error.message}`)
      }

      // 2. Criar usuário administrador
      try {
        const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signUp({
          email: "admin@exemplo.com",
          password: "admin123",
          options: {
            data: {
              nome: "Administrador",
              tipo: "admin",
            },
          },
        })

        if (adminAuthError) {
          throw adminAuthError
        }

        if (!adminAuthData.user) {
          throw new Error("Falha ao criar usuário admin")
        }

        // Inserir perfil do administrador
        const { error: adminPerfilError } = await supabase.from("perfis").insert({
          id: adminAuthData.user.id,
          nome: "Administrador",
          email: "admin@exemplo.com",
          tipo: "admin",
          status: "ativo",
        })

        if (adminPerfilError) {
          console.warn("Aviso: Erro ao criar perfil do admin:", adminPerfilError)
        }

        setMensagem((prev) => prev + "\n✅ Usuário administrador criado com sucesso!")
      } catch (error: any) {
        // Se o erro for de email já existente, não é um problema crítico
        if (error.message.includes("already registered")) {
          setMensagem((prev) => prev + "\n⚠️ Usuário admin já existe!")
        } else {
          setMensagem((prev) => prev + `\n❌ Erro ao criar admin: ${error.message}`)
        }
      }

      // 3. Criar usuário estudante
      try {
        const { data: estudanteAuthData, error: estudanteAuthError } = await supabase.auth.signUp({
          email: "estudante@exemplo.com",
          password: "senha123",
          options: {
            data: {
              nome: "Estudante Exemplo",
              tipo: "estudante",
            },
          },
        })

        if (estudanteAuthError) {
          throw estudanteAuthError
        }

        if (!estudanteAuthData.user) {
          throw new Error("Falha ao criar usuário estudante")
        }

        // Inserir perfil do estudante
        const { error: estudantePerfilError } = await supabase.from("perfis").insert({
          id: estudanteAuthData.user.id,
          nome: "Estudante Exemplo",
          email: "estudante@exemplo.com",
          tipo: "estudante",
          status: "ativo",
        })

        if (estudantePerfilError) {
          console.warn("Aviso: Erro ao criar perfil do estudante:", estudantePerfilError)
        }

        setMensagem((prev) => prev + "\n✅ Usuário estudante criado com sucesso!")
      } catch (error: any) {
        // Se o erro for de email já existente, não é um problema crítico
        if (error.message.includes("already registered")) {
          setMensagem((prev) => prev + "\n⚠️ Usuário estudante já existe!")
        } else {
          setMensagem((prev) => prev + `\n❌ Erro ao criar estudante: ${error.message}`)
        }
      }

      setStatus("success")
      setMensagem(
        (prev) =>
          prev +
          "\n\n✅ Inicialização concluída!\n\nCredenciais:\nAdmin: admin@exemplo.com / admin123\nEstudante: estudante@exemplo.com / senha123",
      )
    } catch (error: any) {
      console.error("Erro na inicialização:", error)
      setStatus("error")
      setMensagem(`Erro na inicialização: ${error.message}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicialização Direta</CardTitle>
        <CardDescription>Inicialize o sistema com usuários padrão</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{mensagem}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Sucesso</AlertTitle>
            <AlertDescription className="whitespace-pre-line text-green-800">{mensagem}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <Alert className="mb-4">
            <AlertTitle>Processando...</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{mensagem}</AlertDescription>
          </Alert>
        )}

        <p className="mb-4">Este utilitário irá:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Criar a tabela 'perfis' se não existir</li>
          <li>Criar um usuário administrador (admin@exemplo.com / admin123)</li>
          <li>Criar um usuário estudante (estudante@exemplo.com / senha123)</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Nota: Se os usuários já existirem, o processo continuará sem erros.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={inicializarSistema} disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Inicializando..." : "Inicializar Sistema"}
        </Button>
      </CardFooter>
    </Card>
  )
}

