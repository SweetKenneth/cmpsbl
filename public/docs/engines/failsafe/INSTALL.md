# FAILSAFE — Disaster Recovery Engine
## Installation & Backup Guide

**Version:** 1.0.0  
**License:** Perpetual · Single-seat  
**Runtime:** Sealed · Black-boxed  
**Compatibility:** Any Supabase-backed web application  

---

## What Is FAILSAFE?

FAILSAFE is a one-click disaster recovery engine for Supabase-powered applications. It provides:

- **Automated full backups** — exports all your database tables, schema, and storage metadata into a single ZIP archive
- **AI-ready restore instructions** — every backup includes a tailored `RESTORE.md` that any AI coding agent can follow to reconstruct your environment
- **Streaming architecture** — handles large databases efficiently with chunked exports and adaptive page sizing

---

## Installation

### Step 1 — Deploy the Edge Function

Copy the `full-backup/` directory into your project's `supabase/functions/` folder:

```
your-project/
├── supabase/
│   └── functions/
│       └── full-backup/
│           └── index.ts    ← The FAILSAFE engine
```

Deploy it:

```bash
supabase functions deploy full-backup --project-ref your-project-ref
```

### Step 2 — Add the Backup Button (Optional)

Add a backup trigger anywhere in your admin UI:

```typescript
import { supabase } from "@/integrations/supabase/client";

async function downloadBackup() {
  const { data, error } = await supabase.functions.invoke("full-backup", {
    method: "GET",
  });
  
  if (error) {
    console.error("Backup failed:", error);
    return;
  }

  // Download the ZIP
  const blob = new Blob([data], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
```

Or call it directly via curl:

```bash
curl -L \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY" \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/full-backup" \
  --output backup.zip
```

> **Note:** The function requires admin authentication. Ensure the calling user has appropriate permissions.

### Step 3 — Configure Table Skipping (Optional)

By default, FAILSAFE skips high-volume telemetry and log tables to keep backups fast. You can customize the `SKIP_TABLES` set and `SKIP_TABLE_PATTERNS` array in `index.ts` to match your project's table structure.

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
| Auth users | Supabase auth cannot be exported | Users re-register after restore |
| Storage files | Too large for edge function memory | Download from storage buckets separately |
| Edge function secrets | Security — never exported | Keep your own record of API keys |

---

## Backup Best Practices

- **Schedule regular backups** — set up a cron job or use Supabase's pg_cron extension
- **Store backups offsite** — don't rely on only one copy
- **Test restores periodically** — use a staging project to verify your backups work
- **Keep secrets documented** — backup ZIPs don't include API keys or service role keys

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backup times out | Increase `TIME_BUDGET_MS` or add more tables to `SKIP_TABLES` |
| Empty tables in export | Check if they match a skip pattern in `SKIP_TABLE_PATTERNS` |
| Permission denied | Ensure the calling user has admin-level auth |
| Large ZIP file | Add high-volume tables to the skip list |

---

## Support

- Documentation: https://cmpsbl.com/docs
- Email: support@cmpsbl.ai

---

© 2025–2026 CMPSBL®. All rights reserved.  
FAILSAFE is a sealed runtime. Redistribution prohibited.
