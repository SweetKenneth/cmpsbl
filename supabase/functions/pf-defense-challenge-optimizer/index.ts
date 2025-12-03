import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ChallengeOptimizerSchema = z.object({
  lookbackDays: z.number().int().min(1).max(30).optional().default(7),
  targetBlockRate: z.number().min(0).max(1).optional().default(0.05)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const validation = ChallengeOptimizerSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lookbackDays, targetBlockRate } = validation.data;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) throw new Error('Unauthorized');

    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) throw new Error('Admin access required');

    console.log('Optimizing challenge settings', { lookbackDays, targetBlockRate });

    // Get recent threat stats
    const lookbackTime = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentEvents } = await supabaseClient
      .from('defense_events')
      .select('*')
      .gte('created_at', lookbackTime)
      .order('created_at', { ascending: false });

    const totalEvents = recentEvents?.length || 0;
    const challengedEvents = recentEvents?.filter(e => e.action === 'challenge').length || 0;
    const blockedEvents = recentEvents?.filter(e => e.action === 'block').length || 0;
    const avgRiskScore = recentEvents?.reduce((sum, e) => sum + e.risk_score, 0) / (totalEvents || 1);

    const adjustmentPrompt = `Analyze challenge difficulty settings based on current threat intelligence:

Current Stats (Last 7 Days):
- Total Events: ${totalEvents}
- Challenged: ${challengedEvents}
- Blocked: ${blockedEvents}
- Avg Risk Score: ${avgRiskScore.toFixed(1)}

Provide recommended challenge adjustments as JSON:
{
  "adjustments": [
    {
      "threshold": "challenge|block",
      "new_value": number (0-100),
      "reason": "explanation"
    }
  ],
  "confidence": 0-100
}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are an AI security optimizer. Provide balanced recommendations in JSON format.'
          },
          {
            role: 'user',
            content: adjustmentPrompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI adjustment failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    // Log learning data
    await supabaseClient.from('learning_logs').insert({
      event_type: 'challenge_optimization',
      project_id: 'defense_system',
      payload: {
        threat_stats: { totalEvents, challengedEvents, blockedEvents, avgRiskScore },
        recommendations
      },
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        current_stats: { totalEvents, challengedEvents, blockedEvents, avgRiskScore }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in challenge-optimizer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});