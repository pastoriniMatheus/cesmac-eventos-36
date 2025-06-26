
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
    console.log('📞 Callback recebido - Método:', req.method);
    console.log('📋 Headers recebidos:', Object.fromEntries(req.headers.entries()));
    
    // Usar SERVICE_ROLE_KEY para operações administrativas sem autenticação do usuário
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const body = await req.json();
    console.log('📋 Corpo da requisição recebido:', JSON.stringify(body, null, 2));
    
    const { validation_id, is_valid, message } = body;

    if (!validation_id || is_valid === undefined) {
      console.log('❌ Campos obrigatórios faltando:', { validation_id, is_valid });
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'validation_id and is_valid are required'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔄 Atualizando validação:', {
      validation_id,
      is_valid,
      message
    });

    // Primeiro verificar se a validação existe
    const { data: existingValidation, error: checkError } = await supabase
      .from('whatsapp_validations')
      .select('*')
      .eq('id', validation_id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erro ao verificar validação existente:', checkError);
      return new Response(JSON.stringify({
        error: 'Database error while checking validation',
        details: checkError.message
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!existingValidation) {
      console.log('❌ Validação não encontrada:', validation_id);
      return new Response(JSON.stringify({
        error: 'Validation not found',
        validation_id
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Validação encontrada:', existingValidation);

    // Atualizar status da validação
    const { data: updatedValidation, error: updateError } = await supabase
      .from('whatsapp_validations')
      .update({ 
        status: is_valid ? 'valid' : 'invalid',
        response_message: message || null,
        validated_at: new Date().toISOString()
      })
      .eq('id', validation_id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar validação:', updateError);
      return new Response(JSON.stringify({
        error: 'Error updating validation',
        details: updateError.message
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Validação atualizada com sucesso:', updatedValidation);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Validation updated successfully',
      validation: updatedValidation?.[0] || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Erro no endpoint:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
