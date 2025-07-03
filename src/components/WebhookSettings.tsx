
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Webhook, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WebhookSettings = () => {
  const [webhooks, setWebhooks] = useState({
    whatsapp: 'https://n8n.intrategica.com.br/webhook-test/disparos',
    email: 'https://n8n.intrategica.com.br/webhook-test/disparos',
    sms: 'https://n8n.intrategica.com.br/webhook-test/disparos',
    whatsappValidation: 'https://n8n-wh.intrategica.com.br/webhook/qrcode-cesmac'
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Webhooks salvos",
      description: "Configurações de webhooks atualizadas com sucesso!",
    });
  };

  const handleChange = (field: string, value: string) => {
    setWebhooks(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Webhook className="h-5 w-5" />
          <span>Configuração de Webhooks</span>
        </CardTitle>
        <CardDescription>
          Configure as URLs dos webhooks para diferentes tipos de mensagens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-whatsapp">Webhook WhatsApp</Label>
            <Input
              id="webhook-whatsapp"
              value={webhooks.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="https://exemplo.com/webhook/whatsapp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-email">Webhook Email</Label>
            <Input
              id="webhook-email"
              value={webhooks.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="https://exemplo.com/webhook/email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-sms">Webhook SMS</Label>
            <Input
              id="webhook-sms"
              value={webhooks.sms}
              onChange={(e) => handleChange('sms', e.target.value)}
              placeholder="https://exemplo.com/webhook/sms"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-validation">Webhook de Verificação WhatsApp</Label>
            <Input
              id="webhook-validation"
              value={webhooks.whatsappValidation}
              onChange={(e) => handleChange('whatsappValidation', e.target.value)}
              placeholder="https://exemplo.com/webhook/validation"
            />
            <p className="text-sm text-muted-foreground">
              URL para validar números de WhatsApp antes do envio
            </p>
          </div>
        </div>

        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Webhooks
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
