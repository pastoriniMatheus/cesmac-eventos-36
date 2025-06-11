
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

    const url = new URL(req.url);
    const shortUrl = url.pathname.split('/').pop();

    console.log('=== QR REDIRECT DEBUG ===');
    console.log('URL solicitada:', req.url);
    console.log('Short URL extraída:', shortUrl);
    console.log('Pathname completo:', url.pathname);

    if (!shortUrl) {
      console.log('Short URL não encontrada na URL');
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

    console.log('QR Code encontrado:', qrCode);
    console.log('Erro na busca:', error);

    if (error || !qrCode) {
      console.log('QR Code não encontrado no banco:', error);
      return new Response('QR Code not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Gerar ID único para esta sessão de scan
    const sessionId = crypto.randomUUID();

    // Registrar a sessão de scan em background
    supabase
      .from('scan_sessions')
      .insert([{
        id: sessionId,
        qr_code_id: qrCode.id,
        event_id: qrCode.event_id,
        scanned_at: new Date().toISOString(),
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }])
      .then(({ error }) => {
        if (error) console.log('Erro ao registrar sessão:', error);
        else console.log('Sessão registrada com sucesso');
      });

    // Incrementar contador de scans em background
    supabase
      .from('qr_codes')
      .update({ scans: qrCode.scans + 1 })
      .eq('id', qrCode.id)
      .then(({ error }) => {
        if (error) console.log('Erro ao incrementar scans:', error);
        else console.log('Contador de scans incrementado');
      });

    // Construir URL de redirecionamento baseada no tipo
    let redirectUrl = '';
    
    if (qrCode.type === 'whatsapp' || !qrCode.type) {
      // Para QR codes WhatsApp (incluindo antigos sem type)
      const whatsappNumber = qrCode.event?.whatsapp_number;
      const eventName = qrCode.event?.name || '';
      const trackingId = qrCode.tracking_id || '';
      
      console.log('Dados WhatsApp:', { whatsappNumber, eventName, trackingId });
      
      if (!whatsappNumber) {
        console.log('Número WhatsApp não encontrado no evento');
        return new Response('WhatsApp number not configured', { 
          status: 400,
          headers: corsHeaders 
        });
      }
      
      const message = `${eventName} id:${trackingId}`;
      redirectUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      console.log('URL WhatsApp construída:', redirectUrl);
    } else {
      // Para outros tipos, usar URL original
      redirectUrl = qrCode.original_url;
      console.log('URL original:', redirectUrl);
    }

    console.log('Redirecionando para:', redirectUrl);

    // HTML de redirecionamento imediato com JavaScript
    const redirectHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Redirecionando...</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script>
        window.location.href = "${redirectUrl}";
      </script>
    </head>
    <body>
      <p>Redirecionando... Se não for redirecionado automaticamente, <a href="${redirectUrl}">clique aqui</a>.</p>
    </body>
    </html>
    `;

    // Retornar HTML com redirecionamento automático
    return new Response(redirectHTML, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erro crítico no redirecionamento:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
