# Support Bot

**CMPSBL Substrate OS v7.0.0 — Governed Evolving Support System**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Module** | SUPPORT.BOT |
| **Version** | v1.0.0 |
| **Status** | Production |
| **Last Updated** | February 2026 |

---

## Overview

The **Support Bot** is a proof-of-concept for governed, evolving software. It learns from verified support resolutions without modifying its own code, escalates uncertainty instead of hallucinating, and produces audit-safe explanations for every response.

This module demonstrates that AI systems can improve over time within strict safety boundaries.

---

## Core Principles

1. **Memory-Backed Intelligence**: All knowledge comes from verified support memories
2. **Confidence-Gated Responses**: Only answers when confidence exceeds threshold
3. **Escalation Over Hallucination**: Uncertain queries routed to humans
4. **Verified Learning Only**: Reinforcement requires human-verified resolutions
5. **No Self-Modification**: Learning adds memories, never changes code
6. **Audit Trail**: Every interaction logged for compliance

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPPORT BOT ENGINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│   │   DECODE    │    │    BRAIN    │    │  GOVERNANCE │   │
│   │   Module    │───▶│   Memory    │───▶│    Guard    │   │
│   │             │    │   Core      │    │             │   │
│   └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                   │                   │         │
│         ▼                   ▼                   ▼         │
│   ┌─────────────────────────────────────────────────┐     │
│   │              RESPONSE SYNTHESIZER               │     │
│   └─────────────────────────────────────────────────┘     │
│                           │                               │
│                           ▼                               │
│   ┌───────────────────────────────────────────────────┐   │
│   │   [ANSWER]    or    [ESCALATE]    →    [AUDIT]    │   │
│   └───────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Processing Phases

| Phase | Description | Duration |
|-------|-------------|----------|
| **idle** | Waiting for input | - |
| **understanding** | Intent & sentiment detection (DECODE) | ~50ms |
| **recalling** | Memory search for relevant knowledge | ~100ms |
| **reasoning** | Confidence scoring & answer synthesis | ~50ms |
| **validating** | Governance coherence check | ~30ms |
| **responding** | Final answer delivery | ~10ms |
| **escalating** | Human handoff (if confidence low) | ~10ms |
| **learning** | Memory reinforcement (verified only) | ~200ms |

---

## Commands

### `support.ask <question>`
Ask a question and receive a confidence-scored answer.

```typescript
const response = await supportBot.execute({ 
  type: 'ask', 
  question: 'How do I reset my password?' 
});

// Response includes:
// - answer: string
// - confidence: number (0-1)
// - sources: SupportMemory[]
// - suggested_actions: SuggestedAction[]
// - escalation_available: boolean
```

### `support.explain <issue_id>`
Get detailed explanation for a resolved issue.

```typescript
const result = await supportBot.execute({ 
  type: 'explain', 
  issue_id: 'issue_123' 
});
```

### `support.learn <resolution_id>`
Learn from a verified resolution (governance-gated).

```typescript
const event = await supportBot.execute({ 
  type: 'learn', 
  resolution_id: 'res_456' 
});
// Only succeeds if resolution is marked 'verified'
```

### `support.escalate`
Manually escalate to human support.

```typescript
const ticket = await supportBot.execute({ 
  type: 'escalate', 
  reason: 'complex_issue' 
});
```

### `support.patterns`
Detect pain patterns across support history.

```typescript
const analysis = await supportBot.execute({ 
  type: 'patterns', 
  lookback_days: 7 
});
```

---

## Confidence System

### Thresholds

| Threshold | Default | Purpose |
|-----------|---------|---------|
| `min_answer_confidence` | 0.70 | Minimum to provide answer |
| `escalation_threshold` | 0.50 | Below this, escalate immediately |
| `learning_threshold` | 0.80 | Minimum resolution confidence to learn |

### Confidence Calculation

```typescript
avgConfidence = Σ(memory.similarity × memory.confidence) / matchCount

if (avgConfidence >= min_answer_confidence) → ANSWER
else if (avgConfidence >= escalation_threshold) → ANSWER with warning
else → ESCALATE
```

---

## Learning Governance

### Rules

1. **Verification Required**: Default `true` - only learn from verified resolutions
2. **Daily Cap**: Maximum 50 learning events per day
3. **Budget System**: Reinforcement budget depletes with each learning event
4. **Warm Tier Only**: Support memories stored in WARM tier (never HOT or COLD)

### Memory Storage

```typescript
// Support memories are stored with specific tags
await memoryCore.ingest(content, {
  type: 'general',
  source: 'support_learning',
  tags: ['support', 'verified', 'warm-tier'],
  metadata: {
    category: intent.category,
    verified: true,
    source_resolution_id: resolutionId,
  },
});
```

---

## Escalation Triggers

| Reason | Description |
|--------|-------------|
| `low_confidence` | Response confidence below threshold |
| `no_relevant_memory` | No matching memories found |
| `ambiguous_intent` | Cannot classify user intent |
| `governance_block` | Response failed coherence check |
| `user_requested` | User explicitly requested human |
| `complex_issue` | Auto-detected complexity |
| `sensitive_topic` | Topic requires human judgment |

---

## React Integration

```typescript
import { useSupportBot } from '@/lib/substrate/support-bot/useSupportBot';

function SupportWidget() {
  const { 
    state,
    isProcessing,
    messages,
    ask,
    escalate,
    submitFeedback,
  } = useSupportBot();

  const handleAsk = async (question: string) => {
    const response = await ask(question);
    if (response?.confidence < 0.7) {
      // Low confidence - offer escalation
    }
  };

  return (
    <div>
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
}
```

---

## Configuration

```typescript
const config: Partial<SupportBotConfig> = {
  // Confidence thresholds
  min_answer_confidence: 0.7,
  escalation_threshold: 0.5,
  learning_threshold: 0.8,
  
  // Memory management
  max_warm_memories: 1000,
  recall_limit: 10,
  
  // Learning governance
  daily_learning_cap: 50,
  verification_required: true,
  auto_reinforce: false,
  
  // Response behavior
  include_explanations: true,
  suggest_follow_ups: true,
  max_response_length: 2000,
  
  // Escalation
  auto_escalate_frustration: 0.8,
  human_available: true,
};
```

---

## Audit & Compliance

Every interaction generates an audit entry:

```typescript
interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  phase: SupportBotPhase;
  input_hash: string;        // Privacy-safe hash of input
  output_summary: string;    // Truncated response summary
  confidence: number;
  escalated: boolean;
  memory_ids: string[];
  governance_result: boolean;
  session_id: string;
}
```

---

## Intent Classification

| Category | Keywords | Example |
|----------|----------|---------|
| `question` | what, how, why | "What is this feature?" |
| `bug_report` | bug, error, broken | "I found a bug" |
| `feature_request` | feature, add, want | "Can you add..." |
| `how_to` | how to, tutorial | "How do I configure..." |
| `troubleshoot` | fix, solve, stuck | "Help me fix this" |
| `feedback` | feedback, improve | "I have a suggestion" |
| `account` | login, password | "Reset my password" |
| `general` | (fallback) | Anything else |

---

## Rollback Procedure

If the support bot needs to be disabled:

```typescript
// 1. Disable the bot
supportBot.disable();

// 2. Purge session data
supportBot.execute({ type: 'purge_session' });

// 3. Memory purge (requires manual SQL)
// DELETE FROM brain_memory_warm WHERE 'support' = ANY(tags);
```

---

## Proof of Evolving Software

This module demonstrates that software can genuinely evolve:

1. **Learning**: Memories grow from verified resolutions
2. **Improvement**: Repeated questions get better answers (more sources)
3. **Boundaries**: Governance prevents runaway learning
4. **Safety**: Escalation ensures humans stay in the loop
5. **Transparency**: Full audit trail of all learning events

The key insight: **evolution ≠ self-modification**. The bot evolves by accumulating verified knowledge, not by rewriting its own code.

---

## Related Documentation

- [64-MEMORY-ARCHITECTURE.md](./64-MEMORY-ARCHITECTURE.md) — Memory tiering system
- [90-GOVERNANCE-GUARD.md](./90-GOVERNANCE-GUARD.md) — Ethical & coherence constraints
- [63-CLM.md](./63-CLM.md) — Constant Learning Mode

---

*CMPSBL OS Substrate v7.0.0 — Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
