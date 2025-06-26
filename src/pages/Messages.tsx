import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { useMessageTemplates, useMessageHistory } from '@/hooks/useMessages';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Send, Copy, MessageSquare, History } from 'lucide-react';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: string;
  created_at: string;
}

interface MessageHistoryItem {
  id: string;
  template_name: string;
  recipients: string[];
  sent_at: string;
  status: string;
  type: string;
  response: string;
}

const Messages = () => {
  const { toast } = useToast();
  const { data: templates, isLoading: isLoadingTemplates } = useMessageTemplates();
  const { data: history, isLoading: isLoadingHistory } = useMessageHistory();
  const { data: settings, isLoading: isLoadingSettings } = useSystemSettings();

  const [messageType, setMessageType] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [recipients, setRecipients] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (templates && selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMessageContent(template.content);
      }
    }
  }, [selectedTemplate, templates]);

  const getWebhookUrl = (messageType: 'whatsapp' | 'email' | 'sms'): string => {
    console.log('🔑 Buscando webhook para tipo:', messageType);
    
    if (!settings) {
      console.log('⚠️ Settings não carregadas ainda');
      return '';
    }
    
    // Mapeamento correto das chaves no banco de dados
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
      
      // Verificar se o valor é string ou objeto
      if (typeof webhookSetting.value === 'string') {
        webhookUrl = webhookSetting.value;
      } else if (webhookSetting.value && typeof webhookSetting.value === 'object' && !Array.isArray(webhookSetting.value)) {
        // Se for objeto, verificar se tem propriedade 'url'
        const valueObj = webhookSetting.value as { [key: string]: any };
        if ('url' in valueObj) {
          webhookUrl = valueObj.url as string;
        }
      }
      
      console.log('🌐 URL do webhook processada:', webhookUrl);
      return webhookUrl || '';
    }
    
    console.log('❌ Webhook não encontrado para tipo:', messageType);
    return '';
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !recipients.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o conteúdo da mensagem e os destinatários.",
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

    const recipientsArray = recipients.split(',').map(r => r.trim());

    setIsSending(true);

    try {
      let response;
      switch (messageType) {
        case 'whatsapp':
          response = await handleSendWhatsApp(webhookUrl, recipientsArray, messageContent);
          break;
        case 'email':
          response = await handleSendEmail(webhookUrl, recipientsArray, messageContent);
          break;
        case 'sms':
          response = await handleSendSMS(webhookUrl, recipientsArray, messageContent);
          break;
        default:
          throw new Error("Tipo de mensagem inválido");
      }

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

  const handleSendWhatsApp = async (webhookUrl: string, recipients: string[], message: string) => {
    try {
      const webhook_data = {
        type: "whatsapp",
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

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error("Erro ao enviar WhatsApp:", error);
      return { error: error.message || "Erro ao enviar WhatsApp" };
    }
  };

  const handleSendEmail = async (webhookUrl: string, recipients: string[], message: string) => {
    try {
      const webhook_data = {
        type: "email",
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

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error("Erro ao enviar email:", error);
      return { error: error.message || "Erro ao enviar email" };
    }
  };

  const handleSendSMS = async (webhookUrl: string, recipients: string[], message: string) => {
    try {
      const webhook_data = {
        type: "sms",
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

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error("Erro ao enviar SMS:", error);
      return { error: error.message || "Erro ao enviar SMS" };
    }
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Enviar Mensagem</CardTitle>
          </div>
          <CardDescription>
            Envie mensagens personalizadas para seus contatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="messageType">Tipo de Mensagem</Label>
            <Select onValueChange={(value) => setMessageType(value as 'whatsapp' | 'email' | 'sms')}>
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
            <Select onValueChange={setSelectedTemplate}>
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

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo da Mensagem</Label>
            <Textarea
              id="content"
              placeholder="Digite sua mensagem aqui..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Destinatários (separados por vírgula)</Label>
            <Input
              id="recipients"
              placeholder="Ex: +5511999999999, email@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>

          <Button onClick={handleSendMessage} disabled={isSending} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <CardTitle>Histórico de Mensagens</CardTitle>
          </div>
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
                    Template
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.template_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.recipients.join(', ')}</td>
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
    </div>
  );
};

export default Messages;
