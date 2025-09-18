import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImmediateLeadSync = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadData: any) => {
      // Buscar configurações de sincronização
      const { data: syncSettings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'sync_webhook_settings')
        .single();

      const { data: webhookSettings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'webhook_urls')
        .single();

      if (!syncSettings?.value || !webhookSettings?.value) {
        throw new Error('Configurações de sincronização não encontradas');
      }

      const config = typeof syncSettings.value === 'string' 
        ? JSON.parse(syncSettings.value) 
        : syncSettings.value;

      const webhookUrls = typeof webhookSettings.value === 'string'
        ? JSON.parse(webhookSettings.value)
        : webhookSettings.value;

      // Verificar se o envio imediato está habilitado
      if (!config.enabled || config.interval !== 'immediate' || !webhookUrls.sync) {
        return { skipped: true, reason: 'Envio imediato não configurado' };
      }

      // Enviar lead para o webhook
      const response = await fetch(webhookUrls.sync, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leads: [leadData],
          sync_mode: 'immediate',
          timestamp: new Date().toISOString(),
          total_leads: 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook falhou: ${response.status} - ${errorText}`);
      }

      const result = await response.text();
      console.log('Lead enviado imediatamente via webhook:', result);

      return { success: true, webhook_response: result };
    },
    onError: (error: any) => {
      console.error('Erro no envio imediato do lead:', error);
      // Não mostrar toast de erro para não interferir na experiência do usuário
      // O lead ainda foi salvo no banco, apenas o envio falhou
    }
  });
};