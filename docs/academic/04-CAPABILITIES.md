# CMPSBL OS Substrate — Capability System

**Document ID:** CMPSBL-ACAD-004  
**Version:** v9.1.0 (ARCHITECT Epoch)

---

## 1. Capability System Overview

The CMPSBL Substrate implements a formal capability system with 400+ registered capabilities across 21 modules. Capabilities are the atomic units of functionality that can be invoked, composed, and governed.

### 1.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Atomicity** | Each capability performs one well-defined operation |
| **Composability** | Capabilities can be combined into synergies |
| **Governability** | All invocations pass through governance checks |
| **Observability** | Every invocation is logged and metered |
| **Reversibility** | Destructive capabilities must be reversible when possible |

### 1.2 Capability Hierarchy

```
┌─────────────────────────────────────────┐
│           Meta-Engines (20)             │
│  High-order orchestration patterns      │
├─────────────────────────────────────────┤
│           Engines (62)                  │
│  Grouped capability bundles             │
├─────────────────────────────────────────┤
│           Capabilities (269)            │
│  Atomic functional operations           │
└─────────────────────────────────────────┘
```

---

## 2. Capability Registration

### 2.1 Registration Schema

```typescript
interface RegisteredCapability {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  source: 'native' | 'edge-adapted' | 'legacy';
  modules: string[];             // Associated modules
  risk: 'low' | 'medium' | 'high';
  reversible: boolean;           // Can be undone
  description: string;           // Purpose description
  status: 'active' | 'deprecated' | 'pending' | 'blocked';
  registeredAt: string;          // ISO timestamp
  lastInvokedAt?: string;        // Last invocation
  invokeCount: number;           // Total invocations
  confidence: number;            // System confidence (0-1)
}
```

### 2.2 Registration Sources

| Source | Description | Count |
|--------|-------------|-------|
| Native | Core substrate capabilities | 142 |
| Edge-Adapted | Edge functions wrapped as capabilities | 98 |
| Legacy | Migrated from previous versions | 29 |

---

## 3. Capability Categories

### 3.1 By Module

| Module | Capabilities | % of Total |
|--------|--------------|------------|
| BRAIN | 34 | 12.6% |
| VISION | 31 | 11.5% |
| NEXUS | 28 | 10.4% |
| DECODE | 26 | 9.7% |
| AGENCY | 24 | 8.9% |
| DEFENSE | 22 | 8.2% |
| INTEGRATION | 21 | 7.8% |
| STREAM | 19 | 7.1% |
| ADAPT | 18 | 6.7% |
| RESOURCE | 16 | 5.9% |
| MODERNIZER | 15 | 5.6% |
| ACCESS | 14 | 5.2% |
| INCLUSIVE | 12 | 4.5% |
| SEBA | 9 | 3.3% |
| **Total** | **269** | **100%** |

### 3.2 By Risk Level

| Risk Level | Count | Governance Requirement |
|------------|-------|------------------------|
| Low | 187 | Standard invocation |
| Medium | 64 | Logged with audit trail |
| High | 18 | Requires explicit approval |

### 3.3 By Reversibility

| Property | Count | Description |
|----------|-------|-------------|
| Reversible | 203 | Can be undone |
| Irreversible | 66 | Permanent effect |

---

## 4. Capability Invocation

### 4.1 Invocation Flow

```
Caller Request
     │
     ▼
┌─────────────┐
│ Guard Check │ ← Risk, permission, rate limit
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Pre-process │ ← Input validation, normalization
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Execute   │ ← Core capability logic
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Post-process│ ← Output normalization, logging
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Telemetry  │ ← Metrics, confidence update
└─────────────┘
```

### 4.2 Invocation Interface

```typescript
interface CapabilityInvocation {
  capabilityId: string;
  input: Record<string, unknown>;
  callerModule: string;
  timestamp: string;
}

interface CapabilityResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
  executionMs: number;
}
```

### 4.3 Batch Invocation

Multiple capabilities can be invoked in parallel:

```typescript
async function invokeBatch(
  invocations: CapabilityInvocation[]
): Promise<CapabilityResult[]>
```

---

## 5. Capability Guards

### 5.1 Guard Interface

```typescript
interface CapabilityGuardContext {
  capability: RegisteredCapability;
  caller: string;
  input: Record<string, unknown>;
}

interface GuardResult {
  allowed: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
}
```

### 5.2 Guard Types

| Guard | Purpose | Failure Action |
|-------|---------|----------------|
| Permission | Verify caller authorization | Reject with 403 |
| Rate Limit | Enforce invocation quotas | Reject with 429 |
| Risk Assessment | Evaluate operation risk | Require approval |
| Dependency | Check prerequisite state | Reject with reason |
| Circuit Breaker | Check system health | Reject if open |

---

## 6. Confidence System

### 6.1 Confidence Scoring

Each capability maintains a confidence score (0-1) based on historical performance:

| Factor | Weight | Description |
|--------|--------|-------------|
| Success Rate | 40% | Percentage of successful invocations |
| Latency Stability | 20% | Consistency of execution time |
| Error Patterns | 20% | Frequency and severity of errors |
| User Feedback | 20% | Explicit feedback signals |

### 6.2 Confidence Thresholds

| Threshold | Meaning | Action |
|-----------|---------|--------|
| ≥ 0.8 | High confidence | Full automation eligible |
| 0.6 - 0.79 | Medium confidence | Standard operation |
| 0.4 - 0.59 | Low confidence | Monitoring required |
| < 0.4 | Very low confidence | Review recommended |

---

## 7. Capability State Management

### 7.1 State Interface

```typescript
interface CapabilityState {
  capabilityId: string;
  enabled: boolean;
  enabledAt?: string;
  disabledAt?: string;
  disabledReason?: string;
}
```

### 7.2 State Transitions

```
┌──────────┐     enable()     ┌──────────┐
│ Disabled │ ───────────────► │ Enabled  │
└──────────┘                  └──────────┘
      ▲                             │
      │         disable()           │
      └─────────────────────────────┘
```

---

## 8. Capability Discovery

### 8.1 Registry API

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| List | `GET /capabilities` | All registered capabilities |
| Get | `GET /capabilities/:id` | Single capability details |
| Search | `GET /capabilities?module=BRAIN` | Filter by criteria |
| Manifest | `GET /capabilities/manifest` | Full registry export |

### 8.2 Discovery Response

```json
{
  "id": "brain.remember",
  "name": "Remember Context",
  "modules": ["BRAIN"],
  "risk": "low",
  "reversible": true,
  "description": "Store context in persistent memory",
  "status": "active",
  "confidence": 0.94,
  "invokeCount": 14523
}
```

---

## 9. Capability Metrics

### 9.1 Tracked Metrics

| Metric | Type | Retention |
|--------|------|-----------|
| Invocation Count | Counter | Indefinite |
| Success Rate | Gauge | 90 days |
| Latency (p50, p95, p99) | Histogram | 30 days |
| Error Rate | Gauge | 90 days |
| Confidence Score | Gauge | Indefinite |

### 9.2 Aggregation Periods

| Period | Granularity | Use Case |
|--------|-------------|----------|
| Real-time | 1 minute | Monitoring |
| Hourly | 1 hour | Dashboards |
| Daily | 1 day | Reports |
| Monthly | 1 month | Billing |

---

## 10. Selected Capability Reference

### 10.1 BRAIN Module Capabilities

| Capability ID | Name | Risk | Description |
|---------------|------|------|-------------|
| brain.remember | Remember | Low | Store in memory |
| brain.recall | Recall | Low | Retrieve from memory |
| brain.dream | Dream Cycle | Medium | Consolidation cycle |
| brain.forget | Forget | High | Permanent deletion |
| brain.merge | Merge Memories | Medium | Combine contexts |

### 10.2 NEXUS Module Capabilities

| Capability ID | Name | Risk | Description |
|---------------|------|------|-------------|
| nexus.route | Route Request | Low | Provider selection |
| nexus.fallback | Fallback | Low | Alternative routing |
| nexus.healthCheck | Health Check | Low | Provider status |
| nexus.switchProvider | Switch Provider | Medium | Manual override |

### 10.3 SEBA Module Capabilities

| Capability ID | Name | Risk | Description |
|---------------|------|------|-------------|
| seba.propose | Propose Change | Medium | Generate proposal |
| seba.evaluate | Evaluate Risk | Low | Risk assessment |
| seba.execute | Execute Change | High | Apply modification |
| seba.stamp | Generate Stamp | Low | Create proof |
| seba.verify | Verify Stamp | Low | Validate authenticity |

---

## 11. Extension Points

### 11.1 Custom Capability Registration

Third-party capabilities can be registered through the extension API:

```typescript
registerCapability({
  id: 'custom.myCapability',
  name: 'My Custom Capability',
  modules: ['INTEGRATION'],
  risk: 'low',
  reversible: true,
  description: 'Custom functionality',
  handler: async (input) => { /* implementation */ }
});
```

### 11.2 Registration Requirements

| Requirement | Description |
|-------------|-------------|
| Unique ID | Namespaced to avoid conflicts |
| Risk Declaration | Accurate risk assessment |
| Handler Function | Async function implementation |
| Documentation | Description and usage |

---

*CMPSBL OS Substrate v9.1.0 — Capability System*  
*© 2025-2026 PromptFluid®. All rights reserved.*
