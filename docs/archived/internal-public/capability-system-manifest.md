# Capability System Manifest
## v7.0.0 — Archived Edge Function Digestion + Dashboard Toggle

Generated: 2026-02-01

---

## System Overview

The Capability System provides a governed, modular approach to edge function management with a focus on **archived edge function digestion**:

1. **Registry** (`src/lib/capabilities/registry.ts`) — Single source of truth for all capabilities
2. **Adapter** (`src/lib/capabilities/adapter.ts`) — Universal invocation wrapper with governance
3. **Guards** (`src/lib/capabilities/guards.ts`) — Safety + governance enforcement layer
4. **Auto-Loader** (`src/lib/capabilities/auto-loader.ts`) — Filesystem scanner for drop-in capabilities
5. **Archived-Loader** (`src/lib/capabilities/archived-loader.ts`) — Scans ONLY archived edge functions
6. **State** (`src/lib/capabilities/state.ts`) — Enable/disable toggle management (persisted)
7. **Confidence** (`src/lib/capabilities/confidence.ts`) — Feedback + scoring system
8. **Normalize** (`src/lib/capabilities/normalize.ts`) — Output shaping for consistent responses

---

## Archived Edge Function Digestion

The system **ONLY** ingests from `supabase/functions/_archived/`:

### Explicitly Ignored Paths:
- `/edge/` (live functions)
- `/edge/live/`
- `/api/edge/`
- Any active production routes

### 10 Adapted Capabilities (High-Value)

| Capability | Edge Function | Modules | Risk | Value |
|------------|---------------|---------|------|-------|
| `hypothesis-test` | `pf-brain-hypothesis-test` | BRAIN, DECODE | low | 95 |
| `systems-reasoning` | `pf-brain-systems-reasoning` | BRAIN, CORTEX | low | 92 |
| `self-critique` | `pf-brain-self-critique` | BRAIN, DECODE | low | 90 |
| `pattern-fusion` | `pf-brain-pattern-fusion` | BRAIN, DREAM | low | 88 |
| `anomaly-detection` | `pf-defense-anomaly-detection` | DEFENSE, VISION | medium | 93 |
| `resilience-monitor` | `pf-resilience-monitor` | SYSTEM, CORE | medium | 96 |
| `temporal-score` | `pf-brain-temporal-score` | BRAIN, DREAM | low | 85 |
| `ethical-boundary` | `pf-brain-ethical-boundary` | BRAIN, CORTEX, DEFENSE | low | 97 |
| `improvement-engine` | `pf-cascade-improvement-engine` | MODERNIZER, CORTEX | medium | 91 |
| `curiosity-reflect` | `pf-brain-curiosity-reflect` | BRAIN, DREAM | low | 84 |

---

## Terminal Commands

| Command | Description | Flags |
|---------|-------------|-------|
| `system.scan_archived` | Scan archived edge functions only | `--dry-run` (default), `--confirm`, `--prune-merged`, `--verbose` |
| `system.scan_adapt` | Scan edge functions for overlap and auto-adapt | `--dry-run`, `--confirm`, `--prune-unused`, `--verbose` |
| `system.capabilities` | List all registered capabilities | `--active`, `--deprecated`, `--all` |
| `system.capability <id>` | Get capability details | — |

---

## Dashboard: Capabilities Tab

Navigate to `/os` → **Evolve** → **Capabilities** to access the toggle panel.

### Features:
- **Stats Overview**: Total, enabled, disabled, average value score
- **Search & Filter**: By name, description, modules, risk level
- **Toggle Controls**: Enable/disable individual capabilities
- **Bulk Actions**: Enable All, Disable All, Scan
- **Persistence**: State stored in localStorage (key: `capability-state-v7`)

### Toggle Behavior:
- Disabled capabilities remain registered but **cannot be invoked**
- DECODE, CORTEX, Terminal respect toggle state
- No page reload required
- Toggles logged with timestamp and actor

---

## Capability Metadata Contract

Archived edge functions MUST include:

```typescript
/*
@capability <name>
@modules <MODULES>
@risk low|medium|high
@reversible true|false
@description <text>
*/
```

If metadata is missing or invalid:
- Adaptation is skipped
- Warning is logged
- Runtime continues without failure

---

## Deleted Edge Functions

| Function | Date | Reason |
|----------|------|--------|
| `pf-ripple-image` | 2026-01-28 | Was 402 stub (disabled), FULL overlap with RIPPLE module |
| `pf-clarity-scan` | 2026-02-01 | FULL overlap with INCLUSIVE.scan |
| `pf-defense-security-report` | 2026-02-01 | FULL overlap with DEFENSE.security_report |

---

## Overlap Classification

| Classification | Action |
|----------------|--------|
| **FULL** | Logic fully merged into substrate. Deletion recommended. |
| **PARTIAL** | Logic split across modules. Add TODO markers. Do NOT delete. |
| **NONE** | Edge-only. Ready for governed adaptation. |

---

## Removability Guarantee

- Removing archived edge file → Deprecates capability automatically
- Disabling capability → No side effects, no orphaned state
- Substrate boots clean with zero capabilities enabled (safe cold boot)

---

## Usage

### React Hook

```typescript
import { useCapabilities } from '@/hooks/useCapabilities';

function MyComponent() {
  const { capabilities, scanAndAdapt, invoke } = useCapabilities();
  
  // Scan archived functions
  await scanAndAdapt({ dryRun: true });
  
  // Invoke a capability
  const result = await invoke('hypothesis-test', { claim: 'test' }, 'DECODE');
}
```

### State Management

```typescript
import { 
  setCapabilityEnabled, 
  isCapabilityEnabled,
  useCapabilityState 
} from '@/lib/capabilities';

// Toggle
setCapabilityEnabled('hypothesis-test', false, 'admin');

// Check
if (isCapabilityEnabled('hypothesis-test')) {
  // invoke...
}
```

### Direct Import

```typescript
import { 
  runScanArchived, 
  ARCHIVED_CAPABILITIES,
  adaptArchivedCapabilities 
} from '@/lib/capabilities';

// Scan archived only
const result = runScanArchived({ dryRun: true, verbose: true });

// Adapt high-value capabilities
adaptArchivedCapabilities({ dryRun: false, minValueScore: 80 });
```

---

promptfluid® v7.0.0 — Archived Edge Function Digestion System
