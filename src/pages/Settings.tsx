
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, MessageSquare, BookOpen, GraduationCap, Webhook, Palette, Eye, FileText, Globe } from 'lucide-react';
import CourseManager from '@/components/CourseManager';
import PostgraduateCourseManager from '@/components/PostgraduateCourseManager';
import StatusManager from '@/components/StatusManager';
import DatabaseExport from '@/components/DatabaseExport';
import DatabaseInstaller from '@/components/DatabaseInstaller';
import WebhookSettings from '@/components/WebhookSettings';
import VisualSettings from '@/components/VisualSettings';
import FormSettings from '@/components/FormSettings';
import ApiDocumentation from '@/components/ApiDocumentation';

const Settings = () => {
  const [activeMainTab, setActiveMainTab] = useState('webhooks');
  const [activeCourseTab, setActiveCourseTab] = useState('cursos');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">Configurações do Sistema</h1>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Visual</span>
          </TabsTrigger>
          <TabsTrigger value="formulario" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Formulário</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Status</span>
          </TabsTrigger>
          <TabsTrigger value="cursos" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Cursos</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="banco" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Banco de Dados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <WebhookSettings />
        </TabsContent>

        <TabsContent value="visual">
          <VisualSettings />
        </TabsContent>

        <TabsContent value="formulario">
          <FormSettings />
        </TabsContent>

        <TabsContent value="status">
          <StatusManager />
        </TabsContent>

        <TabsContent value="cursos">
          <Tabs value={activeCourseTab} onValueChange={setActiveCourseTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cursos" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Cursos</span>
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Pós</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cursos">
              <CourseManager />
            </TabsContent>

            <TabsContent value="pos">
              <PostgraduateCourseManager />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="api">
          <ApiDocumentation />
        </TabsContent>

        <TabsContent value="banco">
          <div className="space-y-6">
            <DatabaseInstaller />
            <DatabaseExport />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
