/**
 * NEXUS Provider Discovery — Exhaustion testing for real provider limits
 * 
 * Called during the 48hr discovery phase. Sends rapid-fire requests to a
 * target provider until it hits rate limits or errors, then records the
 * real limit. Runs per-provider, one at a time.
 * 
 * After 2 full 24hr exhaustion cycles, the provider is marked 'confirmed'.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const { provider, action } = body;

    if (action === 'report_exhaustion') {
      // Called by CLM or NEXUS router when a provider returns 429
      if (!provider) throw new Error('Missing provider');

      const { data: existing } = await supabaseAdmin
        .from('nexus_provider_limits')
        .select('*')
        .eq('provider', provider)
        .maybeSingle();

      // Get today's actual usage for this provider
      const today = new Date().toISOString().split('T')[0];
      const { data: quota } = await supabaseAdmin
        .from('ai_daily_quota')
        .select('calls_used')
        .eq('provider', provider)
        .eq('date', today)
        .maybeSingle();

      const actualUsage = quota?.calls_used || 0;
      const exhaustionCount = (existing?.exhaustion_count || 0) + 1;
      
      // Average the discovered limit with previous findings for accuracy
      const prevDiscovered = existing?.discovered_rpd || actualUsage;
      const discoveredRpd = Math.round((prevDiscovered + actualUsage) / 2);

      // After 2 exhaustion cycles, mark as confirmed
      const phase = exhaustionCount >= 2 ? 'confirmed' : 'testing';
      const confidence = Math.min(1, exhaustionCount * 0.4 + 0.2);

      await supabaseAdmin.from('nexus_provider_limits').upsert({
        provider,
        stated_rpd: existing?.stated_rpd || 0,
        discovered_rpd: discoveredRpd,
        discovered_rpm: body.rpm_at_failure || existing?.discovered_rpm,
        last_exhaustion_at: new Date().toISOString(),
        exhaustion_count: exhaustionCount,
        avg_failure_threshold: discoveredRpd,
        confidence,
        discovery_phase: phase,
        last_updated: new Date().toISOString(),
        metadata: {
          last_failure_code: body.error_code || 429,
          last_failure_message: body.error_message || 'Rate limited',
          raw_readings: [
            ...(existing?.metadata?.raw_readings || []),
            { usage: actualUsage, timestamp: new Date().toISOString() }
          ].slice(-10), // Keep last 10 readings
        },
      }, { onConflict: 'provider' });

      console.log(`[NEXUS-DISCOVERY] Provider ${provider}: exhausted at ${actualUsage} calls (cycle ${exhaustionCount}, phase: ${phase})`);

      return new Response(JSON.stringify({
        success: true,
        provider,
        discovered_rpd: discoveredRpd,
        phase,
        confidence,
        exhaustion_count: exhaustionCount,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'status') {
      // Return current discovery status for all providers
      const { data: limits } = await supabaseAdmin
        .from('nexus_provider_limits')
        .select('*')
        .order('provider');

      const summary = {
        total_providers: limits?.length || 0,
        confirmed: limits?.filter(l => l.discovery_phase === 'confirmed').length || 0,
        testing: limits?.filter(l => l.discovery_phase === 'testing').length || 0,
        pending: limits?.filter(l => l.discovery_phase === 'pending').length || 0,
        providers: limits?.map(l => ({
          provider: l.provider,
          stated_rpd: l.stated_rpd,
          discovered_rpd: l.discovered_rpd,
          phase: l.discovery_phase,
          confidence: l.confidence,
          exhaustion_count: l.exhaustion_count,
        })),
      };

      return new Response(JSON.stringify({ success: true, ...summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}. Use 'report_exhaustion' or 'status'.`);

  } catch (error) {
    console.error("[NEXUS-DISCOVERY] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
