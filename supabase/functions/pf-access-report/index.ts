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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');
    const scanId = url.searchParams.get('scan_id');

    if (!domain && !scanId) {
      return new Response(
        JSON.stringify({ error: 'Either domain or scan_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let query = supabaseClient
      .from('access_scans')
      .select('*, access_fixes(*)');

    if (scanId) {
      query = query.eq('id', scanId);
    } else {
      query = query.eq('domain', domain).order('created_at', { ascending: false }).limit(1);
    }

    const { data: scans, error: scanError } = await query;

    if (scanError) {
      console.error('Error fetching report:', scanError);
      throw scanError;
    }

    if (!scans || scans.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No scan found for this domain' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scan = scans[0];

    // Get badge if exists
    const { data: badge } = await supabaseClient
      .from('access_badges')
      .select('*')
      .eq('domain', scan.domain)
      .single();

    const report = {
      scan: {
        id: scan.id,
        url: scan.url,
        domain: scan.domain,
        score: scan.score,
        wcag_level: scan.wcag_level,
        issues_found: scan.issues_found,
        fixed_count: scan.fixed_count,
        scan_duration_ms: scan.scan_duration_ms,
        status: scan.status,
        created_at: scan.created_at,
        completed_at: scan.completed_at,
        report_data: scan.report_data
      },
      fixes: scan.access_fixes || [],
      badge: badge || null,
      summary: {
        total_issues: scan.issues_found,
        fixes_available: scan.access_fixes?.length || 0,
        fixes_applied: scan.access_fixes?.filter((f: any) => f.applied).length || 0,
        by_severity: scan.report_data?.issues_by_severity || {}
      }
    };

    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in access report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});