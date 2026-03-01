/**
 * TSAC Verification Engine — Edge Function
 * Task-Specific Acceptance Criteria generation + LLM-as-Judge intent matching
 * 
 * v2.0.0 — Evolution Pipeline Integration
 * 3-Layer Verification: Pre-Code → Post-Shadow → Post-Production
 * 
 * Based on:
 * - Sol-Ver (Self-Play Solver-Verifier) pattern
 * - SWE-bench FAIL_TO_PASS methodology  
 * - VeriGuard dual-stage verification
 *
 * Actions:
 *   generate_criteria    — Generate acceptance criteria BEFORE execution
 *   judge_intent         — LLM-as-judge to verify output matches task intent
 *   full_verify           — Generate criteria + evaluate code + judge intent (all-in-one)
 *   evolution_pre_verify  — Layer 1: Generate criteria for an evolution proposal
 *   evolution_shadow_verify — Layer 2: Verify shadow-applied code against criteria
 *   evolution_production_verify — Layer 3: Re-verify in production, detect drift
 *   get_stats / get_history — Read-only queries
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { nexusRoute } from "../_shared/nexus-route.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── AI Helper — Routes through full NEXUS provider fleet ─────

async function callAI(messages: Array<{ role: string; content: string }>, tools?: any[], toolChoice?: any): Promise<any> {
  const systemMsg = messages.find(m => m.role === "system");
  const userMsg = messages.find(m => m.role === "user");
  
  if (!userMsg) throw new Error("No user message provided");

  const result = await nexusRoute(userMsg.content, {
    systemPrompt: systemMsg?.content,
    taskType: "reasoning",
    temperature: 0.2,
    tools,
    toolChoice,
  });

  console.log(`[NEXUS] TSAC routed → ${result.provider} (${result.model}) in ${result.latencyMs}ms, ${result.attempts} attempt(s)`);

  // Return in OpenAI-compatible format for existing code compatibility
  if (tools && result.content.startsWith("[")) {
    try {
      const toolCalls = JSON.parse(result.content);
      return { choices: [{ message: { role: "assistant", tool_calls: toolCalls } }] };
    } catch { /* fall through to text response */ }
  }
  return { choices: [{ message: { role: "assistant", content: result.content } }] };
}

// ── Types ───────────────────────────────────────────────────

interface AcceptanceCriterion {
  id: string;
  description: string;
  type: "behavioral" | "structural" | "semantic" | "regression";
  assertion: string;
  priority: "critical" | "important" | "nice_to_have";
}

interface IntentJudgment {
  score: number;
  verdict: "pass" | "fail" | "partial";
  reasoning: string;
  criteria_results: Array<{
    criterion_id: string;
    passed: boolean;
    explanation: string;
  }>;
}

// ── Shared Tool Schemas ─────────────────────────────────────

const criteriaToolSchema = [{
  type: "function",
  function: {
    name: "submit_criteria",
    description: "Submit the generated acceptance criteria",
    parameters: {
      type: "object",
      properties: {
        criteria: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Short unique ID like AC-1, AC-2" },
              description: { type: "string", description: "Human-readable criterion" },
              type: { type: "string", enum: ["behavioral", "structural", "semantic", "regression"] },
              assertion: { type: "string", description: "Machine-readable assertion statement" },
              priority: { type: "string", enum: ["critical", "important", "nice_to_have"] },
            },
            required: ["id", "description", "type", "assertion", "priority"],
            additionalProperties: false,
          },
        },
      },
      required: ["criteria"],
      additionalProperties: false,
    },
  },
}];

const judgmentToolSchema = [{
  type: "function",
  function: {
    name: "submit_judgment",
    description: "Submit the intent match judgment",
    parameters: {
      type: "object",
      properties: {
        score: { type: "number", description: "Overall score 0-100" },
        verdict: { type: "string", enum: ["pass", "fail", "partial"] },
        reasoning: { type: "string", description: "2-3 sentence summary of judgment" },
        criteria_results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              criterion_id: { type: "string" },
              passed: { type: "boolean" },
              explanation: { type: "string" },
            },
            required: ["criterion_id", "passed", "explanation"],
            additionalProperties: false,
          },
        },
      },
      required: ["score", "verdict", "reasoning", "criteria_results"],
      additionalProperties: false,
    },
  },
}];

const driftToolSchema = [{
  type: "function",
  function: {
    name: "submit_drift_analysis",
    description: "Submit drift analysis between shadow and production results",
    parameters: {
      type: "object",
      properties: {
        drift_detected: { type: "boolean" },
        drift_severity: { type: "string", enum: ["none", "minor", "major", "critical"] },
        score: { type: "number", description: "Production verification score 0-100" },
        verdict: { type: "string", enum: ["pass", "fail", "partial"] },
        reasoning: { type: "string" },
        drift_details: { type: "string", description: "What specifically drifted between shadow and production" },
        failure_patterns: {
          type: "array",
          items: { type: "string" },
          description: "Patterns that failed or drifted, for executor training",
        },
        recommended_action: { type: "string", enum: ["promote", "rollback", "investigate", "retrain"] },
      },
      required: ["drift_detected", "drift_severity", "score", "verdict", "reasoning", "drift_details", "failure_patterns", "recommended_action"],
      additionalProperties: false,
    },
  },
}];

// ── Action: Generate Acceptance Criteria ─────────────────────

async function generateCriteria(taskDescription: string, context?: string): Promise<AcceptanceCriterion[]> {
  const systemPrompt = `You are a senior QA engineer generating Task-Specific Acceptance Criteria (TSAC) for a coding task.

Your job: Given a task description, generate 3-7 concrete, testable acceptance criteria that define what "correctly solving this task" means.

Each criterion must be:
- SPECIFIC to the task (not generic "code should work")
- TESTABLE (could be verified by reading the code diff)
- FOCUSED on CORRECTNESS (does it solve the stated problem?)

Categories:
- behavioral: The code produces the correct output/behavior for the task
- structural: The code modifies the right files/functions/components
- semantic: The code's logic matches the intent of the task
- regression: The change doesn't break existing functionality

Priority:
- critical: Must pass or the task is NOT solved
- important: Should pass for a quality solution
- nice_to_have: Best practice but not strictly required`;

  const userPrompt = `Task: ${taskDescription}${context ? `\n\nContext:\n${context}` : ""}`;

  const result = await callAI(
    [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    criteriaToolSchema,
    { type: "function", function: { name: "submit_criteria" } }
  );

  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return tool call for criteria generation");

  return JSON.parse(toolCall.function.arguments).criteria as AcceptanceCriterion[];
}

// ── Action: LLM-as-Judge Intent Matching ────────────────────

async function judgeIntent(
  taskDescription: string,
  codeDiff: string,
  criteria: AcceptanceCriterion[],
  stage?: string,
): Promise<IntentJudgment> {
  const stageContext = stage ? `\n\nVERIFICATION STAGE: ${stage}. Be ${stage === 'production' ? 'EXTRA strict — this is the final gate before permanent promotion' : 'thorough but fair — this is a shadow/pre-code check'}.` : '';

  const systemPrompt = `You are a strict code review judge evaluating whether a code change correctly solves the stated task.

You are given:
1. The original TASK description
2. The CODE DIFF (what was changed)
3. ACCEPTANCE CRITERIA that define correctness

Your job: Evaluate each criterion against the code diff and provide an overall verdict.

Scoring:
- 90-100: All critical criteria pass, code clearly solves the task
- 70-89: Most criteria pass, minor issues
- 50-69: Partially solves the task, missing key elements
- 0-49: Does not solve the stated task

Be STRICT. "Good code" that doesn't solve the specific task should score LOW.
"Ugly code" that correctly solves the task should score HIGHER than pretty code that misses the point.

The question is always: "Does this code change solve the SPECIFIC problem stated in the task?"${stageContext}`;

  const criteriaText = criteria.map(c =>
    `[${c.id}] (${c.priority}) ${c.description}\n  Assertion: ${c.assertion}`
  ).join("\n\n");

  const userPrompt = `## TASK\n${taskDescription}\n\n## ACCEPTANCE CRITERIA\n${criteriaText}\n\n## CODE DIFF\n\`\`\`\n${codeDiff.slice(0, 12000)}\n\`\`\`\n\nEvaluate each criterion and provide your judgment.`;

  const result = await callAI(
    [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    judgmentToolSchema,
    { type: "function", function: { name: "submit_judgment" } }
  );

  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return tool call for judgment");

  return JSON.parse(toolCall.function.arguments) as IntentJudgment;
}

// ── Action: Drift Detection (Shadow vs Production) ──────────

async function detectDrift(
  taskDescription: string,
  codeDiff: string,
  criteria: AcceptanceCriterion[],
  shadowResults: any,
  productionContext?: string,
): Promise<any> {
  const systemPrompt = `You are a production verification engineer performing DRIFT DETECTION between shadow and production environments.

You are comparing:
1. How code performed in SHADOW mode (sandboxed, no real impact)
2. How the SAME code behaves in PRODUCTION (real system, real data)

Your job: Detect any behavioral drift — cases where shadow results don't match production reality.

Common drift sources:
- Data shape differences (shadow used mock/test data, production has real edge cases)
- Timing differences (shadow ran fast, production has real latency/contention)
- State differences (shadow had clean state, production has accumulated state)
- Integration differences (shadow mocked external calls, production uses real APIs)

DRIFT SEVERITY:
- none: Shadow and production behave identically
- minor: Cosmetic or non-functional differences, safe to promote
- major: Behavioral differences that affect correctness, investigate before promoting
- critical: Production behavior contradicts shadow results, ROLLBACK recommended`;

  const userPrompt = `## TASK\n${taskDescription}

## CODE DIFF\n\`\`\`\n${codeDiff.slice(0, 8000)}\n\`\`\`

## ACCEPTANCE CRITERIA\n${criteria.map(c => `[${c.id}] ${c.description}`).join('\n')}

## SHADOW RESULTS\n${JSON.stringify(shadowResults, null, 2).slice(0, 3000)}

## PRODUCTION CONTEXT\n${productionContext || 'No additional production context provided. Evaluate based on code analysis.'}

Analyze for drift between shadow expectations and production reality.`;

  const result = await callAI(
    [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    driftToolSchema,
    { type: "function", function: { name: "submit_drift_analysis" } }
  );

  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return drift analysis");

  return JSON.parse(toolCall.function.arguments);
}

// ── Static Code Quality Check (runs locally, no AI) ─────────

function staticCodeCheck(code: string): { score: number; checks: Array<{ name: string; passed: boolean; message: string }> } {
  const checks = [
    { name: "Input Validation", passed: /(?:typeof|instanceof|isNaN|\.length|!==\s*(?:undefined|null)|z\.)/i.test(code), message: "" },
    { name: "Error Handling", passed: /try\s*\{/.test(code) || /\.catch\(/.test(code), message: "" },
    { name: "Type Annotations", passed: /:\s*(?:string|number|boolean|Record|Array|Promise)/i.test(code), message: "" },
    { name: "No Secrets", passed: !/(?:api[_-]?key|token|secret|password)\s*[:=]\s*['"][^'"]{8,}['"]/gi.test(code), message: "" },
    { name: "No XSS", passed: !/innerHTML\s*=|dangerouslySetInnerHTML|eval\s*\(/gi.test(code), message: "" },
    { name: "Timeout Guards", passed: !/fetch\(/i.test(code) || /AbortController|timeout|signal/i.test(code), message: "" },
  ];

  checks.forEach(c => { c.message = c.passed ? "✓" : "✗ Missing"; });
  const passed = checks.filter(c => c.passed).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}

// ── Persist verification and update evolution run ───────────

async function persistVerification(
  sb: any,
  record: any,
  evolutionRunId?: string,
  stage?: string,
): Promise<string | null> {
  const fullRecord = { ...record, evolution_run_id: evolutionRunId || null, verification_stage: stage || null };
  const { data, error } = await sb.from("tsac_verifications").insert(fullRecord).select('id').single();
  if (error) { console.error("DB insert error:", error); return null; }

  // Update evolution_runs with TSAC results
  if (evolutionRunId && stage) {
    const updatePayload: Record<string, any> = {};
    const verificationId = data?.id;

    if (stage === 'pre') {
      updatePayload.tsac_pre_criteria = record.acceptance_criteria;
      updatePayload.tsac_pre_verdict = record.overall_verdict;
      updatePayload.tsac_pre_score = record.intent_match_score;
    } else if (stage === 'shadow') {
      updatePayload.tsac_shadow_verdict = record.overall_verdict;
      updatePayload.tsac_shadow_score = record.intent_match_score;
    } else if (stage === 'production') {
      updatePayload.tsac_production_verdict = record.overall_verdict;
      updatePayload.tsac_production_score = record.intent_match_score;
    }

    // Append verification ID to array
    if (verificationId) {
      const { data: run } = await sb.from('evolution_runs').select('tsac_verification_ids').eq('run_id', evolutionRunId).single();
      const existingIds = run?.tsac_verification_ids || [];
      updatePayload.tsac_verification_ids = [...existingIds, verificationId];
    }

    await sb.from('evolution_runs').update(updatePayload).eq('run_id', evolutionRunId);
  }

  return data?.id || null;
}

// ── Generate training feedback from verification results ────

async function generateTrainingFeedback(
  sb: any,
  executorId: string,
  evolutionRunId: string | null,
  taskDescription: string,
  criteria: AcceptanceCriterion[],
  preVerdict?: string, preScore?: number,
  shadowVerdict?: string, shadowScore?: number,
  prodVerdict?: string, prodScore?: number,
  driftDetected?: boolean, driftDetails?: string,
  failurePatterns?: string[],
): Promise<void> {
  const feedback = {
    executor_id: executorId,
    evolution_run_id: evolutionRunId,
    task_description: taskDescription,
    criteria_snapshot: criteria,
    pre_verdict: preVerdict, pre_score: preScore,
    shadow_verdict: shadowVerdict, shadow_score: shadowScore,
    production_verdict: prodVerdict, production_score: prodScore,
    drift_detected: driftDetected || false,
    drift_details: driftDetails,
    failure_patterns: failurePatterns || [],
  };

  const { error } = await sb.from('tsac_training_feedback').insert(feedback);
  if (error) console.error("Training feedback insert error:", error);

  // If there are failure patterns, emit a brain_event for the learning pipeline
  if (failurePatterns && failurePatterns.length > 0) {
    await sb.from('brain_events').insert({
      event_type: 'tsac_training_signal',
      module: 'tsac',
      outcome: (prodVerdict || shadowVerdict || preVerdict) === 'pass' ? 'success' : 'failure',
      data: {
        executor_id: executorId,
        evolution_run_id: evolutionRunId,
        failure_patterns: failurePatterns,
        drift_detected: driftDetected,
        scores: { pre: preScore, shadow: shadowScore, production: prodScore },
        source: 'tsac_training_feedback',
      },
    });
  }
}

// ── Main Handler ────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, task_description, task_id, executor_id, code_diff, code, context, criteria, source,
            evolution_run_id, shadow_results, production_context } = body;
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ══════════════════════════════════════════════════════════
    // LAYER 1: Pre-Code Criteria Generation (before any code is written)
    // ══════════════════════════════════════════════════════════

    if (action === "generate_criteria") {
      if (!task_description) throw new Error("task_description required");
      const generated = await generateCriteria(task_description, context);
      return new Response(JSON.stringify({ criteria: generated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ══════════════════════════════════════════════════════════
    // EVOLUTION LAYER 1: Pre-Verify (generate criteria + store on evolution run)
    // ══════════════════════════════════════════════════════════

    if (action === "evolution_pre_verify") {
      if (!task_description) throw new Error("task_description required");
      if (!evolution_run_id) throw new Error("evolution_run_id required");

      const generated = await generateCriteria(task_description, context);

      // Store criteria on evolution run
      await sb.from('evolution_runs').update({
        tsac_pre_criteria: generated,
      }).eq('run_id', evolution_run_id);

      // Log event
      await sb.from('brain_events').insert({
        event_type: 'tsac_pre_verify',
        module: 'tsac',
        outcome: 'success',
        data: { evolution_run_id, criteria_count: generated.length, source: 'evolution_pipeline' },
      });

      return new Response(JSON.stringify({
        success: true,
        stage: 'pre',
        evolution_run_id,
        criteria: generated,
        criteria_count: generated.length,
        message: `${generated.length} acceptance criteria generated. Code must satisfy these to pass.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══════════════════════════════════════════════════════════
    // EVOLUTION LAYER 2: Shadow Verify (after shadow-apply, before production)
    // ══════════════════════════════════════════════════════════

    if (action === "evolution_shadow_verify") {
      if (!task_description || !code_diff) throw new Error("task_description and code_diff required");
      if (!evolution_run_id) throw new Error("evolution_run_id required");

      // Fetch pre-generated criteria from evolution run
      const { data: run } = await sb.from('evolution_runs').select('tsac_pre_criteria, metadata').eq('run_id', evolution_run_id).single();
      const useCriteria = run?.tsac_pre_criteria || await generateCriteria(task_description, context);

      // Static quality check
      const qualityResult = staticCodeCheck(code || code_diff);

      // LLM-as-Judge with shadow stage context
      const judgment = await judgeIntent(task_description, code_diff, useCriteria, 'shadow');

      // Persist
      const record = {
        task_id: task_id || `evo_shadow_${Date.now()}`,
        executor_id: executor_id || 'evolution_pipeline',
        task_description,
        acceptance_criteria: useCriteria,
        criteria_results: judgment.criteria_results,
        intent_match_score: judgment.score,
        intent_match_reasoning: judgment.reasoning,
        code_quality_score: qualityResult.score,
        overall_verdict: judgment.verdict,
        source: 'evolution_shadow',
        metadata: {
          quality_checks: qualityResult.checks,
          stage: 'shadow',
          evolution_run_id,
          critical_pass_rate: calcCriticalPassRate(useCriteria, judgment.criteria_results),
        },
      };

      await persistVerification(sb, record, evolution_run_id, 'shadow');

      // Gate logic: if shadow fails, block production promotion
      const blocked = judgment.verdict === 'fail' || judgment.score < 50;

      await sb.from('brain_events').insert({
        event_type: 'tsac_shadow_verify',
        module: 'tsac',
        outcome: blocked ? 'blocked' : 'success',
        data: { evolution_run_id, verdict: judgment.verdict, score: judgment.score, blocked, source: 'evolution_pipeline' },
      });

      return new Response(JSON.stringify({
        success: true,
        stage: 'shadow',
        evolution_run_id,
        verdict: judgment.verdict,
        intent_score: judgment.score,
        quality_score: qualityResult.score,
        reasoning: judgment.reasoning,
        criteria_results: judgment.criteria_results,
        blocked,
        message: blocked
          ? `❌ SHADOW VERIFICATION FAILED (score: ${judgment.score}). Production promotion BLOCKED. Fix the code and re-verify.`
          : `✅ Shadow verification passed (score: ${judgment.score}). Safe to proceed to production.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══════════════════════════════════════════════════════════
    // EVOLUTION LAYER 3: Production Verify (after production-apply, drift detection)
    // ══════════════════════════════════════════════════════════

    if (action === "evolution_production_verify") {
      if (!task_description || !code_diff) throw new Error("task_description and code_diff required");
      if (!evolution_run_id) throw new Error("evolution_run_id required");

      // Fetch pre-criteria + shadow results
      const { data: run } = await sb.from('evolution_runs')
        .select('tsac_pre_criteria, tsac_shadow_verdict, tsac_shadow_score, metadata')
        .eq('run_id', evolution_run_id).single();

      const useCriteria = run?.tsac_pre_criteria || await generateCriteria(task_description, context);
      const shadowRes = { verdict: run?.tsac_shadow_verdict, score: run?.tsac_shadow_score };

      // Re-judge in production context (strictest stage)
      const judgment = await judgeIntent(task_description, code_diff, useCriteria, 'production');
      const qualityResult = staticCodeCheck(code || code_diff);

      // Drift detection: compare shadow vs production results
      const driftAnalysis = await detectDrift(
        task_description,
        code_diff,
        useCriteria,
        shadowRes,
        production_context,
      );

      // Persist verification
      const record = {
        task_id: task_id || `evo_prod_${Date.now()}`,
        executor_id: executor_id || 'evolution_pipeline',
        task_description,
        acceptance_criteria: useCriteria,
        criteria_results: judgment.criteria_results,
        intent_match_score: judgment.score,
        intent_match_reasoning: judgment.reasoning,
        code_quality_score: qualityResult.score,
        overall_verdict: driftAnalysis.drift_severity === 'critical' ? 'fail' : judgment.verdict,
        source: 'evolution_production',
        metadata: {
          quality_checks: qualityResult.checks,
          stage: 'production',
          evolution_run_id,
          drift: driftAnalysis,
          shadow_comparison: shadowRes,
          critical_pass_rate: calcCriticalPassRate(useCriteria, judgment.criteria_results),
        },
      };

      await persistVerification(sb, record, evolution_run_id, 'production');

      // Update evolution run with drift status
      await sb.from('evolution_runs').update({
        tsac_drift_detected: driftAnalysis.drift_detected && driftAnalysis.drift_severity !== 'none',
      }).eq('run_id', evolution_run_id);

      // Generate training feedback for the executor
      await generateTrainingFeedback(
        sb, executor_id || 'evolution_pipeline', evolution_run_id,
        task_description, useCriteria,
        undefined, undefined, // pre (already stored)
        shadowRes.verdict, shadowRes.score,
        judgment.verdict, judgment.score,
        driftAnalysis.drift_detected, driftAnalysis.drift_details,
        driftAnalysis.failure_patterns,
      );

      const shouldRollback = driftAnalysis.recommended_action === 'rollback' || driftAnalysis.drift_severity === 'critical';

      await sb.from('brain_events').insert({
        event_type: 'tsac_production_verify',
        module: 'tsac',
        outcome: shouldRollback ? 'rollback_recommended' : 'success',
        data: {
          evolution_run_id, verdict: judgment.verdict, score: judgment.score,
          drift: driftAnalysis, recommended_action: driftAnalysis.recommended_action,
          source: 'evolution_pipeline',
        },
      });

      return new Response(JSON.stringify({
        success: true,
        stage: 'production',
        evolution_run_id,
        verdict: judgment.verdict,
        intent_score: judgment.score,
        quality_score: qualityResult.score,
        reasoning: judgment.reasoning,
        drift: {
          detected: driftAnalysis.drift_detected,
          severity: driftAnalysis.drift_severity,
          details: driftAnalysis.drift_details,
          failure_patterns: driftAnalysis.failure_patterns,
          recommended_action: driftAnalysis.recommended_action,
        },
        shadow_comparison: {
          shadow_score: shadowRes.score,
          production_score: judgment.score,
          score_delta: judgment.score - (shadowRes.score || 0),
        },
        should_rollback: shouldRollback,
        message: shouldRollback
          ? `🚨 PRODUCTION DRIFT DETECTED (severity: ${driftAnalysis.drift_severity}). Rollback recommended.`
          : driftAnalysis.drift_detected
            ? `⚠️ Minor drift detected but safe to keep (severity: ${driftAnalysis.drift_severity}).`
            : `✅ Production verification passed. No drift detected. Score: ${judgment.score}.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══════════════════════════════════════════════════════════
    // STANDARD ACTIONS (unchanged from v1)
    // ══════════════════════════════════════════════════════════

    if (action === "judge_intent") {
      if (!task_description || !code_diff || !criteria) throw new Error("task_description, code_diff, criteria required");
      const judgment = await judgeIntent(task_description, code_diff, criteria);
      return new Response(JSON.stringify({ judgment }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "full_verify") {
      if (!task_description || !code_diff) throw new Error("task_description and code_diff required");

      const taskIdResolved = task_id || `task_${Date.now()}`;
      const executorIdResolved = executor_id || "unknown";
      const sourceResolved = source || "executor";

      const generatedCriteria = await generateCriteria(task_description, context);
      const codeToCheck = code || code_diff;
      const qualityResult = staticCodeCheck(codeToCheck);
      const judgment = await judgeIntent(task_description, code_diff, generatedCriteria);

      const record = {
        task_id: taskIdResolved,
        executor_id: executorIdResolved,
        task_description,
        acceptance_criteria: generatedCriteria,
        criteria_results: judgment.criteria_results,
        intent_match_score: judgment.score,
        intent_match_reasoning: judgment.reasoning,
        code_quality_score: qualityResult.score,
        overall_verdict: judgment.verdict,
        source: sourceResolved,
        metadata: {
          quality_checks: qualityResult.checks,
          criteria_count: generatedCriteria.length,
          critical_pass_rate: calcCriticalPassRate(generatedCriteria, judgment.criteria_results),
        },
      };

      await persistVerification(sb, record, evolution_run_id, null);

      return new Response(JSON.stringify({
        verification: {
          task_id: taskIdResolved,
          verdict: judgment.verdict,
          intent_score: judgment.score,
          quality_score: qualityResult.score,
          reasoning: judgment.reasoning,
          criteria: generatedCriteria,
          criteria_results: judgment.criteria_results,
          quality_checks: qualityResult.checks,
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── get_stats ──
    if (action === "get_stats") {
      const { data, error } = await sb.from("tsac_executor_stats").select("*").order("total_verifications", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ stats: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── get_history ──
    if (action === "get_history") {
      const query = sb.from("tsac_verifications").select("*").order("created_at", { ascending: false }).limit(50);
      if (executor_id) query.eq("executor_id", executor_id);
      if (evolution_run_id) query.eq("evolution_run_id", evolution_run_id);
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ verifications: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── get_training_feedback (for executor learning pipeline) ──
    if (action === "get_training_feedback") {
      const query = sb.from("tsac_training_feedback").select("*").order("created_at", { ascending: false }).limit(100);
      if (executor_id) query.eq("executor_id", executor_id);
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ feedback: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (err) {
    console.error("TSAC error:", err);
    const status = err instanceof Error && err.message.includes("required") ? 400 : 500;
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Helpers ─────────────────────────────────────────────────

function calcCriticalPassRate(criteria: AcceptanceCriterion[], results: any[]): number {
  const critical = criteria.filter(c => c.priority === "critical");
  const criticalResults = results.filter((r: any) => critical.some(c => c.id === r.criterion_id));
  const passed = criticalResults.filter((r: any) => r.passed).length;
  return critical.length > 0 ? Math.round((passed / critical.length) * 100) : 100;
}
