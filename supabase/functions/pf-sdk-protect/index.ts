import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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

    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: website } = await supabase
      .from('customer_websites')
      .select('*')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single();

    if (!website) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';

    let detectionScore = 0;
    const reasons: string[] = [];

    // Behavioral analysis
    if (requestData.behavioral_data) {
      const bd = requestData.behavioral_data;
      
      if (!bd.mouse_movements || bd.mouse_movements.length < 5) {
        detectionScore += 30;
        reasons.push('insufficient_mouse_activity');
      }
      if (!bd.keyboard_events || bd.keyboard_events.length === 0) {
        detectionScore += 20;
        reasons.push('no_keyboard_activity');
      }
    } else {
      detectionScore += 40;
      reasons.push('no_behavioral_data');
    }

    // Determine action
    let action: 'allow' | 'block' | 'challenge' = 'allow';
    if (detectionScore >= 70) action = 'block';
    else if (detectionScore >= 40) action = 'challenge';

    // Log event
    await supabase.from('defense_events').insert({
      ip: ipAddress,
      user_agent: req.headers.get('user-agent') || '',
      endpoint: requestData.url || '/sdk-protect',
      risk_score: detectionScore,
      action,
      reason: reasons.join(', '),
      metadata: { website_id: website.id },
    });

    return new Response(JSON.stringify({
      allowed: action === 'allow',
      action,
      score: detectionScore,
      reasons,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('SDK protect error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
