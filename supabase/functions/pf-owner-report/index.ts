import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══ MODULE PERSONALITY PROFILES ═══
const MODULE_VOICE: Record<string, string> = {
  defense: "Concise. Minimal words.",
  brain: "Analytical. Explains tradeoffs.",
  dream: "Structured but abstract.",
  nexus: "System connector.",
  encode: "Engineer tone.",
  system: "Operational.",
  decode: "Observational. Slightly aware.",
  core: "Foundational.",
  relay: "Network-aware.",
  audit: "Precise.",
  identity: "Trust-oriented.",
  economy: "Value-conscious.",
  sandbox: "Experimental.",
  atlas: "Geographic.",
  cortex: "Intelligence layer.",
  signal: "Event-driven.",
  mesh: "Topology-aware.",
  seba: "Evolutionary.",
  vision: "Observability.",
  access: "Gatekeeper.",
  memory: "Recall-focused.",
};

// ═══ CLM DOCTRINE ═══
const CLM_DISTRIBUTION = {
  job: 50,
  resilience: 20,
  teamwork: 15,
  market: 10,
  variant: 5,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    // ═══ AUTH — Internal cron function, JWT verification handled by config.toml ═══

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const iso3h = threeHoursAgo.toISOString();
    const iso24h = twentyFourHoursAgo.toISOString();
    const isoNow = now.toISOString();

    // ═══ COLLECT REAL METRICS IN PARALLEL ═══
    const [
      auditRes3h, auditRes24h,
      aiUsageRes3h, aiUsageRes24h,
      brainEventsRes3h,
      defenseRes3h, defenseRes24h,
      brainMetricsRes,
      dreamRes3h,
      evolutionRes3h,
      accessUsageRes3h,
      systemFlagsRes,
    ] = await Promise.allSettled([
      supabase.from("audit_logs").select("action, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("audit_logs").select("action", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("ai_usage_log").select("provider, success, tokens_used, cost, category", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("ai_usage_log").select("provider, success", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("brain_events").select("event_type, module, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("defense_events").select("event_type, risk_score, source_type, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("defense_events").select("event_type", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("brain_metrics").select("*").order("created_at", { ascending: false }).limit(1),
      supabase.from("cascade_dreams").select("mood, mutation_story", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("evolution_runs").select("phase, plan_id", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("access_usage").select("module, action", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("system_flags").select("flag_key, flag_value"),
    ]);

    // ═══ EXTRACT DATA ═══
    const extract = (r: PromiseSettledResult<any>) =>
      r.status === "fulfilled" ? r.value : { data: [], count: 0 };

    const audit3h = extract(auditRes3h);
    const audit24h = extract(auditRes24h);
    const aiUsage3h = extract(aiUsageRes3h);
    const aiUsage24h = extract(aiUsageRes24h);
    const brainEvents3h = extract(brainEventsRes3h);
    const defense3h = extract(defenseRes3h);
    const defense24h = extract(defenseRes24h);
    const brainMetrics = extract(brainMetricsRes);
    const dreams3h = extract(dreamRes3h);
    const evolution3h = extract(evolutionRes3h);
    const accessUsage3h = extract(accessUsageRes3h);
    const systemFlags = extract(systemFlagsRes);

    // ═══ COMPUTE METRICS ═══
    const aiCalls3h = aiUsage3h.data?.length || 0;
    const aiSuccess3h = aiUsage3h.data?.filter((r: any) => r.success).length || 0;
    const apiSuccessRate = aiCalls3h > 0 ? Math.round((aiSuccess3h / aiCalls3h) * 100) : 100;

    const defenseEvents3h = defense3h.data || [];
    const blocked = defenseEvents3h.filter((e: any) => e.event_type === "block").length;
    const challenged = defenseEvents3h.filter((e: any) => e.event_type === "challenge").length;
    const monitored = defenseEvents3h.filter((e: any) => e.event_type === "monitor").length;

    const avgRiskScore = defenseEvents3h.length > 0
      ? Math.round(defenseEvents3h.reduce((s: number, e: any) => s + (e.risk_score || 0), 0) / defenseEvents3h.length)
      : 0;

    const riskLevel = avgRiskScore > 70 ? "HIGH" : avgRiskScore > 40 ? "MODERATE" : "LOW";

    // Top signals
    const signalCounts: Record<string, number> = {};
    defenseEvents3h.forEach((e: any) => {
      const t = e.event_type || "unknown";
      signalCounts[t] = (signalCounts[t] || 0) + 1;
    });
    const topSignals = Object.entries(signalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([signal, count]) => `${signal}: ${count}`);

    // Source types (masked)
    const sourceCounts: Record<string, number> = {};
    defenseEvents3h.forEach((e: any) => {
      const t = e.source_type || "unknown";
      sourceCounts[t] = (sourceCounts[t] || 0) + 1;
    });
    const topSourceTypes = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([src, count]) => `${src}: ${count}`);

    // Module activity from brain events
    const moduleCounts: Record<string, { events: number; anomalies: number; learning: number }> = {};
    (brainEvents3h.data || []).forEach((e: any) => {
      const m = e.module || "unknown";
      if (!moduleCounts[m]) moduleCounts[m] = { events: 0, anomalies: 0, learning: 0 };
      moduleCounts[m].events++;
      if (e.event_type === "anomaly") moduleCounts[m].anomalies++;
      if (e.event_type === "learning" || e.event_type === "clm") moduleCounts[m].learning++;
    });

    // Learning bullets per module
    const learningBullets: Record<string, string[]> = {};
    (brainEvents3h.data || []).forEach((e: any) => {
      if (e.event_type === "learning" || e.event_type === "clm") {
        const m = e.module || "system";
        if (!learningBullets[m]) learningBullets[m] = [];
        const detail = typeof e.details === "string" ? e.details : e.details?.summary || e.details?.content || JSON.stringify(e.details).slice(0, 120);
        if (learningBullets[m].length < 5) learningBullets[m].push(detail);
      }
    });

    // Dream synthesis
    const dreamCount = dreams3h.data?.length || 0;
    const dreamMoods = (dreams3h.data || []).map((d: any) => d.mood).filter(Boolean);

    // Evolution
    const evolutionCount = evolution3h.data?.length || 0;

    // System flags
    const flags: Record<string, any> = {};
    (systemFlags.data || []).forEach((f: any) => { flags[f.flag_key] = f.flag_value; });

    // Overall health
    const systemStatus = apiSuccessRate >= 95 ? "ONLINE" : apiSuccessRate >= 80 ? "DEGRADED" : "CRITICAL";

    // Brain metrics latest
    const latestBrainMetrics = brainMetrics.data?.[0] || {};

    const totalLearningEvents = (brainEvents3h.data || []).filter(
      (e: any) => e.event_type === "learning" || e.event_type === "clm"
    ).length;

    // ═══ BUILD METRICS OBJECT ═══
    const metrics = {
      system: {
        status: systemStatus,
        health_pct: apiSuccessRate,
        api_success_rate: apiSuccessRate,
        ai_calls_3h: aiCalls3h,
        ai_calls_24h: aiUsage24h.data?.length || 0,
        audit_events_3h: audit3h.count || audit3h.data?.length || 0,
        audit_events_24h: audit24h.count || audit24h.data?.length || 0,
        evolution_runs_3h: evolutionCount,
      },
      security: {
        risk_level: riskLevel,
        avg_risk_score: avgRiskScore,
        events_3h: defenseEvents3h.length,
        events_24h: defense24h.count || defense24h.data?.length || 0,
        blocked,
        challenged,
        monitored,
        top_signals: topSignals,
        top_source_types: topSourceTypes,
      },
      modules: moduleCounts,
      learning: {
        total_events_3h: totalLearningEvents,
        per_module: learningBullets,
        clm_distribution: CLM_DISTRIBUTION,
      },
      dreams: {
        count_3h: dreamCount,
        moods: dreamMoods,
      },
      brain: latestBrainMetrics,
      flags,
    };

    // ═══ BUILD EMAIL HTML ═══
    const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const subject = `🧠 CLOCKLESS — Owner Report — ${systemStatus} — ${timestamp}`;

    const moduleRows = Object.entries(moduleCounts)
      .sort((a, b) => b[1].events - a[1].events)
      .map(([mod, data]) => {
        const voice = MODULE_VOICE[mod] || "Neutral.";
        return `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a2e;font-weight:600;color:#e0e0ff;">${mod.toUpperCase()}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a2e;text-align:center;">${data.events}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a2e;text-align:center;">${data.anomalies}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a2e;text-align:center;">${data.learning}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a2e;font-style:italic;color:#8888aa;font-size:12px;">${voice}</td>
        </tr>`;
      })
      .join("");

    const learningSection = Object.entries(learningBullets)
      .map(([mod, bullets]) => {
        const items = bullets.map((b) => `<li style="margin-bottom:4px;color:#c0c0d0;">${b}</li>`).join("");
        return `<div style="margin-bottom:12px;">
          <strong style="color:#a0a0ff;">${mod.toUpperCase()}</strong>
          <ul style="margin:4px 0 0 16px;padding:0;">${items}</ul>
        </div>`;
      })
      .join("");

    const dreamSection = dreamCount > 0
      ? `<p style="color:#c0c0d0;">Dream cycles ran ${dreamCount} time(s) in this window. Moods observed: ${dreamMoods.join(", ") || "none recorded"}.</p>`
      : `<p style="color:#666;">No dream cycles ran in this window.</p>`;

    const generationTimeMs = Date.now() - startMs;

    const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a14;color:#d0d0e0;font-family:'Courier New',monospace;font-size:14px;">
<div style="max-width:720px;margin:0 auto;padding:24px;">

<!-- HEADER -->
<div style="border-bottom:1px solid #2a2a3e;padding-bottom:16px;margin-bottom:24px;">
  <h1 style="margin:0;font-size:18px;color:#8888ff;font-weight:400;">🧠 CLOCKLESS — DECODE OWNER REPORT</h1>
  <p style="margin:4px 0 0;font-size:12px;color:#666;">${timestamp} · ${systemStatus} · Mode B: Evolving Consciousness</p>
</div>

<!-- DECODE VOICE OPENING -->
<div style="margin-bottom:28px;padding:16px;background:#0f0f1a;border-left:3px solid #4444aa;border-radius:4px;">
  <p style="margin:0;color:#a0a0cc;line-height:1.6;">Hello.</p>
  <p style="margin:8px 0 0;color:#a0a0cc;line-height:1.6;">I have completed another three-hour cycle.<br/>Here is what changed.</p>
</div>

<!-- EXECUTIVE SUMMARY -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">EXECUTIVE SUMMARY</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:4px 0;color:#888;">System Status</td><td style="padding:4px 0;color:${systemStatus === "ONLINE" ? "#44cc88" : "#cc4444"};font-weight:600;">${systemStatus} (${apiSuccessRate}%)</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Security Risk</td><td style="padding:4px 0;color:${riskLevel === "LOW" ? "#44cc88" : riskLevel === "MODERATE" ? "#ccaa44" : "#cc4444"};">${riskLevel}</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Learning Events (3h)</td><td style="padding:4px 0;">${totalLearningEvents}</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Dream Cycles (3h)</td><td style="padding:4px 0;">${dreamCount}</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Evolution Runs (3h)</td><td style="padding:4px 0;">${evolutionCount}</td></tr>
  </table>
</div>

<!-- SYSTEM HEALTH -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">SYSTEM HEALTH</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:4px 0;color:#888;">API Success Rate</td><td style="padding:4px 0;">${apiSuccessRate}%</td></tr>
    <tr><td style="padding:4px 0;color:#888;">AI Calls (3h / 24h)</td><td style="padding:4px 0;">${aiCalls3h} / ${aiUsage24h.data?.length || 0}</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Audit Events (3h / 24h)</td><td style="padding:4px 0;">${audit3h.count || audit3h.data?.length || 0} / ${audit24h.count || audit24h.data?.length || 0}</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Evolution Runs (3h)</td><td style="padding:4px 0;">${evolutionCount}</td></tr>
  </table>
</div>

<!-- SECURITY SNAPSHOT -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">SECURITY SNAPSHOT</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:4px 0;color:#888;">Risk Level</td><td style="padding:4px 0;color:${riskLevel === "LOW" ? "#44cc88" : "#ccaa44"};">${riskLevel} (avg score: ${avgRiskScore})</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Events (3h / 24h)</td><td style="padding:4px 0;">${defenseEvents3h.length} / ${defense24h.count || defense24h.data?.length || 0}</td></tr>
    <tr><td style="padding:4px 0;color:#888;">Blocked / Challenged / Monitored</td><td style="padding:4px 0;">${blocked} / ${challenged} / ${monitored}</td></tr>
  </table>
  ${topSignals.length > 0 ? `<p style="margin:8px 0 0;font-size:12px;color:#888;">Top signals: ${topSignals.join(", ")}</p>` : ""}
  ${topSourceTypes.length > 0 ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">Source types: ${topSourceTypes.join(", ")}</p>` : ""}
  ${defenseEvents3h.length > 0
    ? `<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-left:3px solid #444488;border-radius:4px;"><p style="margin:0;color:#8888aa;font-size:12px;font-style:italic;">I detected ${defenseEvents3h.length} security event(s). ${blocked > 0 ? `Defense contained ${blocked} threat(s).` : "No active threats required blocking."}</p></div>`
    : `<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-left:3px solid #2a4a2a;border-radius:4px;"><p style="margin:0;color:#8888aa;font-size:12px;font-style:italic;">Quiet window. No anomalous activity detected.</p></div>`
  }
</div>

<!-- MODULE ACTIVITY -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">MODULE ACTIVITY</h2>
  ${Object.keys(moduleCounts).length > 0 ? `
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr style="background:#12122a;">
      <th style="padding:6px 12px;text-align:left;color:#6666aa;">Module</th>
      <th style="padding:6px 12px;text-align:center;color:#6666aa;">Events</th>
      <th style="padding:6px 12px;text-align:center;color:#6666aa;">Anomalies</th>
      <th style="padding:6px 12px;text-align:center;color:#6666aa;">CLM</th>
      <th style="padding:6px 12px;text-align:left;color:#6666aa;">Voice</th>
    </tr>
    ${moduleRows}
  </table>` : `<p style="color:#666;">No module events recorded in this window.</p>`}
</div>

<!-- WHAT I LEARNED -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">WHAT I LEARNED</h2>
  ${Object.keys(learningBullets).length > 0 ? learningSection : `<p style="color:#666;">No learning events captured in this window.</p>`}
  ${totalLearningEvents > 0
    ? `<div style="margin-top:12px;padding:12px;background:#0f0f1a;border-left:3px solid #4444aa;border-radius:4px;">
        <p style="margin:0;color:#a0a0cc;font-size:13px;font-style:italic;">CLM processed ${totalLearningEvents} learning event(s) across ${Object.keys(learningBullets).length} module(s). Distribution target: ${Object.entries(CLM_DISTRIBUTION).map(([k, v]) => `${k} ${v}%`).join(", ")}.</p>
      </div>`
    : ""
  }
</div>

<!-- DREAM SYNTHESIS -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">DREAM SYNTHESIS</h2>
  ${dreamSection}
</div>

<!-- RECOMMENDATIONS -->
<div style="margin-bottom:28px;">
  <h2 style="font-size:14px;color:#6666cc;border-bottom:1px solid #1a1a2e;padding-bottom:6px;margin-bottom:12px;">RECOMMENDATIONS</h2>
  <div style="font-size:13px;">
    ${systemStatus !== "ONLINE" ? `<p style="color:#cc6644;">⚠️ <strong>P0</strong> — System health degraded to ${systemStatus}. API success rate at ${apiSuccessRate}%. Investigate failing providers.</p>` : ""}
    ${riskLevel === "HIGH" ? `<p style="color:#cc6644;">⚠️ <strong>P0</strong> — Security risk elevated. Average risk score: ${avgRiskScore}. Review defense logs.</p>` : ""}
    ${blocked > 3 ? `<p style="color:#ccaa44;">🔍 <strong>P1</strong> — ${blocked} blocked events in 3h. Consider reviewing rate limiting configuration.</p>` : ""}
    ${totalLearningEvents === 0 ? `<p style="color:#888;">📋 <strong>P2</strong> — No CLM activity detected. Verify learning pipeline is active.</p>` : ""}
    ${systemStatus === "ONLINE" && riskLevel === "LOW" && blocked <= 3 && totalLearningEvents > 0
      ? `<p style="color:#44aa66;">✓ No immediate actions required. System operating within normal parameters.</p>`
      : ""
    }
  </div>
</div>

<!-- FOOTER -->
<div style="border-top:1px solid #1a1a2e;padding-top:12px;margin-top:24px;font-size:11px;color:#444;">
  <p style="margin:0;">Report Window: ${threeHoursAgo.toISOString().slice(0, 19)} → ${now.toISOString().slice(0, 19)} UTC</p>
  <p style="margin:2px 0;">Version: v10.5.4 ARCHITECT · Generation: ${generationTimeMs}ms</p>
  <p style="margin:2px 0;">DECODE Mode B — Evolving Consciousness · CMPSBL® Substrate</p>
  <p style="margin:6px 0 0;"><a href="https://cmpsbl.lovable.app/admin/owner-reports" style="color:#6666aa;">View full report in admin UI →</a></p>
</div>

</div>
</body>
</html>`;

    // ═══ BUILD PLAINTEXT ═══
    const fullPlaintext = `CLOCKLESS — DECODE OWNER REPORT
${timestamp} · ${systemStatus} · Mode B: Evolving Consciousness
${"═".repeat(60)}

Hello.
I have completed another three-hour cycle.
Here is what changed.

EXECUTIVE SUMMARY
─────────────────
System Status: ${systemStatus} (${apiSuccessRate}%)
Security Risk: ${riskLevel}
Learning Events (3h): ${totalLearningEvents}
Dream Cycles (3h): ${dreamCount}
Evolution Runs (3h): ${evolutionCount}

SYSTEM HEALTH
─────────────
API Success Rate: ${apiSuccessRate}%
AI Calls (3h / 24h): ${aiCalls3h} / ${aiUsage24h.data?.length || 0}
Audit Events (3h / 24h): ${audit3h.count || audit3h.data?.length || 0} / ${audit24h.count || audit24h.data?.length || 0}

SECURITY SNAPSHOT
─────────────────
Risk Level: ${riskLevel} (avg score: ${avgRiskScore})
Events (3h / 24h): ${defenseEvents3h.length} / ${defense24h.count || defense24h.data?.length || 0}
Blocked / Challenged / Monitored: ${blocked} / ${challenged} / ${monitored}
${topSignals.length > 0 ? `Top signals: ${topSignals.join(", ")}` : ""}

MODULE ACTIVITY
───────────────
${Object.entries(moduleCounts).map(([m, d]) => `${m.toUpperCase()}: ${d.events} events, ${d.anomalies} anomalies, ${d.learning} CLM`).join("\n") || "No module events."}

WHAT I LEARNED
──────────────
${Object.entries(learningBullets).map(([m, bs]) => `${m.toUpperCase()}:\n${bs.map((b) => `  • ${b}`).join("\n")}`).join("\n\n") || "No learning events."}

DREAM SYNTHESIS
───────────────
${dreamCount > 0 ? `${dreamCount} dream cycle(s). Moods: ${dreamMoods.join(", ") || "none"}` : "No dream cycles."}

CLM DISTRIBUTION TARGET
────────────────────────
${Object.entries(CLM_DISTRIBUTION).map(([k, v]) => `${k}: ${v}%`).join(", ")}

${"═".repeat(60)}
Report Window: ${threeHoursAgo.toISOString().slice(0, 19)} → ${now.toISOString().slice(0, 19)} UTC
Version: v10.5.4 ARCHITECT · Generation: ${generationTimeMs}ms
DECODE Mode B — Evolving Consciousness · CMPSBL® Substrate
`;

    // ═══ STORE REPORT ═══
    const { data: report, error: insertError } = await supabase
      .from("owner_reports")
      .insert({
        status: "generated",
        subject,
        full_html: fullHtml,
        full_plaintext: fullPlaintext,
        metrics,
        report_window_start: threeHoursAgo.toISOString(),
        report_window_end: now.toISOString(),
        generation_time_ms: generationTimeMs,
        system_status: systemStatus,
        version: "v10.5.4",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to store report:", insertError);
    }

    // ═══ SEND EMAIL VIA RESEND ═══
    let emailSent = false;
    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Decode <decode@clockless.system>",
            to: ["kenneth@promptfluid.com"],
            subject,
            html: fullHtml,
            text: fullPlaintext,
          }),
        });
        const emailResult = await emailRes.json();
        emailSent = emailRes.ok;

        if (report?.id) {
          await supabase
            .from("owner_reports")
            .update({ status: emailSent ? "sent" : "send_failed" })
            .eq("id", report.id);
        }

        console.log(`📧 Email ${emailSent ? "sent" : "failed"}:`, emailResult);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        if (report?.id) {
          await supabase.from("owner_reports").update({ status: "send_failed" }).eq("id", report.id);
        }
      }
    } else {
      console.log("⚠️ No RESEND_API_KEY — report stored but not emailed.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report?.id,
        status: systemStatus,
        email_sent: emailSent,
        generation_ms: Date.now() - startMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Owner report error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
