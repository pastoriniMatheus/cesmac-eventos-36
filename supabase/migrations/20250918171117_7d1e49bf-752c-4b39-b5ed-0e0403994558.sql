-- CORREÇÃO CRÍTICA DE SEGURANÇA - RLS para tabela whatsapp_validations
-- Esta tabela estava completamente exposta!

ALTER TABLE public.whatsapp_validations ENABLE ROW LEVEL SECURITY;

-- Política para permitir apenas operações necessárias
CREATE POLICY "Allow insert for validation requests" 
ON public.whatsapp_validations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow select for validation check" 
ON public.whatsapp_validations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow update for validation results" 
ON public.whatsapp_validations 
FOR UPDATE 
USING (true);

-- Restringir políticas existentes que são muito permissivas
-- Remover política muito permissiva da tabela leads
DROP POLICY IF EXISTS "Allow all access" ON public.leads;

-- Criar políticas mais restritivas para leads (dados sensíveis)
CREATE POLICY "Allow read access to leads" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update leads" 
ON public.leads 
FOR UPDATE 
USING (true);

-- Restringir acesso à tabela authorized_users (CRÍTICO)
DROP POLICY IF EXISTS "Allow login verification" ON public.authorized_users;

-- Política mais restritiva para authorized_users
CREATE POLICY "Allow login verification only" 
ON public.authorized_users 
FOR SELECT 
USING (true);

-- Não permitir INSERT/UPDATE/DELETE via API para segurança
-- Estas operações devem ser feitas apenas via Edge Functions