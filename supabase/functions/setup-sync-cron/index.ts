import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { interval, enabled } = await req.json();
    
    console.log('Configurando cron job para sincronização:', { interval, enabled });

    // Primeiro, remover jobs existentes de sincronização
    try {
      await supabaseClient.rpc('cron_unschedule', { name: 'sync-leads-job' });
      console.log('Job anterior removido (se existia)');
    } catch (error) {
      console.log('Nenhum job anterior encontrado para remover');
    }

    if (enabled && interval !== 'immediate') {
      // Converter intervalo para formato cron
      const cronExpression = convertIntervalToCron(interval);
      
      // Criar novo cron job
      const { error: cronError } = await supabaseClient.rpc('cron_schedule', {
        name: 'sync-leads-job',
        cron: cronExpression,
        command: `
          select
            net.http_post(
                url:='https://dobtquebpcnzjisftcfh.supabase.co/functions/v1/sync-leads',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}"}'::jsonb,
                body:='{"cron_trigger": true}'::jsonb
            ) as request_id;
        `
      });

      if (cronError) {
        console.error('Erro ao criar cron job:', cronError);
        throw cronError;
      }

      console.log(`Cron job criado com sucesso: ${cronExpression}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: enabled && interval !== 'immediate' 
        ? `Cron job configurado para intervalo de ${interval} minutos`
        : enabled 
          ? 'Envio imediato configurado - sem cron job necessário'
          : 'Sincronização desabilitada - cron job removido'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao configurar cron job:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})

function convertIntervalToCron(intervalMinutes: string): string {
  const minutes = parseInt(intervalMinutes);
  
  if (minutes < 60) {
    return `*/${minutes} * * * *`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `0 */${hours} * * *`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `0 0 */${days} * *`;
  }
}