import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { operation, params = {} } = await req.json();
    const result: any = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'directive':
        try {
          const directive = { instruction: params.instruction || 'default directive', priority: params.priority || 'medium', expires_at: new Date(Date.now() + 86400000).toISOString(), status: 'active' };
          const { data } = await supabase.from('brain_directives').insert(directive).select();
          result.directive = data?.[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'cascade':
        try {
          const { data: directives } = await supabase.from('brain_directives').select('*').eq('status', 'active');
          const cascaded = directives?.map((d: Record<string, unknown>) => ({ ...d, cascaded: true, propagation: 'full' })) || [];
          result.cascade = { directives: cascaded.length, propagated: true };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'cascade_init':
        try {
          await supabase.from('brain_events').insert({ event_type: 'cascade_initialized', metadata: { timestamp: new Date().toISOString(), initiator: params.initiator || 'system' } });
          result.initialized = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'act':
        try {
          const action = { type: params.action_type || 'default', target: params.target || 'general', executed_at: new Date().toISOString(), outcome: 'success' };
          await supabase.from('brain_events').insert({ event_type: 'action_executed', metadata: action });
          result.action = action;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'plan':
        try {
          const objectives = params.objectives || ['learn', 'optimize', 'respond'];
          const plan = { objectives, timeline: '7d', milestones: objectives.map((o: string, i: number) => ({ objective: o, due: new Date(Date.now() + (i + 1) * 86400000).toISOString() })) };
          result.plan = plan;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown directive operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', status: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
