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

    const { action, scan_id, report_type = 'full' } = await req.json();

    // Get scan data
    const { data: scan } = await supabase
      .from('pf_clarity_scans')
      .select('*, pf_clarity_sites(site_url, user_id)')
      .eq('id', scan_id)
      .single();

    if (!scan || scan.pf_clarity_sites?.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get issues with priority
    const { data: issues } = await supabase
      .from('pf_clarity_issues')
      .select(`
        *,
        pf_clarity_issue_priority(
          ai_priority_score,
          business_impact,
          fix_complexity,
          estimated_time_minutes,
          recommended_order
        )
      `)
      .eq('scan_id', scan_id)
      .order('severity', { ascending: false });

    // Generate PDF content (simplified HTML that could be converted to PDF)
    const reportHtml = generateReportHTML(scan, issues || [], report_type);

    // Store report record
    const { data: report } = await supabase
      .from('pf_clarity_reports')
      .insert({
        site_id: scan.site_id,
        scan_id: scan.id,
        report_type,
        generated_by: user.id,
        metadata: {
          issue_count: issues?.length || 0,
          compliance_score: scan.compliance_score,
        },
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      report_id: report?.id,
      html: reportHtml,
      download_url: `/api/reports/${report?.id}/download`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PDF generator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateReportHTML(scan: any, issues: any[], reportType: string): string {
  const site = scan.pf_clarity_sites;
  const critical = issues.filter(i => i.severity === 'critical').length;
  const warning = issues.filter(i => i.severity === 'warning').length;
  const info = issues.filter(i => i.severity === 'info').length;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>WCAG Compliance Report - ${site.site_url}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { border-bottom: 3px solid #7A5FFF; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #7A5FFF; margin: 0; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .summary-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
    .score { font-size: 48px; font-weight: bold; color: #7A5FFF; }
    .issue { margin: 20px 0; padding: 15px; border-left: 4px solid #ddd; }
    .critical { border-left-color: #ef4444; }
    .warning { border-left-color: #f59e0b; }
    .info { border-left-color: #3b82f6; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WCAG Compliance Report</h1>
    <p><strong>Site:</strong> ${site.site_url}</p>
    <p><strong>Scan Date:</strong> ${new Date(scan.created_at).toLocaleString()}</p>
    <p><strong>WCAG Level:</strong> ${scan.wcag_level.toUpperCase()}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="score">${scan.compliance_score}%</div>
      <p>Compliance Score</p>
    </div>
    <div class="summary-card">
      <div class="score">${issues.length}</div>
      <p>Total Issues</p>
    </div>
    <div class="summary-card">
      <div class="score">${critical}</div>
      <p>Critical Issues</p>
    </div>
  </div>

  <h2>Issue Breakdown</h2>
  <p>Critical: ${critical} | Warning: ${warning} | Info: ${info}</p>

  ${reportType === 'full' ? `
  <h2>Detailed Issues</h2>
  ${issues.map(issue => `
    <div class="issue ${issue.severity}">
      <h3>${issue.issue_type.replace(/_/g, ' ').toUpperCase()}</h3>
      <p><strong>Severity:</strong> ${issue.severity.toUpperCase()}</p>
      <p><strong>Element:</strong> ${issue.element_selector || 'N/A'}</p>
      <p><strong>Description:</strong> ${issue.description || 'No description'}</p>
      ${issue.pf_clarity_issue_priority ? `
        <p><strong>Priority Score:</strong> ${issue.pf_clarity_issue_priority.ai_priority_score}/100</p>
        <p><strong>Fix Complexity:</strong> ${issue.pf_clarity_issue_priority.fix_complexity || 'Unknown'}</p>
        <p><strong>Estimated Time:</strong> ${issue.pf_clarity_issue_priority.estimated_time_minutes || 'Unknown'} min</p>
      ` : ''}
    </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    <p>Generated by PromptFluid Clarity | ${new Date().toLocaleString()}</p>
    <p>This report provides an automated analysis of WCAG compliance. Manual review is recommended.</p>
  </div>
</body>
</html>
  `.trim();
}
