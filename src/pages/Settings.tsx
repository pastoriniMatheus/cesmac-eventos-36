
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Palette, MessageSquare, Database, Webhook, Users, GraduationCap, Settings2, Globe, Info } from 'lucide-react';
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
    primary_color: '#3b82f6',
    secondary_color: '#f59e0b',
    accent_color: '#6b7280',
    background_color: '#ffffff',
    text_color: '#1f2937',
    form_title: '',
    form_subtitle: '',
    form_description: '',
    form_thank_you_title: '',
    form_thank_you_description: '',
    form_fields: [] as string[],
    form_success_redirect: '',
    form_primary_color: '#3b82f6',
    form_secondary_color: '#f59e0b',
    form_button_color: '#10b981',
    form_background_color: '#ffffff',
    form_text_color: '#1f2937',
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

  const handleSaveVisual = async () => {
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
        updateSetting.mutateAsync({ key: 'accent_color', value: formData.accent_color }),
        updateSetting.mutateAsync({ key: 'background_color', value: formData.background_color }),
        updateSetting.mutateAsync({ key: 'text_color', value: formData.text_color })
      ]);

      toast({
        title: "Visual salvo",
        description: "Configurações visuais atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações visuais",
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
        updateSetting.mutateAsync({ key: 'form_button_color', value: formData.form_button_color }),
        updateSetting.mutateAsync({ key: 'form_background_color', value: formData.form_background_color }),
        updateSetting.mutateAsync({ key: 'form_text_color', value: formData.form_text_color })
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
        <TabsList className="grid w-full grid-cols-7">
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Identidade Visual</h4>
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
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Cores do Sistema</h4>
                <p className="text-sm text-gray-600">Configure as cores principais do sistema</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária (Azul)</Label>
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
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária (Amarelo)</Label>
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
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Cor de Destaque (Cinza)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.accent_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                        placeholder="#6b7280"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background_color">Cor de Fundo (Branco)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveVisual} className="w-full">
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Textos do Formulário</h4>
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
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Cores do Formulário</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        placeholder="#3b82f6"
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
                        placeholder="#f59e0b"
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
                        placeholder="#10b981"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_background_color">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form_background_color"
                        type="color"
                        value={formData.form_background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_background_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.form_background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_background_color: e.target.value }))}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_text_color">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form_text_color"
                        type="color"
                        value={formData.form_text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_text_color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.form_text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, form_text_color: e.target.value }))}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Campos Personalizados</h4>
                <div className="space-y-2">
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
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Documentação da API
              </CardTitle>
              <CardDescription>
                Instruções detalhadas para uso da API do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Endpoints Disponíveis</h4>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold text-green-700">POST /api/leads</h5>
                    <p className="text-sm text-gray-600 mt-1">Criar um novo lead</p>
                    <div className="mt-2">
                      <Label>Parâmetros:</Label>
                      <code className="block bg-gray-100 p-2 rounded text-sm mt-1">
                        {`{
  "name": "string",
  "email": "string", 
  "whatsapp": "string",
  "course_id": "uuid",
  "event_id": "uuid",
  "source": "string"
}`}
                      </code>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold text-blue-700">GET /api/leads</h5>
                    <p className="text-sm text-gray-600 mt-1">Listar todos os leads</p>
                    <div className="mt-2">
                      <Label>Parâmetros opcionais:</Label>
                      <code className="block bg-gray-100 p-2 rounded text-sm mt-1">
                        ?course_id=uuid&event_id=uuid&status_id=uuid
                      </code>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold text-purple-700">POST /api/whatsapp/validate</h5>
                    <p className="text-sm text-gray-600 mt-1">Validar número de WhatsApp</p>
                    <div className="mt-2">
                      <Label>Parâmetros:</Label>
                      <code className="block bg-gray-100 p-2 rounded text-sm mt-1">
                        {`{
  "whatsapp": "string"
}`}
                      </code>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold text-orange-700">POST /api/messages/send</h5>
                    <p className="text-sm text-gray-600 mt-1">Enviar mensagem</p>
                    <div className="mt-2">
                      <Label>Parâmetros:</Label>
                      <code className="block bg-gray-100 p-2 rounded text-sm mt-1">
                        {`{
  "type": "whatsapp|email|sms",
  "recipients": ["string"],
  "message": "string"
}`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Autenticação</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Cabeçalho necessário:</strong><br />
                    <code>Authorization: Bearer SEU_TOKEN_AQUI</code>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Webhooks de Callback</h4>
                <p className="text-sm text-gray-600">
                  O sistema enviará callbacks para os seguintes eventos:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Novo lead criado</li>
                  <li>Lead atualizado</li>
                  <li>QR Code escaneado</li>
                  <li>Mensagem enviada</li>
                  <li>WhatsApp validado</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Códigos de Resposta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-green-600 font-semibold">200</span> - Sucesso
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">201</span> - Criado
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">400</span> - Erro de validação
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">401</span> - Não autorizado
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">404</span> - Não encontrado
                  </div>
                  <div>
                    <span className="text-red-600 font-semibold">500</span> - Erro interno
                  </div>
                </div>
              </div>
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
