
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Palette, MessageSquare, Database, Webhook, Users, GraduationCap, Settings2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import StatusManager from '@/components/StatusManager';
import CourseManager from '@/components/CourseManager';
import DatabaseExport from '@/components/DatabaseExport';

const Settings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const [formData, setFormData] = useState({
    webhook_whatsapp: '',
    webhook_email: '',
    webhook_sms: '',
    whatsapp_validation_webhook: '',
    presentation_title: '',
    presentation_subtitle: '',
    presentation_description: '',
    presentation_image: '',
    presentation_logo: '',
    presentation_favicon: '',
    primary_color: '#0066cc',
    secondary_color: '#f8f9fa',
    highlight_color: '#ff6b35',
    form_title: '',
    form_subtitle: '',
    form_description: '',
    form_thank_you_title: '',
    form_thank_you_description: '',
    form_fields: [] as string[],
    form_success_redirect: '',
    form_primary_color: '#0066cc',
    form_secondary_color: '#f8f9fa',
    form_button_color: '#ff6b35',
    api_base_url: '',
    webhook_lead_created: '',
    webhook_lead_updated: '',
    webhook_scan_session: '',
    api_token: '',
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
        return acc;
      }, {});

      setFormData(prev => ({
        ...prev,
        ...settingsMap,
        form_fields: settingsMap.form_fields ? JSON.parse(settingsMap.form_fields || '[]') : []
      }));
    }
  }, [settings]);

  const handleSaveWebhooks = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'webhook_whatsapp', value: formData.webhook_whatsapp }),
        updateSetting.mutateAsync({ key: 'webhook_email', value: formData.webhook_email }),
        updateSetting.mutateAsync({ key: 'webhook_sms', value: formData.webhook_sms }),
        updateSetting.mutateAsync({ key: 'whatsapp_validation_webhook', value: formData.whatsapp_validation_webhook })
      ]);

      toast({
        title: "Webhooks salvos",
        description: "Configurações de webhook atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar webhooks",
        variant: "destructive",
      });
    }
  };

  const handleSavePresentation = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'presentation_title', value: formData.presentation_title }),
        updateSetting.mutateAsync({ key: 'presentation_subtitle', value: formData.presentation_subtitle }),
        updateSetting.mutateAsync({ key: 'presentation_description', value: formData.presentation_description }),
        updateSetting.mutateAsync({ key: 'presentation_image', value: formData.presentation_image }),
        updateSetting.mutateAsync({ key: 'presentation_logo', value: formData.presentation_logo }),
        updateSetting.mutateAsync({ key: 'presentation_favicon', value: formData.presentation_favicon }),
        updateSetting.mutateAsync({ key: 'primary_color', value: formData.primary_color }),
        updateSetting.mutateAsync({ key: 'secondary_color', value: formData.secondary_color }),
        updateSetting.mutateAsync({ key: 'highlight_color', value: formData.highlight_color })
      ]);

      toast({
        title: "Apresentação salva",
        description: "Configurações da apresentação atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar apresentação",
        variant: "destructive",
      });
    }
  };

  const handleSaveForm = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'form_title', value: formData.form_title }),
        updateSetting.mutateAsync({ key: 'form_subtitle', value: formData.form_subtitle }),
        updateSetting.mutateAsync({ key: 'form_description', value: formData.form_description }),
        updateSetting.mutateAsync({ key: 'form_thank_you_title', value: formData.form_thank_you_title }),
        updateSetting.mutateAsync({ key: 'form_thank_you_description', value: formData.form_thank_you_description }),
        updateSetting.mutateAsync({ key: 'form_fields', value: JSON.stringify(formData.form_fields) }),
        updateSetting.mutateAsync({ key: 'form_success_redirect', value: formData.form_success_redirect }),
        updateSetting.mutateAsync({ key: 'form_primary_color', value: formData.form_primary_color }),
        updateSetting.mutateAsync({ key: 'form_secondary_color', value: formData.form_secondary_color }),
        updateSetting.mutateAsync({ key: 'form_button_color', value: formData.form_button_color })
      ]);

      toast({
        title: "Formulário salvo",
        description: "Configurações do formulário atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar formulário",
        variant: "destructive",
      });
    }
  };

  const handleSaveAPI = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'api_base_url', value: formData.api_base_url }),
        updateSetting.mutateAsync({ key: 'webhook_lead_created', value: formData.webhook_lead_created }),
        updateSetting.mutateAsync({ key: 'webhook_lead_updated', value: formData.webhook_lead_updated }),
        updateSetting.mutateAsync({ key: 'webhook_scan_session', value: formData.webhook_scan_session }),
        updateSetting.mutateAsync({ key: 'api_token', value: formData.api_token })
      ]);

      toast({
        title: "API salva",
        description: "Configurações da API atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar API",
        variant: "destructive",
      });
    }
  };

  const addFormField = () => {
    setFormData(prev => ({
      ...prev,
      form_fields: [...prev.form_fields, '']
    }));
  };

  const removeFormField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      form_fields: prev.form_fields.filter((_, i) => i !== index)
    }));
  };

  const updateFormField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      form_fields: prev.form_fields.map((field, i) => i === index ? value : field)
    }));
  };

  if (isLoading) {
    return <div className="p-6">Carregando configurações...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie as configurações do sistema</p>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="formulario" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="cursos" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="banco" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure as URLs dos webhooks para diferentes tipos de mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook_whatsapp">Webhook WhatsApp</Label>
                <Input
                  id="webhook_whatsapp"
                  placeholder="https://exemplo.com/webhook/whatsapp"
                  value={formData.webhook_whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_whatsapp: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_email">Webhook Email</Label>
                <Input
                  id="webhook_email"
                  placeholder="https://exemplo.com/webhook/email"
                  value={formData.webhook_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_sms">Webhook SMS</Label>
                <Input
                  id="webhook_sms"
                  placeholder="https://exemplo.com/webhook/sms"
                  value={formData.webhook_sms}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_sms: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_validation_webhook">Webhook de Verificação WhatsApp</Label>
                <Input
                  id="whatsapp_validation_webhook"
                  placeholder="https://exemplo.com/webhook/whatsapp-validation"
                  value={formData.whatsapp_validation_webhook}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_validation_webhook: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  URL para validar números de WhatsApp antes do envio
                </p>
              </div>

              <Button onClick={handleSaveWebhooks} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Webhooks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Visuais</CardTitle>
              <CardDescription>
                Personalize a aparência e identidade visual do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presentation_title">Título Principal</Label>
                  <Input
                    id="presentation_title"
                    placeholder="Título da apresentação"
                    value={formData.presentation_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentation_title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presentation_subtitle">Subtítulo</Label>
                  <Input
                    id="presentation_subtitle"
                    placeholder="Subtítulo da apresentação"
                    value={formData.presentation_subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentation_subtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentation_description">Descrição</Label>
                <Textarea
                  id="presentation_description"
                  placeholder="Descrição da apresentação"
                  value={formData.presentation_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, presentation_description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presentation_logo">URL do Logotipo</Label>
                  <Input
                    id="presentation_logo"
                    placeholder="https://exemplo.com/logo.png"
                    value={formData.presentation_logo}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentation_logo: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presentation_favicon">URL do Favicon</Label>
                  <Input
                    id="presentation_favicon"
                    placeholder="https://exemplo.com/favicon.ico"
                    value={formData.presentation_favicon}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentation_favicon: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presentation_image">URL da Imagem</Label>
                  <Input
                    id="presentation_image"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.presentation_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentation_image: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Personalização de Cores</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        placeholder="#0066cc"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        placeholder="#f8f9fa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="highlight_color">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        id="highlight_color"
                        type="color"
                        value={formData.highlight_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, highlight_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.highlight_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, highlight_color: e.target.value }))}
                        placeholder="#ff6b35"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePresentation} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações Visuais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Formulário</CardTitle>
              <CardDescription>
                Personalize o formulário de captura de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form_title">Título do Formulário</Label>
                  <Input
                    id="form_title"
                    placeholder="Título do formulário"
                    value={formData.form_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, form_title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form_subtitle">Subtítulo do Formulário</Label>
                  <Input
                    id="form_subtitle"
                    placeholder="Subtítulo do formulário"
                    value={formData.form_subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, form_subtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form_description">Descrição do Formulário</Label>
                <Textarea
                  id="form_description"
                  placeholder="Descrição do formulário"
                  value={formData.form_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, form_description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form_thank_you_title">Título da Página de Agradecimento</Label>
                  <Input
                    id="form_thank_you_title"
                    placeholder="Obrigado!"
                    value={formData.form_thank_you_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, form_thank_you_title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form_success_redirect">URL de Redirecionamento</Label>
                  <Input
                    id="form_success_redirect"
                    placeholder="https://exemplo.com/obrigado"
                    value={formData.form_success_redirect}
                    onChange={(e) => setFormData(prev => ({ ...prev, form_success_redirect: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form_thank_you_description">Descrição da Página de Agradecimento</Label>
                <Textarea
                  id="form_thank_you_description"
                  placeholder="Sua inscrição foi realizada com sucesso!"
                  value={formData.form_thank_you_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, form_thank_you_description: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Cores do Formulário</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="form_primary_color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form_primary_color"
                        type="color"
                        value={formData.form_primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_primary_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.form_primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_primary_color: e.target.value }))}
                        placeholder="#0066cc"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form_secondary_color"
                        type="color"
                        value={formData.form_secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_secondary_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.form_secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_secondary_color: e.target.value }))}
                        placeholder="#f8f9fa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_button_color">Cor do Botão</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form_button_color"
                        type="color"
                        value={formData.form_button_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_button_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.form_button_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_button_color: e.target.value }))}
                        placeholder="#ff6b35"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Campos Personalizados</Label>
                {formData.form_fields.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Nome do campo"
                      value={field}
                      onChange={(e) => updateFormField(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFormField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFormField}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Campo
                </Button>
              </div>

              <Button onClick={handleSaveForm} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações do Formulário
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <StatusManager />
        </TabsContent>

        <TabsContent value="cursos">
          <CourseManager />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da API</CardTitle>
              <CardDescription>
                Configure endpoints e webhooks de callback do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_base_url">URL Base da API</Label>
                  <Input
                    id="api_base_url"
                    placeholder="https://api.exemplo.com"
                    value={formData.api_base_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_base_url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_token">Token da API</Label>
                  <Input
                    id="api_token"
                    type="password"
                    placeholder="Token de autenticação"
                    value={formData.api_token}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_token: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Webhooks de Callback</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook_lead_created">Webhook - Lead Criado</Label>
                  <Input
                    id="webhook_lead_created"
                    placeholder="https://exemplo.com/webhook/lead-created"
                    value={formData.webhook_lead_created}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_lead_created: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook chamado quando um novo lead é criado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_lead_updated">Webhook - Lead Atualizado</Label>
                  <Input
                    id="webhook_lead_updated"
                    placeholder="https://exemplo.com/webhook/lead-updated"
                    value={formData.webhook_lead_updated}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_lead_updated: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook chamado quando um lead é atualizado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_scan_session">Webhook - Sessão de Scan</Label>
                  <Input
                    id="webhook_scan_session"
                    placeholder="https://exemplo.com/webhook/scan-session"
                    value={formData.webhook_scan_session}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_scan_session: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook chamado quando um QR Code é escaneado
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveAPI} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações da API
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banco">
          <DatabaseExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
