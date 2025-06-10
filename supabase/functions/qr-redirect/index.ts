
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
      .select('*')
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

    // Incrementar contador de scans
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ scans: qrCode.scans + 1 })
      .eq('id', qrCode.id);

    if (updateError) {
      console.log('Erro ao incrementar scans:', updateError);
    }

    console.log('Redirecionando para:', qrCode.original_url);

    // Redirecionar para a URL original (WhatsApp)
    return Response.redirect(qrCode.original_url, 302);

  } catch (error) {
    console.error('Erro no redirecionamento:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
