
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Upload, Palette, Webhook, TestTube, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings({...settings, logo: e.target?.result as string});
        toast({
          title: "Logo atualizado",
          description: "Logo da aplicação foi atualizado com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings({...settings, favicon: e.target?.result as string});
        toast({
          title: "Favicon atualizado",
          description: "Favicon da aplicação foi atualizado com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const testWebhook = async (type: string, url: string) => {
    setWebhookTests({...webhookTests, [type]: 'testing'});
    
    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        type: type
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        setWebhookTests({...webhookTests, [type]: 'success'});
        toast({
          title: "Webhook funcionando",
          description: `Webhook ${type} está funcionando corretamente.`,
        });
      } else {
        throw new Error('Webhook failed');
      }
    } catch (error) {
      setWebhookTests({...webhookTests, [type]: 'error'});
      toast({
        title: "Webhook com erro",
        description: `Erro ao testar webhook ${type}. Verifique a URL e configurações.`,
        variant: "destructive",
      });
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setWebhookTests({...webhookTests, [type]: 'idle'});
    }, 3000);
  };

  const saveSettings = () => {
    // Aqui você salvaria as configurações no backend
    toast({
      title: "Configurações salvas",
      description: "Todas as configurações foram salvas com sucesso.",
    });
  };

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <TestTube className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <Button onClick={saveSettings}>
          Salvar Configurações
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
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

                  <div>
                    <Label htmlFor="favicon-upload">Favicon</Label>
                    <div className="mt-2 flex items-center space-x-4">
                      {settings.favicon && (
                        <img
                          src={settings.favicon}
                          alt="Favicon"
                          className="h-8 w-8 object-cover rounded border"
                        />
                      )}
                      <div>
                        <input
                          id="favicon-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                        <Label htmlFor="favicon-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            {settings.favicon ? 'Alterar Favicon' : 'Upload Favicon'}
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        id="primary-color"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="h-10 w-20 border rounded cursor-pointer"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        id="secondary-color"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                        className="h-10 w-20 border rounded cursor-pointer"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                        placeholder="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Preview das Cores</h3>
                <div className="flex space-x-4">
                  <div 
                    className="w-16 h-16 rounded border"
                    style={{ backgroundColor: settings.primaryColor }}
                  ></div>
                  <div 
                    className="w-16 h-16 rounded border"
                    style={{ backgroundColor: settings.secondaryColor }}
                  ></div>
                </div>
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

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>
                Informações técnicas e configurações avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Versão do Sistema</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">v1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label>Última Atualização</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Total de Leads</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">1,247</p>
                </div>
                <div className="space-y-2">
                  <Label>Mensagens Enviadas</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">3,456</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Backup e Manutenção</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full md:w-auto">
                    Exportar Dados
                  </Button>
                  <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2">
                    Backup do Sistema
                  </Button>
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
