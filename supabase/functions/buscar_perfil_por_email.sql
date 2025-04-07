-- Esta função busca um perfil por email de forma segura
CREATE OR REPLACE FUNCTION buscar_perfil_por_email(p_email TEXT)
RETURNS SETOF perfis
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM perfis WHERE email = p_email;
$$;

