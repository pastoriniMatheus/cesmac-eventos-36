
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Palette, MessageSquare, Database, Webhook, Users, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import StatusEditor from '@/components/StatusEditor';
import EventManager from '@/components/EventManager';
import EditableItemManager from '@/components/EditableItemManager';
import DatabaseExport from '@/components/DatabaseExport';

const Settings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const [formData, setFormData] = useState({
    webhook_whatsapp: '',
    webhook_email: '',
    webhook_sms: '',
    presentation_title: '',
    presentation_subtitle: '',
    presentation_description: '',
    presentation_image: '',
    form_title: '',
    form_subtitle: '',
    form_description: '',
    form_thank_you_title: '',
    form_thank_you_description: '',
    form_fields: [] as string[],
    form_success_redirect: '',
  });

  React.useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
        return acc;
      }, {});

      setFormData(prev => ({
        ...prev,
        ...settingsMap
      }));
    }
  }, [settings]);

  const handleSaveWebhooks = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'webhook_whatsapp', value: formData.webhook_whatsapp }),
        updateSetting.mutateAsync({ key: 'webhook_email', value: formData.webhook_email }),
        updateSetting.mutateAsync({ key: 'webhook_sms', value: formData.webhook_sms })
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
        updateSetting.mutateAsync({ key: 'presentation_image', value: formData.presentation_image })
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
        updateSetting.mutateAsync({ key: 'form_success_redirect', value: formData.form_success_redirect })
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="cursos" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="eventos" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Eventos
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
                <Label htmlFor="webhook_whatsapp">Webhook Envio de Mensagens (WhatsApp)</Label>
                <Input
                  id="webhook_whatsapp"
                  placeholder="https://exemplo.com/webhook/whatsapp"
                  value={formData.webhook_whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_whatsapp: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_email">Webhook de Email</Label>
                <Input
                  id="webhook_email"
                  placeholder="https://exemplo.com/webhook/email"
                  value={formData.webhook_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_sms">Webhook de SMS</Label>
                <Input
                  id="webhook_sms"
                  placeholder="https://exemplo.com/webhook/sms"
                  value={formData.webhook_sms}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_sms: e.target.value }))}
                />
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
              <CardTitle>Configurações da Apresentação</CardTitle>
              <CardDescription>
                Personalize a página inicial e apresentação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="presentation_description">Descrição</Label>
                <Textarea
                  id="presentation_description"
                  placeholder="Descrição da apresentação"
                  value={formData.presentation_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, presentation_description: e.target.value }))}
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

              <Button onClick={handleSavePresentation} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Apresentação
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações do Formulário</CardTitle>
              <CardDescription>
                Personalize o formulário de captura de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="form_description">Descrição do Formulário</Label>
                <Textarea
                  id="form_description"
                  placeholder="Descrição do formulário"
                  value={formData.form_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, form_description: e.target.value }))}
                />
              </div>

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
                <Label htmlFor="form_thank_you_description">Descrição da Página de Agradecimento</Label>
                <Textarea
                  id="form_thank_you_description"
                  placeholder="Sua inscrição foi realizada com sucesso!"
                  value={formData.form_thank_you_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, form_thank_you_description: e.target.value }))}
                />
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

              <div className="space-y-2">
                <Label htmlFor="form_success_redirect">URL de Redirecionamento (Sucesso)</Label>
                <Input
                  id="form_success_redirect"
                  placeholder="https://exemplo.com/obrigado"
                  value={formData.form_success_redirect}
                  onChange={(e) => setFormData(prev => ({ ...prev, form_success_redirect: e.target.value }))}
                />
              </div>

              <Button onClick={handleSaveForm} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Formulário
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <StatusEditor />
        </TabsContent>

        <TabsContent value="cursos">
          <EditableItemManager 
            title="Gerenciar Cursos"
            description="Adicione, edite ou remova cursos do sistema"
            type="courses"
          />
        </TabsContent>

        <TabsContent value="eventos">
          <EventManager />
        </TabsContent>

        <TabsContent value="banco">
          <DatabaseExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
