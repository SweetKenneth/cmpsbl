# Observability — Analytics & Monitoring

## Purpose
The observability layer (OBS) provides cross-cutting analytics, snapshot generation, event aggregation, and real-time monitoring across all substrate nodes.

## Namespace
`obs.*` / `analytics.*`

## Command Examples
```
obs.snapshot              # Generate analytics snapshot
obs.events <module>       # Event stream for module
obs.metrics               # Aggregated runtime metrics
analytics.report          # Full analytics report
analytics.trends          # Trend analysis across modules
```

## Response Shape
```typescript
interface AnalyticsSnapshot {
  type: string;
  timestamp: string;
  healthScore: number;
  activeModules: number;
  totalEvents: number;
  errorRate: number;
  data: Record<string, unknown>;
}
```

## Failure Modes
- **Snapshot generation failure**: Incomplete data collection → partial snapshot with coverage indicator
- **Event backlog**: High event volume causes aggregation delay → batched processing

## Governance Implications
- Analytics data is read-only and does not trigger governance evaluation
- Snapshot data may be exported for external analysis with appropriate access controls
