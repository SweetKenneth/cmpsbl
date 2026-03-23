# Autonomous Decision Authority (ADA) — System Reference

**Version:** 1.0.0  
**Last Updated:** 2026-03-23

---

## Quick Reference

### Evaluate a Decision
```typescript
import { evaluateDecision } from '@/lib/substrate/autonomous-decision';

const verdict = evaluateDecision({
  id: crypto.randomUUID(),
  nodeId: 'DEFENSE',
  domain: 'threat-response',
  action: 'block-ip',
  urgency: 'urgent',
  confidence: 0.85,
  reasoning: 'Repeated honeypot hits from this IP',
  context: { ip: '192.168.1.100', hits: 15 },
  timestamp: Date.now(),
});
// verdict.outcome: 'approved' | 'denied' | 'deferred' | 'escalated'
```

### Report Outcome (Trust Calibration)
```typescript
import { reportOutcome } from '@/lib/substrate/autonomous-decision';
reportOutcome('DEFENSE', true); // Decision was successful
```

### Query Node Autonomy
```typescript
import { getNodeAutonomy } from '@/lib/substrate/autonomous-decision';
const autonomy = getNodeAutonomy('BRAIN');
// { trustScore: 67, decisionsThisHour: 12, suspended: false, ... }
```

### Check Action Permission
```typescript
import { isActionAllowed } from '@/lib/substrate/autonomous-decision';
isActionAllowed('threat-response', 'block-ip');    // true
isActionAllowed('threat-response', 'evolve');       // false (always)
```

---

## File Map

| File | Purpose |
|------|---------|
| `src/lib/substrate/autonomous-decision/index.ts` | Public API exports |
| `src/lib/substrate/autonomous-decision/types.ts` | Type definitions |
| `src/lib/substrate/autonomous-decision/scopes.ts` | 15 decision domain definitions |
| `src/lib/substrate/autonomous-decision/engine.ts` | 7-gate evaluation pipeline |

---

## Domain → Node Quick Lookup

| Node | Domain(s) |
|------|-----------|
| DEFENSE | threat-response, — |
| IMMUNITY | threat-response, resilience |
| MEMORY | memory-management |
| BRAIN | memory-management |
| NERVE | signal-routing |
| INTENT | signal-routing |
| SYSTEM | resource-allocation |
| ENGINEER | resource-allocation |
| DREAM | data-synthesis |
| ORACLE | data-synthesis |
| GOVERNANCE | governance-enforcement |
| CONSCIENCE | governance-enforcement |
| ACCESS | access-control |
| IDENTITY | access-control |
| ENCODE | code-quality |
| SHADOW | code-quality |
| HARVEST | pattern-detection |
| OBSERVER | pattern-detection |
| ECHO | communication |
| LINGUA | communication |
| RELAY | communication |
| CORTEX | operational |
| FORGE | operational |
| ATLAS | operational |
| COMPASS | operational |
| SIMULATE | simulation |
| SANDBOX | simulation |
| TREATY | diplomatic |
| SOVEREIGN | diplomatic |
| EDGE | edge-compute |
| PHANTOM | edge-compute |

---

© 2025–2026 CMPSBL®. Confidential.
