/**
 * CMPSBL® Substrate Export
 * 
 * Builds a ZIP archive of the substrate backend + core libs + shared components
 * + theme for deployment to downstream distributions (e.g. LNCHBL).
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

// Theme files
const indexCss = import.meta.glob(
  '/src/index.css',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

const tailwindConfig = import.meta.glob(
  '/tailwind.config.ts',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// UI components (shadcn)
const uiComponentFiles = import.meta.glob(
  '/src/components/ui/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanPath(rawPath: string): string {
  return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
}

function isArchived(path: string): boolean {
  return path.includes('/_archived/') || path.includes('_archived/');
}

// ─── Cleanup Manifest ───────────────────────────────────────────────────────

/**
 * Files and directories that LNCHBL should DELETE before extracting the ZIP.
 * These are legacy artifacts from pre-SPARTA / pre-v11 architecture that
 * would conflict with the current 9-module system.
 */
const CLEANUP_MANIFEST = {
  version: '11.1',
  description: 'Delete these files/directories in the LNCHBL project BEFORE extracting the substrate ZIP. This ensures no legacy pre-SPARTA artifacts remain.',
  instructions: [
    '1. Back up your LNCHBL landing page files (e.g. src/pages/Index.tsx, src/pages/Landing.tsx) — these are NOT included in the ZIP',
    '2. Delete all directories listed in "directories_to_delete"',
    '3. Delete all files listed in "files_to_delete"',
    '4. Extract the ZIP into the project root',
    '5. Restore your LNCHBL landing page files',
    '6. Run migrations in order against the LNCHBL database',
  ],
  directories_to_delete: [
    // Full replacement targets
    'src/lib/',
    'src/components/',
    'supabase/functions/',
    'supabase/migrations/',

    // Legacy module directories (pre-SPARTA, pre-9-module)
    'src/lib/modules/',
    'src/lib/entities/',
    'src/lib/workers/',

    // Legacy 21-module system artifacts
    'src/components/modules/',
    'src/components/entities/',

    // Old documentation
    'docs/archive/',
  ],
  files_to_delete: [
    // Legacy config / manifests
    'src/lib/moduleManifest.ts',
    'src/lib/entityManifest.ts',
    'src/lib/workerRegistry.ts',
    'src/lib/legacyModules.ts',

    // Old distribution configs
    'src/lib/distribution-legacy.ts',

    // Pre-SPARTA boot files
    'src/lib/initializeModules.ts',
    'src/lib/initializeEntities.ts',

    // Legacy theme files (will be replaced)
    'src/index.css',
    'tailwind.config.ts',
    'tailwind.config.js',
  ],
  preserve: [
    'src/pages/',
    'src/App.tsx',
    'src/main.tsx',
    'src/integrations/',
    'public/',
    '.env',
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'README.md',
  ],
};

// ─── Export Categories ──────────────────────────────────────────────────────

export interface ExportManifest {
  exportedAt: string;
  distribution: string;
  targetDistribution: string;
  architectureEpoch: string;
  categories: {
    edgeFunctions: number;
    edgeShared: number;
    migrations: number;
    coreLibs: number;
    components: number;
    config: number;
    theme: number;
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
    theme: 0,
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

  // Theme: index.css
  for (const [path, content] of Object.entries(indexCss)) {
    zip.file(cleanPath(path), content);
    counts.theme++;
    totalFiles++;
  }

  // Theme: tailwind.config.ts
  for (const [path, content] of Object.entries(tailwindConfig)) {
    zip.file(cleanPath(path), content);
    counts.theme++;
    totalFiles++;
  }

  // Build manifest
  const manifest: ExportManifest = {
    exportedAt: new Date().toISOString(),
    distribution: 'CMPSBL',
    targetDistribution: 'LNCHBL',
    architectureEpoch: 'SPARTA v11.1',
    categories: counts,
    totalFiles,
  };

  // Add manifests to ZIP
  zip.file('SUBSTRATE_MANIFEST.json', JSON.stringify(manifest, null, 2));
  zip.file('CLEANUP_MANIFEST.json', JSON.stringify(CLEANUP_MANIFEST, null, 2));

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
