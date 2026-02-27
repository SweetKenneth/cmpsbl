# DREAM — Synthesis Node

## Purpose
DREAM handles latent pattern extraction, creative synthesis, nocturnal optimization, and idea incubation. It operates during idle periods to consolidate learning and generate novel insights.

## Namespace
`dream.*`

## Command Examples
```
dream.cycle              # Trigger a dream synthesis cycle
dream.patterns           # List extracted latent patterns
dream.synthesize <topic> # Creative synthesis on a topic
dream.insights           # Recent dream-generated insights
dream.schedule           # View incubation schedule
```

## Response Shape
```typescript
interface DreamCycleResult {
  success: boolean;
  patterns: LatentPattern[];
  insights: SynthesisOutput[];
  consolidations: number;
  duration: number;
}
```

## Failure Modes
- **Resource contention**: DREAM cycles compete with active operations → deferred to next idle window
- **Pattern noise**: Low-confidence patterns detected → filtered below threshold
- **Synthesis divergence**: Creative output drifts from grounded knowledge → governance guardrails applied

## Governance Implications
- DREAM outputs are marked as `speculative` and do not directly modify system state
- Pattern mutations require confirmation before application
- Dream cycle frequency is governed by budget allocation (CLM budget governor)
