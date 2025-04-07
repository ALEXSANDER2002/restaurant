-- Esta migração corrige o problema de recursão infinita nas políticas RLS
-- removendo as políticas circulares e adicionando verificações mais eficientes.

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem atualizar perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem excluir perfis" ON public.perfis;
DROP POLICY IF EXISTS "Permitir inserção anônima" ON public.perfis;
DROP POLICY IF EXISTS "Permitir acesso a todos os perfis" ON public.perfis;
DROP POLICY IF EXISTS "Permitir todas as operações" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.perfis;
DROP POLICY IF EXISTS "Admin bypass para perfis" ON public.perfis;

-- Remover políticas de tickets existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios tickets" ON public.tickets;
DROP POLICY IF EXISTS "Administradores podem ver todos os tickets" ON public.tickets;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios tickets" ON public.tickets;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer ticket" ON public.tickets;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios tickets pendentes" ON public.tickets;

-- Política temporária para permitir acesso durante a migração
ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;

-- Primeiro, criar uma função para verificar se o usuário é admin com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis 
    WHERE id = auth.uid() AND tipo_usuario = 'admin'
  );
$$;

-- Reabilitar RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
-- Usuários sempre podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

-- Administradores podem ver todos os perfis
CREATE POLICY "Administradores podem ver todos os perfis"
  ON public.perfis FOR SELECT
  USING (public.is_admin());

-- Usuários podem atualizar seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.perfis FOR UPDATE
  USING (auth.uid() = id);

-- Administradores podem fazer qualquer operação em perfis
CREATE POLICY "Administradores podem gerenciar perfis"
  ON public.perfis FOR ALL
  USING (public.is_admin());

-- Políticas para tickets
-- Usuários podem ver seus próprios tickets
CREATE POLICY "Usuários podem ver seus próprios tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = usuario_id);

-- Administradores podem ver todos os tickets
CREATE POLICY "Administradores podem ver todos os tickets"
  ON public.tickets FOR SELECT
  USING (public.is_admin());

-- Usuários podem inserir seus próprios tickets
CREATE POLICY "Usuários podem inserir seus próprios tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Administradores podem atualizar qualquer ticket
CREATE POLICY "Administradores podem atualizar qualquer ticket"
  ON public.tickets FOR UPDATE
  USING (public.is_admin());

-- Usuários podem atualizar seus próprios tickets (apenas em status pendente)
CREATE POLICY "Usuários podem atualizar seus próprios tickets pendentes"
  ON public.tickets FOR UPDATE
  USING (
    auth.uid() = usuario_id AND
    status = 'pendente'
  ); 