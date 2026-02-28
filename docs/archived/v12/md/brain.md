# BRAIN — Cognition Node

## Purpose
BRAIN handles reasoning, knowledge management, and cognitive operations. It provides the substrate's thinking layer including memory consolidation, semantic search, and knowledge graph navigation.

## Namespace
`brain.*`

## Command Examples
```
brain.reason <query>       # Execute reasoning chain
brain.remember <content>   # Store memory entry
brain.recall <query>       # Semantic memory recall
brain.consolidate          # Trigger memory consolidation
brain.knowledge.search     # Knowledge graph search
brain.batch.ingest <data>  # Bulk memory ingestion
```

## Response Shape
```typescript
interface ReasoningResult {
  success: boolean;
  reasoning: string;
  confidence: number;
  sources: string[];
  causalLinks?: CausalLink[];
  duration: number;
}
```

## Failure Modes
- **Reasoning timeout**: Complex reasoning chains exceed time budget → partial result returned
- **Memory overflow**: Working memory exceeds capacity → oldest entries evicted
- **Consolidation failure**: Memory tier promotion fails → retry with exponential backoff

## Governance Implications
- Memory storage operations are subject to epistemic validation
- Reasoning outputs carry provenance tags for traceability
- Knowledge graph mutations require governance approval in strict mode
