/**
 * pf-forge-run — Bot Runtime Stub
 * Executes cognitive bot queries and returns metadata
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bot_id, query } = await req.json();

    if (!bot_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'bot_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch bot
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, name, type, current_version, memory_mode, providers, capabilities')
      .eq('id', bot_id)
      .single();

    if (botError || !bot) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log execution
    await supabase.from('brain_events').insert({
      module: 'forge',
      event_type: 'bot_run',
      data: { bot_id, query: query?.substring(0, 100) },
      outcome: 'invoked',
    });

    const runtime_ms = Date.now() - start;

    // Return runtime stub response
    return new Response(
      JSON.stringify({
        success: true,
        bot: {
          id: bot.id,
          name: bot.name,
          version: bot.current_version || '1.0.0',
          type: bot.type,
          memory_mode: bot.memory_mode,
        },
        query: query || null,
        response: `[Runtime Stub] Bot "${bot.name}" v${bot.current_version || '1.0.0'} received query. Full execution requires deployed runtime.`,
        timestamp: new Date().toISOString(),
        runtime_ms,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Runtime error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
