
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
