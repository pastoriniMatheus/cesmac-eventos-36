
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMessageTemplates, useMessageHistory, useCreateMessageTemplate } from '@/hooks/useMessages';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import { useLeads } from '@/hooks/useLeads';
import { Send, Copy, MessageSquare, History, Smile, Save, Filter, Users } from 'lucide-react';

const Messages = () => {
  const { toast } = useToast();
  const { data: templates, isLoading: isLoadingTemplates } = useMessageTemplates();
  const { data: history, isLoading: isLoadingHistory } = useMessageHistory();
  const { data: settings, isLoading: isLoadingSettings } = useSystemSettings();
  const { data: courses = [] } = useCourses();
  const { data: events = [] } = useEvents();
  const { data: leads = [] } = useLeads();
  const createTemplate = useCreateMessageTemplate();

  const [messageType, setMessageType] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'course' | 'event'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [recipients, setRecipients] = useState<string>('');
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // Emojis mais usados
  const commonEmojis = [
    '😀', '😊', '😍', '🤔', '😎', '🔥', '💪', '👍', '👏', '🎉',
    '❤️', '💯', '✨', '🚀', '📱', '💡', '📚', '🎯', '⭐', '🌟'
  ];

  useEffect(() => {
    if (templates && selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMessageContent(template.content);
      }
    }
  }, [selectedTemplate, templates]);

  useEffect(() => {
    let filtered = leads;
    
    if (filterType === 'course' && selectedCourse) {
      filtered = leads.filter(lead => lead.course_id === selectedCourse);
    } else if (filterType === 'event' && selectedEvent) {
      filtered = leads.filter(lead => lead.event_id === selectedEvent);
    }
    
    setFilteredLeads(filtered);
  }, [filterType, selectedCourse, selectedEvent, leads]);

  const getWebhookUrl = (messageType: 'whatsapp' | 'email' | 'sms'): string => {
    console.log('🔑 Buscando webhook para tipo:', messageType);
    
    if (!settings) {
      console.log('⚠️ Settings não carregadas ainda');
      return '';
    }
    
    const webhookKeyMap = {
      'whatsapp': 'webhook_whatsapp',
      'email': 'webhook_email', 
      'sms': 'webhook_sms'
    };
    
    const webhookKey = webhookKeyMap[messageType];
    console.log('🔑 Chave mapeada para busca:', webhookKey);
    
    const webhookSetting = settings.find(setting => setting.key === webhookKey);
    
    if (webhookSetting) {
      console.log('⚙️ Configuração encontrada:', webhookSetting);
      
      let webhookUrl = '';
      
      if (typeof webhookSetting.value === 'string') {
        webhookUrl = webhookSetting.value;
      } else if (webhookSetting.value && typeof webhookSetting.value === 'object' && !Array.isArray(webhookSetting.value)) {
        const valueObj = webhookSetting.value as { [key: string]: any };
        if ('url' in valueObj && typeof valueObj.url === 'string') {
          webhookUrl = valueObj.url;
        } else {
          webhookUrl = JSON.stringify(webhookSetting.value).replace(/["{},]/g, '');
        }
      }
      
      console.log('🌐 URL do webhook processada:', webhookUrl);
      return webhookUrl || '';
    }
    
    console.log('❌ Webhook não encontrado para tipo:', messageType);
    return '';
  };

  const getFilteredRecipients = () => {
    if (recipients.trim()) {
      return recipients.split(',').map(r => r.trim());
    }
    
    return filteredLeads.map(lead => {
      if (messageType === 'whatsapp') return lead.whatsapp;
      if (messageType === 'email') return lead.email;
      return lead.whatsapp; // default
    }).filter(Boolean);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o conteúdo da mensagem.",
        variant: "destructive",
      });
      return;
    }

    const recipientsArray = getFilteredRecipients();
    
    if (recipientsArray.length === 0) {
      toast({
        title: "Nenhum destinatário",
        description: "Selecione um filtro ou adicione destinatários manualmente.",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = getWebhookUrl(messageType);
    if (!webhookUrl) {
      toast({
        title: "Webhook não configurado",
        description: `URL do webhook para ${messageType} não está configurada.`,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await handleSendWithWebhook(webhookUrl, recipientsArray, messageContent);

      if (response?.error) {
        toast({
          title: "Erro ao enviar",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada com sucesso para ${recipientsArray.length} destinatários!`,
        });
      }

    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Erro desconhecido ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendWithWebhook = async (webhookUrl: string, recipients: string[], message: string) => {
    try {
      const webhook_data = {
        type: messageType,
        recipients: recipients,
        message: message
      };

      const response = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhook_url: webhookUrl, webhook_data: webhook_data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error(`Erro ao enviar ${messageType}:`, error);
      return { error: error.message || `Erro ao enviar ${messageType}` };
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !messageContent.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do template e o conteúdo da mensagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: templateName,
        content: messageContent,
        type: messageType
      });
      setTemplateName('');
      toast({
        title: "Template salvo",
        description: "Template salvo com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      });
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(messageContent)
      .then(() => {
        toast({
          title: "Copiado!",
          description: "Conteúdo da mensagem copiado para a área de transferência.",
        });
      })
      .catch(err => {
        console.error("Erro ao copiar:", err);
        toast({
          title: "Erro",
          description: "Falha ao copiar o conteúdo para a área de transferência.",
          variant: "destructive",
        });
      });
  };

  if (isLoadingTemplates || isLoadingHistory || isLoadingSettings) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
        <p className="text-gray-600 mt-2">Gerencie o envio de mensagens e templates</p>
      </div>

      <Tabs defaultValue="enviar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enviar" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enviar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Enviar Mensagem</span>
              </CardTitle>
              <CardDescription>
                Envie mensagens personalizadas para seus contatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="messageType">Tipo de Mensagem</Label>
                  <Select value={messageType} onValueChange={(value) => setMessageType(value as 'whatsapp' | 'email' | 'sms')}>
                    <SelectTrigger id="messageType">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Usar Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map(template => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Label>Filtrar Destinatários</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filterType">Tipo de Filtro</Label>
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'course' | 'event')}>
                      <SelectTrigger id="filterType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os leads</SelectItem>
                        <SelectItem value="course">Por curso</SelectItem>
                        <SelectItem value="event">Por evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filterType === 'course' && (
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso</Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger id="course">
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {filterType === 'event' && (
                    <div className="space-y-2">
                      <Label htmlFor="event">Evento</Label>
                      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger id="event">
                          <SelectValue placeholder="Selecione um evento" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map(event => (
                            <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Destinatários encontrados
                    </Label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {getFilteredRecipients().length} destinatários
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo da Mensagem</Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Digite sua mensagem aqui..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={6}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {showEmojiPicker && (
                  <div className="bg-white border rounded-lg p-3 shadow-lg">
                    <div className="grid grid-cols-10 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-xl hover:bg-gray-100 p-1 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Destinatários Manuais (separados por vírgula)</Label>
                <Input
                  id="recipients"
                  placeholder="Ex: +5511999999999, email@example.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Deixe vazio para usar apenas os destinatários filtrados
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSendMessage} disabled={isSending} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do template"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-40"
                  />
                  <Button onClick={handleSaveTemplate} variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Templates de Mensagem</span>
              </CardTitle>
              <CardDescription>
                Gerencie seus templates de mensagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates?.map(template => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {template.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.content.length > 100 
                        ? `${template.content.substring(0, 100)}...` 
                        : template.content
                      }
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setMessageContent(template.content);
                        }}
                      >
                        Usar Template
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyToClipboard()}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {templates && templates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum template encontrado. Crie um template na aba "Enviar".
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Histórico de Mensagens</span>
              </CardTitle>
              <CardDescription>
                Veja o histórico das mensagens enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Conteúdo
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Destinatários
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Enviado em
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history?.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.recipients_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.sent_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history && history.length === 0 && (
                  <div className="text-center py-4">Nenhuma mensagem enviada ainda.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
