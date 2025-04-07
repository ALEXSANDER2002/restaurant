import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Configuracoes() {
  const [corrigindo, setCorrigindo] = useState(false)
  const [resultado, setResultado] = useState<{ sucesso: boolean; mensagem?: string } | null>(null)

  const corrigirPoliticasRLS = async () => {
    try {
      // Executar SQL diretamente
      const { error } = await supabase.rpc("fix_rls_recursion")
      
      if (error) {
        throw error
      }
      
      return { sucesso: true }
    } catch (error: any) {
      console.error("Erro ao corrigir políticas RLS:", error)
      return { sucesso: false, erro: error.message }
    }
  }

  const handleCorrigirPoliticas = async () => {
    setCorrigindo(true)
    setResultado(null)
    
    try {
      const resultado = await corrigirPoliticasRLS()
      
      if (resultado.sucesso) {
        setResultado({ sucesso: true, mensagem: "Políticas RLS corrigidas com sucesso! Recarregue a página." })
        toast.success("Políticas RLS corrigidas com sucesso!")
      } else {
        // Se o RPC falhar, mostramos o SQL para execução manual
        setResultado({ 
          sucesso: false, 
          mensagem: "Não foi possível corrigir automaticamente. Por favor, execute o SQL abaixo no Supabase Studio:" 
        })
        toast.error("Erro ao corrigir políticas RLS")
      }
    } catch (error: any) {
      setResultado({ 
        sucesso: false, 
        mensagem: "Erro ao corrigir políticas. Execute o SQL abaixo no Supabase Studio:" 
      })
      toast.error("Erro ao corrigir políticas RLS")
    } finally {
      setCorrigindo(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Correção de Políticas RLS</CardTitle>
            <CardDescription>
              Corrija problemas de recursão infinita nas políticas RLS do Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Clique no botão abaixo para corrigir problemas de recursão infinita 
                nas políticas RLS do Supabase. Isso permitirá que administradores visualizem todos os tickets.
              </p>
              <Button 
                onClick={handleCorrigirPoliticas} 
                disabled={corrigindo}
                className="w-full md:w-auto"
              >
                {corrigindo ? "Corrigindo..." : "Corrigir Políticas RLS"}
              </Button>

              {resultado && (
                <Alert variant={resultado.sucesso ? "default" : "destructive"} className="mt-4">
                  {resultado.sucesso ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{resultado.sucesso ? "Sucesso" : "Erro"}</AlertTitle>
                  <AlertDescription>{resultado.mensagem}</AlertDescription>
                  
                  {!resultado.sucesso && (
                    <pre className="mt-4 p-4 bg-slate-800 text-white rounded-md overflow-x-auto text-sm">
                      {`-- Criar função para corrigir RLS
CREATE OR REPLACE FUNCTION public.fix_rls_recursion()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desativar RLS
  ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
  
  -- Remover todas as políticas existentes
  DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.perfis;
  DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.perfis;
  DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.perfis;
  DROP POLICY IF EXISTS "Acesso universal a perfis" ON public.perfis;
  DROP POLICY IF EXISTS "Acesso universal para leitura" ON public.perfis;
  DROP POLICY IF EXISTS "Admin bypass para perfis" ON public.perfis;
  DROP POLICY IF EXISTS "Permitir todas as operações" ON public.perfis;
  
  DROP POLICY IF EXISTS "Usuários podem ver seus próprios tickets" ON public.tickets;
  DROP POLICY IF EXISTS "Administradores podem ver todos os tickets" ON public.tickets;
  DROP POLICY IF EXISTS "Usuários podem inserir seus próprios tickets" ON public.tickets;
  DROP POLICY IF EXISTS "Administradores podem atualizar qualquer ticket" ON public.tickets;
  DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios tickets pendentes" ON public.tickets;
  
  -- Criar política universal para tabela perfis
  CREATE POLICY "allow_all_perfis" ON public.perfis
    FOR ALL USING (true);
  
  -- Criar política universal para tabela tickets  
  CREATE POLICY "allow_all_tickets" ON public.tickets
    FOR ALL USING (true);
  
  -- Reativar RLS
  ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
END;
$$;

-- Executar a função
SELECT public.fix_rls_recursion();`}
                    </pre>
                  )}
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 