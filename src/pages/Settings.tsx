
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { useCourses, useCreateCourse } from '@/hooks/useCourses';
import { useLeadStatuses, useCreateLeadStatus } from '@/hooks/useLeads';
import ItemManager from '@/components/ItemManager';
import { Copy, Code, Globe } from 'lucide-react';

const Settings = () => {
  const { data: settings, isLoading, refetch } = useSystemSettings();
  const { toast } = useToast();
  const updateSetting = useUpdateSystemSetting();
  const { data: courses } = useCourses();
  const { mutate: createCourse } = useCreateCourse();
  const { data: leadStatuses } = useLeadStatuses();
  const { mutate: createLeadStatus } = useCreateLeadStatus();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [validationWebhook, setValidationWebhook] = useState('');
  const [emailWebhook, setEmailWebhook] = useState('');
  const [smsWebhook, setSmsWebhook] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (settings) {
      const whatsappSetting = settings.find(s => s.key === 'whatsapp_number');
      const templateSetting = settings.find(s => s.key === 'message_template');
      const webhookSetting = settings.find(s => s.key === 'whatsapp_webhook');
      const validationSetting = settings.find(s => s.key === 'whatsapp_validation_webhook');
      const emailSetting = settings.find(s => s.key === 'email_webhook');
      const smsSetting = settings.find(s => s.key === 'sms_webhook');
      const logoSetting = settings.find(s => s.key === 'logo');

      setWhatsappNumber(whatsappSetting?.value ? String(whatsappSetting.value) : '');
      setMessageTemplate(templateSetting?.value ? String(templateSetting.value) : '');
      setWebhookUrl(webhookSetting?.value ? String(webhookSetting.value) : '');
      setValidationWebhook(validationSetting?.value ? String(validationSetting.value) : '');
      setEmailWebhook(emailSetting?.value ? String(emailSetting.value) : '');
      setSmsWebhook(smsSetting?.value ? String(smsSetting.value) : '');
      setLogoUrl(logoSetting?.value ? String(logoSetting.value) : '');
    }
  }, [settings]);

  const handleSaveSetting = async (key: string, value: string, successMessage: string) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({
        title: "Configuração salva",
        description: successMessage,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: "URL copiada para a área de transferência.",
      });
    });
  };

  const getSupabaseUrl = () => {
    return 'https://dobtquebpcnzjisftcfh.supabase.co/functions/v1';
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
      
      {/* API Endpoints Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Documentação da API</span>
          </CardTitle>
          <CardDescription>
            Endpoints disponíveis para integração externa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Captura de Leads</Label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                  POST {getSupabaseUrl()}/lead-capture
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${getSupabaseUrl()}/lead-capture`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Endpoint para capturar leads via formulário. Aceita: name, email, whatsapp, course_id, event_id, tracking_id
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Validação WhatsApp</Label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                  POST {getSupabaseUrl()}/validate-whatsapp
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${getSupabaseUrl()}/validate-whatsapp`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Endpoint para validar números de WhatsApp. Aceita: whatsapp, validation_id
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Redirecionamento QR Code</Label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                  GET {getSupabaseUrl()}/qr-redirect/[short_url]
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${getSupabaseUrl()}/qr-redirect/`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Endpoint para redirecionamento de URLs encurtadas dos QR Codes para WhatsApp
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Geração de Relatórios</Label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                  POST {getSupabaseUrl()}/generate-event-report
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${getSupabaseUrl()}/generate-event-report`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Endpoint para gerar relatórios de eventos. Aceita: event_id, format (csv/pdf)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do WhatsApp</CardTitle>
          <CardDescription>
            Configure o número do WhatsApp e o template de mensagem padrão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
              <Input 
                type="tel" 
                id="whatsappNumber" 
                placeholder="5511999999999" 
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
              <Button 
                onClick={() => handleSaveSetting('whatsapp_number', whatsappNumber, 'Número do WhatsApp salvo com sucesso!')}
                size="sm"
              >
                Salvar Número
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageTemplate">Template de Mensagem</Label>
              <Input 
                type="text" 
                id="messageTemplate" 
                placeholder="Olá, tudo bem?" 
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
              />
              <Button 
                onClick={() => handleSaveSetting('message_template', messageTemplate, 'Template de mensagem salvo com sucesso!')}
                size="sm"
              >
                Salvar Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Webhooks</CardTitle>
          <CardDescription>
            Configure URLs de webhook para integrações externas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook do WhatsApp</Label>
              <Input 
                type="url" 
                id="webhookUrl" 
                placeholder="https://exemplo.com/webhook" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button 
                onClick={() => handleSaveSetting('whatsapp_webhook', webhookUrl, 'Webhook do WhatsApp salvo com sucesso!')}
                size="sm"
              >
                Salvar Webhook
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validationWebhook">Webhook de Validação WhatsApp</Label>
              <Input 
                type="url" 
                id="validationWebhook" 
                placeholder="https://exemplo.com/validate" 
                value={validationWebhook}
                onChange={(e) => setValidationWebhook(e.target.value)}
              />
              <Button 
                onClick={() => handleSaveSetting('whatsapp_validation_webhook', validationWebhook, 'Webhook de validação salvo com sucesso!')}
                size="sm"
              >
                Salvar Validação
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailWebhook">Webhook de Email</Label>
              <Input 
                type="url" 
                id="emailWebhook" 
                placeholder="https://exemplo.com/email" 
                value={emailWebhook}
                onChange={(e) => setEmailWebhook(e.target.value)}
              />
              <Button 
                onClick={() => handleSaveSetting('email_webhook', emailWebhook, 'Webhook de email salvo com sucesso!')}
                size="sm"
              >
                Salvar Email
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smsWebhook">Webhook de SMS</Label>
              <Input 
                type="url" 
                id="smsWebhook" 
                placeholder="https://exemplo.com/sms" 
                value={smsWebhook}
                onChange={(e) => setSmsWebhook(e.target.value)}
              />
              <Button 
                onClick={() => handleSaveSetting('sms_webhook', smsWebhook, 'Webhook de SMS salvo com sucesso!')}
                size="sm"
              >
                Salvar SMS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Logo</CardTitle>
          <CardDescription>
            Configure a URL do logo do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input 
              type="url" 
              id="logoUrl" 
              placeholder="https://exemplo.com/logo.png" 
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <Button 
              onClick={() => handleSaveSetting('logo', logoUrl, 'Logo salvo com sucesso!')}
              size="sm"
            >
              Salvar Logo
            </Button>
          </div>
          {logoUrl && (
            <div className="mt-4">
              <Label>Preview do Logo:</Label>
              <img src={logoUrl} alt="Logo preview" className="h-16 w-auto mt-2 border rounded" />
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Course Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Cursos</CardTitle>
          <CardDescription>
            Adicione e gerencie os cursos oferecidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemManager 
            title="Novo Curso"
            description="Adicione um novo curso à lista"
            items={courses || []}
            onCreate={createCourse}
            itemName="curso"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Lead Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Status de Lead</CardTitle>
          <CardDescription>
            Adicione e gerencie os status dos leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemManager 
            title="Novo Status"
            description="Adicione um novo status à lista"
            items={leadStatuses || []}
            onCreate={createLeadStatus}
            itemName="status"
            withColor
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
