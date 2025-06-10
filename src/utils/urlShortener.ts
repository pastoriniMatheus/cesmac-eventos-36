
export const generateShortUrl = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const getShortUrlRedirect = (shortUrl: string, originalUrl: string) => {
  return `${window.location.origin}/r/${shortUrl}`;
};
