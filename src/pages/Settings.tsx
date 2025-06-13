
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
  const [formRedirectUrl, setFormRedirectUrl] = useState('');

  // Database configuration states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // Form text configuration states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formNameLabel, setFormNameLabel] = useState('');
  const [formNamePlaceholder, setFormNamePlaceholder] = useState('');
  const [formEmailLabel, setFormEmailLabel] = useState('');
  const [formEmailPlaceholder, setFormEmailPlaceholder] = useState('');
  const [formWhatsappLabel, setFormWhatsappLabel] = useState('');
  const [formWhatsappPlaceholder, setFormWhatsappPlaceholder] = useState('');
  const [formCourseLabel, setFormCourseLabel] = useState('');
  const [formCoursePlaceholder, setFormCoursePlaceholder] = useState('');
  const [formEventLabel, setFormEventLabel] = useState('');
  const [formEventPlaceholder, setFormEventPlaceholder] = useState('');
  const [formButtonText, setFormButtonText] = useState('');
  const [formPrivacyText, setFormPrivacyText] = useState('');

  // Form color configuration states
  const [formBgColor, setFormBgColor] = useState('');
  const [formContainerBgColor, setFormContainerBgColor] = useState('');
  const [formPrimaryColor, setFormPrimaryColor] = useState('');
  const [formSecondaryColor, setFormSecondaryColor] = useState('');
  const [formTextColor, setFormTextColor] = useState('');
  const [formLabelColor, setFormLabelColor] = useState('');
  const [formInputBgColor, setFormInputBgColor] = useState('');
  const [formInputBorderColor, setFormInputBorderColor] = useState('');
  const [formInputTextColor, setFormInputTextColor] = useState('');
  const [formSelectColor, setFormSelectColor] = useState('');
  const [formSelectBgColor, setFormSelectBgColor] = useState('');
  const [formSelectTextColor, setFormSelectTextColor] = useState('');
  const [formButtonColor, setFormButtonColor] = useState('');
  const [formButtonHoverColor, setFormButtonHoverColor] = useState('');
  const [formButtonTextColor, setFormButtonTextColor] = useState('');
  const [formErrorColor, setFormErrorColor] = useState('');
  const [formSuccessColor, setFormSuccessColor] = useState('');
  const [formBorderColor, setFormBorderColor] = useState('');
  const [formShadowColor, setFormShadowColor] = useState('');

  // System color configuration states
  const [systemPrimaryColor, setSystemPrimaryColor] = useState('');
  const [systemSecondaryColor, setSystemSecondaryColor] = useState('');
  const [systemAccentColor, setSystemAccentColor] = useState('');
  const [systemBackgroundColor, setSystemBackgroundColor] = useState('');
  const [systemForegroundColor, setSystemForegroundColor] = useState('');
  const [systemMutedColor, setSystemMutedColor] = useState('');

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

      // Form text settings
      const titleSetting = settings.find(s => s.key === 'form_title');
      const subtitleSetting = settings.find(s => s.key === 'form_subtitle');
      const nameLabelSetting = settings.find(s => s.key === 'form_name_label');
      const namePlaceholderSetting = settings.find(s => s.key === 'form_name_placeholder');
      const emailLabelSetting = settings.find(s => s.key === 'form_email_label');
      const emailPlaceholderSetting = settings.find(s => s.key === 'form_email_placeholder');
      const whatsappLabelSetting = settings.find(s => s.key === 'form_whatsapp_label');
      const whatsappPlaceholderSetting = settings.find(s => s.key === 'form_whatsapp_placeholder');
      const courseLabelSetting = settings.find(s => s.key === 'form_course_label');
      const coursePlaceholderSetting = settings.find(s => s.key === 'form_course_placeholder');
      const eventLabelSetting = settings.find(s => s.key === 'form_event_label');
      const eventPlaceholderSetting = settings.find(s => s.key === 'form_event_placeholder');
      const buttonTextSetting = settings.find(s => s.key === 'form_button_text');
      const privacyTextSetting = settings.find(s => s.key === 'form_privacy_text');

      setFormTitle(titleSetting?.value ? String(titleSetting.value) : 'Cadastre-se Agora');
      setFormSubtitle(subtitleSetting?.value ? String(subtitleSetting.value) : 'Preencha os dados abaixo para se inscrever');
      setFormNameLabel(nameLabelSetting?.value ? String(nameLabelSetting.value) : 'Nome Completo');
      setFormNamePlaceholder(namePlaceholderSetting?.value ? String(namePlaceholderSetting.value) : 'Digite seu nome completo');
      setFormEmailLabel(emailLabelSetting?.value ? String(emailLabelSetting.value) : 'E-mail');
      setFormEmailPlaceholder(emailPlaceholderSetting?.value ? String(emailPlaceholderSetting.value) : 'Digite seu e-mail');
      setFormWhatsappLabel(whatsappLabelSetting?.value ? String(whatsappLabelSetting.value) : 'WhatsApp');
      setFormWhatsappPlaceholder(whatsappPlaceholderSetting?.value ? String(whatsappPlaceholderSetting.value) : '(11) 99999-9999');
      setFormCourseLabel(courseLabelSetting?.value ? String(courseLabelSetting.value) : 'Curso de Interesse');
      setFormCoursePlaceholder(coursePlaceholderSetting?.value ? String(coursePlaceholderSetting.value) : 'Selecione um curso');
      setFormEventLabel(eventLabelSetting?.value ? String(eventLabelSetting.value) : 'Evento');
      setFormEventPlaceholder(eventPlaceholderSetting?.value ? String(eventPlaceholderSetting.value) : 'Selecione um evento');
      setFormButtonText(buttonTextSetting?.value ? String(buttonTextSetting.value) : 'Cadastrar');
      setFormPrivacyText(privacyTextSetting?.value ? String(privacyTextSetting.value) : 'Ao enviar este formulário, você concorda com nossa política de privacidade.');

      // Form colors
      const bgColorSetting = settings.find(s => s.key === 'form_bg_color');
      const containerBgColorSetting = settings.find(s => s.key === 'form_container_bg_color');
      const primaryColorSetting = settings.find(s => s.key === 'form_primary_color');
      const secondaryColorSetting = settings.find(s => s.key === 'form_secondary_color');
      const textColorSetting = settings.find(s => s.key === 'form_text_color');
      const labelColorSetting = settings.find(s => s.key === 'form_label_color');
      const inputBgColorSetting = settings.find(s => s.key === 'form_input_bg_color');
      const inputBorderColorSetting = settings.find(s => s.key === 'form_input_border_color');
      const inputTextColorSetting = settings.find(s => s.key === 'form_input_text_color');
      const selectColorSetting = settings.find(s => s.key === 'form_select_color');
      const selectBgColorSetting = settings.find(s => s.key === 'form_select_bg_color');
      const selectTextColorSetting = settings.find(s => s.key === 'form_select_text_color');
      const buttonColorSetting = settings.find(s => s.key === 'form_button_color');
      const buttonHoverColorSetting = settings.find(s => s.key === 'form_button_hover_color');
      const buttonTextColorSetting = settings.find(s => s.key === 'form_button_text_color');
      const errorColorSetting = settings.find(s => s.key === 'form_error_color');
      const successColorSetting = settings.find(s => s.key === 'form_success_color');
      const borderColorSetting = settings.find(s => s.key === 'form_border_color');
      const shadowColorSetting = settings.find(s => s.key === 'form_shadow_color');

      setFormBgColor(bgColorSetting?.value ? String(bgColorSetting.value) : '#1e40af');
      setFormContainerBgColor(containerBgColorSetting?.value ? String(containerBgColorSetting.value) : '#ffffff');
      setFormPrimaryColor(primaryColorSetting?.value ? String(primaryColorSetting.value) : '#2563eb');
      setFormSecondaryColor(secondaryColorSetting?.value ? String(secondaryColorSetting.value) : '#3b82f6');
      setFormTextColor(textColorSetting?.value ? String(textColorSetting.value) : '#1f2937');
      setFormLabelColor(labelColorSetting?.value ? String(labelColorSetting.value) : '#374151');
      setFormInputBgColor(inputBgColorSetting?.value ? String(inputBgColorSetting.value) : '#ffffff');
      setFormInputBorderColor(inputBorderColorSetting?.value ? String(inputBorderColorSetting.value) : '#d1d5db');
      setFormInputTextColor(inputTextColorSetting?.value ? String(inputTextColorSetting.value) : '#1f2937');
      setFormSelectColor(selectColorSetting?.value ? String(selectColorSetting.value) : '#374151');
      setFormSelectBgColor(selectBgColorSetting?.value ? String(selectBgColorSetting.value) : '#ffffff');
      setFormSelectTextColor(selectTextColorSetting?.value ? String(selectTextColorSetting.value) : '#1f2937');
      setFormButtonColor(buttonColorSetting?.value ? String(buttonColorSetting.value) : '#10b981');
      setFormButtonHoverColor(buttonHoverColorSetting?.value ? String(buttonHoverColorSetting.value) : '#059669');
      setFormButtonTextColor(buttonTextColorSetting?.value ? String(buttonTextColorSetting.value) : '#ffffff');
      setFormErrorColor(errorColorSetting?.value ? String(errorColorSetting.value) : '#ef4444');
      setFormSuccessColor(successColorSetting?.value ? String(successColorSetting.value) : '#10b981');
      setFormBorderColor(borderColorSetting?.value ? String(borderColorSetting.value) : '#e5e7eb');
      setFormShadowColor(shadowColorSetting?.value ? String(shadowColorSetting.value) : '#00000020');

      // System colors
      const sysPrimaryColorSetting = settings.find(s => s.key === 'system_primary_color');
      const sysSecondaryColorSetting = settings.find(s => s.key === 'system_secondary_color');
      const sysAccentColorSetting = settings.find(s => s.key === 'system_accent_color');
      const sysBackgroundColorSetting = settings.find(s => s.key === 'system_background_color');
      const sysForegroundColorSetting = settings.find(s => s.key === 'system_foreground_color');
      const sysMutedColorSetting = settings.find(s => s.key === 'system_muted_color');

      setSystemPrimaryColor(sysPrimaryColorSetting?.value ? String(sysPrimaryColorSetting.value) : '#2563eb');
      setSystemSecondaryColor(sysSecondaryColorSetting?.value ? String(sysSecondaryColorSetting.value) : '#fbbf24');
      setSystemAccentColor(sysAccentColorSetting?.value ? String(sysAccentColorSetting.value) : '#fbbf24');
      setSystemBackgroundColor(sysBackgroundColorSetting?.value ? String(sysBackgroundColorSetting.value) : '#ffffff');
      setSystemForegroundColor(sysForegroundColorSetting?.value ? String(sysForegroundColorSetting.value) : '#0f172a');
      setSystemMutedColor(sysMutedColorSetting?.value ? String(sysMutedColorSetting.value) : '#f1f5f9');
    }
  }, [settings]);

  useEffect(() => {
    if (formSettings) {
      const titleSetting = formSettings.find(s => s.key === 'form_thank_you_title');
      const messageSetting = formSettings.find(s => s.key === 'form_thank_you_message');
      const redirectSetting = formSettings.find(s => s.key === 'form_redirect_url');

      setFormThankYouTitle(titleSetting?.value ? String(titleSetting.value) : '');
      setFormThankYouMessage(messageSetting?.value ? String(messageSetting.value) : '');
      setFormRedirectUrl(redirectSetting?.value ? String(redirectSetting.value) : '');
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
        description: "Gerando arquivo de backup do banco de dados...",
      });

      // Define table names with proper typing
      const tableNames = ['leads', 'courses', 'events', 'lead_statuses', 'qr_codes', 'whatsapp_validations', 'system_settings'] as const;
      const backupData: any = {
        timestamp: new Date().toISOString(),
        tables: {}
      };

      for (const tableName of tableNames) {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) {
          console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
          continue;
        }
        backupData.tables[tableName] = data;
      }

      // Criar arquivo para download
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-database-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup concluído",
        description: "Arquivo de backup baixado com sucesso!",
      });
    } catch (error) {
      console.error('Erro no backup:', error);
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
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          toast({
            title: "Restauração iniciada",
            description: "Processando arquivo de backup...",
          });

          // Implementar lógica de restore aqui
          // Por segurança, apenas mostrar que está processando
          console.log('Dados do backup:', backupData);
          
          toast({
            title: "Aviso",
            description: "Funcionalidade de restore em desenvolvimento. Contate o suporte para restauração manual.",
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Arquivo de backup inválido",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
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
                        accept=".json"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleDatabaseRestore}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Faça backup regularmente e use arquivos .json para restauração
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
                Configure a identidade visual e cores do sistema
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

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Cores do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="systemPrimaryColor">Cor Primária do Sistema</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="systemPrimaryColor" 
                        value={systemPrimaryColor}
                        onChange={(e) => setSystemPrimaryColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#2563eb" 
                        value={systemPrimaryColor}
                        onChange={(e) => setSystemPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('system_primary_color', systemPrimaryColor, 'Cor primária do sistema salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemSecondaryColor">Cor Secundária do Sistema</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="systemSecondaryColor" 
                        value={systemSecondaryColor}
                        onChange={(e) => setSystemSecondaryColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#fbbf24" 
                        value={systemSecondaryColor}
                        onChange={(e) => setSystemSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('system_secondary_color', systemSecondaryColor, 'Cor secundária do sistema salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemAccentColor">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="systemAccentColor" 
                        value={systemAccentColor}
                        onChange={(e) => setSystemAccentColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#fbbf24" 
                        value={systemAccentColor}
                        onChange={(e) => setSystemAccentColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('system_accent_color', systemAccentColor, 'Cor de destaque salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemBackgroundColor">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="systemBackgroundColor" 
                        value={systemBackgroundColor}
                        onChange={(e) => setSystemBackgroundColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#ffffff" 
                        value={systemBackgroundColor}
                        onChange={(e) => setSystemBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('system_background_color', systemBackgroundColor, 'Cor de fundo salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemForegroundColor">Cor do Texto Principal</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="systemForegroundColor" 
                        value={systemForegroundColor}
                        onChange={(e) => setSystemForegroundColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#0f172a" 
                        value={systemForegroundColor}
                        onChange={(e) => setSystemForegroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('system_foreground_color', systemForegroundColor, 'Cor do texto principal salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemMutedColor">Cor do Texto Secundário</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="systemMutedColor" 
                        value={systemMutedColor}
                        onChange={(e) => setSystemMutedColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#f1f5f9" 
                        value={systemMutedColor}
                        onChange={(e) => setSystemMutedColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('system_muted_color', systemMutedColor, 'Cor do texto secundário salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>
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
                Personalize todos os textos, cores e configurações do formulário de captura de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Textos e Títulos */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Textos e Títulos do Formulário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="formTitle">Título Principal</Label>
                    <Input 
                      id="formTitle" 
                      placeholder="Cadastre-se Agora" 
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_title', formTitle, 'Título principal salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formSubtitle">Subtítulo</Label>
                    <Input 
                      id="formSubtitle" 
                      placeholder="Preencha os dados abaixo para se inscrever" 
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_subtitle', formSubtitle, 'Subtítulo salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formNameLabel">Label do Campo Nome</Label>
                    <Input 
                      id="formNameLabel" 
                      placeholder="Nome Completo" 
                      value={formNameLabel}
                      onChange={(e) => setFormNameLabel(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_name_label', formNameLabel, 'Label do nome salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formNamePlaceholder">Placeholder do Campo Nome</Label>
                    <Input 
                      id="formNamePlaceholder" 
                      placeholder="Digite seu nome completo" 
                      value={formNamePlaceholder}
                      onChange={(e) => setFormNamePlaceholder(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_name_placeholder', formNamePlaceholder, 'Placeholder do nome salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formEmailLabel">Label do Campo E-mail</Label>
                    <Input 
                      id="formEmailLabel" 
                      placeholder="E-mail" 
                      value={formEmailLabel}
                      onChange={(e) => setFormEmailLabel(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_email_label', formEmailLabel, 'Label do e-mail salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formEmailPlaceholder">Placeholder do Campo E-mail</Label>
                    <Input 
                      id="formEmailPlaceholder" 
                      placeholder="Digite seu e-mail" 
                      value={formEmailPlaceholder}
                      onChange={(e) => setFormEmailPlaceholder(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_email_placeholder', formEmailPlaceholder, 'Placeholder do e-mail salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formWhatsappLabel">Label do Campo WhatsApp</Label>
                    <Input 
                      id="formWhatsappLabel" 
                      placeholder="WhatsApp" 
                      value={formWhatsappLabel}
                      onChange={(e) => setFormWhatsappLabel(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_whatsapp_label', formWhatsappLabel, 'Label do WhatsApp salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formWhatsappPlaceholder">Placeholder do Campo WhatsApp</Label>
                    <Input 
                      id="formWhatsappPlaceholder" 
                      placeholder="(11) 99999-9999" 
                      value={formWhatsappPlaceholder}
                      onChange={(e) => setFormWhatsappPlaceholder(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_whatsapp_placeholder', formWhatsappPlaceholder, 'Placeholder do WhatsApp salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formCourseLabel">Label do Campo Curso</Label>
                    <Input 
                      id="formCourseLabel" 
                      placeholder="Curso de Interesse" 
                      value={formCourseLabel}
                      onChange={(e) => setFormCourseLabel(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_course_label', formCourseLabel, 'Label do curso salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formCoursePlaceholder">Placeholder do Campo Curso</Label>
                    <Input 
                      id="formCoursePlaceholder" 
                      placeholder="Selecione um curso" 
                      value={formCoursePlaceholder}
                      onChange={(e) => setFormCoursePlaceholder(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_course_placeholder', formCoursePlaceholder, 'Placeholder do curso salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formEventLabel">Label do Campo Evento</Label>
                    <Input 
                      id="formEventLabel" 
                      placeholder="Evento" 
                      value={formEventLabel}
                      onChange={(e) => setFormEventLabel(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_event_label', formEventLabel, 'Label do evento salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formEventPlaceholder">Placeholder do Campo Evento</Label>
                    <Input 
                      id="formEventPlaceholder" 
                      placeholder="Selecione um evento" 
                      value={formEventPlaceholder}
                      onChange={(e) => setFormEventPlaceholder(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_event_placeholder', formEventPlaceholder, 'Placeholder do evento salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formButtonText">Texto do Botão de Envio</Label>
                    <Input 
                      id="formButtonText" 
                      placeholder="Cadastrar" 
                      value={formButtonText}
                      onChange={(e) => setFormButtonText(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_button_text', formButtonText, 'Texto do botão salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="formPrivacyText">Texto de Política de Privacidade</Label>
                    <Textarea 
                      id="formPrivacyText" 
                      placeholder="Ao enviar este formulário, você concorda com nossa política de privacidade." 
                      value={formPrivacyText}
                      onChange={(e) => setFormPrivacyText(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={() => handleSaveSetting('form_privacy_text', formPrivacyText, 'Texto de privacidade salvo!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tela de Agradecimento */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Tela de Agradecimento</h3>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formRedirectUrl">Link de Redirecionamento</Label>
                    <Input 
                      type="url"
                      id="formRedirectUrl" 
                      placeholder="https://exemplo.com/whatsapp" 
                      value={formRedirectUrl}
                      onChange={(e) => setFormRedirectUrl(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSaveFormSetting('form_redirect_url', formRedirectUrl, 'Link de redirecionamento salvo!')}
                      size="sm"
                    >
                      Salvar Link
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Link que será aberto quando o usuário clicar no botão da tela de agradecimento
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuração de Cores Completa */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Configuração Completa de Cores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Cores Gerais */}
                  <div className="space-y-2">
                    <Label htmlFor="formBgColor">Cor de Fundo da Página</Label>
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
                      onClick={() => handleSaveSetting('form_bg_color', formBgColor, 'Cor de fundo da página salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formContainerBgColor">Cor de Fundo do Formulário</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formContainerBgColor" 
                        value={formContainerBgColor}
                        onChange={(e) => setFormContainerBgColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#ffffff" 
                        value={formContainerBgColor}
                        onChange={(e) => setFormContainerBgColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_container_bg_color', formContainerBgColor, 'Cor de fundo do formulário salva!')}
                      size="sm"
                    >
                      Salvar
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
                      Salvar
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
                      Salvar
                    </Button>
                  </div>

                  {/* Cores de Texto */}
                  <div className="space-y-2">
                    <Label htmlFor="formTextColor">Cor do Texto Principal</Label>
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
                        placeholder="#1f2937" 
                        value={formTextColor}
                        onChange={(e) => setFormTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_text_color', formTextColor, 'Cor do texto principal salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formLabelColor">Cor dos Labels</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formLabelColor" 
                        value={formLabelColor}
                        onChange={(e) => setFormLabelColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#374151" 
                        value={formLabelColor}
                        onChange={(e) => setFormLabelColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_label_color', formLabelColor, 'Cor dos labels salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  {/* Cores dos Campos de Input */}
                  <div className="space-y-2">
                    <Label htmlFor="formInputBgColor">Cor de Fundo dos Campos</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formInputBgColor" 
                        value={formInputBgColor}
                        onChange={(e) => setFormInputBgColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#ffffff" 
                        value={formInputBgColor}
                        onChange={(e) => setFormInputBgColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_input_bg_color', formInputBgColor, 'Cor de fundo dos campos salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formInputBorderColor">Cor da Borda dos Campos</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formInputBorderColor" 
                        value={formInputBorderColor}
                        onChange={(e) => setFormInputBorderColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#d1d5db" 
                        value={formInputBorderColor}
                        onChange={(e) => setFormInputBorderColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_input_border_color', formInputBorderColor, 'Cor da borda dos campos salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formInputTextColor">Cor do Texto dos Campos</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formInputTextColor" 
                        value={formInputTextColor}
                        onChange={(e) => setFormInputTextColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#1f2937" 
                        value={formInputTextColor}
                        onChange={(e) => setFormInputTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_input_text_color', formInputTextColor, 'Cor do texto dos campos salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  {/* Cores das Listas Suspensas */}
                  <div className="space-y-2">
                    <Label htmlFor="formSelectColor">Cor da Lista Suspensa</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formSelectColor" 
                        value={formSelectColor}
                        onChange={(e) => setFormSelectColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#374151" 
                        value={formSelectColor}
                        onChange={(e) => setFormSelectColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_select_color', formSelectColor, 'Cor da lista suspensa salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formSelectBgColor">Cor de Fundo da Lista Suspensa</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formSelectBgColor" 
                        value={formSelectBgColor}
                        onChange={(e) => setFormSelectBgColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#ffffff" 
                        value={formSelectBgColor}
                        onChange={(e) => setFormSelectBgColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_select_bg_color', formSelectBgColor, 'Cor de fundo da lista suspensa salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formSelectTextColor">Cor do Texto da Lista Suspensa</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formSelectTextColor" 
                        value={formSelectTextColor}
                        onChange={(e) => setFormSelectTextColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#1f2937" 
                        value={formSelectTextColor}
                        onChange={(e) => setFormSelectTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_select_text_color', formSelectTextColor, 'Cor do texto da lista suspensa salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  {/* Cores do Botão */}
                  <div className="space-y-2">
                    <Label htmlFor="formButtonColor">Cor do Botão de Envio</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formButtonColor" 
                        value={formButtonColor}
                        onChange={(e) => setFormButtonColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#10b981" 
                        value={formButtonColor}
                        onChange={(e) => setFormButtonColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_button_color', formButtonColor, 'Cor do botão salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formButtonHoverColor">Cor do Botão ao Passar o Mouse</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formButtonHoverColor" 
                        value={formButtonHoverColor}
                        onChange={(e) => setFormButtonHoverColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#059669" 
                        value={formButtonHoverColor}
                        onChange={(e) => setFormButtonHoverColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_button_hover_color', formButtonHoverColor, 'Cor do botão hover salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formButtonTextColor">Cor do Texto do Botão</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formButtonTextColor" 
                        value={formButtonTextColor}
                        onChange={(e) => setFormButtonTextColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#ffffff" 
                        value={formButtonTextColor}
                        onChange={(e) => setFormButtonTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_button_text_color', formButtonTextColor, 'Cor do texto do botão salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  {/* Cores de Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="formErrorColor">Cor de Erro</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formErrorColor" 
                        value={formErrorColor}
                        onChange={(e) => setFormErrorColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#ef4444" 
                        value={formErrorColor}
                        onChange={(e) => setFormErrorColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_error_color', formErrorColor, 'Cor de erro salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formSuccessColor">Cor de Sucesso</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formSuccessColor" 
                        value={formSuccessColor}
                        onChange={(e) => setFormSuccessColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#10b981" 
                        value={formSuccessColor}
                        onChange={(e) => setFormSuccessColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_success_color', formSuccessColor, 'Cor de sucesso salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  {/* Cores de Layout */}
                  <div className="space-y-2">
                    <Label htmlFor="formBorderColor">Cor das Bordas</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formBorderColor" 
                        value={formBorderColor}
                        onChange={(e) => setFormBorderColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#e5e7eb" 
                        value={formBorderColor}
                        onChange={(e) => setFormBorderColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_border_color', formBorderColor, 'Cor das bordas salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formShadowColor">Cor da Sombra</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        id="formShadowColor" 
                        value={formShadowColor}
                        onChange={(e) => setFormShadowColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input 
                        type="text" 
                        placeholder="#00000020" 
                        value={formShadowColor}
                        onChange={(e) => setFormShadowColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('form_shadow_color', formShadowColor, 'Cor da sombra salva!')}
                      size="sm"
                    >
                      Salvar
                    </Button>
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
