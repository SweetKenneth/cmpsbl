// vision-ascension-prioritizer — VISION → ASCENSION bridge
// Reads unresolved vision anomalies, ranks them by severity × deviation,
// and writes a prioritized scan-target queue into brain_memory_meta so the
// next ascension cycle can act on foresight rather than round-robin.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 4, high: 3, medium: 2, low: 1,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  try {
    const { data: anomalies } = await supabase
      .from('vision_anomalies')
      .select('id, module, anomaly_type, severity, deviation_percent, details')
      .gte('detected_at', since)
      .eq('resolved', false)
      .limit(100);

    const list = anomalies ?? [];
    if (list.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, reason: 'no unresolved anomalies' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ranked = list
      .map(a => ({
        anomaly_id: a.id,
        module: a.module,
        type: a.anomaly_type,
        priority_score:
          (SEVERITY_WEIGHT[String(a.severity ?? 'low').toLowerCase()] ?? 1) *
          (1 + Math.abs(Number(a.deviation_percent) || 0) / 100),
      }))
      .sort((x, y) => y.priority_score - x.priority_score)
      .slice(0, 25);

    await supabase.from('brain_memory_meta').insert({
      key: `ascension_priority_queue_${Date.now()}`,
      value: {
        kind: 'ascension_priority_queue',
        generated_at: new Date().toISOString(),
        source: 'vision_anomalies',
        targets: ranked,
      },
    });

    return new Response(JSON.stringify({
      ok: true,
      processed: ranked.length,
      total_anomalies: list.length,
      top_priority: ranked[0] ?? null,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
