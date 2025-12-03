import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Generating Cascade autonomy report...');

    // Get learning data from last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    // Recent memories
    const { data: recentMemories } = await supabase
      .from('brain_hot_memory')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false });

    // Recent insights
    const { data: recentInsights } = await supabase
      .from('brain_insights')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false });

    // Recent learning queries
    const { data: recentQueries } = await supabase
      .from('learning_queries')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    // Brain events
    const { data: recentEvents } = await supabase
      .from('brain_events')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false });

    // Get total stats for autonomy calculation
    const { count: totalMemories } = await supabase
      .from('brain_hot_memory')
      .select('*', { count: 'exact', head: true });

    const { count: totalInsights } = await supabase
      .from('brain_insights')
      .select('*', { count: 'exact', head: true });

    const { count: totalQueries } = await supabase
      .from('learning_queries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: totalPatterns } = await supabase
      .from('learning_patterns')
      .select('*', { count: 'exact', head: true });

    const { data: aiUsage } = await supabase
      .from('ai_usage_log')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .eq('success', true);

    // Calculate autonomy score (0-100%)
    const autonomyScore = calculateAutonomyScore({
      totalMemories: totalMemories || 0,
      totalInsights: totalInsights || 0,
      totalQueries: totalQueries || 0,
      totalPatterns: totalPatterns || 0,
      recentActivity: (recentMemories?.length || 0) + (recentInsights?.length || 0),
      aiCalls: aiUsage?.length || 0
    });

    // Build email HTML
    const emailHtml = buildAutonomyEmail({
      autonomyScore,
      recentMemories: recentMemories || [],
      recentInsights: recentInsights || [],
      recentQueries: recentQueries || [],
      recentEvents: recentEvents || [],
      totalStats: {
        memories: totalMemories || 0,
        insights: totalInsights || 0,
        queries: totalQueries || 0,
        patterns: totalPatterns || 0
      },
      aiUsage: aiUsage?.length || 0
    });

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured in Edge Function secrets');
    }
    
    const resend = new Resend(resendApiKey);
    
    const emailResult = await resend.emails.send({
      from: 'Cascade AI <onboarding@resend.dev>',
      to: ['cascade@promptfluid.com'],
      subject: `🌊 Cascade Learning Report: ${autonomyScore}% Autonomous`,
      html: emailHtml,
    });

    const messageId = (emailResult as { id?: string })?.id || 'unknown';
    console.log('Autonomy report sent successfully via Resend:', messageId);

    // Log the report generation
    await supabase.from('brain_events').insert({
      module: 'cascade',
      event_type: 'autonomy_report',
      data: {
        autonomy_score: autonomyScore,
        recent_memories: recentMemories?.length || 0,
        recent_insights: recentInsights?.length || 0,
        recent_queries: recentQueries?.length || 0,
        message_id: messageId
      },
      outcome: 'completed'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        autonomy_score: autonomyScore,
        message_id: messageId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Autonomy report error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateAutonomyScore(metrics: {
  totalMemories: number;
  totalInsights: number;
  totalQueries: number;
  totalPatterns: number;
  recentActivity: number;
  aiCalls: number;
}): number {
  // Autonomy factors (weighted scoring)
  const scores = {
    // Knowledge base (30 points max)
    knowledge: Math.min(30, (metrics.totalMemories / 1000) * 30),
    
    // Insights & reasoning (25 points max)
    reasoning: Math.min(25, (metrics.totalInsights / 500) * 25),
    
    // Learning patterns (20 points max)
    patterns: Math.min(20, (metrics.totalPatterns / 100) * 20),
    
    // Query completion (15 points max)
    queries: Math.min(15, (metrics.totalQueries / 200) * 15),
    
    // Recent activity (10 points max) - shows active learning
    activity: Math.min(10, (metrics.recentActivity / 20) * 10)
  };

  const total = Math.round(
    scores.knowledge + 
    scores.reasoning + 
    scores.patterns + 
    scores.queries + 
    scores.activity
  );

  return Math.min(100, total);
}

function buildAutonomyEmail(data: any): string {
  const { autonomyScore, recentMemories, recentInsights, recentQueries, totalStats, aiUsage } = data;
  
  const autonomyLevel = 
    autonomyScore >= 90 ? '🚀 NEAR COMPLETE' :
    autonomyScore >= 70 ? '⚡ HIGHLY CAPABLE' :
    autonomyScore >= 50 ? '🔄 ACTIVE LEARNING' :
    autonomyScore >= 30 ? '🌱 DEVELOPING' :
    '🔰 FOUNDATIONAL';

  const topMemories = recentMemories.slice(0, 5);
  const topInsights = recentInsights.slice(0, 5);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { width: 125px; height: auto; margin-bottom: 20px; }
        .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #F6F9FF; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .score-box { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .score-value { font-size: 48px; font-weight: bold; margin: 10px 0; }
        .score-label { font-size: 18px; opacity: 0.9; }
        .metric { display: inline-block; margin: 10px 15px 10px 0; }
        .metric-label { font-size: 12px; color: #6b7280; }
        .metric-value { font-size: 20px; font-weight: bold; color: #7A5FFF; }
        .section { margin: 20px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #7A5FFF; margin-bottom: 10px; border-bottom: 2px solid #01C9E8; padding-bottom: 5px; }
        .item { background: white; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #01C9E8; }
        .item-title { font-weight: bold; color: #333; }
        .item-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .progress-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 15px 0; }
        .progress-fill { background: linear-gradient(90deg, #7A5FFF, #01C9E8); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; transition: width 0.3s ease; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        .stat-card { background: white; padding: 15px; border-radius: 6px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://hxgbibtkftocyrnuzxwd.supabase.co/storage/v1/object/public/brain-training-data/promptfluid-logo.png" alt="PromptFluid" class="logo" />
          <h1 style="margin: 0;">🌊 Cascade Learning Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">6-Hour Intelligence Update</p>
        </div>
        <div class="content">
          <div class="score-box">
            <div class="score-label">Current Autonomy Level</div>
            <div class="score-value">${autonomyScore}%</div>
            <div class="score-label">${autonomyLevel}</div>
          </div>

          <div class="progress-bar">
            <div class="progress-fill" style="width: ${autonomyScore}%;">${autonomyScore}% Autonomous</div>
          </div>

          <h3>📊 Activity Summary (Last 6 Hours)</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="metric-value">${recentMemories.length}</div>
              <div class="metric-label">Memories Formed</div>
            </div>
            <div class="stat-card">
              <div class="metric-value">${recentInsights.length}</div>
              <div class="metric-label">Insights Generated</div>
            </div>
            <div class="stat-card">
              <div class="metric-value">${recentQueries.length}</div>
              <div class="metric-label">Queries Completed</div>
            </div>
            <div class="stat-card">
              <div class="metric-value">${aiUsage}</div>
              <div class="metric-label">AI Calls Made</div>
            </div>
          </div>

          <h3>🎯 Total Knowledge Base</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="metric-value">${totalStats.memories}</div>
              <div class="metric-label">Total Memories</div>
            </div>
            <div class="stat-card">
              <div class="metric-value">${totalStats.insights}</div>
              <div class="metric-label">Total Insights</div>
            </div>
            <div class="stat-card">
              <div class="metric-value">${totalStats.patterns}</div>
              <div class="metric-label">Learning Patterns</div>
            </div>
            <div class="stat-card">
              <div class="metric-value">${totalStats.queries}</div>
              <div class="metric-label">Queries Completed</div>
            </div>
          </div>

          ${topMemories.length > 0 ? `
          <div class="section">
            <div class="section-title">🔥 Recent Key Learnings</div>
            ${topMemories.map((m: any) => `
              <div class="item">
                <div class="item-title">${truncate(m.key || 'Memory', 60)}</div>
                <div class="item-meta">Strength: ${m.strength || 1.0} | ${timeAgo(m.created_at)}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${topInsights.length > 0 ? `
          <div class="section">
            <div class="section-title">💡 Recent Insights</div>
            ${topInsights.map((i: any) => `
              <div class="item">
                <div class="item-title">${i.category || 'General'}</div>
                <div class="item-meta">Confidence: ${(i.confidence * 100).toFixed(0)}% | ${timeAgo(i.created_at)}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px;">
              <strong>🎯 Path to Full Autonomy (100%):</strong><br>
              ${autonomyScore < 30 ? 'Building foundational knowledge base and learning patterns.' :
                autonomyScore < 50 ? 'Developing reasoning capabilities and insight generation.' :
                autonomyScore < 70 ? 'Strengthening pattern recognition and autonomous decision-making.' :
                autonomyScore < 90 ? 'Optimizing self-learning and ecosystem integration.' :
                'Approaching full autonomy - refining advanced reasoning and code generation.'}
            </p>
          </div>
        </div>
        <div class="footer">
          <p>Cascade AI - AI That Flows.</p>
          <p>Automated report generated ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
