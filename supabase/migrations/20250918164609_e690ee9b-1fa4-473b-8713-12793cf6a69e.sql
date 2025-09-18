-- Função RPC para executar comandos SQL (apenas para instalação/migração)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  affected_rows INTEGER;
BEGIN
  -- Log da operação
  RAISE LOG 'Executando SQL: %', LEFT(sql_query, 100);
  
  -- Executar comando SQL
  EXECUTE sql_query;
  
  -- Obter número de linhas afetadas (se aplicável)
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'success', true,
    'affected_rows', affected_rows,
    'message', 'SQL executado com sucesso'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Retornar erro em caso de falha
  result := jsonb_build_object(
    'success', false,
    'error_code', SQLSTATE,
    'error_message', SQLERRM,
    'sql_preview', LEFT(sql_query, 100)
  );
  
  RAISE LOG 'Erro ao executar SQL: % - %', SQLSTATE, SQLERRM;
  RETURN result;
END;
$$;