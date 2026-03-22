/**
 * CLM Spaced Repetition Engine
 * SM-2-ish scheduling for memory consolidation
 * 
 * Implements lightweight spaced repetition:
 * - Confidence + recall success → next interval calculation
 * - Capped at 30% of daily CLM budget
 * - Queue management with priority sorting
 */

import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';
import type { Topic } from './topic-bank';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SpacedRepItem {
  id: string;
  topicId: string;
  topicName: string;
  easeFactor: number; // 1.3 - 2.5 (SM-2 style)
  interval: number; // Days until next review
  repetitions: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  lastRecallSuccess: boolean;
  confidence: number;
}

export interface ReviewResult {
  recallQuality: 0 | 1 | 2 | 3 | 4 | 5; // 0=blackout, 5=perfect
  confidence: number;
  durationMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SM-2 CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const FIRST_INTERVAL = 1; // 1 day
const SECOND_INTERVAL = 6; // 6 days

// ═══════════════════════════════════════════════════════════════════════════════
// SPACED REPETITION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class SpacedRepetitionClient {
  private static instance: SpacedRepetitionClient;
  private queue: SpacedRepItem[] = [];
  private readonly STORAGE_KEY = 'clm_spaced_rep_queue';

  private constructor() {
    this.loadQueue();
  }

  static getInstance(): SpacedRepetitionClient {
    if (!SpacedRepetitionClient.instance) {
      SpacedRepetitionClient.instance = new SpacedRepetitionClient();
    }
    return SpacedRepetitionClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add an item to the spaced repetition queue (after initial learning)
   */
  addToQueue(topic: Topic, initialConfidence: number): void {
    // Check if already in queue
    const existing = this.queue.find(item => item.topicId === topic.id);
    if (existing) return;

    const now = new Date();
    const nextReview = new Date(now.getTime() + FIRST_INTERVAL * 24 * 3600000);

    this.queue.push({
      id: crypto.randomUUID(),
      topicId: topic.id,
      topicName: topic.name,
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: FIRST_INTERVAL,
      repetitions: 0,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: nextReview.toISOString(),
      lastRecallSuccess: true,
      confidence: initialConfidence,
    });

    this.persistQueue();
  }

  /**
   * Get items due for review
   */
  getDueItems(): SpacedRepItem[] {
    const nowMs = Date.now();
    return this.queue
      .filter(item => new Date(item.nextReviewAt).getTime() <= nowMs)
      .sort((a, b) => {
        // Sort by: overdue time (most overdue first), then confidence (lowest first)
        const aOverdue = nowMs - new Date(a.nextReviewAt).getTime();
        const bOverdue = nowMs - new Date(b.nextReviewAt).getTime();
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return a.confidence - b.confidence;
      });
  }

  /**
   * Get next due item as Topic format
   */
  getNextDueTopic(): Topic | null {
    const due = this.getDueItems();
    if (due.length === 0) return null;

    const item = due[0];
    return {
      id: item.topicId,
      name: item.topicName,
      category: 'spaced_repetition',
      weight: 0.5,
      priority: 0,
      domainAnchors: [],
      moduleRefs: [],
      kpis: [],
      lastStudiedAt: item.lastReviewedAt,
      confidenceLevel: item.confidence,
      studyCount: item.repetitions,
    };
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get full queue for display
   */
  getQueue(): Array<{
    id: string;
    topic: string;
    next_review: string | null;
    confidence: number;
    repetitions: number;
  }> {
    return this.queue.map(item => ({
      id: item.id,
      topic: item.topicName,
      next_review: item.nextReviewAt,
      confidence: item.confidence,
      repetitions: item.repetitions,
    }));
  }

  /**
   * Get queue summary
   */
  getQueueSummary(): {
    total: number;
    due: number;
    avgConfidence: number;
    avgInterval: number;
  } {
    const due = this.getDueItems().length;
    const avgConfidence = this.queue.length > 0
      ? this.queue.reduce((sum, item) => sum + item.confidence, 0) / this.queue.length
      : 0;
    const avgInterval = this.queue.length > 0
      ? this.queue.reduce((sum, item) => sum + item.interval, 0) / this.queue.length
      : 0;

    return {
      total: this.queue.length,
      due,
      avgConfidence,
      avgInterval,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVIEW PROCESSING (SM-2 Algorithm)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Process a review result and update scheduling
   * 
   * SM-2 quality scale:
   * 5 - perfect response
   * 4 - correct after hesitation
   * 3 - correct with difficulty
   * 2 - incorrect but remembered when shown
   * 1 - incorrect, vaguely remembered
   * 0 - complete blackout
   */
  processReview(topicId: string, result: ReviewResult): SpacedRepItem | null {
    const itemIndex = this.queue.findIndex(item => item.topicId === topicId);
    if (itemIndex === -1) return null;

    const item = this.queue[itemIndex];
    const now = new Date();
    const q = result.recallQuality;

    // Update ease factor using SM-2 formula
    let newEase = item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    newEase = Math.max(MIN_EASE_FACTOR, newEase);

    // Calculate new interval
    let newInterval: number;
    let newRepetitions: number;

    if (q < 3) {
      // Failed recall - reset
      newInterval = FIRST_INTERVAL;
      newRepetitions = 0;
    } else {
      // Successful recall
      newRepetitions = item.repetitions + 1;

      if (newRepetitions === 1) {
        newInterval = FIRST_INTERVAL;
      } else if (newRepetitions === 2) {
        newInterval = SECOND_INTERVAL;
      } else {
        newInterval = Math.round(item.interval * newEase);
      }
    }

    // Cap interval at 180 days
    newInterval = Math.min(newInterval, 180);

    // Update item
    const updatedItem: SpacedRepItem = {
      ...item,
      easeFactor: newEase,
      interval: newInterval,
      repetitions: newRepetitions,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: new Date(now.getTime() + newInterval * 24 * 3600000).toISOString(),
      lastRecallSuccess: q >= 3,
      confidence: result.confidence,
    };

    this.queue[itemIndex] = updatedItem;
    this.persistQueue();

    // Log to brain_events
    this.logReview(updatedItem, result);

    return updatedItem;
  }

  /**
   * Remove item from queue (e.g., topic retired)
   */
  removeFromQueue(topicId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.topicId !== topicId);
    
    if (this.queue.length < initialLength) {
      this.persistQueue();
      return true;
    }
    return false;
  }

  /**
   * Clear entire queue
   */
  clearQueue(): void {
    this.queue = [];
    this.persistQueue();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  private loadQueue(): void {
    try {
      const stored = secureGet<typeof this.queue>(this.STORAGE_KEY);
      if (stored) {
        this.queue = stored;
      }
    } catch {
      this.queue = [];
    }
  }

  private persistQueue(): void {
    try {
      secureSet(this.STORAGE_KEY, this.queue);
    } catch {
      /* Non-critical: queue will be rebuilt on next session */
    }
  }

  private async logReview(item: SpacedRepItem, result: ReviewResult): Promise<void> {
    try {
      await supabase.from('brain_events').insert({
        event_type: 'clm_spaced_rep_review',
        module: 'brain',
        data: {
          topic_id: item.topicId,
          topic_name: item.topicName,
          recall_quality: result.recallQuality,
          new_interval: item.interval,
          new_ease: item.easeFactor,
          repetition_count: item.repetitions,
          confidence: result.confidence,
        },
        outcome: result.recallQuality >= 3 ? 'success' : 'failure',
      } as any);
    } catch {
      // Non-critical
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const spacedRepetition = SpacedRepetitionClient.getInstance();
export { SpacedRepetitionClient };
