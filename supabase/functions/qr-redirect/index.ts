
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    if (!shortUrl) {
      return new Response('Short URL not provided', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Buscar QR code pelo short_url
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*, event:events(name, whatsapp_number)')
      .eq('short_url', shortUrl)
      .single();

    if (error || !qrCode) {
      console.error('QR code not found:', error);
      return new Response('QR code not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Incrementar contador de scans
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ scans: qrCode.scans + 1 })
      .eq('id', qrCode.id);

    if (updateError) {
      console.error('Error updating scan count:', updateError);
    }

    // Registrar scan session (opcional)
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

    await supabase
      .from('scan_sessions')
      .insert({
        qr_code_id: qrCode.id,
        event_id: qrCode.event_id,
        user_agent: userAgent,
        ip_address: ipAddress
      });

    // Redirecionar para a URL original
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': qrCode.original_url
      }
    });

  } catch (error) {
    console.error('Error in qr-redirect function:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
