-- Inserir usuários de exemplo (se não existirem)
DO $$
BEGIN
  -- Administrador
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@exemplo.com') THEN
    -- Criar usuário na autenticação
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      (SELECT instance_id FROM auth.instances LIMIT 1),
      'admin@exemplo.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"nome":"Administrador","tipo":"admin"}',
      NOW(),
      NOW()
    );
    
    -- Criar perfil
    INSERT INTO public.perfis (
      id,
      nome,
      email,
      tipo,
      status
    )
    VALUES (
      (SELECT id FROM auth.users WHERE email = 'admin@exemplo.com'),
      'Administrador',
      'admin@exemplo.com',
      'admin',
      'ativo'
    );
  END IF;
  
  -- Estudante
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'estudante@exemplo.com') THEN
    -- Criar usuário na autenticação
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      (SELECT instance_id FROM auth.instances LIMIT 1),
      'estudante@exemplo.com',
      crypt('senha123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"nome":"Estudante Exemplo","tipo":"estudante"}',
      NOW(),
      NOW()
    );
    
    -- Criar perfil
    INSERT INTO public.perfis (
      id,
      nome,
      email,
      tipo,
      status
    )
    VALUES (
      (SELECT id FROM auth.users WHERE email = 'estudante@exemplo.com'),
      'Estudante Exemplo',
      'estudante@exemplo.com',
      'estudante',
      'ativo'
    );
  END IF;
END $$;

-- Inserir tickets de exemplo
DO $$
DECLARE
  estudante_id UUID;
  admin_id UUID;
  hoje DATE := CURRENT_DATE;
  ontem DATE := CURRENT_DATE - INTERVAL '1 day';
  amanha DATE := CURRENT_DATE + INTERVAL '1 day';
BEGIN
  -- Obter IDs dos usuários
  SELECT id INTO estudante_id FROM public.perfis WHERE email = 'estudante@exemplo.com';
  SELECT id INTO admin_id FROM public.perfis WHERE email = 'admin@exemplo.com';
  
  -- Inserir tickets para o estudante
  IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE usuario_id = estudante_id LIMIT 1) THEN
    -- Ticket pago para hoje
    INSERT INTO public.tickets (
      id,
      usuario_id,
      data,
      quantidade,
      valor_total,
      status,
      subsidiado,
      utilizado,
      created_at
    )
    VALUES (
      'ticket_exemplo_1',
      estudante_id,
      hoje,
      2,
      4.00,
      'pago',
      TRUE,
      FALSE,
      NOW() - INTERVAL '2 hours'
    );
    
    -- Ticket pendente para amanhã
    INSERT INTO public.tickets (
      id,
      usuario_id,
      data,
      quantidade,
      valor_total,
      status,
      subsidiado,
      created_at
    )
    VALUES (
      'ticket_exemplo_2',
      estudante_id,
      amanha,
      1,
      2.00,
      'pendente',
      TRUE,
      NOW() - INTERVAL '1 hour'
    );
    
    -- Ticket cancelado para ontem
    INSERT INTO public.tickets (
      id,
      usuario_id,
      data,
      quantidade,
      valor_total,
      status,
      subsidiado,
      created_at
    )
    VALUES (
      'ticket_exemplo_3',
      estudante_id,
      ontem,
      3,
      6.00,
      'cancelado',
      TRUE,
      NOW() - INTERVAL '1 day'
    );
    
    -- Ticket não subsidiado
    INSERT INTO public.tickets (
      id,
      usuario_id,
      data,
      quantidade,
      valor_total,
      status,
      subsidiado,
      created_at
    )
    VALUES (
      'ticket_exemplo_4',
      estudante_id,
      amanha,
      1,
      13.00,
      'pago',
      FALSE,
      NOW() - INTERVAL '3 hours'
    );
  END IF;
  
  -- Inserir tickets para o admin (para teste)
  IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE usuario_id = admin_id LIMIT 1) THEN
    INSERT INTO public.tickets (
      id,
      usuario_id,
      data,
      quantidade,
      valor_total,
      status,
      subsidiado,
      created_at
    )
    VALUES (
      'ticket_admin_1',
      admin_id,
      hoje,
      1,
      13.00,
      'pago',
      FALSE,
      NOW() - INTERVAL '4 hours'
    );
  END IF;
END $$;

