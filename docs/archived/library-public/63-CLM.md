# Constant Learning Mode (CLM)

**CMPSBL Substrate OS v6.8.0 — Autonomous Self-Improvement System**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Module** | CLM (Cross-cutting) |
| **Version** | v6.8.0 |
| **Status** | Production |
| **Last Updated** | January 2026 |

---

## Overview

**Constant Learning Mode (CLM)** is the substrate's autonomous self-improvement system. It enables each of the 14 kernel modules to continuously analyze their own performance, identify optimization opportunities, and request improvements—all without human intervention.

CLM operates 24/7 via backend scheduling, respecting daily API budget limits while ensuring the system never stops learning.

---

## Architecture

### Two-Tier CLM System

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL CLM                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Budget Governor (70% daily Nexus cap)              │   │
│  │  Topic Bank (weighted selection)                    │   │
│  │  Spaced Repetition Scheduler (SM-2)                 │   │
│  │  Dream/Prune Cycles                                 │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   MODULE CLM                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  BRAIN  │ │ CORTEX  │ │ DEFENSE │ │  NEXUS  │          │
│  │   CLM   │ │   CLM   │ │   CLM   │ │   CLM   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ VISION  │ │ RIPPLE  │ │ ACCESS  │ │INCLUSIVE│          │
│  │   CLM   │ │   CLM   │ │   CLM   │ │   CLM   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │MODERNIZR│ │ SYSTEM  │ │ DECODE  │ │AUTOBLOG │          │
│  │   CLM   │ │   CLM   │ │   CLM   │ │   CLM   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Global CLM

The **Global CLM** orchestrates cross-module learning:

- **Budget Governor**: Caps daily Nexus API usage at 70% to reserve capacity for user operations
- **Topic Bank**: Weighted topic selection across substrate architecture, security, performance
- **Spaced Repetition**: SM-2-inspired scheduler for memory consolidation
- **Dream/Prune**: Periodic cycles that consolidate knowledge graph patterns and eliminate stale edges

### Module CLM

Each of the **14 kernel modules** has its own CLM that:

1. **Gathers Metrics**: Pulls 24h event history from `brain_events`
2. **Self-Analyzes**: Generates AI-powered self-reflection on performance
3. **Stores Learnings**: Writes to `brain_reflection_log` for persistence
4. **Ingests to Memory**: Adds to the cognitive memory core for cross-module access

---

## Module Learning Configurations

Each module has specific KPIs and learning topics:

| Module | KPIs | Learning Topics |
|--------|------|-----------------|
| **BRAIN** | retrieval_precision, consolidation_rate, tier_balance | Memory tiering, knowledge graph density, retrieval tuning |
| **CORTEX** | orchestration_latency, pipeline_success_rate | Module coordination, pipeline optimization |
| **DEFENSE** | threats_blocked, false_positive_rate, response_time | Threat detection, attack vector evolution |
| **NEXUS** | daily_cost_cents, cache_hit_rate, latency_p99 | Cost optimization, provider routing |
| **VISION** | render_time_ms, insight_click_rate | Dashboard responsiveness, insight surfacing |
| **RIPPLE** | webhook_success_rate, sync_latency_ms | Integration reliability, event propagation |
| **ACCESS** | auth_success_rate, permission_check_ms | Authentication flows, billing accuracy |
| **INCLUSIVE** | wcag_coverage, auto_fix_rate | Accessibility scanning, WCAG compliance |
| **MODERNIZER** | evolution_success_rate, shadow_accuracy | Evolution cycles, regression detection |
| **SYSTEM** | uptime_pct, incident_mttr | Health monitoring, self-healing |
| **DECODE** | analysis_accuracy, suggestion_acceptance | Code analysis, pattern recognition |
| **AUTOBLOG** | content_quality_score, uniqueness_score | Content generation, tone consistency |

---

## Self-Analysis Types

CLM generates four types of self-analysis:

1. **Performance**: Metrics review and baseline assessment
2. **Improvement**: Optimization opportunities and enhancement suggestions
3. **Insight**: Pattern discoveries and emergent behaviors
4. **Request**: Specific capability requests from modules to developers

---

## Backend Scheduling

CLM runs continuously via a backend cron job:

```
┌─────────────────────────────────────────────────────────────┐
│  pf-module-clm-scheduler (Edge Function)                   │
├─────────────────────────────────────────────────────────────┤
│  Frequency: Every hour                                      │
│  Budget Check: Skip if >70% daily Nexus usage              │
│  Module Selection: 2-3 random modules per cycle            │
│  Storage: brain_reflection_log + memory_core               │
└─────────────────────────────────────────────────────────────┘
```

### Budget-Aware Operation

The scheduler respects API budget limits:

```typescript
// Skip cycle if budget exceeded
if (usedPercent > 70) {
  return { skipped: true, reason: 'budget_limit' };
}

// Select 2-3 modules per cycle to spread load
const selectedModules = shuffle(MODULE_IDS).slice(0, 3);
```

---

## System Intelligence Feed

The **/system-feed** page displays CLM outputs in real-time:

- **Feed View**: Chronological list of self-analyses with priority badges
- **Module States**: Per-module improvement scores and learning counts
- **Statistics**: Aggregate counts by type and priority
- **Acknowledgment**: Operators can acknowledge insights

> **Note**: The System Feed requires authentication. Only logged-in users can view module intelligence data.

---

## Integration with Other Modules

### BRAIN Module

CLM analyses are stored as reflections in the BRAIN:

```typescript
await memoryCore.ingest(
  `[Module CLM: ${moduleId}] ${analysis.title}`,
  {
    type: 'reflection',
    source: `module_clm_${moduleId}`,
    confidence: analysis.confidence,
    tags: ['module-clm', moduleId, analysisType],
  }
);
```

### RIPPLE Event Bus

CLM can emit improvement requests via Ripple:

```typescript
await ripple.emit('clm:improvement_request', {
  moduleId,
  priority: 'high',
  request: 'Increase cache TTL for frequent queries',
});
```

### VISION Observability

CLM metrics feed into Vision dashboards:

- Module health scores
- Learning velocity
- Cross-module optimization opportunities

---

## React Hook

Frontend components can access CLM state via the `useModuleCLM` hook:

```typescript
import { useModuleCLM } from '@/lib/substrate/module-clm/useModuleCLM';

function SystemFeed() {
  const { 
    feed,           // ModuleSelfAnalysis[]
    loading,
    moduleStates,   // ModuleCLMState[]
    acknowledgeAnalysis,
    refreshFeed,
  } = useModuleCLM();

  return (
    <div>
      {feed.map(analysis => (
        <FeedItem key={analysis.id} analysis={analysis} />
      ))}
    </div>
  );
}
```

---

## Security Considerations

1. **Authentication Required**: The System Feed requires user login to prevent public exposure of internal system intelligence
2. **Budget Limits**: Prevents runaway API costs from autonomous learning
3. **Rate Limiting**: Spreads learning across modules and time
4. **Audit Trail**: All analyses stored in `brain_reflection_log` for forensic review

---

## Configuration

CLM is configured via `MODULE_CLM_CONFIGS`:

```typescript
export const MODULE_CLM_CONFIGS: Record<ModuleName, ModuleLearningConfig> = {
  brain: {
    moduleId: 'brain',
    displayName: 'BRAIN',
    learningTopics: ['memory tiering', 'knowledge graph density'],
    kpis: ['retrieval_precision', 'consolidation_rate'],
    selfReflectionPrompt: `As the BRAIN module, analyze my performance...`,
  },
  // ... other modules
};
```

---

## Future Roadmap

- **v6.9**: Cross-module coordination for optimization chains
- **v7.0**: Predictive learning based on usage patterns
- **v7.1**: Automatic improvement implementation (with approval gates)

---

## Related Documentation

- [13-BRAIN-MODULE.md](./13-BRAIN-MODULE.md) — Memory and learning systems
- [21-MODERNIZER-MODULE.md](./21-MODERNIZER-MODULE.md) — Self-improvement engine
- [22-CORTEX-MODULE.md](./22-CORTEX-MODULE.md) — Orchestration layer

---

*CMPSBL OS Substrate v6.8.0 — Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
