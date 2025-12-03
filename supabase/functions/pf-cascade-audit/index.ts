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
    // Service role authentication - only internal services can call this
    const authHeader = req.headers.get('Authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (providedKey !== SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('❌ Unauthorized cascade audit attempt');
      return new Response(
        JSON.stringify({ error: 'Forbidden - Service role authentication required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY
    );

    const { audit_type = 'full' } = await req.json();

    console.log('🔍 Running Cascade capability audit...');

    // Test all critical endpoints
    const endpoints = [
      'pf-nexus-image',
      'pf-nexus-video',
      'pf-nexus-text',
      'pf-brain-learn',
      'pf-brain-auto-research',
      'pf-brain-status',
      'pf-cascade-router',
    ];

    const auditResults = [];
    let successCount = 0;

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        // Simple health check call
        const { data, error } = await supabase.functions.invoke(endpoint, {
          body: { test: true, audit: true },
        });
        
        const latency = Date.now() - startTime;
        const success = !error;
        
        if (success) successCount++;
        
        auditResults.push({
          endpoint,
          status: success ? 'online' : 'error',
          latency_ms: latency,
          error: error?.message,
          tested_at: new Date().toISOString(),
        });

        console.log(`${success ? '✅' : '❌'} ${endpoint}: ${latency}ms`);
      } catch (error) {
        auditResults.push({
          endpoint,
          status: 'offline',
          latency_ms: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          tested_at: new Date().toISOString(),
        });
        console.log(`❌ ${endpoint}: offline`);
      }
    }

    const uptime_percentage = (successCount / endpoints.length) * 100;

    // Store audit results
    await supabase.from('brain_events').insert({
      module: 'cascade',
      event_type: 'capability_audit',
      data: {
        audit_type,
        endpoints_tested: endpoints.length,
        endpoints_online: successCount,
        uptime_percentage,
        results: auditResults,
      },
      outcome: uptime_percentage >= 80 ? 'healthy' : 'degraded',
    });

    console.log(`✅ Audit complete: ${successCount}/${endpoints.length} online (${uptime_percentage.toFixed(1)}%)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audit_complete: true,
        summary: {
          endpoints_tested: endpoints.length,
          endpoints_online: successCount,
          uptime_percentage,
        },
        results: auditResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Audit error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
