
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

// Nova função para obter o domínio atual dinamicamente
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
