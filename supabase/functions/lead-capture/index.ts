
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LeadData {
  name: string;
  whatsapp: string;
  email: string;
  course_id?: string;
  event_id?: string;
  shift?: 'manhã' | 'tarde' | 'noite';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const leadData: LeadData = await req.json();

    // Validate required fields
    if (!leadData.name || !leadData.whatsapp || !leadData.email) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios: name, whatsapp, email',
          received: leadData 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate whatsapp format (remove special characters)
    const cleanWhatsapp = leadData.whatsapp.replace(/\D/g, '');
    if (cleanWhatsapp.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Número de WhatsApp inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate course_id if provided
    if (leadData.course_id) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('id', leadData.course_id)
        .single();

      if (courseError || !course) {
        return new Response(
          JSON.stringify({ error: 'Curso não encontrado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Validate event_id if provided
    if (leadData.event_id) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', leadData.event_id)
        .single();

      if (eventError || !event) {
        return new Response(
          JSON.stringify({ error: 'Evento não encontrado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get default status (first available)
    const { data: defaultStatus } = await supabase
      .from('lead_statuses')
      .select('id')
      .limit(1)
      .single();

    // Check if lead already exists (by email or whatsapp)
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .or(`email.eq.${leadData.email},whatsapp.eq.${cleanWhatsapp}`)
      .single();

    if (existingLead) {
      return new Response(
        JSON.stringify({ 
          error: 'Lead já existe com este email ou WhatsApp',
          lead_id: existingLead.id 
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insert new lead
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert([{
        name: leadData.name.trim(),
        whatsapp: cleanWhatsapp,
        email: leadData.email.toLowerCase().trim(),
        course_id: leadData.course_id || null,
        event_id: leadData.event_id || null,
        status_id: defaultStatus?.id || null,
        shift: leadData.shift || null
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar lead', details: insertError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead adicionado com sucesso',
        lead: newLead 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in lead-capture function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
