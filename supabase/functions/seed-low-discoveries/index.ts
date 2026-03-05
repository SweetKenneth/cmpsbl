import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CATEGORIES = [
  'acquisition', 'cognitive', 'compliance', 'contracts', 'edge', 'ethics',
  'evolution', 'geospatial', 'governance', 'integration', 'learning',
  'localization', 'observability', 'orchestration', 'prediction', 'privacy',
  'routing', 'security', 'simulation', 'synthesis',
];

const MODULES = [
  'ANALYTICS', 'BRAIN', 'DEFENSE', 'DECODE', 'EVOLUTION', 'MEMORY',
  'VISION', 'CORTEX', 'SIGNAL', 'FORGE', 'NEXUS', 'SENTINEL',
  'ATLAS', 'PRISM', 'VECTOR', 'CIPHER',
];

const ADJECTIVES = [
  'Adaptive', 'Dynamic', 'Quantum', 'Neural', 'Recursive', 'Parallel',
  'Distributed', 'Reactive', 'Hybrid', 'Modular', 'Synthetic', 'Volatile',
  'Elastic', 'Resilient', 'Primitive', 'Fragmented', 'Nascent', 'Emergent',
  'Crude', 'Experimental', 'Prototype', 'Draft', 'Alpha', 'Beta',
  'Unstable', 'Partial', 'Rough', 'Basic', 'Simple', 'Minimal',
];

const NOUNS = [
  'Pipeline', 'Router', 'Analyzer', 'Processor', 'Engine', 'Synthesizer',
  'Classifier', 'Detector', 'Scanner', 'Validator', 'Transformer', 'Mapper',
  'Aggregator', 'Filter', 'Balancer', 'Scheduler', 'Monitor', 'Resolver',
  'Handler', 'Dispatcher', 'Coordinator', 'Mediator', 'Adapter', 'Bridge',
  'Extractor', 'Compiler', 'Interpreter', 'Optimizer', 'Allocator', 'Indexer',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateDiscovery(index: number) {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const category = pick(CATEGORIES);
  const chainLen = 2 + Math.floor(Math.random() * 3); // 2-4 modules
  const chain = pickN(MODULES, chainLen);
  
  // Score: weighted toward lower end (1-78)
  // Use beta-like distribution favoring 20-55
  const raw = Math.random();
  const score = Math.max(1, Math.min(78, Math.floor(1 + raw * raw * 77)));
  
  const tier = score >= 68 ? 'Mint' : score >= 50 ? 'experimental' : score >= 30 ? 'prototype' : 'raw';

  return {
    id: `disc-low-${String(index).padStart(5, '0')}`,
    run_id: '00d3301e-6890-4867-9007-6ee97e783dea',
    name: `${adj} ${noun}`,
    description: `${tier === 'raw' ? 'Unstable' : 'Experimental'} ${category} pipeline: ${chain.join(' → ')}. Score ${score}/100.`,
    category,
    tier,
    cjpi: score,
    synergy_multiplier: 0.5 + Math.random() * 0.8,
    components: { entry: `${category}-input`, exit: `${category}-output` },
    module_chain: chain,
    rationale: `Auto-seeded low-tier ${category} discovery for pool diversity.`,
    provenance: 'seed-low-discoveries',
    pipeline_steps: chain.map(m => ({ module: m, capability: 'basic' })),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Check if already seeded
    const { count } = await supabase
      .from('discoveries')
      .select('id', { count: 'exact', head: true })
      .like('id', 'disc-low-%');

    if ((count ?? 0) >= 900) {
      return new Response(JSON.stringify({ ok: true, message: 'Already seeded', count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 1000 discoveries
    const discoveries = Array.from({ length: 1000 }, (_, i) => generateDiscovery(i));

    // Insert in batches of 100
    let inserted = 0;
    for (let i = 0; i < discoveries.length; i += 100) {
      const batch = discoveries.slice(i, i + 100);
      const { error } = await supabase
        .from('discoveries')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.error(`Batch ${i / 100} failed:`, error.message);
      } else {
        inserted += batch.length;
      }
    }

    // Verify distribution
    const { data: dist } = await supabase.rpc('get_discovery_stats');

    return new Response(JSON.stringify({
      ok: true,
      inserted,
      stats: dist,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
