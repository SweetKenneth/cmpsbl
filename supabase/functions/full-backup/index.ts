/**
 * Full Backup Edge Function — Disaster Recovery ZIP
 * Exports ALL database data, storage listings, and a complete RESTORE.md.
 * Admin-only. Uses the PostgREST OpenAPI spec to discover every table.
 * 
 * Memory-optimized: processes tables sequentially, streams JSON strings
 * directly into ZIP to minimize peak memory usage.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  requireAdmin,
  createAdminClient,
  EdgeError,
} from "../_shared/edge-middleware.ts";
import JSZip from "npm:jszip@3.10.1";

/** Max wall-clock time budget (ms). Edge functions timeout at ~150s; we stop at 130s. */
const TIME_BUDGET_MS = 130_000;
/** Page size for table exports */
const PAGE_SIZE = 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAdmin(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createAdminClient();
    const zip = new JSZip();

    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown';
    const startTime = Date.now();
    const errors: string[] = [];

    const manifest: Record<string, unknown> = {
      created_at: new Date().toISOString(),
      project_ref: projectRef,
      format_version: '2.2.0',
      backup_type: 'full',
    };

    console.log('[FullBackup] Starting backup...');

    // ═══════════════════════════════════════════════════════
    // 1. DISCOVER ALL TABLES via PostgREST OpenAPI spec
    // ═══════════════════════════════════════════════════════
    let tableNames: string[] = [];
    try {
      const openApiRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });
      if (openApiRes.ok) {
        const specText = await openApiRes.text();
        // Add spec to zip as string directly, don't keep parsed object
        zip.folder('schema')!.file('openapi-spec.json', specText);
        const spec = JSON.parse(specText);
        if (spec.paths) {
          tableNames = Object.keys(spec.paths)
            .map(p => p.replace(/^\//, ''))
            .filter(n => n && !n.includes('/') && !n.startsWith('rpc/'));
        }
      } else {
        errors.push(`OpenAPI discovery failed: HTTP ${openApiRes.status}`);
        await openApiRes.text();
      }
    } catch (e) {
      errors.push(`OpenAPI discovery error: ${String(e)}`);
    }

    console.log(`[FullBackup] Discovered ${tableNames.length} tables`);

    // ═══════════════════════════════════════════════════════
    // 2. EXPORT TABLE DATA — SEQUENTIAL to minimize memory
    //    Each table is serialized to JSON string immediately
    //    and added to zip, then data is released.
    // ═══════════════════════════════════════════════════════
    const dataFolder = zip.folder('data')!;
    const tableSummary: Record<string, number> = {};
    let totalRows = 0;
    let timedOut = false;
    let tablesExported = 0;

    for (const table of tableNames) {
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        timedOut = true;
        // Mark remaining as skipped
        for (let j = tableNames.indexOf(table); j < tableNames.length; j++) {
          tableSummary[tableNames[j]] = -2;
        }
        errors.push(`Time budget exceeded after ${tablesExported} tables. Skipped ${tableNames.length - tablesExported} tables.`);
        break;
      }

      try {
        // Stream pages directly into a JSON string to avoid holding arrays
        let rowCount = 0;
        let offset = 0;
        let jsonParts: string[] = ['['];
        let first = true;

        while (true) {
          if (Date.now() - startTime > TIME_BUDGET_MS) {
            timedOut = true;
            break;
          }

          const { data, error } = await admin
            .from(table)
            .select('*')
            .range(offset, offset + PAGE_SIZE - 1);

          if (error) {
            errors.push(`${table}: ${error.message}`);
            break;
          }
          if (!data || data.length === 0) break;

          // Append each row as JSON, building the string incrementally
          for (const row of data) {
            if (!first) jsonParts.push(',');
            jsonParts.push(JSON.stringify(row));
            first = false;
          }

          rowCount += data.length;
          if (data.length < PAGE_SIZE) break;
          offset += PAGE_SIZE;
        }

        jsonParts.push(']');

        if (rowCount > 0) {
          // Join and add to zip, then release
          dataFolder.file(`${table}.json`, jsonParts.join('\n'));
        }
        // Release references
        jsonParts = [];

        tableSummary[table] = rowCount;
        totalRows += rowCount;
        tablesExported++;
      } catch (e) {
        errors.push(`${table}: ${String(e)}`);
        tableSummary[table] = -1;
        tablesExported++;
      }
    }

    manifest.tables = tableSummary;
    manifest.table_count = tableNames.length;
    manifest.tables_exported = tablesExported;
    manifest.total_rows = totalRows;
    manifest.timed_out = timedOut;
    console.log(`[FullBackup] Exported ${totalRows} rows across ${tablesExported}/${tableNames.length} tables`);

    // ═══════════════════════════════════════════════════════
    // 3. STORAGE — list buckets and files (skip if timed out)
    // ═══════════════════════════════════════════════════════
    const storageFolder = zip.folder('storage')!;
    const storageSummary: Record<string, number> = {};
    if (!timedOut) {
      try {
        const { data: buckets } = await admin.storage.listBuckets();
        if (buckets && buckets.length > 0) {
          storageFolder.file('buckets.json', JSON.stringify(buckets, null, 2));
          manifest.storage_buckets = buckets.map(b => ({ name: b.name, public: b.public }));

          for (const bucket of buckets) {
            if (Date.now() - startTime > TIME_BUDGET_MS) break;
            try {
              const allFiles = await listAllStorageFiles(admin, bucket.name);
              if (allFiles.length > 0) {
                storageFolder.file(`${bucket.name}-files.json`, JSON.stringify(allFiles, null, 2));
              }
              storageSummary[bucket.name] = allFiles.length;
            } catch (e) {
              errors.push(`storage/${bucket.name}: ${String(e)}`);
              storageSummary[bucket.name] = -1;
            }
          }
        }
      } catch (e) {
        errors.push(`Storage listing: ${String(e)}`);
      }
    }
    manifest.storage_files = storageSummary;

    // ═══════════════════════════════════════════════════════
    // 4. EDGE FUNCTIONS NOTE
    // ═══════════════════════════════════════════════════════
    zip.file('edge-functions-note.txt', `Edge functions are deployed from supabase/functions/ in the source code.\nRedeploy with: npx supabase functions deploy\n`);

    // ═══════════════════════════════════════════════════════
    // 5. ERRORS LOG
    // ═══════════════════════════════════════════════════════
    if (errors.length > 0) {
      zip.file('ERRORS.log', errors.join('\n'));
      manifest.errors = errors.length;
    }

    // ═══════════════════════════════════════════════════════
    // 6. MANIFEST + RESTORE.md
    // ═══════════════════════════════════════════════════════
    manifest.duration_ms = Date.now() - startTime;
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file('RESTORE.md', generateRestoreGuide(manifest, tableSummary, storageSummary, errors));

    // ═══════════════════════════════════════════════════════
    // GENERATE ZIP — use STORE (no compression) to save CPU+memory
    // ═══════════════════════════════════════════════════════
    console.log(`[FullBackup] Generating ZIP...`);
    const zipBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'STORE',  // No compression = much less memory + CPU
    });

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `cmpsbl-full-backup-${ts}.zip`;

    console.log(`[FullBackup] Complete. ${filename} (${(zipBytes.length / 1024 / 1024).toFixed(2)} MB) in ${Date.now() - startTime}ms`);

    return new Response(zipBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBytes.length),
      },
    });
  } catch (err) {
    if (err instanceof EdgeError) {
      return new Response(JSON.stringify({ error: err.message, code: err.code }), {
        status: err.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error('[FullBackup] Fatal error:', err);
    return new Response(JSON.stringify({ error: 'Backup failed: ' + String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

async function listAllStorageFiles(
  admin: ReturnType<typeof createClient>,
  bucketName: string,
  prefix = '',
): Promise<unknown[]> {
  const allFiles: unknown[] = [];
  const { data } = await admin.storage.from(bucketName).list(prefix, { limit: 1000 });
  if (!data) return allFiles;

  for (const item of data) {
    if (item.id === null && item.name) {
      const subPath = prefix ? `${prefix}/${item.name}` : item.name;
      const subFiles = await listAllStorageFiles(admin, bucketName, subPath);
      allFiles.push(...subFiles);
    } else {
      allFiles.push({ ...item, full_path: prefix ? `${prefix}/${item.name}` : item.name });
    }
  }
  return allFiles;
}

function generateRestoreGuide(
  manifest: Record<string, unknown>,
  tableSummary: Record<string, number>,
  storageSummary: Record<string, number>,
  errors: string[],
): string {
  const tableRows = Object.entries(tableSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => {
      const status = count === -1 ? '❌ FAILED' : count === -2 ? '⏭️ SKIPPED (timeout)' : count.toLocaleString();
      return `| \`${name}\` | ${status} |`;
    })
    .join('\n');

  const storageRows = Object.entries(storageSummary)
    .map(([name, count]) => `| \`${name}\` | ${count === -1 ? '❌ FAILED' : count} |`)
    .join('\n');

  const errorSection = errors.length > 0
    ? `\n## ⚠️ Export Errors\n\n${errors.map(e => `- ${e}`).join('\n')}\n`
    : '';

  const timeoutNote = manifest.timed_out
    ? `\n> ⚠️ **Partial backup**: Time budget was exceeded. ${manifest.tables_exported}/${manifest.table_count} tables were exported. Run the backup again or export missing tables individually.\n`
    : '';

  return `# CMPSBL Full Backup — Complete Restoration Guide

> **Created:** ${manifest.created_at}  
> **Project Ref:** ${manifest.project_ref}  
> **Tables:** ${manifest.tables_exported}/${manifest.table_count}  
> **Total Rows:** ${(manifest.total_rows as number).toLocaleString()}  
> **Duration:** ${manifest.duration_ms}ms  
> **Format:** v${manifest.format_version}
${timeoutNote}
---

## 📦 What This Backup Contains

| Path | Description |
|---|---|
| \`data/*.json\` | Every row from every database table (paginated, complete) |
| \`schema/openapi-spec.json\` | Full PostgREST OpenAPI spec (all column types, relationships) |
| \`storage/buckets.json\` | Storage bucket configurations |
| \`storage/*-files.json\` | File listings per bucket (metadata, not file contents) |
| \`manifest.json\` | Backup metadata, row counts, timing |
| \`ERRORS.log\` | Any errors during export (if applicable) |
| \`RESTORE.md\` | This file |

## What You Also Need (Not In This ZIP)

| Item | Where To Get It |
|---|---|
| **Source code** | Lovable dashboard → Download ZIP, or GitHub repo |
| **Storage file contents** | Download from storage buckets before wipe |
| **Auth users** | Cannot be exported — users re-register |
| **Edge function secrets** | Keep your own record of API keys |

---

## 📋 Table Inventory

| Table | Rows |
|---|---|
${tableRows}

## 🗄️ Storage Buckets

| Bucket | Files |
|---|---|
${storageRows || '| *(none)* | — |'}
${errorSection}
---

## 🔧 Full Restoration Steps

### Step 1: Get the Source Code

Download the source code from Lovable (Dashboard → Settings → Download ZIP) or clone from GitHub.

\`\`\`bash
unzip cmpsbl-source.zip
cd cmpsbl
npm install
\`\`\`

### Step 2: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Save these values:
   - **Project URL** (e.g., \`https://abcdefg.supabase.co\`)
   - **Anon/public key**
   - **Service role key** (for data import)
   - **Project ref** (e.g., \`abcdefg\`)

### Step 3: Apply Database Schema

\`\`\`bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
\`\`\`

### Step 4: Import All Data

\`\`\`javascript
// restore-data.mjs — Run with: node restore-data.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const dataDir = './data';

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const table = path.basename(file, '.json');
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
  if (rows.length === 0) { console.log(\`⏭️  \${table}: empty\`); continue; }

  let imported = 0, failed = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) { console.error(\`  ❌ \${table} batch \${i}: \${error.message}\`); failed += batch.length; }
    else { imported += batch.length; }
  }
  console.log(\`✅ \${table}: \${imported} imported\${failed ? \`, \${failed} failed\` : ''}\`);
}
console.log('\\n🎉 Data import complete!');
\`\`\`

### Step 5: Recreate Storage Buckets

\`\`\`sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('bucket-name', 'bucket-name', true)
ON CONFLICT (id) DO NOTHING;
\`\`\`

### Step 6: Configure Environment

\`\`\`env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
\`\`\`

### Step 7: Deploy Edge Functions & Secrets

\`\`\`bash
npx supabase functions deploy
\`\`\`

### Step 8: Verify

\`\`\`bash
npm run dev
\`\`\`

---

## 🤖 For AI Coding Agents

1. Read this entire RESTORE.md first
2. Source code ZIP from Lovable/GitHub is the PRIMARY artifact
3. Run \`supabase db push\` to create schema from \`supabase/migrations/\`
4. Use \`restore-data.mjs\` to import data from \`data/*.json\`
5. Deploy edge functions with \`supabase functions deploy\`
6. Frontend: \`npm install && npm run dev\`

---

© 2025–2026 CMPSBL® / PromptFluid®. Confidential.
`;
