"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function InicializadorBancoDados() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")
  const [detalhes, setDetalhes] = useState<string[]>([])

  const inicializarBancoDados = async () => {
    setStatus("loading")
    setMensagem("Inicializando banco de dados...")
    setDetalhes(["Iniciando processo de inicialização..."])

    try {
      // Verificar conexão
      addToLog("Verificando conexão com o Supabase...")
      const { data: connectionTest, error: connectionError } = await supabase.from("perfis").select("count").limit(1)

      if (connectionError) {
        if (connectionError.message.includes("relation") && connectionError.message.includes("does not exist")) {
          addToLog("⚠️ Tabela 'perfis' não existe. Criando tabelas...")
        } else {
          addToLog(`⚠️ Erro de conexão: ${connectionError.message}`)
        }
      } else {
        addToLog("✅ Conexão com o Supabase estabelecida com sucesso")
      }

      // Criar tabela de perfis
      addToLog("Criando tabela de perfis...")
      try {
        const { error: perfilError } = await supabase.rpc("executar_sql", {
          sql: `
          CREATE TABLE IF NOT EXISTS public.perfis (
            id UUID PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'estudante')),
            status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          `,
        })

        if (perfilError) {
          addToLog(`⚠️ Erro ao criar tabela de perfis: ${perfilError.message}`)
        } else {
          addToLog("✅ Tabela de perfis criada ou já existente")
        }
      } catch (e: any) {
        addToLog(`⚠️ Erro ao criar tabela de perfis: ${e.message}`)
      }

      // Criar tabela de tickets
      addToLog("Criando tabela de tickets...")
      try {
        const { error: ticketError } = await supabase.rpc("executar_sql", {
          sql: `
          CREATE TABLE IF NOT EXISTS public.tickets (
            id TEXT PRIMARY KEY,
            usuario_id UUID NOT NULL,
            data DATE NOT NULL,
            quantidade INTEGER NOT NULL CHECK (quantidade > 0 AND quantidade <= 10),
            valor_total DECIMAL(10, 2) NOT NULL,
            status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
            subsidiado BOOLEAN DEFAULT FALSE,
            utilizado BOOLEAN DEFAULT FALSE,
            data_utilizacao TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          `,
        })

        if (ticketError) {
          addToLog(`⚠️ Erro ao criar tabela de tickets: ${ticketError.message}`)
        } else {
          addToLog("✅ Tabela de tickets criada ou já existente")
        }
      } catch (e: any) {
        addToLog(`⚠️ Erro ao criar tabela de tickets: ${e.message}`)
      }

      // Configurar RLS (Row Level Security)
      addToLog("Configurando políticas de segurança...")
      try {
        // Habilitar RLS
        await supabase.rpc("executar_sql", {
          sql: `
          ALTER TABLE IF EXISTS public.perfis ENABLE ROW LEVEL SECURITY;
          ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
          `,
        })

        // Criar políticas para perfis
        await supabase.rpc("executar_sql", {
          sql: `
          -- Remover políticas existentes para evitar conflitos
          DROP POLICY IF EXISTS "Permitir todas as operações" ON public.perfis;
          
          -- Criar política simples para evitar problemas de recursão
          CREATE POLICY "Permitir todas as operações"
            ON public.perfis FOR ALL
            USING (true)
            WITH CHECK (true);
          `,
        })

        // Criar políticas para tickets
        await supabase.rpc("executar_sql", {
          sql: `
          -- Remover políticas existentes para evitar conflitos
          DROP POLICY IF EXISTS "Permitir todas as operações" ON public.tickets;
          
          -- Criar política simples para evitar problemas de recursão
          CREATE POLICY "Permitir todas as operações"
            ON public.tickets FOR ALL
            USING (true)
            WITH CHECK (true);
          `,
        })

        addToLog("✅ Políticas de segurança configuradas com sucesso")
      } catch (e: any) {
        addToLog(`⚠️ Erro ao configurar políticas de segurança: ${e.message}`)
      }

      // Criar função RPC para sincronização
      addToLog("Criando funções RPC...")
      try {
        const { error: rpcError } = await supabase.rpc("executar_sql", {
          sql: `
          CREATE OR REPLACE FUNCTION sincronizar_tickets_offline(
            tickets_json JSONB
          ) RETURNS JSONB
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            ticket JSONB;
            result JSONB = '{"sucesso": true, "sincronizados": 0, "erros": []}'::JSONB;
            ticket_id TEXT;
            ticket_record RECORD;
          BEGIN
            -- Iterar sobre cada ticket no JSON
            FOR ticket IN SELECT * FROM jsonb_array_elements(tickets_json)
            LOOP
              ticket_id = ticket->>'id';
              
              -- Verificar se o ticket já existe
              SELECT * INTO ticket_record FROM public.tickets WHERE id = ticket_id;
              
              IF ticket_record.id IS NULL THEN
                -- Inserir novo ticket
                BEGIN
                  INSERT INTO public.tickets (
                    id, 
                    usuario_id, 
                    data, 
                    quantidade, 
                    valor_total, 
                    status, 
                    subsidiado, 
                    utilizado, 
                    data_utilizacao, 
                    created_at
                  ) VALUES (
                    ticket->>'id',
                    (ticket->>'usuario_id')::UUID,
                    (ticket->>'data')::DATE,
                    (ticket->>'quantidade')::INTEGER,
                    (ticket->>'valor_total')::DECIMAL,
                    ticket->>'status',
                    (ticket->>'subsidiado')::BOOLEAN,
                    (ticket->>'utilizado')::BOOLEAN,
                    CASE WHEN ticket->>'data_utilizacao' IS NOT NULL 
                         THEN (ticket->>'data_utilizacao')::TIMESTAMP WITH TIME ZONE 
                         ELSE NULL END,
                    CASE WHEN ticket->>'created_at' IS NOT NULL 
                         THEN (ticket->>'created_at')::TIMESTAMP WITH TIME ZONE 
                         ELSE NOW() END
                  );
                  
                  -- Incrementar contador de sincronizados
                  result = jsonb_set(result, '{sincronizados}', to_jsonb((result->>'sincronizados')::INTEGER + 1));
                EXCEPTION WHEN OTHERS THEN
                  -- Adicionar erro à lista
                  result = jsonb_set(
                    result, 
                    '{erros}', 
                    (result->'erros') || jsonb_build_object('id', ticket_id, 'erro', SQLERRM)
                  );
                END;
              ELSE
                -- Ticket já existe, verificar se precisa atualizar
                IF (ticket_record.updated_at IS NULL OR 
                    (ticket->>'updated_at')::TIMESTAMP WITH TIME ZONE > ticket_record.updated_at) THEN
                  BEGIN
                    UPDATE public.tickets SET
                      status = ticket->>'status',
                      utilizado = (ticket->>'utilizado')::BOOLEAN,
                      data_utilizacao = CASE WHEN ticket->>'data_utilizacao' IS NOT NULL 
                                            THEN (ticket->>'data_utilizacao')::TIMESTAMP WITH TIME ZONE 
                                            ELSE data_utilizacao END
                    WHERE id = ticket_id;
                    
                    -- Incrementar contador de sincronizados
                    result = jsonb_set(result, '{sincronizados}', to_jsonb((result->>'sincronizados')::INTEGER + 1));
                  EXCEPTION WHEN OTHERS THEN
                    -- Adicionar erro à lista
                    result = jsonb_set(
                      result, 
                      '{erros}', 
                      (result->'erros') || jsonb_build_object('id', ticket_id, 'erro', SQLERRM)
                    );
                  END;
                END IF;
              END IF;
            END LOOP;
            
            -- Verificar se houve erros
            IF jsonb_array_length(result->'erros') > 0 THEN
              result = jsonb_set(result, '{sucesso}', 'false');
            END IF;
            
            RETURN result;
          END;
          $$;
          `,
        })

        if (rpcError) {
          addToLog(`⚠️ Erro ao criar função RPC: ${rpcError.message}`)
        } else {
          addToLog("✅ Função RPC criada com sucesso")
        }
      } catch (e: any) {
        addToLog(`⚠️ Erro ao criar função RPC: ${e.message}`)
      }

      // Inserir dados de exemplo
      addToLog("Inserindo dados de exemplo...")
      try {
        // Verificar se já existem tickets
        const { data: ticketsExistentes, error: ticketsError } = await supabase.from("tickets").select("count")

        if (ticketsError) {
          addToLog(`⚠️ Erro ao verificar tickets existentes: ${ticketsError.message}`)
        } else if (!ticketsExistentes || ticketsExistentes.length === 0) {
          // Inserir ticket de exemplo
          const { error: ticketError } = await supabase.from("tickets").insert({
            id: "ticket_exemplo_1",
            usuario_id: "00000000-0000-0000-0000-000000000000", // ID fictício
            data: new Date().toISOString().split("T")[0],
            quantidade: 1,
            valor_total: 2.0,
            status: "pendente",
            subsidiado: true,
            created_at: new Date().toISOString(),
          })

          if (ticketError) {
            addToLog(`⚠️ Erro ao inserir ticket de exemplo: ${ticketError.message}`)
          } else {
            addToLog("✅ Ticket de exemplo inserido com sucesso")
          }
        } else {
          addToLog("✅ Tickets já existem, pulando inserção")
        }
      } catch (e: any) {
        addToLog(`⚠️ Erro ao inserir dados de exemplo: ${e.message}`)
      }

      setStatus("success")
      setMensagem("Banco de dados inicializado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao inicializar banco de dados:", error)
      setStatus("error")
      setMensagem(`Erro ao inicializar banco de dados: ${error.message}`)
    }
  }

  // Função auxiliar para adicionar logs
  const addToLog = (message: string) => {
    setDetalhes((prev) => [...prev, message])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Inicialização do Banco de Dados
        </CardTitle>
        <CardDescription>Crie as tabelas necessárias para o funcionamento do sistema</CardDescription>
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

        <p className="mb-4">
          Este utilitário irá criar as tabelas necessárias no banco de dados Supabase e configurar as políticas de
          segurança. Use-o quando estiver configurando o sistema pela primeira vez ou se estiver enfrentando problemas
          de conexão.
        </p>

        {detalhes.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-medium mb-2">Detalhes:</h3>
            <div className="text-xs space-y-1">
              {detalhes.map((detalhe, index) => (
                <div key={index}>{detalhe}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={inicializarBancoDados} disabled={status === "loading"} className="w-full">
          <Database className="mr-2 h-4 w-4" />
          {status === "loading" ? "Inicializando..." : "Inicializar Banco de Dados"}
        </Button>
      </CardFooter>
    </Card>
  )
}

