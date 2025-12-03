/**
 * PromptFluid Defense Diagnostics
 * Performs comprehensive diagnostic checks on protected sites
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DiagnosticsSchema = z.object({
  site_ids: z.array(z.string().uuid()).max(50).optional(),
  report_type: z.enum(['manual', 'scheduled', 'automated']).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const validation = DiagnosticsSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { site_ids, report_type } = validation.data;

    console.log('🔍 Running Defense diagnostics for sites:', site_ids);

    // Get sites to check
    let query = supabaseClient.from('pf_protected_sites').select('*');
    
    if (site_ids && site_ids.length > 0) {
      query = query.in('id', site_ids);
    }

    const { data: sites, error: sitesError } = await query;
    
    if (sitesError) throw sitesError;

    const reports = [];
    
    for (const site of sites || []) {
      const checks = [];

      // API Key Check
      checks.push({
        name: 'API Key Validity',
        status: site.api_key ? 'pass' : 'fail',
        message: site.api_key ? 'API key configured' : 'No API key found'
      });

      // Defense Status Check
      checks.push({
        name: 'Defense Protection',
        status: site.defense_enabled ? 'pass' : 'warning',
        message: site.defense_enabled ? 'Protection active' : 'Protection disabled'
      });

      // Bot Detection Check
      checks.push({
        name: 'Bot Detection',
        status: site.bot_detection_enabled ? 'pass' : 'warning',
        message: site.bot_detection_enabled ? 'Bot detection active' : 'Bot detection disabled'
      });

      // Rate Limiting Check
      checks.push({
        name: 'Rate Limiting',
        status: site.rate_limit_enabled ? 'pass' : 'info',
        message: site.rate_limit_enabled ? 'Rate limiting active' : 'Rate limiting disabled'
      });

      // Calculate severity
      const failCount = checks.filter(c => c.status === 'fail').length;
      const warnCount = checks.filter(c => c.status === 'warning').length;
      const severity = failCount > 0 ? 'critical' : warnCount > 0 ? 'warning' : 'info';

      const report = {
        site_id: site.id,
        site_name: site.name,
        report_type: report_type || 'manual',
        status: 'completed',
        severity,
        error_count: failCount,
        warning_count: warnCount,
        info_count: checks.filter(c => c.status === 'info' || c.status === 'pass').length,
        report_data: {
          checks,
          timestamp: new Date().toISOString(),
          site_url: site.url
        }
      };

      const { error: insertError } = await supabaseClient
        .from('pf_diagnostic_reports')
        .insert(report);

      if (insertError) {
        console.error('Failed to insert report:', insertError);
      } else {
        reports.push(report);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reports,
        message: `Diagnostics completed for ${reports.length} site(s)` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Defense diagnostics error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
