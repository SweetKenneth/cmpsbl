# 19. Backup & Disaster Recovery — Complete Operational Guide

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Version:** v1.0.0 — April 2026  
**Access:** PIN-protected (`/restore-kit` → PIN 4645)

---

## 1. System Overview

CMPSBL® runs a **3-layer backup architecture** ensuring the substrate can be fully restored to any Supabase-compatible project — even if Lovable ceased to exist.

| Layer | Method | Trigger | Output |
|-------|--------|---------|--------|
| **Manual Full Backup** | Edge Function `full-backup` | Admin button press | Streaming ZIP → browser download |
| **Failsafe Nightly** | Edge Function `failsafe-nightly` | pg_cron @ 2:00 AM CST (8:00 UTC) daily | ZIP → `failsafe-backups` storage bucket + signed download URL |
| **Standalone Restore Kit** | Node.js script (`restore.mjs`) | Manual execution on any machine | Upserts all data into target project |

---

## 2. Manual Full Backup

### 2.1 How to Trigger

**Location:** Admin Panel → Substrate OS → Backup & Restore tab → "Full Backup" button  
**Component:** `src/components/admin/FullBackupButton.tsx`

### 2.2 Authentication

The `full-backup` edge function requires a valid Supabase JWT. The caller must:
1. Be authenticated via `supabase.auth.getSession()`
2. Pass `Authorization: Bearer <access_token>` header
3. Pass `apikey: <anon_key>` header

The function also accepts **service_role key** as the Bearer token for internal/automated calls (used by `failsafe-nightly`).

### 2.3 What Gets Backed Up

The backup engine exports **all database tables** except regenerable telemetry:

**Included (critical state):**
- All configs, profiles, user data
- Crown Jewels™, discoveries, vault data
- Agency data, tasks, members, economics
- Access control (API keys, subscriptions, quotas)
- Audit logs, governance records
- Artifact registry, capability records
- All vertical substrate data (Cyber™, Quantum™, Robotics™, LLM™)

**Excluded (regenerable telemetry):**
- `ai_usage_log` — API call counters (~157K rows)
- `brain_events` — event stream (~88K rows)
- `brain_maintenance_log` — maintenance telemetry
- `analytics_events` — page event telemetry
- `brain_memory_hot/warm/cold` — hot/warm/cold caches (rebuilt from durable state)
- `brain_graph_edges/nodes` — derived knowledge graph
- `vertical_clm_cycles` — vertical learning cycle history
- `vertical_ascension_sessions` — vertical session history
- Various other transient telemetry tables

### 2.4 Technical Details

- **Runtime budget:** 142 seconds (of 150s edge function limit)
- **Finalize reserve:** 6 seconds for ZIP directory
- **Page size:** 250 rows per query (fallback to 25 on memory errors)
- **Query retries:** 2 per page with 250ms delay
- **Output format:** Streaming ZIP with CRC-32 checksums
- **Compression:** Deflate (method 8)

### 2.5 ZIP Structure

```
cmpsbl-full-backup-YYYY-MM-DD.zip
├── manifest.json              # Backup metadata, table counts, timing
├── RESTORE.md                 # AI-ready reconstruction guide
├── schema/
│   └── openapi-spec.json      # Full OpenAPI schema for table verification
├── data/
│   ├── profiles/
│   │   ├── page-001.json      # Paginated table data (250 rows/page)
│   │   └── page-002.json
│   ├── crown_jewels/
│   │   └── page-001.json
│   └── ... (all tables)
└── storage/
    ├── radio-files.json        # Storage bucket inventory
    └── failsafe-backups.json   # Bucket file listings
```

---

## 3. Failsafe Nightly Backup

### 3.1 Schedule

- **Cron:** pg_cron at 2:00 AM CST (8:00 AM UTC) daily
- **Edge Function:** `failsafe-nightly`
- **Auth:** Service role key (internal call, no user JWT)

### 3.2 Process

1. Calls `full-backup` edge function internally with service_role key
2. Validates the backup (manifest, table count, minimum size)
3. Uploads validated ZIP to `failsafe-backups` storage bucket
4. Deletes previous nightly backup (rolling 7-day retention)
5. Generates signed download URL (1 hour expiry)
6. Logs result to `backup_audit_log`

### 3.3 Manual Failsafe Trigger

**Location:** Admin Panel → Substrate OS → Backup & Restore → "Failsafe Backup" button  
This calls the `failsafe-nightly` function with the user's JWT and triggers a browser download of the resulting ZIP.

### 3.4 Storage Bucket

- **Bucket:** `failsafe-backups`
- **Access:** Service role only (public read disabled)
- **Retention:** Latest backup only (previous deleted on success)
- **File naming:** `failsafe-YYYY-MM-DDTHH-MM-SS.zip`

---

## 4. Standalone Restore Kit

### 4.1 Access

- **Web:** `https://cmpsbl.com/restore-kit` (PIN: **4645**)
- **Direct files:** `public/restore-kit/restore.mjs` and `public/restore-kit/README.md`
- **Repository:** Available in the source repo under `public/restore-kit/`

### 4.2 Prerequisites

- **Node.js 18+** (uses native `fetch`, `DecompressionStream`, `fs`)
- A **full-backup ZIP** from either Manual or Failsafe backup
- Target **Supabase project URL** (e.g., `https://abcdefgh.supabase.co`)
- Target **service_role key** (NOT the anon key — service_role bypasses RLS)

### 4.3 Where to Get the service_role Key

1. Go to your target Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the `service_role` key (the secret one, not `anon`)
4. ⚠️ This key bypasses all Row-Level Security — handle with extreme care

### 4.4 Usage

```bash
# Full restoration to new project
node restore.mjs full-backup-2026-04-03.zip \
  https://NEW-PROJECT.supabase.co \
  eyJhbGciOiJIUzI1NiIs...SERVICE_ROLE_KEY

# Validate backup integrity without writing
node restore.mjs backup.zip https://project.supabase.co KEY --dry-run

# Skip large telemetry tables
node restore.mjs backup.zip https://project.supabase.co KEY \
  --skip=ai_usage_log,brain_events,analytics_events
```

### 4.5 How It Works

1. Reads the ZIP using a zero-dependency ZIP parser (no `unzip` or `jszip` needed)
2. Validates ZIP structure (PK magic bytes, EOCD marker)
3. Extracts and validates `manifest.json`
4. Connects to target Supabase via PostgREST API
5. Upserts all table data in 200-row batches
6. Conflict resolution: `merge-duplicates` first, `ignore-duplicates` fallback
7. Generates `restore-report-*.json` with per-table results

### 4.6 Important Constraints

- **Schema must exist first.** The restore script restores *data*, not table schemas. Run your Supabase migrations before restoring data.
- **RLS is bypassed** via the service_role key — this is intentional for disaster recovery.
- **Edge functions are NOT included.** Redeploy from source: `npx supabase functions deploy`
- **Storage file contents are NOT included.** Only bucket inventory listings are backed up. Re-upload files from your own backups.
- **No external dependencies.** The entire restore runs on Node.js built-ins.

---

## 5. Complete Disaster Recovery Procedure

If Lovable went offline tomorrow, follow this exact sequence:

### Step 1: Obtain Your Backup

- If you have a downloaded ZIP from Manual or Failsafe → use it directly
- If you have access to the Supabase dashboard → download from `failsafe-backups` bucket
- If you have the source repo → the restore kit is in `public/restore-kit/`

### Step 2: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note the project URL and service_role key from Settings → API

### Step 3: Apply Database Schema

```bash
# Clone the CMPSBL source repository
git clone <your-repo-url>
cd <repo>

# Link to your new project
npx supabase link --project-ref YOUR_NEW_PROJECT_REF

# Apply all migrations
npx supabase db push
```

### Step 4: Restore Data

```bash
# Download restore.mjs from the repo (public/restore-kit/restore.mjs)
# Run it against your new project:
node restore.mjs backup.zip \
  https://YOUR-NEW-PROJECT.supabase.co \
  YOUR_SERVICE_ROLE_KEY
```

### Step 5: Deploy Edge Functions

```bash
npx supabase functions deploy full-backup
npx supabase functions deploy failsafe-nightly
# Deploy all other edge functions as needed
```

### Step 6: Configure Secrets

Edge functions require these environment secrets:
- `SUPABASE_URL` — auto-set by Supabase
- `SUPABASE_ANON_KEY` — auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — auto-set by Supabase
- Any additional API keys your functions use (check `supabase/functions/` for references)

### Step 7: Deploy Frontend

```bash
npm install
npm run build
# Deploy the dist/ folder to any static host (Vercel, Netlify, Cloudflare Pages)
```

### Step 8: Update Environment

Update `.env` or hosting environment with:
- `VITE_SUPABASE_URL` → your new project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` → your new anon key

### Step 9: Verify

1. Check the restore report JSON for any errors
2. Run `--dry-run` against original backup to verify table counts
3. Test authentication flow
4. Verify Crown Jewels™ and discoveries are accessible
5. Confirm Memory Stream™ and DREAM cycles resume

---

## 6. Backup Audit & Monitoring

### 6.1 Audit Log

All backup events are logged to the `backup_audit_log` table:
- Backup creation (manual and nightly)
- Backup validation results
- Restore operations
- Failures and error details

### 6.2 BEACON Health Signals

The backup system emits BEACON health signals:
- `backup.manual.success` / `backup.manual.failure`
- `backup.nightly.success` / `backup.nightly.failure`
- `backup.nightly.skipped` (if previous backup is recent enough)

### 6.3 Monitoring Checklist

| Check | Frequency | How |
|-------|-----------|-----|
| Nightly backup ran | Daily | Check `failsafe-backups` bucket for today's file |
| Backup size reasonable | Weekly | Compare manifest `total_rows` against previous |
| Restore kit accessible | Monthly | Visit `/restore-kit`, enter PIN, verify downloads |
| Dry-run validation | Monthly | Run `restore.mjs --dry-run` against latest backup |

---

## 7. Security Considerations

1. **Backup ZIPs contain ALL database data** — treat as highest classification
2. **service_role key** bypasses all RLS — never expose in client code or logs
3. **PIN protection** on `/restore-kit` route (PIN: 4645, session-locked)
4. **Storage bucket** is private (service_role access only)
5. **Nightly backup** deletes previous version to limit exposure window
6. **Restore report** contains table names and row counts — classify appropriately

---

## 8. File Reference

| File | Purpose |
|------|---------|
| `supabase/functions/full-backup/index.ts` | Manual backup edge function (826 lines) |
| `supabase/functions/failsafe-nightly/index.ts` | Nightly cron backup function (263 lines) |
| `src/components/admin/FullBackupButton.tsx` | Admin UI button for manual backup |
| `src/components/substrate-os/BackupRestorePanel.tsx` | Full backup/restore admin panel |
| `public/restore-kit/restore.mjs` | Standalone restore script (~380 lines) |
| `public/restore-kit/README.md` | Restore kit documentation |
| `src/pages/RestoreKit.tsx` | PIN-protected restore kit download page |
| `docs/libraries/internal/19-backup-disaster-recovery.md` | This document |

---

© 2026 CMPSBL®. Governor Eyes Only.
