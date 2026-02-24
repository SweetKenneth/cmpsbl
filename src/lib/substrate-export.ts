/**
 * CMPSBL® Substrate Export
 * 
 * Builds a ZIP archive of the substrate backend + core libs + shared components
 * for deployment to downstream distributions (e.g. LNCHBL).
 * 
 * Uses Vite's import.meta.glob to embed file contents at build time.
 * JSZip creates the downloadable archive at runtime.
 */

import JSZip from 'jszip';

// ─── Build-time file embedding ──────────────────────────────────────────────

// Edge functions (exclude _archived)
const edgeFunctionFiles = import.meta.glob(
  '/supabase/functions/**/index.ts',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// Shared edge function utils
const edgeSharedFiles = import.meta.glob(
  '/supabase/functions/_shared/**/*.ts',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// Schema migrations
const migrationFiles = import.meta.glob(
  '/supabase/migrations/**/*.sql',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// Substrate core libs
const coreLibFiles = import.meta.glob(
  '/src/lib/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// Shared components
const componentFiles = import.meta.glob(
  '/src/components/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// Config files
const configFiles = import.meta.glob(
  '/supabase/config.toml',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanPath(rawPath: string): string {
  // Remove leading slash
  return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
}

function isArchived(path: string): boolean {
  return path.includes('/_archived/') || path.includes('_archived/');
}

// ─── Export Categories ──────────────────────────────────────────────────────

export interface ExportManifest {
  exportedAt: string;
  distribution: string;
  targetDistribution: string;
  categories: {
    edgeFunctions: number;
    edgeShared: number;
    migrations: number;
    coreLibs: number;
    components: number;
    config: number;
  };
  totalFiles: number;
}

export async function buildSubstrateZip(): Promise<{ blob: Blob; manifest: ExportManifest }> {
  const zip = new JSZip();
  let totalFiles = 0;

  const counts = {
    edgeFunctions: 0,
    edgeShared: 0,
    migrations: 0,
    coreLibs: 0,
    components: 0,
    config: 0,
  };

  // Edge functions (skip archived)
  for (const [path, content] of Object.entries(edgeFunctionFiles)) {
    if (isArchived(path)) continue;
    zip.file(cleanPath(path), content);
    counts.edgeFunctions++;
    totalFiles++;
  }

  // Edge shared
  for (const [path, content] of Object.entries(edgeSharedFiles)) {
    if (isArchived(path)) continue;
    zip.file(cleanPath(path), content);
    counts.edgeShared++;
    totalFiles++;
  }

  // Migrations
  for (const [path, content] of Object.entries(migrationFiles)) {
    zip.file(cleanPath(path), content);
    counts.migrations++;
    totalFiles++;
  }

  // Core libs
  for (const [path, content] of Object.entries(coreLibFiles)) {
    zip.file(cleanPath(path), content);
    counts.coreLibs++;
    totalFiles++;
  }

  // Components
  for (const [path, content] of Object.entries(componentFiles)) {
    zip.file(cleanPath(path), content);
    counts.components++;
    totalFiles++;
  }

  // Config
  for (const [path, content] of Object.entries(configFiles)) {
    zip.file(cleanPath(path), content);
    counts.config++;
    totalFiles++;
  }

  // Build manifest
  const manifest: ExportManifest = {
    exportedAt: new Date().toISOString(),
    distribution: 'CMPSBL',
    targetDistribution: 'LNCHBL',
    categories: counts,
    totalFiles,
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
