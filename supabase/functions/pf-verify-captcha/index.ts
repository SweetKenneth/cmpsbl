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
    const { challenge_token, user_response, ip_address } = await req.json();

    if (!challenge_token || !user_response) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: challenge } = await supabase
      .from('captcha_challenges')
      .select('*')
      .eq('token', challenge_token)
      .eq('status', 'pending')
      .single();

    if (!challenge) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or expired challenge' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isCorrect = user_response.trim() === challenge.correct_answer;

    await supabase
      .from('captcha_challenges')
      .update({ 
        status: isCorrect ? 'solved' : 'failed',
        solved_at: isCorrect ? new Date().toISOString() : null,
      })
      .eq('token', challenge_token);

    if (isCorrect) {
      await supabase.from('security_events').insert({
        event_type: 'captcha_solved',
        severity: 'info',
        ip_address: ip_address || 'unknown',
        description: 'CAPTCHA challenge solved',
        metadata: { challenge_token },
      });
    }

    return new Response(JSON.stringify({ 
      success: isCorrect,
      message: isCorrect ? 'Challenge solved' : 'Incorrect answer' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Captcha verification error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
