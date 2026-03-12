# FAILSAFE — Disaster Recovery Engine
## Installation & Backup Guide

**Version:** 1.0.0  
**License:** Perpetual · Single-seat  
**Runtime:** Sealed · Black-boxed  

---

## How It Works

FAILSAFE creates a full disaster recovery archive of your CMPSBL database via a one-click backup button in your admin dashboard. The archive is downloaded as a ZIP file.

**Important:** The backup contains your **database data and schema** — not source code. Source code is obtained separately from Lovable (Dashboard → Settings → Download ZIP) or your GitHub repository.

---

## What's In The Backup Archive

```
cmpsbl-full-backup-YYYY-MM-DD-HH-MM-SS.zip
├── RESTORE.md                          ← AI-readable restore instructions (auto-generated)
├── manifest.json                       ← Backup metadata, row counts, timing
├── schema/
│   └── openapi-spec.json               ← Full PostgREST schema (all column types & relationships)
├── data/
│   ├── profiles/
│   │   ├── part-00001.json             ← Paginated table data (up to 1000 rows per part)
│   │   ├── part-00002.json
│   │   └── ...
│   ├── agencies/
│   │   └── part-00001.json
│   └── <table_name>/
│       └── part-NNNNN.json
├── storage/
│   ├── buckets.json                    ← Storage bucket configurations
│   └── <bucket-name>-files.json        ← File listings per bucket (metadata only)
├── edge-functions-note.txt             ← Deployment reminder
└── ERRORS.log                          ← Any errors during export (if applicable)
```

### What You Also Need (Not In The ZIP)

| Item | Where To Get It |
|------|-----------------|
| **Source code** | Lovable Dashboard → Settings → Download ZIP, or GitHub repo |
| **Storage file contents** | Download from storage buckets before wipe (ZIP only contains file *listings*) |
| **Auth users** | Cannot be exported — users must re-register after restore |
| **Edge function secrets** | Keep your own record of API keys (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, etc.) |

---

## Taking A Backup

### Via Dashboard (Recommended)

1. Log in as an admin/governor
2. Navigate to the **OS Dashboard** → **Security** tab → **Backups** sub-tab
3. Click **"Full System Backup"**
4. Wait for the ZIP to download (typically 10–60 seconds depending on data volume)
5. Store the ZIP securely — this is your disaster recovery artifact

### What Gets Exported

- All database tables (except high-volume telemetry/event logs that are regenerable at runtime)
- Storage bucket configurations and file listings
- Full PostgREST OpenAPI schema
- Auto-generated `RESTORE.md` with a ready-to-run import script

### What Gets Skipped (By Design)

The following table categories are excluded to keep backups fast and within the edge function time budget:

- Telemetry & event logs (`brain_events`, `mesh_comms`, `analytics_events`, etc.)
- Usage metering (`access_usage`, `access_quotas`)
- Resolver execution logs (`intent_receipts`, `resolver_execution_log`)
- Generated reports (`owner_reports`)

These are all regenerated from runtime activity and are not needed for reconstruction.

---

## Quick Start — Full Restore (Human)

### 1. Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase CLI (`npm install -g supabase`)
- A new Supabase project (create at [supabase.com](https://supabase.com))

### 2. Get Source Code

Download source code from Lovable or clone your GitHub repo:

```bash
# From Lovable: Dashboard → Settings → Download ZIP
unzip cmpsbl-source.zip -d my-restored-project
cd my-restored-project
npm install
```

### 3. Configure Environment

Create a `.env` file with your new Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
```

### 4. Restore Database Schema

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations in order
supabase db push
```

### 5. Restore Data

Extract the backup ZIP and use the auto-generated `restore-data.mjs` script from the backup's `RESTORE.md`:

```bash
# Extract backup
unzip cmpsbl-full-backup-*.zip -d backup-data

# Copy the restore script from RESTORE.md into a file called restore-data.mjs
# Edit SUPABASE_URL and SERVICE_ROLE_KEY values
# Then run:
node restore-data.mjs
```

**Important:** Use your **service role key** (not anon key) for the import script — this bypasses RLS policies.

### 6. Set Up Admin Access

After importing data, you'll need to create a new user and assign admin privileges:

```sql
-- After signing up via the app, run in SQL editor:
INSERT INTO public.user_roles (user_id, role)
VALUES ('<your-new-user-id>', 'admin');
```

### 7. Deploy Edge Functions

```bash
supabase functions deploy --project-ref your-project-ref

# Set any required secrets
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set RESEND_API_KEY=re_...
```

### 8. Start & Verify

```bash
npm run dev
```

Verify: homepage loads, auth works, admin dashboard accessible.

---

## Quick Start — Full Restore (AI Agent)

If you're an AI agent restoring this system:

1. **Get the source code** from Lovable or GitHub — this is the primary artifact
2. **Extract the backup ZIP** — this contains the database data
3. **Read the auto-generated `RESTORE.md`** inside the backup ZIP — it contains a tailored import script and exact table inventory
4. **Run `npm install`** in the source code directory
5. **Create a new Supabase project** and save the project ref, URL, anon key, and service role key
6. **Set environment variables** in `.env`
7. **Run `supabase link && supabase db push`** to apply schema
8. **Run the `restore-data.mjs` script** from the backup's RESTORE.md to import all table data
9. **Deploy edge functions** with `supabase functions deploy`
10. **Create an admin user** — sign up via the app, then insert a `user_roles` row
11. **Run `npm run dev`** to verify the application starts

### Key Notes for Agents

- The backup ZIP does **not** contain source code — get that separately
- Data is stored in `data/<table_name>/part-NNNNN.json` (chunked, up to 1000 rows per part)
- Auth users **cannot** be restored — users must re-register
- Use the **service role key** for data import to bypass RLS
- Some tables may have composite primary keys — the import script uses `onConflict: 'id'` which works for most tables; handle failures individually

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing env vars | Check `.env` file has all three `VITE_SUPABASE_*` variables |
| Migration failures | Run migrations one at a time: `supabase migration up --include <file>` |
| Foreign key errors | Import tables with no dependencies first (profiles, system_flags, etc.) |
| Edge function errors | Check secrets are configured: `supabase secrets set KEY=value` |
| Build errors | Delete `node_modules` and reinstall |
| Can't access admin | Ensure `user_roles` table has your user with `admin` role |
| `onConflict` errors | Some tables use composite keys — import those via SQL instead |

---

## Support

- Documentation: https://cmpsbl.com/docs
- Email: support@cmpsbl.ai

---

© 2025–2026 CMPSBL®. All rights reserved.  
FAILSAFE is a sealed runtime. Redistribution prohibited.
