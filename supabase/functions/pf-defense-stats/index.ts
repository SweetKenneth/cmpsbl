import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Validate input with Zod
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "24h";
    
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const StatsSchema = z.object({
      range: z.enum(["1h", "24h", "7d", "30d"]).optional().default("24h")
    });
    
    const validation = StatsSchema.safeParse({ range });
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid range parameter. Use: 1h, 24h, 7d, or 30d' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate time range
    const hoursMap: Record<string, number> = {
      "1h": 1,
      "24h": 24,
      "7d": 168,
      "30d": 720,
    };
    const hours = hoursMap[validation.data.range];
    
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    // Fetch events in range
    const { data: events, error } = await supabaseClient
      .from("defense_events")
      .select("*")
      .gte("detected_at", startTime.toISOString());

    if (error) {
      console.error("Stats fetch error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch stats" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate statistics
    const totalEvents = events?.length || 0;
    const threatsBlocked = events?.filter(e => e.action === "block").length || 0;
    const challengesIssued = events?.filter(e => e.action === "challenge").length || 0;
    const monitored = events?.filter(e => e.action === "monitor").length || 0;
    const avgRisk = totalEvents > 0
      ? Math.round(events.reduce((sum, e) => sum + e.risk_score, 0) / totalEvents)
      : 0;

    // Get top IPs
    const ipCounts: Record<string, number> = {};
    events?.forEach(e => {
      ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1;
    });
    const topIPs = Object.entries(ipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    // Get action distribution
    const actionDist = {
      allow: events?.filter(e => e.action === "allow").length || 0,
      block: threatsBlocked,
      challenge: challengesIssued,
      monitor: monitored,
    };

    const stats = {
      total_events: totalEvents,
      threats_blocked: threatsBlocked,
      challenges_issued: challengesIssued,
      monitored_events: monitored,
      avg_risk_score: avgRisk,
      false_positives: 0,
      time_range: range,
      top_ips: topIPs,
      action_distribution: actionDist,
      period: {
        start: startTime.toISOString(),
        end: new Date().toISOString(),
      },
    };

    console.log(`Stats generated for ${range}: ${totalEvents} events, ${threatsBlocked} blocked`);

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Defense stats error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
