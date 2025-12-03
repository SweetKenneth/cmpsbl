/**
 * PromptFluid Defense Emergency Diagnostics
 * Comprehensive emergency system health check
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  include_env: z.boolean().optional().default(false),
  check_categories: z.array(z.enum(['database', 'sites', 'events', 'config', 'performance'])).optional(),
  deep_scan: z.boolean().optional().default(false),
}).optional();

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = req.method === 'POST' ? await req.json() : {};
    const validated = RequestSchema.parse(body);
    const { include_env, check_categories, deep_scan } = validated || { 
      include_env: false, 
      deep_scan: false 
    };
    console.log('🚨 Emergency diagnostics initiated');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results: DiagnosticResult[] = [];

    // 1. Database Connection Check
    console.log('Checking database connection...');
    try {
      const { data, error } = await supabase
        .from('pf_defense_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;

      results.push({
        check: 'Database Connection',
        status: 'pass',
        details: `Latest event: ${data?.[0]?.timestamp || 'No events yet'}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      results.push({
        check: 'Database Connection',
        status: 'fail',
        details: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Active Sites Check
    console.log('Checking active protected sites...');
    try {
      const { count, error } = await supabase
        .from('pf_protected_sites')
        .select('*', { count: 'exact', head: true })
        .eq('defense_enabled', true);

      if (error) throw error;

      results.push({
        check: 'Active Protected Sites',
        status: (count || 0) > 0 ? 'pass' : 'warning',
        details: `${count || 0} sites actively protected`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      results.push({
        check: 'Active Protected Sites',
        status: 'fail',
        details: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Recent Detection Activity
    console.log('Checking recent detections...');
    try {
      const { count, error } = await supabase
        .from('pf_bot_detections')
        .select('*', { count: 'exact', head: true })
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      results.push({
        check: 'Detection Activity (24h)',
        status: 'pass',
        details: `${count || 0} detections in last 24 hours`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      results.push({
        check: 'Detection Activity',
        status: 'warning',
        details: `Could not fetch detection data`,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. API Keys Status
    console.log('Checking API key distribution...');
    try {
      const { count, error } = await supabase
        .from('pf_api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      if (error) throw error;

      results.push({
        check: 'Active API Keys',
        status: (count || 0) > 0 ? 'pass' : 'warning',
        details: `${count || 0} active API keys`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      results.push({
        check: 'Active API Keys',
        status: 'warning',
        details: `API key check failed`,
        timestamp: new Date().toISOString(),
      });
    }

    // 5. System Health Score
    const passCount = results.filter(r => r.status === 'pass').length;
    const totalChecks = results.length;
    const healthScore = Math.round((passCount / totalChecks) * 100);

    const overallStatus = healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'critical';

    // Store diagnostic report
    await supabase
      .from('pf_system_diagnostics')
      .insert({
        report_type: 'emergency',
        health_score: healthScore,
        status: overallStatus,
        results,
        timestamp: new Date().toISOString()
      });

    console.log(`✅ Emergency diagnostics complete. Health: ${healthScore}%`);

    return new Response(
      JSON.stringify({
        success: true,
        health_score: healthScore,
        overall_status: overallStatus,
        results,
        summary: `${passCount}/${totalChecks} checks passed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Emergency diagnostics error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        health_score: 0,
        overall_status: 'critical'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
