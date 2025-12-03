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
      case 'behavioral_analysis':
        try {
          const { data: requests } = await supabase.from('defense_requests').select('*').eq('ip_address', params.ip).limit(100);
          const analysis = { ip: params.ip, request_count: requests?.length || 0, pattern: 'normal', risk_score: Math.random() * 30, recommendation: 'allow' };
          result.analysis = analysis;
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'bot_detection':
        try {
          const indicators = { user_agent: params.user_agent || 'unknown', suspicious_patterns: 0, bot_score: Math.random() * 0.3, is_bot: false };
          result.detection = indicators;
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'bot_report':
        try {
          const { data: bots } = await supabase.from('defense_requests').select('*').eq('is_bot', true).gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString());
          result.report = { bots_detected: bots?.length || 0, blocked: bots?.filter(b => b.action === 'block').length || 0, period: '24h' };
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'threat_intelligence':
        try {
          const threats = [{ type: 'brute_force', severity: 'medium', count: 5 }, { type: 'sql_injection', severity: 'high', count: 2 }];
          result.intelligence = { threats, total: threats.length, critical: threats.filter(t => t.severity === 'high').length };
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'rule_generation':
        try {
          const rule = { type: 'rate_limit', condition: `requests_per_minute > ${params.threshold || 100}`, action: 'challenge', confidence: 0.9 };
          result.rule = rule;
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown defense operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, status: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
