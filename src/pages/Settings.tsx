import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Palette, Webhook, TestTube, Check, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourses, useLeadStatuses, useSystemSettings, useCreateCourse, useCreateLeadStatus } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { data: leadStatuses = [] } = useLeadStatuses();
  const { data: systemSettings = [] } = useSystemSettings();
  const createCourse = useCreateCourse();
  const createLeadStatus = useCreateLeadStatus();

  const [settings, setSettings] = useState({
    logo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    webhooks: {
      whatsapp: 'https://api.exemplo.com/whatsapp/send',
      email: 'https://api.exemplo.com/email/send',
      sms: 'https://api.exemplo.com/sms/send',
      leadCapture: 'https://api.exemplo.com/leads/capture',
      leadSync: 'https://api.exemplo.com/leads/sync'
    },
    notifications: {
      webhookErrors: true,
      dailyReports: true,
      leadAlerts: false
    }
  });

  const [webhookTests, setWebhookTests] = useState<{[key: string]: 'idle' | 'testing' | 'success' | 'error'}>({});
  const [newCourse, setNewCourse] = useState('');
  const [newStatus, setNewStatus] = useState({ name: '', color: '#64748b' });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const logoUrl = e.target?.result as string;
        setSettings({...settings, logo: logoUrl});
        
        // Salvar no banco
        await supabase
          .from('system_settings')
          .upsert({ key: 'logo', value: JSON.stringify(logoUrl) });
        
        toast({
          title: "Logo atualizado",
          description: "Logo da aplicação foi atualizado com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCourse = () => {
    if (!newCourse.trim()) return;
    createCourse.mutate(newCourse.trim());
    setNewCourse('');
  };

  const handleAddStatus = () => {
    if (!newStatus.name.trim()) return;
    createLeadStatus.mutate(newStatus);
    setNewStatus({ name: '', color: '#64748b' });
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await supabase.from('courses').delete().eq('id', courseId);
      toast({
        title: "Curso removido",
        description: "Curso removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover curso",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    try {
      await supabase.from('lead_statuses').delete().eq('id', statusId);
      toast({
        title: "Status removido",
        description: "Status removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <Button>
          Salvar Configurações
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="statuses">Status</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Personalização Visual</span>
              </CardTitle>
              <CardDescription>
                Configure a aparência da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo-upload">Logo da Aplicação</Label>
                    <div className="mt-2 flex items-center space-x-4">
                      {settings.logo && (
                        <img
                          src={settings.logo}
                          alt="Logo"
                          className="h-16 w-16 object-cover rounded border"
                        />
                      )}
                      <div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            {settings.logo ? 'Alterar Logo' : 'Upload Logo'}
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Cursos</CardTitle>
              <CardDescription>
                Adicione ou remova cursos oferecidos pela faculdade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nome do curso"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCourse()}
                />
                <Button onClick={handleAddCourse} disabled={!newCourse.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <div className="grid gap-2">
                {courses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded">
                    <span>{course.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Status</CardTitle>
              <CardDescription>
                Configure os status disponíveis para os leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nome do status"
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                />
                <input
                  type="color"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <Button onClick={handleAddStatus} disabled={!newStatus.name.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <div className="grid gap-2">
                {leadStatuses.map((status: any) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStatus(status.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-5 w-5" />
                <span>Configuração de Webhooks</span>
              </CardTitle>
              <CardDescription>
                Configure os endpoints para integração com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.webhooks).map(([key, url]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`webhook-${key}`} className="capitalize">
                      {key === 'leadCapture' ? 'Captura de Leads' :
                       key === 'leadSync' ? 'Sincronização de Leads' :
                       key}
                    </Label>
                    <Badge variant={webhookTests[key] === 'success' ? 'default' : 'secondary'}>
                      {webhookTests[key] === 'success' ? 'Funcionando' : 'Não testado'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      id={`webhook-${key}`}
                      value={url}
                      onChange={(e) => setSettings({
                        ...settings,
                        webhooks: { ...settings.webhooks, [key]: e.target.value }
                      })}
                      placeholder="https://api.exemplo.com/webhook"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(key, url)}
                      disabled={webhookTests[key] === 'testing'}
                    >
                      {getTestIcon(webhookTests[key] || 'idle')}
                      <span className="ml-2">Testar</span>
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Informações dos Webhooks</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>WhatsApp/SMS/Email:</strong> Recebem dados de envio de mensagens</p>
                  <p><strong>Captura de Leads:</strong> Recebe novos leads dos QR codes</p>
                  <p><strong>Sincronização:</strong> Envia leads com status "concluído" periodicamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure as notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Erros de Webhook</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando webhooks falharem
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.webhookErrors}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, webhookErrors: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatórios Diários</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber resumo diário de leads capturados
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.dailyReports}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, dailyReports: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Lead</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar imediatamente quando novo lead for capturado
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.leadAlerts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, leadAlerts: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
