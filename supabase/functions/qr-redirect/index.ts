
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

    console.log('Redirecionamento solicitado para:', shortUrl);

    if (!shortUrl) {
      console.log('Short URL não encontrada');
      return new Response('Short URL not found', { status: 404 });
    }

    // Buscar o QR code pelo short_url
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_url', shortUrl)
      .single();

    if (error || !qrCode) {
      console.log('QR Code não encontrado:', error);
      return new Response('QR Code not found', { status: 404 });
    }

    console.log('QR Code encontrado:', qrCode);

    // Incrementar contador de scans
    await supabase
      .from('qr_codes')
      .update({ scans: qrCode.scans + 1 })
      .eq('id', qrCode.id);

    console.log('Redirecionando para:', qrCode.original_url);

    // Redirecionar para a URL original (que já contém a URL completa do WhatsApp)
    return Response.redirect(qrCode.original_url, 302);
  } catch (error) {
    console.error('Erro no redirecionamento:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
