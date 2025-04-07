-- Esta função cria a tabela perfis se ela não existir
CREATE OR REPLACE FUNCTION create_profiles_table()
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
    CREATE POLICY "Usuários podem ver seus próprios perfis"
      ON public.perfis FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Administradores podem ver todos os perfis"
      ON public.perfis FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.perfis
          WHERE id = auth.uid() AND tipo = 'admin'
        )
      );

    CREATE POLICY "Administradores podem inserir perfis"
      ON public.perfis FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.perfis
          WHERE id = auth.uid() AND tipo = 'admin'
        )
      );

    CREATE POLICY "Administradores podem atualizar perfis"
      ON public.perfis FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.perfis
          WHERE id = auth.uid() AND tipo = 'admin'
        )
      );

    CREATE POLICY "Administradores podem excluir perfis"
      ON public.perfis FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.perfis
          WHERE id = auth.uid() AND tipo = 'admin'
        )
      );

    -- Permitir inserção anônima para o primeiro cadastro
    CREATE POLICY "Permitir inserção anônima"
      ON public.perfis FOR INSERT
      WITH CHECK (true);
  END IF;
END;
$$;

