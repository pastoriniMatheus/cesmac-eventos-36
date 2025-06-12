
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const { name, email, whatsapp, course_id, course_name, shift, tracking_id } = await req.json();

    console.log('Dados recebidos:', { name, email, whatsapp, course_id, course_name, shift, tracking_id });

    if (!name || !email || !whatsapp) {
      return new Response('Missing required fields', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    let finalCourseId = course_id;

    // Se course_name foi fornecido e não há course_id, buscar o curso pelo nome
    if (course_name && !course_id) {
      console.log('Buscando curso pelo nome:', course_name);
      
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .ilike('name', course_name)
        .single();

      if (courseError) {
        console.log('Erro ao buscar curso:', courseError);
        return new Response(`Course not found: ${course_name}`, { 
          status: 400,
          headers: corsHeaders 
        });
      }

      if (course) {
        finalCourseId = course.id;
        console.log('Curso encontrado:', course);
      }
    }

    // Buscar status padrão "pendente"
    let defaultStatusId = null;
    const { data: pendingStatus } = await supabase
      .from('lead_statuses')
      .select('id')
      .ilike('name', 'pendente')
      .limit(1);
    
    if (pendingStatus && pendingStatus.length > 0) {
      defaultStatusId = pendingStatus[0].id;
      console.log('Status pendente encontrado:', defaultStatusId);
    }

    let scanSessionId = null;
    let eventId = null;

    // Se há tracking_id, buscar a sessão de scan correspondente
    if (tracking_id) {
      console.log('Buscando QR Code pelo tracking_id:', tracking_id);
      
      // Buscar QR Code pelo tracking_id
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, event_id')
        .eq('tracking_id', tracking_id)
        .single();

      if (qrError) {
        console.log('Erro ao buscar QR Code:', qrError);
      } else if (qrCode) {
        console.log('QR Code encontrado:', qrCode);
        eventId = qrCode.event_id;

        // Buscar a sessão de scan mais recente para este QR Code
        const { data: scanSession, error: sessionError } = await supabase
          .from('scan_sessions')
          .select('id')
          .eq('qr_code_id', qrCode.id)
          .is('lead_id', null) // Sessão ainda não convertida
          .order('scanned_at', { ascending: false })
          .limit(1)
          .single();

        if (sessionError) {
          console.log('Erro ao buscar sessão de scan:', sessionError);
        } else if (scanSession) {
          console.log('Sessão de scan encontrada:', scanSession);
          scanSessionId = scanSession.id;
        }
      }
    }

    // Criar o lead com status padrão
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        name,
        email,
        whatsapp,
        course_id: finalCourseId,
        shift,
        event_id: eventId,
        scan_session_id: scanSessionId,
        status_id: defaultStatusId // Adicionar status padrão
      }])
      .select()
      .single();

    if (leadError) {
      console.error('Erro ao criar lead:', leadError);
      return new Response('Error creating lead', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('Lead criado:', lead);

    // Se houve scan session, atualizar com o lead_id e marcar como convertida
    if (scanSessionId) {
      const { error: updateError } = await supabase
        .from('scan_sessions')
        .update({ 
          lead_id: lead.id,
          converted: true,
          converted_at: new Date().toISOString()
        })
        .eq('id', scanSessionId);

      if (updateError) {
        console.log('Erro ao atualizar sessão de scan:', updateError);
      } else {
        console.log('Sessão de scan atualizada com sucesso');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      lead_id: lead.id,
      course_id: finalCourseId,
      tracking_id,
      session_linked: !!scanSessionId,
      default_status: defaultStatusId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
