
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
      // Simulate validation - in a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, consider all properly formatted numbers as valid
      setValidationResult('valid');
      setIsValidating(false);
      return true;
    } catch (error) {
      setValidationResult('invalid');
      setIsValidating(false);
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o número",
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
