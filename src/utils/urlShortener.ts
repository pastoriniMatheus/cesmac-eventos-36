
export const generateShortUrl = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const getShortUrlRedirect = (shortUrl: string) => {
  // Usar a função edge function do Supabase para redirecionamento
  return `https://dobtquebpcnzjisftcfh.supabase.co/functions/v1/qr-redirect/${shortUrl}`;
};

export const buildWhatsAppUrl = (whatsappNumber: string, eventName: string, trackingId?: string): string => {
  let message = eventName;
  
  if (trackingId) {
    message += ` id:${trackingId}`;
  }
  
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

// Função para obter o domínio atual dinamicamente
export const getCurrentDomain = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Para SSR ou contextos sem window, usar uma URL padrão ou vazia
  return '';
};

// Função para construir URL de redirecionamento para QR codes WhatsApp
export const buildQRRedirectUrl = (shortUrl: string): string => {
  return `https://dobtquebpcnzjisftcfh.supabase.co/functions/v1/qr-redirect/${shortUrl}`;
};

// Função para construir URL do formulário com domínio atual
export const buildFormUrl = (eventName: string, trackingId: string): string => {
  const currentDomain = getCurrentDomain();
  if (!currentDomain) {
    // Fallback para URL estática se não conseguir obter o domínio atual
    return `https://16392f28-253d-4401-9269-5672f0e9ac6a.lovableproject.com/form?event=${encodeURIComponent(eventName)}&tracking=${trackingId}`;
  }
  return `${currentDomain}/form?event=${encodeURIComponent(eventName)}&tracking=${trackingId}`;
};
