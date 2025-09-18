// Utilitários de segurança para validação de inputs

/**
 * Sanitiza string removendo caracteres perigosos
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove handlers de eventos
    .replace(/script/gi, '') // Remove script
    .substring(0, 255); // Limita tamanho
};

/**
 * Valida se o nome contém apenas caracteres permitidos
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Nome muito longo (máximo 100 caracteres)' };
  }
  
  // Permitir apenas letras, espaços, acentos e alguns caracteres especiais
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-\.]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Nome contém caracteres inválidos' };
  }
  
  return { isValid: true };
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }
  
  // Regex mais rigoroso para email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email muito longo' };
  }
  
  return { isValid: true };
};

/**
 * Valida WhatsApp (apenas números e formato brasileiro)
 */
export const validateWhatsApp = (whatsapp: string): { isValid: boolean; error?: string } => {
  if (!whatsapp) {
    return { isValid: false, error: 'WhatsApp é obrigatório' };
  }
  
  // Remover formatação
  const numbers = whatsapp.replace(/\D/g, '');
  
  // Validar formato brasileiro (11 dígitos)
  if (numbers.length !== 11) {
    return { isValid: false, error: 'WhatsApp deve ter 11 dígitos' };
  }
  
  // Verificar se começa com número válido
  if (!['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'].includes(numbers.substring(0, 2))) {
    return { isValid: false, error: 'DDD inválido' };
  }
  
  // Verificar se o nono dígito é 9 (celular)
  if (numbers[2] !== '9') {
    return { isValid: false, error: 'Número deve ser de celular (9XXXX-XXXX)' };
  }
  
  return { isValid: true };
};

/**
 * Rate limiting simples para formulários
 */
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();

export const checkRateLimit = (identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = identifier;
  
  const existing = rateLimits.get(key);
  
  if (!existing || now > existing.resetTime) {
    // Reset ou primeira vez
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (existing.count >= maxRequests) {
    return false; // Rate limit excedido
  }
  
  existing.count++;
  return true;
};

/**
 * Limpa dados sensíveis do localStorage
 */
export const clearSensitiveData = (): void => {
  const sensitiveKeys = [
    'cesmac_user',
    'form_tracking_id',
    'form_event_name',
    'scan_session_id'
  ];
  
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/**
 * Gera nonce para CSP (Content Security Policy)
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export default {
  sanitizeInput,
  validateName,
  validateEmail,
  validateWhatsApp,
  checkRateLimit,
  clearSensitiveData,
  generateNonce
};