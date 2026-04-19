// cross-vertical-memory-bridge — VERTICAL ↔ VERTICAL pattern transfer
// Patentable: discovers patterns from one vertical substrate (e.g. gaming)
// that match unsolved problems in another (e.g. fintech) using shared
// scanner_focus / discovery_type signatures, then records the transfer.
//
// This is novelty cross-pollination — the substrate's most valuable
// emergent property and explicitly listed as patentable in doc 27.

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
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  try {
    // Pull recent vertical memory entries that haven't been globally contributed
    const { data: entries } = await supabase
      .from('vertical_memory_stream')
      .select('id, vertical_id, discovery_type, title, content, scanner_focus, cjpi_score')
      .gte('created_at', since)
      .eq('contributed_to_global', false)
      .order('cjpi_score', { ascending: false, nullsFirst: false })
      .limit(50);

    const list = entries ?? [];
    if (list.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, reason: 'no novel vertical entries' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Group by discovery_type + scanner_focus to find shared signatures across verticals
    type Bucket = { key: string; entries: typeof list };
    const buckets = new Map<string, typeof list>();
    for (const e of list) {
      const key = `${e.discovery_type ?? 'unknown'}::${e.scanner_focus ?? 'general'}`;
      const arr = buckets.get(key) ?? [];
      arr.push(e);
      buckets.set(key, arr);
    }

    // For each bucket with entries from 2+ verticals, record bridge candidates
    let bridges = 0;
    for (const [key, group] of buckets.entries()) {
      const verticals = Array.from(new Set(group.map(g => g.vertical_id).filter(Boolean)));
      if (verticals.length < 2) continue;

      // Pair every source vertical with every other target — that's the
      // cross-domain transfer record. Score by cjpi alignment.
      for (let i = 0; i < verticals.length; i++) {
        for (let j = 0; j < verticals.length; j++) {
          if (i === j) continue;
          const sourceEntry = group.find(g => g.vertical_id === verticals[i]);
          if (!sourceEntry) continue;

          await supabase.from('cross_vertical_bridges').insert({
            source_vertical: verticals[i],
            target_vertical: verticals[j],
            source_memory_id: sourceEntry.id,
            pattern_type: key,
            pattern_summary: sourceEntry.title ?? null,
            similarity_score: Number(sourceEntry.cjpi_score ?? 0) / 100,
            metadata: {
              shared_signature: key,
              cluster_size: group.length,
              detected_at: new Date().toISOString(),
            },
          });
          bridges += 1;
        }
      }

      // Mark the source entries as contributed so we don't re-process
      const ids = group.map(g => g.id).filter(Boolean);
      if (ids.length > 0) {
        await supabase
          .from('vertical_memory_stream')
          .update({ contributed_to_global: true })
          .in('id', ids);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: bridges,
      entries_scanned: list.length,
      buckets: buckets.size,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
