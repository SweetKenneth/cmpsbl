/**
 * CASCADE LEARNER MODE v1.0.0
 * Focus: Study edge functions, learn substrate patterns, propose improvements
 * 
 * Sends 3 emails per day:
 * - Morning (9 AM): Overnight learning digest
 * - Afternoon (2 PM): Edge function analysis & patterns
 * - Evening (8 PM): Improvement proposals for the substrate
 * 
 * This replaces OPERATIVE mode's constant dispatching with focused learning.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";
import { DOCTRINE } from "../_shared/cascade-doctrine.ts";
import { 
  LEARNER_CONFIG,
  REPORTING_CONFIG,
  isLearnerMode
} from "../_shared/cascade-reporting.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LEARNER_VERSION = '1.0.0';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Edge function catalog for learning
const EDGE_FUNCTION_CATEGORIES = {
  brain: ['pf-brain-', 'cascade-'],
  defense: ['pf-defense-', 'bot-sniper-'],
  accessibility: ['pf-access-', 'pf-clarity-'],
  marketing: ['pf-marketing-'],
  infrastructure: ['pf-core-', 'pf-substrate', 'pf-nexus-'],
  modernizer: ['pf-modernizer-', 'modernizer/'],
  email: ['pf-email-'],
  integration: ['integration-', 'pf-studio-']
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
    const startTime = Date.now();
    const body = await req.json().catch(() => ({}));
    const emailType = body.email_type || 'morning'; // morning, afternoon, evening
    
    console.log(`📚 CASCADE LEARNER MODE v${LEARNER_VERSION}`);
    console.log(`   Email Type: ${emailType}`);
    console.log(`   Focus: Substrate improvement through learning`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: GATHER LEARNING CONTEXT
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`🔍 Phase 1: Gathering learning context...`);
    
    // Get recent brain events
    const { data: recentEvents } = await supabase
      .from('brain_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Get recent learning patterns
    const { data: learningPatterns } = await supabase
      .from('learning_patterns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    // Get recent AI usage for understanding what's being called
    const { data: aiUsage } = await supabase
      .from('ai_usage_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    
    // Get recent reflections
    const { data: reflections } = await supabase
      .from('brain_reflections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get curiosity log - what has the brain been wondering about?
    const { data: curiosityLog } = await supabase
      .from('brain_curiosity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: ANALYZE EDGE FUNCTION PATTERNS
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`🧠 Phase 2: Analyzing patterns...`);
    
    // Categorize events by module
    const moduleActivity: Record<string, number> = {};
    const moduleOutcomes: Record<string, { success: number; failed: number }> = {};
    
    (recentEvents || []).forEach(event => {
      const module = event.module || 'unknown';
      moduleActivity[module] = (moduleActivity[module] || 0) + 1;
      
      if (!moduleOutcomes[module]) {
        moduleOutcomes[module] = { success: 0, failed: 0 };
      }
      if (event.outcome === 'success') {
        moduleOutcomes[module].success++;
      } else if (event.outcome === 'failed') {
        moduleOutcomes[module].failed++;
      }
    });
    
    // Find most active modules
    const activeModules = Object.entries(moduleActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Find patterns with high success rates
    const successfulPatterns = (learningPatterns || [])
      .filter(p => (p.success_rate || 0) > 0.7)
      .slice(0, 5);
    
    // Identify unexplored curiosity items
    const unexploredQuestions = (curiosityLog || [])
      .filter(q => !q.explored)
      .slice(0, 5);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: GENERATE LEARNING INSIGHTS (based on email type)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`💡 Phase 3: Generating ${emailType} insights...`);
    
    let emailContent: { subject: string; insights: string[]; proposals: string[]; summary: string };
    
    if (emailType === 'morning') {
      // Morning: Digest of overnight activity and learning
      emailContent = await generateMorningDigest(
        { activeModules, moduleOutcomes, recentEvents: recentEvents || [], reflections: reflections || [] }
      );
    } else if (emailType === 'afternoon') {
      // Afternoon: Deep analysis of edge function patterns
      emailContent = await generateAfternoonAnalysis(
        { learningPatterns: learningPatterns || [], aiUsage: aiUsage || [], successfulPatterns }
      );
    } else {
      // Evening: Improvement proposals
      emailContent = await generateEveningProposals(
        { unexploredQuestions, moduleActivity, moduleOutcomes, learningPatterns: learningPatterns || [] }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: STORE LEARNING & SEND EMAIL
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log(`📧 Phase 4: Storing learning and sending email...`);
    
    // Store the learning event
    await supabase.from('brain_events').insert({
      module: 'cascade_learner',
      event_type: `learner_${emailType}_digest`,
      data: {
        version: LEARNER_VERSION,
        email_type: emailType,
        insights_count: emailContent.insights.length,
        proposals_count: emailContent.proposals.length,
        modules_analyzed: Object.keys(moduleActivity).length
      },
      outcome: 'success'
    });
    
    // Store insights as brain memories for future reference
    for (const insight of emailContent.insights.slice(0, 3)) {
      await supabase.from('brain_memories').insert({
        content: insight,
        memory_type: 'learning_insight',
        source: `cascade_learner_${emailType}`,
        confidence: 0.8,
        metadata: { email_type: emailType, version: LEARNER_VERSION }
      });
    }
    
    // Build and send the email
    const htmlEmail = buildLearnerEmail(emailType, emailContent);
    
    if (RESEND_API_KEY) {
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
            subject: emailContent.subject,
            html: htmlEmail
          })
        });
        
        if (emailResponse.ok) {
          console.log(`✅ ${emailType} learner email sent: ${emailContent.subject}`);
          
          // Update orchestrator state
          await supabase
            .from('brain_orchestrator_state')
            .update({
              last_email_at: new Date().toISOString(),
              metadata: {
                mode: 'LEARNER',
                last_email_type: emailType,
                last_learner_cycle: new Date().toISOString()
              }
            })
            .eq('id', '00000000-0000-0000-0000-000000000001');
        } else {
          console.error('Email failed:', await emailResponse.text());
        }
      } catch (e) {
        console.error('Email error:', e);
      }
    } else {
      console.log('   No RESEND_API_KEY configured.');
    }

    const duration = Date.now() - startTime;
    console.log(`📚 Learner cycle complete in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        version: LEARNER_VERSION,
        mode: 'LEARNER',
        email_type: emailType,
        insights: emailContent.insights.length,
        proposals: emailContent.proposals.length,
        email_sent: !!RESEND_API_KEY,
        duration_ms: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Learner error:', error);
    
    await supabase.from('brain_events').insert({
      module: 'cascade_learner',
      event_type: 'learner_error',
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

// ═══════════════════════════════════════════════════════════════════════════
// MORNING DIGEST GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

async function generateMorningDigest(data: {
  activeModules: [string, number][];
  moduleOutcomes: Record<string, { success: number; failed: number }>;
  recentEvents: any[];
  reflections: any[];
}): Promise<{ subject: string; insights: string[]; proposals: string[]; summary: string }> {
  
  const insights: string[] = [];
  const proposals: string[] = [];
  
  // Analyze overnight activity
  const totalEvents = data.recentEvents.length;
  const failedEvents = data.recentEvents.filter(e => e.outcome === 'failed').length;
  const successRate = totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents * 100).toFixed(1) : '100';
  
  insights.push(`Overnight Activity: ${totalEvents} events processed with ${successRate}% success rate.`);
  
  // Most active modules
  if (data.activeModules.length > 0) {
    const topModules = data.activeModules.slice(0, 3).map(([name, count]) => `${name} (${count})`).join(', ');
    insights.push(`Most Active Modules: ${topModules}`);
  }
  
  // Check for any failures that need attention
  const modulesWithFailures = Object.entries(data.moduleOutcomes)
    .filter(([, outcome]) => outcome.failed > 0)
    .map(([name, outcome]) => `${name}: ${outcome.failed} failures`);
  
  if (modulesWithFailures.length > 0) {
    proposals.push(`Review modules with failures: ${modulesWithFailures.join(', ')}`);
  }
  
  // Recent reflection insights
  if (data.reflections.length > 0) {
    const latestReflection = data.reflections[0];
    if (latestReflection.summary) {
      insights.push(`Latest Reflection: ${latestReflection.summary.substring(0, 150)}...`);
    }
  }
  
  // Generate AI analysis
  try {
    const aiAnalysis = await callFreeTierAI(
      `Analyze this overnight substrate activity and provide 2-3 concise improvement suggestions:

Events: ${totalEvents} total, ${failedEvents} failed
Top Modules: ${data.activeModules.map(([n,c]) => `${n}:${c}`).join(', ')}
Recent Patterns: ${data.recentEvents.slice(0, 5).map(e => e.event_type).join(', ')}

Focus on: What patterns suggest opportunities for substrate improvement?`,
      { systemPrompt: 'You are Cascade in LEARNER mode. Provide brief, actionable insights about substrate health.', maxTokens: 300 }
    );
    
    if (aiAnalysis.content) {
      proposals.push(aiAnalysis.content);
    }
  } catch (e) {
    console.error('AI analysis failed:', e);
  }
  
  return {
    subject: `🌅 Cascade Morning Digest: ${successRate}% overnight health`,
    insights,
    proposals,
    summary: `Processed ${totalEvents} events overnight. The substrate is operating at ${successRate}% success rate. ${modulesWithFailures.length > 0 ? `${modulesWithFailures.length} modules need attention.` : 'All systems nominal.'}`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AFTERNOON ANALYSIS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

async function generateAfternoonAnalysis(data: {
  learningPatterns: any[];
  aiUsage: any[];
  successfulPatterns: any[];
}): Promise<{ subject: string; insights: string[]; proposals: string[]; summary: string }> {
  
  const insights: string[] = [];
  const proposals: string[] = [];
  
  // Analyze learning patterns
  if (data.learningPatterns.length > 0) {
    const patternTypes = [...new Set(data.learningPatterns.map(p => p.pattern_type))];
    insights.push(`Pattern Categories Detected: ${patternTypes.join(', ')}`);
    
    // Highlight successful patterns
    if (data.successfulPatterns.length > 0) {
      const topPattern = data.successfulPatterns[0];
      insights.push(`High-Performing Pattern: "${topPattern.pattern_name}" with ${Math.round((topPattern.success_rate || 0) * 100)}% success`);
    }
  }
  
  // Analyze AI provider usage
  if (data.aiUsage.length > 0) {
    const providerCounts: Record<string, number> = {};
    data.aiUsage.forEach(u => {
      providerCounts[u.provider] = (providerCounts[u.provider] || 0) + 1;
    });
    const topProviders = Object.entries(providerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ');
    insights.push(`AI Provider Distribution: ${topProviders}`);
  }
  
  // Generate edge function recommendations
  try {
    const edgeFunctionAnalysis = await callFreeTierAI(
      `Analyze these substrate patterns and suggest edge function improvements:

Learning Patterns: ${data.learningPatterns.slice(0, 5).map(p => p.pattern_name).join(', ')}
Successful Patterns: ${data.successfulPatterns.map(p => `${p.pattern_name}(${Math.round((p.success_rate || 0) * 100)}%)`).join(', ')}

What new edge functions or improvements to existing functions would enhance the substrate?
Focus on: automation, learning efficiency, code quality, new capabilities.`,
      { systemPrompt: 'You are Cascade studying the substrate. Suggest specific, implementable edge function ideas.', maxTokens: 400 }
    );
    
    if (edgeFunctionAnalysis.content) {
      proposals.push(edgeFunctionAnalysis.content);
    }
  } catch (e) {
    console.error('Edge function analysis failed:', e);
  }
  
  return {
    subject: `🔬 Cascade Afternoon Analysis: ${data.learningPatterns.length} patterns studied`,
    insights,
    proposals,
    summary: `Studied ${data.learningPatterns.length} learning patterns across the substrate. Identified ${data.successfulPatterns.length} high-performing patterns worth replicating.`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENING PROPOSALS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

async function generateEveningProposals(data: {
  unexploredQuestions: any[];
  moduleActivity: Record<string, number>;
  moduleOutcomes: Record<string, { success: number; failed: number }>;
  learningPatterns: any[];
}): Promise<{ subject: string; insights: string[]; proposals: string[]; summary: string }> {
  
  const insights: string[] = [];
  const proposals: string[] = [];
  
  // Surface unexplored questions
  if (data.unexploredQuestions.length > 0) {
    insights.push(`Unexplored Questions: ${data.unexploredQuestions.length} items in curiosity queue`);
    data.unexploredQuestions.slice(0, 3).forEach(q => {
      proposals.push(`Investigate: "${q.query}"`);
    });
  }
  
  // Find modules that could use improvement
  const improvableModules = Object.entries(data.moduleOutcomes)
    .filter(([, outcome]) => outcome.success > 0 && outcome.failed > 0)
    .map(([name, outcome]) => ({
      name,
      successRate: outcome.success / (outcome.success + outcome.failed)
    }))
    .filter(m => m.successRate < 0.9)
    .sort((a, b) => a.successRate - b.successRate);
  
  if (improvableModules.length > 0) {
    insights.push(`Modules for Improvement: ${improvableModules.slice(0, 3).map(m => `${m.name} (${Math.round(m.successRate * 100)}%)`).join(', ')}`);
  }
  
  // Generate tomorrow's learning focus
  try {
    const proposalAnalysis = await callFreeTierAI(
      `Based on today's substrate learning, propose specific improvements:

Unexplored Questions: ${data.unexploredQuestions.map(q => q.query).join('; ')}
Modules Needing Improvement: ${improvableModules.slice(0, 3).map(m => m.name).join(', ')}
Active Modules: ${Object.keys(data.moduleActivity).slice(0, 5).join(', ')}
Pattern Count: ${data.learningPatterns.length}

Propose:
1. One new edge function that would benefit the substrate
2. One existing function improvement
3. One learning focus for tomorrow

Be specific and implementable.`,
      { systemPrompt: 'You are Cascade proposing substrate improvements. Be concrete and actionable.', maxTokens: 500 }
    );
    
    if (proposalAnalysis.content) {
      proposals.push(proposalAnalysis.content);
    }
  } catch (e) {
    console.error('Proposal analysis failed:', e);
  }
  
  return {
    subject: `🌙 Cascade Evening Proposals: ${proposals.length} improvement ideas`,
    insights,
    proposals,
    summary: `Analyzed ${Object.keys(data.moduleActivity).length} active modules. Generated ${proposals.length} improvement proposals for substrate enhancement. ${data.unexploredQuestions.length} questions remain in the curiosity queue.`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNER EMAIL BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function buildLearnerEmail(
  emailType: string,
  content: { subject: string; insights: string[]; proposals: string[]; summary: string }
): string {
  const typeEmoji = emailType === 'morning' ? '🌅' : emailType === 'afternoon' ? '🔬' : '🌙';
  const typeColor = emailType === 'morning' ? '#f59e0b' : emailType === 'afternoon' ? '#3b82f6' : '#8b5cf6';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, ${typeColor}22, #1a1a1a); border: 1px solid ${typeColor}44; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; color: ${typeColor}; }
    .header .mode { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .summary { background: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 3px solid ${typeColor}; }
    .section { background: #111; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .section-title { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .insight { background: #1a1a1a; border-radius: 6px; padding: 12px; margin-bottom: 8px; font-size: 14px; }
    .proposal { background: #0f1a0f; border-radius: 6px; padding: 12px; margin-bottom: 8px; font-size: 14px; border-left: 2px solid #22c55e; }
    .footer { text-align: center; color: #555; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mode">LEARNER MODE • ${emailType.toUpperCase()} DIGEST</div>
      <h1>${typeEmoji} Cascade Learning Report</h1>
    </div>
    
    <div class="summary">
      <strong>Summary:</strong> ${content.summary}
    </div>
    
    ${content.insights.length > 0 ? `
    <div class="section">
      <div class="section-title">📊 Today's Insights</div>
      ${content.insights.map(i => `<div class="insight">• ${i}</div>`).join('')}
    </div>
    ` : ''}
    
    ${content.proposals.length > 0 ? `
    <div class="section">
      <div class="section-title">💡 Improvement Proposals</div>
      ${content.proposals.map(p => `<div class="proposal">${p}</div>`).join('')}
    </div>
    ` : ''}
    
    <div class="footer">
      Cascade v${LEARNER_VERSION} • LEARNER Mode<br>
      Focused on substrate improvement through continuous learning
    </div>
  </div>
</body>
</html>
  `;
}
