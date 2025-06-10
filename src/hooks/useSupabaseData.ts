

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useLeadStatuses = () => {
  return useQuery({
    queryKey: ['lead_statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_statuses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          course:courses(name),
          event:events(name),
          status:lead_statuses(name, color)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useQRCodes = () => {
  return useQuery({
    queryKey: ['qr_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          event:events(name, whatsapp_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateCourse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso adicionado",
        description: "Curso adicionado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar curso",
        variant: "destructive",
      });
    }
  });
};

export const useCreateLeadStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from('lead_statuses')
        .insert([{ name, color }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_statuses'] });
      toast({
        title: "Status adicionado",
        description: "Status adicionado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar status",
        variant: "destructive",
      });
    }
  });
};

export const useCreateMessageTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, content, type }: { name: string; content: string; type: string }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .insert([{ name, content, type }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      toast({
        title: "Template salvo",
        description: "Template salvo com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar template",
        variant: "destructive",
      });
    }
  });
};

export const useMessageTemplates = () => {
  return useQuery({
    queryKey: ['message_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useMessageHistory = () => {
  return useQuery({
    queryKey: ['message_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_history')
        .select('*')
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateSystemSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({ key, value })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  });
};

export const useScanSessions = () => {
  return useQuery({
    queryKey: ['scan_sessions'],
    queryFn: async () => {
      // Usando uma query raw para acessar a tabela scan_sessions temporariamente
      try {
        const { data, error } = await (supabase as any).rpc('get_scan_sessions');
        
        if (error) {
          // Fallback: tentar query direta mesmo sem tipos
          console.log('RPC failed, trying direct query:', error);
          try {
            const { data: directData, error: directError } = await (supabase as any)
              .from('scan_sessions')
              .select(`
                *,
                qr_code:qr_codes(short_url),
                event:events(name),
                lead:leads(name, email)
              `)
              .order('scanned_at', { ascending: false });
            
            if (directError) throw directError;
            return directData || [];
          } catch (fallbackError) {
            console.error('Both queries failed:', fallbackError);
            return [];
          }
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching scan sessions:', error);
        return [];
      }
    }
  });
};

export const useConversionMetrics = () => {
  return useQuery({
    queryKey: ['conversion_metrics'],
    queryFn: async () => {
      try {
        // Buscar dados de leads
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
        
        if (leadsError) throw leadsError;

        // Buscar dados de QR codes
        const { data: qrCodes, error: qrError } = await supabase
          .from('qr_codes')
          .select('*');
        
        if (qrError) throw qrError;

        // Tentar buscar sessões de scan
        let sessions = [];
        try {
          const { data: sessionsData, error: sessionsError } = await (supabase as any)
            .from('scan_sessions')
            .select('*');
          
          if (!sessionsError) {
            sessions = sessionsData || [];
          }
        } catch (e) {
          console.log('Scan sessions table not accessible yet:', e);
        }

        const totalScans = sessions.length || 0;
        const totalLeads = leads?.length || 0;
        const convertedSessions = sessions.filter((s: any) => s?.lead_id).length || 0;
        const totalQRScans = qrCodes?.reduce((sum, qr) => sum + (qr.scans || 0), 0) || 0;

        return {
          totalScans,
          totalLeads,
          totalQRScans,
          convertedSessions,
          conversionRate: totalScans > 0 ? (convertedSessions / totalScans) * 100 : 0,
          leadsPerScan: totalScans > 0 ? (totalLeads / totalScans) * 100 : 0,
          sessionTrackingRate: totalLeads > 0 ? (convertedSessions / totalLeads) * 100 : 0
        };
      } catch (error) {
        console.error('Error calculating conversion metrics:', error);
        return {
          totalScans: 0,
          totalLeads: 0,
          totalQRScans: 0,
          convertedSessions: 0,
          conversionRate: 0,
          leadsPerScan: 0,
          sessionTrackingRate: 0
        };
      }
    }
  });
};

