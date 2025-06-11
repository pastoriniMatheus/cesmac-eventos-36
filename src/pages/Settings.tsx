import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting, useCourses, useCreateCourse, useLeadStatuses, useCreateLeadStatus } from '@/hooks/useSupabaseData';
import StatusEditor from '@/components/StatusEditor';
import EventManager from '@/components/EventManager';

const Settings = () => {
  const { data: settings, isLoading, refetch } = useSystemSettings();
  const { toast } = useToast();
  const updateSetting = useUpdateSystemSetting();
  const { data: courses } = useCourses();
  const { mutate: createCourse } = useCreateCourse();
  const { data: leadStatuses } = useLeadStatuses();
  const { mutate: createLeadStatus } = useCreateLeadStatus();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');

  useEffect(() => {
    if (settings) {
      const whatsappSetting = settings.find(s => s.key === 'whatsapp_number');
      const templateSetting = settings.find(s => s.key === 'message_template');

      setWhatsappNumber(whatsappSetting?.value || '');
      setMessageTemplate(templateSetting?.value || '');
    }
  }, [settings]);

  const handleWhatsappNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(e.target.value);
  };

  const handleMessageTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageTemplate(e.target.value);
  };

  const handleSaveWhatsappNumber = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'whatsapp_number', value: whatsappNumber });
      toast({
        title: "Número do WhatsApp salvo",
        description: "Número do WhatsApp salvo com sucesso!",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar número do WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleSaveMessageTemplate = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'message_template', value: messageTemplate });
      toast({
        title: "Template de mensagem salvo",
        description: "Template de mensagem salvo com sucesso!",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar template de mensagem",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
      
      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do WhatsApp</CardTitle>
          <CardDescription>
            Configure o número do WhatsApp e o template de mensagem padrão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
            <Input 
              type="tel" 
              id="whatsappNumber" 
              placeholder="5511999999999" 
              value={whatsappNumber}
              onChange={handleWhatsappNumberChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="messageTemplate">Template de Mensagem</Label>
            <Input 
              type="text" 
              id="messageTemplate" 
              placeholder="Olá, tudo bem?" 
              value={messageTemplate}
              onChange={handleMessageTemplateChange}
            />
          </div>
          <Button onClick={handleSaveWhatsappNumber}>Salvar Número</Button>
          <Button onClick={handleSaveMessageTemplate}>Salvar Template</Button>
        </CardContent>
      </Card>

      {/* Event Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Eventos</CardTitle>
          <CardDescription>
            Visualize e exclua eventos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventManager />
        </CardContent>
      </Card>

      <Separator />

      {/* Course Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Cursos</CardTitle>
          <CardDescription>
            Adicione e gerencie os cursos oferecidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusEditor 
            title="Novo Curso"
            description="Adicione um novo curso à lista"
            items={courses}
            onCreate={createCourse}
            itemName="curso"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Lead Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Status de Lead</CardTitle>
          <CardDescription>
            Adicione e gerencie os status dos leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusEditor 
            title="Novo Status"
            description="Adicione um novo status à lista"
            items={leadStatuses}
            onCreate={createLeadStatus}
            itemName="status"
            withColor
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
