-- Esta função corrige as políticas RLS da tabela perfis para evitar recursão infinita
CREATE OR REPLACE FUNCTION fix_perfis_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desativar RLS para a tabela perfis
  ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
  
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
  -- Isso evita a recursão infinita
  CREATE POLICY "Permitir todas as operações"
    ON public.perfis FOR ALL
    USING (true)
    WITH CHECK (true);
    
  -- Reativar RLS com a nova política
  ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
END;
$$;

