
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          course:courses(name),
          postgraduate_course:postgraduate_courses(name),
          event:events(name),
          status:lead_statuses(name, color)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCheckExistingLead = () => {
  return useMutation({
    mutationFn: async ({ whatsapp, email }: { whatsapp: string; email: string }) => {
      const cleanWhatsapp = whatsapp.replace(/\D/g, '');
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          course:courses(name),
          postgraduate_course:postgraduate_courses(name)
        `)
        .or(`whatsapp.eq.${cleanWhatsapp},email.eq.${email}`)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      
      return data;
    }
  });
};

export const useUpdateLeadCourse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, courseId, courseType }: { leadId: string; courseId: string; courseType: 'course' | 'postgraduate' }) => {
      const updateData: {
        course_type: 'course' | 'postgraduate';
        updated_at: string;
        course_id?: string | null;
        postgraduate_course_id?: string | null;
      } = {
        course_type: courseType,
        updated_at: new Date().toISOString()
      };

      if (courseType === 'course') {
        updateData.course_id = courseId;
        updateData.postgraduate_course_id = null;
      } else {
        updateData.postgraduate_course_id = courseId;
        updateData.course_id = null;
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead atualizado",
        description: "Curso de interesse atualizado com sucesso!",
      });
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

export const useDeleteMultipleLeads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadIds: string[]) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', leadIds);
      
      if (error) throw error;
      return leadIds;
    },
    onSuccess: (leadIds) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Leads removidos",
        description: `${leadIds.length} lead(s) removido(s) com sucesso!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover leads",
        variant: "destructive",
      });
    }
  });
};
