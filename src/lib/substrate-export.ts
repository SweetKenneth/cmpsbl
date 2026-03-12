/**
 * CMPSBL® Substrate Export — Full Backup
 * 
 * Builds a comprehensive ZIP archive of the ENTIRE substrate:
 * all source code, edge functions, migrations, configs, assets,
 * docs, scripts, and root configuration files.
 * 
 * Uses Vite's import.meta.glob to embed file contents at build time.
 * JSZip creates the downloadable archive at runtime.
 */

import JSZip from 'jszip';
import { getMetric } from '@/stores/publicMetricsStore';

// ─── Build-time file listing (lazy raw imports) ──────────────────────────────
//
// IMPORTANT:
// We intentionally keep these globs **non-eager** so production builds do not
// inline the entire repository as giant raw strings (which can break publish).
// The contents are only loaded when the user clicks "Export ZIP".

type RawGlob = Record<string, () => Promise<string>>;

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE BACKEND
// ═══════════════════════════════════════════════════════════════════════════════

// Edge functions — ALL .ts files (not just index.ts)
const edgeFunctionFiles = import.meta.glob('/supabase/functions/**/*.ts', {
  as: 'raw',
}) as RawGlob;

// Schema migrations
const migrationFiles = import.meta.glob('/supabase/migrations/**/*.sql', {
  as: 'raw',
}) as RawGlob;

// Supabase config
const supabaseConfigFiles = import.meta.glob('/supabase/config.toml', {
  as: 'raw',
}) as RawGlob;

// ═══════════════════════════════════════════════════════════════════════════════
// SOURCE CODE — ALL DIRECTORIES
// ═══════════════════════════════════════════════════════════════════════════════

// Core libs
const coreLibFiles = import.meta.glob('/src/lib/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Components (includes UI, substrate-os, home, etc.)
const componentFiles = import.meta.glob('/src/components/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Pages (ALL routes — critical for restore!)
const pageFiles = import.meta.glob('/src/pages/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Hooks
const hookFiles = import.meta.glob('/src/hooks/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Contexts
const contextFiles = import.meta.glob('/src/contexts/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Stores (zustand, public metrics, etc.)
const storeFiles = import.meta.glob('/src/stores/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Crown Jewels (S-tier implementations)
const crownJewelFiles = import.meta.glob('/src/crownjewels/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Core module
const coreModuleFiles = import.meta.glob('/src/core/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Config
const srcConfigFiles = import.meta.glob('/src/config/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Data
const dataFiles = import.meta.glob('/src/data/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Immune system
const immuneFiles = import.meta.glob('/src/immune/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Packages
const packageFiles = import.meta.glob('/src/packages/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Release
const releaseFiles = import.meta.glob('/src/release/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Routes
const routeFiles = import.meta.glob('/src/routes/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Services
const serviceFiles = import.meta.glob('/src/services/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Substrate
const substrateFiles = import.meta.glob('/src/substrate/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Utils
const utilFiles = import.meta.glob('/src/utils/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Styles (CSS and TS/TSX)
const styleFiles = import.meta.glob('/src/styles/**/*.{ts,tsx,css}', {
  as: 'raw',
}) as RawGlob;

// Assets — text-safe files only (SVG, JSON)
const assetTextFiles = import.meta.glob('/src/assets/**/*.{svg,json}', {
  as: 'raw',
}) as RawGlob;

// Tests (src/test)
const srcTestFiles = import.meta.glob('/src/test/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// Integrations (client — types.ts is auto-generated but include for reference)
const integrationFiles = import.meta.glob('/src/integrations/**/*.{ts,tsx}', {
  as: 'raw',
}) as RawGlob;

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT SOURCE FILES
// ═══════════════════════════════════════════════════════════════════════════════

const rootSrcFiles = import.meta.glob('/src/*.{ts,tsx,css,json}', {
  as: 'raw',
}) as RawGlob;

// ═══════════════════════════════════════════════════════════════════════════════
// THEME & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const tailwindConfig = import.meta.glob('/tailwind.config.ts', {
  as: 'raw',
}) as RawGlob;

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT CONFIG FILES
// ═══════════════════════════════════════════════════════════════════════════════

const rootConfigFiles = import.meta.glob('/{vite.config.ts,vitest.config.ts,tsconfig.json,tsconfig.app.json,tsconfig.node.json,postcss.config.js,eslint.config.js,components.json,jest.config.js,index.html,package.json}', {
  as: 'raw',
}) as RawGlob;

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTATION, SCRIPTS, PLUGINS
// ═══════════════════════════════════════════════════════════════════════════════

const docFiles = import.meta.glob('/docs/**/*.{md,txt,json,html}', {
  as: 'raw',
}) as RawGlob;

const scriptFiles = import.meta.glob('/scripts/**/*.{ts,js,mjs,sh,json}', {
  as: 'raw',
}) as RawGlob;

const pluginFiles = import.meta.glob('/plugins/**/*.{ts,js,json}', {
  as: 'raw',
}) as RawGlob;

const rootTestFiles = import.meta.glob('/tests/**/*.{ts,tsx,js}', {
  as: 'raw',
}) as RawGlob;

const githubFiles = import.meta.glob('/.github/**/*.{yml,yaml,md}', {
  as: 'raw',
}) as RawGlob;

const rootMarkdown = import.meta.glob('/{README.md,LICENSE.md}', {
  as: 'raw',
}) as RawGlob;

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ASSETS (non-binary text files)
// ═══════════════════════════════════════════════════════════════════════════════

const publicTextFiles = import.meta.glob('/public/**/*.{json,xml,txt,svg,webmanifest,js,css,html,md,ts}', {
  as: 'raw',
}) as RawGlob;

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanPath(rawPath: string): string {
  return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
}

function isArchived(path: string): boolean {
  return path.includes('/_archived/') || path.includes('_archived/');
}

/** Add all files from a glob to the ZIP, incrementing counts */
async function addGlob(
  zip: JSZip,
  glob: RawGlob,
  options: { skipArchived?: boolean } = {},
): Promise<number> {
  let count = 0;
  for (const [path, load] of Object.entries(glob)) {
    if (options.skipArchived && isArchived(path)) continue;
    try {
      const content = await load();
      zip.file(cleanPath(path), content);
      count++;
    } catch (err) {
      console.warn(`[export] Failed to load ${path}:`, err);
    }
  }
  return count;
}

// ─── Export Categories ──────────────────────────────────────────────────────

export interface ExportManifest {
  exportedAt: string;
  distribution: string;
  architectureEpoch: string;
  categories: Record<string, number>;
  totalFiles: number;
  note: string;
}

export async function buildSubstrateZip(): Promise<{ blob: Blob; manifest: ExportManifest }> {
  const zip = new JSZip();
  const counts: Record<string, number> = {};

  // ── Supabase backend (single glob catches all .ts including _shared) ──
  counts.edgeFunctions = await addGlob(zip, edgeFunctionFiles, { skipArchived: true });
  counts.migrations = await addGlob(zip, migrationFiles);
  counts.supabaseConfig = await addGlob(zip, supabaseConfigFiles);

  // ── Source code — all directories ──
  counts.coreLibs = await addGlob(zip, coreLibFiles);
  counts.components = await addGlob(zip, componentFiles);
  counts.pages = await addGlob(zip, pageFiles);
  counts.hooks = await addGlob(zip, hookFiles);
  counts.contexts = await addGlob(zip, contextFiles);
  counts.stores = await addGlob(zip, storeFiles);
  counts.crownJewels = await addGlob(zip, crownJewelFiles);
  counts.core = await addGlob(zip, coreModuleFiles);
  counts.srcConfig = await addGlob(zip, srcConfigFiles);
  counts.data = await addGlob(zip, dataFiles);
  counts.immune = await addGlob(zip, immuneFiles);
  counts.packages = await addGlob(zip, packageFiles);
  counts.release = await addGlob(zip, releaseFiles);
  counts.routes = await addGlob(zip, routeFiles);
  counts.services = await addGlob(zip, serviceFiles);
  counts.substrate = await addGlob(zip, substrateFiles);
  counts.utils = await addGlob(zip, utilFiles);
  counts.styles = await addGlob(zip, styleFiles);
  counts.srcTests = await addGlob(zip, srcTestFiles);
  counts.integrations = await addGlob(zip, integrationFiles);
  counts.assetText = await addGlob(zip, assetTextFiles);

  // ── Root source files (App.tsx, main.tsx, index.css, etc.) ──
  counts.rootSrc = await addGlob(zip, rootSrcFiles);

  // ── Theme & config ──
  counts.tailwindConfig = await addGlob(zip, tailwindConfig);
  counts.rootConfig = await addGlob(zip, rootConfigFiles);

  // ── Docs, scripts, plugins, tests ──
  counts.docs = await addGlob(zip, docFiles);
  counts.scripts = await addGlob(zip, scriptFiles);
  counts.plugins = await addGlob(zip, pluginFiles);
  counts.rootTests = await addGlob(zip, rootTestFiles);
  counts.github = await addGlob(zip, githubFiles);
  counts.rootMarkdown = await addGlob(zip, rootMarkdown);

  // ── Public assets (text-based) ──
  counts.publicAssets = await addGlob(zip, publicTextFiles);

  // Total
  const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0);

  // Build manifest
  const manifest: ExportManifest = {
    exportedAt: new Date().toISOString(),
    distribution: 'CMPSBL',
    architectureEpoch: `${getMetric('epoch')} v${getMetric('version')}`,
    categories: counts,
    totalFiles,
    note: 'Full substrate backup. Binary assets (images, fonts) in src/assets/ and public/ require separate backup via Git. Auto-generated files (types.ts, .env) are included for reference but will be regenerated.',
  };

  // Add manifest to ZIP
  zip.file('SUBSTRATE_MANIFEST.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  return { blob, manifest };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
