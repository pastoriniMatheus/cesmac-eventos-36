-- Adicionar política para permitir DELETE de leads
CREATE POLICY "Allow delete leads" 
ON public.leads 
FOR DELETE 
USING (true);