import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Schema for health check (no input expected)
const HealthCheckSchema = z.object({
  detailed: z.boolean().optional()
}).optional();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    HealthCheckSchema.parse(body);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check database connectivity
    const { error: dbError } = await supabase
      .from('defense_events')
      .select('count')
      .limit(1);

    const dbStatus = dbError ? 'error' : 'online';

    // Check auth service
    const { error: authError } = await supabase.auth.getSession();
    const authStatus = authError ? 'error' : 'online';

    // Check edge functions
    const functionsStatus = 'online'; // If we're here, functions work

    // Get system metrics
    const { data: recentEvents } = await supabase
      .from('defense_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const totalRequests = recentEvents?.length || 0;
    const blockedRequests = recentEvents?.filter(e => e.action === 'block').length || 0;
    const avgRiskScore = recentEvents?.reduce((sum, e) => sum + e.risk_score, 0) / (totalRequests || 1);

    // Calculate overall health score
    const services = {
      database: { status: dbStatus, details: dbStatus === 'online' ? 'Operational' : 'Error' },
      auth: { status: authStatus, details: authStatus === 'online' ? 'Operational' : 'Error' },
      edge_functions: { status: functionsStatus, details: 'Operational' },
      defense_engine: { 
        status: totalRequests > 0 ? 'online' : 'idle',
        details: `${totalRequests} requests in 24h, ${blockedRequests} blocked` 
      }
    };

    const healthyServices = Object.values(services).filter(s => s.status === 'online' || s.status === 'idle').length;
    const totalServices = Object.keys(services).length;
    const overallScore = Math.round((healthyServices / totalServices) * 100);

    return new Response(
      JSON.stringify({
        services,
        metrics: {
          total_requests_24h: totalRequests,
          blocked_requests_24h: blockedRequests,
          avg_risk_score: Math.round(avgRiskScore),
          block_rate: totalRequests > 0 ? Math.round((blockedRequests / totalRequests) * 100) : 0
        },
        overallScore,
        status: overallScore >= 75 ? 'healthy' : overallScore >= 50 ? 'degraded' : 'critical',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in system-health-check:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});