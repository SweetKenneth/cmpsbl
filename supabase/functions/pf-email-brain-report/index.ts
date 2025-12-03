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

  try {
    console.log('📧 Starting brain report email generation...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    // Get last 6 hours of data
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    
    // Fetch learning logs
    const { data: learningLogs, error: logsError } = await supabaseClient
      .from('learning_logs')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false });
    
    if (logsError) {
      console.error('Error fetching learning logs:', logsError);
    }
    
    // Fetch brain events
    const { data: brainEvents, error: eventsError } = await supabaseClient
      .from('brain_events')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false });
    
    if (eventsError) {
      console.error('Error fetching brain events:', eventsError);
    }
    
    // Fetch learning patterns
    const { data: patterns, error: patternsError } = await supabaseClient
      .from('learning_patterns')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(5);
    
    if (patternsError) {
      console.error('Error fetching patterns:', patternsError);
    }
    
    // Fetch AI learning data
    const { data: aiLearning, error: aiError } = await supabaseClient
      .from('ai_learning_data')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false });
    
    if (aiError) {
      console.error('Error fetching AI learning data:', aiError);
    }
    
    // Calculate metrics
    const totalLearningEvents = learningLogs?.length || 0;
    const totalBrainEvents = brainEvents?.length || 0;
    const totalAILearning = aiLearning?.length || 0;
    const successfulEvents = learningLogs?.filter(l => l.success).length || 0;
    const successRate = totalLearningEvents > 0 ? (successfulEvents / totalLearningEvents * 100).toFixed(1) : '0';
    
    // Get admin email from profiles or use default
    const { data: adminProfile } = await supabaseClient
      .from('profiles')
      .select('email')
      .limit(1)
      .single();
    
    const adminEmail = adminProfile?.email || 'kenneth@promptfluid.com';
    
    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0A0B10; color: #F6F9FF; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #1a1b2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(122, 95, 255, 0.2); }
    h1 { color: #7A5FFF; font-size: 28px; margin-bottom: 10px; text-shadow: 0 0 20px rgba(122, 95, 255, 0.5); }
    .subtitle { color: #01C9E8; font-size: 16px; margin-bottom: 30px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric-card { background: rgba(122, 95, 255, 0.1); border: 1px solid rgba(122, 95, 255, 0.3); border-radius: 8px; padding: 20px; text-align: center; }
    .metric-value { font-size: 36px; font-weight: bold; color: #7A5FFF; margin: 10px 0; }
    .metric-label { font-size: 14px; color: #B8C5D6; text-transform: uppercase; letter-spacing: 1px; }
    .section { margin: 30px 0; padding: 20px; background: rgba(1, 201, 232, 0.05); border-left: 4px solid #01C9E8; border-radius: 4px; }
    .section-title { color: #01C9E8; font-size: 20px; margin-bottom: 15px; }
    .pattern-item { background: rgba(246, 249, 255, 0.05); padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #7A5FFF; }
    .pattern-name { color: #F6F9FF; font-weight: bold; margin-bottom: 5px; }
    .pattern-confidence { color: #01C9E8; font-size: 14px; }
    .event-log { font-size: 13px; color: #B8C5D6; margin: 8px 0; padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(122, 95, 255, 0.3); color: #7A5FFF; font-size: 14px; }
    .status-ok { color: #00ff88; }
    .status-warning { color: #ffaa00; }
    .status-error { color: #ff4444; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 PromptFluid Brain Report</h1>
    <div class="subtitle">6-Hour Learning Cycle Summary</div>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Learning Events</div>
        <div class="metric-value ${totalLearningEvents > 0 ? 'status-ok' : 'status-error'}">${totalLearningEvents}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Brain Events</div>
        <div class="metric-value ${totalBrainEvents > 0 ? 'status-ok' : 'status-warning'}">${totalBrainEvents}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">AI Learning Cycles</div>
        <div class="metric-value ${totalAILearning > 0 ? 'status-ok' : 'status-warning'}">${totalAILearning}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Success Rate</div>
        <div class="metric-value ${parseFloat(successRate) > 80 ? 'status-ok' : 'status-warning'}">${successRate}%</div>
      </div>
    </div>
    
    ${totalLearningEvents === 0 ? `
    <div class="section">
      <div class="section-title">⚠️ No Learning Activity Detected</div>
      <p style="color: #ffaa00;">The Brain hasn't recorded any learning events in the last 6 hours. This may indicate:</p>
      <ul style="color: #B8C5D6;">
        <li>Learning functions are not being called</li>
        <li>No AI requests are being routed through Nexus</li>
        <li>Integration between Nexus and Brain may need verification</li>
      </ul>
      <p style="color: #01C9E8; margin-top: 15px;">Check the Nexus AI integration and ensure learnFromResult() is being called after AI completions.</p>
    </div>
    ` : ''}
    
    ${patterns && patterns.length > 0 ? `
    <div class="section">
      <div class="section-title">🎯 Top Learning Patterns</div>
      ${patterns.map(p => `
        <div class="pattern-item">
          <div class="pattern-name">${p.pattern_type || 'Unknown Pattern'}</div>
          <div class="pattern-confidence">Confidence: ${Math.round((p.confidence_score || 0) * 100)}% • Applied ${p.application_count || 0} times</div>
          ${p.description ? `<div style="color: #B8C5D6; font-size: 13px; margin-top: 5px;">${p.description}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${brainEvents && brainEvents.length > 0 ? `
    <div class="section">
      <div class="section-title">⚡ Recent Brain Events</div>
      ${brainEvents.slice(0, 5).map(e => `
        <div class="event-log">
          <strong>${e.event_type}</strong> • ${e.module} • ${new Date(e.created_at).toLocaleString()}
          ${e.outcome ? ` • <span style="color: ${e.outcome === 'completed' ? '#00ff88' : '#ffaa00'}">${e.outcome}</span>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="footer">
      <strong>PromptFluid Brain</strong> • AI That Flows<br>
      Next report in 6 hours • ${new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString()}
    </div>
  </div>
</body>
</html>
    `;
    
    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PromptFluid Brain <brain@promptfluid.com>',
        to: [adminEmail],
        subject: `🧠 Brain Report: ${totalLearningEvents} learning events (${successRate}% success)`,
        html: emailHtml,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('❌ Email send error:', errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }
    
    const emailResult = await emailResponse.json();
    
    console.log('✅ Brain report email sent successfully:', emailResult);
    
    // Log the report generation
    await supabaseClient.from('brain_events').insert({
      module: 'brain',
      event_type: 'report_sent',
      data: {
        email_to: adminEmail,
        learning_events: totalLearningEvents,
        brain_events: totalBrainEvents,
        success_rate: parseFloat(successRate),
        email_id: emailResult?.id,
      },
      outcome: 'completed',
    });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        email_sent: true,
        metrics: {
          learning_events: totalLearningEvents,
          brain_events: totalBrainEvents,
          ai_learning: totalAILearning,
          success_rate: successRate,
        },
        email_id: emailResult?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error generating brain report:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
