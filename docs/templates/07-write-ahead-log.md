# 07 — Write-Ahead Log (WAL)

> **Module:** MEMORY | **Source:** `src/crownjewels/s-tier/010-write-ahead-log.ts`

Crash-recoverable operation journal. Every mutation is logged before execution, enabling replay on failure. Supports checkpoints, compaction, and configurable durability guarantees.

## Quick Start

```typescript
import { createWriteAheadLog } from './write-ahead-log';

const wal = createWriteAheadLog({ maxRetries: 3 });

// Execute with automatic WAL guarantee
const { result, entry } = await wal.execute(
  'create_user',
  { name: 'Alice', email: 'alice@example.com' },
  async (payload) => {
    const user = await db.users.create(payload);
    return user;
  },
);

// Checkpoint before risky operations
const cp = wal.checkpoint();
// ... risky operations ...
const pending = wal.replaySince(cp); // replay if needed
```

## API Reference

| Method | Description |
|--------|-------------|
| `append(op, payload)` | Log an operation before execution |
| `commit(seq)` | Mark entry as successfully committed |
| `rollback(seq, error?)` | Mark entry as rolled back |
| `fail(seq, error)` | Record failure with retry tracking |
| `execute(op, payload, fn)` | Append + execute + auto-commit/rollback with retry |
| `checkpoint(id?)` | Create a named checkpoint at current sequence |
| `replaySince(cpId)` | Get all entries after a checkpoint |
| `getPending()` | Get all pending (uncommitted) entries |
| `compact()` | Remove committed entries before oldest checkpoint |
| `persist()` | Flush entries to external storage |
| `restore()` | Load entries from external storage |
| `getStats()` | Get WAL statistics |

## Use Cases

- **Database migrations** — Log each step, rollback on failure
- **Saga orchestration** — Track multi-service transactions
- **Undo/redo systems** — Replay operations in either direction
- **Agent task durability** — Survive crashes during AI workflows
