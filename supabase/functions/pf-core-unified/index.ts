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
    // Service role authentication - only internal systems can call this
    const authHeader = req.headers.get('Authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (providedKey !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Service role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const { operation, params = {} } = await req.json();
    const result: any = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'status':
        try {
          const { data: config } = await supabase.from('system_config').select('*').limit(1).maybeSingle();
          result.system = { status: 'operational', config: config || {} };
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'settings':
        try {
          const authHeader = req.headers.get('Authorization');
          if (!authHeader) throw new Error('Auth required');
          
          const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', params.user_id).maybeSingle();
          result.settings = settings || {};
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'usage':
        try {
          const { data: usage } = await supabase.from('api_usage').select('*').eq('user_id', params.user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 3600000).toISOString());
          result.usage = { total_calls: usage?.length || 0, records: usage || [] };
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'keys':
        try {
          const authHeader = req.headers.get('Authorization');
          if (!authHeader) throw new Error('Auth required');
          
          const { data: keys } = await supabase.from('website_api_keys').select('*').eq('user_id', params.user_id);
          result.keys = keys || [];
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      case 'subscription':
        try {
          const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', params.user_id).maybeSingle();
          result.subscription = sub || { tier: 'free' };
        } catch (e) {
          result.status = 'error';
          result.message = e.message;
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown core operation: ${operation}`;
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
