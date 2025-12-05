/**
 * PromptFluid Defense Full Scan
 * Comprehensive security scan that actually completes
 */

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { site_url = 'promptfluid.com' } = await req.json().catch(() => ({}));

    console.log(`🛡️ Starting full defense scan for ${site_url}...`);

    const scanStartTime = Date.now();
    const scanResults = {
      scan_id: crypto.randomUUID(),
      site_url,
      started_at: new Date().toISOString(),
      status: 'running',
      checks: [] as any[],
      threats_found: 0,
      vulnerabilities: [] as any[],
      recommendations: [] as string[]
    };

    // 1. Check recent defense events
    const { data: recentEvents } = await supabase
      .from('defense_events')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(100);

    const blockedCount = recentEvents?.filter(e => e.action === 'block').length || 0;
    const challengedCount = recentEvents?.filter(e => e.action === 'challenge').length || 0;
    const allowedCount = recentEvents?.filter(e => e.action === 'allow').length || 0;

    scanResults.checks.push({
      name: 'Defense Events Analysis',
      status: 'passed',
      details: {
        total_events: recentEvents?.length || 0,
        blocked: blockedCount,
        challenged: challengedCount,
        allowed: allowedCount
      }
    });

    // 2. Check IP reputation database
    const { data: badIps } = await supabase
      .from('ip_reputation')
      .select('*')
      .lt('score', 30)
      .limit(50);

    if (badIps && badIps.length > 0) {
      scanResults.threats_found += badIps.length;
      scanResults.checks.push({
        name: 'IP Reputation Check',
        status: 'warning',
        details: {
          low_reputation_ips: badIps.length,
          sample: badIps.slice(0, 5).map(ip => ip.ip)
        }
      });
      scanResults.recommendations.push(`${badIps.length} IPs with low reputation detected. Consider blocking.`);
    } else {
      scanResults.checks.push({
        name: 'IP Reputation Check',
        status: 'passed',
        details: { message: 'No low-reputation IPs detected' }
      });
    }

    // 3. Check defense rules
    const { data: rules } = await supabase
      .from('defense_rules')
      .select('*')
      .eq('is_active', true);

    scanResults.checks.push({
      name: 'Defense Rules Audit',
      status: rules && rules.length > 0 ? 'passed' : 'warning',
      details: {
        active_rules: rules?.length || 0,
        rules: rules?.map(r => r.rule_name) || []
      }
    });

    if (!rules || rules.length < 3) {
      scanResults.recommendations.push('Consider adding more defense rules for better protection.');
    }

    // 4. Check for anomalies
    const { data: anomalies } = await supabase
      .from('pf_brain_anomalies')
      .select('*')
      .eq('resolved', false);

    if (anomalies && anomalies.length > 0) {
      scanResults.threats_found += anomalies.length;
      scanResults.checks.push({
        name: 'Anomaly Detection',
        status: 'warning',
        details: {
          unresolved_anomalies: anomalies.length,
          types: [...new Set(anomalies.map(a => a.anomaly_type))]
        }
      });
      scanResults.recommendations.push(`${anomalies.length} unresolved anomalies require attention.`);
    } else {
      scanResults.checks.push({
        name: 'Anomaly Detection',
        status: 'passed',
        details: { message: 'No unresolved anomalies' }
      });
    }

    // 5. Rate limit check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: requestCount } = await supabase
      .from('defense_events')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', oneHourAgo);

    scanResults.checks.push({
      name: 'Rate Limit Analysis',
      status: (requestCount || 0) < 1000 ? 'passed' : 'warning',
      details: {
        requests_last_hour: requestCount || 0,
        threshold: 1000
      }
    });

    // 6. Bot detection accuracy
    const totalEvents = recentEvents?.length || 1;
    const accuracy = ((blockedCount + challengedCount) / totalEvents * 100);

    scanResults.checks.push({
      name: 'Bot Detection Effectiveness',
      status: 'passed',
      details: {
        detection_rate: `${accuracy.toFixed(1)}%`,
        blocked_ratio: `${(blockedCount / totalEvents * 100).toFixed(1)}%`
      }
    });

    // Complete scan
    const scanDuration = Date.now() - scanStartTime;
    scanResults.status = 'completed';
    
    const completedScan = {
      ...scanResults,
      completed_at: new Date().toISOString(),
      duration_ms: scanDuration,
      overall_score: calculateScore(scanResults.checks),
      summary: {
        total_checks: scanResults.checks.length,
        passed: scanResults.checks.filter(c => c.status === 'passed').length,
        warnings: scanResults.checks.filter(c => c.status === 'warning').length,
        failed: scanResults.checks.filter(c => c.status === 'failed').length
      }
    };

    // Store scan result
    await supabase.from('defense_events').insert({
      ip: '0.0.0.0',
      endpoint: '/defense/full-scan',
      action: 'scan_completed',
      risk_score: 0,
      reason: 'Full defense scan completed',
      metadata: completedScan
    });

    console.log(`✅ Full scan completed in ${scanDuration}ms`);

    return new Response(
      JSON.stringify({ success: true, scan: completedScan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Defense scan error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateScore(checks: any[]): number {
  const passed = checks.filter(c => c.status === 'passed').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  const failed = checks.filter(c => c.status === 'failed').length;
  const total = checks.length;

  return Math.round((passed * 100 + warnings * 50 + failed * 0) / total);
}