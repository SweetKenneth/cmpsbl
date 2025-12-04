import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = await req.json();

    switch (action) {
      case 'get_portfolio_overview': {
        const { data: sites } = await supabase
          .from('pf_clarity_sites')
          .select(`
            id,
            site_url,
            pf_clarity_scans!inner(
              compliance_score,
              status,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { foreignTable: 'pf_clarity_scans', ascending: false });

        const siteStats = [];
        for (const site of sites || []) {
          const latestScan = site.pf_clarity_scans?.[0] as { id?: string; compliance_score?: number; status?: string; created_at?: string } | undefined;
          
          const { data: issues } = await supabase
            .from('pf_clarity_issues')
            .select('severity, scan_id')
            .eq('scan_id', (latestScan as any)?.id || '');

          const criticalCount = issues?.filter(i => i.severity === 'critical').length || 0;

          siteStats.push({
            site_id: site.id,
            site_url: site.site_url,
            compliance_score: latestScan?.compliance_score || 0,
            total_issues: issues?.length || 0,
            critical_issues: criticalCount,
            last_scan: latestScan?.created_at,
          });
        }

        const avgScore = siteStats.reduce((sum, s) => sum + s.compliance_score, 0) / (siteStats.length || 1);
        const totalIssues = siteStats.reduce((sum, s) => sum + s.total_issues, 0);
        const totalCritical = siteStats.reduce((sum, s) => sum + s.critical_issues, 0);
        const sitesAbove80 = siteStats.filter(s => s.compliance_score >= 80).length;

        return new Response(JSON.stringify({
          success: true,
          overview: {
            total_sites: siteStats.length,
            avg_compliance_score: Math.round(avgScore * 100) / 100,
            total_issues: totalIssues,
            critical_issues: totalCritical,
            sites_above_threshold: sitesAbove80,
          },
          sites: siteStats,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'compare_sites': {
        const { site_ids } = await req.json();

        const comparison = [];
        for (const siteId of site_ids) {
          const { data: site } = await supabase
            .from('pf_clarity_sites')
            .select('id, site_url')
            .eq('id', siteId)
            .eq('user_id', user.id)
            .single();

          if (!site) continue;

          const { data: scans } = await supabase
            .from('pf_clarity_scans')
            .select('*')
            .eq('site_id', siteId)
            .order('created_at', { ascending: false })
            .limit(1);

          const latestScan = scans?.[0];

          const { data: issues } = await supabase
            .from('pf_clarity_issues')
            .select('*')
            .eq('scan_id', latestScan?.id || '');

          const issuesByType: Record<string, number> = {};
          issues?.forEach(issue => {
            issuesByType[issue.issue_type] = (issuesByType[issue.issue_type] || 0) + 1;
          });

          comparison.push({
            site_id: site.id,
            site_url: site.site_url,
            compliance_score: latestScan?.compliance_score || 0,
            total_issues: issues?.length || 0,
            issues_by_severity: {
              critical: issues?.filter(i => i.severity === 'critical').length || 0,
              warning: issues?.filter(i => i.severity === 'warning').length || 0,
              info: issues?.filter(i => i.severity === 'info').length || 0,
            },
            issues_by_type: issuesByType,
            last_scan: latestScan?.created_at,
          });
        }

        return new Response(JSON.stringify({
          success: true,
          comparison,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Portfolio compare error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
