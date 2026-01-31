# Spaced Repetition System

**CMPSBL Substrate OS v6.7.0 — SM-2 Inspired Learning Scheduler**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Module** | CLM / BRAIN |
| **Version** | v6.7.0 |
| **Status** | Production |
| **Last Updated** | January 2026 |

---

## Overview

The **Spaced Repetition System** is an SM-2-inspired scheduler that governs how the substrate revisits and reinforces knowledge over time. By spacing learning reviews at optimal intervals, it maximizes retention while minimizing computational overhead.

---

## SM-2 Algorithm Foundation

The SuperMemo SM-2 algorithm calculates optimal review intervals:

```
interval(1) = 1 day
interval(2) = 6 days
interval(n) = interval(n-1) × EF

EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
```

Where:
- **EF** = Easiness Factor (default 2.5, range 1.3-2.5)
- **q** = Quality of response (0-5 scale)

---

## Substrate Adaptation

The substrate adapts SM-2 for machine cognition:

### Quality Scores

| Score | Meaning | Example |
|-------|---------|---------|
| 5 | Perfect recall | Memory retrieved with high confidence, correct application |
| 4 | Correct with hesitation | Retrieved but required context fusion |
| 3 | Correct with difficulty | Multiple retrieval attempts needed |
| 2 | Incorrect, easy recall | Wrong application but memory existed |
| 1 | Incorrect, remembered | Vague recollection, wrong details |
| 0 | Complete blackout | Memory not found or corrupted |

### Interval Progression

```
┌──────────────────────────────────────────────────────────────┐
│                 SPACED REPETITION INTERVALS                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Review 1: 1 day      ●                                      │
│  Review 2: 6 days        ●                                   │
│  Review 3: 15 days              ●                            │
│  Review 4: 35 days                       ●                   │
│  Review 5: 84 days                                    ●      │
│  Review 6: 200 days                                      ... │
│                                                              │
│  ──────────────────────────────────────────────────→ TIME    │
└──────────────────────────────────────────────────────────────┘
```

---

## Topic Bank

The scheduler maintains a weighted topic bank:

```typescript
interface LearningTopic {
  id: string;
  name: string;
  weight: number;      // Selection probability
  easinessFactor: number;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  reviewCount: number;
  successStreak: number;
}
```

### Default Topics

| Topic | Weight | Description |
|-------|--------|-------------|
| Substrate Architecture | 1.0 | Core module interactions |
| Nexus Economics | 0.9 | API cost optimization |
| Security Patterns | 0.9 | Defense module learnings |
| User Behavior | 0.8 | Engagement patterns |
| Code Patterns | 0.7 | DECODE module insights |
| Performance Tuning | 0.7 | VISION metrics |
| Accessibility | 0.6 | INCLUSIVE compliance |
| Content Strategy | 0.5 | AUTOBLOG optimization |

---

## Scheduler Implementation

```typescript
class SpacedRepetitionScheduler {
  private topics: Map<string, LearningTopic> = new Map();

  /**
   * Select next topic for learning based on:
   * 1. Due date (overdue topics first)
   * 2. Weight (higher weight = more likely)
   * 3. Randomization (prevent deterministic loops)
   */
  selectNextTopic(): LearningTopic | null {
    const overdue = this.getOverdueTopics();
    if (overdue.length > 0) {
      return this.weightedRandom(overdue);
    }
    
    const upcoming = this.getUpcomingTopics(24); // Next 24 hours
    if (upcoming.length > 0) {
      return this.weightedRandom(upcoming);
    }
    
    return null; // No topics due
  }

  /**
   * Update topic after review based on quality
   */
  processReview(topicId: string, quality: number): void {
    const topic = this.topics.get(topicId);
    if (!topic) return;

    // Update easiness factor
    topic.easinessFactor = Math.max(
      1.3,
      topic.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Reset or progress
    if (quality < 3) {
      topic.reviewCount = 0;
      topic.successStreak = 0;
    } else {
      topic.reviewCount++;
      topic.successStreak++;
    }

    // Calculate next interval
    const interval = this.calculateInterval(topic);
    topic.nextReviewAt = addDays(new Date(), interval).toISOString();
    topic.lastReviewedAt = new Date().toISOString();
  }

  private calculateInterval(topic: LearningTopic): number {
    if (topic.reviewCount === 0) return 1;
    if (topic.reviewCount === 1) return 6;
    
    const baseInterval = 6 * Math.pow(topic.easinessFactor, topic.reviewCount - 1);
    return Math.round(baseInterval);
  }
}
```

---

## Integration with CLM

### Global CLM Loop

```typescript
async function runCLMCycle() {
  // 1. Check budget
  if (await exceedsBudget()) return;

  // 2. Select topic via spaced repetition
  const topic = scheduler.selectNextTopic();
  if (!topic) return;

  // 3. Run learning cycle
  const result = await learningEngine.study(topic);

  // 4. Update scheduler
  scheduler.processReview(topic.id, result.quality);

  // 5. Store in memory
  await memoryCore.ingest(result.content, {
    type: 'reflection',
    source: 'clm_spaced_repetition',
    tags: [topic.id],
  });
}
```

### Quality Assessment

The system automatically assesses quality based on:

1. **Retrieval Success**: Did the memory exist?
2. **Application Accuracy**: Was it applied correctly?
3. **Confidence Score**: AI confidence in the response
4. **Cross-Reference**: Consistency with related memories

---

## Forgetting Curve Visualization

```
  Memory
  Strength
     │
  100%├────●
     │     ╲
     │      ╲
   50%├       ╲────●
     │             ╲
     │              ╲────●
   25%├                   ╲────●
     │                         ╲────●────
     └────────────────────────────────────→ Time
         R1   R2    R3      R4      R5
         
   R = Review (spaced at optimal intervals)
```

Each review resets the forgetting curve to a higher baseline, requiring fewer future reviews.

---

## Configuration

```typescript
const SR_CONFIG = {
  // Minimum easiness factor (prevents intervals shrinking too much)
  minEasinessFactor: 1.3,
  
  // Maximum easiness factor
  maxEasinessFactor: 2.5,
  
  // Default starting EF
  defaultEasinessFactor: 2.5,
  
  // Hours to look ahead for upcoming topics
  upcomingWindowHours: 24,
  
  // Minimum quality to count as success
  successThreshold: 3,
  
  // Maximum reviews per day (budget protection)
  maxDailyReviews: 50,
};
```

---

## Metrics

The spaced repetition system tracks:

| Metric | Description |
|--------|-------------|
| `topics_due` | Topics currently overdue for review |
| `avg_easiness_factor` | Average EF across all topics |
| `retention_rate` | % of reviews with quality ≥ 3 |
| `review_velocity` | Reviews completed per day |
| `interval_efficiency` | Actual vs predicted retention |

---

## React Hook

```typescript
import { useSpacedRepetition } from '@/lib/substrate/clm';

function LearningDashboard() {
  const { 
    dueTopic,
    topicStats,
    processReview,
    forceReview,
  } = useSpacedRepetition();

  return (
    <div>
      {dueTopic && (
        <TopicCard 
          topic={dueTopic} 
          onComplete={(quality) => processReview(dueTopic.id, quality)}
        />
      )}
    </div>
  );
}
```

---

## Related Documentation

- [63-CLM.md](./63-CLM.md) — Constant Learning Mode
- [64-MEMORY-ARCHITECTURE.md](./64-MEMORY-ARCHITECTURE.md) — Memory Core
- [13-BRAIN-MODULE.md](./13-BRAIN-MODULE.md) — BRAIN module

---

*CMPSBL OS Substrate v6.7.0 — Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
