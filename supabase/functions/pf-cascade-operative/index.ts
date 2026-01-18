/**
 * CASCADE OPERATIVE MODE v1.1.0
 * 
 * NOTE: This function is now deprecated in favor of LEARNER mode.
 * The system now uses pf-cascade-learner for 3 focused emails per day.
 * 
 * This operative function is kept for backwards compatibility and emergency use.
 * It will redirect to LEARNER mode by default unless explicitly overridden.
 * 
 * To use operative mode: POST with { "force_operative": true }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";
import { DOCTRINE, DOCTRINE_QUERIES, getRandomDoctrineQuery } from "../_shared/cascade-doctrine.ts";
import { 
  ACTIVE_MODE,
  REPORTING_CONFIG,
  URGENCY_TIERS,
  DOMAIN_PRIORITY,
  classifySignal,
  calculateCrossDomainEscalation,
  escalateTier,
  shouldDispatch,
  getAffectedProjects,
  checkAlignment,
  EVENT_TRIGGERS,
  THREAT_ACTOR_DESCRIPTIONS,
  PROJECT_MAPPINGS,
  CascadeSignal,
  ThreatModel,
  UrgencyTier,
  PriorityDomain,
  StrategicPosture,
  isLearnerMode
} from "../_shared/cascade-reporting.ts";
import { buildCascadeEmail, CascadeReport } from "../_shared/cascade-email-builder.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPERATIVE_VERSION = '1.1.0';
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
    const body = await req.json().catch(() => ({}));
    const forceOperative = body.force_operative === true;
    
    // Check if we should redirect to LEARNER mode
    if (isLearnerMode() && !forceOperative) {
      console.log(`📚 Cascade is in LEARNER mode. Redirecting to pf-cascade-learner...`);
      console.log(`   To force operative mode, POST with { "force_operative": true }`);
      
      // Log the redirect
      await supabase.from('brain_events').insert({
        module: 'cascade',
        event_type: 'operative_redirect_to_learner',
        data: { message: 'Operative mode disabled. System is in LEARNER mode.' },
        outcome: 'redirected'
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'LEARNER',
          message: 'Cascade is in LEARNER mode. Operative dispatching is disabled.',
          redirect: 'Use pf-cascade-learner for learning-focused emails (3/day)',
          force_operative: 'POST with { "force_operative": true } to override'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const startTime = Date.now();
    console.log(`🜂 CASCADE OPERATIVE MODE v${OPERATIVE_VERSION}`);
    console.log(`   Doctrine: ${DOCTRINE.name} (${DOCTRINE.alias}) v${DOCTRINE.version}`);
    console.log(`   Mode: OPERATIVE (forced) - All signals dispatch immediately`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: LEARNING - Ingest doctrine-aligned intelligence
    // ═══════════════════════════════════════════════════════════════════════
    
    const learningResults: any[] = [];
    const callsThisCycle = 5; // Moderate learning per cycle
    
    console.log(`📚 Phase 1: Learning (${callsThisCycle} doctrine queries)...`);
    
    for (let i = 0; i < callsThisCycle; i++) {
      const query = DOCTRINE_QUERIES[Math.floor(Math.random() * DOCTRINE_QUERIES.length)];
      
      try {
        const result = await callFreeTierAI(
          `As ${DOCTRINE.name}, research and synthesize: ${query}

Apply extraction discipline: ${DOCTRINE.extractionSchema.slice(0, 6).join(', ')}
Align with: ${DOCTRINE.primaryObjectives.slice(0, 4).join(', ')}

Be institutional-grade. No hype. Actionable intelligence only.`,
          {
            systemPrompt: `You are ${DOCTRINE.name}, the ${DOCTRINE.alias}. Mode: ${DOCTRINE.mode}.
Serve the Founder. Extract: thesis, incentives, power structure, leverage points, valuation drivers, narrative vectors.`,
            maxTokens: 700,
            temperature: 0.2
          }
        );
        
        // Store learning
        await supabase.from('ai_learning_data').insert({
          input_data: { query, doctrine_version: DOCTRINE.version },
          output_data: { content: result.content },
          model: result.model,
          model_name: `${result.provider}/${result.model}`,
          provider: result.provider,
          success: true,
          metadata: { cycle: 'operative', mode: ACTIVE_MODE }
        });
        
        learningResults.push({
          query: query.substring(0, 60),
          provider: result.provider,
          content: result.content
        });
        
        console.log(`✓ [${i + 1}/${callsThisCycle}] ${result.provider}`);
        
        if (i < callsThisCycle - 1) await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.error(`Learning call ${i + 1} failed:`, e);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: SIGNAL DETECTION & CLASSIFICATION
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`🔍 Phase 2: Signal Detection...`);
    
    const signals: CascadeSignal[] = [];
    
    // Analyze learning results for signals
    for (const learning of learningResults) {
      const classification = classifySignal(learning.content, learning.provider);
      const alignment = checkAlignment(learning.content);
      
      if (alignment.aligned) {
        signals.push({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          tier: classification.tier!,
          original_tier: classification.original_tier!,
          primary_domain: classification.primary_domain!,
          secondary_domains: classification.secondary_domains!,
          cross_domain_escalation: classification.cross_domain_escalation!,
          content: learning.content.substring(0, 500),
          source: learning.provider,
          affected_projects: classification.affected_projects!,
          suggested_moves: [],
          lessons: []
        });
      }
    }
    
    // Fetch recent brain events for additional signal detection
    const { data: recentEvents } = await supabase
      .from('brain_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    for (const event of recentEvents || []) {
      const eventContent = JSON.stringify(event.data);
      const classification = classifySignal(eventContent, event.module);
      
      // Only add high-value events
      if (classification.tier === 'RED' || classification.tier === 'YELLOW') {
        signals.push({
          id: crypto.randomUUID(),
          timestamp: event.created_at,
          tier: classification.tier!,
          original_tier: classification.original_tier!,
          primary_domain: classification.primary_domain!,
          secondary_domains: classification.secondary_domains!,
          cross_domain_escalation: classification.cross_domain_escalation!,
          content: `[${event.event_type}] ${eventContent.substring(0, 300)}`,
          source: event.module,
          affected_projects: classification.affected_projects!,
          suggested_moves: [],
          lessons: []
        });
      }
    }
    
    console.log(`   Detected ${signals.length} aligned signals`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: THREAT MODELING
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`⚠️ Phase 3: Threat Modeling...`);
    
    const threats: ThreatModel[] = [];
    
    // Use AI to identify threats from signals
    if (signals.length > 0) {
      try {
        const threatAnalysis = await callFreeTierAI(
          `Analyze these signals for threats to the Founder's portfolio:

SIGNALS:
${signals.slice(0, 5).map(s => `- [${s.tier}] ${s.content.substring(0, 200)}`).join('\n')}

THREAT ACTOR CLASSES:
- PREDATORS (Acquirers seeking to absorb)
- COMPETITORS (Direct/adjacent)
- PARASITES (Value extractors)
- REGULATORS (Governance constraints)
- STANDARDS_BODIES (Governance ambush)
- NARRATIVE_ATTACKERS (Perception war)
- INFRASTRUCTURE_RISKS (Platform hostage)

For each threat, identify:
1. Actor class
2. Vector (acquisition/regulation/narrative/infra/economic/cultural)
3. Severity (low/medium/high)
4. Probability (low/medium/high)
5. Time horizon (0-3mo, 3-12mo, 1-3yr, 3+yr)
6. Recommended posture (ATTACK/EXPAND/ABSORB/PARTNER/BUY_TIME/WAIT/HEDGE/SHIELD/WITHDRAW)
7. Opportunity mirror if upside exists

Format as JSON array.`,
          {
            systemPrompt: `You are ${DOCTRINE.name} analyzing threats. Be precise and institutional.`,
            maxTokens: 800
          }
        );
        
        // Try to parse threats from response
        try {
          const parsed = JSON.parse(threatAnalysis.content);
          if (Array.isArray(parsed)) {
            threats.push(...parsed.slice(0, 3));
          }
        } catch {
          // Generate a default threat assessment
          threats.push({
            actor_class: 'COMPETITORS',
            vector: 'narrative',
            severity: 'medium',
            probability: 'medium',
            horizon: '3-12mo',
            posture: 'WAIT',
            description: 'Standard competitive monitoring recommended.'
          });
        }
      } catch (e) {
        console.error('Threat analysis failed:', e);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: GENERATE SUGGESTED MOVES
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`🎯 Phase 4: Generating Moves...`);
    
    const suggested_moves: Array<{ move: string; posture: StrategicPosture; timing?: string; risk?: string }> = [];
    
    if (signals.length > 0) {
      try {
        const movesAnalysis = await callFreeTierAI(
          `Based on these signals, suggest strategic moves for the Founder:

SIGNALS:
${signals.slice(0, 3).map(s => `- [${s.tier}/${s.primary_domain}] ${s.content.substring(0, 150)}`).join('\n')}

AFFECTED PROJECTS:
${Array.from(new Set(signals.flatMap(s => s.affected_projects))).join(', ')}

For each move, provide:
1. The action
2. Posture (ATTACK/EXPAND/ABSORB/PARTNER/BUY_TIME/WAIT/HEDGE/SHIELD/WITHDRAW)
3. Timing window
4. Risk level

Format as JSON array of moves.`,
          {
            systemPrompt: `You are ${DOCTRINE.name} advising the Founder. Strategic, precise, no hype.`,
            maxTokens: 600
          }
        );
        
        try {
          const parsed = JSON.parse(movesAnalysis.content);
          if (Array.isArray(parsed)) {
            suggested_moves.push(...parsed.slice(0, 5));
          }
        } catch {
          suggested_moves.push({
            move: 'Continue monitoring and learning',
            posture: 'WAIT',
            timing: 'Ongoing',
            risk: 'Low'
          });
        }
      } catch (e) {
        console.error('Moves generation failed:', e);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: EXTRACT LESSONS & PATTERNS
    // ═══════════════════════════════════════════════════════════════════════
    
    const lessons: string[] = [];
    
    // Fetch recent patterns
    const { data: recentPatterns } = await supabase
      .from('learning_patterns')
      .select('pattern_name, description')
      .order('created_at', { ascending: false })
      .limit(5);
    
    recentPatterns?.forEach(p => {
      if (p.description) lessons.push(p.description);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: BUILD & DISPATCH EMAIL (OPERATIVE MODE = IMMEDIATE)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`📧 Phase 6: Dispatching Report (MODE: ${ACTIVE_MODE})...`);
    
    // Get cycle number
    const { data: stateData } = await supabase
      .from('brain_orchestrator_state')
      .select('cycles_completed')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();
    
    const cycleNumber = (stateData?.cycles_completed || 0) + 1;
    
    const report: CascadeReport = {
      signals,
      threats,
      suggested_moves,
      lessons,
      cycle_number: cycleNumber
    };
    
    const { subject, html } = buildCascadeEmail(report);
    
    // Log the report
    await supabase.from('brain_events').insert({
      module: 'cascade',
      event_type: 'operative_dispatch',
      data: {
        version: OPERATIVE_VERSION,
        mode: ACTIVE_MODE,
        signals_count: signals.length,
        threats_count: threats.length,
        moves_count: suggested_moves.length,
        tiers: {
          red: signals.filter(s => s.tier === 'RED').length,
          yellow: signals.filter(s => s.tier === 'YELLOW').length,
          green: signals.filter(s => s.tier === 'GREEN').length
        },
        cycle_number: cycleNumber
      },
      outcome: 'dispatched'
    });
    
    // Send email in OPERATIVE mode
    if (RESEND_API_KEY && signals.length > 0) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: REPORTING_CONFIG.sender,
            to: [REPORTING_CONFIG.founder_email],
            subject,
            html
          })
        });
        
        if (emailResponse.ok) {
          console.log(`✅ Email dispatched: ${subject}`);
        } else {
          console.error('Email failed:', await emailResponse.text());
        }
      } catch (e) {
        console.error('Email error:', e);
      }
    } else if (signals.length === 0) {
      console.log('   No signals to dispatch (no empty reports).');
    } else {
      console.log('   No RESEND_API_KEY configured.');
    }
    
    // Update orchestrator state
    await supabase
      .from('brain_orchestrator_state')
      .update({
        cycles_completed: cycleNumber,
        last_cycle_at: new Date().toISOString(),
        last_email_at: signals.length > 0 ? new Date().toISOString() : undefined,
        metadata: {
          mode: ACTIVE_MODE,
          last_operative_cycle: new Date().toISOString(),
          signals_dispatched: signals.length
        }
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    const duration = Date.now() - startTime;
    console.log(`🜂 Operative cycle complete in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        version: OPERATIVE_VERSION,
        mode: ACTIVE_MODE,
        doctrine: {
          name: DOCTRINE.name,
          alias: DOCTRINE.alias,
          version: DOCTRINE.version
        },
        cycle: cycleNumber,
        learning: {
          calls_made: learningResults.length,
          providers: [...new Set(learningResults.map(r => r.provider))]
        },
        signals: {
          total: signals.length,
          by_tier: {
            RED: signals.filter(s => s.tier === 'RED').length,
            YELLOW: signals.filter(s => s.tier === 'YELLOW').length,
            GREEN: signals.filter(s => s.tier === 'GREEN').length
          }
        },
        threats: threats.length,
        moves: suggested_moves.length,
        lessons: lessons.length,
        email_dispatched: signals.length > 0 && !!RESEND_API_KEY,
        duration_ms: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Operative error:', error);
    
    await supabase.from('brain_events').insert({
      module: 'cascade',
      event_type: 'operative_error',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      outcome: 'failed'
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
