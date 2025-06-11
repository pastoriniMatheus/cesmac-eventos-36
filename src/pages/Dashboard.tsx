
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
import { useLeads, useEvents, useCourses, useQRCodes } from '@/hooks/useSupabaseData';
import DashboardVisibilityMenu, { DashboardVisibility } from '@/components/DashboardVisibilityMenu';
import ConversionMetrics from '@/components/ConversionMetrics';
import SessionMetrics from '@/components/SessionMetrics';
import EventReportGenerator from '@/components/EventReportGenerator';

const Dashboard = () => {
  const { data: leads = [] } = useLeads();
  const { data: events = [] } = useEvents();
  const { data: courses = [] } = useCourses();
  const { data: qrCodes = [] } = useQRCodes();

  const [visibility, setVisibility] = useState<DashboardVisibility>({
    stats: true,
    leadsByEvent: true,
    leadsByCourse: true,
    rankings: true,
    conversion: true,
  });

  // Calcular dados reais do banco
  const totalLeads = leads.length;
  const totalEvents = events.length;
  const totalCourses = courses.length;
  const totalScans = qrCodes.reduce((sum: number, qr: any) => sum + (qr.scans || 0), 0);

  // Leads por evento
  const leadsByEvent = events.map((event: any) => ({
    name: event.name,
    leads: leads.filter((lead: any) => lead.event_id === event.id).length
  })).filter(item => item.leads > 0);

  // Leads por curso
  const leadsByCourse = courses.map((course: any) => ({
    name: course.name,
    leads: leads.filter((lead: any) => lead.course_id === course.id).length,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  })).filter(item => item.leads > 0);

  // Top cursos
  const topCourses = leadsByCourse
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 3)
    .map((course, index) => ({
      rank: index + 1,
      course: course.name,
      leads: course.leads
    }));

  // Top eventos
  const topEvents = leadsByEvent
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 3)
    .map((event, index) => ({
      rank: index + 1,
      event: event.name,
      leads: event.leads
    }));

  // Calcular taxa de conversão (leads/scans se houver scans)
  const conversionRate = totalScans > 0 ? ((totalLeads / totalScans) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard CESMAC</h1>
        <div className="flex items-center gap-4">
          <EventReportGenerator />
          <DashboardVisibilityMenu 
            visibility={visibility} 
            onVisibilityChange={setVisibility} 
          />
          <div className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {visibility.stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Leads capturados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">Eventos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Leads por scan</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session Tracking Metrics */}
      {visibility.conversion && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Rastreamento de Sessões</h2>
          <SessionMetrics />
        </div>
      )}

      {/* Conversion Metrics */}
      {visibility.conversion && (
        <div className="mt-8">
          <ConversionMetrics 
            leads={leads}
            events={events}
            totalScans={totalScans}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibility.leadsByEvent && (
          <Card>
            <CardHeader>
              <CardTitle>Leads por Evento</CardTitle>
              <CardDescription>Quantidade de leads capturados por evento</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsByEvent.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadsByEvent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado de eventos disponível
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {visibility.leadsByCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Leads por Curso</CardTitle>
              <CardDescription>Distribuição de interesse por curso</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsByCourse.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadsByCourse}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="leads"
                    >
                      {leadsByCourse.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado de cursos disponível
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rankings */}
      {visibility.rankings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ranking - Cursos Mais Procurados</CardTitle>
            </CardHeader>
            <CardContent>
              {topCourses.length > 0 ? (
                <div className="space-y-3">
                  {topCourses.map((item) => (
                    <div key={item.rank} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {item.rank}
                        </div>
                        <span className="font-medium">{item.course}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.leads} leads</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum curso com leads ainda
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking - Eventos com Mais Capturas</CardTitle>
            </CardHeader>
            <CardContent>
              {topEvents.length > 0 ? (
                <div className="space-y-3">
                  {topEvents.map((item) => (
                    <div key={item.rank} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-secondary text-secondary-foreground rounded-full text-sm font-bold">
                          {item.rank}
                        </div>
                        <span className="font-medium">{item.event}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.leads} leads</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento com leads ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
