/**
 * pf-distillation-engine — Knowledge Distillation for the BRAIN
 * 
 * Three distillation techniques at 1,500 calls/day budget:
 *   1. Memory Crystallization — Cluster related memories, distill via teacher model
 *   2. Teacher-Student Routing — Pro model generates reasoning traces → patterns for fast model
 *   3. Cross-Module Transfer — Distill domain learnings into generalized heuristics
 * 
 * Budget allocation (1,500 calls/day):
 *   - Crystallization: 600 calls/day (40%)
 *   - Teacher-Student: 500 calls/day (33%)
 *   - Cross-Module: 400 calls/day (27%)
 * 
 * @version 1.0.0
 * @module pf-distillation-engine
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERSION = "1.0.0";
const TEACHER_MODEL = "google/gemini-2.5-pro";
const STUDENT_MODEL = "google/gemini-2.5-flash-lite";

// Budget caps per day
const BUDGET = {
  crystallization: 600,
  teacher_student: 500,
  cross_module: 400,
  total: 1500,
} as const;

// Batch sizes per invocation
const BATCH = {
  crystallization: 5,    // 5 clusters per run
  teacher_student: 5,    // 5 traces per run
  cross_module: 3,       // 3 transfers per run
} as const;

const CLUSTER_MIN_SIZE = 3;
const CLUSTER_MAX_SIZE = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[distillation-engine] v${VERSION} starting`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!supabaseUrl || !supabaseKey || !lovableKey) {
      return new Response(
        JSON.stringify({ error: "Service unavailable — missing config" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse action
    let action = "all"; // crystallize | teacher_student | cross_module | all | status
    try {
      if (req.method === "POST") {
        const body = await req.json();
        action = body.action || "all";
      }
    } catch { /* default to all */ }

    // ─── Budget Check ──────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const { data: todayRuns } = await supabase
      .from("brain_distillation_runs")
      .select("run_type, calls_used")
      .gte("created_at", `${today}T00:00:00Z`);

    const usedToday: Record<string, number> = { crystallization: 0, teacher_student: 0, cross_module: 0 };
    for (const run of (todayRuns || [])) {
      if (run.run_type in usedToday) {
        usedToday[run.run_type] += run.calls_used || 0;
      }
    }
    const totalUsed = Object.values(usedToday).reduce((a, b) => a + b, 0);

    if (action === "status") {
      return new Response(
        JSON.stringify({
          version: VERSION,
          budget: BUDGET,
          used_today: usedToday,
          total_used: totalUsed,
          remaining: BUDGET.total - totalUsed,
          pct_used: Math.round((totalUsed / BUDGET.total) * 100),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, any> = {};

    // ─── 1. Memory Crystallization ─────────────────────────────────
    if ((action === "all" || action === "crystallize") && usedToday.crystallization < BUDGET.crystallization) {
      results.crystallization = await runCrystallization(supabase, lovableKey, BATCH.crystallization);
    }

    // ─── 2. Teacher-Student Routing ────────────────────────────────
    if ((action === "all" || action === "teacher_student") && usedToday.teacher_student < BUDGET.teacher_student) {
      results.teacher_student = await runTeacherStudent(supabase, lovableKey, BATCH.teacher_student);
    }

    // ─── 3. Cross-Module Transfer ──────────────────────────────────
    if ((action === "all" || action === "cross_module") && usedToday.cross_module < BUDGET.cross_module) {
      results.cross_module = await runCrossModuleTransfer(supabase, lovableKey, BATCH.cross_module);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[distillation-engine] Complete in ${elapsed}ms`, results);

    // Log to brain_events
    await supabase.from("brain_events").insert({
      event_type: "distillation_complete",
      module: "BRAIN",
      summary: `Distillation v${VERSION}: ${JSON.stringify(results)}`,
      metadata: { version: VERSION, action, results, elapsed_ms: elapsed },
    }).then(() => {}).catch(() => {});

    return new Response(
      JSON.stringify({ status: "complete", version: VERSION, action, results, elapsed_ms: elapsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[distillation-engine] Fatal:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ════════════════════════════════════════════════════════════════════
// 1. MEMORY CRYSTALLIZATION
// ════════════════════════════════════════════════════════════════════

async function runCrystallization(supabase: any, apiKey: string, batchSize: number) {
  const runStart = Date.now();
  let callsUsed = 0;
  let crystalsCreated = 0;
  let memoriesProcessed = 0;

  // Create run record
  const { data: run } = await supabase
    .from("brain_distillation_runs")
    .insert({ run_type: "crystallization", status: "running" })
    .select("id")
    .single();

  try {
    // Fetch recent hot memories grouped by category/module
    const { data: memories } = await supabase
      .from("brain_memory_hot")
      .select("id, content, category, source_module, priority, created_at, tags")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!memories || memories.length < CLUSTER_MIN_SIZE) {
      await completeRun(supabase, run.id, "skipped", callsUsed, crystalsCreated, 0, memoriesProcessed, runStart);
      return { status: "skipped", reason: "insufficient_memories" };
    }

    // Cluster by category + module
    const clusters: Record<string, any[]> = {};
    for (const mem of memories) {
      const key = `${mem.source_module || "general"}::${mem.category || "uncategorized"}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(mem);
    }

    // Process top clusters
    const clusterEntries = Object.entries(clusters)
      .filter(([, mems]) => mems.length >= CLUSTER_MIN_SIZE)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, batchSize);

    for (const [clusterKey, clusterMems] of clusterEntries) {
      const subset = clusterMems.slice(0, CLUSTER_MAX_SIZE);
      const [module, category] = clusterKey.split("::");

      const contentBlock = subset.map((m: any, i: number) =>
        `[${i + 1}] ${m.content}`
      ).join("\n\n");

      const prompt = `You are a knowledge distillation engine. Below are ${subset.length} related memories from the "${module}" module, category "${category}".

TASK: Distill these into a single, dense "knowledge crystal" — a compressed summary that preserves:
1. Core facts and patterns
2. Causal relationships
3. Key decision rules
4. Actionable heuristics

The crystal should be 2-4 paragraphs MAX. Prioritize signal density over completeness.

MEMORIES:
${contentBlock}

OUTPUT FORMAT:
Title: <crystal title>
Crystal: <distilled knowledge>
Confidence: <0.0-1.0>
Key Tags: <comma-separated>`;

      try {
        const response = await callTeacher(apiKey, prompt);
        callsUsed++;

        if (response) {
          const parsed = parseCrystalResponse(response);
          const sourceIds = subset.map((m: any) => m.id);
          const compressionRatio = contentBlock.length > 0
            ? parsed.crystal.length / contentBlock.length
            : 0;

          await supabase.from("brain_knowledge_crystals").insert({
            crystal_type: "memory_cluster",
            title: parsed.title || `${module}::${category} crystal`,
            distilled_content: parsed.crystal,
            source_memory_ids: sourceIds,
            source_tier: "hot",
            source_module: module,
            source_count: subset.length,
            compression_ratio: Math.round(compressionRatio * 100) / 100,
            confidence: parsed.confidence,
            teacher_model: TEACHER_MODEL,
            student_model: STUDENT_MODEL,
            domain: category,
            tags: parsed.tags,
          });

          crystalsCreated++;
          memoriesProcessed += subset.length;
        }
      } catch (e) {
        console.error(`[crystallization] Failed for ${clusterKey}:`, e);
      }
    }

    const avgCompression = crystalsCreated > 0
      ? memoriesProcessed / crystalsCreated
      : 0;

    await completeRun(supabase, run.id, "complete", callsUsed, crystalsCreated, 0, memoriesProcessed, runStart, avgCompression);

    return {
      status: "complete",
      crystals_created: crystalsCreated,
      memories_processed: memoriesProcessed,
      calls_used: callsUsed,
    };
  } catch (err) {
    await completeRun(supabase, run.id, "failed", callsUsed, crystalsCreated, 0, memoriesProcessed, runStart, 0, String(err));
    throw err;
  }
}

// ════════════════════════════════════════════════════════════════════
// 2. TEACHER-STUDENT ROUTING
// ════════════════════════════════════════════════════════════════════

async function runTeacherStudent(supabase: any, apiKey: string, batchSize: number) {
  const runStart = Date.now();
  let callsUsed = 0;
  let tracesCreated = 0;

  const { data: run } = await supabase
    .from("brain_distillation_runs")
    .insert({ run_type: "teacher_student", status: "running" })
    .select("id")
    .single();

  try {
    // Find recent brain events with learning completions that haven't been distilled
    const { data: events } = await supabase
      .from("brain_events")
      .select("id, event_type, module, data, outcome, created_at")
      .in("event_type", ["technical_learning_cycle", "module_learning_insight", "learning_complete", "insight_generated", "pattern_discovered", "clm_cycle_complete"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (!events || events.length === 0) {
      await completeRun(supabase, run.id, "skipped", 0, 0, 0, 0, runStart);
      return { status: "skipped", reason: "no_recent_learnings" };
    }

    // Check which events have already been distilled
    const { data: existingTraces } = await supabase
      .from("brain_reasoning_traces")
      .select("metadata")
      .order("created_at", { ascending: false })
      .limit(200);

    const distilledEventIds = new Set(
      (existingTraces || [])
        .map((t: any) => t.metadata?.source_event_id)
        .filter(Boolean)
    );

    const undistilled = events.filter((e: any) => !distilledEventIds.has(e.id));
    const batch = undistilled.slice(0, batchSize);

    for (const event of batch) {
      // Extract summary from data column (brain_events uses 'data' not 'summary')
      const eventData = event.data || {};
      const eventSummary = eventData.title || eventData.content || eventData.result || JSON.stringify(eventData).slice(0, 300);
      const eventMetadata = eventData;

      const prompt = `You are a knowledge distillation teacher. A learning system produced this insight:

MODULE: ${event.module}
TYPE: ${event.event_type}
SUMMARY: ${eventSummary}
METADATA: ${JSON.stringify(eventMetadata).slice(0, 500)}

TASK: Generate a reasoning trace that captures the decision-making pattern behind this insight. Then distill it into a compact, reusable pattern that a smaller/faster model can apply without re-deriving the reasoning.

OUTPUT FORMAT:
Domain: <knowledge domain>
Reasoning Trace: <step-by-step reasoning that led to this insight>
Distilled Pattern: <compact pattern rule, 2-3 sentences max>
Pattern Confidence: <0.0-1.0>
Token Savings Estimate: <percentage of tokens saved vs full reasoning>`;

      try {
        const response = await callTeacher(apiKey, prompt);
        callsUsed++;

        if (response) {
          const parsed = parseTraceResponse(response);

          await supabase.from("brain_reasoning_traces").insert({
            trace_type: "reasoning_chain",
            domain: parsed.domain || event.module,
            module: event.module,
            teacher_model: TEACHER_MODEL,
            student_model: STUDENT_MODEL,
            prompt: `${event.event_type}: ${event.summary}`,
            teacher_response: parsed.reasoningTrace,
            distilled_pattern: parsed.distilledPattern,
            pattern_confidence: parsed.confidence,
            token_savings_pct: parsed.tokenSavings,
            metadata: { source_event_id: event.id, source_event_type: event.event_type },
          });

          tracesCreated++;
        }
      } catch (e) {
        console.error(`[teacher-student] Failed for event ${event.id}:`, e);
      }
    }

    await completeRun(supabase, run.id, "complete", callsUsed, 0, tracesCreated, batch.length, runStart);

    return {
      status: "complete",
      traces_created: tracesCreated,
      events_processed: batch.length,
      calls_used: callsUsed,
    };
  } catch (err) {
    await completeRun(supabase, run.id, "failed", callsUsed, 0, tracesCreated, 0, runStart, 0, String(err));
    throw err;
  }
}

// ════════════════════════════════════════════════════════════════════
// 3. CROSS-MODULE TRANSFER
// ════════════════════════════════════════════════════════════════════

async function runCrossModuleTransfer(supabase: any, apiKey: string, batchSize: number) {
  const runStart = Date.now();
  let callsUsed = 0;
  let heuristicsCreated = 0;

  const { data: run } = await supabase
    .from("brain_distillation_runs")
    .insert({ run_type: "cross_module", status: "running" })
    .select("id")
    .single();

  try {
    // Get top crystals from each module to identify transferable patterns
    const { data: crystals } = await supabase
      .from("brain_knowledge_crystals")
      .select("id, title, distilled_content, source_module, domain, confidence, tags")
      .gte("confidence", 0.6)
      .order("confidence", { ascending: false })
      .limit(50);

    if (!crystals || crystals.length < 2) {
      await completeRun(supabase, run.id, "skipped", 0, 0, 0, 0, runStart);
      return { status: "skipped", reason: "insufficient_crystals" };
    }

    // Group by module
    const moduleGroups: Record<string, any[]> = {};
    for (const c of crystals) {
      const mod = c.source_module || "general";
      if (!moduleGroups[mod]) moduleGroups[mod] = [];
      moduleGroups[mod].push(c);
    }

    const modules = Object.keys(moduleGroups);
    if (modules.length < 2) {
      await completeRun(supabase, run.id, "skipped", 0, 0, 0, 0, runStart);
      return { status: "skipped", reason: "single_module_only" };
    }

    // For each source module, identify transferable knowledge
    const processedModules = modules.slice(0, batchSize);

    for (const sourceModule of processedModules) {
      const sourceCrystals = moduleGroups[sourceModule].slice(0, 5);
      const targetModules = modules.filter(m => m !== sourceModule);

      const crystalSummary = sourceCrystals
        .map((c: any) => `- [${c.title}] ${c.distilled_content.slice(0, 200)}...`)
        .join("\n");

      const prompt = `You are a cross-domain knowledge transfer engine. Below are knowledge crystals from the "${sourceModule}" module:

${crystalSummary}

TARGET MODULES that could benefit: ${targetModules.join(", ")}

TASK: Identify 1-2 generalizable heuristics from "${sourceModule}" that could transfer to other modules. The heuristic must:
1. Abstract away domain-specific details
2. Express a general principle or pattern
3. Be actionable in the target domains

OUTPUT FORMAT (repeat for each heuristic):
Heuristic Name: <name>
Heuristic: <the generalized rule/pattern, 2-3 sentences>
Applicable To: <comma-separated module names>
Generalization Score: <0.0-1.0, how broadly applicable>
Confidence: <0.0-1.0>
---`;

      try {
        const response = await callTeacher(apiKey, prompt);
        callsUsed++;

        if (response) {
          const heuristics = parseHeuristicsResponse(response);

          for (const h of heuristics) {
            await supabase.from("brain_transfer_heuristics").insert({
              source_module: sourceModule,
              target_modules: h.applicableTo,
              heuristic_name: h.name,
              heuristic_content: h.content,
              generalization_score: h.generalizationScore,
              applicability_domains: h.applicableTo,
              confidence: h.confidence,
              teacher_model: TEACHER_MODEL,
            });
            heuristicsCreated++;
          }
        }
      } catch (e) {
        console.error(`[cross-module] Failed for ${sourceModule}:`, e);
      }
    }

    await completeRun(supabase, run.id, "complete", callsUsed, 0, 0, processedModules.length, runStart);

    // Update run with heuristics count
    await supabase
      .from("brain_distillation_runs")
      .update({ heuristics_created: heuristicsCreated })
      .eq("id", run.id);

    return {
      status: "complete",
      heuristics_created: heuristicsCreated,
      modules_processed: processedModules.length,
      calls_used: callsUsed,
    };
  } catch (err) {
    await completeRun(supabase, run.id, "failed", callsUsed, 0, 0, 0, runStart, 0, String(err));
    throw err;
  }
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

async function callTeacher(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TEACHER_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a knowledge distillation engine for the CMPSBL cognitive substrate. Your outputs must be precise, dense, and structured exactly as requested. No filler, no pleasantries.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[distillation] Teacher call failed: ${response.status}`, errText);
    if (response.status === 429) throw new Error("rate_limited");
    if (response.status === 402) throw new Error("budget_exceeded");
    throw new Error(`teacher_error_${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseCrystalResponse(response: string) {
  const titleMatch = response.match(/Title:\s*(.+)/i);
  const crystalMatch = response.match(/Crystal:\s*([\s\S]*?)(?=Confidence:|Key Tags:|$)/i);
  const confMatch = response.match(/Confidence:\s*([\d.]+)/i);
  const tagsMatch = response.match(/Key Tags:\s*(.+)/i);

  return {
    title: titleMatch?.[1]?.trim() || "Untitled Crystal",
    crystal: crystalMatch?.[1]?.trim() || response,
    confidence: Math.min(1, Math.max(0, parseFloat(confMatch?.[1] || "0.5"))),
    tags: tagsMatch?.[1]?.split(",").map((t: string) => t.trim()).filter(Boolean) || [],
  };
}

function parseTraceResponse(response: string) {
  const domainMatch = response.match(/Domain:\s*(.+)/i);
  const traceMatch = response.match(/Reasoning Trace:\s*([\s\S]*?)(?=Distilled Pattern:|$)/i);
  const patternMatch = response.match(/Distilled Pattern:\s*([\s\S]*?)(?=Pattern Confidence:|$)/i);
  const confMatch = response.match(/Pattern Confidence:\s*([\d.]+)/i);
  const savingsMatch = response.match(/Token Savings Estimate:\s*([\d.]+)%?/i);

  return {
    domain: domainMatch?.[1]?.trim() || "general",
    reasoningTrace: traceMatch?.[1]?.trim() || response,
    distilledPattern: patternMatch?.[1]?.trim() || "",
    confidence: Math.min(1, Math.max(0, parseFloat(confMatch?.[1] || "0.5"))),
    tokenSavings: Math.min(100, Math.max(0, parseFloat(savingsMatch?.[1] || "30"))),
  };
}

function parseHeuristicsResponse(response: string): Array<{
  name: string;
  content: string;
  applicableTo: string[];
  generalizationScore: number;
  confidence: number;
}> {
  const sections = response.split("---").filter(s => s.trim());
  const results: any[] = [];

  for (const section of sections) {
    const nameMatch = section.match(/Heuristic Name:\s*(.+)/i);
    const contentMatch = section.match(/Heuristic:\s*([\s\S]*?)(?=Applicable To:|$)/i);
    const applicableMatch = section.match(/Applicable To:\s*(.+)/i);
    const genMatch = section.match(/Generalization Score:\s*([\d.]+)/i);
    const confMatch = section.match(/Confidence:\s*([\d.]+)/i);

    if (nameMatch && contentMatch) {
      results.push({
        name: nameMatch[1].trim(),
        content: contentMatch[1].trim(),
        applicableTo: applicableMatch?.[1]?.split(",").map((t: string) => t.trim()).filter(Boolean) || [],
        generalizationScore: Math.min(1, Math.max(0, parseFloat(genMatch?.[1] || "0.5"))),
        confidence: Math.min(1, Math.max(0, parseFloat(confMatch?.[1] || "0.5"))),
      });
    }
  }

  return results;
}

async function completeRun(
  supabase: any,
  runId: string,
  status: string,
  callsUsed: number,
  crystalsCreated: number,
  tracesCreated: number,
  memoriesProcessed: number,
  startTime: number,
  compressionRatio?: number,
  errorMessage?: string,
) {
  await supabase
    .from("brain_distillation_runs")
    .update({
      status,
      calls_used: callsUsed,
      crystals_created: crystalsCreated,
      traces_created: tracesCreated,
      memories_processed: memoriesProcessed,
      compression_ratio_avg: compressionRatio || 0,
      duration_ms: Date.now() - startTime,
      error_message: errorMessage || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);
}
