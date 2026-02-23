import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

const CLM_DISTRIBUTION = { job: 50, resilience: 20, teamwork: 15, market: 10, variant: 5 };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const iso3h = threeHoursAgo.toISOString();
    const iso24h = twentyFourHoursAgo.toISOString();

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
      clmCyclesRes3h,
      clmCyclesRes24h,
      clmLearningRes3h,
      dailyQuotaRes,
    ] = await Promise.allSettled([
      supabase.from("audit_logs").select("action, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("audit_logs").select("action", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("ai_usage_log").select("provider, success, tokens_used, cost, category", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("ai_usage_log").select("provider, success", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("brain_events").select("event_type, module, details, data", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("defense_events").select("event_type, risk_score, source_type, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("defense_events").select("event_type", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("brain_metrics").select("*").order("created_at", { ascending: false }).limit(1),
      supabase.from("cascade_dreams").select("mood, mutation_story", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("evolution_runs").select("phase, plan_id", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("access_usage").select("module, action", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("system_flags").select("key, enabled"),
      // CLM-specific: count actual server cycles
      supabase.from("brain_events").select("id", { count: "exact", head: true }).eq("event_type", "clm_server_cycle").gte("created_at", iso3h),
      supabase.from("brain_events").select("id", { count: "exact", head: true }).eq("event_type", "clm_server_cycle").gte("created_at", iso24h),
      supabase.from("brain_events").select("id, data", { count: "exact" }).eq("event_type", "technical_learning_cycle").gte("created_at", iso3h),
      supabase.from("ai_daily_quota").select("provider, calls_budget, calls_used, tokens_used").eq("date", now.toISOString().split("T")[0]),
    ]);

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
    const clmCycles3h = extract(clmCyclesRes3h);
    const clmCycles24h = extract(clmCyclesRes24h);
    const clmLearning3h = extract(clmLearningRes3h);
    const dailyQuota = extract(dailyQuotaRes);

    // ═══ COMPUTE METRICS ═══
    const aiCalls3h = aiUsage3h.data?.length || 0;
    const aiSuccess3h = aiUsage3h.data?.filter((r: any) => r.success).length || 0;
    const apiSuccessRate = aiCalls3h > 0 ? Math.round((aiSuccess3h / aiCalls3h) * 100) : 100;

    const defenseEvents3h = defense3h.data || [];
    const blocked = defenseEvents3h.filter((e: any) => e.event_type === "block").length;
    const challenged = defenseEvents3h.filter((e: any) => e.event_type === "challenge").length;
    const monitored = defenseEvents3h.filter((e: any) => e.event_type === "monitor").length;
    const avgRiskScore = defenseEvents3h.length > 0
      ? Math.round(defenseEvents3h.reduce((s: number, e: any) => s + (e.risk_score || 0), 0) / defenseEvents3h.length) : 0;
    const riskLevel = avgRiskScore > 70 ? "HIGH" : avgRiskScore > 40 ? "MODERATE" : "LOW";

    const topSignals: string[] = [];
    const signalCounts: Record<string, number> = {};
    defenseEvents3h.forEach((e: any) => { const t = e.event_type || "unknown"; signalCounts[t] = (signalCounts[t] || 0) + 1; });
    Object.entries(signalCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([s, c]) => topSignals.push(`${s}: ${c}`));

    // Module activity
    const moduleCounts: Record<string, { events: number; anomalies: number; learning: number }> = {};
    (brainEvents3h.data || []).forEach((e: any) => {
      const m = e.module || "unknown";
      if (!moduleCounts[m]) moduleCounts[m] = { events: 0, anomalies: 0, learning: 0 };
      moduleCounts[m].events++;
      if (e.event_type === "anomaly") moduleCounts[m].anomalies++;
      if (e.event_type === "learning" || e.event_type === "clm" || e.event_type === "technical_learning_cycle" || e.event_type === "module_learning_insight") moduleCounts[m].learning++;
    });

    // Learning bullets
    const learningBullets: Record<string, string[]> = {};
    (brainEvents3h.data || []).forEach((e: any) => {
      if (["learning", "clm", "technical_learning_cycle", "module_learning_insight"].includes(e.event_type)) {
        const m = e.module || "system";
        if (!learningBullets[m]) learningBullets[m] = [];
        const d = e.data || e.details;
        const detail = typeof d === "string" ? d : d?.title || d?.content || d?.summary || JSON.stringify(d).slice(0, 120);
        if (learningBullets[m].length < 5) learningBullets[m].push(detail);
      }
    });

    const totalLearningEvents = (brainEvents3h.data || []).filter(
      (e: any) => ["learning", "clm", "technical_learning_cycle", "module_learning_insight", "clm_server_cycle"].includes(e.event_type)
    ).length;

    // CLM stats
    const clmCycleCount3h = clmCycles3h.count || 0;
    const clmCycleCount24h = clmCycles24h.count || 0;
    const clmTopicsStudied3h = clmLearning3h.count || clmLearning3h.data?.length || 0;
    const clmTopics = (clmLearning3h.data || []).map((e: any) => e.data?.domain).filter(Boolean);

    // API quota budget
    const quotaData = dailyQuota.data || [];
    const totalBudget = quotaData.reduce((s: number, q: any) => s + (q.calls_budget || 0), 0);
    const totalUsed = quotaData.reduce((s: number, q: any) => s + (q.calls_used || 0), 0);
    const quotaUtilization = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

    const dreamCount = dreams3h.data?.length || 0;
    const dreamMoods = (dreams3h.data || []).map((d: any) => d.mood).filter(Boolean);
    const evolutionCount = evolution3h.data?.length || 0;

    // System flags
    const flags: Record<string, any> = {};
    (systemFlags.data || []).forEach((f: any) => { flags[f.key] = f.enabled; });
    const clmEnabled = flags.clm_enabled !== false; // default true
    const latestBrainMetrics = brainMetrics.data?.[0] || {};
    const systemStatus = apiSuccessRate >= 95 ? "ONLINE" : apiSuccessRate >= 80 ? "DEGRADED" : "CRITICAL";

    const metrics = {
      system: { status: systemStatus, health_pct: apiSuccessRate, api_success_rate: apiSuccessRate, ai_calls_3h: aiCalls3h, ai_calls_24h: aiUsage24h.data?.length || 0, audit_events_3h: audit3h.count || audit3h.data?.length || 0, audit_events_24h: audit24h.count || audit24h.data?.length || 0, evolution_runs_3h: evolutionCount },
      security: { risk_level: riskLevel, avg_risk_score: avgRiskScore, events_3h: defenseEvents3h.length, events_24h: defense24h.count || defense24h.data?.length || 0, blocked, challenged, monitored, top_signals: topSignals },
      modules: moduleCounts,
      learning: { total_events_3h: totalLearningEvents, per_module: learningBullets, clm_distribution: CLM_DISTRIBUTION, clm_cycles_3h: clmCycleCount3h, clm_cycles_24h: clmCycleCount24h, clm_topics: clmTopics, clm_enabled: clmEnabled },
      dreams: { count_3h: dreamCount, moods: dreamMoods },
      brain: latestBrainMetrics,
      quota: { total_budget: totalBudget, total_used: totalUsed, utilization_pct: quotaUtilization, providers: quotaData },
      flags,
    };

    // ═══ BUILD EMAIL HTML — Light/Dark responsive ═══
    const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const subject = `🧠 Substrate Report — ${systemStatus} — ${timestamp}`;

    const statusColor = systemStatus === "ONLINE" ? "#10b981" : systemStatus === "DEGRADED" ? "#f59e0b" : "#ef4444";
    const riskColor = riskLevel === "LOW" ? "#10b981" : riskLevel === "MODERATE" ? "#f59e0b" : "#ef4444";
    const clmStatusText = clmEnabled ? (clmCycleCount3h > 0 ? `ACTIVE — ${clmCycleCount3h} cycles (3h) · ${clmCycleCount24h} cycles (24h)` : "ENABLED but no cycles detected") : "⚠️ DISABLED";
    const clmColor = clmEnabled && clmCycleCount3h > 0 ? "#10b981" : clmEnabled ? "#f59e0b" : "#ef4444";
    const quotaColor = quotaUtilization > 50 ? "#10b981" : quotaUtilization > 10 ? "#f59e0b" : "#ef4444";

    const generationTimeMs = Date.now() - startMs;

    // Module rows
    const moduleRows = Object.entries(moduleCounts)
      .sort((a, b) => b[1].events - a[1].events)
      .slice(0, 10)
      .map(([mod, data]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">${mod.toUpperCase()}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${data.events}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:${data.anomalies > 0 ? '#ef4444' : '#6b7280'};">${data.anomalies}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:${data.learning > 0 ? '#10b981' : '#6b7280'};">${data.learning}</td>
        </tr>`).join("");

    // Learning section
    const learningSection = Object.entries(learningBullets)
      .map(([mod, bullets]) => `
        <div style="margin-bottom:14px;">
          <strong style="color:#4f46e5;font-size:13px;">${mod.toUpperCase()}</strong>
          <ul style="margin:6px 0 0 18px;padding:0;">${bullets.map(b => `<li style="margin-bottom:5px;color:#374151;font-size:13px;line-height:1.5;">${b}</li>`).join("")}</ul>
        </div>`).join("");

    // Quota provider rows
    const quotaRows = quotaData.map((q: any) => {
      const pct = q.calls_budget > 0 ? Math.round((q.calls_used / q.calls_budget) * 100) : 0;
      return `<tr>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;font-weight:500;color:#111827;">${q.provider}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${q.calls_used.toLocaleString()} / ${q.calls_budget.toLocaleString()}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">
          <span style="display:inline-block;background:${pct > 50 ? '#dcfce7' : pct > 10 ? '#fef9c3' : '#fee2e2'};color:${pct > 50 ? '#166534' : pct > 10 ? '#854d0e' : '#991b1b'};padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">${pct}%</span>
        </td>
      </tr>`;
    }).join("");

    // CLM topics studied
    const clmTopicTags = clmTopics.length > 0
      ? clmTopics.map((t: string) => `<span style="display:inline-block;background:#ede9fe;color:#5b21b6;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:500;margin:3px 4px 3px 0;">${t}</span>`).join("")
      : '<span style="color:#9ca3af;font-size:13px;">No topics studied this window</span>';

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  :root { color-scheme: light dark; }
  @media (prefers-color-scheme: dark) {
    .email-body { background-color: #0f172a !important; }
    .email-card { background-color: #1e293b !important; border-color: #334155 !important; }
    .email-header { background: linear-gradient(135deg, #1e1b4b, #312e81) !important; }
    .email-text { color: #e2e8f0 !important; }
    .email-text-secondary { color: #94a3b8 !important; }
    .email-text-heading { color: #f1f5f9 !important; }
    .email-border { border-color: #334155 !important; }
    .email-table-header { background-color: #1e293b !important; }
    .email-table-row td { border-color: #334155 !important; color: #cbd5e1 !important; }
    .email-callout { background-color: #1e293b !important; border-color: #4f46e5 !important; }
    .email-callout-text { color: #c7d2fe !important; }
    .email-footer { background-color: #0f172a !important; border-color: #1e293b !important; }
    .email-footer-text { color: #64748b !important; }
    .email-stat-card { background-color: #1e293b !important; border-color: #334155 !important; }
    .email-badge-green { background-color: #064e3b !important; color: #6ee7b7 !important; }
    .email-badge-yellow { background-color: #713f12 !important; color: #fde68a !important; }
    .email-badge-red { background-color: #7f1d1d !important; color: #fca5a5 !important; }
    .email-topic-tag { background-color: #312e81 !important; color: #c4b5fd !important; }
    .email-link { color: #818cf8 !important; }
    .email-module-name { color: #e2e8f0 !important; }
    .email-learning-module { color: #a5b4fc !important; }
    .email-learning-text { color: #cbd5e1 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;">
<div class="email-body" style="background-color:#f8fafc;padding:0;">

<!-- HEADER -->
<div class="email-header" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 24px;text-align:center;">
  <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">SUBSTRATE REPORT</h1>
  <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">${timestamp}</p>
  <div style="margin-top:16px;">
    <span style="display:inline-block;background:${statusColor};color:#fff;padding:4px 16px;border-radius:20px;font-size:13px;font-weight:700;letter-spacing:1px;">${systemStatus}</span>
  </div>
</div>

<div style="max-width:640px;margin:0 auto;padding:24px 16px;">

<!-- EXECUTIVE DASHBOARD -->
<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
  ${[
    { label: "System Health", value: `${apiSuccessRate}%`, color: statusColor },
    { label: "Security", value: riskLevel, color: riskColor },
    { label: "CLM Cycles (3h)", value: String(clmCycleCount3h), color: clmColor },
    { label: "Quota Used", value: `${quotaUtilization}%`, color: quotaColor },
  ].map(s => `
    <div class="email-stat-card" style="flex:1;min-width:130px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;color:#6b7280;margin-bottom:6px;" class="email-text-secondary">${s.label}</div>
      <div style="font-size:24px;font-weight:800;color:${s.color};">${s.value}</div>
    </div>`).join("")}
</div>

<!-- CLM STATUS (Priority section) -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;display:flex;align-items:center;gap:8px;" class="email-text-heading">
    ⚡ Continuous Learning Engine
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Status</td><td style="padding:6px 0;font-weight:600;color:${clmColor};">${clmStatusText}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Topics Studied (3h)</td><td style="padding:6px 0;color:#111827;" class="email-text">${clmTopicsStudied3h}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Learning Events (3h)</td><td style="padding:6px 0;color:#111827;" class="email-text">${totalLearningEvents}</td></tr>
  </table>
  <div style="margin-top:12px;">${clmTopicTags.replace(/class=""/g, 'class="email-topic-tag"')}</div>
</div>

<!-- API QUOTA BUDGET -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">📊 API Quota Budget</h2>
  <p style="margin:0 0 14px;font-size:12px;color:#6b7280;" class="email-text-secondary">Free intelligence utilization · ${totalUsed.toLocaleString()} / ${totalBudget.toLocaleString()} calls used today</p>
  
  <!-- Utilization bar -->
  <div style="background:#e5e7eb;border-radius:8px;height:10px;margin-bottom:16px;overflow:hidden;">
    <div style="background:${quotaColor};height:100%;width:${Math.min(100, quotaUtilization)}%;border-radius:8px;transition:width 0.3s;"></div>
  </div>

  ${quotaData.length > 0 ? `
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr class="email-table-header" style="background:#f9fafb;">
      <th style="padding:8px 14px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Provider</th>
      <th style="padding:8px 14px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Used / Budget</th>
      <th style="padding:8px 14px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Usage</th>
    </tr>
    ${quotaRows}
  </table>` : '<p style="color:#9ca3af;font-size:13px;">No quota data available.</p>'}
  
  ${quotaUtilization < 10 ? `
  <div class="email-callout" style="margin-top:14px;padding:12px 16px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;">
    <p class="email-callout-text" style="margin:0;color:#991b1b;font-size:13px;font-weight:500;">⚠️ Low utilization — ${totalBudget.toLocaleString()} free API calls available daily. CLM should be consuming these for substrate intelligence.</p>
  </div>` : quotaUtilization > 50 ? `
  <div class="email-callout" style="margin-top:14px;padding:12px 16px;background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 8px 8px 0;">
    <p class="email-callout-text" style="margin:0;color:#065f46;font-size:13px;font-weight:500;">✓ Good utilization — CLM is actively consuming free intelligence.</p>
  </div>` : ''}
</div>

<!-- SECURITY -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🛡️ Security</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Risk Level</td><td style="padding:6px 0;font-weight:600;color:${riskColor};">${riskLevel} (score: ${avgRiskScore})</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Events (3h / 24h)</td><td style="padding:6px 0;color:#111827;" class="email-text">${defenseEvents3h.length} / ${defense24h.count || defense24h.data?.length || 0}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Blocked / Challenged</td><td style="padding:6px 0;color:#111827;" class="email-text">${blocked} / ${challenged}</td></tr>
  </table>
  ${topSignals.length > 0 ? `<p style="margin:10px 0 0;font-size:12px;color:#6b7280;" class="email-text-secondary">Signals: ${topSignals.join(" · ")}</p>` : ''}
</div>

<!-- MODULE ACTIVITY -->
${Object.keys(moduleCounts).length > 0 ? `
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🔧 Module Activity</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr class="email-table-header" style="background:#f9fafb;">
      <th style="padding:8px 14px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Module</th>
      <th style="padding:8px 14px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Events</th>
      <th style="padding:8px 14px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Anomalies</th>
      <th style="padding:8px 14px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">CLM</th>
    </tr>
    ${moduleRows}
  </table>
</div>` : ''}

<!-- WHAT I LEARNED -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">📚 What I Learned</h2>
  ${Object.keys(learningBullets).length > 0 ? learningSection : '<p style="color:#9ca3af;font-size:13px;">No learning events captured this window.</p>'}
</div>

<!-- DREAM SYNTHESIS -->
${dreamCount > 0 ? `
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🌙 Dream Synthesis</h2>
  <p style="color:#374151;font-size:13px;" class="email-text">${dreamCount} dream cycle(s). Moods: ${dreamMoods.join(", ") || "none recorded"}.</p>
</div>` : ''}

<!-- RECOMMENDATIONS -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">💡 Recommendations</h2>
  <div style="font-size:13px;">
    ${systemStatus !== "ONLINE" ? `<p style="color:#dc2626;margin:0 0 8px;"><strong>P0</strong> — System health degraded to ${systemStatus}. API success at ${apiSuccessRate}%.</p>` : ""}
    ${riskLevel === "HIGH" ? `<p style="color:#dc2626;margin:0 0 8px;"><strong>P0</strong> — Security risk HIGH. Avg score: ${avgRiskScore}.</p>` : ""}
    ${!clmEnabled ? `<p style="color:#dc2626;margin:0 0 8px;"><strong>P0</strong> — CLM is DISABLED. Enable via Governor to resume learning.</p>` : ""}
    ${clmEnabled && clmCycleCount3h === 0 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — CLM enabled but no cycles ran. Check cron job.</p>` : ""}
    ${quotaUtilization < 5 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — ${totalBudget.toLocaleString()} free API calls available but only ${quotaUtilization}% used. Increase CLM cycle frequency.</p>` : ""}
    ${blocked > 3 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — ${blocked} blocked events in 3h. Review defense config.</p>` : ""}
    ${systemStatus === "ONLINE" && riskLevel !== "HIGH" && clmEnabled && clmCycleCount3h > 0 && quotaUtilization >= 5
      ? `<p style="color:#10b981;margin:0 0 8px;">✓ All systems nominal. No immediate actions needed.</p>` : ""}
  </div>
</div>

<!-- SYSTEM FLAGS -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🔘 System Flags</h2>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    ${Object.entries(flags).map(([k, v]) => {
      const on = v === true;
      return `<span style="display:inline-block;background:${on ? '#dcfce7' : '#fee2e2'};color:${on ? '#166534' : '#991b1b'};padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;">${on ? '●' : '○'} ${k.replace(/_enabled$/, '')}</span>`;
    }).join("")}
  </div>
</div>

<!-- FOOTER -->
<div class="email-footer" style="border-top:1px solid #e5e7eb;padding:20px 0;margin-top:8px;text-align:center;">
  <p class="email-footer-text" style="margin:0;font-size:11px;color:#9ca3af;">
    Window: ${threeHoursAgo.toISOString().slice(0, 16)} → ${now.toISOString().slice(0, 16)} UTC · Generated in ${generationTimeMs}ms
  </p>
  <p class="email-footer-text" style="margin:4px 0 0;font-size:11px;color:#9ca3af;">
    CMPSBL® Substrate · DECODE · ARCHITECT Epoch
  </p>
  <p style="margin:10px 0 0;">
    <a class="email-link" href="https://cmpsbl.lovable.app/admin/owner-reports" style="color:#4f46e5;font-size:12px;font-weight:500;text-decoration:none;">View full report →</a>
  </p>
</div>

</div>
</div>
</body>
</html>`;

    // ═══ BUILD PLAINTEXT ═══
    const fullPlaintext = `SUBSTRATE REPORT
${timestamp} · ${systemStatus}
${"═".repeat(50)}

EXECUTIVE SUMMARY
System Health: ${apiSuccessRate}%
Security Risk: ${riskLevel}
CLM Status: ${clmStatusText}
Quota Used: ${quotaUtilization}% (${totalUsed}/${totalBudget})
Learning Events (3h): ${totalLearningEvents}
Dream Cycles (3h): ${dreamCount}

CLM ENGINE
Cycles (3h / 24h): ${clmCycleCount3h} / ${clmCycleCount24h}
Topics studied: ${clmTopics.join(", ") || "none"}

API QUOTA
${quotaData.map((q: any) => `  ${q.provider}: ${q.calls_used}/${q.calls_budget}`).join("\n") || "No quota data"}

SECURITY
Risk: ${riskLevel} (score: ${avgRiskScore})
Events: ${defenseEvents3h.length} (3h) / ${defense24h.count || 0} (24h)
Blocked: ${blocked} | Challenged: ${challenged} | Monitored: ${monitored}

MODULE ACTIVITY
${Object.entries(moduleCounts).map(([m, d]) => `  ${m.toUpperCase()}: ${d.events} events, ${d.anomalies} anomalies, ${d.learning} CLM`).join("\n") || "No module events."}

WHAT I LEARNED
${Object.entries(learningBullets).map(([m, bs]) => `  ${m.toUpperCase()}:\n${bs.map(b => `    • ${b}`).join("\n")}`).join("\n\n") || "No learning events."}

FLAGS
${Object.entries(flags).map(([k, v]) => `  ${v ? '●' : '○'} ${k}`).join("\n")}

${"═".repeat(50)}
Window: ${threeHoursAgo.toISOString().slice(0, 16)} → ${now.toISOString().slice(0, 16)} UTC
Generated in ${generationTimeMs}ms · CMPSBL® Substrate
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

    if (insertError) console.error("Failed to store report:", insertError);

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
            from: "Substrate Decode <cascade@promptfluid.com>",
            to: ["kennethsweet214@gmail.com"],
            subject,
            html: fullHtml,
            text: fullPlaintext,
          }),
        });
        const emailResult = await emailRes.json();
        emailSent = emailRes.ok;

        if (report?.id) {
          await supabase.from("owner_reports").update({ status: emailSent ? "sent" : "send_failed" }).eq("id", report.id);
        }
        console.log(`📧 Email ${emailSent ? "sent" : "failed"}:`, emailResult);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        if (report?.id) await supabase.from("owner_reports").update({ status: "send_failed" }).eq("id", report.id);
      }
    } else {
      console.log("⚠️ No RESEND_API_KEY — report stored but not emailed.");
    }

    return new Response(
      JSON.stringify({ success: true, report_id: report?.id, status: systemStatus, email_sent: emailSent, generation_ms: Date.now() - startMs }),
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
