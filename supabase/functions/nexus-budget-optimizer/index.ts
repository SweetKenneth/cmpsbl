/**
 * NEXUS Budget Optimizer — Dynamic hourly CLM budget engine
 * 
 * Phase 1 (48hr): Discovery — exhaust each provider to find real limits
 * Phase 2 (ongoing): Optimize — hourly rebalance CLM calls vs substrate needs
 * 
 * Reserves capacity for:
 *  - Active chatbots (always-on)
 *  - Active developers (last 1hr)
 *  - Substrate operations (core, defense, vision, etc.)
 *  - Then allocates remainder to CLM
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Provider fleet — stated free-tier RPD (requests per day) at 80% safety
const PROVIDER_FLEET: Record<string, { statedRpd: number; statedRpm: number }> = {
  groq: { statedRpd: 800, statedRpm: 30 },
  cerebras: { statedRpd: 11520, statedRpm: 30 },
  sambanova: { statedRpd: 32, statedRpm: 10 },
  'google-ai-studio': { statedRpd: 1500, statedRpm: 15 },
  deepseek: { statedRpd: 100000, statedRpm: 60 },
  together: { statedRpd: 100000, statedRpm: 60 },
  'openrouter-1': { statedRpd: 128, statedRpm: 10 },
  'openrouter-2': { statedRpd: 128, statedRpm: 10 },
  'openrouter-3': { statedRpd: 128, statedRpm: 10 },
  'mistral-studio': { statedRpd: 530, statedRpm: 10 },
  'cohere-trial': { statedRpd: 26, statedRpm: 5 },
  hyperbolic: { statedRpd: 80000, statedRpm: 60 },
};

// Substrate operational reserve — calls per hour needed for non-CLM operations
const SUBSTRATE_OPS_PER_HOUR = 50;
const CHATBOT_RESERVE_PER_HOUR = 30;
const DEV_RESERVE_PER_ACTIVE_DEV = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const hoursRemaining = Math.max(1, 24 - currentHour);
    
    // Round to hour for snapshot key
    const snapshotHour = new Date(now);
    snapshotHour.setMinutes(0, 0, 0);

    console.log(`[NEXUS-OPTIMIZER] Running for ${today} hour ${currentHour}, ${hoursRemaining}h remaining`);

    // ═══════════════════════════════════════════════════════════════
    // 1. Get current provider limits (discovered or stated)
    // ═══════════════════════════════════════════════════════════════
    const { data: providerLimits } = await supabaseAdmin
      .from('nexus_provider_limits')
      .select('*');

    const limitMap: Record<string, { rpd: number; rpm: number; phase: string; confidence: number }> = {};
    
    // Initialize with stated values
    for (const [provider, stated] of Object.entries(PROVIDER_FLEET)) {
      limitMap[provider] = {
        rpd: stated.statedRpd,
        rpm: stated.statedRpm,
        phase: 'pending',
        confidence: 0,
      };
    }

    // Override with discovered values
    for (const pl of providerLimits || []) {
      if (limitMap[pl.provider] && pl.discovered_rpd && pl.confidence > 0.5) {
        limitMap[pl.provider].rpd = pl.discovered_rpd;
        limitMap[pl.provider].rpm = pl.discovered_rpm || limitMap[pl.provider].rpm;
        limitMap[pl.provider].phase = pl.discovery_phase;
        limitMap[pl.provider].confidence = pl.confidence;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. Get today's actual usage per provider
    // ═══════════════════════════════════════════════════════════════
    const { data: quotas } = await supabaseAdmin
      .from('ai_daily_quota')
      .select('provider, calls_used, calls_budget')
      .eq('date', today);

    const usageMap: Record<string, number> = {};
    let totalUsedToday = 0;
    for (const q of quotas || []) {
      usageMap[q.provider] = q.calls_used || 0;
      totalUsedToday += q.calls_used || 0;
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. Calculate total real capacity
    // ═══════════════════════════════════════════════════════════════
    let totalDailyCapacity = 0;
    const providerBreakdown: Record<string, any> = {};

    for (const [provider, limits] of Object.entries(limitMap)) {
      const used = usageMap[provider] || 0;
      const remaining = Math.max(0, limits.rpd - used);
      totalDailyCapacity += limits.rpd;
      
      providerBreakdown[provider] = {
        rpd: limits.rpd,
        used,
        remaining,
        phase: limits.phase,
        confidence: limits.confidence,
        rpm: limits.rpm,
      };
    }

    const totalRemaining = Math.max(0, totalDailyCapacity - totalUsedToday);

    // ═══════════════════════════════════════════════════════════════
    // 4. Calculate reserves
    // ═══════════════════════════════════════════════════════════════
    
    // Active developers in last hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const { count: activeDevCount } = await supabaseAdmin
      .from('access_usage')
      .select('developer_id', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo);

    const activeDevelopers = activeDevCount || 0;

    // Reserves for remaining hours
    const substrateReserve = SUBSTRATE_OPS_PER_HOUR * hoursRemaining;
    const chatbotReserve = CHATBOT_RESERVE_PER_HOUR * hoursRemaining;
    const devReserve = DEV_RESERVE_PER_ACTIVE_DEV * activeDevelopers * hoursRemaining;
    const totalReserved = substrateReserve + chatbotReserve + devReserve;

    // ═══════════════════════════════════════════════════════════════
    // 5. Calculate CLM allocation
    // ═══════════════════════════════════════════════════════════════
    const availableForClm = Math.max(0, totalRemaining - totalReserved);
    
    // Calculate per-hour CLM rate
    const clmPerHour = Math.floor(availableForClm / hoursRemaining);
    
    // Calculate per-minute rate (respect provider RPM limits)
    const totalRpm = Object.values(limitMap).reduce((sum, l) => sum + l.rpm, 0);
    const clmPerMinute = Math.min(Math.floor(clmPerHour / 60), totalRpm);

    // Determine strategy
    let strategy = 'balanced';
    const utilizationRate = totalUsedToday / totalDailyCapacity;
    
    // Check if we're in discovery phase
    const undiscoveredProviders = Object.values(limitMap).filter(l => l.phase === 'pending' || l.phase === 'testing');
    if (undiscoveredProviders.length > Object.keys(limitMap).length * 0.3) {
      strategy = 'discovery'; // Still discovering limits
    } else if (utilizationRate < 0.3 && currentHour > 6) {
      strategy = 'aggressive'; // Under-utilizing, push harder
    } else if (utilizationRate > 0.8) {
      strategy = 'conservative'; // Close to limits, be careful
    } else if (availableForClm > totalRemaining * 0.7) {
      strategy = 'surge'; // Lots of headroom, maximize CLM
    }

    console.log(`[NEXUS-OPTIMIZER] Strategy: ${strategy}, CLM/hr: ${clmPerHour}, Active devs: ${activeDevelopers}`);
    console.log(`[NEXUS-OPTIMIZER] Total capacity: ${totalDailyCapacity}, Used: ${totalUsedToday}, Reserved: ${totalReserved}, CLM available: ${availableForClm}`);

    // ═══════════════════════════════════════════════════════════════
    // 6. Save hourly snapshot
    // ═══════════════════════════════════════════════════════════════
    await supabaseAdmin.from('nexus_hourly_snapshots').upsert({
      snapshot_hour: snapshotHour.toISOString(),
      total_capacity: totalDailyCapacity,
      used_today: totalUsedToday,
      reserved_for_substrate: substrateReserve,
      reserved_for_active_devs: devReserve,
      reserved_for_chatbots: chatbotReserve,
      available_for_clm: availableForClm,
      clm_calls_dispatched: clmPerHour,
      active_developer_count: activeDevelopers,
      optimization_strategy: strategy,
      provider_breakdown: providerBreakdown,
    }, { onConflict: 'snapshot_hour' });

    // ═══════════════════════════════════════════════════════════════
    // 7. Update CLM engine budget (system_flags or similar)
    // ═══════════════════════════════════════════════════════════════
    // Write the optimized budget where the CLM engine can read it
    await supabaseAdmin.from('system_flags').upsert({
      key: 'nexus_clm_budget',
      value: JSON.stringify({
        calls_per_hour: clmPerHour,
        calls_per_minute: clmPerMinute,
        strategy,
        total_available: availableForClm,
        updated_at: now.toISOString(),
        active_developers: activeDevelopers,
        hours_remaining: hoursRemaining,
      }),
      updated_at: now.toISOString(),
    }, { onConflict: 'key' });

    // ═══════════════════════════════════════════════════════════════
    // 8. Discovery phase — trigger exhaustion tests for unconfirmed providers
    // ═══════════════════════════════════════════════════════════════
    if (strategy === 'discovery') {
      const pendingProviders = Object.entries(limitMap)
        .filter(([_, l]) => l.phase === 'pending')
        .map(([provider]) => provider);

      if (pendingProviders.length > 0) {
        // Mark first pending provider as 'testing'
        const testTarget = pendingProviders[0];
        await supabaseAdmin.from('nexus_provider_limits').upsert({
          provider: testTarget,
          stated_rpd: PROVIDER_FLEET[testTarget]?.statedRpd || 0,
          discovery_phase: 'testing',
          last_updated: now.toISOString(),
        }, { onConflict: 'provider' });

        console.log(`[NEXUS-OPTIMIZER] Discovery: targeting ${testTarget} for exhaustion test`);
      }
    }

    const result = {
      success: true,
      snapshot: {
        hour: currentHour,
        date: today,
        strategy,
        total_capacity: totalDailyCapacity,
        used_today: totalUsedToday,
        total_remaining: totalRemaining,
        reserved: {
          substrate: substrateReserve,
          chatbots: chatbotReserve,
          developers: devReserve,
          total: totalReserved,
        },
        clm: {
          available: availableForClm,
          per_hour: clmPerHour,
          per_minute: clmPerMinute,
        },
        active_developers: activeDevelopers,
        providers_confirmed: Object.values(limitMap).filter(l => l.phase === 'confirmed').length,
        providers_pending: Object.values(limitMap).filter(l => l.phase !== 'confirmed').length,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[NEXUS-OPTIMIZER] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
