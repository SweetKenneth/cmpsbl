// forge-memory-distiller — FORGE → MEMORY bridge
// Sweeps recently-active forge agents and distills their durable observations
// into brain_memory_warm so they survive the agent's lifecycle.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  try {
    const { data: agents } = await supabase
      .from('forge_agents')
      .select('*')
      .gte('updated_at', since)
      .limit(50);

    const list = (agents ?? []) as Record<string, unknown>[];
    if (list.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, reason: 'no recent forge activity' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let distilled = 0;
    for (const a of list) {
      const summary = String(a.name ?? a.title ?? a.id ?? 'forge_agent');
      const content = JSON.stringify({
        name: a.name,
        role: a.role,
        capability: a.capability ?? a.capabilities,
        outcome: a.last_outcome ?? a.status,
        updated_at: a.updated_at,
      });

      try {
        await supabase.from('brain_memory_warm').insert({
          content,
          tags: ['forge', 'distilled', String(a.role ?? 'agent')],
          source_module: 'forge',
          category: 'agent_observation',
          importance_score: 0.5,
          metadata: {
            distilled_from: 'forge_agents',
            forge_agent_id: a.id,
            distilled_at: new Date().toISOString(),
            summary,
          },
        });
        distilled += 1;
      } catch {
        /* schema variation — skip */
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: distilled,
      agents_scanned: list.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
