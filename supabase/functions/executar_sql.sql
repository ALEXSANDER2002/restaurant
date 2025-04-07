-- Esta função permite executar SQL diretamente
CREATE OR REPLACE FUNCTION executar_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

