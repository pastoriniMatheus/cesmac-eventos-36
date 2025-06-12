
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, MessageSquare, Webhook, QrCode, FileText } from 'lucide-react';
import { ItemManager } from '@/components/ItemManager';
import { EventManager } from '@/components/EventManager';
import FormSettings from '@/components/FormSettings';

const Settings = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie cursos, status de leads, eventos e outras configurações do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="statuses" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <ItemManager 
            title="Gerenciar Cursos" 
            description="Adicione, edite ou remova cursos disponíveis para seleção no formulário de leads"
            tableName="courses"
            itemName="curso"
          />
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <ItemManager 
            title="Gerenciar Status" 
            description="Configure os status disponíveis para classificar seus leads"
            tableName="lead_statuses"
            itemName="status"
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <EventManager />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <FormSettings />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configurações avançadas e integrações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações do sistema em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
