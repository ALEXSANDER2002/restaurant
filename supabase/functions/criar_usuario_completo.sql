-- Esta função cria um usuário completo (auth + perfil)
CREATE OR REPLACE FUNCTION criar_usuario_completo(
  p_email TEXT,
  p_senha TEXT,
  p_nome TEXT,
  p_tipo TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result RECORD;
BEGIN
  -- Verificar se a tabela perfis existe
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'perfis'
  ) THEN
    -- Criar a tabela perfis
    CREATE TABLE public.perfis (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'estudante')),
      status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Adicionar comentário à tabela
    COMMENT ON TABLE public.perfis IS 'Perfis de usuários do sistema';

    -- Configurar RLS (Row Level Security)
    ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

    -- Criar políticas de acesso
    CREATE POLICY "Permitir acesso a todos os perfis"
      ON public.perfis FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Criar o usuário na autenticação
  v_user_id := gen_random_uuid();
  
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
    v_user_id,
    (SELECT instance_id FROM auth.instances LIMIT 1),
    p_email,
    crypt(p_senha, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('nome', p_nome, 'tipo', p_tipo),
    NOW(),
    NOW()
  )
  RETURNING * INTO v_result;

  -- Criar o perfil do usuário
  INSERT INTO public.perfis (id, nome, email, tipo, status)
  VALUES (v_user_id, p_nome, p_email, p_tipo, 'ativo');

  -- Retornar o resultado
  RETURN json_build_object(
    'id', v_user_id,
    'email', p_email,
    'nome', p_nome,
    'tipo', p_tipo
  );
END;
$$;

