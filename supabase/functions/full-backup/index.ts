/**
 * FAILSAFE — Full Backup Edge Function v4.0
 * Disaster Recovery ZIP for any Supabase-backed application.
 *
 * STANDALONE — zero external dependencies. Drop into any project's
 * supabase/functions/full-backup/ directory and deploy.
 *
 * v4.0: npm: imports (no esm.sh flakiness), parallel count estimation,
 *        aggressive time management, graceful partial completion.
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/** Edge functions typically get 60–150s. Be conservative. */
const TIME_BUDGET_MS = 50_000;
const FINALIZE_RESERVE_MS = 5_000;

const PAGE_SIZE = 500;
const MIN_PAGE_SIZE = 50;
const QUERY_TIMEOUT_MS = 8_000;

/**
 * Tables to skip — regenerable telemetry, caches, derived data.
 */
const SKIP_TABLES = new Set<string>([
  'ai_usage_log', 'brain_events', 'brain_maintenance_log', 'analytics_events',
  'site_page_views', 'brain_memory_pruned', 'site_sessions', 'defense_events',
  'client_error_log', 'learning_queries', 'ai_daily_quota', 'nexus_traces',
  'maintenance_reports', 'brain_memory_hot', 'brain_memory_warm',
  'brain_memory_cold', 'brain_graph_edges', 'brain_graph_nodes',
  'brain_metrics', 'brain_reasoning_traces', 'brain_reflection_log',
  'brain_distillation_runs', 'brain_transfer_heuristics', 'mesh_comms',
  'learning_cycles', 'discovery_runs', 'nexus_hourly_snapshots',
  'pf_brain_anomalies', 'vertical_clm_cycles', 'vertical_ascension_sessions',
]);

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const backupStart = Date.now();

  function timeLeft(): number {
    return TIME_BUDGET_MS - (Date.now() - backupStart);
  }

  function hasTime(): boolean {
    return timeLeft() > FINALIZE_RESERVE_MS;
  }

  try {
    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Unauthorized — Bearer token required", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const bearerToken = authHeader.slice(7).trim();
    const apiKeyHeader = req.headers.get("apikey");
    const isServiceCall = bearerToken === serviceKey || apiKeyHeader === serviceKey;

    if (!isServiceCall) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) {
        return jsonError("Unauthorized — invalid or expired token", 401);
      }

      // Check admin role
      const admin = createClient(supabaseUrl, serviceKey);
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .limit(1);
      if (!roles || roles.length === 0) {
        return jsonError("Forbidden — admin role required", 403);
      }
    }

    console.log("[FullBackup] Auth OK. Building backup...");

    // ── Service-role client ──
    const admin = createClient(supabaseUrl, serviceKey, {
      db: { schema: "public" },
    });

    const projectRef = supabaseUrl.split("//")[1]?.split(".")[0] || "unknown";
    const now = new Date();
    const ts = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `full-backup-${ts}.zip`;

    // ═══════════════════════════════════════════════════════════
    // Build ZIP in memory (more reliable than streaming for edge)
    // ═══════════════════════════════════════════════════════════
    const zip = new InMemoryZip();
    const errors: string[] = [];
    const tableSummary: Record<string, number> = {};
    let totalRows = 0;
    let tablesExported = 0;
    let timedOut = false;

    // ── 1. Discover tables via OpenAPI ──
    let tableNames: string[] = [];
    try {
      const openApiRes = await fetchWithTimeout(
        `${supabaseUrl}/rest/v1/`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
        QUERY_TIMEOUT_MS,
      );
      if (openApiRes.ok) {
        const specText = await openApiRes.text();
        zip.addText("schema/openapi-spec.json", specText);
        const spec = JSON.parse(specText);
        if (spec.paths) {
          tableNames = Object.keys(spec.paths)
            .map((p) => p.replace(/^\//, ""))
            .filter((n) => n && !n.includes("/") && !n.startsWith("rpc/"));
        }
      } else {
        errors.push(`OpenAPI: HTTP ${openApiRes.status}`);
        await openApiRes.text();
      }
    } catch (e) {
      errors.push(`OpenAPI error: ${String(e)}`);
    }

    console.log(`[FullBackup] ${tableNames.length} tables discovered`);

    // ── Separate skip vs export ──
    const skippedTables = tableNames.filter((t) => SKIP_TABLES.has(t));
    const exportTables = tableNames.filter((t) => !SKIP_TABLES.has(t));

    for (const t of skippedTables) {
      tableSummary[t] = -3;
    }

    // ── 2. Quick parallel count estimation (batch of 10) ──
    const tableCounts: { table: string; count: number }[] = [];
    const BATCH = 10;
    for (let i = 0; i < exportTables.length && hasTime(); i += BATCH) {
      const batch = exportTables.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (table) => {
          const { count, error } = await admin
            .from(table)
            .select("*", { count: "exact", head: true });
          return { table, count: error ? 999_999 : (count ?? 999_999) };
        }),
      );
      for (const r of results) {
        if (r.status === "fulfilled") {
          tableCounts.push(r.value);
        } else {
          const table = batch[results.indexOf(r)];
          tableCounts.push({ table, count: 999_999 });
        }
      }
    }

    // Sort smallest first to maximize table coverage
    tableCounts.sort((a, b) => a.count - b.count);
    console.log(`[FullBackup] Counted ${tableCounts.length} tables. Exporting smallest first.`);

    // ── 3. Export each table ──
    for (const { table } of tableCounts) {
      if (!hasTime()) {
        timedOut = true;
        tableSummary[table] = tableSummary[table] ?? -2;
        continue;
      }

      try {
        let rowCount = 0;
        let offset = 0;
        let partCount = 0;
        let pageSize = PAGE_SIZE;

        while (hasTime()) {
          const { data, error } = await admin
            .from(table)
            .select("*")
            .range(offset, offset + pageSize - 1);

          if (error) {
            const isTimeout = /statement timeout|canceling|timeout/i.test(error.message);
            if (isTimeout && pageSize > MIN_PAGE_SIZE) {
              pageSize = Math.max(MIN_PAGE_SIZE, Math.floor(pageSize / 2));
              errors.push(`${table}: timeout, reducing page to ${pageSize}`);
              continue;
            }
            errors.push(`${table}: ${error.message}`);
            break;
          }

          if (!data || data.length === 0) break;

          partCount += 1;
          const partName = `data/${table}/part-${String(partCount).padStart(4, "0")}.json`;
          zip.addText(partName, JSON.stringify(data));

          rowCount += data.length;
          if (data.length < pageSize) break;
          offset += pageSize;
        }

        tableSummary[table] = rowCount;
        totalRows += rowCount;
        tablesExported += 1;
      } catch (e) {
        errors.push(`${table}: ${String(e)}`);
        tableSummary[table] = -1;
        tablesExported += 1;
      }
    }

    // Mark remaining un-exported tables
    for (const { table } of tableCounts) {
      if (!(table in tableSummary)) {
        tableSummary[table] = -2;
        timedOut = true;
      }
    }

    console.log(`[FullBackup] ${tablesExported} tables, ${totalRows} rows exported`);

    // ── 4. Storage bucket listing (if time permits) ──
    const storageSummary: Record<string, number> = {};
    if (hasTime()) {
      try {
        const { data: buckets } = await admin.storage.listBuckets();
        if (buckets?.length) {
          zip.addText("storage/buckets.json", JSON.stringify(buckets, null, 2));
          for (const bucket of buckets) {
            if (!hasTime()) break;
            try {
              const files = await listStorageFiles(admin, bucket.name);
              if (files.length > 0) {
                zip.addText(`storage/${bucket.name}-files.json`, JSON.stringify(files, null, 2));
              }
              storageSummary[bucket.name] = files.length;
            } catch (e) {
              storageSummary[bucket.name] = -1;
              errors.push(`storage/${bucket.name}: ${String(e)}`);
            }
          }
        }
      } catch (e) {
        errors.push(`Storage listing: ${String(e)}`);
      }
    }

    // ── 5. Finalize manifest + RESTORE guide ──
    const manifest: Record<string, unknown> = {
      created_at: now.toISOString(),
      project_ref: projectRef,
      format_version: "4.0.0",
      backup_type: "full",
      tables_exported: tablesExported,
      table_count: tableNames.length,
      total_rows: totalRows,
      timed_out: timedOut,
      duration_ms: Date.now() - backupStart,
      skipped_tables: [...skippedTables].sort(),
      tables: tableSummary,
      storage_files: storageSummary,
      errors: errors.length,
    };

    zip.addText("manifest.json", JSON.stringify(manifest, null, 2));

    if (errors.length > 0) {
      zip.addText("ERRORS.log", errors.join("\n"));
    }

    zip.addText("RESTORE.md", generateRestoreGuide(manifest, tableSummary, storageSummary, errors));

    zip.addText(
      "edge-functions-note.txt",
      "Edge functions live in supabase/functions/ in your source code.\nRedeploy with: npx supabase functions deploy\n",
    );

    // ── Build ZIP bytes ──
    const zipBytes = zip.finalize();

    console.log(`[FullBackup] Done. ${zipBytes.length} bytes, ${Date.now() - backupStart}ms`);

    return new Response(zipBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBytes.length),
      },
    });
  } catch (err) {
    console.error("[FullBackup] Fatal:", err);
    return jsonError(`Backup failed: ${String(err)}`, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function listStorageFiles(
  admin: ReturnType<typeof createClient>,
  bucketName: string,
  prefix = "",
): Promise<unknown[]> {
  const all: unknown[] = [];
  const { data } = await admin.storage.from(bucketName).list(prefix, { limit: 1000 });
  if (!data) return all;

  for (const item of data) {
    const entry = item as Record<string, unknown>;
    if (entry.id === null && entry.name) {
      const subPath = prefix ? `${prefix}/${entry.name}` : String(entry.name);
      const sub = await listStorageFiles(admin, bucketName, subPath);
      all.push(...sub);
    } else {
      all.push({
        ...entry,
        full_path: prefix ? `${prefix}/${entry.name}` : String(entry.name),
      });
    }
  }
  return all;
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY ZIP BUILDER (no streaming complexity)
// ═══════════════════════════════════════════════════════════════

const UTF8 = new TextEncoder();

interface ZipFileEntry {
  nameBytes: Uint8Array;
  data: Uint8Array;
  crc: number;
}

class InMemoryZip {
  private entries: ZipFileEntry[] = [];

  addText(path: string, content: string): void {
    const data = UTF8.encode(content);
    this.entries.push({
      nameBytes: UTF8.encode(path),
      data,
      crc: crc32(data),
    });
  }

  finalize(): Uint8Array {
    // Calculate total size
    let totalSize = 0;
    for (const e of this.entries) {
      totalSize += 30 + e.nameBytes.length + e.data.length; // local header + data
      totalSize += 46 + e.nameBytes.length; // central dir entry
    }
    totalSize += 22; // EOCD

    const buf = new Uint8Array(totalSize);
    const view = new DataView(buf.buffer);
    let offset = 0;
    const localOffsets: number[] = [];

    // Local file headers + data
    for (const e of this.entries) {
      localOffsets.push(offset);
      const { dosTime, dosDate } = toDosDateTime();

      view.setUint32(offset, 0x04034b50, true); offset += 4;
      view.setUint16(offset, 20, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2; // no compression
      view.setUint16(offset, dosTime, true); offset += 2;
      view.setUint16(offset, dosDate, true); offset += 2;
      view.setUint32(offset, e.crc, true); offset += 4;
      view.setUint32(offset, e.data.length, true); offset += 4;
      view.setUint32(offset, e.data.length, true); offset += 4;
      view.setUint16(offset, e.nameBytes.length, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      buf.set(e.nameBytes, offset); offset += e.nameBytes.length;
      buf.set(e.data, offset); offset += e.data.length;
    }

    // Central directory
    const cdStart = offset;
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i];
      const { dosTime, dosDate } = toDosDateTime();

      view.setUint32(offset, 0x02014b50, true); offset += 4;
      view.setUint16(offset, 20, true); offset += 2;
      view.setUint16(offset, 20, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, dosTime, true); offset += 2;
      view.setUint16(offset, dosDate, true); offset += 2;
      view.setUint32(offset, e.crc, true); offset += 4;
      view.setUint32(offset, e.data.length, true); offset += 4;
      view.setUint32(offset, e.data.length, true); offset += 4;
      view.setUint16(offset, e.nameBytes.length, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint32(offset, 0, true); offset += 4;
      view.setUint32(offset, localOffsets[i], true); offset += 4;
      buf.set(e.nameBytes, offset); offset += e.nameBytes.length;
    }

    const cdSize = offset - cdStart;

    // EOCD
    view.setUint32(offset, 0x06054b50, true); offset += 4;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, this.entries.length, true); offset += 2;
    view.setUint16(offset, this.entries.length, true); offset += 2;
    view.setUint32(offset, cdSize, true); offset += 4;
    view.setUint32(offset, cdStart, true); offset += 4;
    view.setUint16(offset, 0, true); offset += 2;

    return buf.slice(0, offset);
  }
}

function toDosDateTime(): { dosTime: number; dosDate: number } {
  const d = new Date();
  const dosTime = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() >> 1) & 0x1f);
  const dosDate = (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0x0f) << 5) | (d.getDate() & 0x1f);
  return { dosTime, dosDate };
}

function crc32(data: Uint8Array): number {
  let crc = ~0;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (~crc) >>> 0;
}

// ═══════════════════════════════════════════════════════════════
// RESTORE GUIDE
// ═══════════════════════════════════════════════════════════════

function generateRestoreGuide(
  manifest: Record<string, unknown>,
  tableSummary: Record<string, number>,
  storageSummary: Record<string, number>,
  errors: string[],
): string {
  const tableRows = Object.entries(tableSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => {
      const status =
        count === -1 ? "❌ FAILED" :
        count === -2 ? "⏭️ SKIPPED (timeout)" :
        count === -3 ? "🔇 SKIPPED (configured)" :
        count.toLocaleString();
      return `| \`${name}\` | ${status} |`;
    })
    .join("\n");

  const storageRows = Object.entries(storageSummary)
    .map(([name, count]) => `| \`${name}\` | ${count === -1 ? "❌ FAILED" : count} |`)
    .join("\n");

  const errorSection = errors.length > 0
    ? `\n## ⚠️ Export Errors\n\n${errors.map((e) => `- ${e}`).join("\n")}\n`
    : "";

  const timeoutNote = manifest.timed_out
    ? `\n> ⚠️ **Partial backup**: Runtime budget was exceeded. ${manifest.tables_exported}/${manifest.table_count} tables exported.\n`
    : "";

  return `# Full Backup — Restoration Guide

> **Created:** ${manifest.created_at}
> **Project:** ${manifest.project_ref}
> **Tables:** ${manifest.tables_exported}/${manifest.table_count}
> **Total Rows:** ${(manifest.total_rows as number).toLocaleString()}
> **Duration:** ${manifest.duration_ms}ms
> **Format:** v${manifest.format_version}
${timeoutNote}
---

## 📦 Contents

| Path | Description |
|---|---|
| \`data/<table>/part-*.json\` | Table data in paginated chunks |
| \`schema/openapi-spec.json\` | PostgREST OpenAPI spec |
| \`storage/buckets.json\` | Storage bucket configs |
| \`storage/*-files.json\` | File listings per bucket (metadata only) |
| \`manifest.json\` | Backup metadata |
| \`RESTORE.md\` | This file |

## 📋 Table Inventory

| Table | Rows |
|---|---|
${tableRows}

## 🗄️ Storage Buckets

| Bucket | Files |
|---|---|
${storageRows || "| *(none)* | — |"}
${errorSection}
---

## 🔧 Restoration Steps

### 1. Get Source Code
\`\`\`bash
git clone <your-repo-url>
cd your-project && npm install
\`\`\`

### 2. Create New Supabase Project
Save: Project URL, Anon key, Service role key, Project ref.

### 3. Apply Schema
\`\`\`bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
\`\`\`

### 4. Import Data
Use the part-*.json files with the Supabase JS client:
\`\`\`javascript
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const dataDir = "./data";

for (const table of fs.readdirSync(dataDir)) {
  const tableDir = path.join(dataDir, table);
  const parts = fs.readdirSync(tableDir).sort();
  for (const part of parts) {
    const rows = JSON.parse(fs.readFileSync(path.join(tableDir, part), "utf8"));
    const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
    if (error) console.error(table, part, error.message);
    else console.log(\`✅ \${table}/\${part}: \${rows.length} rows\`);
  }
}
\`\`\`

### 5. Redeploy Edge Functions
\`\`\`bash
npx supabase functions deploy
\`\`\`

### 6. Update Environment
Point your app's \`VITE_SUPABASE_URL\` and \`VITE_SUPABASE_PUBLISHABLE_KEY\` to the new project.

---
*Generated by FAILSAFE Full Backup v${manifest.format_version}*
`;
}
