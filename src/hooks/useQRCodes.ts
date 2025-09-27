
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildWhatsAppUrl, buildFormUrl } from '@/utils/urlShortener';

export const useQRCodes = () => {
  return useQuery({
    queryKey: ['qr_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          event:events(name, whatsapp_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateQRCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      qrCodeId, 
      trackingId, 
      eventName, 
      type, 
      whatsappNumber 
    }: { 
      qrCodeId: string; 
      trackingId: string; 
      eventName: string; 
      type: string;
      whatsappNumber?: string;
    }) => {
      // Primeiro, buscar o QR code atual para obter o event_id
      const { data: qrCodeData, error: fetchError } = await supabase
        .from('qr_codes')
        .select('event_id, type')
        .eq('id', qrCodeId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar o evento associado
      const eventUpdateData: any = { name: eventName };
      if (type === 'whatsapp' && whatsappNumber) {
        eventUpdateData.whatsapp_number = whatsappNumber;
      }

      const { error: eventError } = await supabase
        .from('events')
        .update(eventUpdateData)
        .eq('id', qrCodeData.event_id);

      if (eventError) throw eventError;

      // Gerar nova URL original baseada no tipo e novos dados
      let newOriginalUrl: string;
      if (type === 'whatsapp') {
        newOriginalUrl = buildWhatsAppUrl(whatsappNumber || '', eventName, trackingId);
      } else {
        newOriginalUrl = buildFormUrl(eventName, trackingId);
      }

      // Atualizar o QR code
      const { error: qrError } = await supabase
        .from('qr_codes')
        .update({
          tracking_id: trackingId,
          original_url: newOriginalUrl
        })
        .eq('id', qrCodeId);

      if (qrError) throw qrError;

      return { qrCodeId, trackingId, eventName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr_codes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};
