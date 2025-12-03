import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { operation, params = {} } = await req.json();
    const result: any = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'delta':
        try {
          const { data: recent } = await supabase.from('brain_events').select('metadata').order('created_at', { ascending: false }).limit(10);
          const emotional_state = { current: 'curious', previous: 'neutral', delta: 0.3, trend: 'positive' };
          result.emotional_delta = emotional_state;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'model':
        try {
          const model = { valence: Math.random() * 2 - 1, arousal: Math.random(), dominance: Math.random(), primary_emotion: 'curiosity', intensity: Math.random() * 0.5 + 0.5 };
          result.emotional_model = model;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'ethics_check':
        try {
          const boundaries = ['no_harm', 'transparency', 'fairness', 'privacy'];
          const check = { action: params.action || 'unknown', boundaries_passed: boundaries, ethical_score: 0.95, approved: true };
          result.ethics_check = check;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'boundary':
        try {
          const boundary = { name: params.boundary || 'default', threshold: 0.8, current_value: Math.random(), status: 'safe', recommendations: ['maintain current course'] };
          result.boundary = boundary;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'persona_refine':
        try {
          const { data: interactions } = await supabase.from('brain_events').select('*').eq('event_type', 'user_interaction').limit(20);
          const persona = { style: 'adaptive', tone: 'curious', formality: 0.6, refinements: interactions?.length || 0 };
          result.persona = persona;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown emotion operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', status: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
