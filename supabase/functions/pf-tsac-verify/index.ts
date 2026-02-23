/**
 * TSAC Verification Engine — Edge Function
 * Task-Specific Acceptance Criteria generation + LLM-as-Judge intent matching
 * 
 * Based on:
 * - Sol-Ver (Self-Play Solver-Verifier) pattern
 * - SWE-bench FAIL_TO_PASS methodology  
 * - VeriGuard dual-stage verification
 *
 * Actions:
 *   generate_criteria — Generate acceptance criteria for a task BEFORE execution
 *   judge_intent     — LLM-as-judge to verify output matches task intent
 *   full_verify      — Generate criteria + evaluate code + judge intent (all-in-one)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── AI Helper — Routes through NEXUS (Groq free-tier) ─────

async function callAI(messages: Array<{ role: string; content: string }>, tools?: any[], toolChoice?: any): Promise<any> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured — NEXUS router requires at least one provider key");

  const body: any = {
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.2,
  };

  if (tools) {
    body.tools = tools;
    if (toolChoice) body.tool_choice = toolChoice;
  }

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("NEXUS/Groq error:", resp.status, errText);
    throw new Error(`NEXUS router returned ${resp.status}`);
  }

  return resp.json();
}

// ── Action: Generate Acceptance Criteria ────────────────────

interface AcceptanceCriterion {
  id: string;
  description: string;
  type: "behavioral" | "structural" | "semantic" | "regression";
  assertion: string; // machine-readable check description
  priority: "critical" | "important" | "nice_to_have";
}

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

  const tools = [{
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

  const result = await callAI(
    [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    tools,
    { type: "function", function: { name: "submit_criteria" } }
  );

  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return tool call for criteria generation");

  const parsed = JSON.parse(toolCall.function.arguments);
  return parsed.criteria as AcceptanceCriterion[];
}

// ── Action: LLM-as-Judge Intent Matching ────────────────────

interface IntentJudgment {
  score: number; // 0-100
  verdict: "pass" | "fail" | "partial";
  reasoning: string;
  criteria_results: Array<{
    criterion_id: string;
    passed: boolean;
    explanation: string;
  }>;
}

async function judgeIntent(
  taskDescription: string,
  codeDiff: string,
  criteria: AcceptanceCriterion[],
): Promise<IntentJudgment> {
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

The question is always: "Does this code change solve the SPECIFIC problem stated in the task?"`;

  const criteriaText = criteria.map(c =>
    `[${c.id}] (${c.priority}) ${c.description}\n  Assertion: ${c.assertion}`
  ).join("\n\n");

  const userPrompt = `## TASK
${taskDescription}

## ACCEPTANCE CRITERIA
${criteriaText}

## CODE DIFF
\`\`\`
${codeDiff.slice(0, 12000)}
\`\`\`

Evaluate each criterion and provide your judgment.`;

  const tools = [{
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

  const result = await callAI(
    [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    tools,
    { type: "function", function: { name: "submit_judgment" } }
  );

  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return tool call for judgment");

  return JSON.parse(toolCall.function.arguments) as IntentJudgment;
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

// ── Main Handler ────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, task_description, task_id, executor_id, code_diff, code, context, criteria, source } = await req.json();
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── generate_criteria ──
    if (action === "generate_criteria") {
      if (!task_description) throw new Error("task_description required");
      const generated = await generateCriteria(task_description, context);
      return new Response(JSON.stringify({ criteria: generated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── judge_intent ──
    if (action === "judge_intent") {
      if (!task_description || !code_diff || !criteria) throw new Error("task_description, code_diff, criteria required");
      const judgment = await judgeIntent(task_description, code_diff, criteria);
      return new Response(JSON.stringify({ judgment }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── full_verify (all-in-one) ──
    if (action === "full_verify") {
      if (!task_description || !code_diff) throw new Error("task_description and code_diff required");

      const taskIdResolved = task_id || `task_${Date.now()}`;
      const executorIdResolved = executor_id || "unknown";
      const sourceResolved = source || "executor";

      // Step 1: Generate acceptance criteria
      const generatedCriteria = await generateCriteria(task_description, context);

      // Step 2: Static code quality check
      const codeToCheck = code || code_diff;
      const qualityResult = staticCodeCheck(codeToCheck);

      // Step 3: LLM-as-Judge intent matching
      const judgment = await judgeIntent(task_description, code_diff, generatedCriteria);

      // Step 4: Persist to DB
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
          critical_pass_rate: (() => {
            const critical = generatedCriteria.filter(c => c.priority === "critical");
            const criticalResults = judgment.criteria_results.filter(r =>
              critical.some(c => c.id === r.criterion_id)
            );
            const passed = criticalResults.filter(r => r.passed).length;
            return critical.length > 0 ? Math.round((passed / critical.length) * 100) : 100;
          })(),
        },
      };

      const { error: dbError } = await sb.from("tsac_verifications").insert(record);
      if (dbError) console.error("DB insert error:", dbError);

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
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── get_stats ──
    if (action === "get_stats") {
      const { data, error } = await sb
        .from("tsac_executor_stats")
        .select("*")
        .order("total_verifications", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ stats: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── get_history ──
    if (action === "get_history") {
      const query = sb
        .from("tsac_verifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (executor_id) query.eq("executor_id", executor_id);

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ verifications: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
