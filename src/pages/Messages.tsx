
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, Smartphone, Save, Send, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import { useLeads } from '@/hooks/useLeads';
import { useCreateMessageTemplate, useMessageTemplates, useMessageHistory } from '@/hooks/useMessages';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Messages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses = [] } = useCourses();
  const { data: events = [] } = useEvents();
  const { data: leads = [] } = useLeads();
  const { data: templates = [] } = useMessageTemplates();
  const { data: messageHistory = [] } = useMessageHistory();
  const { data: systemSettings = [] } = useSystemSettings();
  const createTemplate = useCreateMessageTemplate();

  const [currentMessage, setCurrentMessage] = useState({
    content: '',
    filterType: 'all' as 'course' | 'event' | 'all',
    filterValue: '',
    messageType: 'whatsapp' as 'whatsapp' | 'email' | 'sms'
  });

  const [templateDialog, setTemplateDialog] = useState({
    open: false,
    name: '',
    content: '',
    type: 'whatsapp' as 'whatsapp' | 'email' | 'sms'
  });

  // Obter webhook configurado
  const getWebhookUrl = (type: string) => {
    const webhookSetting = systemSettings.find((s: any) => s.key === `webhook_${type}`);
    return webhookSetting ? (typeof webhookSetting.value === 'string' ? webhookSetting.value : JSON.parse(String(webhookSetting.value))) : null;
  };

  const handleSendMessage = async () => {
    if (!currentMessage.content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o conteúdo da mensagem.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se webhook está configurado
    const webhookUrl = getWebhookUrl(currentMessage.messageType);
    if (!webhookUrl) {
      toast({
        title: "Webhook não configurado",
        description: `Por favor, configure o webhook para ${currentMessage.messageType} nas configurações antes de enviar mensagens.`,
        variant: "destructive",
      });
      return;
    }

    // Determinar destinatários baseado nos filtros
    let filteredLeads = leads;
    let filterDescription = 'Todos os leads';

    if (currentMessage.filterType === 'course' && currentMessage.filterValue) {
      filteredLeads = leads.filter((lead: any) => lead.course_id === currentMessage.filterValue);
      const courseName = courses.find((c: any) => c.id === currentMessage.filterValue)?.name;
      filterDescription = `Curso: ${courseName}`;
    } else if (currentMessage.filterType === 'event' && currentMessage.filterValue) {
      filteredLeads = leads.filter((lead: any) => lead.event_id === currentMessage.filterValue);
      const eventName = events.find((e: any) => e.id === currentMessage.filterValue)?.name;
      filterDescription = `Evento: ${eventName}`;
    }

    try {
      // Salvar no histórico de mensagens
      const { error } = await supabase
        .from('message_history')
        .insert([{
          type: currentMessage.messageType,
          filter_type: currentMessage.filterType,
          filter_value: currentMessage.filterValue || null,
          recipients_count: filteredLeads.length,
          content: currentMessage.content,
          status: 'sending'
        }]);

      if (error) throw error;

      // Preparar dados para webhook
      const webhookData = {
        type: currentMessage.messageType,
        content: currentMessage.content,
        recipients: filteredLeads.map((lead: any) => ({
          name: lead.name,
          whatsapp: lead.whatsapp,
          email: lead.email
        }))
      };

      // Enviar para webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status} ${response.statusText}`);
      }

      toast({
        title: "Mensagem enviada",
        description: `Mensagem enviada para ${filteredLeads.length} destinatários via ${currentMessage.messageType}!`,
      });

      setCurrentMessage({
        content: '',
        filterType: 'all',
        filterValue: '',
        messageType: 'whatsapp'
      });

      // Recarregar histórico
      queryClient.invalidateQueries({ queryKey: ['message_history'] });

    } catch (error: any) {
      toast({
        title: "Erro no envio",
        description: error.message || "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!templateDialog.name || !templateDialog.content) {
      toast({
        title: "Erro",
        description: "Por favor, preencha nome e conteúdo do template.",
        variant: "destructive",
      });
      return;
    }

    createTemplate.mutate({
      name: templateDialog.name,
      content: templateDialog.content,
      type: templateDialog.type
    });

    setTemplateDialog({
      open: false,
      name: '',
      content: '',
      type: 'whatsapp'
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await supabase.from('message_templates').delete().eq('id', templateId);
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      toast({
        title: "Template removido",
        description: "Template removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao remover template",
        variant: "destructive",
      });
    }
  };

  const useTemplate = (template: any) => {
    setCurrentMessage({
      ...currentMessage,
      content: template.content,
      messageType: template.type
    });
    toast({
      title: "Template aplicado",
      description: "Conteúdo do template foi aplicado à mensagem.",
    });
  };

  const getRecipientCount = () => {
    if (currentMessage.filterType === 'all') {
      return leads.length;
    } else if (currentMessage.filterType === 'course' && currentMessage.filterValue) {
      return leads.filter((lead: any) => lead.course_id === currentMessage.filterValue).length;
    } else if (currentMessage.filterType === 'event' && currentMessage.filterValue) {
      return leads.filter((lead: any) => lead.event_id === currentMessage.filterValue).length;
    }
    return 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Mensagem</CardTitle>
              <CardDescription>
                Envie mensagens para leads. Se nenhum filtro for selecionado, será enviado para todos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Mensagem</Label>
                  <Select 
                    value={currentMessage.messageType} 
                    onValueChange={(value: 'whatsapp' | 'email' | 'sms') => 
                      setCurrentMessage({...currentMessage, messageType: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>E-mail</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>SMS</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filtrar por</Label>
                  <Select 
                    value={currentMessage.filterType} 
                    onValueChange={(value: 'course' | 'event' | 'all') => 
                      setCurrentMessage({...currentMessage, filterType: value, filterValue: ''})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os leads</SelectItem>
                      <SelectItem value="course">Curso</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentMessage.filterType !== 'all' && (
                  <div className="space-y-2">
                    <Label>
                      {currentMessage.filterType === 'course' ? 'Curso' : 'Evento'}
                    </Label>
                    <Select 
                      value={currentMessage.filterValue} 
                      onValueChange={(value) => 
                        setCurrentMessage({...currentMessage, filterValue: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(currentMessage.filterType === 'course' ? courses : events).map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Destinatários:</strong> {getRecipientCount()} leads serão incluídos neste envio
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message-content">Conteúdo da Mensagem</Label>
                <Textarea
                  id="message-content"
                  placeholder="Digite sua mensagem aqui... Use {nome} para personalizar com o nome do lead."
                  value={currentMessage.content}
                  onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
                  rows={6}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                
                <Dialog open={templateDialog.open} onOpenChange={(open) => setTemplateDialog({...templateDialog, open})}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar como Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Salvar Template</DialogTitle>
                      <DialogDescription>
                        Salve esta mensagem como template para usar posteriormente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Nome do Template</Label>
                        <Input
                          id="template-name"
                          value={templateDialog.name}
                          onChange={(e) => setTemplateDialog({...templateDialog, name: e.target.value})}
                          placeholder="Ex: Boas-vindas Medicina"
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-content">Conteúdo</Label>
                        <Textarea
                          id="template-content"
                          value={templateDialog.content || currentMessage.content}
                          onChange={(e) => setTemplateDialog({...templateDialog, content: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select 
                          value={templateDialog.type} 
                          onValueChange={(value: 'whatsapp' | 'email' | 'sms') => 
                            setTemplateDialog({...templateDialog, type: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setTemplateDialog({...templateDialog, open: false})}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveTemplate}>
                        Salvar Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates Salvos</CardTitle>
              <CardDescription>
                Gerencie seus templates de mensagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template: any) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => useTemplate(template)}
                          >
                            Usar Template
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum template salvo ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>
                Acompanhe o histórico de todas as mensagens enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messageHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Filtro</TableHead>
                      <TableHead>Destinatários</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conteúdo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messageHistory.map((message: any) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          {new Date(message.sent_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{message.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {message.filter_type === 'all' ? 'Todos' : message.filter_type}
                        </TableCell>
                        <TableCell>{message.recipients_count}</TableCell>
                        <TableCell>
                          <Badge variant={message.status === 'sent' ? 'default' : 'secondary'}>
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {message.content}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum histórico de mensagens ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
