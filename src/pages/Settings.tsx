
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Upload, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useCourses, 
  useLeadStatuses, 
  useCreateCourse, 
  useCreateLeadStatus,
  useSystemSettings,
  useUpdateSystemSetting
} from '@/hooks/useSupabaseData';

const Settings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: courses = [] } = useCourses();
  const { data: leadStatuses = [] } = useLeadStatuses();
  const { data: systemSettings = [] } = useSystemSettings();
  const createCourse = useCreateCourse();
  const createLeadStatus = useCreateLeadStatus();
  const updateSetting = useUpdateSystemSetting();

  const [newCourse, setNewCourse] = useState('');
  const [newStatus, setNewStatus] = useState({ name: '', color: '#3b82f6' });
  const [webhooks, setWebhooks] = useState({
    whatsapp: '',
    email: '',
    sms: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    whatsappNotifications: false,
    smsNotifications: false
  });
  const [uploading, setUploading] = useState(false);

  // Obter configurações do sistema
  const getSetting = (key: string) => {
    const setting = systemSettings.find((s: any) => s.key === key);
    if (!setting) return null;
    
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      return setting.value;
    }
  };

  React.useEffect(() => {
    const webhookSettings = getSetting('webhooks');
    if (webhookSettings) {
      setWebhooks({
        whatsapp: webhookSettings.whatsapp || '',
        email: webhookSettings.email || '',
        sms: webhookSettings.sms || ''
      });
    }

    setNotifications({
      emailNotifications: getSetting('email_notifications') || false,
      whatsappNotifications: getSetting('whatsapp_notifications') || false,
      smsNotifications: getSetting('sms_notifications') || false
    });
  }, [systemSettings]);

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      createCourse.mutate(newCourse.trim());
      setNewCourse('');
    }
  };

  const handleAddStatus = () => {
    if (newStatus.name.trim()) {
      createLeadStatus.mutate(newStatus);
      setNewStatus({ name: '', color: '#3b82f6' });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Salvar no sistema
        await updateSetting.mutateAsync({
          key: 'logo',
          value: base64
        });

        toast({
          title: "Sucesso",
          description: "Logo atualizado com sucesso!",
        });
        
        setUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Erro",
          description: "Erro ao processar a imagem.",
          variant: "destructive",
        });
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleWebhookSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'webhooks',
        value: webhooks
      });
      
      toast({
        title: "Sucesso",
        description: "Webhooks salvos com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar webhooks.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationsSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({
          key: 'email_notifications',
          value: notifications.emailNotifications
        }),
        updateSetting.mutateAsync({
          key: 'whatsapp_notifications',
          value: notifications.whatsappNotifications
        }),
        updateSetting.mutateAsync({
          key: 'sms_notifications',
          value: notifications.smsNotifications
        })
      ]);
      
      toast({
        title: "Sucesso",
        description: "Configurações de notificações salvas!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    }
  };

  const currentLogo = getSetting('logo');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
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
              <CardTitle>Logotipo</CardTitle>
              <CardDescription>
                Faça upload do logotipo da sua empresa (recomendado: 200x60px, máximo 2MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentLogo && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={currentLogo} 
                    alt="Logo atual" 
                    className="h-16 w-auto object-contain border rounded"
                  />
                  <span className="text-sm text-muted-foreground">Logo atual</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'Enviando...' : 'Escolher Arquivo'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Cursos</CardTitle>
              <CardDescription>
                Adicione e gerencie os cursos disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nome do novo curso"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                />
                <Button onClick={handleAddCourse} disabled={createCourse.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>
                        {new Date(course.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <CardTitle>Status de Leads</CardTitle>
              <CardDescription>
                Gerencie os status que podem ser atribuídos aos leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nome do status"
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                />
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <Input
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                    className="w-16 h-10 p-1"
                  />
                </div>
                <Button onClick={handleAddStatus} disabled={createLeadStatus.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadStatuses.map((status: any) => (
                    <TableRow key={status.id}>
                      <TableCell>{status.name}</TableCell>
                      <TableCell>{status.color}</TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: status.color, color: 'white' }}>
                          {status.name}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure os endpoints para envio de mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp-webhook">Webhook WhatsApp</Label>
                  <Input
                    id="whatsapp-webhook"
                    placeholder="https://api.exemplo.com/whatsapp/send"
                    value={webhooks.whatsapp}
                    onChange={(e) => setWebhooks({...webhooks, whatsapp: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email-webhook">Webhook E-mail</Label>
                  <Input
                    id="email-webhook"
                    placeholder="https://api.exemplo.com/email/send"
                    value={webhooks.email}
                    onChange={(e) => setWebhooks({...webhooks, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sms-webhook">Webhook SMS</Label>
                  <Input
                    id="sms-webhook"
                    placeholder="https://api.exemplo.com/sms/send"
                    value={webhooks.sms}
                    onChange={(e) => setWebhooks({...webhooks, sms: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={handleWebhookSave} disabled={updateSetting.isPending}>
                Salvar Webhooks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure quando receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, emailNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas via WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={notifications.whatsappNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, whatsappNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, smsNotifications: checked})
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNotificationsSave} disabled={updateSetting.isPending}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
