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
    const { message, userId, sessionId } = await req.json();
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

    console.log('🎭 Analyzing tone and persona for message...');

    // Analyze tone and proficiency using AI
    const analysisPrompt = `Analyze this user message and provide:
1. Emotional tone (neutral, confused, excited, frustrated, curious, urgent, calm)
2. Technical proficiency level (beginner, intermediate, advanced, unknown)
3. Urgency level (low, medium, high)
4. Inferred intent (brief description)
5. Best response style (concise, explanatory, motivational, technical, empathetic)

User message: "${message}"

Respond in JSON format:
{
  "tone": "...",
  "tech_level": "...",
  "urgency_level": "...",
  "inferred_intent": "...",
  "response_style": "...",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert in emotional intelligence and communication analysis. Respond only with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    // Handle rate limits gracefully
    if (!response.ok) {
      console.log(`⚠️ AI provider unavailable (${response.status}), using fallback defaults`);
      
      // Return fallback analysis when rate limited
      const fallbackAnalysis = {
        tone: 'neutral',
        tech_level: 'unknown',
        urgency_level: 'medium',
        inferred_intent: 'general inquiry',
        response_style: 'explanatory',
        confidence: 0.5,
        reasoning: 'Using default analysis due to provider unavailability'
      };

      return new Response(
        JSON.stringify({ 
          success: true,
          analysis: fallbackAnalysis,
          reasoning: fallbackAnalysis.reasoning,
          fallback_used: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      tone: 'neutral',
      tech_level: 'unknown',
      urgency_level: 'low',
      inferred_intent: 'general inquiry',
      response_style: 'explanatory',
      confidence: 0.5
    };

    // Store persona state
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: personaState, error } = await supabaseClient
      .from('brain_persona_state')
      .insert({
        user_id: userId || 'anonymous',
        session_id: sessionId,
        tone: analysis.tone,
        tech_level: analysis.tech_level,
        urgency_level: analysis.urgency_level,
        inferred_intent: analysis.inferred_intent,
        response_style: analysis.response_style,
        confidence: analysis.confidence
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Persona analyzed: ${analysis.tone} tone, ${analysis.tech_level} level, ${analysis.response_style} style`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: personaState,
        reasoning: analysis.reasoning
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log('⚠️ Tone detection error, using defaults:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return success with fallback instead of error
    const fallbackAnalysis = {
      tone: 'neutral',
      tech_level: 'unknown',
      urgency_level: 'medium',
      inferred_intent: 'general inquiry',
      response_style: 'explanatory',
      confidence: 0.5,
      reasoning: 'Using default analysis due to processing error'
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: fallbackAnalysis,
        reasoning: fallbackAnalysis.reasoning,
        fallback_used: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
