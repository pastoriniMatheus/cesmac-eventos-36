
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnrollmentMetrics = () => {
  return useQuery({
    queryKey: ['enrollment_metrics'],
    queryFn: async () => {
      try {
        // Buscar todos os leads
        const { data: allLeads, error: leadsError } = await supabase
          .from('leads')
          .select(`
            *,
            status:lead_statuses(name),
            event:events(name)
          `);
        
        if (leadsError) throw leadsError;

        // Buscar todos os eventos
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*');
        
        if (eventsError) throw eventsError;

        const totalLeads = allLeads?.length || 0;
        
        // Leads matriculados (status "matriculado")
        const enrolledLeads = allLeads?.filter(lead => 
          lead.status?.name?.toLowerCase() === 'matriculado'
        ) || [];
        
        const totalEnrolled = enrolledLeads.length;
        const enrollmentRate = totalLeads > 0 ? (totalEnrolled / totalLeads) * 100 : 0;

        // Matriculados por evento
        const enrollmentByEvent = events?.map(event => {
          const eventLeads = allLeads?.filter(lead => lead.event_id === event.id) || [];
          const eventEnrolled = enrolledLeads.filter(lead => lead.event_id === event.id);
          const eventEnrollmentRate = eventLeads.length > 0 ? (eventEnrolled.length / eventLeads.length) * 100 : 0;
          
          return {
            eventId: event.id,
            eventName: event.name,
            totalLeads: eventLeads.length,
            enrolledCount: eventEnrolled.length,
            enrollmentRate: eventEnrollmentRate
          };
        }).filter(item => item.totalLeads > 0) || [];

        return {
          totalLeads,
          totalEnrolled,
          enrollmentRate,
          enrollmentByEvent
        };
      } catch (error) {
        console.error('Error fetching enrollment metrics:', error);
        return {
          totalLeads: 0,
          totalEnrolled: 0,
          enrollmentRate: 0,
          enrollmentByEvent: []
        };
      }
    }
  });
};
