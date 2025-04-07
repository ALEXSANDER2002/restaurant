"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, RefreshCw, AlertCircle, CheckCircle, Download, Upload, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useFeedback } from "@/components/feedback-usuario"

export function AdminDatabase() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")
  const [detalhes, setDetalhes] = useState<string[]>([])
  const { mostrarFeedback } = useFeedback()

  // Testar conexão com o banco de dados
  const testarConexao = async () => {
    setStatus("loading")
    setMensagem("Testando conexão com o banco de dados...")
    setDetalhes(["Iniciando teste de conexão..."])

    try {
      // Testar conexão básica
      addToLog("Testando conexão básica...")
      const { data, error } = await supabase.from("perfis").select("count").limit(1)

      if (error) {
        throw error
      }

      addToLog("✅ Conexão básica bem-sucedida")

      // Testar RPC
      addToLog("Testando funções RPC...")
      const { data: rpcData, error: rpcError } = await supabase.rpc("backup_tickets_usuario")

      if (rpcError) {
        addToLog(`⚠️ Erro ao testar RPC: ${rpcError.message}`)
      } else {
        addToLog("✅ Funções RPC funcionando corretamente")
      }

      // Testar realtime
      addToLog("Testando funcionalidades realtime...")
      const channel = supabase.channel("test-channel")

      const subscription = channel
        .on("presence", { event: "sync" }, () => {
          addToLog("✅ Realtime funcionando corretamente")
          subscription.unsubscribe()
        })
        .subscribe()

      setStatus("success")
      setMensagem("Conexão com o banco de dados estabelecida com sucesso!")
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error)
      setStatus("error")
      setMensagem(`Erro ao conectar ao banco de dados: ${error.message}`)
      addToLog(`❌ Erro: ${error.message}`)
    }
  }

  // Inicializar banco de dados
  const inicializarBancoDados = async () => {
    setStatus("loading")
    setMensagem("Inicializando banco de dados...")
    setDetalhes(["Iniciando processo de inicialização..."])

    try {
      // Executar scripts de migração
      addToLog("Criando tabelas...")

      // Criar tabela de perfis
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

      // Criar funções RPC
      addToLog("Criando funções RPC...")

      try {
        const { error: syncError } = await supabase.rpc("executar_sql", {
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
            -- Verificar se o usuário está autenticado
            IF auth.uid() IS NULL THEN
              RETURN jsonb_build_object(
                'sucesso', false,
                'mensagem', 'Usuário não autenticado'
              );
            END IF;
            
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

        if (syncError) {
          addToLog(`⚠️ Erro ao criar função de sincronização: ${syncError.message}`)
        } else {
          addToLog("✅ Função de sincronização criada com sucesso")
        }

        // Criar função de backup
        const { error: backupError } = await supabase.rpc("executar_sql", {
          sql: `
          CREATE OR REPLACE FUNCTION backup_tickets_usuario(
            usuario_id UUID DEFAULT NULL
          ) RETURNS JSONB
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            user_id UUID;
            result JSONB;
          BEGIN
            -- Determinar o ID do usuário
            IF usuario_id IS NULL THEN
              user_id := auth.uid();
            ELSE
              -- Verificar se o usuário atual é admin ou o próprio usuário
              IF NOT (
                auth.uid() = usuario_id OR
                EXISTS (
                  SELECT 1 FROM public.perfis
                  WHERE id = auth.uid() AND tipo = 'admin'
                )
              ) THEN
                RETURN jsonb_build_object(
                  'sucesso', false,
                  'mensagem', 'Permissão negada'
                );
              END IF;
              
              user_id := usuario_id;
            END IF;
            
            -- Verificar se o usuário está autenticado
            IF user_id IS NULL THEN
              RETURN jsonb_build_object(
                'sucesso', false,
                'mensagem', 'Usuário não autenticado'
              );
            END IF;
            
            -- Obter todos os tickets do usuário
            SELECT jsonb_agg(t) INTO result
            FROM (
              SELECT * FROM public.tickets
              WHERE usuario_id = user_id
              ORDER BY created_at DESC
            ) t;
            
            -- Retornar resultado
            RETURN jsonb_build_object(
              'sucesso', true,
              'tickets', COALESCE(result, '[]'::JSONB)
            );
          END;
          $$;
          `,
        })

        if (backupError) {
          addToLog(`⚠️ Erro ao criar função de backup: ${backupError.message}`)
        } else {
          addToLog("✅ Função de backup criada com sucesso")
        }
      } catch (e: any) {
        addToLog(`⚠️ Erro ao criar funções RPC: ${e.message}`)
      }

      // Configurar políticas RLS
      addToLog("Configurando políticas de segurança...")

      try {
        // Habilitar RLS
        await supabase.rpc("executar_sql", {
          sql: `
          ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
          `,
        })

        // Remover políticas existentes
        await supabase.rpc("executar_sql", {
          sql: `
          DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Administradores podem atualizar perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.perfis;
          DROP POLICY IF EXISTS "Usuários podem ver seus próprios tickets" ON public.tickets;
          DROP POLICY IF EXISTS "Administradores podem ver todos os tickets" ON public.tickets;
          DROP POLICY IF EXISTS "Usuários podem inserir seus próprios tickets" ON public.tickets;
          DROP POLICY IF EXISTS "Administradores podem atualizar qualquer ticket" ON public.tickets;
          DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios tickets pendentes" ON public.tickets;
          `,
        })

        // Criar políticas para perfis
        await supabase.rpc("executar_sql", {
          sql: `
          -- Usuários podem ver seu próprio perfil
          CREATE POLICY "Usuários podem ver seus próprios perfis"
            ON public.perfis FOR SELECT
            USING (auth.uid() = id);

          -- Administradores podem ver todos os perfis
          CREATE POLICY "Administradores podem ver todos os perfis"
            ON public.perfis FOR SELECT
            USING (
              EXISTS (
                SELECT 1 FROM public.perfis
                WHERE id = auth.uid() AND tipo = 'admin'
              )
            );

          -- Administradores podem inserir perfis
          CREATE POLICY "Administradores podem inserir perfis"
            ON public.perfis FOR INSERT
            WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.perfis
                WHERE id = auth.uid() AND tipo = 'admin'
              )
            );

          -- Administradores podem atualizar perfis
          CREATE POLICY "Administradores podem atualizar perfis"
            ON public.perfis FOR UPDATE
            USING (
              EXISTS (
                SELECT 1 FROM public.perfis
                WHERE id = auth.uid() AND tipo = 'admin'
              )
            );

          -- Usuários podem atualizar seus próprios perfis (exceto o tipo)
          CREATE POLICY "Usuários podem atualizar seus próprios perfis"
            ON public.perfis FOR UPDATE
            USING (auth.uid() = id);
          `,
        })

        // Criar políticas para tickets
        await supabase.rpc("executar_sql", {
          sql: `
          -- Usuários podem ver seus próprios tickets
          CREATE POLICY "Usuários podem ver seus próprios tickets"
            ON public.tickets FOR SELECT
            USING (auth.uid() = usuario_id);

          -- Administradores podem ver todos os tickets
          CREATE POLICY "Administradores podem ver todos os tickets"
            ON public.tickets FOR SELECT
            USING (
              EXISTS (
                SELECT 1 FROM public.perfis
                WHERE id = auth.uid() AND tipo = 'admin'
              )
            );

          -- Usuários podem inserir seus próprios tickets
          CREATE POLICY "Usuários podem inserir seus próprios tickets"
            ON public.tickets FOR INSERT
            WITH CHECK (auth.uid() = usuario_id);

          -- Administradores podem atualizar qualquer ticket
          CREATE POLICY "Administradores podem atualizar qualquer ticket"
            ON public.tickets FOR UPDATE
            USING (
              EXISTS (
                SELECT 1 FROM public.perfis
                WHERE id = auth.uid() AND tipo = 'admin'
              )
            );

          -- Usuários podem atualizar seus próprios tickets (apenas em status pendente)
          CREATE POLICY "Usuários podem atualizar seus próprios tickets pendentes"
            ON public.tickets FOR UPDATE
            USING (
              auth.uid() = usuario_id AND
              status = 'pendente'
            );
          `,
        })

        addToLog("✅ Políticas de segurança configuradas com sucesso")
      } catch (e: any) {
        addToLog(`⚠️ Erro ao configurar políticas de segurança: ${e.message}`)
      }

      // Inserir dados de exemplo
      addToLog("Inserindo dados de exemplo...")

      try {
        // Verificar se já existem usuários
        const { data: usuariosExistentes, error: usuariosError } = await supabase.from("perfis").select("count")

        if (usuariosError) {
          addToLog(`⚠️ Erro ao verificar usuários existentes: ${usuariosError.message}`)
        } else if (!usuariosExistentes || usuariosExistentes.length === 0) {
          // Inserir usuários de exemplo
          const { error: adminError } = await supabase.from("perfis").insert({
            id: crypto.randomUUID(),
            nome: "Administrador",
            email: "admin@exemplo.com",
            tipo: "admin",
            status: "ativo",
          })

          if (adminError) {
            addToLog(`⚠️ Erro ao inserir administrador: ${adminError.message}`)
          } else {
            addToLog("✅ Administrador inserido com sucesso")
          }

          const { error: estudanteError } = await supabase.from("perfis").insert({
            id: crypto.randomUUID(),
            nome: "Estudante Exemplo",
            email: "estudante@exemplo.com",
            tipo: "estudante",
            status: "ativo",
          })

          if (estudanteError) {
            addToLog(`⚠️ Erro ao inserir estudante: ${estudanteError.message}`)
          } else {
            addToLog("✅ Estudante inserido com sucesso")
          }
        } else {
          addToLog("✅ Usuários já existem, pulando inserção")
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

  // Exportar dados
  const exportarDados = async () => {
    setStatus("loading")
    setMensagem("Exportando dados...")
    setDetalhes(["Iniciando exportação de dados..."])

    try {
      // Buscar perfis
      addToLog("Buscando perfis...")
      const { data: perfis, error: perfisError } = await supabase.from("perfis").select("*")

      if (perfisError) {
        throw perfisError
      }

      // Buscar tickets
      addToLog("Buscando tickets...")
      const { data: tickets, error: ticketsError } = await supabase.from("tickets").select("*")

      if (ticketsError) {
        throw ticketsError
      }

      // Criar objeto de exportação
      const dadosExportacao = {
        data_exportacao: new Date().toISOString(),
        perfis: perfis || [],
        tickets: tickets || [],
      }

      // Converter para JSON
      const jsonString = JSON.stringify(dadosExportacao, null, 2)

      // Criar blob e link para download
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ru_dados_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addToLog("✅ Dados exportados com sucesso")
      setStatus("success")
      setMensagem("Dados exportados com sucesso!")
      mostrarFeedback("Dados exportados com sucesso!", "sucesso")
    } catch (error: any) {
      console.error("Erro ao exportar dados:", error)
      setStatus("error")
      setMensagem(`Erro ao exportar dados: ${error.message}`)
    }
  }

  // Importar dados
  const importarDados = async () => {
    // Criar input de arquivo
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setStatus("loading")
      setMensagem("Importando dados...")
      setDetalhes(["Iniciando importação de dados..."])

      try {
        // Ler arquivo
        const reader = new FileReader()

        reader.onload = async (event) => {
          try {
            const conteudo = event.target?.result as string
            const dados = JSON.parse(conteudo)

            // Verificar estrutura do arquivo
            if (!dados.perfis || !dados.tickets) {
              throw new Error("Formato de arquivo inválido")
            }

            // Importar perfis
            addToLog(`Importando ${dados.perfis.length} perfis...`)

            for (const perfil of dados.perfis) {
              try {
                const { error } = await supabase.from("perfis").upsert(perfil, { onConflict: "id" })

                if (error) {
                  addToLog(`⚠️ Erro ao importar perfil ${perfil.id}: ${error.message}`)
                }
              } catch (e: any) {
                addToLog(`⚠️ Erro ao importar perfil: ${e.message}`)
              }
            }

            // Importar tickets
            addToLog(`Importando ${dados.tickets.length} tickets...`)

            for (const ticket of dados.tickets) {
              try {
                const { error } = await supabase.from("tickets").upsert(ticket, { onConflict: "id" })

                if (error) {
                  addToLog(`⚠️ Erro ao importar ticket ${ticket.id}: ${error.message}`)
                }
              } catch (e: any) {
                addToLog(`⚠️ Erro ao importar ticket: ${e.message}`)
              }
            }

            addToLog("✅ Importação concluída")
            setStatus("success")
            setMensagem("Dados importados com sucesso!")
            mostrarFeedback("Dados importados com sucesso!", "sucesso")
          } catch (error: any) {
            console.error("Erro ao processar arquivo:", error)
            setStatus("error")
            setMensagem(`Erro ao processar arquivo: ${error.message}`)
          }
        }

        reader.onerror = () => {
          setStatus("error")
          setMensagem("Erro ao ler o arquivo")
        }

        reader.readAsText(file)
      } catch (error: any) {
        console.error("Erro ao importar dados:", error)
        setStatus("error")
        setMensagem(`Erro ao importar dados: ${error.message}`)
      }
    }

    input.click()
  }

  // Limpar banco de dados
  const limparBancoDados = async () => {
    if (!confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      return
    }

    setStatus("loading")
    setMensagem("Limpando banco de dados...")
    setDetalhes(["Iniciando limpeza do banco de dados..."])

    try {
      // Limpar tickets
      addToLog("Limpando tabela de tickets...")
      const { error: ticketsError } = await supabase.from("tickets").delete().neq("id", "placeholder")

      if (ticketsError) {
        addToLog(`⚠️ Erro ao limpar tickets: ${ticketsError.message}`)
      } else {
        addToLog("✅ Tabela de tickets limpa com sucesso")
      }

      // Limpar perfis (exceto o usuário atual)
      addToLog("Limpando tabela de perfis...")
      const { error: perfisError } = await supabase.from("perfis").delete().neq("id", "placeholder")

      if (perfisError) {
        addToLog(`⚠️ Erro ao limpar perfis: ${perfisError.message}`)
      } else {
        addToLog("✅ Tabela de perfis limpa com sucesso")
      }

      setStatus("success")
      setMensagem("Banco de dados limpo com sucesso!")
      mostrarFeedback("Banco de dados limpo com sucesso!", "sucesso")
    } catch (error: any) {
      console.error("Erro ao limpar banco de dados:", error)
      setStatus("error")
      setMensagem(`Erro ao limpar banco de dados: ${error.message}`)
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
          Administração do Banco de Dados
        </CardTitle>
        <CardDescription>Gerencie o banco de dados do Restaurante Universitário</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="inicializar">Inicializar</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="limpar">Limpar</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
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

            <p>Verifique o status da conexão com o banco de dados e as funcionalidades disponíveis.</p>

            <Button onClick={testarConexao} disabled={status === "loading"} className="w-full">
              <RefreshCw className={`mr-2 h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
              {status === "loading" ? "Testando..." : "Testar Conexão"}
            </Button>

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
          </TabsContent>

          <TabsContent value="inicializar" className="space-y-4">
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

            <p>Inicialize o banco de dados criando as tabelas necessárias, funções RPC e políticas de segurança.</p>

            <Button onClick={inicializarBancoDados} disabled={status === "loading"} className="w-full">
              <Database className="mr-2 h-4 w-4" />
              {status === "loading" ? "Inicializando..." : "Inicializar Banco de Dados"}
            </Button>

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
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
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

            <p>Exporte os dados do banco de dados para um arquivo JSON ou importe dados de um arquivo JSON.</p>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={exportarDados} disabled={status === "loading"} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {status === "loading" && mensagem.includes("Exportando") ? "Exportando..." : "Exportar Dados"}
              </Button>

              <Button onClick={importarDados} disabled={status === "loading"} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {status === "loading" && mensagem.includes("Importando") ? "Importando..." : "Importar Dados"}
              </Button>
            </div>

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
          </TabsContent>

          <TabsContent value="limpar" className="space-y-4">
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

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Esta ação irá remover todos os dados do banco de dados. Esta operação não pode ser desfeita.
              </AlertDescription>
            </Alert>

            <Button onClick={limparBancoDados} disabled={status === "loading"} variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              {status === "loading" && mensagem.includes("Limpando") ? "Limpando..." : "Limpar Banco de Dados"}
            </Button>

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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">Conectado a: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      </CardFooter>
    </Card>
  )
}

