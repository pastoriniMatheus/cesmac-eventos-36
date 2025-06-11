
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
    // Use service role key for server-side operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const shortUrl = url.pathname.split('/').pop();

    console.log('Redirecionamento solicitado para:', shortUrl);
    console.log('URL completa:', req.url);

    if (!shortUrl) {
      console.log('Short URL não encontrada na URL:', req.url);
      return new Response('Short URL not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Buscar o QR code pelo short_url
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        event:events(*)
      `)
      .eq('short_url', shortUrl)
      .single();

    if (error) {
      console.log('Erro ao buscar QR Code:', error);
      return new Response('QR Code not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    if (!qrCode) {
      console.log('QR Code não encontrado para short_url:', shortUrl);
      return new Response('QR Code not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    console.log('QR Code encontrado:', qrCode);

    // Gerar ID único para esta sessão de scan
    const sessionId = crypto.randomUUID();
    const scanTimestamp = new Date().toISOString();

    // Registrar a sessão de scan
    const { error: sessionError } = await supabase
      .from('scan_sessions')
      .insert([{
        id: sessionId,
        qr_code_id: qrCode.id,
        event_id: qrCode.event_id,
        scanned_at: scanTimestamp,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }]);

    if (sessionError) {
      console.log('Erro ao registrar sessão:', sessionError);
    }

    // Incrementar contador de scans
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ scans: qrCode.scans + 1 })
      .eq('id', qrCode.id);

    if (updateError) {
      console.log('Erro ao incrementar scans:', updateError);
    }

    // Construir URL de redirecionamento baseada no tipo
    let redirectUrl = '';
    
    if (qrCode.type === 'whatsapp') {
      // Para QR codes WhatsApp, construir URL wa.me
      const whatsappNumber = qrCode.event?.whatsapp_number;
      const eventName = qrCode.event?.name || '';
      const trackingId = qrCode.tracking_id || '';
      
      if (!whatsappNumber) {
        console.log('Número WhatsApp não encontrado para QR Code WhatsApp');
        return new Response('WhatsApp number not configured', { 
          status: 400,
          headers: corsHeaders 
        });
      }
      
      // Construir mensagem: "Nome do Evento id:TRACKING_ID"
      const message = `${eventName} id:${trackingId}`;
      redirectUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    } else {
      // Para outros tipos (formulário), usar a URL original
      redirectUrl = qrCode.original_url;
    }

    console.log('Redirecionando para:', redirectUrl);

    // Criar headers de resposta incluindo o cookie de sessão
    const responseHeaders = new Headers();
    responseHeaders.set('Location', redirectUrl);
    responseHeaders.set('Set-Cookie', `scan_session=${sessionId}; Path=/; Max-Age=3600; SameSite=Lax`);
    
    // Adicionar headers CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    // Criar a resposta de redirecionamento
    return new Response(null, { 
      status: 302,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Erro no redirecionamento:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
