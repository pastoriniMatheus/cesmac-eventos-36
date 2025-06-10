
export const generateShortUrl = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const getShortUrlRedirect = (shortUrl: string) => {
  return `${window.location.origin}/r/${shortUrl}`;
};

export const buildWhatsAppUrl = (whatsappNumber: string, eventName: string) => {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(eventName)}`;
};
