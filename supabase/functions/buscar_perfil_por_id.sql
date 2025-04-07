-- Esta função busca um perfil por ID de forma segura
CREATE OR REPLACE FUNCTION buscar_perfil_por_id(p_id UUID)
RETURNS SETOF perfis
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM perfis WHERE id = p_id;
$$;

