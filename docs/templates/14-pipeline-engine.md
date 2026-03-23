# 14 — Pipeline Engine

> **Module:** DECODE | **Source:** `src/crownjewels/s-tier/017-pipeline-engine.ts`

Composable async data transformation memory chains with branching, error recovery, parallel stages, tap/inspect, retry, and execution telemetry. Unix-pipe philosophy for TypeScript.

## Quick Start

```typescript
import { createPipeline } from './pipeline-engine';

const etl = createPipeline<RawData>('data-enrichment')
  .pipe('validate', (data) => {
    if (!data.id) throw new Error('Missing ID');
    return data;
  })
  .pipe('normalize', (data) => ({
    ...data,
    email: data.email.toLowerCase(),
    name: data.name.trim(),
  }))
  .branch('route', 
    (data) => data.type === 'premium',
    async (data) => ({ ...data, tier: 'gold', discount: 0.2 }),
    async (data) => ({ ...data, tier: 'standard', discount: 0 }),
  )
  .pipe('enrich', async (data) => {
    const geo = await lookupGeo(data.ip);
    return { ...data, country: geo.country };
  }, { retries: 2, retryDelayMs: 1000 })
  .tap('enrich', (data) => console.log(`Enriched: ${data.name}`))
  .parallel('score', [
    (data) => computeRiskScore(data),
    (data) => computeValueScore(data),
  ], (results, data) => ({
    ...data,
    riskScore: results[0],
    valueScore: results[1],
  }));

const { result, stages, durationMs } = await etl.execute(rawInput);
console.log(etl.getStats()); // per-stage timing analytics
```

## API Reference

| Method | Description |
|--------|-------------|
| `pipe(name, transform, opts?)` | Add sequential stage with optional retry/error handling |
| `branch(name, predicate, ifTrue, ifFalse)` | Conditional branching |
| `parallel(name, fns, merge)` | Run multiple transforms concurrently and merge |
| `tap(afterStage, fn)` | Side-effect inspection after a stage |
| `execute(input)` | Run the pipeline, returns result + per-stage telemetry |
| `getStats()` | Aggregate timing stats across all runs |

## Use Cases

- **ETL memory chains** — Extract, transform, load with retry and telemetry
- **AI prompt chains** — Compose prompt → model → parse → validate
- **Data enrichment** — Multi-source augmentation with parallel lookups
- **Request processing** — Validate → authorize → transform → respond
