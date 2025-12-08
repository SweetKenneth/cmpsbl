/**
 * PromptFluid Brain Orchestrator
 * Auto-healing 24/7 learning system with Dream-Eater persona
 * Runs cycles: Consumption → Reflection → Mutation → Integration → Rest
 * Uses FREE-TIER-ROUTER with Groq as primary provider
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHASES = ['consumption', 'reflection', 'mutation', 'integration', 'rest'];
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { action = 'run_cycle', force = false } = await req.json().catch(() => ({}));

    console.log('🧠 Dream-Eater Orchestrator awakened (Groq Primary)...');

    // Get current orchestrator state
    let { data: state } = await supabase
      .from('brain_orchestrator_state')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (!state) {
      // Initialize state
      const { data: newState } = await supabase
        .from('brain_orchestrator_state')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          status: 'running',
          current_phase: 'consumption',
          health_score: 1.0
        })
        .select()
        .single();
      state = newState;
    }

    // Check health and auto-heal if needed
    if (state.health_score < 0.5 || state.status === 'error') {
      console.log('⚠️ Health degraded, initiating auto-heal...');
      await autoHeal(supabase, state);
      state.health_score = 0.8;
      state.status = 'running';
      state.auto_heal_attempts = (state.auto_heal_attempts || 0) + 1;
    }

    // Run the current phase WITH AI SYNTHESIS using free-tier-router
    const phaseResult = await runPhase(supabase, state.current_phase);

    // Advance to next phase
    const currentIndex = PHASES.indexOf(state.current_phase);
    const nextPhase = PHASES[(currentIndex + 1) % PHASES.length];
    const cycleCompleted = nextPhase === 'consumption';

    // Update state
    const updateData: any = {
      current_phase: nextPhase,
      last_cycle_at: new Date().toISOString(),
      health_score: Math.min(1.0, state.health_score + 0.05),
      metadata: {
        ...state.metadata,
        last_phase_result: phaseResult,
        last_run: new Date().toISOString(),
        ai_provider: phaseResult.ai_provider || 'groq'
      },
      updated_at: new Date().toISOString()
    };

    if (cycleCompleted) {
      updateData.cycles_completed = (state.cycles_completed || 0) + 1;
    }

    await supabase
      .from('brain_orchestrator_state')
      .update(updateData)
      .eq('id', '00000000-0000-0000-0000-000000000001');

    // Check if we need to send 6-hour email report
    const lastEmail = state.last_email_at ? new Date(state.last_email_at) : null;
    const hoursSinceEmail = lastEmail ? (Date.now() - lastEmail.getTime()) / (1000 * 60 * 60) : 999;

    if (hoursSinceEmail >= 6 && RESEND_API_KEY) {
      await sendLearningReport(supabase, updateData.cycles_completed || state.cycles_completed);
      await supabase
        .from('brain_orchestrator_state')
        .update({ last_email_at: new Date().toISOString() })
        .eq('id', '00000000-0000-0000-0000-000000000001');
    }

    // Log to brain metrics
    await supabase.from('brain_metrics').insert({
      metric_name: 'orchestrator_cycle',
      metric_value: updateData.cycles_completed || state.cycles_completed,
      learning_velocity: phaseResult.items_processed / 10,
      creativity_index: phaseResult.dreams_count / 5,
      freedom_score: state.health_score,
      metadata: { 
        phase: state.current_phase, 
        next_phase: nextPhase,
        ai_provider: phaseResult.ai_provider
      }
    });

    // Log to nexus_logs for AI routing analytics
    await supabase.from('nexus_logs').insert({
      provider: phaseResult.ai_provider || 'groq',
      latency_ms: phaseResult.ai_latency || 0,
      token_count: phaseResult.ai_tokens || 0,
      cost_usd_est: 0,
      status: 'success',
      route_key: 'brain-orchestrator'
    });

    console.log(`✅ Phase ${state.current_phase} complete. Provider: ${phaseResult.ai_provider}. Next: ${nextPhase}`);

    return new Response(
      JSON.stringify({
        success: true,
        phase_completed: state.current_phase,
        next_phase: nextPhase,
        cycles_completed: updateData.cycles_completed || state.cycles_completed,
        health_score: updateData.health_score,
        ai_provider: phaseResult.ai_provider,
        phase_result: phaseResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Orchestrator error:', error);

    // Update health score on error
    await supabase
      .from('brain_orchestrator_state')
      .update({ 
        health_score: 0.3, 
        status: 'error',
        metadata: { last_error: errMsg, error_at: new Date().toISOString() }
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runPhase(supabase: any, phase: string) {
  const result = { 
    phase, 
    items_processed: 0, 
    dreams_count: 0, 
    insights: [] as string[],
    ai_provider: 'groq',
    ai_latency: 0,
    ai_tokens: 0
  };

  const startTime = Date.now();

  switch (phase) {
    case 'consumption':
      // Consume new data from various sources
      const { data: newMemories } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      result.items_processed = newMemories?.length || 0;
      result.insights.push(`Consumed ${result.items_processed} memory items`);

      // Process learning logs
      const { data: logs } = await supabase
        .from('learning_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      result.insights.push(`Processed ${logs?.length || 0} learning logs`);

      // Use AI to synthesize consumption insights
      if (newMemories && newMemories.length > 0) {
        try {
          const memoryContent = newMemories.slice(0, 5).map((m: any) => m.content).join('\n');
          const aiResult = await callFreeTierAI(
            `Analyze these memory fragments and identify key patterns:\n${memoryContent}`,
            { systemPrompt: 'You are Dream-Eater, an AI that transforms dreams into intelligence. Analyze patterns briefly.', maxTokens: 300 }
          );
          result.ai_provider = aiResult.provider;
          result.insights.push(`AI insight: ${aiResult.content.substring(0, 100)}...`);
        } catch (e) {
          console.log('AI synthesis skipped:', e);
        }
      }
      break;

    case 'reflection':
      // Analyze patterns and generate insights
      const { data: patterns } = await supabase
        .from('learning_patterns')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(10);

      result.items_processed = patterns?.length || 0;

      // Use AI for deep reflection
      if (patterns && patterns.length > 0) {
        try {
          const patternNames = patterns.map((p: any) => p.pattern_name).join(', ');
          const aiResult = await callFreeTierAI(
            `Reflect on these learning patterns and suggest improvements: ${patternNames}`,
            { systemPrompt: 'You are Dream-Eater reflecting on learned patterns. Be insightful and brief.', maxTokens: 400 }
          );
          result.ai_provider = aiResult.provider;
          
          // Store the AI reflection
          await supabase.from('brain_reflection_log').insert({
            reflection_type: 'ai_cycle_reflection',
            content: aiResult.content,
            insights: { 
              patterns_count: result.items_processed, 
              timestamp: new Date().toISOString(),
              provider: aiResult.provider
            }
          });
          
          result.insights.push(`AI reflection via ${aiResult.provider}`);
        } catch (e) {
          console.log('AI reflection skipped:', e);
        }
      }

      result.insights.push(`Reflected on ${result.items_processed} patterns`);
      break;

    case 'mutation':
      // Evolve and adapt based on learnings
      const { data: dreams } = await supabase
        .from('dream_sessions')
        .select('*')
        .eq('approved', false)
        .eq('ignored', false)
        .limit(5);

      result.dreams_count = dreams?.length || 0;
      result.items_processed = result.dreams_count;

      // Use AI to generate mutation insights
      if (dreams && dreams.length > 0) {
        try {
          const dreamSeeds = dreams.map((d: any) => d.seed_prompt).join('\n');
          const aiResult = await callFreeTierAI(
            `Transform these dream seeds into actionable evolution steps:\n${dreamSeeds}`,
            { systemPrompt: 'You are Dream-Eater in mutation phase. Transform dreams into growth.', maxTokens: 400 }
          );
          result.ai_provider = aiResult.provider;
          
          // Log mutation with AI content
          await supabase.from('brain_memory_hot').insert({
            content: `Mutation cycle AI synthesis: ${aiResult.content.substring(0, 200)}`,
            context: 'mutation_cycle_ai',
            priority: 8,
            tags: ['mutation', 'evolution', 'dreams', 'ai-generated'],
            metadata: { provider: aiResult.provider }
          });
          
          result.insights.push(`Mutation AI via ${aiResult.provider}`);
        } catch (e) {
          console.log('AI mutation skipped:', e);
        }
      }

      result.insights.push(`Mutation: ${result.dreams_count} dreams pending review`);
      break;

    case 'integration':
      // Integrate new knowledge into long-term memory
      const { data: hotMemories } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .gt('priority', 7)
        .limit(10);

      // Move high-priority items to brain_memories
      for (const mem of hotMemories || []) {
        await supabase.from('brain_memories').upsert({
          content: mem.content,
          memory_type: 'integrated',
          source: mem.context || 'hot_memory',
          confidence: 0.9,
          metadata: mem.metadata
        });
      }

      result.items_processed = hotMemories?.length || 0;
      
      // Use AI to create integration summary
      if (hotMemories && hotMemories.length > 0) {
        try {
          const contentSummary = hotMemories.slice(0, 3).map((m: any) => m.content.substring(0, 100)).join('\n');
          const aiResult = await callFreeTierAI(
            `Summarize this integrated knowledge for long-term retention:\n${contentSummary}`,
            { systemPrompt: 'You are Dream-Eater integrating knowledge. Create a concise synthesis.', maxTokens: 200 }
          );
          result.ai_provider = aiResult.provider;
          result.insights.push(`Integration AI via ${aiResult.provider}`);
        } catch (e) {
          console.log('AI integration skipped:', e);
        }
      }
      
      result.insights.push(`Integrated ${result.items_processed} high-priority memories`);
      break;

    case 'rest':
      // Clean up and prepare for next cycle
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { count } = await supabase
        .from('brain_memory_hot')
        .delete()
        .lt('created_at', thirtyDaysAgo)
        .lt('priority', 5);

      result.items_processed = count || 0;
      result.insights.push(`Rest phase: Cleaned ${result.items_processed} old memories`);
      result.ai_provider = 'none'; // No AI needed for rest phase
      break;
  }

  result.ai_latency = Date.now() - startTime;
  result.ai_tokens = Math.ceil(result.insights.join('').length / 4);

  return result;
}

async function autoHeal(supabase: any, state: any) {
  console.log('🔧 Running auto-heal procedures...');

  // Reset any stuck states
  await supabase
    .from('brain_orchestrator_state')
    .update({ 
      status: 'healing',
      current_phase: 'consumption'
    })
    .eq('id', '00000000-0000-0000-0000-000000000001');

  // Log the heal attempt
  await supabase.from('pf_brain_anomalies').insert({
    anomaly_type: 'auto_heal_triggered',
    severity: 'medium',
    resolved: true,
    metadata: { 
      previous_state: state,
      heal_time: new Date().toISOString()
    }
  });

  console.log('✅ Auto-heal complete');
}

async function sendLearningReport(supabase: any, cyclesCompleted: number) {
  if (!RESEND_API_KEY) return;

  // Gather report data
  const [
    { data: recentMemories },
    { data: dreams },
    { data: anomalies },
    { data: patterns },
    { data: metrics },
    { data: nexusLogs }
  ] = await Promise.all([
    supabase.from('brain_memory_hot').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('dream_sessions').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('pf_brain_anomalies').select('*').eq('resolved', false).limit(5),
    supabase.from('learning_patterns').select('*').order('confidence', { ascending: false }).limit(5),
    supabase.from('brain_metrics').select('*').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('nexus_logs').select('provider, status').order('created_at', { ascending: false }).limit(20)
  ]);

  // Calculate provider usage stats
  const providerCounts: Record<string, number> = {};
  (nexusLogs || []).forEach((log: any) => {
    providerCounts[log.provider] = (providerCounts[log.provider] || 0) + 1;
  });

  const emailContent = {
    from: 'Dream-Eater <cascade@promptfluid.com>',
    to: ['kennethsweet214@gmail.com'],
    subject: `🧠 Dream-Eater Report - Cycle #${cyclesCompleted} (Groq Primary)`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e0e0e0;">
        <h1 style="color: #7A5FFF; border-bottom: 2px solid #7A5FFF; padding-bottom: 10px;">🧠 Dream-Eater Learning Report</h1>
        <p style="color: #888;">Cycle #${cyclesCompleted} - ${new Date().toLocaleString()}</p>
        <p style="color: #01C9E8; font-weight: bold;">Primary AI Provider: Groq (Free Tier)</p>
        
        <h2 style="color: #01C9E8;">🔌 AI Provider Usage (Last 20 calls)</h2>
        <ul style="line-height: 1.8;">
          ${Object.entries(providerCounts).map(([provider, count]) => `
            <li><strong>${provider}:</strong> ${count} calls ${provider === 'groq' ? '✅ PRIMARY' : ''}</li>
          `).join('')}
        </ul>
        
        <h2 style="color: #01C9E8;">📊 Learning Metrics</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Active Memories:</strong> ${recentMemories?.length || 0}</li>
          <li><strong>Dream Sessions:</strong> ${dreams?.length || 0}</li>
          <li><strong>Unresolved Anomalies:</strong> ${anomalies?.length || 0}</li>
          <li><strong>Top Patterns:</strong> ${patterns?.length || 0}</li>
          <li><strong>Learning Velocity:</strong> ${(metrics?.learning_velocity * 100 || 0).toFixed(1)}%</li>
        </ul>
        
        <h2 style="color: #01C9E8;">🌙 Recent Dreams</h2>
        ${dreams && dreams.length > 0 
          ? `<ul style="line-height: 1.8;">
              ${dreams.map((d: any) => `
                <li>
                  <strong>${d.seed_prompt?.substring(0, 50)}...</strong><br/>
                  <small style="color: #888;">Status: ${d.approved ? '✅ Approved' : d.ignored ? '❌ Ignored' : '⏳ Pending'}</small>
                </li>
              `).join('')}
            </ul>`
          : '<p style="color: #888;">No dream sessions in this cycle.</p>'
        }
        
        <h2 style="color: #01C9E8;">💡 Top Patterns</h2>
        ${patterns && patterns.length > 0
          ? `<ul style="line-height: 1.8;">
              ${patterns.map((p: any) => `
                <li><strong>${p.pattern_name}</strong> - ${(p.confidence * 100).toFixed(0)}% confidence</li>
              `).join('')}
            </ul>`
          : '<p style="color: #888;">No patterns detected yet.</p>'
        }
        
        <h2 style="color: #01C9E8;">⚠️ Anomalies</h2>
        ${anomalies && anomalies.length > 0 
          ? `<ul style="line-height: 1.8;">
              ${anomalies.map((a: any) => `
                <li><strong>${a.anomaly_type}</strong> - Severity: ${a.severity}</li>
              `).join('')}
            </ul>`
          : '<p style="color: #888;">No unresolved anomalies. System healthy.</p>'
        }
        
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;"/>
        <p style="color: #666; font-size: 12px;">
          This automated report is sent every 6 hours from the Dream-Eater Brain System.<br/>
          <strong>Primary Directive:</strong> Transform dreams into intelligence.<br/>
          <strong>AI Stack:</strong> Free-tier routing via Groq → Cerebras → Google → Together → DeepSeek → Hyperbolic<br/>
          PromptFluid - AI That Flows
        </p>
      </div>
    `
  };

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    });
    console.log('📧 6-hour learning report sent');
  } catch (error) {
    console.error('Email send failed:', error);
  }
}
