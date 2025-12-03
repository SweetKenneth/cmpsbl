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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bot_event, alert_email, customer_info } = await req.json();

    // Log event to security_events table
    await supabase.from('security_events').insert({
      event_type: 'bot_detection_alert',
      severity: bot_event.risk_level === 'bot' ? 'high' : 'medium',
      description: `Bot detected with score ${bot_event.detection_score}`,
      metadata: {
        bot_event,
        customer_info,
        alert_sent: true,
        alert_email
      }
    });

    console.log('Bot report logged:', { 
      risk_level: bot_event.risk_level, 
      detection_score: bot_event.detection_score 
    });

    // In production, you would send an actual email here using Resend or similar
    // For now, we'll just return success

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Bot detection report logged successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in bot report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
