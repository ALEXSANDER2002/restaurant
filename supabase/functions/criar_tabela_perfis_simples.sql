-- Esta função cria a tabela perfis de forma simplificada
CREATE OR REPLACE FUNCTION criar_tabela_perfis_simples()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se a tabela já existe
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'perfis'
  ) THEN
    -- Criar a tabela perfis
    CREATE TABLE public.perfis (
      id UUID PRIMARY KEY,
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

    -- Criar política que permite todas as operações
    CREATE POLICY "Permitir todas as operações"
      ON public.perfis FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

