
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cookie',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LeadData {
  name: string;
  whatsapp: string;
  email: string;
  course_name?: string;
  event_id?: string;
  shift?: 'manhã' | 'tarde' | 'noite';
}

// Função para extrair cookie
function getCookie(cookieString: string, name: string): string | null {
  if (!cookieString) return null;
  const cookies = cookieString.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
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

    console.log('Dados recebidos:', leadData);

    // Extrair cookie de sessão
    const cookieHeader = req.headers.get('cookie');
    const sessionId = getCookie(cookieHeader || '', 'scan_session');
    
    console.log('Session ID do cookie:', sessionId);

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

    let courseId = null;
    let eventId = null;
    let scanSessionData = null;

    // Se foi enviado nome do curso, buscar o ID correspondente
    if (leadData.course_name) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('name', leadData.course_name)
        .single();

      if (courseError || !course) {
        console.log('Curso não encontrado:', leadData.course_name);
        return new Response(
          JSON.stringify({ error: `Curso "${leadData.course_name}" não encontrado` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      courseId = course.id;
      console.log('Curso encontrado:', course);
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
      
      eventId = leadData.event_id;
    }

    // Se temos um sessionId, buscar dados da sessão de scan
    if (sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('scan_sessions')
        .select('*, qr_codes(*)')
        .eq('id', sessionId)
        .eq('converted', false)
        .single();

      if (!sessionError && session) {
        scanSessionData = session;
        eventId = session.event_id; // Usar o evento da sessão se não foi especificado
        console.log('Sessão de scan encontrada:', session);
      } else {
        console.log('Sessão não encontrada ou já convertida:', sessionError);
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
        course_id: courseId,
        event_id: eventId,
        status_id: defaultStatus?.id || null,
        shift: leadData.shift || null,
        scan_session_id: sessionId // Vincular à sessão de scan
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

    // Se temos uma sessão de scan, marcar como convertida
    if (sessionId && scanSessionData) {
      const { error: updateSessionError } = await supabase
        .from('scan_sessions')
        .update({ 
          converted: true, 
          converted_at: new Date().toISOString(),
          lead_id: newLead.id
        })
        .eq('id', sessionId);

      if (updateSessionError) {
        console.log('Erro ao atualizar sessão:', updateSessionError);
      } else {
        console.log('Sessão marcada como convertida');
      }
    }

    console.log('Lead criado com sucesso:', newLead);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead adicionado com sucesso',
        lead: newLead,
        session_tracked: !!sessionId,
        event_from_scan: !!scanSessionData
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
