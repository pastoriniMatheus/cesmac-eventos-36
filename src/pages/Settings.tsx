import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { useFormSettings, useUpdateFormSetting } from '@/hooks/useFormSettings';
import { useCourses, useCreateCourse } from '@/hooks/useCourses';
import { useLeadStatuses, useCreateLeadStatus } from '@/hooks/useLeads';
import EditableItemManager from '@/components/EditableItemManager';
import { Copy, Code, Globe, Webhook, Database, User, MessageCircle, Palette, Image, FileText, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { data: settings, isLoading, refetch } = useSystemSettings();
  const { data: formSettings, refetch: refetchFormSettings } = useFormSettings();
  const { toast } = useToast();
  const updateSetting = useUpdateSystemSetting();
  const updateFormSetting = useUpdateFormSetting();
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
  const [formThankYouTitle, setFormThankYouTitle] = useState('');
  const [formThankYouMessage, setFormThankYouMessage] = useState('');

  // Database configuration states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // Form color configuration states
  const [formBgColor, setFormBgColor] = useState('');
  const [formPrimaryColor, setFormPrimaryColor] = useState('');
  const [formSecondaryColor, setFormSecondaryColor] = useState('');
  const [formTextColor, setFormTextColor] = useState('');

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

      // Database settings
      const urlSetting = settings.find(s => s.key === 'supabase_url');
      const keySetting = settings.find(s => s.key === 'supabase_key');
      setSupabaseUrl(urlSetting?.value ? String(urlSetting.value) : 'https://dobtquebpcnzjisftcfh.supabase.co');
      setSupabaseKey(keySetting?.value ? String(keySetting.value) : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnRxdWVicGNuemppc2Z0Y2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzcyNTMsImV4cCI6MjA2NTE1MzI1M30.GvPd5cEdgmAZG-Jsch66mdX24QNosV12Tz-F1Af93_0');

      // Form colors
      const bgColorSetting = settings.find(s => s.key === 'form_bg_color');
      const primaryColorSetting = settings.find(s => s.key === 'form_primary_color');
      const secondaryColorSetting = settings.find(s => s.key === 'form_secondary_color');
      const textColorSetting = settings.find(s => s.key === 'form_text_color');

      setFormBgColor(bgColorSetting?.value ? String(bgColorSetting.value) : '#1e40af');
      setFormPrimaryColor(primaryColorSetting?.value ? String(primaryColorSetting.value) : '#2563eb');
      setFormSecondaryColor(secondaryColorSetting?.value ? String(secondaryColorSetting.value) : '#3b82f6');
      setFormTextColor(textColorSetting?.value ? String(textColorSetting.value) : '#ffffff');
    }
  }, [settings]);

  useEffect(() => {
    if (formSettings) {
      const titleSetting = formSettings.find(s => s.key === 'form_thank_you_title');
      const messageSetting = formSettings.find(s => s.key === 'form_thank_you_message');

      setFormThankYouTitle(titleSetting?.value ? String(titleSetting.value) : '');
      setFormThankYouMessage(messageSetting?.value ? String(messageSetting.value) : '');
    }
  }, [formSettings]);

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

  const handleSaveFormSetting = async (key: string, value: string, successMessage: string) => {
    try {
      await updateFormSetting.mutateAsync({ key, value });
      toast({
        title: "Configuração salva",
        description: successMessage,
      });
      refetchFormSettings();
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
    return supabaseUrl ? `${supabaseUrl}/functions/v1` : 'https://dobtquebpcnzjisftcfh.supabase.co/functions/v1';
  };

  const handleDatabaseBackup = async () => {
    try {
      toast({
        title: "Iniciando backup",
        description: "O download do banco de dados será iniciado em breve...",
      });
      // Implementar lógica de backup aqui
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer backup do banco de dados",
        variant: "destructive",
      });
    }
  };

  const handleDatabaseRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Restauração iniciada",
        description: "O arquivo do banco de dados está sendo processado...",
      });
      // Implementar lógica de restore aqui
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Formulário
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
                    <p className="text-xs text-muted-foreground font-medium">Autenticação: Não requer token</p>
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

                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-semibold">Validação WhatsApp - Iniciar</Label>
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
                    <p className="text-xs text-muted-foreground font-medium">Autenticação: Não requer token</p>
                    <p className="text-xs text-muted-foreground font-medium">Exemplo de requisição:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "whatsapp": "5582999999999",
  "validation_id": "uuid-opcional"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Resposta:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "success": true,
  "validation_id": "uuid-gerado",
  "message": "Validation request sent"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Nota:</strong> Este endpoint inicia o processo de validação. O resultado será enviado para o callback configurado no webhook.
                    </p>
                  </div>
                </div>

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
                    <p className="text-xs text-muted-foreground font-medium">Autenticação: Não requer token</p>
                    <p className="text-xs text-muted-foreground font-medium">Corpo da requisição (enviado pelo seu webhook externo):</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "validation_id": "uuid-da-validacao",
  "is_valid": true,
  "message": "Número verificado com sucesso"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Resposta:</p>
                    <div className="bg-slate-50 p-3 rounded text-xs font-mono">
{`{
  "success": true,
  "message": "Validation updated successfully"
}`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Fluxo:</strong> 1) Sistema chama seu webhook → 2) Seu webhook valida → 3) Seu webhook chama este callback
                    </p>
                  </div>
                </div>

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
                    <strong>Autenticação:</strong> Não requer token<br/>
                    Redireciona automaticamente para WhatsApp ou formulário. Registra scan e incrementa contador.
                  </p>
                </div>

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
                    <p className="text-xs text-muted-foreground font-medium">Autenticação: Requer token JWT</p>
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

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Configuração do Banco de Dados</span>
              </CardTitle>
              <CardDescription>
                Configure a conexão com o banco de dados Supabase e gerencie backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl">URL do Supabase</Label>
                  <Input 
                    type="url" 
                    id="supabaseUrl" 
                    placeholder="https://seuproject.supabase.co" 
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL completa do seu projeto Supabase
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabaseKey">Chave Pública do Supabase</Label>
                  <Input 
                    type="password" 
                    id="supabaseKey" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Chave pública (anon) do seu projeto Supabase
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      handleSaveSetting('supabase_url', supabaseUrl, 'URL do Supabase salva!');
                      handleSaveSetting('supabase_key', supabaseKey, 'Chave do Supabase salva!');
                    }}
                    className="flex-1"
                  >
                    Salvar Configurações
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Gerenciamento de Dados</h3>
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleDatabaseBackup}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Banco de Dados
                    </Button>
                    
                    <div className="relative">
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => document.getElementById('database-upload')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Enviar Banco de Dados
                      </Button>
                      <input
                        id="database-upload"
                        type="file"
                        accept=".sql,.json"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleDatabaseRestore}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Faça backup regularmente e use arquivos .sql ou .json para restauração
                  </p>
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

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Configurações do Formulário</span>
              </CardTitle>
              <CardDescription>
                Personalize as mensagens, cores e configurações do formulário de captura de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="formThankYouTitle">Título da Tela de Agradecimento</Label>
                  <Input 
                    id="formThankYouTitle" 
                    placeholder="Obrigado!" 
                    value={formThankYouTitle}
                    onChange={(e) => setFormThankYouTitle(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveFormSetting('form_thank_you_title', formThankYouTitle, 'Título salvo com sucesso!')}
                    size="sm"
                  >
                    Salvar Título
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Título exibido na tela de agradecimento após envio do formulário
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formThankYouMessage">Mensagem da Tela de Agradecimento</Label>
                  <Textarea 
                    id="formThankYouMessage" 
                    placeholder="Seus dados foram enviados com sucesso. Entraremos em contato em breve!" 
                    value={formThankYouMessage}
                    onChange={(e) => setFormThankYouMessage(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={() => handleSaveFormSetting('form_thank_you_message', formThankYouMessage, 'Mensagem salva com sucesso!')}
                    size="sm"
                  >
                    Salvar Mensagem
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Mensagem completa exibida na tela de agradecimento após envio do formulário
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Configuração de Cores do Formulário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="formBgColor">Cor de Fundo</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          id="formBgColor" 
                          value={formBgColor}
                          onChange={(e) => setFormBgColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input 
                          type="text" 
                          placeholder="#1e40af" 
                          value={formBgColor}
                          onChange={(e) => setFormBgColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button 
                        onClick={() => handleSaveSetting('form_bg_color', formBgColor, 'Cor de fundo salva!')}
                        size="sm"
                      >
                        Salvar Cor de Fundo
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formPrimaryColor">Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          id="formPrimaryColor" 
                          value={formPrimaryColor}
                          onChange={(e) => setFormPrimaryColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input 
                          type="text" 
                          placeholder="#2563eb" 
                          value={formPrimaryColor}
                          onChange={(e) => setFormPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button 
                        onClick={() => handleSaveSetting('form_primary_color', formPrimaryColor, 'Cor primária salva!')}
                        size="sm"
                      >
                        Salvar Cor Primária
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formSecondaryColor">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          id="formSecondaryColor" 
                          value={formSecondaryColor}
                          onChange={(e) => setFormSecondaryColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input 
                          type="text" 
                          placeholder="#3b82f6" 
                          value={formSecondaryColor}
                          onChange={(e) => setFormSecondaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button 
                        onClick={() => handleSaveSetting('form_secondary_color', formSecondaryColor, 'Cor secundária salva!')}
                        size="sm"
                      >
                        Salvar Cor Secundária
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formTextColor">Cor do Texto</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          id="formTextColor" 
                          value={formTextColor}
                          onChange={(e) => setFormTextColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input 
                          type="text" 
                          placeholder="#ffffff" 
                          value={formTextColor}
                          onChange={(e) => setFormTextColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button 
                        onClick={() => handleSaveSetting('form_text_color', formTextColor, 'Cor do texto salva!')}
                        size="sm"
                      >
                        Salvar Cor do Texto
                      </Button>
                    </div>
                  </div>
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
