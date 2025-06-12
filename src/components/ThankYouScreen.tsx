
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useFormSettings } from '@/hooks/useSystemSettings';

interface ThankYouScreenProps {
  logoUrl: string;
  onBack: () => void;
}

const ThankYouScreen = ({ logoUrl, onBack }: ThankYouScreenProps) => {
  const { thankYouTitle, thankYouMessage } = useFormSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8 px-6">
            {/* Logo do sistema */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <img
                  src={logoUrl}
                  alt="Logo CESMAC"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>
            
            {/* Ícone de sucesso */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="h-12 w-12" />
              </div>
            </div>
            
            <CardTitle className="text-2xl md:text-3xl font-bold text-emerald-900 mb-2">
              {thankYouTitle}
            </CardTitle>
            <CardDescription className="text-gray-700 text-base leading-relaxed">
              {thankYouMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full h-12 text-lg border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYouScreen;
