# Context-Aware Memory Recall

**Module Synergy**: BRAIN + DREAM + DECODE  
**Capability ID**: `contextual_memory_recall`  
**Status**: Production Ready

---

## Overview

Context-Aware Memory Recall surfaces relevant memories at the right moment during conversations. The system understands current context and retrieves supporting memories without explicit queries, creating more coherent and informed responses.

---

## Capabilities

### Contextual Triggering
- Analyzes conversation flow for memory cues
- Identifies relevant knowledge domains
- Weights recency, importance, and relevance

### Intelligent Retrieval
- Fetches related memories across categories
- Surfaces connections user may not have considered
- Ranks by contextual relevance score

### Seamless Integration
- Injects memories naturally into responses
- Cites sources when appropriate
- Avoids overwhelming with irrelevant context

---

## User Benefits

| Benefit | Description |
|---------|-------------|
| **Informed Responses** | Always have relevant context available |
| **Discovered Connections** | Find links between disparate knowledge |
| **Natural Flow** | Memories enhance, not interrupt |
| **Continuous Improvement** | Better recall as more memories accumulate |

---

## Integration Points

- **BRAIN**: Memory storage, indexing, and retrieval
- **DREAM**: Pattern synthesis and connection discovery
- **DECODE**: Response generation with memory context

---

## Usage

```typescript
import { capabilities } from '@/lib/substrate';

// Query with automatic context recall
const response = await capabilities.execute('contextual_memory_recall', {
  query: 'What did we discuss about API design?',
  contextWindow: 'last_7_days',
  maxMemories: 5
});

// Relevant memories automatically surfaced
response.memories.forEach(m => {
  console.log(`${m.type}: ${m.summary}`);
});
```

---

**See Also**: [BRAIN Module](./13-BRAIN-MODULE.md) | [DREAM Module](./15-DREAM-MODULE.md) | [DECODE Module](./14-DECODE-MODULE.md)
