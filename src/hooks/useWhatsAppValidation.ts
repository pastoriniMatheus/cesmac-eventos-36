
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWhatsAppValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'pending' | 'valid' | 'invalid' | null>(null);
  const { toast } = useToast();

  const validateWhatsApp = async (whatsapp: string): Promise<boolean> => {
    setIsValidating(true);
    setValidationResult('pending');

    try {
      // Verificar se webhook está configurado
      const { data: webhookSettings, error: webhookError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'whatsapp_validation_webhook')
        .single();

      if (webhookError || !webhookSettings?.value) {
        toast({
          title: "Webhook não configurado",
          description: "A validação de WhatsApp não está configurada no sistema. Entre em contato com o administrador.",
          variant: "destructive",
        });
        setValidationResult('invalid');
        return false;
      }

      // Gerar ID único para esta validação
      const validationId = crypto.randomUUID();

      // Chamar função de validação
      const { data, error } = await supabase.functions.invoke('validate-whatsapp', {
        body: {
          whatsapp: whatsapp.replace(/\D/g, ''),
          validation_id: validationId
        }
      });

      if (error) {
        console.error('Erro na validação:', error);
        toast({
          title: "Erro na conexão",
          description: "Houve problema na conexão com o webhook de validação. Tente novamente.",
          variant: "destructive",
        });
        setValidationResult('invalid');
        return false;
      }

      // Aguardar resultado da validação (polling)
      return await pollValidationResult(validationId);

    } catch (error) {
      console.error('Erro na validação de WhatsApp:', error);
      toast({
        title: "Erro na validação",
        description: "Erro interno na validação. Tente novamente.",
        variant: "destructive",
      });
      setValidationResult('invalid');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const pollValidationResult = async (validationId: string): Promise<boolean> => {
    const maxAttempts = 30; // 30 segundos
    let attempts = 0;

    return new Promise((resolve) => {
      const checkResult = async () => {
        attempts++;

        try {
          const { data: validation, error } = await supabase
            .from('whatsapp_validations')
            .select('status, response_message')
            .eq('id', validationId)
            .single();

          if (error) {
            console.error('Erro ao consultar validação:', error);
            setValidationResult('invalid');
            resolve(false);
            return;
          }

          if (validation.status === 'valid') {
            setValidationResult('valid');
            toast({
              title: "WhatsApp válido",
              description: "Número verificado com sucesso!",
            });
            resolve(true);
            return;
          }

          if (validation.status === 'invalid') {
            setValidationResult('invalid');
            toast({
              title: "WhatsApp inválido",
              description: validation.response_message || "Número não encontrado ou inválido. Por favor, corrija o número.",
              variant: "destructive",
            });
            resolve(false);
            return;
          }

          if (validation.status === 'error') {
            setValidationResult('invalid');
            toast({
              title: "Erro na validação",
              description: "Houve um erro na validação do WhatsApp. Tente novamente.",
              variant: "destructive",
            });
            resolve(false);
            return;
          }

          // Se ainda está pendente e não excedeu tentativas, tentar novamente
          if (attempts < maxAttempts && validation.status === 'pending') {
            setTimeout(checkResult, 1000); // Verificar novamente em 1 segundo
          } else {
            // Timeout
            setValidationResult('invalid');
            toast({
              title: "Timeout na validação",
              description: "A validação demorou muito para responder. Tente novamente.",
              variant: "destructive",
            });
            resolve(false);
          }

        } catch (error) {
          console.error('Erro no polling:', error);
          setValidationResult('invalid');
          resolve(false);
        }
      };

      checkResult();
    });
  };

  return {
    validateWhatsApp,
    isValidating,
    validationResult,
    setValidationResult
  };
};
