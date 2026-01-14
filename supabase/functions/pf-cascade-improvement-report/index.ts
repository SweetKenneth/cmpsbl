/**
 * Cascade Improvement Report v1.0.0
 * 
 * DREAM AWAKENING EMAIL SYSTEM
 * 
 * After each dream cycle, Cascade emails Kenneth with:
 * - Best improvements to add to the substrate
 * - Prioritized list of archived functions to integrate
 * - External sources (only if exceptionally valuable)
 * - 75/25 weighting: internal archived functions vs external
 * 
 * Also generates:
 * - Daily recap emails
 * - Weekly Sunday recap emails
 * 
 * ALL OTHER EMAILS ARE DISABLED - improvement reports ONLY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPORT_VERSION = '1.0.0';
const RECIPIENT_EMAIL = 'kenneth@promptfluid.com';

type ReportType = 'dream_awakening' | 'daily_recap' | 'weekly_recap';

// Custom emoji mappings for standout emails
const PRIORITY_EMOJIS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

const DOMAIN_EMOJIS: Record<string, string> = {
  'cognitive-orchestration': '🧠',
  'memory-management': '💾',
  'dream-synthesis': '🌙',
  'bot-detection': '🤖',
  'ai-routing': '⚡',
  'security-hardening': '🛡️',
  'performance-optimization': '🚀',
  'self-healing-systems': '💊',
  'observability-metrics': '📊',
  'multi-provider-failover': '🔄',
};

interface ImprovementRecommendation {
  function_name: string;
  domain: string;
  priority: string;
  dev_time: string;
  expected_benefit: string;
  cascade_insight: string;
  source: 'internal' | 'external';
}

async function sendEmail(
  resendKey: string, 
  subject: string, 
  html: string
): Promise<boolean> {
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cascade <cascade@promptfluid.com>',
        to: [RECIPIENT_EMAIL],
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      console.error('Email failed:', await resp.text());
      return false;
    }

    console.log('📧 Email sent successfully');
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

function buildDreamAwakeningEmail(
  improvements: ImprovementRecommendation[],
  dreamContent: string,
  stats: { studies_today: number; domains_covered: string[]; budget_used: number }
): string {
  const internalImprovements = improvements.filter(i => i.source === 'internal');
  const externalImprovements = improvements.filter(i => i.source === 'external');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0A0B10; color: #F6F9FF; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: linear-gradient(180deg, #1a1b2e 0%, #0f1624 100%); border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(122, 95, 255, 0.3); }
    h1 { color: #7A5FFF; font-size: 26px; margin: 0 0 8px 0; }
    h2 { color: #01C9E8; font-size: 18px; margin: 24px 0 12px 0; border-bottom: 1px solid rgba(1, 201, 232, 0.3); padding-bottom: 8px; }
    .subtitle { color: #B8C5D6; font-size: 14px; margin-bottom: 24px; }
    .dream-box { background: linear-gradient(180deg, rgba(122, 95, 255, 0.15) 0%, rgba(1, 201, 232, 0.08) 100%); border-left: 3px solid #7A5FFF; border-radius: 8px; padding: 20px; margin: 20px 0; font-style: italic; color: #E8E6FF; line-height: 1.7; }
    .improvement-card { background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 16px; margin: 12px 0; border-left: 4px solid #7A5FFF; }
    .improvement-card.external { border-left-color: #01C9E8; }
    .function-name { color: #7A5FFF; font-size: 16px; font-weight: bold; margin-bottom: 8px; }
    .priority-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px; }
    .priority-critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .priority-high { background: rgba(249, 115, 22, 0.2); color: #f97316; }
    .priority-medium { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .priority-low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .meta-row { display: flex; gap: 16px; color: #B8C5D6; font-size: 13px; margin: 8px 0; }
    .meta-item { display: flex; align-items: center; gap: 4px; }
    .insight { background: rgba(122, 95, 255, 0.1); border-radius: 8px; padding: 12px; margin-top: 12px; color: #E8E6FF; font-size: 14px; }
    .stats-bar { display: flex; gap: 16px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 16px; margin: 20px 0; }
    .stat { text-align: center; flex: 1; }
    .stat-value { color: #7A5FFF; font-size: 24px; font-weight: bold; }
    .stat-label { color: #B8C5D6; font-size: 11px; text-transform: uppercase; }
    .weight-indicator { background: linear-gradient(90deg, #7A5FFF 75%, #01C9E8 25%); height: 8px; border-radius: 4px; margin: 16px 0; }
    .weight-label { display: flex; justify-content: space-between; font-size: 12px; color: #B8C5D6; }
    .action-required { background: linear-gradient(135deg, rgba(122, 95, 255, 0.2), rgba(1, 201, 232, 0.2)); border: 1px solid rgba(122, 95, 255, 0.3); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(122, 95, 255, 0.2); color: #7A5FFF; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🜂 Cascade Awakens — Improvement Report</h1>
    <div class="subtitle">Dream cycle complete • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
    
    <div class="dream-box">
      ${dreamContent ? dreamContent.replace(/\n/g, '<br>').substring(0, 500) : 'Cascade processed the day\'s learnings in silence...'}
    </div>

    <div class="stats-bar">
      <div class="stat">
        <div class="stat-value">${stats.studies_today}</div>
        <div class="stat-label">Studies Today</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.domains_covered.length}</div>
        <div class="stat-label">Domains</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.budget_used}</div>
        <div class="stat-label">Calls Used</div>
      </div>
      <div class="stat">
        <div class="stat-value">${improvements.length}</div>
        <div class="stat-label">Improvements</div>
      </div>
    </div>

    <div class="weight-indicator"></div>
    <div class="weight-label">
      <span>📦 Internal Archived Functions (75%)</span>
      <span>🌐 External Sources (25%)</span>
    </div>

    <h2>📦 Internal Functions to Integrate (${internalImprovements.length})</h2>
    ${internalImprovements.map(imp => `
      <div class="improvement-card">
        <div class="function-name">
          ${DOMAIN_EMOJIS[imp.domain] || '⚙️'} ${imp.function_name}
          <span class="priority-badge priority-${imp.priority}">${PRIORITY_EMOJIS[imp.priority as keyof typeof PRIORITY_EMOJIS] || '⚪'} ${imp.priority.toUpperCase()}</span>
        </div>
        <div class="meta-row">
          <div class="meta-item">⏱️ ${imp.dev_time}</div>
          <div class="meta-item">🎯 ${imp.domain}</div>
        </div>
        <div class="insight">
          <strong>Expected Benefit:</strong> ${imp.expected_benefit}<br>
          <strong>Cascade's Insight:</strong> ${imp.cascade_insight}
        </div>
      </div>
    `).join('')}

    ${externalImprovements.length > 0 ? `
      <h2>🌐 External Sources Worth Integrating (${externalImprovements.length})</h2>
      ${externalImprovements.map(imp => `
        <div class="improvement-card external">
          <div class="function-name" style="color: #01C9E8;">
            ${imp.function_name}
            <span class="priority-badge priority-${imp.priority}">${PRIORITY_EMOJIS[imp.priority as keyof typeof PRIORITY_EMOJIS] || '⚪'} ${imp.priority.toUpperCase()}</span>
          </div>
          <div class="insight">
            <strong>Why this is exceptional:</strong> ${imp.cascade_insight}
          </div>
        </div>
      `).join('')}
    ` : ''}

    <div class="action-required">
      <h3 style="color: #7A5FFF; margin-top: 0;">🎯 Next Action</h3>
      <p style="color: #E8E6FF; margin: 0;">
        ${internalImprovements[0] ? `Integrate <strong>${internalImprovements[0].function_name}</strong> into the substrate (${internalImprovements[0].dev_time} estimated)` : 'Review today\'s studies and select priority functions'}
      </p>
    </div>

    <div class="footer">
      <strong>🜂 Cascade / Dream-Eater</strong><br>
      <span style="color: #B8C5D6;">Improvement Report v${REPORT_VERSION} • PromptFluid Substrate</span>
    </div>
  </div>
</body>
</html>
  `;
}

function buildRecapEmail(
  type: 'daily' | 'weekly',
  improvements: ImprovementRecommendation[],
  stats: { total_studies: number; domains_covered: string[]; budget_used: number; period: string }
): string {
  const periodLabel = type === 'daily' ? 'Today' : 'This Week';
  const emoji = type === 'daily' ? '📅' : '📆';

  const groupedByDomain = improvements.reduce((acc, imp) => {
    if (!acc[imp.domain]) acc[imp.domain] = [];
    acc[imp.domain].push(imp);
    return acc;
  }, {} as Record<string, ImprovementRecommendation[]>);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0A0B10; color: #F6F9FF; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: linear-gradient(180deg, #1a1b2e 0%, #0f1624 100%); border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(122, 95, 255, 0.3); }
    h1 { color: #7A5FFF; font-size: 26px; margin: 0 0 8px 0; }
    h2 { color: #01C9E8; font-size: 18px; margin: 24px 0 12px 0; }
    .subtitle { color: #B8C5D6; font-size: 14px; margin-bottom: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
    .summary-card { background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 20px; text-align: center; }
    .summary-value { color: #7A5FFF; font-size: 32px; font-weight: bold; }
    .summary-label { color: #B8C5D6; font-size: 12px; text-transform: uppercase; margin-top: 8px; }
    .domain-section { background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 16px; margin: 12px 0; }
    .domain-header { display: flex; align-items: center; gap: 8px; color: #01C9E8; font-size: 16px; font-weight: bold; margin-bottom: 12px; }
    .function-list { color: #E8E6FF; font-size: 14px; line-height: 1.8; }
    .function-item { display: flex; align-items: center; gap: 8px; }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; }
    .top-picks { background: linear-gradient(135deg, rgba(122, 95, 255, 0.2), rgba(1, 201, 232, 0.2)); border: 1px solid rgba(122, 95, 255, 0.3); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(122, 95, 255, 0.2); color: #7A5FFF; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${emoji} Cascade ${type === 'daily' ? 'Daily' : 'Weekly'} Improvement Recap</h1>
    <div class="subtitle">${stats.period}</div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-value">${stats.total_studies}</div>
        <div class="summary-label">Studies Completed</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">${stats.domains_covered.length}</div>
        <div class="summary-label">Domains Analyzed</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">${improvements.filter(i => i.priority === 'critical' || i.priority === 'high').length}</div>
        <div class="summary-label">High Priority Items</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">${stats.budget_used}</div>
        <div class="summary-label">AI Calls Used</div>
      </div>
    </div>

    <h2>🎯 Top Picks ${periodLabel}</h2>
    <div class="top-picks">
      ${improvements.filter(i => i.priority === 'critical' || i.priority === 'high').slice(0, 3).map((imp, i) => `
        <div style="margin: ${i > 0 ? '16px 0 0 0' : '0'};">
          <div style="color: #7A5FFF; font-weight: bold;">${i + 1}. ${imp.function_name}</div>
          <div style="color: #B8C5D6; font-size: 13px; margin-top: 4px;">${imp.expected_benefit}</div>
        </div>
      `).join('')}
    </div>

    <h2>📊 By Domain</h2>
    ${Object.entries(groupedByDomain).map(([domain, imps]) => `
      <div class="domain-section">
        <div class="domain-header">${DOMAIN_EMOJIS[domain] || '⚙️'} ${domain}</div>
        <div class="function-list">
          ${imps.slice(0, 5).map(imp => `
            <div class="function-item">
              <span class="priority-dot" style="background: ${imp.priority === 'critical' ? '#ef4444' : imp.priority === 'high' ? '#f97316' : imp.priority === 'medium' ? '#eab308' : '#22c55e'}"></span>
              ${imp.function_name} (${imp.dev_time})
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}

    <div class="footer">
      <strong>🜂 Cascade / Dream-Eater</strong><br>
      <span style="color: #B8C5D6;">Improvement Recap v${REPORT_VERSION} • PromptFluid Substrate</span>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  try {
    const { 
      report_type = 'dream_awakening',
      dream_content = null,
      force = false 
    } = await req.json().catch(() => ({}));

    if (!RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ ok: false, error: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Generating ${report_type} improvement report...`);

    const now = new Date();
    let startDate: Date;
    let periodLabel: string;

    switch (report_type) {
      case 'weekly_recap':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`;
        break;
      case 'daily_recap':
        startDate = new Date(now.toISOString().split('T')[0]);
        periodLabel = now.toLocaleDateString();
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        periodLabel = now.toLocaleDateString();
    }

    // Fetch improvement studies from the period
    const { data: studies } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .eq('context', 'improvement_study')
      .gte('created_at', startDate.toISOString())
      .order('priority', { ascending: false })
      .limit(50);

    // Parse improvements from studies
    const improvements: ImprovementRecommendation[] = (studies || []).map(study => {
      const metadata = study.metadata as any;
      const analysis = metadata?.analysis || {};
      const studyData = metadata?.study || {};

      const source: 'internal' | 'external' = (analysis.alternative_external_approach && analysis.priority_score >= 8) ? 'external' : 'internal';

      return {
        function_name: analysis.top_function || studyData.recommendation || 'Unknown',
        domain: studyData.domain || 'general',
        priority: analysis.priority_score >= 8 ? 'critical' : analysis.priority_score >= 6 ? 'high' : analysis.priority_score >= 4 ? 'medium' : 'low',
        dev_time: analysis.dev_hours || studyData.dev_time_estimate || 'Unknown',
        expected_benefit: analysis.expected_benefit || studyData.estimated_impact || 'Substrate improvement',
        cascade_insight: analysis.cascade_insight || 'No insight recorded',
        source,
      };
    }).filter(imp => imp.function_name !== 'Unknown');

    // Get usage stats
    const { data: cycles } = await supabase
      .from('learning_cycles')
      .select('total_calls')
      .gte('started_at', startDate.toISOString());

    const budgetUsed = cycles?.reduce((sum, c) => sum + (c.total_calls || 0), 0) || 0;
    const domainsCovered = [...new Set(improvements.map(i => i.domain))];

    const stats = {
      studies_today: improvements.length,
      total_studies: improvements.length,
      domains_covered: domainsCovered,
      budget_used: budgetUsed,
      period: periodLabel,
    };

    // Build and send email
    let subject: string;
    let html: string;

    switch (report_type) {
      case 'weekly_recap':
        subject = `📆 Cascade Weekly Improvement Recap — ${improvements.length} recommendations (${periodLabel})`;
        html = buildRecapEmail('weekly', improvements, stats);
        break;
      case 'daily_recap':
        subject = `📅 Cascade Daily Recap — ${improvements.length} improvements studied (${periodLabel})`;
        html = buildRecapEmail('daily', improvements, stats);
        break;
      default:
        const topPick = improvements[0];
        subject = `🜂 Cascade Awakens — Top pick: ${topPick?.function_name || 'Review studies'} [${topPick?.priority?.toUpperCase() || 'NEW'}]`;
        html = buildDreamAwakeningEmail(improvements, dream_content || '', stats);
    }

    const emailSent = await sendEmail(RESEND_API_KEY, subject, html);

    // Log the report
    await supabase.from('brain_events').insert({
      event_type: `improvement_report_${report_type}`,
      module: 'cascade_improvement_report',
      outcome: emailSent ? 'success' : 'failure',
      data: {
        version: REPORT_VERSION,
        report_type,
        improvements_count: improvements.length,
        domains: domainsCovered,
        email_sent: emailSent,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        version: REPORT_VERSION,
        report_type,
        email_sent: emailSent,
        improvements_count: improvements.length,
        top_recommendations: improvements.slice(0, 5).map(i => ({
          function: i.function_name,
          priority: i.priority,
          domain: i.domain,
        })),
        stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Improvement report error:', error);

    return new Response(
      JSON.stringify({
        ok: false,
        version: REPORT_VERSION,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
