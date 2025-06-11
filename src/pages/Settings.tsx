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
import { Trash2, Plus, Upload, Palette, Edit, Image, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useCourses, 
  useLeadStatuses, 
  useCreateCourse, 
  useCreateLeadStatus,
  useSystemSettings,
  useUpdateSystemSetting
} from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const { data: courses = [] } = useCourses();
  const { data: leadStatuses = [] } = useLeadStatuses();
  const { data: systemSettings = [] } = useSystemSettings();
  const createCourse = useCreateCourse();
  const createLeadStatus = useCreateLeadStatus();
  const updateSetting = useUpdateSystemSetting();

  const [newCourse, setNewCourse] = useState('');
  const [newStatus, setNewStatus] = useState({ name: '', color: '#3b82f6' });
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [webhooks, setWebhooks] = useState({
    whatsapp: '',
    email: '',
    sms: ''
  });
  const [validationWebhook, setValidationWebhook] = useState('');
  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    whatsappNotifications: false,
    smsNotifications: false
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

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

    const validationWebhookSetting = getSetting('whatsapp_validation_webhook');
    if (validationWebhookSetting) {
      setValidationWebhook(validationWebhookSetting);
    }

    setNotifications({
      emailNotifications: getSetting('email_notifications') || false,
      whatsappNotifications: getSetting('whatsapp_notifications') || false,
      smsNotifications: getSetting('sms_notifications') || false
    });
  }, [systemSettings]);

  const handleAddCourse = async () => {
    if (newCourse.trim()) {
      try {
        await createCourse.mutateAsync(newCourse.trim());
        setNewCourse('');
        toast({
          title: "Sucesso",
          description: "Curso adicionado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar curso.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCourse = async () => {
    if (editingCourse && editingCourse.name.trim()) {
      try {
        const { error } = await supabase
          .from('courses')
          .update({ name: editingCourse.name.trim() })
          .eq('id', editingCourse.id);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['courses'] });
        setEditingCourse(null);
        
        toast({
          title: "Sucesso",
          description: "Curso atualizado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar curso.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddStatus = async () => {
    if (newStatus.name.trim()) {
      try {
        await createLeadStatus.mutateAsync(newStatus);
        setNewStatus({ name: '', color: '#3b82f6' });
        toast({
          title: "Sucesso",
          description: "Status adicionado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar status.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditStatus = async () => {
    if (editingStatus && editingStatus.name.trim()) {
      try {
        const { error } = await supabase
          .from('lead_statuses')
          .update({ 
            name: editingStatus.name.trim(),
            color: editingStatus.color 
          })
          .eq('id', editingStatus.id);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['lead_statuses'] });
        setEditingStatus(null);
        
        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar status.",
          variant: "destructive",
        });
      }
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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        try {
          // Primeiro verificar se existe uma configuração de logo
          const { data: existingSettings } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', 'logo');

          if (existingSettings && existingSettings.length > 0) {
            // Atualizar o logo existente
            const { error } = await supabase
              .from('system_settings')
              .update({ value: base64 })
              .eq('key', 'logo');
            
            if (error) throw error;
          } else {
            // Inserir novo logo
            const { error } = await supabase
              .from('system_settings')
              .insert({ key: 'logo', value: base64 });
            
            if (error) throw error;
          }

          queryClient.invalidateQueries({ queryKey: ['system_settings'] });

          toast({
            title: "Sucesso",
            description: "Logo atualizado com sucesso!",
          });
        } catch (mutationError) {
          console.error('Erro na mutation:', mutationError);
          toast({
            title: "Erro",
            description: "Erro ao salvar o logo.",
            variant: "destructive",
          });
        }
        
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

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validar tamanho (1MB max para favicon)
    if (file.size > 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 1MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFavicon(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        try {
          // Verificar se existe uma configuração de favicon
          const { data: existingSettings } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', 'favicon');

          if (existingSettings && existingSettings.length > 0) {
            // Atualizar o favicon existente
            const { error } = await supabase
              .from('system_settings')
              .update({ value: base64 })
              .eq('key', 'favicon');
            
            if (error) throw error;
          } else {
            // Inserir novo favicon
            const { error } = await supabase
              .from('system_settings')
              .insert({ key: 'favicon', value: base64 });
            
            if (error) throw error;
          }

          queryClient.invalidateQueries({ queryKey: ['system_settings'] });

          // Atualizar o favicon no HTML
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (link) {
            link.href = base64;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = base64;
            newLink.type = 'image/png';
            document.head.appendChild(newLink);
          }

          toast({
            title: "Sucesso",
            description: "Favicon atualizado com sucesso!",
          });
        } catch (mutationError) {
          console.error('Erro na mutation:', mutationError);
          toast({
            title: "Erro",
            description: "Erro ao salvar o favicon.",
            variant: "destructive",
          });
        }
        
        setUploadingFavicon(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Erro",
          description: "Erro ao processar a imagem.",
          variant: "destructive",
        });
        setUploadingFavicon(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
      setUploadingFavicon(false);
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

  const handleValidationWebhookSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'whatsapp_validation_webhook',
        value: validationWebhook
      });
      
      toast({
        title: "Sucesso",
        description: "Webhook de validação salvo com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar webhook de validação.",
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
  const currentFavicon = getSetting('favicon');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="statuses">Status</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="api-docs">API Docs</TabsTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle>Favicon</CardTitle>
              <CardDescription>
                Faça upload do favicon do seu site (recomendado: 32x32px ou 16x16px, máximo 1MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentFavicon && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={currentFavicon} 
                    alt="Favicon atual" 
                    className="h-8 w-8 object-contain border rounded"
                  />
                  <span className="text-sm text-muted-foreground">Favicon atual</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingFavicon}
                  className="flex items-center space-x-2"
                >
                  <Image className="h-4 w-4" />
                  <span>{uploadingFavicon ? 'Enviando...' : 'Escolher Favicon'}</span>
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
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>
                        {new Date(course.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
                    <TableHead>Ações</TableHead>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStatus(status)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Validação de WhatsApp</CardTitle>
              <CardDescription>
                Configure o webhook para validação de números de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="validation-webhook">Webhook de Validação</Label>
                <Input
                  id="validation-webhook"
                  placeholder="https://api.exemplo.com/validate-whatsapp"
                  value={validationWebhook}
                  onChange={(e) => setValidationWebhook(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Este webhook receberá: whatsapp, validation_id e callback_url
                </p>
              </div>

              <Button onClick={handleValidationWebhookSave} disabled={updateSetting.isPending}>
                Salvar Webhook de Validação
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

        <TabsContent value="api-docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentação da API - Validação WhatsApp</CardTitle>
              <CardDescription>
                Como integrar com os endpoints de validação de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">1. Endpoint de Validação</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm font-mono mb-2">POST /functions/v1/validate-whatsapp</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este endpoint inicia o processo de validação de um número WhatsApp
                    </p>
                    
                    <h5 className="font-semibold mb-2">Request Body:</h5>
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "whatsapp": "+5582999999999",
  "validation_id": "uuid-gerado-pelo-sistema"
}`}
                    </pre>

                    <h5 className="font-semibold mb-2 mt-4">Response (Success):</h5>
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "validation_id": "uuid-gerado-pelo-sistema",
  "message": "Validation request sent"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">2. Webhook Externo (Seu Sistema)</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Seu webhook receberá os seguintes dados para validar o número:
                    </p>
                    
                    <h5 className="font-semibold mb-2">Request que seu webhook receberá:</h5>
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "whatsapp": "+5582999999999",
  "validation_id": "uuid-gerado-pelo-sistema",
  "callback_url": "https://dobtquebpcnzjisftcfh.supabase.co/functions/v1/whatsapp-validation-callback"
}`}
                    </pre>

                    <h5 className="font-semibold mb-2 mt-4">Resposta esperada do seu webhook:</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Seu sistema deve processar a validação e enviar o resultado para o callback_url:
                    </p>
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`POST para callback_url:
{
  "validation_id": "uuid-gerado-pelo-sistema",
  "is_valid": true,  // ou false
  "message": "Número válido" // opcional
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">3. Callback de Resultado</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm font-mono mb-2">POST /functions/v1/whatsapp-validation-callback</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este endpoint recebe o resultado da validação do seu sistema
                    </p>
                    
                    <h5 className="font-semibold mb-2">Request Body:</h5>
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "validation_id": "uuid-gerado-pelo-sistema",
  "is_valid": true,
  "message": "Número válido e ativo"
}`}
                    </pre>

                    <h5 className="font-semibold mb-2 mt-4">Response:</h5>
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "message": "Validation updated successfully"
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Fluxo Completo:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Sistema chama /validate-whatsapp com número e validation_id</li>
                    <li>Sistema busca webhook configurado nas configurações</li>
                    <li>Sistema envia dados para seu webhook externo</li>
                    <li>Seu sistema valida o número WhatsApp</li>
                    <li>Seu sistema envia resultado para callback_url</li>
                    <li>Sistema atualiza status da validação no banco</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para editar curso */}
      <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Atualize o nome do curso
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-course-name">Nome do Curso</Label>
                <Input
                  id="edit-course-name"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCourse(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditCourse}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar status */}
      <Dialog open={!!editingStatus} onOpenChange={() => setEditingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Status</DialogTitle>
            <DialogDescription>
              Atualize o nome e cor do status
            </DialogDescription>
          </DialogHeader>
          {editingStatus && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-status-name">Nome do Status</Label>
                <Input
                  id="edit-status-name"
                  value={editingStatus.name}
                  onChange={(e) => setEditingStatus({...editingStatus, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-status-color">Cor do Status</Label>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <Input
                    id="edit-status-color"
                    type="color"
                    value={editingStatus.color}
                    onChange={(e) => setEditingStatus({...editingStatus, color: e.target.value})}
                    className="w-16 h-10 p-1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingStatus(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditStatus}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
