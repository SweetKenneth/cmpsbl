# promptfluid substrate — Learning Cycles

## v2026.01 — Cognitive Orchestration Substrate for AI Systems

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-LEARN-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Overview

promptfluid implements a multi-layered learning system that enables continuous knowledge acquisition, pattern recognition, and adaptive behavior. The system operates autonomously 24/7, ingesting information from multiple sources and transforming it into actionable intelligence.

---

## Learning Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Learning Layer                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Ingestion  │→ │  Processing │→ │   Storage   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         ↓                ↓                ↓             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pattern   │→ │ Reflection  │→ │Reinforcement│     │
│  │  Detection  │  │   Cycles    │  │   Loops     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## Learning Cycle Types

### 1. Continuous Learning Cycle

**Frequency:** Every 10 minutes
**Purpose:** Real-time knowledge acquisition

```typescript
interface ContinuousLearningCycle {
  frequency: '*/10 * * * *';
  phases: [
    'collect_events',
    'classify_signals',
    'extract_patterns',
    'update_memory',
    'log_metrics'
  ];
  timeout_ms: 300000; // 5 minutes max
}
```

#### Process Flow

1. **Collection** - Gather events from ecosystem_memory
2. **Classification** - Apply domain/tier classification
3. **Extraction** - Identify patterns and insights
4. **Storage** - Write to brain_memories
5. **Logging** - Record cycle metrics

### 2. Reflection Cycle

**Frequency:** Daily at 3:00 AM CST
**Purpose:** Deep analysis and synthesis

```typescript
interface ReflectionCycle {
  frequency: '0 3 * * *';
  phases: [
    'gather_day_memories',
    'analyze_patterns',
    'generate_insights',
    'compress_memories',
    'write_reflection'
  ];
  timeout_ms: 1800000; // 30 minutes max
}
```

#### Reflection Output

```typescript
interface ReflectionOutput {
  summary: string;
  insights: string[];
  recommendations: string[];
  patterns_detected: PatternMatch[];
  lessons: Lesson[];
  top_memories: MemoryReference[];
}
```

### 3. Reinforcement Cycle

**Frequency:** Event-driven
**Purpose:** Strengthen successful patterns

```typescript
interface ReinforcementCycle {
  triggers: ['positive_outcome', 'negative_outcome', 'explicit_feedback'];
  actions: [
    'adjust_edge_weights',
    'update_confidence_scores',
    'mark_memory_priority',
    'log_reinforcement'
  ];
}
```

#### Reinforcement Signals

| Signal | Effect | Weight Adjustment |
|--------|--------|-------------------|
| positive_outcome | Strengthen | +0.1 to +0.3 |
| negative_outcome | Weaken | -0.1 to -0.2 |
| explicit_feedback | Direct | Variable |
| usage_frequency | Reinforce | +0.05 per use |

---

## Learning Sources

### Internal Sources

```typescript
const INTERNAL_SOURCES = [
  {
    name: 'ecosystem_memory',
    type: 'events',
    priority: 'high',
    fields: ['source_system', 'event_type', 'payload', 'impact_score']
  },
  {
    name: 'defense_events',
    type: 'security',
    priority: 'high',
    fields: ['ip', 'risk_score', 'action', 'reason']
  },
  {
    name: 'ai_usage_log',
    type: 'operations',
    priority: 'medium',
    fields: ['provider', 'model', 'tokens_used', 'success']
  },
  {
    name: 'cascade_conversations',
    type: 'interaction',
    priority: 'medium',
    fields: ['message', 'reply', 'session_id']
  }
];
```

### External Sources

```typescript
const EXTERNAL_SOURCES = [
  {
    name: 'perplexity_research',
    type: 'web_research',
    quota: 25, // calls per day
    topics: ['AI', 'cybersecurity', 'standards', 'market']
  },
  {
    name: 'news_feeds',
    type: 'rss',
    categories: ['tech', 'business', 'regulatory']
  }
];
```

---

## Pattern Detection

### Pattern Types

```typescript
type PatternType = 
  | 'temporal'      // Time-based patterns
  | 'behavioral'    // User/system behavior
  | 'correlation'   // Cross-metric relationships
  | 'anomaly'       // Outliers and exceptions
  | 'trend'         // Directional movements
  | 'seasonal';     // Recurring cycles
```

### Detection Algorithm

```typescript
interface PatternDetection {
  // Minimum occurrences to consider pattern
  min_frequency: 3;
  
  // Confidence threshold for pattern recognition
  confidence_threshold: 0.7;
  
  // Lookback window
  lookback_days: 30;
  
  // Pattern scoring
  scoring: {
    frequency_weight: 0.3,
    recency_weight: 0.2,
    impact_weight: 0.3,
    consistency_weight: 0.2
  };
}
```

### Pattern Storage

```sql
CREATE TABLE learning_patterns (
  id UUID PRIMARY KEY,
  pattern_name VARCHAR NOT NULL,
  pattern_type VARCHAR NOT NULL,
  description TEXT,
  confidence DECIMAL,
  frequency INTEGER,
  success_rate DECIMAL,
  recommendations JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ
);
```

---

## Memory Management

### Hot Memory Tier

Active memories with high access frequency.

```typescript
interface HotMemory {
  retention: '90 days';
  max_size: 50000;
  priority_range: [1, 10];
  features: [
    'full_embedding',
    'goal_reference',
    'context_tracking',
    'usage_metrics'
  ];
}
```

### Cold Memory Tier

Archived, compressed memories for long-term storage.

```typescript
interface ColdMemory {
  retention: 'permanent';
  compression: {
    summarization: true,
    embedding_reduction: 0.5,
    source_reference: true
  };
  access_pattern: 'infrequent';
}
```

### Migration Rules

```typescript
const MIGRATION_RULES = {
  hot_to_cold: {
    trigger: 'last_used > 90 days',
    process: 'compress_and_archive',
    preserve: ['core_summary', 'key_insights', 'source_refs']
  },
  cold_purge: {
    trigger: 'never', // Permanent retention
    exceptions: ['explicit_delete', 'policy_violation']
  }
};
```

---

## Knowledge Graph

### Edge Types

| Relation | Description | Default Weight |
|----------|-------------|----------------|
| causes | Causal relationship | 0.8 |
| correlates | Correlation | 0.6 |
| contradicts | Opposing information | 0.5 |
| supports | Reinforcing evidence | 0.7 |
| extends | Additional context | 0.6 |
| replaces | Superseding information | 0.9 |

### Edge Reinforcement

```typescript
function reinforceEdge(
  edgeId: string,
  outcome: 'positive' | 'negative',
  magnitude: number
): void {
  const adjustment = outcome === 'positive' 
    ? magnitude * 0.1 
    : magnitude * -0.05;
    
  // Update edge weight
  await supabase
    .from('brain_graph_edges')
    .update({ 
      weight: sql`weight + ${adjustment}`,
      reinforcement_score: sql`reinforcement_score + 1`
    })
    .eq('id', edgeId);
}
```

---

## Curiosity System

### Curiosity Scoring

```typescript
interface CuriosityQuery {
  query: string;
  curiosity_score: number; // 0-1
  domain: string;
  explored: boolean;
  metadata: {
    trigger_source: string;
    expected_value: number;
    novelty_score: number;
  };
}
```

### Exploration Policy

```typescript
const EXPLORATION_POLICY = {
  // Percentage of cycles dedicated to exploration
  exploration_rate: 0.2,
  
  // Minimum score to trigger exploration
  curiosity_threshold: 0.6,
  
  // Max exploration queries per cycle
  max_queries_per_cycle: 5,
  
  // Novelty bonus for unexplored domains
  novelty_multiplier: 1.5
};
```

### Query Generation

```typescript
async function generateCuriosityQueries(): Promise<CuriosityQuery[]> {
  // Analyze gaps in knowledge
  const knowledgeGaps = await identifyKnowledgeGaps();
  
  // Score by potential value
  const scoredQueries = knowledgeGaps.map(gap => ({
    query: gap.question,
    curiosity_score: calculateCuriosityScore(gap),
    domain: gap.domain,
    explored: false
  }));
  
  // Return top queries
  return scoredQueries
    .sort((a, b) => b.curiosity_score - a.curiosity_score)
    .slice(0, EXPLORATION_POLICY.max_queries_per_cycle);
}
```

---

## Confidence Tracking

### Confidence Model

```typescript
interface ConfidenceModel {
  // Base confidence from source
  source_confidence: number;
  
  // Adjustment from cross-verification
  verification_adjustment: number;
  
  // Time decay factor
  time_decay: number;
  
  // Usage-based reinforcement
  usage_reinforcement: number;
  
  // Final confidence score
  final_score: number;
}
```

### Confidence Calculation

```typescript
function calculateConfidence(memory: Memory): number {
  const base = memory.source_confidence || 0.5;
  const verification = memory.cross_verified ? 0.2 : 0;
  const decay = calculateTimeDecay(memory.created_at);
  const usage = Math.min(memory.usage_count * 0.02, 0.2);
  
  return Math.min(base + verification - decay + usage, 1.0);
}

function calculateTimeDecay(createdAt: Date): number {
  const daysSince = daysBetween(createdAt, new Date());
  // 1% decay per 30 days, max 20%
  return Math.min(daysSince / 3000, 0.2);
}
```

---

## Metrics & Monitoring

### Learning Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| learning_velocity | Rate of new knowledge acquisition | > 0.7 |
| pattern_detection_rate | Patterns found per cycle | > 2 |
| memory_utilization | Hot memory usage | 60-80% |
| confidence_average | Mean confidence score | > 0.75 |
| edge_density | Graph connectivity | > 3 edges/node |

### Cycle Logging

```sql
CREATE TABLE learning_cycles (
  id UUID PRIMARY KEY,
  cycle_number INTEGER,
  status VARCHAR,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_calls INTEGER,
  insights_generated INTEGER,
  metadata JSONB
);
```

---

## Scheduled Jobs

| Job | Schedule | Function |
|-----|----------|----------|
| cascade-continuous-learn | */10 * * * * | Continuous learning |
| cascade-operative-mode | */15 * * * * | Operative cycle |
| brain-reflection | 0 3 * * * | Daily reflection |
| memory-compression | 0 4 * * * | Hot→Cold migration |
| pattern-detection | 0 */6 * * * | Pattern analysis |

---

## API Integration

### Learning Intake

```typescript
// POST /pf-cascade-learn
interface LearnRequest {
  content: string;
  source: string;
  domain?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

interface LearnResponse {
  success: boolean;
  memory_id: string;
  edges_created: number;
  confidence: number;
}
```

### Trigger Reflection

```typescript
// POST /pf-brain-reflect
interface ReflectRequest {
  force?: boolean;
  depth?: 'shallow' | 'deep';
}

interface ReflectResponse {
  success: boolean;
  reflection_id: string;
  insights_count: number;
  duration_ms: number;
}
```

---

## Ownership & Licensing

promptfluid® is a registered trademark. For ownership inquiries, licensing arrangements, or enterprise partnerships:

| Contact | Details |
|---------|---------|
| **Founder** | Kenneth E Sweet Jr |
| **Email** | promptfluid@gmail.com |
| **Phone** | (760) FLUID-AI |
| **Web** | https://promptfluid.com |

---

**Last Updated:** January 13, 2026  
**Document Status:** STABLE
