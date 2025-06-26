
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📞 Callback recebido - Método:', req.method);
    console.log('📞 URL completa:', req.url);
    console.log('📋 Headers recebidos:', Object.fromEntries(req.headers.entries()));
    
    // Criar cliente Supabase com SERVICE_ROLE_KEY (sem autenticação de usuário)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        details: 'Missing environment variables'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    });

    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        details: 'Only POST method is allowed'
      }), { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse body
    let body;
    try {
      const bodyText = await req.text();
      console.log('📋 Corpo bruto recebido:', bodyText);
      body = JSON.parse(bodyText);
      console.log('📋 Corpo parseado:', body);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid JSON',
        details: 'Request body must be valid JSON'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { validation_id, is_valid, message } = body;
    console.log('📋 Dados extraídos:', { validation_id, is_valid, message });

    if (!validation_id || is_valid === undefined) {
      console.log('❌ Campos obrigatórios faltando:', { validation_id, is_valid });
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'validation_id and is_valid are required',
        received: { validation_id, is_valid, message }
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
        validation_id,
        details: 'No validation record found with this ID'
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Validação encontrada:', existingValidation);

    // Atualizar status da validação
    const updateData = {
      status: is_valid ? 'valid' : 'invalid',
      response_message: message || null,
      validated_at: new Date().toISOString()
    };

    console.log('📝 Dados para atualização:', updateData);
    
    const { data: updatedValidation, error: updateError } = await supabase
      .from('whatsapp_validations')
      .update(updateData)
      .eq('id', validation_id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar validação:', updateError);
      return new Response(JSON.stringify({
        error: 'Error updating validation',
        details: updateError.message,
        validation_id
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Validação atualizada com sucesso:', updatedValidation);

    const response = {
      success: true,
      message: 'Validation updated successfully',
      validation: updatedValidation?.[0] || null,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Enviando resposta:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Erro no endpoint:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
