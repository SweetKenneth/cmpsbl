# FAILSAFE — Disaster Recovery Engine
## Installation & Backup Guide

**Version:** 3.0.0  
**License:** Perpetual · Single-seat  
**Runtime:** Sealed · Self-contained  
**Compatibility:** Any Supabase-backed web application  

---

## What Is FAILSAFE?

FAILSAFE is a one-click disaster recovery engine for Supabase-powered applications. It provides:

- **Automated full backups** — exports all your database tables, schema, and storage metadata into a single ZIP archive
- **AI-ready restore instructions** — every backup includes a tailored `RESTORE.md` that any AI coding agent can follow to reconstruct your environment
- **Streaming architecture** — handles large databases efficiently with chunked exports and adaptive page sizing
- **Zero dependencies** — the edge function is fully self-contained. No shared middleware, no external imports beyond the Supabase SDK

---

## Installation

### Step 1 — Deploy the Edge Function

Copy `full-backup/index.ts` into your project's `supabase/functions/` folder:

```
your-project/
├── supabase/
│   └── functions/
│       └── full-backup/
│           └── index.ts    ← The FAILSAFE engine (single file, self-contained)
```

Deploy it:

```bash
npx supabase functions deploy full-backup --project-ref your-project-ref
```

> **That's it.** No other files, no shared utilities, no configuration beyond the function itself.

### Step 2 — Add the Backup Button (Optional)

Add a backup trigger anywhere in your app:

```typescript
import { supabase } from "@/integrations/supabase/client";

async function downloadBackup() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    alert("You must be logged in to create a backup");
    return;
  }

  const projectId = "YOUR_PROJECT_REF";
  const url = `https://${projectId}.supabase.co/functions/v1/full-backup`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: "YOUR_ANON_KEY",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    console.error("Backup failed:", err);
    return;
  }

  // Download the ZIP
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `backup-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

Or call it directly via curl:

```bash
curl -L \
  -X POST \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "apikey: YOUR_ANON_KEY" \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/full-backup" \
  --output backup.zip
```

### Step 3 — (Optional) Restrict to Admin Users

By default, any authenticated user can trigger a backup. To restrict it to admins only, uncomment the admin role check block in `index.ts` (clearly marked with comments). This requires a `user_roles` table with an `admin` role.

### Step 4 — Configure Table Skipping (Optional)

FAILSAFE includes two configuration points at the top of `index.ts`:

- **`SKIP_TABLES`** — a `Set` of exact table names to exclude (e.g., `analytics_events`)
- **`SKIP_TABLE_PATTERNS`** — an array of regex patterns to match table names (e.g., `/_logs?$/`)

Both are empty by default. Add your high-volume tables to keep backups fast:

```typescript
const SKIP_TABLES = new Set([
  'analytics_events',
  'request_logs',
  'audit_trail',
]);
```

Tables you might want to skip:
- Analytics/event tables (regenerated at runtime)
- Log tables (high volume, low restore value)
- Cache tables (rebuilt automatically)

---

## Taking A Backup

1. Trigger the backup (button click, curl, or scheduled cron)
2. Wait for the ZIP to download (typically 10–60 seconds)
3. Store the ZIP securely — this is your disaster recovery artifact

### What's In The Backup ZIP

```
backup-YYYY-MM-DD-HH-MM-SS.zip
├── RESTORE.md                          ← AI-readable restore guide (auto-generated)
├── manifest.json                       ← Backup metadata, row counts, timing
├── schema/
│   └── openapi-spec.json               ← Full PostgREST schema (column types & relationships)
├── data/
│   ├── your_table/
│   │   ├── part-00001.json             ← Paginated rows (up to 1000 per part)
│   │   ├── part-00002.json
│   │   └── ...
│   └── another_table/
│       └── part-00001.json
├── storage/
│   ├── buckets.json                    ← Storage bucket configurations
│   └── <bucket-name>-files.json        ← File listings (metadata only, not file contents)
├── edge-functions-note.txt
└── ERRORS.log                          ← Any errors during export (if applicable)
```

### What's NOT In The ZIP

| Item | Why | What To Do |
|------|-----|------------|
| Source code | Your code lives in Git/Lovable | Download separately from your repo |
| Auth users | Supabase auth cannot be exported via API | Users re-register after restore |
| Storage files | Too large for edge function memory | Download from storage buckets separately |
| Edge function secrets | Security — never exported | Keep your own record of API keys |

---

## Restoring From A Backup

Every backup ZIP includes a `RESTORE.md` file with step-by-step instructions tailored to your specific backup. The restore process is:

1. **Get your source code** (from Git, Lovable, or local copy)
2. **Create a new Supabase project**
3. **Apply migrations** (`supabase db push`)
4. **Run the restore script** (included in RESTORE.md) to import all table data
5. **Recreate storage buckets** and re-upload files
6. **Update environment variables** with new project credentials
7. **Deploy edge functions** and re-add secrets
8. **Verify** — build and run your app

See `public/docs/engines/failsafe/RESTORE.md` for the complete AI-agent restore protocol.

---

## Backup Best Practices

- **Schedule regular backups** — set up a cron job or use Supabase's pg_cron extension
- **Store backups offsite** — don't rely on only one copy
- **Test restores periodically** — use a staging project to verify your backups work
- **Keep secrets documented** — backup ZIPs don't include API keys or service role keys
- **Download storage files separately** — the ZIP only contains file metadata, not the actual files

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backup times out | Increase `TIME_BUDGET_MS` in index.ts, or add tables to `SKIP_TABLES` |
| Empty tables in export | Check if they match a skip pattern in `SKIP_TABLE_PATTERNS` |
| 401 Unauthorized | Ensure the calling user has a valid Supabase JWT |
| 403 Forbidden | Admin role check is enabled but user doesn't have admin role |
| Large ZIP file | Add high-volume tables to the skip list |

---

## Support

- Documentation: https://cmpsbl.com/docs
- Email: support@cmpsbl.ai

---

© 2025–2026 CMPSBL®. All rights reserved.  
FAILSAFE is a sealed runtime. Redistribution prohibited.
