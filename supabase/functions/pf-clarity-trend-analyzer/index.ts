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

    const { action, site_id, period = 30 } = await req.json();

    // Verify site ownership
    const { data: site } = await supabase
      .from('pf_clarity_sites')
      .select('user_id')
      .eq('id', site_id)
      .single();

    if (!site || site.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Site not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'get_trends': {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        // Get compliance history
        const { data: history } = await supabase
          .from('pf_clarity_compliance_history')
          .select('*')
          .eq('site_id', site_id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (!history || history.length === 0) {
          return new Response(JSON.stringify({
            success: true,
            trends: {
              data: [],
              summary: {
                current_score: 0,
                score_change: 0,
                total_scans: 0,
                avg_score: 0,
              },
            },
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Calculate statistics
        const scores = history.map(h => h.compliance_score);
        const currentScore = scores[scores.length - 1];
        const firstScore = scores[0];
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Group by date for chart
        const chartData = history.map(h => ({
          date: new Date(h.recorded_at).toLocaleDateString(),
          score: h.compliance_score,
          issues: h.issues_count,
          critical: h.critical_issues,
        }));

        return new Response(JSON.stringify({
          success: true,
          trends: {
            data: chartData,
            summary: {
              current_score: currentScore,
              score_change: currentScore - firstScore,
              total_scans: history.length,
              avg_score: Math.round(avgScore * 100) / 100,
              trend: currentScore > firstScore ? 'improving' : currentScore < firstScore ? 'declining' : 'stable',
            },
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_issue_trends': {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const { data: history } = await supabase
          .from('pf_clarity_compliance_history')
          .select('*')
          .eq('site_id', site_id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (!history || history.length === 0) {
          return new Response(JSON.stringify({
            success: true,
            issue_trends: { data: [], summary: {} },
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const chartData = history.map(h => ({
          date: new Date(h.recorded_at).toLocaleDateString(),
          critical: h.critical_issues,
          warning: h.warning_issues,
          info: h.info_issues,
        }));

        const latest = history[history.length - 1];
        const first = history[0];

        return new Response(JSON.stringify({
          success: true,
          issue_trends: {
            data: chartData,
            summary: {
              critical_change: latest.critical_issues - first.critical_issues,
              warning_change: latest.warning_issues - first.warning_issues,
              info_change: latest.info_issues - first.info_issues,
              total_change: latest.issues_count - first.issues_count,
            },
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'record_history': {
        // Called after scan completion to record history
        const { scan_id } = await req.json();

        const { data: scan } = await supabase
          .from('pf_clarity_scans')
          .select('*')
          .eq('id', scan_id)
          .single();

        if (!scan) {
          return new Response(JSON.stringify({ error: 'Scan not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Count issues by severity
        const { data: issues } = await supabase
          .from('pf_clarity_issues')
          .select('severity')
          .eq('scan_id', scan_id);

        const criticalCount = issues?.filter(i => i.severity === 'critical').length || 0;
        const warningCount = issues?.filter(i => i.severity === 'warning').length || 0;
        const infoCount = issues?.filter(i => i.severity === 'info').length || 0;

        await supabase
          .from('pf_clarity_compliance_history')
          .insert({
            site_id: scan.site_id,
            scan_id: scan.id,
            compliance_score: scan.compliance_score,
            issues_count: issues?.length || 0,
            critical_issues: criticalCount,
            warning_issues: warningCount,
            info_issues: infoCount,
            wcag_level: scan.wcag_level,
          });

        return new Response(JSON.stringify({ success: true }), {
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
    console.error('Trend analyzer error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
