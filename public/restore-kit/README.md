# CMPSBL® Substrate Restore Kit v1.0.0

**100% standalone disaster recovery.** This kit restores a CMPSBL full-backup ZIP into any Supabase project — no Lovable account required.

## Prerequisites

- **Node.js 18+** (uses native `fetch`, `DecompressionStream`, `fs`)
- A **full-backup ZIP** from the FAILSAFE backup system
- Target **Supabase project URL** and **service_role key**

## Quick Start

```bash
# 1. Download the backup ZIP from your admin panel or storage bucket
# 2. Run the restore:

node restore.mjs full-backup-2026-04-03.zip \
  https://YOUR-PROJECT.supabase.co \
  YOUR_SERVICE_ROLE_KEY
```

## Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Validate backup structure without writing any data |
| `--skip=table1,table2` | Skip specific tables during restore |

## What Gets Restored

| Component | Included | Notes |
|-----------|----------|-------|
| All database tables | ✅ | Paginated JSON, upserted with conflict resolution |
| OpenAPI schema | ✅ | Column types and relationships for verification |
| Storage bucket inventory | ✅ | File listings (not file contents) |
| RESTORE.md guide | ✅ | AI-ready reconstruction instructions |
| Edge functions | ❌ | Redeploy from source: `npx supabase functions deploy` |
| Storage file contents | ❌ | Re-upload from your file backups |

## How It Works

1. Reads the ZIP using a zero-dependency ZIP parser (no `unzip` or `jszip` needed)
2. Validates ZIP structure (magic bytes, EOCD marker, manifest)
3. Connects to target Supabase via PostgREST API
4. Upserts all table data in 200-row batches with automatic conflict resolution
5. Generates a detailed `restore-report-*.json` with per-table results

## Recovery Scenarios

### Full restoration to new Supabase project
```bash
node restore.mjs backup.zip https://new-project.supabase.co SERVICE_KEY
```

### Validate backup integrity without restoring
```bash
node restore.mjs backup.zip https://project.supabase.co SERVICE_KEY --dry-run
```

### Partial restore (skip large telemetry tables)
```bash
node restore.mjs backup.zip https://project.supabase.co SERVICE_KEY \
  --skip=ai_usage_log,brain_events,analytics_events
```

## Important Notes

- **Schema must exist first.** This tool restores *data*, not table schemas. Run your migrations before restoring data.
- **RLS is bypassed** via the service_role key — this is intentional for disaster recovery.
- **Conflict resolution** uses `merge-duplicates` (upsert) — existing rows are updated, new rows are inserted.
- **No external dependencies** — the entire restore runs on Node.js built-ins.

## Files

- `restore.mjs` — The restore script (single file, ~300 lines)
- `README.md` — This file

---

© 2025–2026 CMPSBL® / PromptFluid™. All rights reserved.
