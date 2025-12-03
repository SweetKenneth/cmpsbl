/**
 * PromptFluid Defense AI Challenge Adjuster
 * AI-powered dynamic challenge difficulty adjustment based on threat intelligence
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Schema for scheduled cron job (no input expected)
const AdjusterSchema = z.object({
  force_run: z.boolean().optional()
}).optional();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input (cron jobs should have empty body or optional params)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    AdjusterSchema.parse(body);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 AI Challenge Adjuster: Analyzing threat intelligence');

    // Get recent threat analysis
    const { data: latestThreat, error: threatError } = await supabaseClient
      .from('pf_threat_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (threatError && threatError.code !== 'PGRST116') throw threatError;

    if (!latestThreat) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No threat intelligence available. Run threat analysis first.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get challenge success rates
    const { data: challenges, error: challengeError } = await supabaseClient
      .from('pf_captcha_challenges')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (challengeError) throw challengeError;

    const totalChallenges = challenges?.length || 0;
    const solvedChallenges = challenges?.filter(c => c.status === 'solved').length || 0;
    const successRate = totalChallenges > 0 ? (solvedChallenges / totalChallenges) * 100 : 0;

    // Use AI to determine optimal settings
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const adjustmentPrompt = `Analyze challenge difficulty settings based on threat intelligence:

Current Threat Level: ${latestThreat.threat_level}
Threat Confidence: ${latestThreat.confidence_score}%
Anomalies Detected: ${latestThreat.anomalies_detected}
Challenge Success Rate (7 days): ${successRate.toFixed(1)}%
Total Challenges: ${totalChallenges}

Recommend challenge difficulty adjustments:
- difficulty_multiplier (0.5 to 2.0)
- timeout_seconds (10 to 60)
- max_attempts (1 to 5)

Consider:
- Higher threat = harder challenges
- Success rate too high (>85%) = increase difficulty
- Success rate too low (<40%) = decrease difficulty
- Balance security with user experience

Return ONLY a JSON object:
{
  "difficulty_multiplier": 1.2,
  "timeout_seconds": 30,
  "max_attempts": 3,
  "reasoning": "Brief explanation"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity AI optimizing bot defense challenge difficulty. Respond with pure JSON only.'
          },
          {
            role: 'user',
            content: adjustmentPrompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const recommendations = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    // Apply recommendations to defense settings
    const { error: updateError } = await supabaseClient
      .from('pf_defense_settings')
      .update({
        difficulty_multiplier: recommendations.difficulty_multiplier,
        timeout_seconds: recommendations.timeout_seconds,
        max_attempts: recommendations.max_attempts,
        last_ai_adjustment: new Date().toISOString(),
        adjustment_reasoning: recommendations.reasoning
      })
      .eq('setting_type', 'challenge_difficulty');

    if (updateError) throw updateError;

    console.log('✅ Challenge difficulty adjusted:', recommendations);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        threat_context: {
          level: latestThreat.threat_level,
          confidence: latestThreat.confidence_score,
          success_rate: successRate
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI challenge adjuster error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
