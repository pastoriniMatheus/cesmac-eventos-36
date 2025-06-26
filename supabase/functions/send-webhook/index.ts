
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const { webhook_url, webhook_data } = await req.json();

    if (!webhook_url || !webhook_data) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'webhook_url and webhook_data are required'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📤 Enviando webhook para:', webhook_url);
    console.log('📋 Dados:', JSON.stringify(webhook_data, null, 2));

    // Enviar webhook com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhook_data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      
      console.log('📥 Resposta do webhook:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${responseText}`);
      }

      return new Response(JSON.stringify({
        success: true,
        status: response.status,
        response: responseText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      let errorMessage = 'Erro desconhecido no webhook';
      
      if (fetchError.name === 'AbortError') {
        errorMessage = 'Timeout: O webhook demorou mais de 30 segundos para responder';
      } else if (fetchError.message?.includes('Failed to fetch')) {
        errorMessage = 'Não foi possível conectar ao webhook. Verifique se a URL está correta e acessível';
      } else {
        errorMessage = fetchError.message || 'Erro na comunicação com o webhook';
      }
      
      console.error('❌ Erro no webhook:', fetchError);
      throw new Error(errorMessage);
    }

  } catch (error: any) {
    console.error('💥 Erro geral:', error);
    
    return new Response(JSON.stringify({
      error: 'Webhook error',
      details: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
