-- Habilitar RLS nas tabelas
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem atualizar perfis" ON public.perfis;
DROP POLICY IF EXISTS "Administradores podem excluir perfis" ON public.perfis;
DROP POLICY IF EXISTS "Permitir inserção anônima" ON public.perfis;
DROP POLICY IF EXISTS "Permitir acesso a todos os perfis" ON public.perfis;
DROP POLICY IF EXISTS "Permitir todas as operações" ON public.perfis;

-- Remover políticas de tickets existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios tickets" ON public.tickets;
DROP POLICY IF EXISTS "Administradores podem ver todos os tickets" ON public.tickets;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios tickets" ON public.tickets;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer ticket" ON public.tickets;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios tickets pendentes" ON public.tickets;

-- Primeiro, criar uma política bypass para administradores nos perfis
-- Isso resolve a recursão infinita
CREATE POLICY "Admin bypass para perfis"
  ON public.perfis FOR ALL
  USING (
    (SELECT tipo FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Políticas para perfis
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

-- Políticas para tickets
-- Usuários podem ver seus próprios tickets
CREATE POLICY "Usuários podem ver seus próprios tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = usuario_id);

-- Administradores podem ver todos os tickets
CREATE POLICY "Administradores podem ver todos os tickets"
  ON public.tickets FOR SELECT
  USING (
    (SELECT tipo FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Usuários podem inserir seus próprios tickets
CREATE POLICY "Usuários podem inserir seus próprios tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Administradores podem atualizar qualquer ticket
CREATE POLICY "Administradores podem atualizar qualquer ticket"
  ON public.tickets FOR UPDATE
  USING (
    (SELECT tipo FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Usuários podem atualizar seus próprios tickets (apenas em status pendente)
CREATE POLICY "Usuários podem atualizar seus próprios tickets pendentes"
  ON public.tickets FOR UPDATE
  USING (
    auth.uid() = usuario_id AND
    status = 'pendente'
  );

-- Políticas para configurações
-- Apenas administradores podem ver configurações
CREATE POLICY "Administradores podem ver configurações"
  ON public.configuracoes FOR SELECT
  USING (
    (SELECT tipo FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Apenas administradores podem modificar configurações
CREATE POLICY "Administradores podem modificar configurações"
  ON public.configuracoes FOR ALL
  USING (
    (SELECT tipo FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

