
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

    console.log('🔄 Iniciando validação para número:', whatsapp, 'ID:', validation_id);

    // Buscar webhook de verificação nas configurações
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'whatsapp_validation_webhook')
      .single();

    if (!settings?.value) {
      console.log('❌ Webhook não configurado');
      return new Response('WhatsApp validation webhook not configured', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('📡 Webhook configurado:', settings.value);

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
      console.error('❌ Erro ao criar validação:', validationError);
      return new Response('Error creating validation', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('✅ Validação criada:', validation);

    // Enviar para webhook externo com melhor tratamento de erro
    try {
      console.log('📤 Enviando para webhook externo...');
      
      const webhookPayload = {
        whatsapp,
        validation_id,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-validation-callback`
      };

      console.log('📋 Payload:', JSON.stringify(webhookPayload, null, 2));

      const webhookResponse = await fetch(settings.value, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Functions/1.0',
        },
        body: JSON.stringify(webhookPayload)
      });

      const responseText = await webhookResponse.text();
      console.log('📥 Resposta do webhook:', webhookResponse.status, responseText);

      if (!webhookResponse.ok) {
        throw new Error(`Webhook returned ${webhookResponse.status}: ${responseText}`);
      }

      console.log('✅ Webhook chamado com sucesso');

      return new Response(JSON.stringify({ 
        success: true, 
        validation_id,
        message: 'Validation request sent',
        webhook_status: webhookResponse.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (webhookError) {
      console.error('❌ Erro no webhook:', webhookError);
      
      // Atualizar status para erro
      await supabase
        .from('whatsapp_validations')
        .update({ 
          status: 'error',
          response_message: `Webhook error: ${webhookError.message}`
        })
        .eq('id', validation_id);

      // Retornar erro mais específico
      return new Response(JSON.stringify({
        error: 'Webhook error',
        details: webhookError.message,
        validation_id
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('💥 Erro geral no endpoint:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
