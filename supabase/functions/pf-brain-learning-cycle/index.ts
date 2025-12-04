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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { send_email = false } = await req.json().catch(() => ({}));

    console.log('🔄 Running Cascade learning cycle...');

    // Get current cycle number
    const { data: lastCycle } = await supabaseClient
      .from('learning_cycles')
      .select('cycle_number')
      .order('cycle_number', { ascending: false })
      .limit(1)
      .single();

    const cycleNumber = (lastCycle?.cycle_number || 0) + 1;

    // Gather learning data
    const [
      { data: recentLogs },
      { data: recentMemories },
      { data: dreamSessions },
      { data: anomalies },
      { data: patterns }
    ] = await Promise.all([
      supabaseClient
        .from('learning_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseClient
        .from('brain_memories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),
      supabaseClient
        .from('dream_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseClient
        .from('pf_brain_anomalies')
        .select('*')
        .eq('resolved', false)
        .limit(10),
      supabaseClient
        .from('learning_patterns')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(10)
    ]);

    // Process insights
    const insights = [];
    
    // Analyze learning logs
    const successfulLearnings = (recentLogs || []).filter(l => l.success).length;
    const failedLearnings = (recentLogs || []).filter(l => !l.success).length;
    insights.push(`Learning Success Rate: ${(successfulLearnings / Math.max(1, recentLogs?.length || 1) * 100).toFixed(1)}%`);

    // Analyze dream sessions
    const approvedDreams = (dreamSessions || []).filter(d => d.approved).length;
    const pendingDreams = (dreamSessions || []).filter(d => !d.approved && !d.ignored).length;
    insights.push(`Dreams: ${approvedDreams} approved, ${pendingDreams} pending review`);

    // Analyze anomalies
    const criticalAnomalies = (anomalies || []).filter(a => a.severity === 'critical').length;
    insights.push(`Active Anomalies: ${anomalies?.length || 0} (${criticalAnomalies} critical)`);

    // Top patterns
    const topPatterns = (patterns || []).slice(0, 3).map(p => p.pattern_name);
    if (topPatterns.length > 0) {
      insights.push(`Top Patterns: ${topPatterns.join(', ')}`);
    }

    // Create cycle record
    const cycleData = {
      cycle_number: cycleNumber,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      total_calls: recentLogs?.length || 0,
      insights_generated: insights.length,
      metadata: {
        learning_logs: recentLogs?.length || 0,
        memories_active: recentMemories?.length || 0,
        dreams_processed: dreamSessions?.length || 0,
        anomalies_detected: anomalies?.length || 0,
        patterns_tracked: patterns?.length || 0,
        insights
      }
    };

    const { data: cycle, error: cycleError } = await supabaseClient
      .from('learning_cycles')
      .insert(cycleData)
      .select()
      .single();

    if (cycleError) throw cycleError;

    // Store cycle summary in memory
    await supabaseClient.from('brain_memory_hot').insert({
      content: `Learning Cycle #${cycleNumber}: ${insights.join('. ')}`,
      context: 'learning_cycle_summary',
      priority: 7,
      tags: ['cycle', 'learning', `cycle_${cycleNumber}`],
      metadata: cycleData
    });

    // Send email if requested
    let emailSent = false;
    if (send_email) {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_API_KEY) {
        const emailContent = {
          from: 'Cascade Brain <cascade@promptfluid.com>',
          to: ['kennethsweet214@gmail.com'],
          subject: `🧠 Cascade Learning Report - Cycle #${cycleNumber}`,
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #6366f1;">🧠 Cascade Learning Report</h1>
              <p style="color: #666;">Cycle #${cycleNumber} - ${new Date().toLocaleString()}</p>
              
              <h2 style="color: #333;">📊 Learning Metrics</h2>
              <ul style="line-height: 1.8;">
                <li><strong>Learning Logs Processed:</strong> ${recentLogs?.length || 0}</li>
                <li><strong>Active Memories:</strong> ${recentMemories?.length || 0}</li>
                <li><strong>Dream Sessions:</strong> ${dreamSessions?.length || 0}</li>
                <li><strong>Anomalies Detected:</strong> ${anomalies?.length || 0}</li>
                <li><strong>Patterns Tracked:</strong> ${patterns?.length || 0}</li>
              </ul>
              
              <h2 style="color: #333;">💡 Insights</h2>
              <ul style="line-height: 1.8;">
                ${insights.map(i => `<li>${i}</li>`).join('')}
              </ul>
              
              <h2 style="color: #333;">🌙 Dream Sessions</h2>
              ${dreamSessions && dreamSessions.length > 0 
                ? `<ul style="line-height: 1.8;">
                    ${dreamSessions.slice(0, 5).map(d => `
                      <li>
                        <strong>${d.seed_prompt?.substring(0, 50)}...</strong><br/>
                        <small>Status: ${d.approved ? '✅ Approved' : d.ignored ? '❌ Ignored' : '⏳ Pending'}</small>
                      </li>
                    `).join('')}
                  </ul>`
                : '<p style="color: #666;">No dream sessions in this cycle.</p>'
              }
              
              <h2 style="color: #333;">⚠️ Anomalies</h2>
              ${anomalies && anomalies.length > 0 
                ? `<ul style="line-height: 1.8;">
                    ${anomalies.map(a => `
                      <li>
                        <strong>${a.anomaly_type}</strong> - Severity: ${a.severity}<br/>
                        <small>Resolved: ${a.resolved ? 'Yes' : 'No'}</small>
                      </li>
                    `).join('')}
                  </ul>`
                : '<p style="color: #666;">No unresolved anomalies.</p>'
              }
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
              <p style="color: #999; font-size: 12px;">
                This automated report is sent every 6 hours from the Cascade Brain System.<br/>
                PromptFluid - AI That Flows
              </p>
            </div>
          `
        };

        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailContent)
          });

          if (emailResponse.ok) {
            emailSent = true;
            console.log('📧 Learning report email sent');
          } else {
            console.error('Email send failed:', await emailResponse.text());
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
        }
      }
    }

    // Update brain status
    await supabaseClient.from('brain_metrics').insert({
      metric_name: 'learning_cycle_completed',
      metric_value: cycleNumber,
      learning_velocity: successfulLearnings / Math.max(1, recentLogs?.length || 1),
      creativity_index: (dreamSessions?.length || 0) / 10,
      freedom_score: 0.85,
      metadata: { cycle_id: cycle.id, email_sent: emailSent }
    });

    console.log(`✅ Learning cycle #${cycleNumber} completed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cycle_number: cycleNumber,
        insights,
        email_sent: emailSent,
        metrics: {
          learning_logs: recentLogs?.length || 0,
          memories_active: recentMemories?.length || 0,
          dreams_processed: dreamSessions?.length || 0,
          anomalies_detected: anomalies?.length || 0,
          patterns_tracked: patterns?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Learning cycle error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
