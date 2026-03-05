import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUALITY_FLOOR = 68;
const FINGERPRINT_EPOCH = Deno.env.get('PIPELINE_FINGERPRINT_EPOCH') ?? 'SPARTA';
const LEGACY_CAPABILITY = 'unknown';

// ─── Weighted Tier Distribution ─────────────────────────────────
const TIER_WEIGHTS = [
  { min: 68, max: 79, weight: 0.65, tier: 'Mint' },
  { min: 80, max: 89, weight: 0.25, tier: 'Prime' },
  { min: 90, max: 93, weight: 0.07, tier: 'Relic' },
  { min: 94, max: 99, weight: 0.025, tier: 'Mythic' },
  { min: 100, max: 100, weight: 0.005, tier: 'Apex' },
];

/**
 * Pick a weighted tier range for mining.
 * @param priorMines - number of prior mines for this user (0 = first mine)
 * First-mine dampener: users with 0 prior mines cannot roll above Relic.
 * Users with < 5 mines cannot roll Apex.
 */
function pickWeightedTierRange(priorMines: number): { min: number; max: number } {
  // First-mine dampener: cap at Relic (score 93) for brand new users
  const maxAllowedScore = priorMines === 0 ? 93 : priorMines < 5 ? 99 : 100;

  // Build filtered weights
  const eligible = TIER_WEIGHTS.filter(t => t.min <= maxAllowedScore);
  const totalWeight = eligible.reduce((sum, t) => sum + t.weight, 0);

  const roll = Math.random() * totalWeight;
  let cumulative = 0;
  for (const t of eligible) {
    cumulative += t.weight;
    if (roll <= cumulative) {
      return { min: t.min, max: Math.min(t.max, maxAllowedScore) };
    }
  }
  return { min: 68, max: 79 };
}

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

// ─── Pipeline Step Types ────────────────────────────────────────
interface PipelineStep {
  module: string;
  capability: string;
  params?: Record<string, unknown>;
  version?: string;
}

// ─── Structural Fingerprint (SHA-256) ───────────────────────────
function canonicalizeJson(obj: unknown): string {
  return JSON.stringify(sortKeys(obj), null, 0);
}

function sortKeys(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  if (typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(val as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortKeys((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

/**
 * Compute structural fingerprint from pipeline steps.
 * Identity = steps + epoch. Order preserved. Duplicates preserved.
 * CJPI, name, category are NOT included.
 */
async function computeStructuralFingerprint(steps: PipelineStep[]): Promise<string> {
  const payload = {
    steps: steps.map(s => ({
      module: s.module.toUpperCase(),
      capability: s.capability,
      ...(s.params && Object.keys(s.params).length > 0 ? { params: s.params } : {}),
    })),
    epoch: FINGERPRINT_EPOCH,
  };
  const canonical = canonicalizeJson(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert module_chain to pipeline steps (backward compat for legacy discoveries)
 */
function moduleChainToSteps(moduleChain: string[]): PipelineStep[] {
  return moduleChain.map(m => ({ module: m.toUpperCase(), capability: LEGACY_CAPABILITY }));
}

/**
 * Derive module_chain from pipeline_steps (preserves order + duplicates)
 */
function stepsToModuleChain(steps: PipelineStep[]): string[] {
  return steps.map(s => s.module.toUpperCase());
}

const DISCOVERY_SELECT = 'id, name, description, cjpi, category, module_chain, pipeline_fingerprint, pipeline_steps';

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeTraceId(): string {
  return `fm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toSafeCustomerMessage(error: unknown): string {
  const raw = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : 'Unknown error';
  const message = raw.toLowerCase();

  if (message.includes('429') || message.includes('rate')) {
    return 'Too many requests right now. Please try again shortly.';
  }
  if (message.includes('unauthorized') || message.includes('401') || message.includes('auth')) {
    return 'Authentication expired. Please sign in again.';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Request timed out. Please try again.';
  }

  return 'Crystallization is temporarily unavailable. Recovery has been triggered. Please try again.';
}

function emptyMineResponse(errorMessage: string, traceId?: string) {
  return {
    ok: false,
    results: [],
    bestScore: null,
    tierBreakdown: {},
    rerollCredit: false,
    persistedCount: 0,
    alreadyOwnedCount: 0,
    error: errorMessage,
    traceId,
  };
}

async function mapDiscoveryToResult(disc: any) {
  if (!disc || disc.cjpi < QUALITY_FLOOR) return null;

  const tier = scoreToPublicTier(disc.cjpi);
  if (!tier) return null;

  const pipelineSteps: PipelineStep[] = Array.isArray(disc.pipeline_steps)
    ? (disc.pipeline_steps as PipelineStep[])
    : moduleChainToSteps(Array.isArray(disc.module_chain) ? disc.module_chain : []);

  const derivedModuleChain = stepsToModuleChain(pipelineSteps);

  let fingerprint = disc.pipeline_fingerprint;
  if (!fingerprint) {
    fingerprint = await computeStructuralFingerprint(pipelineSteps);
  }

  return {
    id: disc.id,
    name: disc.name,
    description: disc.description,
    score: disc.cjpi,
    publicTier: tier,
    valuationDisplay: computeDisplayValuation(disc.cjpi),
    category: disc.category,
    systemChain: derivedModuleChain,
    pipelineSteps,
    fingerprint,
  };
}

/**
 * Fetch candidates from global pool WITH weighted tier respect.
 * Used by healing recovery and fallback paths to prevent bypassing rarity curve.
 */
async function fetchWeightedGlobalCandidates(
  supabase: ReturnType<typeof createClient>,
  fetchCount: number,
  priorMines: number,
): Promise<any[]> {
  const range = pickWeightedTierRange(priorMines);
  
  const { data } = await supabase.rpc('get_random_discoveries', {
    min_score: range.min,
    max_count: fetchCount,
    max_score: range.max,
  });

  if (Array.isArray(data) && data.length > 0) {
    return shuffleInPlace(data);
  }

  // Fallback: direct query within weighted range
  const { count: totalEligible } = await supabase
    .from('discoveries')
    .select('id', { count: 'exact', head: true })
    .gte('cjpi', range.min)
    .lte('cjpi', range.max);

  if (!totalEligible || totalEligible <= 0) return [];

  const randomOffset = Math.floor(Math.random() * Math.max(1, totalEligible - fetchCount));
  const { data: fallback } = await supabase
    .from('discoveries')
    .select(DISCOVERY_SELECT)
    .gte('cjpi', range.min)
    .lte('cjpi', range.max)
    .range(randomOffset, randomOffset + fetchCount - 1);

  return shuffleInPlace(fallback || []);
}

/** @deprecated — use fetchWeightedGlobalCandidates instead */
async function fetchGlobalCandidates(
  supabase: ReturnType<typeof createClient>,
  fetchCount: number,
): Promise<any[]> {
  const { count: totalEligible } = await supabase
    .from('discoveries')
    .select('id', { count: 'exact', head: true })
    .gte('cjpi', QUALITY_FLOOR);

  if (!totalEligible || totalEligible <= 0) return [];

  const randomOffset = Math.floor(Math.random() * Math.max(1, totalEligible - fetchCount));
  const { data } = await supabase
    .from('discoveries')
    .select(DISCOVERY_SELECT)
    .gte('cjpi', QUALITY_FLOOR)
    .range(randomOffset, randomOffset + fetchCount - 1);

  return shuffleInPlace(data || []);
}

async function attemptHealingRecovery(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  maxResults: number,
  priorMines: number = 0,
) {
  const fetchCount = Math.max(8, maxResults * 8);

  const { data: existingItems } = await supabase
    .from('foundry_inventory')
    .select('artifact_id')
    .eq('user_id', userId);

  const ownedIds = new Set((existingItems || []).map((item: any) => item.artifact_id));
  
  // Use weighted candidates instead of unfiltered global pool
  const candidates = await fetchWeightedGlobalCandidates(supabase, fetchCount, priorMines);

  const healedResults: any[] = [];
  for (const disc of candidates) {
    if (healedResults.length >= maxResults) break;
    if (ownedIds.has(disc.id)) continue;

    const mapped = await mapDiscoveryToResult(disc);
    if (!mapped) continue;

    healedResults.push(mapped);
    ownedIds.add(mapped.id);
  }

  return healedResults;
}

serve(async (req) => {
  let supabase: ReturnType<typeof createClient> | null = null;
  let authedUserId: string | null = null;
  let healingMaxResults = 1;
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    supabase = createClient(supabaseUrl, serviceKey);

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
    authedUserId = user.id;

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

    // Determine user tier — resilient to check-engine-subscription failures
    let foundryTier = 'free';
    try {
      const { data: isAdmin } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'admin',
      });

      if (isAdmin) {
        foundryTier = 'mythic_miner';
      } else {
        try {
          const { data: subData } = await supabase.functions.invoke('check-engine-subscription', {
            headers: { authorization: authHeader },
          });
          const engineTier = subData?.tier || 'free';
          if (['architect', 'pro', 'enterprise'].includes(engineTier)) foundryTier = 'excavator';
          else if (engineTier === 'studio') foundryTier = 'prospector';
          else if (['creator', 'builder'].includes(engineTier)) foundryTier = 'explorer';
        } catch (subError) {
          console.error('[foundry-mine] check-engine-subscription failed, defaulting to free tier:', subError);
          // Graceful degradation: use free tier if subscription check fails
        }
      }
    } catch (roleErr) {
      console.error('[foundry-mine] Role check failed, defaulting to free tier:', roleErr);
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
    const maxResults = Math.max(1, tierConfig.max_results_per_mine ?? 1);
    healingMaxResults = maxResults;

    // Get prior mine count for first-mine dampener
    const priorMines = dayCount ?? 0;

    const { data: existingItems } = await supabase
      .from('foundry_inventory')
      .select('artifact_id')
      .eq('user_id', user.id);

    const ownedIds = new Set((existingItems || []).map((e: any) => e.artifact_id));

    const results: any[] = [];
    const attemptedRanges: { min: number; max: number }[] = [];

    for (let slot = 0; slot < maxResults; slot++) {
      const range = pickWeightedTierRange(priorMines);
      attemptedRanges.push(range);
    }

    const uniqueRanges = [...new Map(attemptedRanges.map(r => [`${r.min}-${r.max}`, r])).values()];
    const rangedCandidates: Map<string, any[]> = new Map();
    const fetchCount = Math.max(8, maxResults * 4);

    for (const range of uniqueRanges) {
      const key = `${range.min}-${range.max}`;

      const { data: rpcResult, error: rpcError } = await supabase.rpc('get_random_discoveries', {
        min_score: range.min,
        max_count: fetchCount,
        max_score: range.max,
      });

      let candidates = Array.isArray(rpcResult) ? rpcResult : [];
      if (rpcError) {
        console.error('Range RPC failed:', rpcError.message, key);
      }

      if (candidates.length === 0) {
        const { count: totalEligible } = await supabase
          .from('discoveries')
          .select('id', { count: 'exact', head: true })
          .gte('cjpi', range.min)
          .lte('cjpi', range.max);

        if (totalEligible && totalEligible > 0) {
          const randomOffset = Math.floor(Math.random() * Math.max(1, totalEligible - fetchCount));
          const { data: fallbackDisc } = await supabase
            .from('discoveries')
            .select(DISCOVERY_SELECT)
            .gte('cjpi', range.min)
            .lte('cjpi', range.max)
            .range(randomOffset, randomOffset + fetchCount - 1);

          candidates = fallbackDisc || [];
        }
      }

      rangedCandidates.set(key, shuffleInPlace(candidates));
    }

    let globalFallbackPool: any[] = [];
    const allRangePoolsEmpty = [...rangedCandidates.values()].every(pool => pool.length === 0);
    if (allRangePoolsEmpty) {
      globalFallbackPool = await fetchWeightedGlobalCandidates(supabase, fetchCount * 2, priorMines);
    }

    const selectedIds = new Set<string>();
    const appendFromPool = async (pool: any[]) => {
      for (const disc of pool) {
        if (results.length >= maxResults) break;
        if (!disc) continue;
        if (ownedIds.has(disc.id)) continue;
        if (selectedIds.has(disc.id)) continue;

        const mapped = await mapDiscoveryToResult(disc);
        if (!mapped) continue;

        results.push(mapped);
        selectedIds.add(mapped.id);
        ownedIds.add(mapped.id);
      }
    };

    for (const range of attemptedRanges) {
      if (results.length >= maxResults) break;
      const key = `${range.min}-${range.max}`;
      const pool = rangedCandidates.get(key) || [];

      await appendFromPool(pool);

      if (results.length < maxResults && pool.length === 0 && globalFallbackPool.length > 0) {
        await appendFromPool(globalFallbackPool);
      }
    }

    if (results.length === 0) {
      if (globalFallbackPool.length === 0) {
        globalFallbackPool = await fetchWeightedGlobalCandidates(supabase, fetchCount * 2, priorMines);
      }
      await appendFromPool(globalFallbackPool);
    }

    // ─── Rediscovery tracking + fingerprint persistence ───────────
    for (const r of results) {
      if (r.fingerprint) {
        // Set fingerprint ONLY if NULL (immutability guard)
        await supabase
          .from('discoveries')
          .update({
            pipeline_fingerprint: r.fingerprint,
            pipeline_steps: r.pipelineSteps,
            last_discovered_at: now.toISOString(),
          })
          .eq('id', r.id)
          .is('pipeline_fingerprint', null);

        // Backfill pipeline_steps for discoveries that have fingerprint but no steps
        await supabase
          .from('discoveries')
          .update({
            pipeline_steps: r.pipelineSteps,
            last_discovered_at: now.toISOString(),
          })
          .eq('id', r.id)
          .is('pipeline_steps', null);

        // Atomic increment of discovery_count (never reset)
        const { error: incrementError } = await supabase.rpc('increment_discovery_count' as any, {
          p_discovery_id: r.id,
        });

        if (incrementError) {
          console.error('increment_discovery_count fallback:', incrementError.message);
          await supabase
            .from('discoveries')
            .update({
              last_discovered_at: now.toISOString(),
            })
            .eq('id', r.id);
        }

        // Atomic metrics accumulation — first try increment, then insert if missing
        const { data: existingMetric } = await supabase
          .from('foundry_discovery_metrics')
          .select('pipeline_fingerprint, total_discoveries, total_mine_events')
          .eq('pipeline_fingerprint', r.fingerprint)
          .maybeSingle();

        if (existingMetric) {
          // Atomic increment — never reset totals
          await supabase
            .from('foundry_discovery_metrics')
            .update({
              total_discoveries: (existingMetric.total_discoveries ?? 0) + 1,
              total_mine_events: (existingMetric.total_mine_events ?? 0) + 1,
              last_discovered_at: now.toISOString(),
            })
            .eq('pipeline_fingerprint', r.fingerprint);
        } else {
          // First occurrence — insert initial row
          await supabase
            .from('foundry_discovery_metrics')
            .insert({
              pipeline_fingerprint: r.fingerprint,
              pipeline_name: r.name,
              total_discoveries: 1,
              total_mine_events: 1,
              dfi: 0,
              last_discovered_at: now.toISOString(),
            });
        }
      }
    }

    // ─── Persist to inventory ─────────────────────────────────────
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
        pipeline_fingerprint: r.fingerprint || null,
        pipeline_steps: r.pipelineSteps || null,
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('foundry_inventory')
        .upsert(inventoryRows, { onConflict: 'user_id,artifact_id', ignoreDuplicates: true })
        .select('id');

      if (insertError) {
        const traceId = makeTraceId();
        console.error(`[foundry-mine:${traceId}] Inventory insert failed:`, insertError.message);
        return new Response(JSON.stringify(emptyMineResponse('Vault sync temporarily unavailable. Please try again.', traceId)), {
          status: 200,
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
    const traceId = makeTraceId();
    console.error(`[foundry-mine:${traceId}]`, err?.message ?? err);

    if (supabase && authedUserId) {
      try {
        const healedResults = await attemptHealingRecovery(supabase, authedUserId, healingMaxResults, 0);

        if (healedResults.length > 0) {
          const bestScore = Math.max(...healedResults.map((r: any) => r.score));
          const tierBreakdown: Record<string, number> = {};
          for (const r of healedResults) {
            tierBreakdown[r.publicTier] = (tierBreakdown[r.publicTier] || 0) + 1;
          }

          await supabase.from('foundry_mine_events').insert({
            user_id: authedUserId,
            result_count: healedResults.length,
            best_score: bestScore,
            tier_breakdown: tierBreakdown,
            blocked_reason: 'healing_recovery',
            rate_limit_bucket: 'healed',
          });

          return new Response(JSON.stringify({
            ok: true,
            results: healedResults,
            bestScore,
            tierBreakdown,
            rerollCredit: false,
            persistedCount: 0,
            alreadyOwnedCount: healedResults.length,
            healed: true,
            healingMode: 'fallback_pool',
            traceId,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (healErr: any) {
        console.error(`[foundry-mine:${traceId}] healing failed:`, healErr?.message ?? healErr);
      }
    }

    return new Response(JSON.stringify(
      emptyMineResponse(toSafeCustomerMessage(err), traceId)
    ), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
