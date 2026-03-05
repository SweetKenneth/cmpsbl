import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Quality floor: absolute minimum score
const QUALITY_FLOOR = 68;

// ─── Weighted Tier Distribution ─────────────────────────────────
// Mint (68-79): 65%, Prime (80-89): 25%, Relic (90-93): 7%, Mythic (94-99): 2.5%, Apex (100): 0.5%
const TIER_WEIGHTS = [
  { min: 68, max: 79, weight: 0.65, tier: 'Mint' },
  { min: 80, max: 89, weight: 0.25, tier: 'Prime' },
  { min: 90, max: 93, weight: 0.07, tier: 'Relic' },
  { min: 94, max: 99, weight: 0.025, tier: 'Mythic' },
  { min: 100, max: 100, weight: 0.005, tier: 'Apex' },
];

function pickWeightedTierRange(): { min: number; max: number } {
  const roll = Math.random();
  let cumulative = 0;
  for (const t of TIER_WEIGHTS) {
    cumulative += t.weight;
    if (roll <= cumulative) return { min: t.min, max: t.max };
  }
  return { min: 68, max: 79 };
}

// Public tier mapping — per-item, based on actual score
function scoreToPublicTier(score: number): string | null {
  if (score < QUALITY_FLOOR) return null;
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  return 'Mint';
}

function computeDisplayValuation(score: number): number {
  return Math.round((score / 100) * 2_000_000 * 0.5);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authErr || !user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse body — REJECT any bias parameter
    const body = await req.json().catch(() => ({}));
    if ('bias' in body || 'highValueBias' in body || 'bias_enabled' in body) {
      await supabase.from('foundry_mine_events').insert({
        user_id: user.id,
        result_count: 0,
        blocked_reason: 'bias_parameter_rejected',
        rate_limit_bucket: 'rejected',
      });
      return new Response(JSON.stringify({ ok: false, error: 'Invalid parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine user tier
    const { data: subData } = await supabase.functions.invoke('check-engine-subscription', {
      headers: { authorization: authHeader },
    });

    const { data: isAdmin } = await supabase.rpc('has_role_text', {
      _user_id: user.id,
      _role: 'admin',
    });

    let foundryTier = 'free';
    if (isAdmin) {
      foundryTier = 'mythic_miner';
    } else {
      const engineTier = subData?.tier || 'free';
      if (['architect', 'pro', 'enterprise'].includes(engineTier)) foundryTier = 'excavator';
      else if (engineTier === 'studio') foundryTier = 'prospector';
      else if (['creator', 'builder'].includes(engineTier)) foundryTier = 'explorer';
    }

    // Get tier config
    const { data: tierConfig } = await supabase
      .from('foundry_tier_config')
      .select('*')
      .eq('id', foundryTier)
      .single();

    if (!tierConfig) {
      return new Response(JSON.stringify({ ok: false, error: 'Tier configuration error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

    const { count: hourCount } = await supabase
      .from('foundry_mine_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('requested_at', oneHourAgo)
      .is('blocked_reason', null);

    const { count: dayCount } = await supabase
      .from('foundry_mine_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('requested_at', oneDayAgo)
      .is('blocked_reason', null);

    if ((hourCount ?? 0) >= tierConfig.mines_per_hour) {
      await supabase.from('foundry_mine_events').insert({
        user_id: user.id,
        result_count: 0,
        blocked_reason: 'hourly_limit',
        rate_limit_bucket: foundryTier,
      });
      const retryAfter = 3600 - (now.getTime() - new Date(oneHourAgo).getTime()) / 1000;
      return new Response(JSON.stringify({
        ok: false,
        error: 'Hourly mine limit reached',
        retryAfterMs: Math.max(60000, retryAfter * 1000),
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(retryAfter)) },
      });
    }

    if ((dayCount ?? 0) >= tierConfig.mines_per_day) {
      await supabase.from('foundry_mine_events').insert({
        user_id: user.id,
        result_count: 0,
        blocked_reason: 'daily_limit',
        rate_limit_bucket: foundryTier,
      });
      return new Response(JSON.stringify({
        ok: false,
        error: 'Daily mine limit reached',
        retryAfterMs: 86400000,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '86400' },
      });
    }

    // ─── Weighted Mining ─────────────────────────────────────────
    const maxResults = tierConfig.max_results_per_mine;

    // Get user's existing artifact IDs to avoid duplicates
    const { data: existingItems } = await supabase
      .from('foundry_inventory')
      .select('artifact_id')
      .eq('user_id', user.id);

    const ownedIds = new Set((existingItems || []).map((e: any) => e.artifact_id));

    const results: any[] = [];
    const attemptedRanges: { min: number; max: number }[] = [];

    // Roll weighted tiers for each result slot independently
    for (let slot = 0; slot < maxResults; slot++) {
      const range = pickWeightedTierRange();
      attemptedRanges.push(range);
    }

    // Batch query: fetch candidates for each unique range
    const uniqueRanges = [...new Map(attemptedRanges.map(r => [`${r.min}-${r.max}`, r])).values()];
    const rangedCandidates: Map<string, any[]> = new Map();

    for (const range of uniqueRanges) {
      const key = `${range.min}-${range.max}`;
      const fetchCount = maxResults * 4;

      // Use updated RPC with max_score parameter
      const { data: rpcResult } = await supabase.rpc('get_random_discoveries', {
        min_score: range.min,
        max_count: fetchCount,
        max_score: range.max,
      });

      let candidates = rpcResult;

      // Fallback if RPC returns nothing
      if (!candidates || candidates.length === 0) {
        const { count: totalEligible } = await supabase
          .from('discoveries')
          .select('id', { count: 'exact', head: true })
          .gte('cjpi', range.min)
          .lte('cjpi', range.max);

        if (totalEligible && totalEligible > 0) {
          const randomOffset = Math.floor(Math.random() * Math.max(1, totalEligible - fetchCount));
          const { data: fallbackDisc } = await supabase
            .from('discoveries')
            .select('id, name, description, cjpi, category, module_chain')
            .gte('cjpi', range.min)
            .lte('cjpi', range.max)
            .range(randomOffset, randomOffset + fetchCount - 1);

          candidates = fallbackDisc || [];
        } else {
          candidates = [];
        }
      }

      // Shuffle
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      rangedCandidates.set(key, candidates);
    }

    // Build results — each item gets its OWN tier based on its actual score
    for (const range of attemptedRanges) {
      if (results.length >= maxResults) break;
      const key = `${range.min}-${range.max}`;
      const pool = rangedCandidates.get(key) || [];

      for (const disc of pool) {
        if (results.length >= maxResults) break;
        if (!disc || disc.cjpi < QUALITY_FLOOR) continue;
        if (ownedIds.has(disc.id)) continue;
        if (results.some(r => r.id === disc.id)) continue;

        // Per-item tier from its actual score (NOT the roll range)
        const tier = scoreToPublicTier(disc.cjpi);
        if (tier) {
          results.push({
            id: disc.id,
            name: disc.name,
            description: disc.description,
            score: disc.cjpi,
            publicTier: tier,
            valuationDisplay: computeDisplayValuation(disc.cjpi),
            category: disc.category,
            systemChain: disc.module_chain || [],
          });
          ownedIds.add(disc.id);
        }
      }

      // Fallback to Mint if weighted range had no results
      if (results.length < maxResults && pool.length === 0 && range.min > 68) {
        const mintPool = rangedCandidates.get('68-79') || [];
        for (const disc of mintPool) {
          if (results.length >= maxResults) break;
          if (!disc || disc.cjpi < QUALITY_FLOOR) continue;
          if (ownedIds.has(disc.id)) continue;
          if (results.some(r => r.id === disc.id)) continue;

          const tier = scoreToPublicTier(disc.cjpi);
          if (tier) {
            results.push({
              id: disc.id,
              name: disc.name,
              description: disc.description,
              score: disc.cjpi,
              publicTier: tier,
              valuationDisplay: computeDisplayValuation(disc.cjpi),
              category: disc.category,
              systemChain: disc.module_chain || [],
            });
            ownedIds.add(disc.id);
          }
        }
      }
    }

    // ─── Persist to inventory (atomic, with error handling + dedup) ───
    let persistedCount = 0;
    let alreadyOwnedCount = 0;

    if (results.length > 0) {
      const inventoryRows = results.map((r: any) => ({
        user_id: user.id,
        artifact_id: r.id,
        artifact_name: r.name,
        artifact_description: r.description,
        score: r.score,
        public_tier: r.publicTier,
        valuation_display: r.valuationDisplay,
        source: 'mined',
        category: r.category,
        system_chain: r.systemChain,
      }));

      // Use upsert with onConflict to handle duplicates gracefully
      const { data: insertedData, error: insertError } = await supabase
        .from('foundry_inventory')
        .upsert(inventoryRows, { onConflict: 'user_id,artifact_id', ignoreDuplicates: true })
        .select('id');

      if (insertError) {
        console.error('Inventory insert failed:', insertError.message);
        // Return error — do NOT claim success
        return new Response(JSON.stringify({
          ok: false,
          results: [],
          bestScore: null,
          tierBreakdown: {},
          rerollCredit: false,
          persistedCount: 0,
          alreadyOwnedCount: 0,
          error: 'Failed to save to vault. Please try again.',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      persistedCount = insertedData?.length ?? results.length;
      alreadyOwnedCount = results.length - persistedCount;
    }

    // Update user state
    await supabase.from('foundry_user_state').upsert({
      user_id: user.id,
      last_mine_at: now.toISOString(),
      total_mines: (dayCount ?? 0) + 1,
    }, { onConflict: 'user_id' });

    // Tier breakdown
    const tierBreakdown: Record<string, number> = {};
    for (const r of results) {
      tierBreakdown[r.publicTier] = (tierBreakdown[r.publicTier] || 0) + 1;
    }

    const bestScore = results.length > 0 ? Math.max(...results.map((r: any) => r.score)) : null;

    // Log mine event
    await supabase.from('foundry_mine_events').insert({
      user_id: user.id,
      result_count: results.length,
      best_score: bestScore,
      tier_breakdown: tierBreakdown,
      rate_limit_bucket: foundryTier,
    });

    return new Response(JSON.stringify({
      ok: true,
      results,
      bestScore,
      tierBreakdown,
      rerollCredit: results.length === 0,
      persistedCount,
      alreadyOwnedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('foundry-mine error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
