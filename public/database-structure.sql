-- ====================================================================
-- ESTRUTURA COMPLETA DO BANCO DE DADOS
-- Lead Management System - Versão de Instalação
-- ====================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ====================================================================
-- TABELAS PRINCIPAIS
-- ====================================================================

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pós-graduações
CREATE TABLE IF NOT EXISTS public.postgraduate_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de status de leads
CREATE TABLE IF NOT EXISTS public.lead_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de QR codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID,
  short_url TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  scans INTEGER NOT NULL DEFAULT 0,
  tracking_id TEXT,
  type TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de sessões de scan
CREATE TABLE IF NOT EXISTS public.scan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID,
  event_id UUID,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  lead_id UUID,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  course_id UUID,
  event_id UUID,
  status_id UUID,
  shift TEXT CHECK (shift IN ('manhã', 'tarde', 'noite')),
  scan_session_id UUID,
  postgraduate_course_id UUID,
  course_type TEXT DEFAULT 'course',
  source TEXT DEFAULT 'form',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de templates de mensagem
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de mensagens
CREATE TABLE IF NOT EXISTS public.message_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  filter_type TEXT CHECK (filter_type IN ('course', 'event', 'all')),
  filter_value TEXT,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending', 'sending')) DEFAULT 'pending',
  webhook_response TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de validações de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de usuários autorizados
CREATE TABLE IF NOT EXISTS public.authorized_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================================
-- FOREIGN KEYS
-- ====================================================================

-- Adicionar foreign keys se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'qr_codes_event_id_fkey'
  ) THEN
    ALTER TABLE public.qr_codes ADD CONSTRAINT qr_codes_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'scan_sessions_qr_code_id_fkey'
  ) THEN
    ALTER TABLE public.scan_sessions ADD CONSTRAINT scan_sessions_qr_code_id_fkey 
    FOREIGN KEY (qr_code_id) REFERENCES public.qr_codes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'scan_sessions_event_id_fkey'
  ) THEN
    ALTER TABLE public.scan_sessions ADD CONSTRAINT scan_sessions_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'scan_sessions_lead_id_fkey'
  ) THEN
    ALTER TABLE public.scan_sessions ADD CONSTRAINT scan_sessions_lead_id_fkey 
    FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_course_id_fkey'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_event_id_fkey'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES public.events(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_status_id_fkey'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_status_id_fkey 
    FOREIGN KEY (status_id) REFERENCES public.lead_statuses(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_scan_session_id_fkey'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_scan_session_id_fkey 
    FOREIGN KEY (scan_session_id) REFERENCES public.scan_sessions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_postgraduate_course_id_fkey'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_postgraduate_course_id_fkey 
    FOREIGN KEY (postgraduate_course_id) REFERENCES public.postgraduate_courses(id);
  END IF;
END
$$;

-- ====================================================================
-- ÍNDICES
-- ====================================================================

-- Índices para QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_tracking_id ON public.qr_codes(tracking_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_type ON public.qr_codes(type);

-- Índices para scan sessions
CREATE INDEX IF NOT EXISTS idx_scan_sessions_qr_code_id ON public.scan_sessions(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scan_sessions_event_id ON public.scan_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_sessions_converted ON public.scan_sessions(converted);
CREATE INDEX IF NOT EXISTS idx_scan_sessions_scanned_at ON public.scan_sessions(scanned_at);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_scan_session_id ON public.leads(scan_session_id);

-- Índices para validações de WhatsApp
CREATE INDEX IF NOT EXISTS idx_whatsapp_validations_status ON public.whatsapp_validations(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_validations_created_at ON public.whatsapp_validations(created_at);

-- ====================================================================
-- FUNÇÕES
-- ====================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = public;

-- Função para verificar login
CREATE OR REPLACE FUNCTION public.verify_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(success BOOLEAN, user_data JSON)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record public.authorized_users%ROWTYPE;
BEGIN
  SELECT * INTO user_record 
  FROM public.authorized_users 
  WHERE username = p_username 
  AND password_hash = crypt(p_password, password_hash);
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      true as success,
      json_build_object(
        'id', user_record.id,
        'username', user_record.username,
        'email', user_record.email
      ) as user_data;
  ELSE
    RETURN QUERY SELECT false as success, null::json as user_data;
  END IF;
END;
$$;

-- Função RPC para acessar scan_sessions
CREATE OR REPLACE FUNCTION get_scan_sessions()
RETURNS TABLE (
  id UUID,
  qr_code_id UUID,
  event_id UUID,
  lead_id UUID,
  scanned_at TIMESTAMP WITH TIME ZONE,
  user_agent TEXT,
  ip_address TEXT,
  qr_code JSON,
  event JSON,
  lead JSON
) 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.id,
    ss.qr_code_id,
    ss.event_id,
    ss.lead_id,
    ss.scanned_at,
    ss.user_agent,
    ss.ip_address,
    to_json(row(qr.short_url)) as qr_code,
    to_json(row(e.name)) as event,
    to_json(row(l.name, l.email)) as lead
  FROM scan_sessions ss
  LEFT JOIN qr_codes qr ON ss.qr_code_id = qr.id
  LEFT JOIN events e ON ss.event_id = e.id
  LEFT JOIN leads l ON ss.lead_id = l.id
  ORDER BY ss.scanned_at DESC;
END;
$$;

-- Função para executar SQL (instalação)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  affected_rows INTEGER;
BEGIN
  EXECUTE sql_query;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  result := jsonb_build_object(
    'success', true,
    'affected_rows', affected_rows,
    'message', 'SQL executado com sucesso'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  result := jsonb_build_object(
    'success', false,
    'error_code', SQLSTATE,
    'error_message', SQLERRM
  );
  
  RETURN result;
END;
$$;

-- Funções para cron (sincronização)
CREATE OR REPLACE FUNCTION public.cron_schedule(name text, cron text, command text)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  SELECT cron.schedule(name, cron, command);
$$;

CREATE OR REPLACE FUNCTION public.cron_unschedule(name text)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  SELECT cron.unschedule(name);
$$;

-- ====================================================================
-- TRIGGERS
-- ====================================================================

-- Triggers para atualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_leads_updated_at'
  ) THEN
    CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_system_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postgraduate_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_validations ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- POLÍTICAS RLS
-- ====================================================================

-- Criar políticas se não existirem
DO $$
BEGIN
  -- Políticas para permitir acesso público (temporário)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'courses') THEN
    CREATE POLICY "Allow all access" ON public.courses FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'postgraduate_courses') THEN
    CREATE POLICY "Allow all access" ON public.postgraduate_courses FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'lead_statuses') THEN
    CREATE POLICY "Allow all access" ON public.lead_statuses FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'events') THEN
    CREATE POLICY "Allow all access" ON public.events FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'qr_codes') THEN
    CREATE POLICY "Allow all access" ON public.qr_codes FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'leads') THEN
    CREATE POLICY "Allow all access" ON public.leads FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'message_templates') THEN
    CREATE POLICY "Allow all access" ON public.message_templates FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'message_history') THEN
    CREATE POLICY "Allow all access" ON public.message_history FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'system_settings') THEN
    CREATE POLICY "Allow all access" ON public.system_settings FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to scan_sessions' AND tablename = 'scan_sessions') THEN
    CREATE POLICY "Allow all access to scan_sessions" 
    ON public.scan_sessions 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow login verification' AND tablename = 'authorized_users') THEN
    CREATE POLICY "Allow login verification" 
    ON public.authorized_users
    FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'whatsapp_validations') THEN
    CREATE POLICY "Allow all access" ON public.whatsapp_validations FOR ALL USING (true);
  END IF;
END
$$;

-- ====================================================================
-- DADOS INICIAIS
-- ====================================================================

-- Inserir status padrão se não existirem
INSERT INTO public.lead_statuses (name, color) VALUES 
('Novo', '#3b82f6'),
('Contatado', '#f59e0b'),
('Interessado', '#10b981'),
('Matriculado', '#059669'),
('Não Interessado', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Configurações padrão do sistema
INSERT INTO public.system_settings (key, value) VALUES 
('webhook_url', '""'),
('webhook_secret', '""'),
('sync_interval', '"manual"'),
('whatsapp_validation_url', '""'),
('default_course_type', '"course"'),
('form_title', '"Formulário de Captação de Leads"'),
('form_description', '"Preencha os dados para receber mais informações"')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- FIM DA INSTALAÇÃO
-- ====================================================================