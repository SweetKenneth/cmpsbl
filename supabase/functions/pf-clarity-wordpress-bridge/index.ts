import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-install-key, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function verifySite(installKey: string) {
  const { data } = await supabase
    .from('pf_clarity_sites')
    .select('id, user_id, site_url, auto_fix_enabled, agent_enabled')
    .eq('install_key', installKey)
    .single();
  
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const installKey = req.headers.get('x-install-key');
    if (!installKey) {
      return new Response(
        JSON.stringify({ error: 'Install key required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const siteData = await verifySite(installKey);
    if (!siteData) {
      return new Response(
        JSON.stringify({ error: 'Invalid install key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'get_config': {
        return new Response(
          JSON.stringify({
            auto_fix_enabled: siteData.auto_fix_enabled,
            agent_enabled: siteData.agent_enabled,
            site_url: siteData.site_url,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'report_scan': {
        const body = await req.json();
        const { compliance_score, issues_found, issues_critical, issues } = body;

        const { data: scan, error: scanError } = await supabase
          .from('pf_clarity_scans')
          .insert({
            site_id: siteData.id,
            status: 'completed',
            compliance_score,
            issues_found,
            issues_critical,
            pages_scanned: 1,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (scanError) throw scanError;

        if (issues && issues.length > 0) {
          const issueRecords = issues.map((issue: any) => ({
            scan_id: scan.id,
            wcag_criterion: issue.wcag_criterion,
            wcag_level: issue.wcag_level,
            issue_type: issue.issue_type,
            severity: issue.severity,
            element_selector: issue.element_selector,
            element_html: issue.element_html,
            issue_description: issue.description,
            status: 'open',
          }));

          await supabase.from('pf_clarity_issues').insert(issueRecords);
        }

        // Send notification if enabled
        await supabase.functions.invoke('pf-clarity-send-notification', {
          body: {
            notification_type: 'scan_complete',
            user_id: siteData.user_id,
            scan_id: scan.id,
            data: {
              site_url: siteData.site_url,
              compliance_score,
              issues_found,
              critical_issues: issues_critical,
              dashboard_url: `https://www.promptfluid.com/clarity/scan/${scan.id}`,
            },
          },
        });

        return new Response(
          JSON.stringify({ success: true, scan_id: scan.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_agent_script': {
        return new Response(
          JSON.stringify({
            script_url: `https://www.promptfluid.com/clarity-agent.js`,
            install_key: installKey,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_stats': {
        const body = await req.json();
        await supabase
          .from('pf_clarity_sites')
          .update({
            monthly_scans_used: body.scans_used || 0,
          })
          .eq('id', siteData.id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('WordPress bridge error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
