
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Target, TrendingUp } from 'lucide-react';
import { useEnrollmentMetrics } from '@/hooks/useEnrollmentMetrics';

const EnrollmentMetrics = () => {
  const { data: metrics, isLoading } = useEnrollmentMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse bg-muted h-4 rounded w-3/4 mb-2"></div>
                <div className="animate-pulse bg-muted h-8 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Gerais de Matriculados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads capturados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matriculados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              Leads matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Matrícula</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.enrollmentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Lead → Matrícula
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.enrollmentByEvent.length}</div>
            <p className="text-xs text-muted-foreground">
              Com matrículas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matriculados por Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Matrículas por Evento</CardTitle>
          <CardDescription>
            Performance de matrículas por evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.enrollmentByEvent.length > 0 ? (
            <div className="space-y-3">
              {metrics.enrollmentByEvent.map((event) => (
                <div key={event.eventId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.eventName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {event.enrolledCount}/{event.totalLeads}
                        </Badge>
                        <Badge 
                          variant={event.enrollmentRate >= 50 ? "default" : event.enrollmentRate >= 25 ? "secondary" : "destructive"}
                        >
                          {event.enrollmentRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(event.enrollmentRate, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.enrolledCount} matriculados de {event.totalLeads} leads
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma matrícula registrada ainda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentMetrics;
