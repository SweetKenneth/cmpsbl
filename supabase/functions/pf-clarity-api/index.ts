import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-api-key, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function verifyApiKey(apiKey: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const { data } = await supabase
    .from('pf_clarity_api_keys')
    .select('id, user_id, is_active, rate_limit_per_hour')
    .eq('api_key_hash', hashHex)
    .eq('is_active', true)
    .single();
  
  return data;
}

async function checkRateLimit(apiKeyId: string, rateLimitPerHour: number): Promise<boolean> {
  const { count } = await supabase
    .from('pf_clarity_api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', apiKeyId)
    .gte('timestamp', new Date(Date.now() - 3600000).toISOString());
  
  return (count || 0) < rateLimitPerHour;
}

async function logApiUsage(apiKeyId: string, endpoint: string, method: string, statusCode: number, responseTimeMs: number) {
  await supabase.from('pf_clarity_api_usage').insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
  });
  
  await supabase
    .from('pf_clarity_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKeyId);
}

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const keyData = await verifyApiKey(apiKey);
    if (!keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const withinLimit = await checkRateLimit(keyData.id, keyData.rate_limit_per_hour);
    if (!withinLimit) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/pf-clarity-api', '');
    const method = req.method;

    let response: Response;
    let statusCode = 200;

    if (path.startsWith('/sites')) {
      if (method === 'GET') {
        const { data } = await supabase
          .from('pf_clarity_sites')
          .select('*')
          .eq('user_id', keyData.user_id);
        response = new Response(JSON.stringify({ sites: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (method === 'POST') {
        const body = await req.json();
        const { data, error } = await supabase
          .from('pf_clarity_sites')
          .insert({ ...body, user_id: keyData.user_id })
          .select()
          .single();
        statusCode = error ? 400 : 201;
        response = new Response(JSON.stringify(error ? { error: error.message } : { site: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: statusCode,
        });
      } else {
        statusCode = 405;
        response = new Response(JSON.stringify({ error: 'Method not allowed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        });
      }
    } else if (path.startsWith('/scans')) {
      const { data } = await supabase
        .from('pf_clarity_scans')
        .select('*, pf_clarity_sites!inner(user_id)')
        .eq('pf_clarity_sites.user_id', keyData.user_id);
      response = new Response(JSON.stringify({ scans: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (path.startsWith('/issues')) {
      const scanId = url.searchParams.get('scan_id');
      const query = supabase
        .from('pf_clarity_issues')
        .select('*, pf_clarity_scans!inner(site_id, pf_clarity_sites!inner(user_id))')
        .eq('pf_clarity_scans.pf_clarity_sites.user_id', keyData.user_id);
      
      if (scanId) query.eq('scan_id', scanId);
      
      const { data } = await query;
      response = new Response(JSON.stringify({ issues: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      statusCode = 404;
      response = new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const responseTime = Date.now() - startTime;
    await logApiUsage(keyData.id, path, method, statusCode, responseTime);

    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
