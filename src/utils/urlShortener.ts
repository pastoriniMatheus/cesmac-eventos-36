
export const generateShortUrl = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const getShortUrlRedirect = (shortUrl: string) => {
  // Usar o domínio atual sempre, não hardcodado
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
  return `${currentDomain}/r/${shortUrl}`;
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
