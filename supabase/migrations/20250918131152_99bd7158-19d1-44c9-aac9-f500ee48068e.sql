-- Habilitar extensão pg_cron para agendamento de tarefas
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Habilitar extensão pg_net para fazer requisições HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para agendar cron jobs (se não existir)
CREATE OR REPLACE FUNCTION cron_schedule(name text, cron text, command text)
RETURNS void
LANGUAGE sql
AS $$
  SELECT cron.schedule(name, cron, command);
$$;

-- Função para desagendar cron jobs (se não existir)
CREATE OR REPLACE FUNCTION cron_unschedule(name text)
RETURNS void
LANGUAGE sql
AS $$
  SELECT cron.unschedule(name);
$$;