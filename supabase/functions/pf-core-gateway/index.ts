import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { target, action, data } = await req.json();

    console.log(`🚪 Core Gateway: ${target}/${action}`);

    const routes: Record<string, string> = {
      'brain': 'pf-brain',
      'defense': 'pf-defense-stats',
      'marketing': 'pf-marketing-chat',
      'access': 'pf-access-scan',
      'nexus': 'pf-nexus-text',
      'ripple': 'pf-ripple-stats',
      'studio': 'pf-studio-scan',
    };

    const targetFunction = routes[target];

    if (!targetFunction) {
      throw new Error(`Unknown target: ${target}`);
    }

    await supabaseClient.from('learning_logs').insert({
      event_type: 'gateway_route',
      project_id: 'core',
      payload: {
        target,
        action,
        function: targetFunction,
        routed_at: new Date().toISOString(),
      },
      success: true,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        routed_to: targetFunction,
        message: 'Request routed successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Core gateway error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
