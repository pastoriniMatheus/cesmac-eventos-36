
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    leadsByEvent: [],
    leadsByCourse: [],
    topCourses: [],
    topEvents: []
  });

  useEffect(() => {
    // Simulated data - will be replaced with real API calls
    setDashboardData({
      totalLeads: 1247,
      leadsByEvent: [
        { name: 'Feira Estudante 23', leads: 345 },
        { name: 'Open Day CESMAC', leads: 298 },
        { name: 'Workshop TI', leads: 187 },
        { name: 'Palestra Medicina', leads: 156 }
      ],
      leadsByCourse: [
        { name: 'Medicina', leads: 412, color: '#8884d8' },
        { name: 'Engenharia', leads: 298, color: '#82ca9d' },
        { name: 'Direito', leads: 234, color: '#ffc658' },
        { name: 'Administração', leads: 187, color: '#ff7c7c' },
        { name: 'Psicologia', leads: 116, color: '#8dd1e1' }
      ],
      topCourses: [
        { rank: 1, course: 'Medicina', leads: 412 },
        { rank: 2, course: 'Engenharia', leads: 298 },
        { rank: 3, course: 'Direito', leads: 234 }
      ],
      topEvents: [
        { rank: 1, event: 'Feira Estudante 23', leads: 345 },
        { rank: 2, event: 'Open Day CESMAC', leads: 298 },
        { rank: 3, event: 'Workshop TI', leads: 187 }
      ]
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard CESMAC</h1>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% do mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.leadsByEvent.length}</div>
            <p className="text-xs text-muted-foreground">4 eventos em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.leadsByCourse.length}</div>
            <p className="text-xs text-muted-foreground">Cursos com leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% do mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads por Evento</CardTitle>
            <CardDescription>Quantidade de leads capturados por evento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.leadsByEvent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads por Curso</CardTitle>
            <CardDescription>Distribuição de interesse por curso</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.leadsByCourse}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="leads"
                >
                  {dashboardData.leadsByCourse.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ranking - Cursos Mais Procurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.topCourses.map((item) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking - Eventos com Mais Capturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.topEvents.map((item) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
