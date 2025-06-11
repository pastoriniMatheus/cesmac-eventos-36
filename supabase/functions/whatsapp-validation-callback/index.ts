
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

    const { validation_id, is_valid, message } = await req.json();

    if (!validation_id || is_valid === undefined) {
      return new Response('Missing required fields', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Atualizar status da validação
    const { error: updateError } = await supabase
      .from('whatsapp_validations')
      .update({ 
        status: is_valid ? 'valid' : 'invalid',
        response_message: message || null,
        validated_at: new Date().toISOString()
      })
      .eq('id', validation_id);

    if (updateError) {
      console.error('Erro ao atualizar validação:', updateError);
      return new Response('Error updating validation', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Validation updated successfully'
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
