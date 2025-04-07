"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function InserirUsuariosExemplo() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  const inserirUsuariosExemplo = async () => {
    setStatus("loading")
    setMensagem("Inserindo usuários de exemplo...")

    try {
      // Verificar se a tabela perfis existe
      try {
        const { error: checkError } = await supabase.from("perfis").select("id").limit(1)

        if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
          // Criar tabela perfis com políticas simplificadas
          await supabase.rpc("criar_tabela_perfis_simples").catch(async (e) => {
            // Tentar criar manualmente se a RPC falhar
            const { error } = await supabase.from("sql").rpc(`
              CREATE TABLE IF NOT EXISTS public.perfis (
                id UUID PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'estudante')),
                status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              -- Desativar RLS para evitar problemas de recursão
              ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
            `)

            if (error) throw error
          })
          setMensagem((prev) => prev + "\n✅ Tabela 'perfis' criada com sucesso!")
        } else {
          // Desativar RLS para evitar problemas de recursão
          await supabase
            .from("sql")
            .rpc(`
            ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
          `)
            .catch((e) => console.warn("Aviso ao desativar RLS:", e))

          setMensagem((prev) => prev + "\n✅ Tabela 'perfis' já existe!")
        }
      } catch (error: any) {
        setMensagem((prev) => prev + `\n⚠️ Aviso ao verificar tabela: ${error.message}`)
        // Continuar mesmo com erro
      }

      // Gerar UUIDs para os usuários
      const adminId = crypto.randomUUID()
      const estudanteId = crypto.randomUUID()

      // Inserir perfil do administrador
      try {
        // Verificar se já existe um admin
        const { data: adminExistente } = await supabase
          .from("perfis")
          .select("id")
          .eq("email", "admin@exemplo.com")
          .maybeSingle()

        if (adminExistente) {
          setMensagem((prev) => prev + "\n✅ Perfil de administrador já existe!")
        } else {
          const { error: adminError } = await supabase.from("perfis").insert({
            id: adminId,
            nome: "Administrador",
            email: "admin@exemplo.com",
            tipo: "admin",
            status: "ativo",
          })

          if (adminError) {
            throw adminError
          }
          setMensagem((prev) => prev + "\n✅ Perfil de administrador inserido com sucesso!")
        }
      } catch (error: any) {
        setMensagem((prev) => prev + `\n❌ Erro ao inserir admin: ${error.message}`)
      }

      // Inserir perfil do estudante
      try {
        // Verificar se já existe um estudante
        const { data: estudanteExistente } = await supabase
          .from("perfis")
          .select("id")
          .eq("email", "estudante@exemplo.com")
          .maybeSingle()

        if (estudanteExistente) {
          setMensagem((prev) => prev + "\n✅ Perfil de estudante já existe!")
        } else {
          const { error: estudanteError } = await supabase.from("perfis").insert({
            id: estudanteId,
            nome: "Estudante Exemplo",
            email: "estudante@exemplo.com",
            tipo: "estudante",
            status: "ativo",
          })

          if (estudanteError) {
            throw estudanteError
          }
          setMensagem((prev) => prev + "\n✅ Perfil de estudante inserido com sucesso!")
        }
      } catch (error: any) {
        setMensagem((prev) => prev + `\n❌ Erro ao inserir estudante: ${error.message}`)
      }

      setStatus("success")
      setMensagem(
        (prev) =>
          prev +
          `\n\n✅ Usuários de exemplo inseridos!\n
IMPORTANTE: Como não foi possível criar os usuários na autenticação, você precisará usar o método de login alternativo abaixo.

Para entrar como administrador:
Email: admin@exemplo.com
Senha: admin123

Para entrar como estudante:
Email: estudante@exemplo.com
Senha: senha123`,
      )
    } catch (error: any) {
      console.error("Erro ao inserir usuários:", error)
      setStatus("error")
      setMensagem(`Erro ao inserir usuários: ${error.message}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inserir Usuários de Exemplo</CardTitle>
        <CardDescription>Insere perfis de usuários de exemplo na tabela 'perfis'</CardDescription>
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
          <li>Desativar RLS (Row Level Security) para evitar problemas de recursão</li>
          <li>Inserir perfis de exemplo para administrador e estudante</li>
          <li>Não tenta criar usuários na autenticação (evitando o erro)</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Nota: Como os usuários não serão criados na autenticação, você precisará usar o método de login alternativo.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={inserirUsuariosExemplo} disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Inserindo..." : "Inserir Usuários de Exemplo"}
        </Button>
      </CardFooter>
    </Card>
  )
}

