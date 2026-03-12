/**
 * Full Backup Edge Function — Disaster Recovery ZIP
 * Exports ALL database data, storage listings, and a complete RESTORE.md.
 * Admin-only. Uses the PostgREST OpenAPI spec to discover every table.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  requireAdmin,
  createAdminClient,
  EdgeError,
} from "../_shared/edge-middleware.ts";
import JSZip from "npm:jszip@3.10.1";

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
      format_version: '2.0.0',
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
        const spec = await openApiRes.json();
        // PostgREST OpenAPI: paths are "/{table}" for each table
        if (spec.paths) {
          tableNames = Object.keys(spec.paths)
            .map(p => p.replace(/^\//, ''))
            .filter(n => n && !n.includes('/') && !n.startsWith('rpc/'));
        }
        // Also store the full OpenAPI spec for schema reference
        zip.folder('schema')!.file('openapi-spec.json', JSON.stringify(spec, null, 2));
      } else {
        errors.push(`OpenAPI discovery failed: HTTP ${openApiRes.status}`);
        await openApiRes.text(); // consume body
      }
    } catch (e) {
      errors.push(`OpenAPI discovery error: ${String(e)}`);
    }

    console.log(`[FullBackup] Discovered ${tableNames.length} tables`);

    // ═══════════════════════════════════════════════════════
    // 2. EXPORT ALL TABLE DATA
    // ═══════════════════════════════════════════════════════
    const dataFolder = zip.folder('data')!;
    const tableSummary: Record<string, number> = {};
    let totalRows = 0;

    for (const table of tableNames) {
      try {
        const allRows: unknown[] = [];
        let offset = 0;
        const PAGE = 1000;

        while (true) {
          const { data, error } = await admin
            .from(table)
            .select('*')
            .range(offset, offset + PAGE - 1);

          if (error) {
            errors.push(`${table}: ${error.message}`);
            break;
          }
          if (!data || data.length === 0) break;
          allRows.push(...data);
          if (data.length < PAGE) break;
          offset += PAGE;
        }

        dataFolder.file(`${table}.json`, JSON.stringify(allRows, null, 2));
        tableSummary[table] = allRows.length;
        totalRows += allRows.length;
      } catch (e) {
        errors.push(`${table}: export failed — ${String(e)}`);
        tableSummary[table] = -1;
      }
    }

    manifest.tables = tableSummary;
    manifest.table_count = tableNames.length;
    manifest.total_rows = totalRows;
    console.log(`[FullBackup] Exported ${totalRows} rows across ${tableNames.length} tables`);

    // ═══════════════════════════════════════════════════════
    // 3. STORAGE — list buckets and files
    // ═══════════════════════════════════════════════════════
    const storageFolder = zip.folder('storage')!;
    const storageSummary: Record<string, number> = {};
    try {
      const { data: buckets } = await admin.storage.listBuckets();
      if (buckets && buckets.length > 0) {
        storageFolder.file('buckets.json', JSON.stringify(buckets, null, 2));
        manifest.storage_buckets = buckets.map(b => ({ name: b.name, public: b.public }));

        for (const bucket of buckets) {
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
    manifest.storage_files = storageSummary;

    // ═══════════════════════════════════════════════════════
    // 4. EDGE FUNCTIONS LIST (from config awareness)
    // ═══════════════════════════════════════════════════════
    // Document which functions exist (the code is in the source repo)
    const edgeFunctionsNote = `Edge functions are deployed from supabase/functions/ in the source code.\nRedeploy with: npx supabase functions deploy\n\nThe config.toml defines JWT verification settings for each function.`;
    zip.file('edge-functions-note.txt', edgeFunctionsNote);

    // ═══════════════════════════════════════════════════════
    // 5. ERRORS LOG
    // ═══════════════════════════════════════════════════════
    if (errors.length > 0) {
      zip.file('ERRORS.log', errors.join('\n'));
      manifest.errors = errors.length;
    }

    // ═══════════════════════════════════════════════════════
    // 6. MANIFEST
    // ═══════════════════════════════════════════════════════
    manifest.duration_ms = Date.now() - startTime;
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // ═══════════════════════════════════════════════════════
    // 7. RESTORE.md
    // ═══════════════════════════════════════════════════════
    zip.file('RESTORE.md', generateRestoreGuide(manifest, tableSummary, storageSummary, errors));

    // ═══════════════════════════════════════════════════════
    // GENERATE ZIP
    // ═══════════════════════════════════════════════════════
    const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    // Dynamic filename: cmpsbl-full-backup-2026-03-12-14-30-05.zip
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `cmpsbl-full-backup-${ts}.zip`;

    console.log(`[FullBackup] Complete. ${filename} (${(zipBytes.length / 1024 / 1024).toFixed(2)} MB)`);

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

/** Recursively list all files in a storage bucket */
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
      // It's a folder — recurse
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
    .map(([name, count]) => `| \`${name}\` | ${count === -1 ? '❌ FAILED' : count.toLocaleString()} |`)
    .join('\n');

  const storageRows = Object.entries(storageSummary)
    .map(([name, count]) => `| \`${name}\` | ${count === -1 ? '❌ FAILED' : count} |`)
    .join('\n');

  const errorSection = errors.length > 0
    ? `\n## ⚠️ Export Errors\n\nThe following issues occurred during backup:\n\n${errors.map(e => `- ${e}`).join('\n')}\n`
    : '';

  return `# CMPSBL Full Backup — Complete Restoration Guide

> **Created:** ${manifest.created_at}  
> **Project Ref:** ${manifest.project_ref}  
> **Tables:** ${manifest.table_count}  
> **Total Rows:** ${(manifest.total_rows as number).toLocaleString()}  
> **Duration:** ${manifest.duration_ms}ms  
> **Format:** v${manifest.format_version}

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

The source code contains all migrations in \`supabase/migrations/\`.

\`\`\`bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
\`\`\`

This recreates ALL tables, indexes, RLS policies, functions, triggers, enums, and extensions.

### Step 4: Import All Data

Run this Node.js script from the backup directory:

\`\`\`javascript
// restore-data.mjs — Run with: node restore-data.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const dataDir = './data';

// Tables with foreign keys must be imported AFTER their referenced tables.
// This script imports all tables; if FK constraints cause issues,
// temporarily disable triggers or import in dependency order.

const files = fs.readdirSync(dataDir)
  .filter(f => f.endsWith('.json'))
  .sort(); // alphabetical is usually safe

for (const file of files) {
  const table = path.basename(file, '.json');
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));

  if (rows.length === 0) {
    console.log(\`⏭️  \${table}: empty, skipping\`);
    continue;
  }

  let imported = 0;
  let failed = 0;

  // Upsert in batches of 500
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.error(\`  ❌ \${table} batch \${i}: \${error.message}\`);
      failed += batch.length;
    } else {
      imported += batch.length;
    }
  }

  console.log(\`✅ \${table}: \${imported} imported\${failed ? \`, \${failed} failed\` : ''}\`);
}

console.log('\\n🎉 Data import complete!');
\`\`\`

### Step 5: Recreate Storage Buckets

Review \`storage/buckets.json\` and create each bucket:

\`\`\`sql
-- Run in Supabase SQL Editor for each bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bucket-name', 'bucket-name', true)
ON CONFLICT (id) DO NOTHING;
\`\`\`

Then re-upload files. File metadata is in \`storage/*-files.json\`.

### Step 6: Configure Environment

Update \`.env\` in the project root:

\`\`\`env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
\`\`\`

### Step 7: Deploy Edge Functions

\`\`\`bash
npx supabase functions deploy
\`\`\`

### Step 8: Configure Secrets

In the Supabase dashboard → Edge Function Secrets, add any third-party API keys.
Check each function for \`Deno.env.get()\` calls to identify required secrets.

Auto-provided secrets (no action needed):
- \`SUPABASE_URL\`
- \`SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`

### Step 9: Auth Configuration

- Enable email auth (and any OAuth providers used)
- Set redirect URLs for your domain
- Auth users must re-register (user accounts are not exportable)

### Step 10: Verify

\`\`\`bash
npm run dev
\`\`\`

1. ✅ Frontend loads at localhost:5173
2. ✅ Authentication flow works
3. ✅ Data appears in tables/dashboards
4. ✅ Edge functions respond
5. ✅ Storage uploads work

---

## 🤖 For AI Coding Agents

If you are an AI agent restoring this project, follow these exact steps:

1. **Read this entire RESTORE.md** before doing anything
2. The source code ZIP from Lovable/GitHub is the PRIMARY artifact — it contains all schema migrations, edge functions, and frontend code
3. Run \`supabase db push\` to create the database schema from \`supabase/migrations/\`
4. Use the \`restore-data.mjs\` script above to import all data from \`data/*.json\`
5. Deploy edge functions with \`supabase functions deploy\`
6. The frontend needs only \`npm install && npm run dev\`
7. The \`schema/openapi-spec.json\` file contains complete column types and relationships if you need to verify the schema

**Architecture notes:**
- Backend: Supabase (PostgreSQL + Edge Functions + Storage)
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Auth: Supabase Auth (email-based)
- State: TanStack React Query + Zustand
- The database has ${Object.keys(tableSummary).length} tables with row-level security policies

---

*Generated by CMPSBL Full Backup System v2.0*
`;
}
