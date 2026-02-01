# Capability System Manifest
## v7.0.0 — Edge Function De-duplication + Auto-Adapt

Generated: 2026-02-01

---

## System Overview

The Capability System provides a governed, modular approach to edge function management:

1. **Registry** (`src/lib/capabilities/registry.ts`) — Single source of truth for all capabilities
2. **Adapter** (`src/lib/capabilities/adapter.ts`) — Universal invocation wrapper with governance
3. **Guards** (`src/lib/capabilities/guards.ts`) — Safety + governance enforcement layer
4. **Auto-Loader** (`src/lib/capabilities/auto-loader.ts`) — Filesystem scanner for drop-in capabilities
5. **Confidence** (`src/lib/capabilities/confidence.ts`) — Feedback + scoring system
6. **Normalize** (`src/lib/capabilities/normalize.ts`) — Output shaping for consistent responses

---

## Terminal Commands

| Command | Description | Flags |
|---------|-------------|-------|
| `system.scan_adapt` | Scan edge functions for overlap and auto-adapt | `--dry-run` (default), `--confirm`, `--prune-unused`, `--verbose` |
| `system.capabilities` | List all registered capabilities | `--active`, `--deprecated`, `--all` |
| `system.capability <id>` | Get capability details | — |

---

## Capability Metadata Contract

Each edge function in `/edge/capabilities/` MUST include:

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
| `pf-ripple-image` | 2026-02-01 | Was 402 stub (disabled), FULL overlap with RIPPLE module |

---

## FULL Overlap (Recommended for Deletion)

| Edge Function | Substrate Module | Action |
|---------------|------------------|--------|
| `pf-clarity-scan` | INCLUSIVE.scan | Review usage before deletion |
| `pf-defense-security-report` | DEFENSE.security_report | Review usage before deletion |
| `pf-modernizer-export` | MODERNIZER.export | Has active frontend usage |
| `pf-marketing-strategy` | Uses free-tier router | Standalone OK |

---

## Removability Guarantee

- Removing a file from `/edge/capabilities/` automatically deprecates the capability
- Registry updates are idempotent
- System boots clean without removed features
- No orphaned logic remains after deletion

---

## Usage

### React Hook

```typescript
import { useCapabilities } from '@/hooks/useCapabilities';

function MyComponent() {
  const { capabilities, scanAndAdapt, invoke } = useCapabilities();
  
  // Scan for overlaps
  await scanAndAdapt({ dryRun: true });
  
  // Invoke a capability
  const result = await invoke('my-capability', { input: 'data' }, 'DECODE');
}
```

### Direct Import

```typescript
import { 
  runScanAdapt, 
  invokeCapability, 
  listCapabilities 
} from '@/lib/capabilities';

// Scan
const result = runScanAdapt({ dryRun: true, verbose: true });

// Invoke
const response = await invokeCapability({
  capabilityId: 'my-capability',
  input: { data: 'value' },
  callerModule: 'CORTEX',
  timestamp: new Date().toISOString(),
});
```

---

promptfluid® v7.0.0 — Capability Auto-Adapt System
