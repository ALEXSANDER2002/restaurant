-- Função para sincronizar tickets offline
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

-- Função para fazer backup de todos os tickets de um usuário
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

