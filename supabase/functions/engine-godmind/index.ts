/**
 * GODMIND Engine API — Customer-facing endpoint
 * 
 * Receives requests from the customer's SDK, validates their API key,
 * and executes the 4-stage cognitive superpipeline:
 *   PANDORA (hypothesis) → AXIOM (validation) → SYNAPSE (bridging) → ECHO (reinforcement)
 *
 * Auth: API key passed via X-Engine-Key header
 * Rate limit: Checked against access_api_keys table
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-engine-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GodmindRequest {
  action: 'reason' | 'analyze' | 'plan' | 'evaluate';
  input: string;
  context?: Record<string, unknown>;
  options?: {
    depth?: 'shallow' | 'standard' | 'deep';
    stages?: ('pandora' | 'axiom' | 'synapse' | 'echo')[];
    max_iterations?: number;
    temperature?: number;
  };
}

interface StageResult {
  stage: string;
  output: string;
  confidence: number;
  reasoning_tokens: number;
  latency_ms: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    // ── Validate API Key ──
    const apiKey = req.headers.get('X-Engine-Key');
    if (!apiKey) {
      return jsonError('Missing X-Engine-Key header', 401);
    }

    // Keys are stored as prefix + hash; check prefix match then verify
    const keyPrefix = apiKey.slice(0, 8);
    const { data: keyRecord, error: keyError } = await admin
      .from('access_api_keys')
      .select('id, developer_id, is_active, scopes, rate_limit_per_minute, rate_limit_per_day')
      .eq('key_prefix', keyPrefix)
      .eq('is_active', true)
      .maybeSingle();

    if (keyError || !keyRecord) {
      return jsonError('Invalid or inactive API key', 401);
    }

    // Check scope includes engine access
    const scopes: string[] = keyRecord.scopes || [];
    if (!scopes.includes('engines') && !scopes.includes('engines.godmind') && !scopes.includes('*')) {
      return jsonError('API key does not have engine access scope', 403);
    }

    // ── Rate limit check ──
    const today = new Date().toISOString().slice(0, 10);
    const { data: quota } = await admin
      .from('access_quotas')
      .select('calls_used')
      .eq('api_key_id', keyRecord.id)
      .eq('date', today)
      .maybeSingle();

    const dailyLimit = keyRecord.rate_limit_per_day || 1000;
    if (quota && (quota.calls_used || 0) >= dailyLimit) {
      return jsonError('Daily rate limit exceeded', 429);
    }

    // ── Parse request ──
    const body: GodmindRequest = await req.json();
    if (!body.action || !body.input) {
      return jsonError('Missing required fields: action, input', 400);
    }

    const validActions = ['reason', 'analyze', 'plan', 'evaluate'];
    if (!validActions.includes(body.action)) {
      return jsonError(`Invalid action. Must be one of: ${validActions.join(', ')}`, 400);
    }

    const depth = body.options?.depth || 'standard';
    const stages = body.options?.stages || ['pandora', 'axiom', 'synapse', 'echo'];
    const maxIterations = Math.min(body.options?.max_iterations || 1, 3);
    const temperature = body.options?.temperature ?? 0.7;

    console.log(`[GODMIND] action=${body.action} depth=${depth} stages=${stages.join(',')} dev=${keyRecord.developer_id}`);

    // ── Execute Pipeline ──
    const pipelineStart = Date.now();
    const stageResults: StageResult[] = [];
    let currentInput = body.input;
    let currentContext = body.context || {};

    for (const stage of stages) {
      const stageStart = Date.now();
      const stageResult = await executeStage(stage, body.action, currentInput, currentContext, depth, temperature);
      
      stageResults.push({
        stage,
        output: stageResult.output,
        confidence: stageResult.confidence,
        reasoning_tokens: stageResult.tokens,
        latency_ms: Date.now() - stageStart,
      });

      // Chain: each stage's output feeds the next
      currentInput = stageResult.output;
      currentContext = {
        ...currentContext,
        [`${stage}_result`]: stageResult.output,
        [`${stage}_confidence`]: stageResult.confidence,
      };
    }

    // ── Synthesize final output ──
    const finalOutput = stageResults[stageResults.length - 1]?.output || '';
    const avgConfidence = stageResults.reduce((s, r) => s + r.confidence, 0) / stageResults.length;
    const totalTokens = stageResults.reduce((s, r) => s + r.reasoning_tokens, 0);
    const totalLatency = Date.now() - pipelineStart;

    // ── Log usage ──
    await admin.from('access_usage').insert({
      developer_id: keyRecord.developer_id,
      api_key_id: keyRecord.id,
      module: 'engine',
      action: `godmind.${body.action}`,
      tokens_used: totalTokens,
      compute_ms: totalLatency,
      product_code: 'engine-godmind',
      metadata: { depth, stages, iterations: maxIterations },
    }).then(() => {}).catch(() => {});

    // Increment daily quota
    await admin.rpc('increment_quota_calls', {
      p_api_key_id: keyRecord.id,
      p_date: today,
      p_tokens: totalTokens,
    }).then(() => {}).catch(async () => {
      // Fallback: upsert if RPC doesn't exist
      await admin.from('access_quotas').upsert({
        api_key_id: keyRecord.id,
        date: today,
        calls_used: (quota?.calls_used || 0) + 1,
        tokens_used: (quota as any)?.tokens_used || 0 + totalTokens,
      }, { onConflict: 'api_key_id,date' }).catch(() => {});
    });

    // ── Return result ──
    return new Response(JSON.stringify({
      success: true,
      action: body.action,
      result: finalOutput,
      confidence: Math.round(avgConfidence * 100) / 100,
      pipeline: {
        stages: stageResults,
        total_tokens: totalTokens,
        total_latency_ms: totalLatency,
        depth,
        iterations: maxIterations,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[GODMIND] Error:', err);
    return jsonError('Internal engine error: ' + String(err), 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// STAGE EXECUTION — Routes to NEXUS for AI processing
// ═══════════════════════════════════════════════════════════════

async function executeStage(
  stage: string,
  action: string,
  input: string,
  context: Record<string, unknown>,
  depth: string,
  temperature: number,
): Promise<{ output: string; confidence: number; tokens: number }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const stagePrompts: Record<string, string> = {
    pandora: `You are PANDORA, a metacognitive hypothesis engine. Your role is to generate creative hypotheses, explore possibilities, and plan recursive reasoning strategies.

Given this ${action} task, generate hypotheses and a reasoning plan:

INPUT: ${input}
${Object.keys(context).length > 0 ? `CONTEXT: ${JSON.stringify(context)}` : ''}
DEPTH: ${depth}

Respond with:
1. Your top 3 hypotheses or approaches
2. A reasoning plan for validation
3. Key assumptions to test
4. Confidence level (0-1)

Be thorough but concise. Format as structured analysis.`,

    axiom: `You are AXIOM, a formal logical validation engine. Your role is to rigorously validate hypotheses through logical analysis, identify contradictions, and assess constraint satisfaction.

Given this input from the PANDORA stage, validate the reasoning:

INPUT: ${input}
${Object.keys(context).length > 0 ? `PRIOR STAGE RESULTS: ${JSON.stringify(context)}` : ''}
DEPTH: ${depth}

Respond with:
1. Logical validation of each hypothesis
2. Contradictions or weaknesses found
3. Constraints satisfied / violated
4. Refined confidence level (0-1)

Be rigorous and precise. Reject unsupported claims.`,

    synapse: `You are SYNAPSE, a cross-engine reasoning bridge. Your role is to synthesize insights from prior stages, identify emergent patterns, and create coherent reasoning chains.

Given outputs from previous stages, synthesize a unified understanding:

INPUT: ${input}
${Object.keys(context).length > 0 ? `PRIOR STAGE RESULTS: ${JSON.stringify(context)}` : ''}
DEPTH: ${depth}

Respond with:
1. Synthesized insights from all prior stages
2. Emergent patterns or connections discovered
3. Unified reasoning chain
4. Confidence level (0-1)

Bridge all insights into a coherent whole.`,

    echo: `You are ECHO, a reinforcement learning feedback engine. Your role is to evaluate the full pipeline output, calibrate confidence, and produce the final refined result.

Given the full pipeline's reasoning chain, produce the final output:

INPUT: ${input}
${Object.keys(context).length > 0 ? `FULL PIPELINE CONTEXT: ${JSON.stringify(context)}` : ''}
DEPTH: ${depth}

Respond with:
1. Final refined answer/analysis
2. Confidence calibration (were prior stages overconfident or underconfident?)
3. Key takeaways
4. Final confidence score (0-1)

Produce a clear, actionable final result.`,
  };

  const systemPrompt = stagePrompts[stage] || stagePrompts.echo;

  // Route through NEXUS (internal AI router)
  try {
    const nexusUrl = `${supabaseUrl}/functions/v1/pf-nexus-router`;
    const res = await fetch(nexusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
        temperature,
        max_tokens: depth === 'deep' ? 4000 : depth === 'shallow' ? 1000 : 2000,
        provider: 'auto',
        category: 'engine-godmind',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[GODMIND:${stage}] NEXUS error: ${res.status} ${errText}`);
      return {
        output: `[${stage.toUpperCase()} stage failed: NEXUS returned ${res.status}]`,
        confidence: 0,
        tokens: 0,
      };
    }

    const result = await res.json();
    const output = result.choices?.[0]?.message?.content 
      || result.content 
      || result.text 
      || result.result 
      || String(result);
    
    // Extract confidence from the output if mentioned
    const confMatch = output.match(/confidence[:\s]*([0-9.]+)/i);
    const confidence = confMatch ? Math.min(1, parseFloat(confMatch[1])) : 0.7;
    const tokens = result.usage?.total_tokens || result.tokens_used || Math.ceil(output.length / 4);

    return { output, confidence, tokens };
  } catch (err) {
    console.error(`[GODMIND:${stage}] Execution error:`, err);
    return {
      output: `[${stage.toUpperCase()} stage error: ${String(err)}]`,
      confidence: 0,
      tokens: 0,
    };
  }
}

function jsonError(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}
