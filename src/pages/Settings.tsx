import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { useCourses, useCreateCourse } from '@/hooks/useCourses';
import { useLeadStatuses, useCreateLeadStatus } from '@/hooks/useLeads';
import EditableItemManager from '@/components/EditableItemManager';
import { Copy, Code, Globe, Webhook, Database, User, MessageCircle, Palette, Image } from 'lucide-react';

const Settings = () => {
  const { data: settings, isLoading, refetch } = useSystemSettings();
  const { toast } = useToast();
  const updateSetting = useUpdateSystemSetting();
  const { data: courses } = useCourses();
  const { mutate: createCourse } = useCreateCourse();
  const { data: leadStatuses } = useLeadStatuses();
  const { mutate: createLeadStatus } = useCreateLeadStatus();

  const [webhookValidation, setWebhookValidation] = useState('');
  const [webhookMessage, setWebhookMessage] = useState('');
  const [webhookEmail, setWebhookEmail] = useState('');
  const [webhookSms, setWebhookSms] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  useEffect(() => {
    if (settings) {
      const validationSetting = settings.find(s => s.key === 'whatsapp_validation_webhook');
      const messageSetting = settings.find(s => s.key === 'whatsapp_webhook');
      const emailSetting = settings.find(s => s.key === 'email_webhook');
      const smsSetting = settings.find(s => s.key === 'sms_webhook');
      const logoSetting = settings.find(s => s.key === 'logo');
      const faviconSetting = settings.find(s => s.key === 'favicon');

      setWebhookValidation(validationSetting?.value ? String(validationSetting.value) : '');
      setWebhookMessage(messageSetting?.value ? String(messageSetting.value) : '');
      setWebhookEmail(emailSetting?.value ? String(emailSetting.value) : '');
      setWebhookSms(smsSetting?.value ? String(smsSetting.value) : '');
      setLogoUrl(logoSetting?.value ? String(logoSetting.value) : '');
      setFaviconUrl(faviconSetting?.value ? String(faviconSetting.value) : '');
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
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="statuses" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Documentação da API</span>
              </CardTitle>
              <CardDescription>
                Endpoints disponíveis para integração externa com exemplos de requisições
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {/* Captura de Leads */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <Label className="text-sm font-semibold">Captura de Leads</Label>
                  </div>
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Campos obrigatórios:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "name": "João Silva",
  "email": "joao@email.com", 
  "whatsapp": "5582999999999",
  "course_id": "uuid-do-curso",
  "event_id": "uuid-do-evento", 
  "tracking_id": "ABCD12"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Resposta de sucesso:</strong> 201 - Lead capturado com sucesso
                    </p>
                  </div>
                </div>

                {/* Validação WhatsApp */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-semibold">Validação WhatsApp</Label>
                  </div>
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Exemplo de requisição:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "whatsapp": "5582999999999",
  "validation_id": "uuid-opcional"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Resposta de validação:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "is_valid": true,
  "message": "Número válido",
  "validation_id": "uuid-gerado"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>is_valid:</strong> true = número válido, false = inválido<br/>
                      <strong>message:</strong> detalhes da validação
                    </p>
                  </div>
                </div>

                {/* Callback Validação WhatsApp */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Webhook className="h-4 w-4 text-purple-600" />
                    <Label className="text-sm font-semibold">Callback Validação WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                      POST {getSupabaseUrl()}/whatsapp-validation-callback
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${getSupabaseUrl()}/whatsapp-validation-callback`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Exemplo de callback:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "validation_id": "uuid-da-validacao",
  "is_valid": true,
  "message": "Número verificado com sucesso"
}`}
                    </div>
                  </div>
                </div>

                {/* Redirecionamento QR Code */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-orange-600" />
                    <Label className="text-sm font-semibold">Redirecionamento QR Code</Label>
                  </div>
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
                    Redireciona automaticamente para WhatsApp ou formulário. Registra scan e incrementa contador.
                  </p>
                </div>

                {/* Geração de Relatórios */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-indigo-600" />
                    <Label className="text-sm font-semibold">Geração de Relatórios</Label>
                  </div>
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Exemplo de requisição:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "event_id": "uuid-do-evento",
  "format": "csv"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>format:</strong> "csv" ou "pdf"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-5 w-5" />
                <span>Webhooks de Integração</span>
              </CardTitle>
              <CardDescription>
                Configure URLs de webhook para receber notificações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookValidation">Webhook Validação WhatsApp</Label>
                  <Input 
                    type="url" 
                    id="webhookValidation" 
                    placeholder="https://exemplo.com/whatsapp-validation" 
                    value={webhookValidation}
                    onChange={(e) => setWebhookValidation(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveSetting('whatsapp_validation_webhook', webhookValidation, 'Webhook de validação salvo!')}
                    size="sm"
                  >
                    Salvar Validação
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recebe callbacks de validação de números WhatsApp
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookMessage">Webhook Envio de Mensagens</Label>
                  <Input 
                    type="url" 
                    id="webhookMessage" 
                    placeholder="https://exemplo.com/send-message" 
                    value={webhookMessage}
                    onChange={(e) => setWebhookMessage(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveSetting('whatsapp_webhook', webhookMessage, 'Webhook de mensagens salvo!')}
                    size="sm"
                  >
                    Salvar Mensagem
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Para envio de mensagens WhatsApp em massa
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookEmail">Webhook de Email</Label>
                  <Input 
                    type="url" 
                    id="webhookEmail" 
                    placeholder="https://exemplo.com/send-email" 
                    value={webhookEmail}
                    onChange={(e) => setWebhookEmail(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveSetting('email_webhook', webhookEmail, 'Webhook de email salvo!')}
                    size="sm"
                  >
                    Salvar Email
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Para envio de emails em massa
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSms">Webhook de SMS</Label>
                  <Input 
                    type="url" 
                    id="webhookSms" 
                    placeholder="https://exemplo.com/send-sms" 
                    value={webhookSms}
                    onChange={(e) => setWebhookSms(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveSetting('sms_webhook', webhookSms, 'Webhook de SMS salvo!')}
                    size="sm"
                  >
                    Salvar SMS
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Para envio de SMS em massa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Configuração Visual</span>
              </CardTitle>
              <CardDescription>
                Configure a identidade visual do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {logoUrl && (
                    <div className="mt-4">
                      <Label>Preview do Logo:</Label>
                      <img src={logoUrl} alt="Logo preview" className="h-16 w-auto mt-2 border rounded" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">URL do Favicon</Label>
                  <Input 
                    type="url" 
                    id="faviconUrl" 
                    placeholder="https://exemplo.com/favicon.png" 
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveSetting('favicon', faviconUrl, 'Favicon salvo com sucesso!')}
                    size="sm"
                  >
                    Salvar Favicon
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Use formato PNG ou JPG. Tamanho recomendado: 32x32px
                  </p>
                  {faviconUrl && (
                    <div className="mt-4">
                      <Label>Preview do Favicon:</Label>
                      <img src={faviconUrl} alt="Favicon preview" className="h-8 w-8 mt-2 border rounded" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Gerenciamento de Cursos</span>
              </CardTitle>
              <CardDescription>
                Adicione, edite e remova os cursos oferecidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableItemManager 
                title="Novo Curso"
                description="Adicione um novo curso à lista"
                items={courses || []}
                onCreate={createCourse}
                itemName="curso"
                tableName="courses"
                queryKey={['courses']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Gerenciamento de Status de Lead</span>
              </CardTitle>
              <CardDescription>
                Adicione, edite e remova os status dos leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableItemManager 
                title="Novo Status"
                description="Adicione um novo status à lista"
                items={leadStatuses || []}
                onCreate={createLeadStatus}
                itemName="status"
                withColor
                tableName="lead_statuses"
                queryKey={['lead_statuses']}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
