// memory-ascension-prefilter — MEMORY → ASCENSION bridge
// Scans recent hot memories and writes a prefilter manifest of "already-known"
// pattern signatures so the next ascension scan can skip redundant work.
// Records the manifest in brain_memory_meta.

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
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    const { data: hot } = await supabase
      .from('brain_memory_hot')
      .select('id, content, tags, importance_score, source_module, category')
      .gte('created_at', since)
      .order('importance_score', { ascending: false })
      .limit(200);

    const memories = hot ?? [];
    if (memories.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, reason: 'no recent hot memories' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Build a tag/category frequency signature — ASCENSION can compare its
    // candidate scan set against this and skip already-saturated areas.
    const tagFreq: Record<string, number> = {};
    const categoryFreq: Record<string, number> = {};
    const moduleFreq: Record<string, number> = {};
    for (const m of memories) {
      for (const t of (m.tags ?? []) as string[]) tagFreq[t] = (tagFreq[t] ?? 0) + 1;
      if (m.category) categoryFreq[m.category] = (categoryFreq[m.category] ?? 0) + 1;
      if (m.source_module) moduleFreq[m.source_module] = (moduleFreq[m.source_module] ?? 0) + 1;
    }

    // Persist the prefilter manifest as a meta row keyed by window
    await supabase.from('brain_memory_meta').insert({
      key: `ascension_prefilter_${Date.now()}`,
      value: {
        kind: 'ascension_prefilter',
        window_start: since,
        sample_size: memories.length,
        tag_freq: tagFreq,
        category_freq: categoryFreq,
        module_freq: moduleFreq,
        avg_importance: memories.reduce((s, m) => s + (Number(m.importance_score) || 0), 0) / memories.length,
        generated_at: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({
      ok: true,
      processed: memories.length,
      tags_indexed: Object.keys(tagFreq).length,
      categories_indexed: Object.keys(categoryFreq).length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
