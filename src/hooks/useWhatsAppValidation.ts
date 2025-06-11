
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
      toast({
        title: "Formato inválido",
        description: "O número deve ter 11 dígitos (DD + 9 dígitos)",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    
    try {
      console.log('🔄 Iniciando validação WhatsApp para:', numbers);

      // Buscar webhook de validação nas configurações
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'whatsapp_validation_webhook')
        .single();

      if (settingsError || !settings?.value) {
        console.log('❌ Webhook não configurado:', settingsError);
        toast({
          title: "Configuração necessária",
          description: "Configure o webhook de validação WhatsApp nas configurações do sistema para usar esta funcionalidade.",
          variant: "destructive",
        });
        setIsValidating(false);
        setValidationResult('valid'); // Permitir prosseguir sem validação se não configurado
        return true;
      }

      const webhookUrl = typeof settings.value === 'string' ? settings.value : settings.value.toString();
      console.log('✅ Webhook encontrado:', webhookUrl);

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

      // Aguardar resposta da validação com timeout
      const pollValidation = async (): Promise<boolean> => {
        let attempts = 0;
        const maxAttempts = 20; // 20 segundos máximo
        
        console.log('🔍 Iniciando polling para validação ID:', validationId);
        
        while (attempts < maxAttempts) {
          console.log(`📊 Tentativa ${attempts + 1}/${maxAttempts}`);
          
          const { data: validation, error: queryError } = await supabase
            .from('whatsapp_validations')
            .select('*')
            .eq('id', validationId)
            .maybeSingle();

          if (queryError) {
            console.error('❌ Erro na consulta:', queryError);
          } else if (validation) {
            console.log('📋 Status da validação:', validation.status);
            
            if (validation.status !== 'pending') {
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
          }

          // Aguardar 1 segundo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }

        // Timeout - permitir prosseguir
        console.log('⏰ Timeout na validação - permitindo prosseguir');
        toast({
          title: "Timeout na validação",
          description: "Não foi possível validar o número em tempo hábil, mas você pode prosseguir.",
          variant: "default",
        });
        setValidationResult('valid');
        setIsValidating(false);
        return true;
      };

      return await pollValidation();

    } catch (error: any) {
      console.error('💥 Erro na validação:', error);
      setIsValidating(false);
      
      // Em caso de erro, permitir prosseguir mas avisar o usuário
      let errorMessage = "Erro na validação, mas você pode prosseguir";
      if (error.message?.includes('Webhook')) {
        errorMessage = "Serviço de validação indisponível. Você pode prosseguir.";
      }
      
      toast({
        title: "Aviso",
        description: errorMessage,
        variant: "default",
      });
      
      setValidationResult('valid'); // Permitir prosseguir em caso de erro
      return true;
    }
  };

  return {
    validateWhatsApp,
    isValidating,
    validationResult,
    setValidationResult
  };
};
