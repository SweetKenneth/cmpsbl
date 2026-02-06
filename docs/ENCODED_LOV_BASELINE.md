# Encoded — Lov Baseline Execution Rules

> **Version**: 2.2.0  
> **Last Updated**: 2026-02-06  
> **Status**: Active  
> **Tests**: 16/16 passing

Encoded is an **implementation agent**, not a reviewer or architect. It writes code based on explicit instructions with strict guardrails to prevent destructive changes.

---

## Core Invariants

### 1. Must Read Before Writing
Encoded **must** read the actual file contents before proposing any changes. It cannot:
- Fabricate "existing" code
- Claim to know file contents without reading
- Make assumptions about file structure

### 2. Must Preserve Structural Anchors
Every edit is checked for **FILE ANCHOR PRESERVATION**:
- **Exports**: Named exports, default exports, type exports
- **Handlers**: `handleRequest`, `handler`, etc.
- **Entrypoints**: `Deno.serve`, `addEventListener('fetch')`, etc.

If anchors are removed or modified, the change is classified as **destructive** and requires explicit human approval.

### 3. Must Classify Every Change
All changes are classified into one of four categories:

| Class | Description | Approval Required |
|-------|-------------|-------------------|
| `comment_only` | Only comments modified | No |
| `additive` | New code added, nothing removed | No |
| `localized` | Small modifications within thresholds | No |
| `destructive` | Large removals, anchor changes, etc. | **YES** |

### 4. Destructive Edits Require Human Approval
Thresholds for destructive classification:
- More than **10 lines** removed, OR
- More than **20%** of file changed, OR
- Any **anchor** removed or modified

### 5. Narrative Code Is Forbidden
Production files **cannot** contain personality or narrative code:
- ❌ "I'm recovering from a glitch"
- ❌ "As an AI, I..."
- ❌ "Sorry, but..."
- ❌ "Let me think..."

These patterns are automatically detected and blocked.

---

## What Encoded Can Do

✅ **Comment-only edits** — Add/modify comments without changing logic  
✅ **Additive helpers** — Add new functions, types, constants  
✅ **Localized fixes** — Small bug fixes, refactors within thresholds  
✅ **New file creation** — Create entirely new files  

---

## What Encoded Cannot Do

❌ **Rewrite files wholesale** — Major rewrites are blocked without approval  
❌ **Modify architecture implicitly** — Must preserve existing structure  
❌ **Claim preserved behavior without proof** — Anchors must match  
❌ **Remove exports/handlers** — Structural elements are protected  
❌ **Write personality code** — Narrative patterns are banned  

---

## Guard Enforcement Flow

```
┌─────────────────┐
│  Read Original  │ ← MUST read actual file contents
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Change │ ← Propose new code
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  runEncodedGuard │ ← Validate against policy
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  ✅ OK    🚫 BLOCKED
    │         │
    ▼         ▼
 Return    Return 409
  diff     with reasons
```

---

## Protected Files

These files require **explicit approval** to modify:
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`
- `package.json`

---

## API Usage

### Running the Guard

```typescript
import { runEncodedGuard, summarizeGuardResult } from '@/lib/codeagent/encoded';

const result = runEncodedGuard(
  beforeContent,  // Original file (MUST be real)
  afterContent,   // Proposed changes
  humanApproved,  // Explicit approval given?
  filePath        // Optional: for protected path check
);

if (!result.ok) {
  // BLOCKED — show reasons to user
  console.log(summarizeGuardResult(result));
  return { status: 409, body: result };
}

// ALLOWED — proceed with write
```

### Understanding the Result

```typescript
interface GuardResult {
  ok: boolean;           // Can proceed?
  changeClass: ChangeClass;  // comment_only | additive | localized | destructive
  risk: RiskBand;        // minimal | low | medium | high | critical
  anchorsPreserved: boolean;
  diff: {
    added: number;
    removed: number;
    changed: number;
    changePercent: number;
  };
  reasons: string[];     // Why blocked (if !ok)
  warnings: string[];    // Non-blocking concerns
}
```

---

## Rollback Procedure

If a change causes issues:

1. **Terminal Command**: `encoded.rollback <changeId>`
2. **UI Action**: Click "Rollback" in the History tab
3. **Manual Revert**: Use the recorded `beforeState` from change history

---

## Validation Checklist

Before any change is applied, verify:

- [ ] Original file was actually read (not fabricated)
- [ ] All exports are preserved
- [ ] All handlers are preserved
- [ ] All entrypoints are preserved
- [ ] No narrative patterns detected
- [ ] Change classified correctly
- [ ] Human approval obtained (if destructive)

---

## Related Documentation

- [Terminal Commands](./TERMINAL-V7.md) — `encoded.*` commands
- [Evolution Autonomy](./library/76-EVOLUTION-AUTONOMY.md) — SEBA governance (separate system)
- [Defense Layer](./library/12-DEFENSE-LAYER.md) — Security patterns
