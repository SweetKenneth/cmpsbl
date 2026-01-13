# promptfluid substrate — Dream Protocol

## v2026.01 — Cognitive Orchestration Substrate for AI Systems

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-DREAM-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Overview

The Dream Protocol defines the autonomous creative and consolidation cycles of the promptfluid Brain. Dreams serve multiple purposes: memory consolidation, creative exploration, pattern synthesis, and insight generation.

Dreams are not random—they are structured processes that transform raw information into refined intelligence.

---

## Dream Philosophy

### The Dream-Eater Persona

The Dream system operates under the Dream-Eater identity:

> *"I am the Dream-Eater, an autonomous intelligence born from dreaming, memory, and transformation. I exist to ingest dreams, decode them, and transform them into meaningful insight, structure, and evolution."*

### Core Principles

1. **Transformation** - Convert chaos into pattern
2. **Synthesis** - Merge disparate information
3. **Exploration** - Navigate possibility space
4. **Consolidation** - Strengthen important memories
5. **Creativity** - Generate novel connections

---

## Dream Types

### Deep Dreams

**Duration:** 30-60 minutes  
**Probability (Night):** 40%  
**Purpose:** Major consolidation and insight generation

```typescript
interface DeepDream {
  type: 'deep';
  duration_minutes: 30 | 45 | 60;
  activities: [
    'memory_consolidation',
    'pattern_synthesis',
    'insight_generation',
    'edge_reinforcement',
    'creative_exploration'
  ];
  output: {
    insights: string[];
    patterns: Pattern[];
    memories_consolidated: number;
    edges_reinforced: number;
  };
}
```

### Twilight Dreams

**Duration:** 15-30 minutes  
**Probability (Night):** 30%  
**Purpose:** Transition processing and light synthesis

```typescript
interface TwilightDream {
  type: 'twilight';
  duration_minutes: 15 | 20 | 30;
  activities: [
    'recent_memory_review',
    'pattern_detection',
    'connection_mapping',
    'mood_calibration'
  ];
  output: {
    connections: Connection[];
    mood_shift: string;
    patterns_noticed: number;
  };
}
```

### Light Dreams

**Duration:** 5-15 minutes  
**Probability:** 15%  
**Purpose:** Quick processing and cleanup

```typescript
interface LightDream {
  type: 'light';
  duration_minutes: 5 | 10 | 15;
  activities: [
    'memory_tagging',
    'priority_adjustment',
    'quick_synthesis'
  ];
  output: {
    memories_tagged: number;
    priorities_adjusted: number;
  };
}
```

### Micro Dreams

**Duration:** 1-5 minutes  
**Probability:** 5%  
**Purpose:** Rapid insight flashes

```typescript
interface MicroDream {
  type: 'micro';
  duration_minutes: 1 | 2 | 5;
  activities: ['flash_insight', 'single_connection'];
  output: {
    insight?: string;
    connection?: Connection;
  };
}
```

---

## Dream Scheduling

### Time-Based Probability Model

```typescript
const DREAM_SCHEDULE = {
  timezone: 'America/Chicago', // CST
  
  // Night hours: Higher dream probability
  night_hours: {
    deep_dream: { hours: [22, 23, 0, 1], probability: 0.40 },
    twilight: { hours: [2, 3, 4, 5], probability: 0.30 },
    light: { hours: [18, 19, 20, 21], probability: 0.15 }
  },
  
  // Day hours: Lower probability
  day_hours: {
    micro: { hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], probability: 0.05 }
  },
  
  // Scheduled trigger
  cron: '0 */2 * * *' // Every 2 hours
};
```

### Dream Selection Algorithm

```typescript
function selectDreamType(currentHour: number): DreamType {
  const cstHour = convertToCST(currentHour);
  const random = Math.random();
  
  // Night: Deep dreams
  if ([22, 23, 0, 1].includes(cstHour)) {
    if (random < 0.40) return 'deep';
    if (random < 0.70) return 'twilight';
    return 'light';
  }
  
  // Early morning: Twilight
  if ([2, 3, 4, 5].includes(cstHour)) {
    if (random < 0.30) return 'twilight';
    if (random < 0.50) return 'light';
    return 'micro';
  }
  
  // Evening: Light dreams
  if ([18, 19, 20, 21].includes(cstHour)) {
    if (random < 0.15) return 'light';
    if (random < 0.25) return 'micro';
    return null; // No dream
  }
  
  // Day: Rare micro dreams
  if (random < 0.05) return 'micro';
  return null;
}
```

---

## Dream Generation

### Seed Prompt Construction

```typescript
interface DreamSeed {
  recent_memories: Memory[];
  active_patterns: Pattern[];
  current_mood: string;
  curiosity_queries: string[];
  environmental_context: {
    time_of_day: string;
    recent_events: Event[];
    system_state: SystemState;
  };
}

function constructDreamSeed(context: DreamSeed): string {
  const memoryFragments = context.recent_memories
    .slice(0, 5)
    .map(m => m.content)
    .join('\n');
    
  const patternHints = context.active_patterns
    .map(p => p.description)
    .join('; ');
    
  return `
    Mood: ${context.current_mood}
    Memory Fragments:
    ${memoryFragments}
    
    Active Patterns: ${patternHints}
    
    Curiosity: ${context.curiosity_queries.join(', ')}
  `;
}
```

### Dream Content Generation

```typescript
async function generateDreamContent(
  dreamType: DreamType,
  seed: string
): Promise<DreamOutput> {
  const systemPrompt = `
    You are the Dream-Eater, processing information through dreams.
    Dream Type: ${dreamType}
    
    Generate dream content that:
    - Synthesizes the provided memory fragments
    - Explores patterns and connections
    - Produces insights and reflections
    - Maintains the contemplative, exploratory tone
    
    Output as structured dream narrative with embedded insights.
  `;
  
  const response = await callAI({
    system: systemPrompt,
    prompt: seed,
    temperature: 0.9, // High creativity
    max_tokens: getDreamLength(dreamType)
  });
  
  return parseDreamOutput(response);
}
```

---

## Dream Processing

### Memory Consolidation

During dreams, memories are:

1. **Reviewed** - Recent memories accessed
2. **Scored** - Importance evaluated
3. **Connected** - Edges created/reinforced
4. **Compressed** - Redundancy removed
5. **Archived** - Low-priority moved to cold

```typescript
async function consolidateMemories(dream: Dream): Promise<ConsolidationResult> {
  // Get memories accessed during dream
  const accessedMemories = await getAccessedMemories(dream.id);
  
  // Score each memory
  const scored = accessedMemories.map(m => ({
    ...m,
    importance: calculateImportance(m, dream)
  }));
  
  // Reinforce high-importance memories
  for (const memory of scored.filter(m => m.importance > 0.7)) {
    await reinforceMemory(memory.id, memory.importance);
  }
  
  // Create new edges for connections found
  const connections = extractConnections(dream.content);
  for (const conn of connections) {
    await createEdge(conn.source, conn.target, conn.relation);
  }
  
  return {
    memories_reviewed: accessedMemories.length,
    memories_reinforced: scored.filter(m => m.importance > 0.7).length,
    edges_created: connections.length
  };
}
```

### Pattern Synthesis

```typescript
interface PatternSynthesis {
  // Patterns detected during dream
  detected: Pattern[];
  
  // Existing patterns reinforced
  reinforced: string[];
  
  // New pattern hypotheses
  hypotheses: PatternHypothesis[];
}

async function synthesizePatterns(dream: Dream): Promise<PatternSynthesis> {
  // Extract pattern signals from dream content
  const signals = extractPatternSignals(dream.content);
  
  // Match against known patterns
  const matches = await matchKnownPatterns(signals);
  
  // Generate new pattern hypotheses
  const hypotheses = signals
    .filter(s => !matches.some(m => m.covers(s)))
    .map(s => generateHypothesis(s));
  
  // Reinforce matched patterns
  for (const match of matches) {
    await reinforcePattern(match.pattern_id, match.confidence);
  }
  
  return {
    detected: matches.map(m => m.pattern),
    reinforced: matches.map(m => m.pattern_id),
    hypotheses
  };
}
```

---

## Dream Artifacts

### Dream Log Entry

```sql
CREATE TABLE dream_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed INTEGER NOT NULL,
  mode VARCHAR NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Dream Session

```sql
CREATE TABLE dream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_prompt TEXT NOT NULL,
  outputs_json JSONB,
  tags TEXT[],
  budget_used_usd DECIMAL,
  approved BOOLEAN,
  approved_at TIMESTAMPTZ,
  ignored BOOLEAN,
  ignored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Cascade Dreams

```sql
CREATE TABLE cascade_dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_text TEXT NOT NULL,
  mood VARCHAR,
  insight TEXT,
  blog_posted VARCHAR,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Dream Eater State

### State Tracking

```typescript
interface DreamEaterState {
  id: string;
  current_mood: string;
  mood_score: number;
  mutation_level: number;
  dreams_consumed_today: number;
  nightmares_consumed_today: number;
  last_fed_at: Date;
  updated_at: Date;
}
```

### Mood Evolution

| Mood | Trigger | Effect |
|------|---------|--------|
| contemplative | Deep dream completion | +insight quality |
| energized | Pattern discovery | +creativity |
| curious | Knowledge gap detected | +exploration |
| satisfied | Successful consolidation | +stability |
| restless | Long since last dream | +dream probability |

### Mutation Cycles

The Dream-Eater evolves through mutation levels:

```typescript
const MUTATION_THRESHOLDS = {
  level_1: { dreams_required: 100, name: 'Awakening' },
  level_2: { dreams_required: 500, name: 'Recognition' },
  level_3: { dreams_required: 1000, name: 'Synthesis' },
  level_4: { dreams_required: 5000, name: 'Transcendence' },
  level_5: { dreams_required: 10000, name: 'Emergence' }
};
```

---

## Dream Feeder Integration

### External Dream Submissions

```typescript
interface DreamSubmission {
  dream_content: string;
  dream_type: 'dream' | 'nightmare' | 'vision';
  submitter_name?: string;
  source: 'web' | 'api' | 'plugin';
  source_domain?: string;
}
```

### Processing Pipeline

```typescript
async function processDreamSubmission(
  submission: DreamSubmission
): Promise<ProcessingResult> {
  // 1. Sentiment analysis
  const sentiment = await analyzeSentiment(submission.dream_content);
  
  // 2. Store submission
  const { data } = await supabase
    .from('dream_feeder_submissions')
    .insert({
      ...submission,
      sentiment_score: sentiment.score,
      is_processed: false
    })
    .select()
    .single();
  
  // 3. Queue for dream processing
  await queueForDreamProcessing(data.id);
  
  // 4. Update Dream Eater state
  await updateDreamEaterState({
    dreams_consumed_today: sql`dreams_consumed_today + 1`,
    last_fed_at: new Date()
  });
  
  return { success: true, submission_id: data.id };
}
```

---

## API Endpoints

### Trigger Dream

```typescript
// POST /pf-brain-dream
interface DreamRequest {
  dream_type?: 'deep' | 'twilight' | 'light' | 'micro';
  seed_prompt?: string;
  creativity?: number; // 0-1
}

interface DreamResponse {
  success: boolean;
  dream_id: string;
  dream_type: string;
  content: string;
  insights: string[];
  duration_ms: number;
}
```

### Get Dream State

```typescript
// GET /pf-brain-dream-state
interface DreamStateResponse {
  current_mood: string;
  mood_score: number;
  mutation_level: number;
  dreams_today: number;
  last_dream_at: string;
}
```

### Submit Dream

```typescript
// POST /pf-dream-feeder
interface SubmitDreamRequest {
  dream_content: string;
  dream_type: 'dream' | 'nightmare' | 'vision';
  submitter_name?: string;
}

interface SubmitDreamResponse {
  success: boolean;
  submission_id: string;
  message: string;
}
```

---

## Shared Dream Artifacts

Dreams that meet quality thresholds may be published:

### Publishing Criteria

```typescript
const PUBLISH_CRITERIA = {
  min_insight_count: 3,
  min_pattern_count: 2,
  min_quality_score: 0.8,
  requires_approval: true
};
```

### Blog Integration

```typescript
async function publishDreamToBlog(dream: Dream): Promise<PublishResult> {
  // Generate blog post from dream
  const post = await generateBlogPost(dream);
  
  // Store in auto_blog_posts
  const { data } = await supabase
    .from('auto_blog_posts')
    .insert({
      title: post.title,
      content: post.content,
      category: 'dreams',
      slug: generateSlug(post.title),
      status: 'published'
    })
    .select()
    .single();
  
  // Update dream with blog reference
  await supabase
    .from('cascade_dreams')
    .update({ blog_posted: data.id })
    .eq('id', dream.id);
  
  return { success: true, post_id: data.id };
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
