import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  Trophy
} from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import LeadsByEventChart from '@/components/LeadsByEventChart';
import LeadsByCourseChart from '@/components/LeadsByCourseChart';
import CourseRanking from '@/components/CourseRanking';
import EventRanking from '@/components/EventRanking';

const Dashboard = () => {
  const { toast } = useToast();
  const { data: leads = [] } = useLeads();
  const { data: courses = [] } = useCourses();
  const { data: events = [] } = useEvents();
  
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [visibleSections, setVisibleSections] = useState({
    metrics: true,
    eventChart: true,
    courseChart: true,
    courseRanking: true,
    eventRanking: true
  });

  const filteredLeads = selectedEvent === 'all'
    ? leads
    : leads.filter((lead: any) => lead.event_id === selectedEvent);

  const getLeadsToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredLeads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      leadDate.setHours(0, 0, 0, 0);
      return leadDate.getTime() === today.getTime();
    }).length;
  };

  const generateEventReport = () => {
    if (selectedEvent === 'all') {
      toast({
        title: "Erro",
        description: "Selecione um evento para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Relatório gerado",
      description: "O relatório do evento será gerado em breve.",
    });
  };

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header with mobile responsive title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full md:w-48 h-9 md:h-10">
              <SelectValue placeholder="Filtrar por evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os eventos</SelectItem>
              {events.map((event: any) => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={generateEventReport}
            className="h-9 md:h-10 text-sm"
            disabled={selectedEvent === 'all'}
          >
            <Download className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Relatório</span>
            <span className="md:hidden">PDF</span>
          </Button>
        </div>
      </div>

      {/* Visibility Controls - Mobile responsive */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center">
            <Eye className="h-4 w-4 mr-2 text-blue-600" />
            Controle de Visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(visibleSections).map(([key, visible]) => (
              <Button
                key={key}
                variant={visible ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSection(key as keyof typeof visibleSections)}
                className="h-8 text-xs justify-start"
              >
                {visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                {key === 'metrics' && 'Métricas'}
                {key === 'eventChart' && 'Gráfico Eventos'}
                {key === 'courseChart' && 'Gráfico Cursos'}
                {key === 'courseRanking' && 'Ranking Cursos'}
                {key === 'eventRanking' && 'Ranking Eventos'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards - Mobile responsive grid */}
      {visibleSections.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-blue-100">Total de Leads</p>
                  <p className="text-xl md:text-3xl font-bold">{filteredLeads.length}</p>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-green-100">Eventos Ativos</p>
                  <p className="text-xl md:text-3xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-purple-100">Cursos</p>
                  <p className="text-xl md:text-3xl font-bold">{courses.length}</p>
                </div>
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-orange-100">Hoje</p>
                  <p className="text-xl md:text-3xl font-bold">{getLeadsToday()}</p>
                </div>
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section - Mobile responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {visibleSections.eventChart && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
                Leads por Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <LeadsByEventChart leads={filteredLeads} events={events} />
            </CardContent>
          </Card>
        )}

        {visibleSections.courseChart && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center">
                <PieChart className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-600" />
                Leads por Curso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <LeadsByCourseChart leads={filteredLeads} courses={courses} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rankings Section - Mobile responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {visibleSections.courseRanking && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
                Ranking - Cursos Mais Procurados
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Os cursos com mais capturas de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <CourseRanking leads={filteredLeads} courses={courses} />
            </CardContent>
          </Card>
        )}

        {visibleSections.eventRanking && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-600" />
                Ranking - Eventos com Mais Capturas
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Os eventos que mais capturam leads
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <EventRanking leads={filteredLeads} events={events} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
