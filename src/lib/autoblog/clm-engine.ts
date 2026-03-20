/**
 * AutoBlog CLM (Constant Learning Mode) Engine
 * Intelligent, continuous content generation with learning
 */

import { supabase } from '@/integrations/supabase/client';
import { getAutoblogSettings, updateAutoblogSettings, queueDraft, saveDraft, updateQueueStatus, recordRun, countPostsToday } from './store';
import { checkAutoblogCircuit, reportSuccess, reportFailure } from './circuit';
import { gatherResearchInsights, getEvolutionDigests, performSelfAudit, captureAutoblogLearning, generateContentIdeas } from './brain-integration';
import { publishDraft, assessContent } from './publisher';
import type { AutoblogSettings, AutoblogChannel, AutonomousState } from './types';

// CLM Configuration
const CLM_CONFIG = {
  MIN_POSTS_PER_WEEK: 3,
  MAX_POSTS_PER_WEEK: 6,
  OPTIMAL_POSTING_HOURS: [9, 14, 18], // 9am, 2pm, 6pm UTC
  AUDIT_FREQUENCY_CYCLES: 5,
  LEARNING_DECAY_RATE: 0.95,
};

// CLM State
let clmState: AutonomousState & {
  mode: 'clm' | 'standard' | 'off';
  posts_this_week: number;
  week_start: string;
  quality_trend: number[];
  topic_history: string[];
} = {
  is_running: false,
  last_cycle_at: null,
  next_cycle_at: null,
  cycles_completed: 0,
  posts_generated: 0,
  research_insights_captured: 0,
  evolution_updates_posted: 0,
  current_focus: null,
  mode: 'off',
  posts_this_week: 0,
  week_start: new Date().toISOString(),
  quality_trend: [],
  topic_history: [],
};

let clmInterval: ReturnType<typeof setInterval> | null = null;

export function getCLMState() {
  return { ...clmState };
}

/**
 * Changelog-style tone guidelines
 */
const CHANGELOG_TONE = {
  principles: [
    'Technical but accessible',
    'Concise and scannable',
    'Focus on user impact',
    'Include actionable commands',
    'Use structured markdown',
    'Avoid marketing language',
  ],
  structurePatterns: [
    '## What Changed',
    '### Why This Matters',
    '### For Developers',
    '### Try It Now',
    '---',
  ],
  forbiddenPhrases: [
    'revolutionary',
    'game-changing',
    'exciting!',
    'incredible',
    'amazing',
    'you won\'t believe',
  ],
};

/**
 * Check if it's a good time to post
 */
function isOptimalPostingTime(): boolean {
  const hour = new Date().getUTCHours();
  return CLM_CONFIG.OPTIMAL_POSTING_HOURS.includes(hour);
}

/**
 * Calculate how many posts we should aim for today
 */
function calculateDailyTarget(): number {
  const remainingDays = 7 - getDayOfWeek();
  const remainingTarget = CLM_CONFIG.MIN_POSTS_PER_WEEK - clmState.posts_this_week;
  
  if (remainingTarget <= 0) {
    // Already hit minimum, occasional extra post OK
    return Math.random() > 0.7 ? 1 : 0;
  }
  
  // Distribute remaining posts across remaining days
  return Math.ceil(remainingTarget / Math.max(1, remainingDays));
}

function getDayOfWeek(): number {
  return new Date().getUTCDay();
}

/**
 * Check if we've started a new week and reset counters
 */
function checkWeekReset(): void {
  const weekStart = new Date(clmState.week_start);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 7) {
    clmState.posts_this_week = 0;
    clmState.week_start = now.toISOString();
    clmState.topic_history = clmState.topic_history.slice(-10); // Keep last 10
  }
}

/**
 * Generate changelog-style content from source material
 */
async function generateChangelogContent(
  channel: AutoblogChannel,
  topic: string,
  sourceType: string
): Promise<{ title: string; body: string } | null> {
  try {
    // Gather context from brain
    const insights = await gatherResearchInsights([topic]);
    const evolutionDigests = await getEvolutionDigests(1);
    
    // Build content based on source type
    let title = '';
    let body = '';
    
    switch (sourceType) {
      case 'evolution_cycle':
        const digest = evolutionDigests[0];
        title = `🧬 System Evolution: ${digest?.improvements[0] || 'Performance Update'}`;
        body = `## What Changed

The CMPSBL World Engine completed an autonomous evolution cycle.

### Improvements Applied

${digest?.improvements.map(i => `- ${i}`).join('\n') || '- System optimization'}

### Why This Matters

Continuous evolution means the substrate adapts to serve users better. Each cycle refines patterns and improves responses.

### For Developers

Track evolution with:
\`\`\`
evolve.status       # Current evolution state
evolve.receipts     # Audit trail
evolution.omega     # Deep analysis
\`\`\`

*This is an automated update from the Substrate's evolution engine.*

---

**Classification**: Evolution Log | **Visibility**: Public`;
        break;
        
      case 'brain_reflection':
        const topInsight = insights[0];
        title = `📋 Internal Log: ${topInsight?.title || 'System Patterns'}`;
        body = `## What We Observed

${topInsight?.summary || 'The substrate identified patterns in recent activity.'}

### Key Insights

${insights.slice(0, 3).map(i => `- **${i.title}**: ${i.summary.substring(0, 100)}...`).join('\n') || '- Pattern analysis in progress'}

### For Developers

The brain module exposes these insights via:
\`\`\`
brain.reflect       # Trigger reflection
brain.recall <q>    # Query knowledge
brain.status        # Memory distribution
\`\`\`

*Generated from brain reflections.*

---

**Classification**: Internal Log | **Visibility**: Developer`;
        break;
        
      case 'knowledge_synthesis':
      default:
        title = `🔬 Research Digest: ${topic}`;
        body = `## Overview

The cognitive substrate continues exploring ${topic.toLowerCase()}.

### What We're Learning

${insights.slice(0, 5).map(i => `- ${i.summary.substring(0, 150)}`).join('\n') || '- Research synthesis in progress'}

### Why This Matters

Understanding ${topic.toLowerCase()} helps the substrate evolve more effectively.

### Community Discussion

What aspects of ${topic.toLowerCase()} interest you? The substrate learns from interactions.

*Digest generated from knowledge graph analysis.*

---

**Classification**: Research | **Visibility**: Public`;
    }
    
    return { title, body };
  } catch (error) {
    console.error('[CLM Engine] Content generation error:', error);
    return null;
  }
}

/**
 * Main CLM cycle
 */
async function runCLMCycle(): Promise<void> {
  if (!clmState.is_running) return;
  
  clmState.last_cycle_at = new Date().toISOString();
  
  try {
    // Check circuit breaker
    const circuit = await checkAutoblogCircuit();
    if (!circuit.canProceed) {
      console.log('[CLM] Circuit not ready:', circuit.reason);
      return;
    }
    
    // Check week reset
    checkWeekReset();
    
    // Check daily limits
    const postsToday = await countPostsToday();
    const settings = await getAutoblogSettings();
    if (!settings?.enabled) return;
    
    if (postsToday >= settings.max_posts_per_day) {
      console.log('[CLM] Daily limit reached');
      return;
    }
    
    // Check weekly targets
    const dailyTarget = calculateDailyTarget();
    if (postsToday >= dailyTarget && !isOptimalPostingTime()) {
      console.log('[CLM] Daily target met, waiting for optimal time');
      return;
    }
    
    // Check if we should post at all
    if (clmState.posts_this_week >= CLM_CONFIG.MAX_POSTS_PER_WEEK) {
      console.log('[CLM] Weekly maximum reached');
      return;
    }
    
    // Generate content ideas
    const ideas = await generateContentIdeas();
    
    if (ideas.length === 0) {
      console.log('[CLM] No content ideas available');
      return;
    }
    
    // Pick the best idea
    const bestIdea = ideas.sort((a, b) => b.confidence - a.confidence)[0];
    
    // Check if topic was recently covered
    if (clmState.topic_history.includes(bestIdea.topic)) {
      console.log('[CLM] Topic recently covered, skipping');
      return;
    }
    
    // Map channel to valid AutoblogChannel
    const validChannels: AutoblogChannel[] = ['changelog', 'blog', 'release_notes'];
    const channel = validChannels.includes(bestIdea.channel as AutoblogChannel) 
      ? bestIdea.channel as AutoblogChannel 
      : 'blog';
    
    // Generate content
    const content = await generateChangelogContent(
      channel,
      bestIdea.topic,
      bestIdea.source_type
    );
    
    if (!content) {
      console.log('[CLM] Failed to generate content');
      return;
    }
    
    // Queue and save draft
    const dedupeKey = `clm:${channel}:${Date.now()}`;
    const queued = await queueDraft({
      channel,
      topic: bestIdea.topic,
      dedupeKey,
      plannedAt: new Date().toISOString(),
    });
    
    if (!queued) {
      console.log('[CLM] Failed to queue draft');
      return;
    }
    
    await saveDraft(queued.id, content);
    await updateQueueStatus(queued.id, 'ready', { 
      confidence: bestIdea.confidence, 
      risk: 'low' 
    });
    
    // Attempt to publish if not in dry-run mode
    if (!settings.dry_run) {
      const result = await publishDraft(queued.id);
      
      if (result.ok) {
        clmState.posts_generated++;
        clmState.posts_this_week++;
        clmState.topic_history.push(bestIdea.topic);
        
        if (bestIdea.source_type === 'evolution_cycle') {
          clmState.evolution_updates_posted++;
        }
        
        await reportSuccess();
        console.log(`[CLM] Published: ${content.title}`);
      } else {
        console.log(`[CLM] Publish blocked: ${result.error}`);
      }
    } else {
      await recordRun({
        queueId: queued.id,
        phase: 'publish',
        outcome: 'blocked',
        reason: 'Dry-run mode active',
      });
    }
    
    // Periodic self-audit
    if (clmState.cycles_completed % CLM_CONFIG.AUDIT_FREQUENCY_CYCLES === 0) {
      const audit = await performSelfAudit();
      await captureAutoblogLearning({
        topic: 'clm_self_audit',
        insights: audit.recommendations,
        source: 'clm_engine',
        confidence: audit.quality_score,
      });
      
      clmState.quality_trend.push(audit.quality_score);
      if (clmState.quality_trend.length > 20) {
        clmState.quality_trend.shift();
      }
    }
    
    clmState.cycles_completed++;
    
  } catch (error) {
    console.error('[CLM] Cycle error:', error);
    await reportFailure(error instanceof Error ? error.message : 'Unknown CLM error');
  }
}

/**
 * Start CLM mode
 */
export async function startCLMMode(): Promise<{ ok: boolean; message: string }> {
  const settings = await getAutoblogSettings();
  if (!settings?.enabled) {
    return { ok: false, message: 'AutoBlog must be enabled first' };
  }
  
  if (clmState.is_running) {
    return { ok: false, message: 'CLM already running' };
  }
  
  const circuit = await checkAutoblogCircuit();
  if (!circuit.canProceed) {
    return { ok: false, message: `Circuit ${circuit.state}: ${circuit.reason}` };
  }
  
  // Update settings to CLM mode
  await updateAutoblogSettings({ mode: 'autonomous' });
  
  clmState.is_running = true;
  clmState.mode = 'clm';
  clmState.week_start = new Date().toISOString();
  clmState.posts_this_week = 0;
  
  // Run cycles every 2 hours (gives ~12 opportunities per day)
  const intervalMs = 2 * 60 * 60 * 1000;
  clmInterval = setInterval(() => {
    if (document.visibilityState === 'hidden') return;
    runCLMCycle();
  }, intervalMs);
  
  // Run first cycle immediately
  await runCLMCycle();
  
  // Log brain event
  await supabase.from('brain_events').insert([{
    module: 'autoblog',
    event_type: 'clm_started',
    data: {
      min_posts_week: CLM_CONFIG.MIN_POSTS_PER_WEEK,
      max_posts_week: CLM_CONFIG.MAX_POSTS_PER_WEEK,
      started_at: clmState.week_start,
    },
    outcome: 'completed',
  }]);
  
  return { ok: true, message: 'CLM mode started - targeting 3-6 posts/week' };
}

/**
 * Stop CLM mode
 */
export function stopCLMMode(): { ok: boolean; message: string } {
  if (!clmState.is_running) {
    return { ok: false, message: 'CLM not running' };
  }
  
  if (clmInterval) {
    clearInterval(clmInterval);
    clmInterval = null;
  }
  
  const summary = {
    cycles: clmState.cycles_completed,
    posts: clmState.posts_generated,
    weekly: clmState.posts_this_week,
  };
  
  clmState.is_running = false;
  clmState.mode = 'off';
  
  return { 
    ok: true, 
    message: `CLM stopped. Completed ${summary.cycles} cycles, ${summary.posts} posts total, ${summary.weekly} this week` 
  };
}

/**
 * Get CLM status summary
 */
export function getCLMStatus(): {
  running: boolean;
  mode: string;
  stats: {
    cycles: number;
    posts_total: number;
    posts_this_week: number;
    quality_avg: number;
  };
  config: typeof CLM_CONFIG;
} {
  const avgQuality = clmState.quality_trend.length > 0
    ? clmState.quality_trend.reduce((a, b) => a + b, 0) / clmState.quality_trend.length
    : 0.8;
    
  return {
    running: clmState.is_running,
    mode: clmState.mode,
    stats: {
      cycles: clmState.cycles_completed,
      posts_total: clmState.posts_generated,
      posts_this_week: clmState.posts_this_week,
      quality_avg: avgQuality,
    },
    config: CLM_CONFIG,
  };
}
