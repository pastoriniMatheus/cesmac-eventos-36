
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
      console.log('🔄 Iniciando validação WhatsApp...');

      // Buscar webhook de validação nas configurações
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'whatsapp_validation_webhook')
        .single();

      if (!settings?.value) {
        console.log('❌ Webhook não configurado');
        toast({
          title: "Erro de configuração",
          description: "Webhook de validação WhatsApp não configurado. Configure nas configurações do sistema.",
          variant: "destructive",
        });
        setIsValidating(false);
        return false;
      }

      console.log('✅ Webhook encontrado:', settings.value);

      // Gerar ID único para a validação
      const validationId = crypto.randomUUID();
      console.log('🆔 ID de validação gerado:', validationId);

      // Chamar a edge function de validação
      const { data, error } = await supabase.functions.invoke('validate-whatsapp', {
        body: {
          whatsapp: numbers,
          validation_id: validationId
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message || 'Erro na função de validação');
      }

      console.log('✅ Edge function retornou:', data);

      // Aguardar resposta da validação com timeout melhorado
      const pollValidation = async (): Promise<boolean> => {
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos máximo
        
        console.log('🔍 Iniciando polling para validação ID:', validationId);
        
        while (attempts < maxAttempts) {
          console.log(`📊 Tentativa ${attempts + 1}/${maxAttempts}`);
          
          const { data: validation, error: queryError } = await supabase
            .from('whatsapp_validations')
            .select('*')
            .eq('id', validationId)
            .single();

          if (queryError) {
            console.error('❌ Erro na consulta:', queryError);
          } else {
            console.log('📋 Status da validação:', validation?.status);
          }

          if (validation && validation.status !== 'pending') {
            console.log('🎯 Validação finalizada:', validation.status);
            
            if (validation.status === 'valid') {
              setValidationResult('valid');
              setIsValidating(false);
              console.log('✅ Número validado com sucesso!');
              return true;
            } else {
              setValidationResult('invalid');
              setIsValidating(false);
              console.log('❌ Número inválido:', validation.response_message);
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
        console.log('⏰ Timeout na validação');
        toast({
          title: "Timeout na validação",
          description: "Não foi possível validar o número em tempo hábil. Tente novamente.",
          variant: "destructive",
        });
        setValidationResult('invalid');
        setIsValidating(false);
        return false;
      };

      return await pollValidation();

    } catch (error: any) {
      console.error('💥 Erro na validação:', error);
      setValidationResult('invalid');
      setIsValidating(false);
      
      // Mostrar erro mais específico se disponível
      let errorMessage = "Não foi possível validar o número";
      if (error.message?.includes('Webhook error')) {
        errorMessage = "Erro no serviço de validação. Verifique a configuração do webhook.";
      }
      
      toast({
        title: "Erro na validação",
        description: errorMessage,
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
