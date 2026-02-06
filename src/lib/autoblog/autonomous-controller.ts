/**
 * AutoBlog Autonomous Controller v2.0
 * Full 24/7 autonomous operation with intelligent scheduling
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  getAutoblogSettings, 
  updateAutoblogSettings, 
  queueDraft, 
  saveDraft, 
  updateQueueStatus, 
  recordRun,
  countPostsToday 
} from './store';
import { checkAutoblogCircuit, reportSuccess, reportFailure } from './circuit';
import { publishDraft } from './publisher';
import { generateInsightfulContent, pickOptimalTopic } from './content-intelligence';
import { captureAutoblogLearning, performSelfAudit } from './brain-integration';
import type { AutoblogChannel } from './types';

// Autonomous mode configuration
const AUTO_CONFIG = {
  // Posting schedule
  MIN_POSTS_PER_DAY: 0,        // Minimum daily posts (0 = posting is optional)
  MAX_POSTS_PER_DAY: 3,        // Maximum daily posts
  TARGET_POSTS_PER_WEEK: 5,    // Ideal weekly target
  
  // Timing intelligence
  OPTIMAL_HOURS_UTC: [9, 14, 17, 20],  // Best posting times
  WEEKEND_REDUCTION: 0.5,       // Post less on weekends
  
  // Quality gates
  MIN_CONFIDENCE_AUTO: 0.75,    // Minimum confidence for auto-publish
  AUDIT_FREQUENCY: 6,           // Self-audit every N cycles
  
  // Cycle configuration  
  CYCLE_INTERVAL_HOURS: 1,      // Check every hour
  COOLDOWN_AFTER_POST_HOURS: 4, // Wait after publishing
};

// Autonomous state
interface AutoState {
  running: boolean;
  mode: 'full_auto' | 'supervised' | 'off';
  cyclesCompleted: number;
  postsToday: number;
  postsThisWeek: number;
  weekStart: string;
  lastPostAt: string | null;
  lastCycleAt: string | null;
  nextCycleAt: string | null;
  qualityScores: number[];
  recentTopics: string[];
  errors: string[];
}

let autoState: AutoState = {
  running: false,
  mode: 'off',
  cyclesCompleted: 0,
  postsToday: 0,
  postsThisWeek: 0,
  weekStart: new Date().toISOString(),
  lastPostAt: null,
  lastCycleAt: null,
  nextCycleAt: null,
  qualityScores: [],
  recentTopics: [],
  errors: [],
};

let autoInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Get current autonomous state
 */
export function getAutoState(): AutoState {
  return { ...autoState };
}

/**
 * Determine if we should post now based on schedule and history
 */
function shouldPostNow(): { should: boolean; reason: string } {
  const now = new Date();
  const hour = now.getUTCHours();
  const dayOfWeek = now.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Check daily limit
  if (autoState.postsToday >= AUTO_CONFIG.MAX_POSTS_PER_DAY) {
    return { should: false, reason: `Daily limit reached (${autoState.postsToday}/${AUTO_CONFIG.MAX_POSTS_PER_DAY})` };
  }
  
  // Check cooldown after recent post
  if (autoState.lastPostAt) {
    const hoursSincePost = (Date.now() - new Date(autoState.lastPostAt).getTime()) / (1000 * 60 * 60);
    if (hoursSincePost < AUTO_CONFIG.COOLDOWN_AFTER_POST_HOURS) {
      return { should: false, reason: `Cooling down (${hoursSincePost.toFixed(1)}h since last post)` };
    }
  }
  
  // Check if optimal posting time
  if (!AUTO_CONFIG.OPTIMAL_HOURS_UTC.includes(hour)) {
    // Not optimal, but might still post if behind target
    const daysRemaining = 7 - dayOfWeek;
    const postsNeeded = AUTO_CONFIG.TARGET_POSTS_PER_WEEK - autoState.postsThisWeek;
    
    if (postsNeeded <= daysRemaining) {
      return { should: false, reason: `Not optimal time (${hour}:00 UTC), on track for weekly target` };
    }
    // Behind target, post anyway
  }
  
  // Weekend reduction
  if (isWeekend && Math.random() > AUTO_CONFIG.WEEKEND_REDUCTION) {
    return { should: false, reason: 'Weekend reduction active' };
  }
  
  // All checks passed
  return { should: true, reason: 'Optimal posting conditions' };
}

/**
 * Run one autonomous cycle
 */
async function runAutoCycle(): Promise<void> {
  if (!autoState.running) return;
  
  autoState.lastCycleAt = new Date().toISOString();
  console.log(`[Auto Controller] Cycle ${autoState.cyclesCompleted + 1} starting...`);
  
  try {
    // Check circuit breaker
    const circuit = await checkAutoblogCircuit();
    if (!circuit.canProceed) {
      console.log(`[Auto Controller] Circuit not ready: ${circuit.reason}`);
      return;
    }
    
    // Check settings
    const settings = await getAutoblogSettings();
    if (!settings?.enabled) {
      console.log('[Auto Controller] AutoBlog disabled');
      return;
    }
    
    // Update daily count from database
    autoState.postsToday = await countPostsToday();
    
    // Check week reset
    checkWeekReset();
    
    // Determine if we should post
    const postDecision = shouldPostNow();
    if (!postDecision.should) {
      console.log(`[Auto Controller] Not posting: ${postDecision.reason}`);
      autoState.cyclesCompleted++;
      return;
    }
    
    console.log(`[Auto Controller] Posting: ${postDecision.reason}`);
    
    // Pick optimal topic
    const topicSelection = await pickOptimalTopic();
    if (!topicSelection) {
      console.log('[Auto Controller] No suitable topic found');
      return;
    }
    
    // Avoid recent topics
    if (autoState.recentTopics.includes(topicSelection.category)) {
      console.log(`[Auto Controller] Topic ${topicSelection.category} covered recently, skipping`);
      return;
    }
    
    // Generate content
    const content = await generateInsightfulContent(
      topicSelection.category,
      topicSelection.topicIndex
    );
    
    if (!content) {
      console.log('[Auto Controller] Content generation failed');
      return;
    }
    
    // Check confidence threshold
    if (topicSelection.confidence < AUTO_CONFIG.MIN_CONFIDENCE_AUTO) {
      console.log(`[Auto Controller] Confidence too low (${topicSelection.confidence.toFixed(2)})`);
      return;
    }
    
    // Queue and save
    const dedupeKey = `auto:${topicSelection.category}:${Date.now()}`;
    const queued = await queueDraft({
      channel: content.channel as AutoblogChannel,
      topic: topicSelection.category,
      dedupeKey,
      plannedAt: new Date().toISOString(),
    });
    
    if (!queued) {
      console.log('[Auto Controller] Failed to queue');
      return;
    }
    
    await saveDraft(queued.id, {
      title: content.title,
      body: content.body,
    });
    
    await updateQueueStatus(queued.id, 'ready', {
      confidence: topicSelection.confidence,
      risk: 'low'
    });
    
    // Publish if not dry-run
    if (!settings.dry_run) {
      const result = await publishDraft(queued.id);
      
      if (result.ok) {
        autoState.postsToday++;
        autoState.postsThisWeek++;
        autoState.lastPostAt = new Date().toISOString();
        autoState.recentTopics.push(topicSelection.category);
        
        // Keep only last 5 topics
        if (autoState.recentTopics.length > 5) {
          autoState.recentTopics.shift();
        }
        
        autoState.qualityScores.push(topicSelection.confidence);
        if (autoState.qualityScores.length > 20) {
          autoState.qualityScores.shift();
        }
        
        await reportSuccess();
        console.log(`[Auto Controller] Published: ${content.title}`);
        
        // Log success event
        await supabase.from('brain_events').insert({
          module: 'autoblog',
          event_type: 'auto_published',
          data: {
            title: content.title,
            category: topicSelection.category,
            confidence: topicSelection.confidence,
            cycle: autoState.cyclesCompleted
          },
          outcome: 'completed'
        });
      } else {
        console.log(`[Auto Controller] Publish failed: ${result.error}`);
        autoState.errors.push(result.error || 'Unknown publish error');
        await reportFailure(result.error || 'Publish failed');
      }
    } else {
      console.log('[Auto Controller] Dry-run mode, not publishing');
      await recordRun({
        queueId: queued.id,
        phase: 'publish',
        outcome: 'blocked',
        reason: 'Dry-run mode'
      });
    }
    
    // Periodic self-audit
    if (autoState.cyclesCompleted % AUTO_CONFIG.AUDIT_FREQUENCY === 0 && autoState.cyclesCompleted > 0) {
      const audit = await performSelfAudit();
      await captureAutoblogLearning({
        topic: 'autonomous_audit',
        insights: [
          `Quality score: ${audit.quality_score.toFixed(2)}`,
          ...audit.recommendations.slice(0, 3)
        ],
        source: 'auto_controller',
        confidence: audit.quality_score
      });
    }
    
    autoState.cyclesCompleted++;
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auto Controller] Cycle error:', message);
    autoState.errors.push(message);
    if (autoState.errors.length > 10) {
      autoState.errors.shift();
    }
    await reportFailure(message);
  }
  
  // Schedule next cycle
  autoState.nextCycleAt = new Date(Date.now() + AUTO_CONFIG.CYCLE_INTERVAL_HOURS * 60 * 60 * 1000).toISOString();
}

/**
 * Check for week reset
 */
function checkWeekReset(): void {
  const weekStart = new Date(autoState.weekStart);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 7) {
    console.log('[Auto Controller] New week, resetting counters');
    autoState.postsThisWeek = 0;
    autoState.weekStart = now.toISOString();
    autoState.recentTopics = [];
  }
}

/**
 * Start full autonomous mode - 24/7 intelligent posting
 */
export async function startFullAuto(): Promise<{ ok: boolean; message: string }> {
  if (autoState.running) {
    return { ok: false, message: 'Already running' };
  }
  
  // Enable autoblog with autonomous settings
  await updateAutoblogSettings({
    enabled: true,
    mode: 'autonomous',
    dry_run: false,
    min_confidence_publish: 0.7,
    max_posts_per_day: AUTO_CONFIG.MAX_POSTS_PER_DAY
  });
  
  // Check circuit
  const circuit = await checkAutoblogCircuit();
  if (!circuit.canProceed) {
    return { ok: false, message: `Circuit not ready: ${circuit.reason}` };
  }
  
  // Initialize state
  autoState.running = true;
  autoState.mode = 'full_auto';
  autoState.postsToday = await countPostsToday();
  autoState.weekStart = new Date().toISOString();
  autoState.postsThisWeek = 0;
  autoState.errors = [];
  
  // Set up interval
  const intervalMs = AUTO_CONFIG.CYCLE_INTERVAL_HOURS * 60 * 60 * 1000;
  autoInterval = setInterval(() => runAutoCycle(), intervalMs);
  
  // Run first cycle immediately
  await runAutoCycle();
  
  // Log start event
  await supabase.from('brain_events').insert({
    module: 'autoblog',
    event_type: 'full_auto_started',
    data: {
      config: AUTO_CONFIG,
      started_at: new Date().toISOString()
    },
    outcome: 'completed'
  });
  
  return { 
    ok: true, 
    message: `Full auto mode started. Target: ${AUTO_CONFIG.TARGET_POSTS_PER_WEEK} posts/week, checking every ${AUTO_CONFIG.CYCLE_INTERVAL_HOURS}h` 
  };
}

/**
 * Stop autonomous mode
 */
export function stopAuto(): { ok: boolean; message: string; stats: Partial<AutoState> } {
  if (!autoState.running) {
    return { ok: false, message: 'Not running', stats: {} };
  }
  
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
  
  const stats = {
    cyclesCompleted: autoState.cyclesCompleted,
    postsThisWeek: autoState.postsThisWeek,
    avgQuality: autoState.qualityScores.length > 0 
      ? autoState.qualityScores.reduce((a, b) => a + b, 0) / autoState.qualityScores.length 
      : 0
  };
  
  autoState.running = false;
  autoState.mode = 'off';
  
  return {
    ok: true,
    message: `Stopped after ${stats.cyclesCompleted} cycles, ${stats.postsThisWeek} posts this week`,
    stats
  };
}

/**
 * Get autonomous status summary
 */
export function getAutoStatus(): {
  running: boolean;
  mode: string;
  stats: {
    cycles: number;
    postsToday: number;
    postsThisWeek: number;
    avgQuality: number;
    recentErrors: number;
  };
  schedule: {
    lastCycle: string | null;
    nextCycle: string | null;
    lastPost: string | null;
    optimalHours: number[];
  };
  config: typeof AUTO_CONFIG;
} {
  return {
    running: autoState.running,
    mode: autoState.mode,
    stats: {
      cycles: autoState.cyclesCompleted,
      postsToday: autoState.postsToday,
      postsThisWeek: autoState.postsThisWeek,
      avgQuality: autoState.qualityScores.length > 0
        ? autoState.qualityScores.reduce((a, b) => a + b, 0) / autoState.qualityScores.length
        : 0.8,
      recentErrors: autoState.errors.length
    },
    schedule: {
      lastCycle: autoState.lastCycleAt,
      nextCycle: autoState.nextCycleAt,
      lastPost: autoState.lastPostAt,
      optimalHours: AUTO_CONFIG.OPTIMAL_HOURS_UTC
    },
    config: AUTO_CONFIG
  };
}
