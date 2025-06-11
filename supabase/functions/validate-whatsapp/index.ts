
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

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const { whatsapp, validation_id } = await req.json();

    if (!whatsapp || !validation_id) {
      return new Response('Missing required fields', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Buscar webhook de verificação nas configurações
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'whatsapp_validation_webhook')
      .single();

    if (!settings?.value) {
      return new Response('WhatsApp validation webhook not configured', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Criar registro de validação pendente
    const { data: validation, error: validationError } = await supabase
      .from('whatsapp_validations')
      .insert([{
        id: validation_id,
        whatsapp,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (validationError) {
      console.error('Erro ao criar validação:', validationError);
      return new Response('Error creating validation', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Enviar para webhook externo
    try {
      const webhookResponse = await fetch(settings.value, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsapp,
          validation_id,
          callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-validation-callback`
        })
      });

      if (!webhookResponse.ok) {
        throw new Error('Webhook request failed');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        validation_id,
        message: 'Validation request sent'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (webhookError) {
      console.error('Erro no webhook:', webhookError);
      
      // Atualizar status para erro
      await supabase
        .from('whatsapp_validations')
        .update({ status: 'error' })
        .eq('id', validation_id);

      return new Response('Webhook error', { 
        status: 500,
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
