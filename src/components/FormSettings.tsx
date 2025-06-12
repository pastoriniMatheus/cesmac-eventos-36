
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFormSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { Loader2, Save } from 'lucide-react';

const FormSettings = () => {
  const { toast } = useToast();
  const { thankYouTitle, thankYouMessage } = useFormSettings();
  const { mutate: updateSetting, isPending } = useUpdateSystemSetting();
  
  const [title, setTitle] = useState(thankYouTitle);
  const [message, setMessage] = useState(thankYouMessage);

  const handleSave = async () => {
    try {
      // Salvar título
      await new Promise((resolve, reject) => {
        updateSetting(
          { key: 'form_thank_you_title', value: title },
          {
            onSuccess: resolve,
            onError: reject
          }
        );
      });

      // Salvar mensagem
      await new Promise((resolve, reject) => {
        updateSetting(
          { key: 'form_thank_you_message', value: message },
          {
            onSuccess: resolve,
            onError: reject
          }
        );
      });

      toast({
        title: "Configurações salvas",
        description: "As configurações do formulário foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Formulário</CardTitle>
        <CardDescription>
          Personalize a mensagem de agradecimento exibida após o envio do formulário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="thank-you-title">Título da tela de agradecimento</Label>
          <Input
            id="thank-you-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Obrigado!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thank-you-message">Mensagem de agradecimento</Label>
          <Textarea
            id="thank-you-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Seus dados foram enviados com sucesso. Entraremos em contato em breve!"
            rows={4}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormSettings;
