
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, GraduationCap } from 'lucide-react';

interface ConversionMetricsProps {
  leads: any[];
  events: any[];
  totalScans: number;
}

const ConversionMetrics = ({ leads, events, totalScans }: ConversionMetricsProps) => {
  // Calcular leads matriculados (assumindo que existe um status "Matriculado")
  const enrolledLeads = leads.filter((lead: any) => 
    lead.status?.name?.toLowerCase().includes('matriculado') || 
    lead.status?.name?.toLowerCase().includes('inscrito')
  );

  const totalLeads = leads.length;
  
  // Taxa de conversão geral (leads matriculados / total de leads)
  const generalConversionRate = totalLeads > 0 ? ((enrolledLeads.length / totalLeads) * 100).toFixed(1) : '0.0';
  
  // Taxa de conversão por scan (leads totais / scans)
  const scanConversionRate = totalScans > 0 ? ((totalLeads / totalScans) * 100).toFixed(1) : '0.0';
  
  // Taxa de matriculados por scan
  const enrollmentScanRate = totalScans > 0 ? ((enrolledLeads.length / totalScans) * 100).toFixed(1) : '0.0';

  // Conversão por evento
  const eventConversions = events.map((event: any) => {
    const eventLeads = leads.filter((lead: any) => lead.event_id === event.id);
    const eventEnrolled = eventLeads.filter((lead: any) => 
      lead.status?.name?.toLowerCase().includes('matriculado') || 
      lead.status?.name?.toLowerCase().includes('inscrito')
    );
    
    const conversionRate = eventLeads.length > 0 ? ((eventEnrolled.length / eventLeads.length) * 100).toFixed(1) : '0.0';
    
    return {
      eventName: event.name,
      totalLeads: eventLeads.length,
      enrolledLeads: eventEnrolled.length,
      conversionRate: parseFloat(conversionRate)
    };
  }).filter(event => event.totalLeads > 0);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas de Conversão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalConversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {enrolledLeads.length} matriculados de {totalLeads} leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads por Scan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanConversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalLeads} leads de {totalScans} scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matriculados por Scan</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentScanRate}%</div>
            <p className="text-xs text-muted-foreground">
              {enrolledLeads.length} matriculados de {totalScans} scans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Conversão por Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão por Evento</CardTitle>
          <CardDescription>Percentual de leads que se matricularam por evento</CardDescription>
        </CardHeader>
        <CardContent>
          {eventConversions.length > 0 ? (
            <div className="space-y-3">
              {eventConversions
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .map((event, index) => (
                <div key={event.eventName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium">{event.eventName}</span>
                      <p className="text-sm text-muted-foreground">
                        {event.enrolledLeads} matriculados de {event.totalLeads} leads
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{event.conversionRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento com leads para calcular conversão
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionMetrics;
