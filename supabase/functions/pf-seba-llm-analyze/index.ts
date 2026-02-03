/**
 * pf-seba-llm-analyze — LLM-Enhanced SEBA Analysis
 * v1.0.0 — Generates predicted impact metrics and enhanced insights
 * 
 * Uses Lovable AI to provide deeper cognitive analysis than heuristics alone.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  action: 'enhance_insights' | 'predict_impact';
  insights?: Array<{
    id: string;
    type: string;
    source_engine: string;
    title: string;
    description: string;
    evidence: string[];
    confidence: number;
    urgency: string;
  }>;
  proposal?: {
    id: string;
    category: string;
    title: string;
    description: string;
    target_modules: string[];
    proposed_actions: Array<{
      type: string;
      target: string;
      current_value: unknown;
      proposed_value: unknown;
    }>;
  };
  correlation_id?: string;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

const ENHANCE_INSIGHTS_PROMPT = `You are SEBA's cognitive enhancement module. Analyze the provided insights and generate:

1. **Predicted Impacts**: Quantified metrics showing expected improvements
2. **Implementation Hints**: Specific guidance for applying the improvement
3. **Priority Scores**: 1-10 based on urgency, confidence, and value

For each insight, output a JSON object with:
{
  "id": "insight_id",
  "predicted_impacts": [
    {
      "metric": "metric_name_snake_case",
      "current_value": 70,
      "predicted_value": 85,
      "delta_percent": 21.4,
      "confidence": 0.75,
      "reasoning": "Brief explanation of why this improvement is expected"
    }
  ],
  "implementation_hint": "Specific action to take",
  "priority_score": 7
}

Rules:
- Use realistic, conservative estimates (don't overpromise)
- Include at least 1-2 predicted impacts per insight
- Priority should reflect urgency × confidence × actionability
- Keep reasoning concise (< 100 chars)`;

const PREDICT_IMPACT_PROMPT = `You are SEBA's impact prediction engine. For the given improvement proposal, predict quantified outcomes.

Generate predicted impacts for each relevant metric:
{
  "predicted_impacts": [
    {
      "metric": "memory_efficiency",
      "current_value": 65,
      "predicted_value": 82,
      "delta_percent": 26.2,
      "confidence": 0.8,
      "reasoning": "Memory tiering reduces hot tier contention"
    }
  ]
}

Rules:
- Be conservative and realistic
- Base predictions on the proposed actions
- Include 2-4 relevant metrics
- Confidence should reflect proposal risk level`;

// ═══════════════════════════════════════════════════════════════
// LOVABLE AI CALL
// ═══════════════════════════════════════════════════════════════

async function callLovableAI(
  prompt: string,
  systemPrompt: string
): Promise<{ content: string; success: boolean; model: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    console.warn("LOVABLE_API_KEY not configured");
    return { content: '', success: false, model: 'none' };
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (response.status === 429 || response.status === 402) {
      console.warn(`Lovable AI unavailable: ${response.status}`);
      return { content: '', success: false, model: 'gemini-3-flash' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      return { content: '', success: false, model: 'gemini-3-flash' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return { content, success: true, model: 'gemini-3-flash' };
  } catch (error) {
    console.error("Lovable AI exception:", error);
    return { content: '', success: false, model: 'gemini-3-flash' };
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════

async function enhanceInsights(insights: AnalyzeRequest['insights']) {
  if (!insights || insights.length === 0) {
    return { success: true, enhanced_insights: [] };
  }

  const prompt = `Analyze these ${insights.length} cognitive insights and generate predicted impacts:

${JSON.stringify(insights, null, 2)}

Return a JSON array of enhanced insights.`;

  const result = await callLovableAI(prompt, ENHANCE_INSIGHTS_PROMPT);

  if (!result.success || !result.content) {
    // Return empty - client will use heuristic fallback
    return { success: false, enhanced_insights: [] };
  }

  try {
    // Extract JSON from response
    const jsonMatch = result.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const enhanced = JSON.parse(jsonMatch[0]);
      return { success: true, enhanced_insights: enhanced, model: result.model };
    }

    // Try parsing as single object wrapped in array
    const objMatch = result.content.match(/\{[\s\S]*\}/);
    if (objMatch) {
      const enhanced = [JSON.parse(objMatch[0])];
      return { success: true, enhanced_insights: enhanced, model: result.model };
    }

    return { success: false, enhanced_insights: [] };
  } catch (e) {
    console.error("Failed to parse LLM response:", e);
    return { success: false, enhanced_insights: [] };
  }
}

async function predictImpact(proposal: AnalyzeRequest['proposal']) {
  if (!proposal) {
    return { success: false, predicted_impacts: [] };
  }

  const prompt = `Predict the quantified outcomes for this improvement proposal:

Category: ${proposal.category}
Title: ${proposal.title}
Description: ${proposal.description}
Target Modules: ${proposal.target_modules.join(', ')}

Proposed Actions:
${proposal.proposed_actions.map((a, i) => 
  `${i + 1}. ${a.type} on ${a.target}: ${JSON.stringify(a.current_value)} → ${JSON.stringify(a.proposed_value)}`
).join('\n')}

Return a JSON object with predicted_impacts array.`;

  const result = await callLovableAI(prompt, PREDICT_IMPACT_PROMPT);

  if (!result.success || !result.content) {
    return { success: false, predicted_impacts: [] };
  }

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { 
        success: true, 
        predicted_impacts: parsed.predicted_impacts || [], 
        model: result.model 
      };
    }
    return { success: false, predicted_impacts: [] };
  } catch (e) {
    console.error("Failed to parse impact prediction:", e);
    return { success: false, predicted_impacts: [] };
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body: AnalyzeRequest = await req.json();

    let result;
    switch (body.action) {
      case 'enhance_insights':
        result = await enhanceInsights(body.insights);
        break;

      case 'predict_impact':
        result = await predictImpact(body.proposal);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action', valid_actions: ['enhance_insights', 'predict_impact'] }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        ...result,
        action: body.action,
        correlation_id: body.correlation_id,
        latency_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SEBA LLM Analyze error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed',
        latency_ms: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
