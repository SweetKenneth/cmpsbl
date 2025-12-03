/**
 * Cascade v4.0.0 - Causal Reasoning Core
 * Infers causal relationships and generates hypotheses with confidence scores
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { query_id, context } = await req.json();

    console.log(`🔍 Causal analysis for query ${query_id}`);

    // Get query details
    const { data: query } = await sb
      .from('learning_queries')
      .select('*')
      .eq('id', query_id)
      .single();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get related sensory events
    const { data: sensoryEvents } = await sb
      .from('brain_sensory_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Use Lovable AI for causal reasoning
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const causalPrompt = `Analyze this query and related events to infer causal relationships:

Query: "${query.query}"
Topic: ${query.topic}

Recent System Events: ${sensoryEvents?.length || 0} events in last 24h

Generate ONE clear causal hypothesis explaining what might cause the pattern or issue described in the query. Format:
HYPOTHESIS: [clear statement]
CONFIDENCE: [0.0-1.0]
EVIDENCE: [key supporting points]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a causal reasoning expert. Analyze patterns and infer likely causes with confidence scores."
          },
          { role: "user", content: causalPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // Parse response (simplified)
    const hypothesisMatch = result.match(/HYPOTHESIS:\s*(.+?)(?=CONFIDENCE:|$)/s);
    const confidenceMatch = result.match(/CONFIDENCE:\s*([\d.]+)/);
    const evidenceMatch = result.match(/EVIDENCE:\s*(.+?)$/s);

    const hypothesis = hypothesisMatch?.[1]?.trim() || result.substring(0, 200);
    const confidence = parseFloat(confidenceMatch?.[1] || '0.5');
    const evidence = evidenceMatch?.[1]?.trim() || 'Analysis based on system patterns';

    // Store causal trace
    const { data: trace, error: traceError } = await sb
      .from('causal_traces')
      .insert({
        query_id,
        hypothesis,
        confidence,
        evidence_refs: [{ source: 'ai_analysis', content: evidence }],
        validation_status: confidence > 0.7 ? 'validated' : 'pending'
      })
      .select()
      .single();

    if (traceError) throw traceError;

    console.log(`✅ Causal trace created with confidence ${confidence.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        ok: true,
        trace_id: trace.id,
        hypothesis,
        confidence,
        validation_status: trace.validation_status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Causal reasoning error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
