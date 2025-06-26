import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, Mail, Smartphone, Save, Send, Trash2, Smile } from 'lucide-react';
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
    name: ''
  });

  // Lista completa de emojis organizados por categoria
  const emojiCategories = {
    'Rostos e Pessoas': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
    'Animais e Natureza': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫'],
    'Comida e Bebida': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
    'Atividades': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'],
    'Objetos': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪣', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📅', '📆', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
    'Símbolos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
  };

  // Obter webhook configurado com verificação melhorada
  const getWebhookUrl = (type: string) => {
    console.log('🔍 Buscando webhook para tipo:', type);
    console.log('📊 Configurações disponíveis:', systemSettings);
    
    const webhookKey = `webhook_${type}`;
    const webhookSetting = systemSettings.find((s: any) => s.key === webhookKey);
    
    console.log('🔑 Chave buscada:', webhookKey);
    console.log('⚙️ Configuração encontrada:', webhookSetting);
    
    if (!webhookSetting) {
      console.log('❌ Webhook não encontrado para chave:', webhookKey);
      return null;
    }
    
    let webhookUrl;
    try {
      // Tentar como string primeiro
      webhookUrl = typeof webhookSetting.value === 'string' ? 
        webhookSetting.value : 
        JSON.parse(String(webhookSetting.value));
    } catch (e) {
      console.error('❌ Erro ao processar valor do webhook:', e);
      return null;
    }
    
    console.log('🌐 URL do webhook processada:', webhookUrl);
    return webhookUrl;
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
    console.log('🔍 Webhook URL obtida:', webhookUrl);
    console.log('📋 Tipo de mensagem:', currentMessage.messageType);
    
    if (!webhookUrl) {
      console.error('❌ Webhook não configurado para tipo:', currentMessage.messageType);
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

    if (filteredLeads.length === 0) {
      toast({
        title: "Nenhum destinatário",
        description: "Não há leads para enviar mensagens com os filtros selecionados.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📤 Iniciando envio de mensagem:', {
        type: currentMessage.messageType,
        recipients: filteredLeads.length,
        webhookUrl,
        content: currentMessage.content.substring(0, 50) + '...'
      });

      // Salvar no histórico de mensagens
      const { error: historyError } = await supabase
        .from('message_history')
        .insert([{
          type: currentMessage.messageType,
          filter_type: currentMessage.filterType,
          filter_value: currentMessage.filterValue || null,
          recipients_count: filteredLeads.length,
          content: currentMessage.content,
          status: 'sending'
        }]);

      if (historyError) {
        console.error('❌ Erro ao salvar histórico:', historyError);
        throw new Error('Erro ao salvar no histórico: ' + historyError.message);
      }

      // Preparar dados para webhook
      const webhookData = {
        type: currentMessage.messageType,
        content: currentMessage.content,
        recipients: filteredLeads.map((lead: any) => ({
          name: lead.name,
          whatsapp: lead.whatsapp,
          email: lead.email
        })),
        metadata: {
          filter_type: currentMessage.filterType,
          filter_description: filterDescription,
          timestamp: new Date().toISOString(),
          total_recipients: filteredLeads.length
        }
      };

      console.log('📋 Dados do webhook preparados:', {
        url: webhookUrl,
        recipientsCount: webhookData.recipients.length,
        type: webhookData.type,
        filterType: webhookData.metadata.filter_type
      });

      // Usar Supabase Edge Function para enviar webhook
      console.log('🚀 Enviando via Supabase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          webhook_url: webhookUrl,
          webhook_data: webhookData
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message || 'Erro na função de envio');
      }

      console.log('✅ Webhook executado com sucesso via Edge Function:', data);

      toast({
        title: "Mensagem enviada",
        description: `Mensagem ${currentMessage.messageType} enviada para ${filteredLeads.length} destinatários!`,
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
      console.error('💥 Erro no envio da mensagem:', error);
      
      let errorMessage = error.message || "Erro ao enviar mensagem";
      
      // Melhorar mensagens de erro baseadas no tipo
      if (errorMessage.includes('non-2xx status code')) {
        errorMessage = `Erro no webhook: Verifique se a URL ${webhookUrl} está configurada corretamente no n8n e se o workflow está ativo.`;
      } else if (errorMessage.includes('404')) {
        errorMessage = `Webhook não encontrado: A URL ${webhookUrl} retornou 404. Verifique se o endpoint existe no n8n.`;
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Timeout na requisição: O webhook demorou mais de 30 segundos para responder.';
      }
      
      toast({
        title: "Erro no envio",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!templateDialog.name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do template.",
        variant: "destructive",
      });
      return;
    }

    if (!currentMessage.content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o conteúdo da mensagem antes de salvar o template.",
        variant: "destructive",
      });
      return;
    }

    createTemplate.mutate({
      name: templateDialog.name,
      content: currentMessage.content,
      type: currentMessage.messageType
    });

    setTemplateDialog({
      open: false,
      name: ''
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

  const insertEmoji = (emoji: string) => {
    setCurrentMessage({
      ...currentMessage,
      content: currentMessage.content + emoji
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
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mensagens</h1>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="text-xs sm:text-sm">Enviar</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Nova Mensagem</CardTitle>
              <CardDescription className="text-sm">
                Envie mensagens para leads. Se nenhum filtro for selecionado, será enviado para todos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tipo de Mensagem</Label>
                  <Select 
                    value={currentMessage.messageType} 
                    onValueChange={(value: 'whatsapp' | 'email' | 'sms') => 
                      setCurrentMessage({...currentMessage, messageType: value})
                    }
                  >
                    <SelectTrigger className="h-9">
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
                  <Label className="text-sm">Filtrar por</Label>
                  <Select 
                    value={currentMessage.filterType} 
                    onValueChange={(value: 'course' | 'event' | 'all') => 
                      setCurrentMessage({...currentMessage, filterType: value, filterValue: ''})
                    }
                  >
                    <SelectTrigger className="h-9">
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
                    <Label className="text-sm">
                      {currentMessage.filterType === 'course' ? 'Curso' : 'Evento'}
                    </Label>
                    <Select 
                      value={currentMessage.filterValue} 
                      onValueChange={(value) => 
                        setCurrentMessage({...currentMessage, filterValue: value})
                      }
                    >
                      <SelectTrigger className="h-9">
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
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Destinatários:</strong> {getRecipientCount()} leads serão incluídos neste envio
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Webhook {currentMessage.messageType}:</strong> {
                    getWebhookUrl(currentMessage.messageType) ? 
                    `✅ Configurado (${getWebhookUrl(currentMessage.messageType)})` : 
                    '❌ Não configurado'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message-content" className="text-sm">Conteúdo da Mensagem</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Smile className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Emojis</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-96 overflow-auto" align="end">
                      <div className="space-y-4">
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                          <div key={category}>
                            <h4 className="text-sm font-semibold mb-2">{category}</h4>
                            <div className="grid grid-cols-8 gap-1">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => insertEmoji(emoji)}
                                  className="text-lg hover:bg-muted p-1 rounded transition-colors"
                                  type="button"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  id="message-content"
                  placeholder="Digite sua mensagem aqui... Use {nome} para personalizar com o nome do lead."
                  value={currentMessage.content}
                  onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                
                <Dialog open={templateDialog.open} onOpenChange={(open) => setTemplateDialog({...templateDialog, open})}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Save className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Salvar como Template</span>
                      <span className="sm:hidden">Template</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
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
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Conteúdo:</strong> Será salvo o conteúdo atual da mensagem
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Tipo:</strong> {currentMessage.messageType}
                        </p>
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
                          <h3 className="font-medium text-sm sm:text-base">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">{template.type}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => useTemplate(template)}
                            className="text-xs"
                          >
                            Usar
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
                      <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Data</TableHead>
                        <TableHead className="text-xs">Tipo</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Filtro</TableHead>
                        <TableHead className="text-xs">Dest.</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Conteúdo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messageHistory.map((message: any) => (
                        <TableRow key={message.id}>
                          <TableCell className="text-xs">
                            {new Date(message.sent_at).toLocaleDateString('pt-BR')}
                            <div className="sm:hidden text-xs text-muted-foreground">
                              {new Date(message.sent_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{message.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">
                            {message.filter_type === 'all' ? 'Todos' : message.filter_type}
                          </TableCell>
                          <TableCell className="text-xs">{message.recipients_count}</TableCell>
                          <TableCell>
                            <Badge variant={message.status === 'sent' ? 'default' : 'secondary'} className="text-xs">
                              {message.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs hidden md:table-cell">
                            {message.content}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
