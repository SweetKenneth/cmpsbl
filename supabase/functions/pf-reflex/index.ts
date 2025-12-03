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

    // Require authentication
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, ...params } = await req.json();

    console.log(`[pf-reflex] Action: ${action}`);

    switch (action) {
      case 'detect': {
        const { fingerprint, behavior } = params;
        const riskScore = Math.random() * 100;
        
        await supabase.from('detection_logs').insert({
          fingerprint,
          risk_score: riskScore,
          behavior_data: behavior,
          detected_at: new Date().toISOString()
        });

        return new Response(JSON.stringify({
          success: true,
          is_bot: riskScore > 70,
          risk_score: riskScore,
          action: riskScore > 70 ? 'block' : 'allow'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'analyze': {
        const { session_id, events } = params;
        const analysis = {
          human_score: 0.85,
          bot_indicators: [],
          recommendation: 'allow'
        };
        return new Response(JSON.stringify({ success: true, analysis }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'threat_intel': {
        const { data: threats } = await supabase.from('threat_intelligence')
          .select('*')
          .order('severity', { ascending: false })
          .limit(params.limit || 10);
        return new Response(JSON.stringify({ success: true, threats }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'report': {
        const { data: stats } = await supabase.from('detection_logs')
          .select('*')
          .gte('detected_at', params.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        return new Response(JSON.stringify({ success: true, report: { total: stats?.length || 0 } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'ip_reputation': {
        const { ip } = params;
        const { data } = await supabase.from('ip_reputation')
          .select('*')
          .eq('ip', ip)
          .single();
        return new Response(JSON.stringify({ success: true, reputation: data || { score: 50 } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error('[pf-reflex] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
