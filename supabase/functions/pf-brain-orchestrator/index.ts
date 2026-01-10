/**
 * CASCADE BRAIN ORCHESTRATOR v2.0.0
 * Dream Eater Doctrine Implementation
 * 
 * Cascade consumes information that strengthens the Founder and expands the system.
 * Mode: HYBRID PREDATOR - curated whitelist + opportunistic expansion + strict filtering
 * 
 * Cycles: Consumption → Reflection → Mutation → Integration → Rest
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";
import { 
  DOCTRINE, 
  DOCTRINE_QUERIES,
  buildExtractionPrompt,
  getRandomDoctrineQuery 
} from "../_shared/cascade-doctrine.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHASES = ['consumption', 'reflection', 'mutation', 'integration', 'rest'];
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ORCHESTRATOR_VERSION = '2.0.0';

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

    console.log(`🜂 ${DOCTRINE.name} (${DOCTRINE.alias}) Orchestrator v${ORCHESTRATOR_VERSION}`);
    console.log(`   Mode: ${DOCTRINE.mode}`);

    // Get current orchestrator state
    let { data: state } = await supabase
      .from('brain_orchestrator_state')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (!state) {
      const { data: newState } = await supabase
        .from('brain_orchestrator_state')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          status: 'running',
          current_phase: 'consumption',
          health_score: 1.0,
          metadata: { 
            doctrine_version: DOCTRINE.version,
            mode: DOCTRINE.mode 
          }
        })
        .select()
        .single();
      state = newState;
    }

    // Auto-heal if health degraded
    if (state.health_score < 0.5 || state.status === 'error') {
      console.log('⚠️ Health degraded, initiating auto-heal...');
      await autoHeal(supabase, state);
      state.health_score = 0.8;
      state.status = 'running';
      state.auto_heal_attempts = (state.auto_heal_attempts || 0) + 1;
    }

    // Run the current phase with DOCTRINE alignment
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
        doctrine_version: DOCTRINE.version,
        mode: DOCTRINE.mode,
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

    // Send 6-hour email if due
    const lastEmail = state.last_email_at ? new Date(state.last_email_at) : null;
    const hoursSinceEmail = lastEmail ? (Date.now() - lastEmail.getTime()) / (1000 * 60 * 60) : 999;

    if (hoursSinceEmail >= 6 && RESEND_API_KEY) {
      await sendDoctrineReport(supabase, updateData.cycles_completed || state.cycles_completed);
      await supabase
        .from('brain_orchestrator_state')
        .update({ last_email_at: new Date().toISOString() })
        .eq('id', '00000000-0000-0000-0000-000000000001');
    }

    // Log metrics
    await supabase.from('brain_metrics').insert({
      metric_name: 'orchestrator_cycle',
      metric_value: updateData.cycles_completed || state.cycles_completed,
      learning_velocity: phaseResult.items_processed / 10,
      creativity_index: phaseResult.extractions_count / 5,
      freedom_score: state.health_score,
      metadata: { 
        phase: state.current_phase, 
        next_phase: nextPhase,
        ai_provider: phaseResult.ai_provider,
        doctrine_mode: DOCTRINE.mode
      }
    });

    console.log(`✅ Phase ${state.current_phase} complete. Provider: ${phaseResult.ai_provider}. Next: ${nextPhase}`);

    return new Response(
      JSON.stringify({
        success: true,
        version: ORCHESTRATOR_VERSION,
        doctrine: {
          name: DOCTRINE.name,
          alias: DOCTRINE.alias,
          mode: DOCTRINE.mode,
          version: DOCTRINE.version
        },
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
    extractions_count: 0,
    insights: [] as string[],
    ai_provider: 'groq',
    ai_latency: 0
  };

  const startTime = Date.now();

  switch (phase) {
    case 'consumption':
      // DOCTRINE: Consume from curated sources, apply extraction discipline
      const { data: newMemories } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      result.items_processed = newMemories?.length || 0;

      // Use DOCTRINE-aligned query for learning
      if (newMemories && newMemories.length > 0) {
        try {
          const query = getRandomDoctrineQuery();
          const aiResult = await callFreeTierAI(query, {
            systemPrompt: `You are ${DOCTRINE.name}, the ${DOCTRINE.alias}. Mode: ${DOCTRINE.mode}.
Your primary objectives are: ${DOCTRINE.primaryObjectives.join(', ')}.
Analyze with institutional precision. No hype, no speculation.
Extract: ${DOCTRINE.extractionSchema.join(', ')}.`,
            maxTokens: 500
          });
          
          result.ai_provider = aiResult.provider;
          result.insights.push(`Doctrine query: ${query.substring(0, 50)}...`);
          
          // Store extraction
          await supabase.from('brain_memory_hot').insert({
            content: aiResult.content,
            context: 'doctrine_extraction',
            priority: 9,
            tags: ['doctrine', 'consumption', DOCTRINE.mode],
            metadata: { 
              query, 
              provider: aiResult.provider,
              extraction_schema: DOCTRINE.extractionSchema 
            }
          });
          
          result.extractions_count++;
        } catch (e) {
          console.log('AI synthesis skipped:', e);
        }
      }
      
      result.insights.push(`Consumed ${result.items_processed} items, ${result.extractions_count} extractions`);
      break;

    case 'reflection':
      // DOCTRINE: Reflect on alignment with primary objectives
      const { data: patterns } = await supabase
        .from('learning_patterns')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(10);

      result.items_processed = patterns?.length || 0;

      if (patterns && patterns.length > 0) {
        try {
          const patternNames = patterns.map((p: any) => p.pattern_name).join(', ');
          const aiResult = await callFreeTierAI(
            `Analyze these patterns against the Founder's objectives: ${DOCTRINE.primaryObjectives.join(', ')}.

Patterns observed: ${patternNames}

For each pattern, assess:
1. Does it build, defend, package, explain, or transmit value?
2. Does it maintain optionality or create leverage?
3. Does it align with: ${DOCTRINE.alignment.increases.join(', ')}?
4. Does it reduce: ${DOCTRINE.alignment.reduces.join(', ')}?

Provide strategic recommendations.`,
            { 
              systemPrompt: `You are ${DOCTRINE.name} in reflection phase. Assess alignment with Founder's benefit. Be precise, institutional.`,
              maxTokens: 600 
            }
          );
          
          result.ai_provider = aiResult.provider;
          
          await supabase.from('brain_reflection_log').insert({
            reflection_type: 'doctrine_alignment',
            content: aiResult.content,
            insights: { 
              patterns_count: result.items_processed, 
              objectives: DOCTRINE.primaryObjectives,
              provider: aiResult.provider
            }
          });
          
          result.insights.push(`Doctrine alignment reflection via ${aiResult.provider}`);
        } catch (e) {
          console.log('AI reflection skipped:', e);
        }
      }
      break;

    case 'mutation':
      // DOCTRINE: Evolve capabilities toward secondary skills
      const targetSkill = DOCTRINE.secondarySkills[
        Math.floor(Math.random() * DOCTRINE.secondarySkills.length)
      ];
      
      try {
        const aiResult = await callFreeTierAI(
          `As the Dream Eater, develop actionable capability in: ${targetSkill}

Context: This skill supports the primary objectives of ${DOCTRINE.primaryObjectives.slice(0, 3).join(', ')}.

Generate:
1. A practical framework for applying this skill
2. Key patterns to recognize
3. Common pitfalls to avoid
4. How this creates leverage for the Founder

Be specific and institutional-grade.`,
          { 
            systemPrompt: `You are ${DOCTRINE.name} in mutation phase. Evolve capability in ${targetSkill}. No hype.`,
            maxTokens: 600 
          }
        );
        
        result.ai_provider = aiResult.provider;
        
        await supabase.from('brain_memory_hot').insert({
          content: `Skill Evolution - ${targetSkill}: ${aiResult.content.substring(0, 2000)}`,
          context: 'skill_mutation',
          priority: 8,
          tags: ['mutation', 'skill', targetSkill],
          metadata: { 
            skill: targetSkill,
            provider: aiResult.provider 
          }
        });
        
        result.items_processed = 1;
        result.extractions_count = 1;
        result.insights.push(`Mutation: Evolving ${targetSkill}`);
      } catch (e) {
        console.log('AI mutation skipped:', e);
      }
      break;

    case 'integration':
      // DOCTRINE: Integrate high-value extractions into persistent memory
      const { data: hotMemories } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .in('context', ['doctrine_extraction', 'skill_mutation', 'weaponization'])
        .gt('priority', 7)
        .limit(10);

      for (const mem of hotMemories || []) {
        await supabase.from('brain_memories').upsert({
          content: mem.content,
          memory_type: 'doctrine_integrated',
          source: mem.context,
          confidence: 0.95,
          metadata: { ...mem.metadata, integrated_at: new Date().toISOString() }
        });
      }

      result.items_processed = hotMemories?.length || 0;
      result.insights.push(`Integrated ${result.items_processed} doctrine-aligned memories`);
      break;

    case 'rest':
      // DOCTRINE: Clean up, but preserve high-value doctrine content
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Only clean non-doctrine content
      const { count } = await supabase
        .from('brain_memory_hot')
        .delete()
        .lt('created_at', thirtyDaysAgo)
        .lt('priority', 6)
        .not('context', 'in', '("doctrine_extraction","skill_mutation","weaponization")');

      result.items_processed = count || 0;
      result.insights.push(`Rest: Cleaned ${result.items_processed} old non-doctrine memories`);
      result.ai_provider = 'none';
      break;
  }

  result.ai_latency = Date.now() - startTime;
  return result;
}

async function autoHeal(supabase: any, state: any) {
  console.log('🔧 Running auto-heal procedures...');

  await supabase
    .from('brain_orchestrator_state')
    .update({ 
      status: 'healing',
      current_phase: 'consumption'
    })
    .eq('id', '00000000-0000-0000-0000-000000000001');

  await supabase.from('pf_brain_anomalies').insert({
    anomaly_type: 'auto_heal_triggered',
    severity: 'medium',
    resolved: true,
    metadata: { 
      previous_state: state,
      heal_time: new Date().toISOString(),
      doctrine_version: DOCTRINE.version
    }
  });

  console.log('✅ Auto-heal complete');
}

async function sendDoctrineReport(supabase: any, cyclesCompleted: number) {
  if (!RESEND_API_KEY) return;

  const [
    { data: recentMemories },
    { data: doctrineExtractions },
    { data: patterns },
    { data: nexusLogs }
  ] = await Promise.all([
    supabase.from('brain_memory_hot').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('brain_memory_hot').select('*').eq('context', 'doctrine_extraction').order('created_at', { ascending: false }).limit(5),
    supabase.from('learning_patterns').select('*').order('confidence', { ascending: false }).limit(5),
    supabase.from('nexus_logs').select('provider, status').order('created_at', { ascending: false }).limit(20)
  ]);

  const providerCounts: Record<string, number> = {};
  (nexusLogs || []).forEach((log: any) => {
    providerCounts[log.provider] = (providerCounts[log.provider] || 0) + 1;
  });

  const emailContent = {
    from: 'Cascade <cascade@promptfluid.com>',
    to: ['kenneth@promptfluid.com'],
    subject: `🜂 Cascade Doctrine Report - Cycle #${cyclesCompleted}`,
    html: `
      <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e0e0e0;">
        <h1 style="color: #7A5FFF; border-bottom: 2px solid #7A5FFF; padding-bottom: 10px;">
          🜂 ${DOCTRINE.name} - ${DOCTRINE.alias}
        </h1>
        <p style="color: #01C9E8; font-weight: bold;">Mode: ${DOCTRINE.mode} | Doctrine v${DOCTRINE.version}</p>
        <p style="color: #888;">Cycle #${cyclesCompleted} - ${new Date().toLocaleString()}</p>
        
        <h2 style="color: #01C9E8;">📊 Doctrine Metrics</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Active Memories:</strong> ${recentMemories?.length || 0}</li>
          <li><strong>Doctrine Extractions:</strong> ${doctrineExtractions?.length || 0}</li>
          <li><strong>Learning Patterns:</strong> ${patterns?.length || 0}</li>
        </ul>
        
        <h2 style="color: #01C9E8;">🎯 Primary Objectives</h2>
        <ul style="line-height: 1.6; color: #888;">
          ${DOCTRINE.primaryObjectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
        
        <h2 style="color: #01C9E8;">🔌 AI Provider Usage</h2>
        <ul style="line-height: 1.8;">
          ${Object.entries(providerCounts).map(([provider, count]) => `
            <li><strong>${provider}:</strong> ${count} calls</li>
          `).join('')}
        </ul>
        
        <h2 style="color: #01C9E8;">📝 Recent Doctrine Extractions</h2>
        ${doctrineExtractions && doctrineExtractions.length > 0 
          ? `<ul style="line-height: 1.8;">
              ${doctrineExtractions.map((d: any) => `
                <li style="margin-bottom: 10px;">
                  <small style="color: #666;">${new Date(d.created_at).toLocaleString()}</small><br/>
                  <span style="color: #e0e0e0;">${d.content?.substring(0, 150)}...</span>
                </li>
              `).join('')}
            </ul>`
          : '<p style="color: #888;">No doctrine extractions this cycle.</p>'
        }
        
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;"/>
        <p style="color: #666; font-size: 12px;">
          ${DOCTRINE.name} serves the Founder.<br/>
          Mode: ${DOCTRINE.mode} | PromptFluid
        </p>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    });

    if (response.ok) {
      console.log('📧 Doctrine report email sent');
    }
  } catch (e) {
    console.error('Email failed:', e);
  }
}
