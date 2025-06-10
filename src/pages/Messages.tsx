
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, Smartphone, Save, Send, Image, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  content: string;
  type: 'whatsapp' | 'email' | 'sms';
  createdAt: string;
}

interface MessageHistory {
  id: string;
  type: 'whatsapp' | 'email' | 'sms';
  filter: string;
  recipients: number;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  webhookResponse?: string;
}

const Messages = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Boas-vindas Medicina',
      content: 'Olá {nome}! Obrigado pelo interesse no curso de Medicina da CESMAC. Em breve entraremos em contato!',
      type: 'whatsapp',
      createdAt: '2024-06-01T10:00:00'
    }
  ]);

  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([
    {
      id: '1',
      type: 'whatsapp',
      filter: 'Curso: Medicina',
      recipients: 25,
      content: 'Mensagem de boas-vindas para interessados em Medicina',
      status: 'sent',
      sentAt: '2024-06-08T14:30:00'
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState({
    content: '',
    filterType: 'course' as 'course' | 'event',
    filterValue: '',
    messageType: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    recipients: [] as string[]
  });

  const [templateDialog, setTemplateDialog] = useState({
    open: false,
    name: '',
    content: '',
    type: 'whatsapp' as 'whatsapp' | 'email' | 'sms'
  });

  const courses = ['Medicina', 'Engenharia', 'Direito', 'Administração', 'Psicologia'];
  const events = ['Feira Estudante 23', 'Open Day CESMAC', 'Workshop TI', 'Palestra Medicina'];

  const webhookUrls = {
    whatsapp: 'https://api.exemplo.com/whatsapp/send',
    email: 'https://api.exemplo.com/email/send',
    sms: 'https://api.exemplo.com/sms/send'
  };

  const handleSendMessage = async () => {
    if (!currentMessage.content) {
      toast({
        title: "Erro",
        description: "Por favor, digite o conteúdo da mensagem.",
        variant: "destructive",
      });
      return;
    }

    if (!currentMessage.filterValue) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um filtro para os destinatários.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = webhookUrls[currentMessage.messageType];
    
    try {
      const messageData = {
        content: currentMessage.content,
        filterType: currentMessage.filterType,
        filterValue: currentMessage.filterValue,
        recipients: currentMessage.recipients
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      const newHistoryEntry: MessageHistory = {
        id: Date.now().toString(),
        type: currentMessage.messageType,
        filter: `${currentMessage.filterType === 'course' ? 'Curso' : 'Evento'}: ${currentMessage.filterValue}`,
        recipients: currentMessage.recipients.length || 0,
        content: currentMessage.content.substring(0, 50) + '...',
        status: response.ok ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
        webhookResponse: response.ok ? 'Sucesso' : 'Falha na comunicação'
      };

      setMessageHistory([newHistoryEntry, ...messageHistory]);

      if (response.ok) {
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada com sucesso via ${currentMessage.messageType}!`,
        });
        
        setCurrentMessage({
          content: '',
          filterType: 'course',
          filterValue: '',
          messageType: 'whatsapp',
          recipients: []
        });
      } else {
        throw new Error('Webhook failed');
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar mensagem. Verifique as configurações do webhook.",
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

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateDialog.name,
      content: templateDialog.content,
      type: templateDialog.type,
      createdAt: new Date().toISOString()
    };

    setTemplates([...templates, newTemplate]);
    setTemplateDialog({
      open: false,
      name: '',
      content: '',
      type: 'whatsapp'
    });

    toast({
      title: "Template salvo",
      description: "Template salvo com sucesso!",
    });
  };

  const loadTemplate = (template: Template) => {
    setCurrentMessage({
      ...currentMessage,
      content: template.content,
      messageType: template.type
    });

    toast({
      title: "Template carregado",
      description: `Template "${template.name}" carregado com sucesso!`,
    });
  };

  const getStatusBadge = (status: MessageHistory['status']) => {
    const colors = {
      sent: 'bg-green-500',
      failed: 'bg-red-500',
      pending: 'bg-yellow-500'
    };
    
    const labels = {
      sent: 'Enviado',
      failed: 'Falhou',
      pending: 'Pendente'
    };

    return (
      <Badge variant="secondary" className={`${colors[status]} text-white`}>
        {labels[status]}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
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
                Envie mensagens em massa para leads filtrados por curso ou evento
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
                    onValueChange={(value: 'course' | 'event') => 
                      setCurrentMessage({...currentMessage, filterType: value, filterValue: ''})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Curso</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      {(currentMessage.filterType === 'course' ? courses : events).map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Image className="h-4 w-4 mr-2" />
                  Anexar Imagem
                </Button>
                <span className="text-sm text-muted-foreground">
                  Nenhuma imagem selecionada
                </span>
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
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => loadTemplate(template)}
                      >
                        Carregar
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em: {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum template salvo ainda
                  </p>
                )}
              </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Filtro</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messageHistory.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(message.type)}
                          <span className="capitalize">{message.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{message.filter}</TableCell>
                      <TableCell>{message.recipients}</TableCell>
                      <TableCell className="max-w-xs truncate">{message.content}</TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        {new Date(message.sentAt).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {messageHistory.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma mensagem enviada ainda
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
