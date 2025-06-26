
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useEvents } from '@/hooks/useEvents';
import { useCourses } from '@/hooks/useCourses';
import { useConversionMetrics } from '@/hooks/useMetrics';
import ConversionMetrics from '@/components/ConversionMetrics';
import SessionMetrics from '@/components/SessionMetrics';
import EnrollmentMetrics from '@/components/EnrollmentMetrics';
import EventReportGenerator from '@/components/EventReportGenerator';
import DashboardVisibilityMenu, { DashboardVisibility } from '@/components/DashboardVisibilityMenu';
import LeadsByEventChart from '@/components/LeadsByEventChart';
import LeadsByCourseChart from '@/components/LeadsByCourseChart';
import CourseRanking from '@/components/CourseRanking';
import EventRanking from '@/components/EventRanking';
import { 
  Users, 
  QrCode, 
  Calendar, 
  TrendingUp,
  Eye,
  UserPlus,
  Target,
  Activity,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { data: leads = [] } = useLeads();
  const { data: qrCodes = [] } = useQRCodes();
  const { data: events = [] } = useEvents();
  const { data: courses = [] } = useCourses();
  const { data: metrics } = useConversionMetrics();

  const [visibility, setVisibility] = useState<DashboardVisibility>({
    stats: true,
    leadsByEvent: true,
    leadsByCourse: true,
    rankings: true,
    conversion: true
  });

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0);
  const todayLeads = leads.filter(lead => {
    const today = new Date().toDateString();
    const leadDate = new Date(lead.created_at).toDateString();
    return today === leadDate;
  }).length;

  const conversionRate = totalScans > 0 ? ((leads.length / totalScans) * 100).toFixed(1) : '0';
  const lastUpdate = new Date().toLocaleString('pt-BR');

  const statsCards = [
    {
      title: 'Total de Leads',
      value: leads.length.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Leads Hoje',
      value: todayLeads.toLocaleString(),
      icon: UserPlus,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'QR Codes Ativos',
      value: qrCodes.length.toLocaleString(),
      icon: QrCode,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Total de Scans',
      value: totalScans.toLocaleString(),
      icon: Eye,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Eventos Ativos',
      value: events.length.toLocaleString(),
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: Target,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent mb-2">
                Dashboard Executivo
              </h1>
              <p className="text-gray-600">Visão geral do seu sistema de captação de leads</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 flex items-center">
                <RefreshCw className="h-4 w-4 mr-1" />
                Última atualização: {lastUpdate}
              </div>
              <EventReportGenerator />
              <DashboardVisibilityMenu 
                visibility={visibility} 
                onVisibilityChange={setVisibility} 
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {visibility.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <Card key={index} className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Leads by Event */}
          {visibility.leadsByEvent && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Leads por Evento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <LeadsByEventChart leads={leads} events={events} />
              </CardContent>
            </Card>
          )}

          {/* Leads by Course */}
          {visibility.leadsByCourse && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Leads por Curso</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <LeadsByCourseChart leads={leads} courses={courses} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rankings Section */}
        {visibility.rankings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Cursos Mais Procurados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CourseRanking leads={leads} courses={courses} />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Eventos com Mais Capturas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <EventRanking leads={leads} events={events} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversion Metrics */}
        {visibility.conversion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Métricas de Conversão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ConversionMetrics leads={leads} events={events} totalScans={totalScans} />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Métricas de Sessão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SessionMetrics />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrollment Metrics */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Métricas de Matrícula</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EnrollmentMetrics />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
