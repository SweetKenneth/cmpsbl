import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_message, conversation_history = [] } = await req.json();

    console.log('💙 Emotional Modeling: Analyzing tone and urgency...');

    const emotionalPrompt = `Analyze this user message for emotional context and urgency.

User Message: "${user_message}"

Recent conversation context: ${JSON.stringify(conversation_history.slice(-3))}

Detect:
1. EMOTIONAL_STATE: calm/excited/frustrated/anxious/confused/urgent (0-100 score each)
2. URGENCY_LEVEL: low/medium/high/critical
3. TONE_PREFERENCE: formal/casual/technical/empathetic
4. RESPONSE_PACING: quick/thorough/detailed
5. EMPATHY_REQUIRED: 0-100 score

Return JSON: { emotional_state: {}, urgency_level: "", tone_preference: "", response_pacing: "", empathy_required: 0, modulation_advice: "" }`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        messages: [
          { role: 'system', content: 'You are an emotional intelligence analyzer. Detect tone, urgency, and emotional state from text.' },
          { role: 'user', content: emotionalPrompt }
        ],
      }),
    });

    const data = await response.json();
    let emotional_model;
    
    try {
      const text = data.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      emotional_model = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        emotional_state: { calm: 70 },
        urgency_level: 'medium',
        tone_preference: 'casual',
        response_pacing: 'thorough',
        empathy_required: 50,
        modulation_advice: 'Standard response'
      };
    } catch (e) {
      console.error('Emotional parsing failed:', e);
      emotional_model = {
        emotional_state: { calm: 70 },
        urgency_level: 'medium',
        tone_preference: 'casual',
        response_pacing: 'thorough',
        empathy_required: 50,
        modulation_advice: 'Standard response'
      };
    }

    await supabase.from('brain_events').insert({
      module: 'emotional_modeling',
      event_type: 'tone_detected',
      data: { user_message, emotional_model },
      outcome: 'modeled',
    });

    console.log(`✅ Emotional model: ${emotional_model.urgency_level} urgency, ${emotional_model.empathy_required}% empathy needed`);

    return new Response(
      JSON.stringify({ success: true, emotional_model }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Emotional modeling error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
