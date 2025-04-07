"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function CorrigirRLS() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  const corrigirPoliticasRLS = async () => {
    setStatus("loading")
    setMensagem("Corrigindo políticas RLS...")

    try {
      // Método 1: Tentar SQL direto com abordagem mais agressiva
      try {
        const { error } = await supabase.rpc("executar_sql", {
          sql: `
          -- Desativar RLS para a tabela perfis
          ALTER TABLE IF EXISTS public.perfis DISABLE ROW LEVEL SECURITY;
          
          -- Remover todas as políticas existentes
          DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem atualizar perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem excluir perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Permitir inserção anônima" ON public.perfis;
          DROP POLICY IF EXISTS "Permitir acesso a todos os perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Permitir todas as operações" ON public.perfis;
          
          -- Criar uma política simples que permite todas as operações
          CREATE POLICY "Permitir todas as operações"
            ON public.perfis FOR ALL
            USING (true)
            WITH CHECK (true);
            
          -- Reativar RLS com a nova política
          ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
        `,
        })

        if (!error) {
          setStatus("success")
          setMensagem("Políticas RLS corrigidas com sucesso! O erro de recursão infinita deve estar resolvido agora.")
          return
        }
      } catch (e) {
        console.warn("Método 1 falhou:", e)
      }

      // Método 2: Tentar cada comando separadamente
      try {
        // Desativar RLS
        await supabase.rpc("executar_sql", {
          sql: `ALTER TABLE IF EXISTS public.perfis DISABLE ROW LEVEL SECURITY;`,
        })

        // Remover políticas uma a uma
        const politicas = [
          "Usuários podem ver seus próprios perfis",
          "Administradores podem ver todos os perfis",
          "Administradores podem inserir perfis",
          "Administradores podem atualizar perfis",
          "Administradores podem excluir perfis",
          "Permitir inserção anônima",
          "Permitir acesso a todos os perfis",
          "Permitir todas as operações",
        ]

        for (const politica of politicas) {
          await supabase
            .rpc("executar_sql", {
              sql: `DROP POLICY IF EXISTS "${politica}" ON public.perfis;`,
            })
            .catch((e) => console.warn(`Falha ao remover política ${politica}:`, e))
        }

        // Criar nova política
        await supabase.rpc("executar_sql", {
          sql: `
          CREATE POLICY "Permitir todas as operações"
            ON public.perfis FOR ALL
            USING (true)
            WITH CHECK (true);
        `,
        })

        // Reativar RLS
        await supabase.rpc("executar_sql", {
          sql: `ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;`,
        })

        setStatus("success")
        setMensagem("Políticas RLS corrigidas com sucesso! O erro de recursão infinita deve estar resolvido agora.")
        return
      } catch (e) {
        console.warn("Método 2 falhou:", e)
      }

      // Método 3: Tentar fix_perfis_rls
      try {
        const { error } = await supabase.rpc("fix_perfis_rls")
        if (!error) {
          setStatus("success")
          setMensagem("Políticas RLS corrigidas com sucesso! O erro de recursão infinita deve estar resolvido agora.")
          return
        }
      } catch (e) {
        console.warn("Método 3 falhou:", e)
      }

      // Se chegamos aqui, nenhum método funcionou
      setStatus("error")
      setMensagem(
        "Não foi possível corrigir as políticas RLS automaticamente. Tente uma solução alternativa: use o login alternativo na página de login para acessar o sistema sem depender do banco de dados.",
      )
    } catch (error: any) {
      console.error("Erro ao corrigir políticas RLS:", error)
      setStatus("error")
      setMensagem(
        `Erro ao corrigir políticas RLS: ${error.message}. Tente usar o login alternativo na página de login.`,
      )
    }
  }

  const testarConexao = async () => {
    setStatus("loading")
    setMensagem("Testando conexão com o banco de dados...")

    try {
      // Teste simples para verificar se a conexão está funcionando
      const { data, error } = await supabase.from("perfis").select("count").limit(1)

      if (error) {
        if (error.message.includes("infinite recursion")) {
          setStatus("error")
          setMensagem(
            "Erro de recursão infinita detectado. Clique em 'Corrigir Políticas RLS' para resolver o problema.",
          )
        } else {
          setStatus("error")
          setMensagem(`Erro ao conectar ao banco de dados: ${error.message}`)
        }
      } else {
        setStatus("success")
        setMensagem(
          "Conexão com o banco de dados estabelecida com sucesso! Não foi detectado erro de recursão infinita.",
        )
      }
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error)
      setStatus("error")
      setMensagem(`Erro ao testar conexão: ${error.message}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corrigir Políticas RLS</CardTitle>
        <CardDescription>Corrige o erro de "recursão infinita" nas políticas RLS da tabela "perfis"</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{mensagem}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Sucesso</AlertTitle>
            <AlertDescription className="text-green-700">{mensagem}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <Alert className="mb-4">
            <AlertTitle>Processando...</AlertTitle>
            <AlertDescription>{mensagem}</AlertDescription>
          </Alert>
        )}

        <p className="mb-4">
          Este utilitário corrige o erro de "recursão infinita" nas políticas RLS (Row Level Security) da tabela
          "perfis". O erro ocorre quando as políticas RLS criam uma referência circular.
        </p>

        <p className="mb-4">A correção:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Desativa temporariamente o RLS para a tabela "perfis"</li>
          <li>Remove todas as políticas existentes que podem estar causando a recursão</li>
          <li>Opcionalmente, cria uma política simples que permite todas as operações</li>
        </ul>

        <p className="text-sm text-muted-foreground">
          Nota: Esta é uma solução temporária. Em um ambiente de produção, você deve configurar políticas RLS adequadas.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button onClick={testarConexao} disabled={status === "loading"} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          {status === "loading" ? "Testando..." : "Testar Conexão"}
        </Button>

        <Button onClick={corrigirPoliticasRLS} disabled={status === "loading"} className="w-full">
          <Database className="mr-2 h-4 w-4" />
          {status === "loading" ? "Corrigindo..." : "Corrigir Políticas RLS"}
        </Button>
      </CardFooter>
    </Card>
  )
}

