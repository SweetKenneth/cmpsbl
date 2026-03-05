import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      decodeSearchSettled,
      providerFailuresRes,
      // NEW: Substrate audit scan data
      auditScanErrorsRes,
      enhancementEventsRes,
      moduleHealthEventsRes,
      // User accounts
      totalUsersRes,
      newUsersRes,
      // DECODE subjects studied (deduplicated)
      decodeSubjectsRes,
    ] = await Promise.allSettled([
      supabase.from("audit_logs").select("action, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("audit_logs").select("action", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("ai_usage_log").select("provider, success, tokens_used, cost, category, response_time_ms", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("ai_usage_log").select("provider, success, response_time_ms", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("brain_events").select("event_type, module, details, data", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("defense_events").select("event_type, risk_score, source_type, details", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("defense_events").select("event_type", { count: "exact" }).gte("created_at", iso24h),
      supabase.from("brain_metrics").select("*").order("created_at", { ascending: false }).limit(1),
      supabase.from("cascade_dreams").select("mood, mutation_story", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("evolution_runs").select("phase, plan_id", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("access_usage").select("module, action", { count: "exact" }).gte("created_at", iso3h),
      supabase.from("system_flags").select("key, enabled"),
      supabase.from("brain_events").select("id", { count: "exact", head: true }).eq("event_type", "clm_server_cycle").gte("created_at", iso3h),
      supabase.from("brain_events").select("id", { count: "exact", head: true }).eq("event_type", "clm_server_cycle").gte("created_at", iso24h),
      supabase.from("brain_events").select("id, data", { count: "exact" }).eq("event_type", "technical_learning_cycle").gte("created_at", iso3h),
      supabase.from("ai_daily_quota").select("provider, calls_budget, calls_used, tokens_used").eq("date", now.toISOString().split("T")[0]),
      supabase.from("decode_search_results").select("topic, title, source_url, snippet, created_at").gte("created_at", iso3h).order("created_at", { ascending: false }).limit(30),
      supabase.from("ai_usage_log").select("provider, success, response_time_ms").gte("created_at", iso24h).limit(2000),
      // Substrate audit: errors from brain_events (failures, errors, anomalies in 24h)
      supabase.from("brain_events").select("module, event_type, data, outcome, created_at").in("outcome", ["error", "failure"]).gte("created_at", iso24h).order("created_at", { ascending: false }).limit(100),
      // Enhancement grants
      supabase.from("brain_events").select("module, data, created_at").eq("event_type", "enhancement_granted").gte("created_at", iso24h).order("created_at", { ascending: false }).limit(50),
      // Module health: all module events for health scoring
      supabase.from("brain_events").select("module, outcome", { count: "exact" }).gte("created_at", iso24h),
      // Total user accounts
      supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
      // New users in last 3 hours (profiles table as proxy)
      supabase.from("profiles").select("id, created_at", { count: "exact" }).gte("created_at", iso3h),
      // DECODE: all subjects/topics being studied (for dedup display)
      supabase.from("brain_events").select("data, module").in("event_type", ["technical_learning_cycle", "clm_server_cycle", "module_learning_insight", "learning"]).gte("created_at", iso3h).limit(200),
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
    const decodeSearchData = extract(decodeSearchSettled);
    const providerFailures = extract(providerFailuresRes);
    const auditScanErrors = extract(auditScanErrorsRes);
    const enhancementEvents = extract(enhancementEventsRes);
    const moduleHealthEvents = extract(moduleHealthEventsRes);

    // User accounts
    const totalUsersResult = totalUsersRes.status === "fulfilled" ? totalUsersRes.value : null;
    const totalUsersTotal = (totalUsersResult?.data as any)?.total || totalUsersResult?.data?.users?.length || 0;
    const newUsers3h = extract(newUsersRes);
    const newUserCount3h = newUsers3h.count || newUsers3h.data?.length || 0;

    // DECODE subjects studied — deduplicated
    const decodeSubjectsRaw = extract(decodeSubjectsRes);
    const allStudiedSubjects = new Set<string>();
    for (const evt of (decodeSubjectsRaw.data || [])) {
      const d = evt.data as any;
      if (d?.domain) allStudiedSubjects.add(d.domain);
      if (d?.topic) allStudiedSubjects.add(d.topic);
      if (d?.subject) allStudiedSubjects.add(d.subject);
      if (d?.title && typeof d.title === 'string' && d.title.length < 80) allStudiedSubjects.add(d.title);
    }
    const dedupedSubjects = Array.from(allStudiedSubjects).sort();

    // ═══ SUBSTRATE AUDIT SCAN ═══
    // Analyze errors, failures, and anomalies across all modules
    interface AuditIssue {
      severity: 'critical' | 'error' | 'warning' | 'info';
      module: string;
      message: string;
      count: number;
      lastSeen: string;
    }

    const auditIssueMap: Record<string, AuditIssue> = {};
    for (const evt of (auditScanErrors.data || [])) {
      const key = `${evt.module}:${evt.event_type}`;
      if (!auditIssueMap[key]) {
        const isCritical = evt.outcome === 'failure' || (evt.data as any)?.severity === 'critical';
        auditIssueMap[key] = {
          severity: isCritical ? 'critical' : 'error',
          module: (evt.module || 'unknown').toUpperCase(),
          message: (evt.data as any)?.error || (evt.data as any)?.message || evt.event_type || 'Unknown error',
          count: 0,
          lastSeen: evt.created_at,
        };
      }
      auditIssueMap[key].count++;
    }

    // Sort by severity then count
    const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
    const auditIssues: AuditIssue[] = Object.values(auditIssueMap)
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.count - a.count);

    // ═══ MODULE ENHANCEMENT REQUESTS (Dynamic Ranking) ═══
    // Build per-module health scores and enhancement catalog
    const moduleHealthMap: Record<string, { total: number; errors: number }> = {};
    for (const evt of (moduleHealthEvents.data || [])) {
      const m = evt.module || 'unknown';
      if (!moduleHealthMap[m]) moduleHealthMap[m] = { total: 0, errors: 0 };
      moduleHealthMap[m].total++;
      if (evt.outcome === 'error' || evt.outcome === 'failure') moduleHealthMap[m].errors++;
    }

    // Enhancement catalog — each module's top request with dynamic priority
    const ENHANCEMENT_CATALOG: Record<string, { title: string; category: string }> = {
      core: { title: 'add circuit recovery telemetry', category: 'resilience' },
      brain: { title: 'add memory dedup scoring', category: 'performance' },
      decode: { title: 'add source credibility scoring', category: 'capability' },
      defense: { title: 'add behavioral fingerprinting', category: 'security' },
      nexus: { title: 'add provider auto-rotation', category: 'resilience' },
      vision: { title: 'add trend velocity detection', category: 'capability' },
      encode: { title: 'add patch verification hooks', category: 'resilience' },
      dream: { title: 'add dream chain correlation', category: 'capability' },
      memory: { title: 'add cross-tier search indexing', category: 'performance' },
      immunity: { title: 'add cascade failure prediction', category: 'resilience' },
      evolution: { title: 'add rollback safety scoring', category: 'resilience' },
      governance: { title: 'add policy conflict detection', category: 'security' },
      integration: { title: 'add webhook retry backoff', category: 'resilience' },
      access: { title: 'add key rotation reminders', category: 'security' },
      audit: { title: 'add real-time chain verification', category: 'security' },
      cortex: { title: 'add reasoning trace logging', category: 'capability' },
      economy: { title: 'add cost anomaly alerts', category: 'capability' },
      sandbox: { title: 'add execution isolation metrics', category: 'security' },
      inclusive: { title: 'add accessibility scan scheduling', category: 'capability' },
      system: { title: 'add system flag audit trail', category: 'security' },
      relay: { title: 'add message delivery guarantees', category: 'resilience' },
      identity: { title: 'add session anomaly detection', category: 'security' },
      ripple: { title: 'add event replay filtering', category: 'capability' },
      intent: { title: 'add intent confidence scoring', category: 'capability' },
      atlas: { title: 'add governance proposal auto-scoring', category: 'capability' },
      shadow: { title: 'add probe drift detection', category: 'resilience' },
      oracle: { title: 'add predictive signal weighting', category: 'capability' },
      compass: { title: 'add directional trend mapping', category: 'capability' },
      echo: { title: 'add feedback loop amplification', category: 'performance' },
      harvest: { title: 'add data ingestion quality scoring', category: 'performance' },
      lingua: { title: 'add translation confidence tracking', category: 'capability' },
      forge: { title: 'add artifact integrity verification', category: 'security' },
      nerve: { title: 'add real-time signal prioritization', category: 'resilience' },
      reflex: { title: 'add automatic response calibration', category: 'resilience' },
      engineer: { title: 'add maintenance fleet scheduling', category: 'resilience' },
      mesh: { title: 'add cross-node consensus optimization', category: 'performance' },
      sovereign: { title: 'add sovereignty boundary enforcement', category: 'security' },
      conscience: { title: 'add ethical decision audit trail', category: 'security' },
      treaty: { title: 'add inter-system agreement validation', category: 'security' },
    };

    // Track which enhancements were already granted
    const grantedSet = new Set<string>();
    for (const evt of (enhancementEvents.data || [])) {
      const d = evt.data as any;
      if (d?.enhancementId) grantedSet.add(d.enhancementId);
    }

    interface ModuleEnhRequest {
      module: string;
      title: string;
      category: string;
      importanceScore: number;
      healthPct: number;
      errors24h: number;
      granted: boolean;
    }

    const enhRequests: ModuleEnhRequest[] = Object.entries(ENHANCEMENT_CATALOG).map(([mod, info]) => {
      const health = moduleHealthMap[mod] || { total: 0, errors: 0 };
      const healthPct = health.total > 0 ? Math.round((1 - health.errors / health.total) * 100) : 100;
      const errorBoost = Math.min(50, health.errors * 5);
      const healthPenalty = Math.max(0, 50 - healthPct) * 1.5;
      const categoryWeight = info.category === 'security' ? 15 : info.category === 'resilience' ? 10 : 5;
      const importanceScore = Math.min(100, Math.round(40 + errorBoost + healthPenalty + categoryWeight));
      const granted = grantedSet.has(`${mod}-enh-0`);

      return { module: mod.toUpperCase(), title: info.title, category: info.category, importanceScore, healthPct, errors24h: health.errors, granted };
    }).sort((a, b) => b.importanceScore - a.importanceScore);

    // DECODE search results grouped by topic
    const decodeResults = (decodeSearchData?.data || []) as Array<{ topic: string; title: string; source_url: string; snippet: string; created_at: string }>;
    const decodeByTopic: Record<string, Array<{ title: string; url: string; snippet: string }>> = {};
    decodeResults.forEach((r: any) => {
      if (!decodeByTopic[r.topic]) decodeByTopic[r.topic] = [];
      if (decodeByTopic[r.topic].length < 3) {
        decodeByTopic[r.topic].push({ title: r.title, url: r.source_url, snippet: r.snippet });
      }
    });

    // ═══ COMPUTE METRICS ═══
    // FIX: Use count from query, not data.length (which may be truncated)
    const aiCalls3h = aiUsage3h.count || aiUsage3h.data?.length || 0;
    const aiSuccess3h = aiUsage3h.data?.filter((r: any) => r.success).length || 0;
    const apiSuccessRate = aiCalls3h > 0 ? Math.round((aiSuccess3h / aiCalls3h) * 100) : 100;

    const aiCalls24h = aiUsage24h.count || aiUsage24h.data?.length || 0;

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
      if (["learning", "clm", "technical_learning_cycle", "module_learning_insight"].includes(e.event_type)) moduleCounts[m].learning++;
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

    // API quota budget — derive "used" from actual ai_usage_log (ai_daily_quota.calls_used is unreliable due to fire-and-forget)
    const quotaData = dailyQuota.data || [];
    const totalBudget = quotaData.reduce((s: number, q: any) => s + (q.calls_budget || 0), 0);
    // Use actual call count from ai_usage_log (24h) as ground truth instead of broken calls_used counter
    const totalUsed = aiCalls24h;
    const quotaUtilization = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

    // ═══ PROVIDER HEALTH ANALYSIS ═══
    const providerPerf: Record<string, { total: number; failures: number; latencies: number[] }> = {};
    for (const log of providerFailures.data || []) {
      if (!providerPerf[log.provider]) providerPerf[log.provider] = { total: 0, failures: 0, latencies: [] };
      providerPerf[log.provider].total++;
      if (!log.success) providerPerf[log.provider].failures++;
      if (log.response_time_ms) providerPerf[log.provider].latencies.push(log.response_time_ms);
    }

    interface ProviderReport {
      name: string;
      total: number;
      failures: number;
      failureRate: number;
      avgLatency: number;
      status: string;
      note: string;
    }

    const providerReports: ProviderReport[] = Object.entries(providerPerf)
      .map(([name, stats]) => {
        const failureRate = stats.total > 0 ? stats.failures / stats.total : 0;
        const avgLatency = stats.latencies.length > 0
          ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length) : 0;
        
        let status = '✅ Healthy';
        let note = '';
        if (stats.total === 0) {
          status = '🆕 New';
          note = 'No usage data — monitoring';
        } else if (failureRate > 0.3) {
          status = '🔴 Unreliable';
          note = `${Math.round(failureRate * 100)}% failure rate — consider removal`;
        } else if (failureRate > 0.1) {
          status = '🟡 Degraded';
          note = `Elevated failures (${Math.round(failureRate * 100)}%)`;
        } else if (avgLatency > 5000) {
          status = '🟡 Slow';
          note = `High latency (${avgLatency}ms avg)`;
        } else if (stats.total > 50 && failureRate < 0.02) {
          note = `Excellent — ${(100 - failureRate * 100).toFixed(1)}% success`;
        }

        return { name, total: stats.total, failures: stats.failures, failureRate, avgLatency, status, note };
      })
      .sort((a, b) => b.total - a.total);

    // Dynamic allocation calculation
    const hoursRemaining = Math.max(1, 24 - now.getHours());
    const hoursElapsed = Math.max(1, now.getHours() || 1);
    const opsCallsPerHour = Math.ceil(totalUsed / hoursElapsed * 0.3);
    const estimatedSubstrateNeeds = opsCallsPerHour * hoursRemaining;
    const safetyBuffer = Math.ceil((totalBudget - totalUsed) * 0.1);
    const availableForLearning = Math.max(0, (totalBudget - totalUsed) - estimatedSubstrateNeeds - safetyBuffer);
    const entityCount = 10; // Learning entities
    const perEntityAllocation = Math.floor(availableForLearning / entityCount);

    const dreamCount = dreams3h.data?.length || 0;
    const dreamMoods = (dreams3h.data || []).map((d: any) => d.mood).filter(Boolean);
    const evolutionCount = evolution3h.data?.length || 0;

    // System flags
    const flags: Record<string, any> = {};
    (systemFlags.data || []).forEach((f: any) => { flags[f.key] = f.enabled; });
    const clmEnabled = flags.clm_enabled !== false;
    const latestBrainMetrics = brainMetrics.data?.[0] || {};
    const systemStatus = apiSuccessRate >= 95 ? "ONLINE" : apiSuccessRate >= 80 ? "DEGRADED" : "CRITICAL";

    const metrics = {
      system: { status: systemStatus, health_pct: apiSuccessRate, api_success_rate: apiSuccessRate, ai_calls_3h: aiCalls3h, ai_calls_24h: aiCalls24h, audit_events_3h: audit3h.count || audit3h.data?.length || 0, audit_events_24h: audit24h.count || audit24h.data?.length || 0, evolution_runs_3h: evolutionCount },
      security: { risk_level: riskLevel, avg_risk_score: avgRiskScore, events_3h: defenseEvents3h.length, events_24h: defense24h.count || defense24h.data?.length || 0, blocked, challenged, monitored, top_signals: topSignals },
      modules: moduleCounts,
      learning: { total_events_3h: totalLearningEvents, per_module: learningBullets, clm_distribution: CLM_DISTRIBUTION, clm_cycles_3h: clmCycleCount3h, clm_cycles_24h: clmCycleCount24h, clm_topics: clmTopics, clm_enabled: clmEnabled },
      dreams: { count_3h: dreamCount, moods: dreamMoods },
      brain: latestBrainMetrics,
      quota: { total_budget: totalBudget, total_used: totalUsed, utilization_pct: quotaUtilization, providers: quotaData },
      allocation: { estimated_substrate_needs: estimatedSubstrateNeeds, available_for_learning: availableForLearning, per_entity: perEntityAllocation, entity_count: entityCount },
      provider_health: providerReports,
      flags,
    };

    // ═══ BUILD EMAIL HTML ═══
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
        <tr class="email-table-row">
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;" class="email-module-name">${mod.toUpperCase()}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${data.events}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:${data.anomalies > 0 ? '#ef4444' : '#6b7280'};">${data.anomalies}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:${data.learning > 0 ? '#10b981' : '#6b7280'};">${data.learning}</td>
        </tr>`).join("");

    // Learning section
    const learningSection = Object.entries(learningBullets)
      .map(([mod, bullets]) => `
        <div style="margin-bottom:14px;">
          <strong style="color:#4f46e5;font-size:13px;" class="email-learning-module">${mod.toUpperCase()}</strong>
          <ul style="margin:6px 0 0 18px;padding:0;">${bullets.map(b => `<li style="margin-bottom:5px;color:#374151;font-size:13px;line-height:1.5;" class="email-learning-text">${b}</li>`).join("")}</ul>
        </div>`).join("");

    // Quota provider rows — merge ai_usage_log actuals with budget from ai_daily_quota
    const providerActualCounts: Record<string, number> = {};
    for (const log of providerFailures.data || []) {
      providerActualCounts[log.provider] = (providerActualCounts[log.provider] || 0) + 1;
    }
    const quotaRows = quotaData.map((q: any) => {
      const actualUsed = providerActualCounts[q.provider] || 0;
      const pct = q.calls_budget > 0 ? Math.round((actualUsed / q.calls_budget) * 100) : 0;
      return `<tr class="email-table-row">
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;font-weight:500;color:#111827;">${q.provider}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${actualUsed.toLocaleString()} / ${(q.calls_budget || 0).toLocaleString()}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">
          <span style="display:inline-block;background:${pct > 50 ? '#dcfce7' : pct > 10 ? '#fef9c3' : '#fee2e2'};color:${pct > 50 ? '#166534' : pct > 10 ? '#854d0e' : '#991b1b'};padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">${pct}%</span>
        </td>
      </tr>`;
    }).join("");

    // Provider health rows
    const providerHealthRows = providerReports.map(p => `
      <tr class="email-table-row">
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;font-weight:500;color:#111827;">${p.name}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${p.total}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:${p.failures > 0 ? '#ef4444' : '#6b7280'};">${p.failures}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${p.avgLatency}ms</td>
        <td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;">${p.status}${p.note ? ` — ${p.note}` : ''}</td>
      </tr>`).join("");

    // CLM topics studied
    const clmTopicTags = clmTopics.length > 0
      ? clmTopics.map((t: string) => `<span class="email-topic-tag" style="display:inline-block;background:#ede9fe;color:#5b21b6;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:500;margin:3px 4px 3px 0;">${t}</span>`).join("")
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
    { label: "API Calls (3h)", value: String(aiCalls3h), color: aiCalls3h > 0 ? "#10b981" : "#ef4444" },
    { label: "Security", value: riskLevel, color: riskColor },
    { label: "CLM Cycles (3h)", value: String(clmCycleCount3h), color: clmColor },
    { label: "Quota Used", value: `${quotaUtilization}%`, color: quotaColor },
  ].map(s => `
    <div class="email-stat-card" style="flex:1;min-width:130px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;color:#6b7280;margin-bottom:6px;" class="email-text-secondary">${s.label}</div>
      <div style="font-size:24px;font-weight:800;color:${s.color};">${s.value}</div>
    </div>`).join("")}
</div>

<!-- 🔴 SUBSTRATE AUDIT SCAN — ALWAYS FIRST -->
${auditIssues.length > 0 ? `
<div class="email-card" style="background:#fff;border:2px solid #ef4444;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#dc2626;" class="email-text-heading">🚨 Substrate Audit Scan — ${auditIssues.length} Issue${auditIssues.length > 1 ? 's' : ''} Found</h2>
  <p style="margin:0 0 12px;font-size:12px;color:#6b7280;" class="email-text-secondary">Automated scan of database + codebase errors, anomalies, and optimization targets (24h)</p>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <tr class="email-table-header" style="background:#fef2f2;">
      <th style="padding:8px 10px;text-align:left;color:#991b1b;font-weight:600;font-size:11px;text-transform:uppercase;">Severity</th>
      <th style="padding:8px 10px;text-align:left;color:#991b1b;font-weight:600;font-size:11px;text-transform:uppercase;">Module</th>
      <th style="padding:8px 10px;text-align:left;color:#991b1b;font-weight:600;font-size:11px;text-transform:uppercase;">Issue</th>
      <th style="padding:8px 10px;text-align:center;color:#991b1b;font-weight:600;font-size:11px;text-transform:uppercase;">Count</th>
    </tr>
    ${auditIssues.slice(0, 15).map(issue => {
      const sevColor = issue.severity === 'critical' ? '#dc2626' : issue.severity === 'error' ? '#ea580c' : '#ca8a04';
      const sevBg = issue.severity === 'critical' ? '#fef2f2' : issue.severity === 'error' ? '#fff7ed' : '#fefce8';
      return `<tr class="email-table-row">
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-block;background:${sevBg};color:${sevColor};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;text-transform:uppercase;">${issue.severity}</span>
        </td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">${issue.module}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#374151;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${String(issue.message).slice(0, 80)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${sevColor};">${issue.count}</td>
      </tr>`;
    }).join('')}
  </table>
</div>` : `
<div class="email-card" style="background:#fff;border:2px solid #10b981;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 8px;font-size:15px;font-weight:700;color:#059669;" class="email-text-heading">✅ Substrate Audit Scan — Clean</h2>
  <p style="margin:0;font-size:13px;color:#6b7280;" class="email-text-secondary">No errors, failures, or anomalies detected in the last 24 hours.</p>
</div>`}

<!-- 📋 COMPONENT ENHANCEMENT REQUESTS (Ranked by Importance) -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">📋 Component Enhancement Requests</h2>
  <p style="margin:0 0 14px;font-size:12px;color:#6b7280;" class="email-text-secondary">What each module is requesting to improve · Ranked by importance</p>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <tr class="email-table-header" style="background:#f9fafb;">
      <th style="padding:8px 10px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Score</th>
      <th style="padding:8px 10px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Module</th>
      <th style="padding:8px 10px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Top Request</th>
      <th style="padding:8px 10px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Type</th>
      <th style="padding:8px 10px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Status</th>
    </tr>
    ${enhRequests.map(r => {
      const scoreColor = r.importanceScore > 75 ? '#dc2626' : r.importanceScore > 50 ? '#ea580c' : r.importanceScore > 30 ? '#ca8a04' : '#6b7280';
      const statusBadge = r.granted
        ? '<span style="display:inline-block;background:#dcfce7;color:#166534;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">✓ Granted</span>'
        : '<span style="display:inline-block;background:#fef9c3;color:#854d0e;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">Pending</span>';
      const catColor = r.category === 'security' ? '#7c3aed' : r.category === 'resilience' ? '#2563eb' : r.category === 'performance' ? '#059669' : '#6b7280';
      return `<tr class="email-table-row">
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:800;color:${scoreColor};font-size:13px;">${r.importanceScore}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">${r.module}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#374151;font-style:italic;">${r.title}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;"><span style="color:${catColor};font-size:11px;font-weight:600;text-transform:uppercase;">${r.category}</span></td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${statusBadge}</td>
      </tr>`;
    }).join('')}
  </table>
</div>

<!-- DYNAMIC ALLOCATION (NEW) -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">⚡ NEXUS Dynamic Allocation</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Daily Capacity</td><td style="padding:6px 0;color:#111827;" class="email-text">${totalBudget.toLocaleString()} calls</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Used Today</td><td style="padding:6px 0;color:#111827;" class="email-text">${totalUsed.toLocaleString()} calls (${quotaUtilization}%)</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Est. Substrate Needs (remaining)</td><td style="padding:6px 0;color:#111827;" class="email-text">${estimatedSubstrateNeeds.toLocaleString()} calls</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Available for Learning</td><td style="padding:6px 0;font-weight:600;color:${availableForLearning > 0 ? '#10b981' : '#ef4444'};">${availableForLearning.toLocaleString()} calls</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Per-Entity Allocation</td><td style="padding:6px 0;font-weight:600;color:#4f46e5;">${perEntityAllocation.toLocaleString()} calls × ${entityCount} entities</td></tr>
  </table>
</div>

<!-- CLM STATUS -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;display:flex;align-items:center;gap:8px;" class="email-text-heading">
    🧠 Continuous Learning Engine
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Status</td><td style="padding:6px 0;font-weight:600;color:${clmColor};">${clmStatusText}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Topics Studied (3h)</td><td style="padding:6px 0;color:#111827;" class="email-text">${clmTopicsStudied3h}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">Learning Events (3h)</td><td style="padding:6px 0;color:#111827;" class="email-text">${totalLearningEvents}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;" class="email-text-secondary">API Calls (3h / 24h)</td><td style="padding:6px 0;color:#111827;" class="email-text">${aiCalls3h} / ${aiCalls24h}</td></tr>
  </table>
  <div style="margin-top:12px;">${clmTopicTags}</div>
</div>

<!-- PROVIDER HEALTH (NEW) -->
${providerReports.length > 0 ? `
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🔌 LLM Provider Health (24h)</h2>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <tr class="email-table-header" style="background:#f9fafb;">
      <th style="padding:8px 10px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Provider</th>
      <th style="padding:8px 10px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Calls</th>
      <th style="padding:8px 10px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Fails</th>
      <th style="padding:8px 10px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Latency</th>
      <th style="padding:8px 10px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Status</th>
    </tr>
    ${providerHealthRows}
  </table>
</div>` : ''}

<!-- API QUOTA BUDGET -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">📊 API Quota Budget</h2>
  <p style="margin:0 0 14px;font-size:12px;color:#6b7280;" class="email-text-secondary">Free intelligence utilization · ${totalUsed.toLocaleString()} / ${totalBudget.toLocaleString()} calls used today</p>
  
  <div style="background:#e5e7eb;border-radius:8px;height:10px;margin-bottom:16px;overflow:hidden;">
    <div style="background:${quotaColor};height:100%;width:${Math.min(100, quotaUtilization)}%;border-radius:8px;"></div>
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
      <th style="padding:8px 14px;text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;">Module</th>
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

<!-- DECODE BRAND MONITOR -->
${Object.keys(decodeByTopic).length > 0 ? `
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🔍 DECODE Brand Monitor</h2>
  <p style="margin:0 0 14px;font-size:12px;color:#6b7280;" class="email-text-secondary">Exact-match mentions discovered this window</p>
  ${Object.entries(decodeByTopic).map(([topic, items]) => `
    <div style="margin-bottom:16px;">
      <strong style="color:#4f46e5;font-size:13px;display:block;margin-bottom:8px;" class="email-learning-module">"${topic}"</strong>
      ${items.map(item => `
        <div style="margin-bottom:10px;padding:8px 12px;background:#f9fafb;border-radius:8px;border-left:3px solid #4f46e5;" class="email-stat-card">
          <a href="${item.url}" style="color:#4f46e5;font-size:13px;font-weight:600;text-decoration:none;display:block;margin-bottom:3px;" class="email-link">${item.title || 'Untitled'}</a>
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.4;" class="email-text-secondary">${item.snippet?.slice(0, 150) || 'No preview available'}${item.snippet?.length > 150 ? '...' : ''}</p>
          <p style="margin:4px 0 0;font-size:11px;"><a href="${item.url}" style="color:#6366f1;text-decoration:none;" class="email-link">View source →</a></p>
        </div>`).join('')}
    </div>`).join('')}
</div>` : `
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">🔍 DECODE Brand Monitor</h2>
  <p style="color:#9ca3af;font-size:13px;">No exact-match mentions found this window. Monitoring: "Kenneth E. Sweet Jr.", "CMPSBL", "XCTBL", "PromptFluid", "LNCHBL", "EVLVBL"</p>
</div>`}

<!-- RECOMMENDATIONS -->
<div class="email-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
  <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;" class="email-text-heading">💡 Recommendations</h2>
  <div style="font-size:13px;">
    ${systemStatus !== "ONLINE" ? `<p style="color:#dc2626;margin:0 0 8px;"><strong>P0</strong> — System health degraded to ${systemStatus}. API success at ${apiSuccessRate}%.</p>` : ""}
    ${riskLevel === "HIGH" ? `<p style="color:#dc2626;margin:0 0 8px;"><strong>P0</strong> — Security risk HIGH. Avg score: ${avgRiskScore}.</p>` : ""}
    ${!clmEnabled ? `<p style="color:#dc2626;margin:0 0 8px;"><strong>P0</strong> — CLM is DISABLED. Enable via Governor to resume learning.</p>` : ""}
    ${clmEnabled && clmCycleCount3h === 0 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — CLM enabled but no cycles ran. Check cron job.</p>` : ""}
    ${providerReports.filter(p => p.status.includes('Unreliable')).length > 0 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — Unreliable providers detected: ${providerReports.filter(p => p.status.includes('Unreliable')).map(p => p.name).join(', ')}. Consider removal.</p>` : ""}
    ${quotaUtilization < 5 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — ${totalBudget.toLocaleString()} free API calls available but only ${quotaUtilization}% used.</p>` : ""}
    ${blocked > 3 ? `<p style="color:#f59e0b;margin:0 0 8px;"><strong>P1</strong> — ${blocked} blocked events in 3h. Review defense config.</p>` : ""}
    ${systemStatus === "ONLINE" && riskLevel !== "HIGH" && clmEnabled && providerReports.filter(p => p.status.includes('Unreliable')).length === 0
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
    CMPSBL® Substrate · DECODE · SPARTA Epoch
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
API Calls (3h / 24h): ${aiCalls3h} / ${aiCalls24h}
Security Risk: ${riskLevel}
CLM Status: ${clmStatusText}
Quota Used: ${quotaUtilization}% (${totalUsed}/${totalBudget})
Learning Events (3h): ${totalLearningEvents}
Dream Cycles (3h): ${dreamCount}

NEXUS DYNAMIC ALLOCATION
Daily Capacity: ${totalBudget.toLocaleString()} calls
Used Today: ${totalUsed.toLocaleString()} (${quotaUtilization}%)
Est. Substrate Needs: ${estimatedSubstrateNeeds.toLocaleString()}
Available for Learning: ${availableForLearning.toLocaleString()}
Per-Entity Allocation: ${perEntityAllocation.toLocaleString()} × ${entityCount} entities

CLM ENGINE
Cycles (3h / 24h): ${clmCycleCount3h} / ${clmCycleCount24h}
Topics studied: ${clmTopics.join(", ") || "none"}

PROVIDER HEALTH (24h)
${providerReports.map(p => `  ${p.name}: ${p.total} calls, ${p.failures} fails, ${p.avgLatency}ms avg — ${p.status}${p.note ? ` (${p.note})` : ''}`).join("\n") || "No provider data"}

API QUOTA
${quotaData.map((q: any) => `  ${q.provider}: ${providerActualCounts[q.provider] || 0}/${q.calls_budget || 0}`).join("\n") || "No quota data"}

SECURITY
Risk: ${riskLevel} (score: ${avgRiskScore})
Events: ${defenseEvents3h.length} (3h) / ${defense24h.count || 0} (24h)
Blocked: ${blocked} | Challenged: ${challenged} | Monitored: ${monitored}

MODULE ACTIVITY
${Object.entries(moduleCounts).map(([m, d]) => `  ${m.toUpperCase()}: ${d.events} events, ${d.anomalies} anomalies, ${d.learning} CLM`).join("\n") || "No module events."}

WHAT I LEARNED
${Object.entries(learningBullets).map(([m, bs]) => `  ${m.toUpperCase()}:\n${bs.map(b => `    • ${b}`).join("\n")}`).join("\n\n") || "No learning events."}

DECODE BRAND MONITOR (exact-match)
${Object.entries(decodeByTopic).length > 0
  ? Object.entries(decodeByTopic).map(([topic, items]) => `  "${topic}":\n${items.map(i => `    • ${i.title}\n      ${i.url}`).join("\n")}`).join("\n\n")
  : "No exact-match mentions this window."}

FLAGS
${Object.entries(flags).map(([k, v]) => `  ${v ? '●' : '○'} ${k}`).join("\n")}

${"═".repeat(50)}
Window: ${threeHoursAgo.toISOString().slice(0, 16)} → ${now.toISOString().slice(0, 16)} UTC
Generated in ${generationTimeMs}ms · CMPSBL® Substrate · SPARTA Epoch
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
        version: "sparta",
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
