
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWhatsAppValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const { toast } = useToast();

  const validateWhatsApp = async (phone: string): Promise<boolean> => {
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length !== 11) {
      setValidationResult('invalid');
      return false;
    }

    setIsValidating(true);
    
    try {
      // Buscar webhook de validação nas configurações
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'whatsapp_validation_webhook')
        .single();

      if (!settings?.value) {
        toast({
          title: "Erro de configuração",
          description: "Webhook de validação WhatsApp não configurado. Configure nas configurações do sistema.",
          variant: "destructive",
        });
        setIsValidating(false);
        return false;
      }

      // Gerar ID único para a validação
      const validationId = crypto.randomUUID();

      // Chamar a edge function de validação
      const { data, error } = await supabase.functions.invoke('validate-whatsapp', {
        body: {
          whatsapp: numbers,
          validation_id: validationId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Aguardar resposta da validação (polling)
      const pollValidation = async (): Promise<boolean> => {
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos máximo
        
        while (attempts < maxAttempts) {
          const { data: validation } = await supabase
            .from('whatsapp_validations')
            .select('*')
            .eq('id', validationId)
            .single();

          if (validation && validation.status !== 'pending') {
            if (validation.status === 'valid') {
              setValidationResult('valid');
              setIsValidating(false);
              return true;
            } else {
              setValidationResult('invalid');
              setIsValidating(false);
              toast({
                title: "Número inválido",
                description: validation.response_message || "Número WhatsApp não encontrado ou inválido",
                variant: "destructive",
              });
              return false;
            }
          }

          // Aguardar 1 segundo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }

        // Timeout
        toast({
          title: "Timeout na validação",
          description: "Não foi possível validar o número em tempo hábil",
          variant: "destructive",
        });
        setValidationResult('invalid');
        setIsValidating(false);
        return false;
      };

      return await pollValidation();

    } catch (error: any) {
      console.error('Erro na validação:', error);
      setValidationResult('invalid');
      setIsValidating(false);
      toast({
        title: "Erro na validação",
        description: error.message || "Não foi possível validar o número",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    validateWhatsApp,
    isValidating,
    validationResult,
    setValidationResult
  };
};
