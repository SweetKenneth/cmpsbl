import {
  generateExportBundle,
  getLanguagesForScore,
  SOFTWARE_LANGUAGES,
  type ExportLanguage,
  type ExportTarget,
  type ExportableArtifact,
} from './universal-adapter';

export interface TieredFoundryExportArtifact {
  id: string;
  name: string;
  score: number;
  publicTier: string;
  valuationDisplay?: number;
  category?: string | null;
  systemChain?: string[] | null;
  description?: string | null;
  fingerprint?: string | null;
  obtainedAt?: string;
  source?: string;
}

export interface TieredFoundryZipResult {
  artifactCount: number;
  totalLanguageVariants: number;
  fileCount: number;
}

const SOFTWARE_LANGUAGE_SET = new Set<ExportLanguage>(SOFTWARE_LANGUAGES);
const RAW_FALLBACK_LANGUAGES: ExportLanguage[] = ['typescript'];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getTieredSoftwareLanguages(score: number): ExportLanguage[] {
  const unlocked = getLanguagesForScore(score)
    .filter((lang) => !lang.locked && SOFTWARE_LANGUAGE_SET.has(lang.value))
    .map((lang) => lang.value);

  return unlocked.length > 0 ? unlocked : RAW_FALLBACK_LANGUAGES;
}

async function loadRuntimeFiles(): Promise<{ runtime: string; engine: string }> {
  const [runtimeMod, engineMod] = await Promise.all([
    import('./standalone-runtime?raw'),
    import('./standalone-discovery-engine?raw'),
  ]);

  return {
    runtime: (runtimeMod as { default: string }).default,
    engine: (engineMod as { default: string }).default,
  };
}

function createExportableArtifact(item: TieredFoundryExportArtifact): ExportableArtifact {
  const moduleChain = item.systemChain && item.systemChain.length > 0
    ? item.systemChain
    : ['SYSTEM'];

  return {
    id: item.fingerprint || item.id,
    name: item.name,
    rank: 0,
    cjpi: item.score,
    module: moduleChain[0],
    description: item.description || `Crystallized pipeline: ${item.name}`,
    sourceCode: '',
    synthesisContext: {
      name: item.name,
      moduleChain,
      cjpi: item.score,
      description: item.description || `${item.name} pipeline export`,
      category: item.category || 'general',
      entryCapability: 'process',
      exitCapability: 'emit',
      errorStrategy: 'propagate',
      maxExecutionMs: 30000,
    },
  };
}

export async function downloadTieredFoundryZip(options: {
  artifacts: TieredFoundryExportArtifact[];
  filePrefix: string;
  sourceLabel: string;
}): Promise<TieredFoundryZipResult> {
  const { artifacts, filePrefix, sourceLabel } = options;

  if (artifacts.length === 0) {
    return { artifactCount: 0, totalLanguageVariants: 0, fileCount: 0 };
  }

  const [JSZipMod, runtimeFiles] = await Promise.all([
    import('jszip'),
    loadRuntimeFiles(),
  ]);

  const JSZip = JSZipMod.default;
  const zip = new JSZip();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rootName = `${filePrefix}-${timestamp}`;
  const root = zip.folder(rootName)!;

  const languageMap: Record<string, ExportLanguage[]> = {};
  for (const artifact of artifacts) {
    languageMap[artifact.id] = getTieredSoftwareLanguages(artifact.score);
  }

  const manifest = {
    exportedAt: new Date().toISOString(),
    source: sourceLabel,
    artifactCount: artifacts.length,
    totalValuation: artifacts.reduce((sum, item) => sum + (item.valuationDisplay || 0), 0),
    artifacts: artifacts.map((item) => ({
      id: item.id,
      name: item.name,
      score: item.score,
      tier: item.publicTier,
      valuation: item.valuationDisplay || 0,
      category: item.category || null,
      systemChain: item.systemChain || [],
      fingerprint: item.fingerprint || null,
      obtainedAt: item.obtainedAt || null,
      source: item.source || sourceLabel,
      exportLanguages: languageMap[item.id],
    })),
  };
  root.file('manifest.json', JSON.stringify(manifest, null, 2));

  const runtimeFolder = root.folder('_runtime')!;
  runtimeFolder.file('standalone-runtime.ts', runtimeFiles.runtime);
  runtimeFolder.file('standalone-discovery-engine.ts', runtimeFiles.engine);
  runtimeFolder.file(
    'README.md',
    [
      '# Standalone Micro-Substrate Runtime',
      '',
      'Portable runtime included for all exported Foundry artifacts.',
      'Use this runtime to execute generated pipeline bundles without external infrastructure.',
    ].join('\n')
  );

  let fileCount = 0;
  let totalLanguageVariants = 0;

  for (const item of artifacts) {
    const artifact = createExportableArtifact(item);
    const unlockedLanguages = languageMap[item.id];
    totalLanguageVariants += unlockedLanguages.length;

    const targets: ExportTarget[] = unlockedLanguages.map((language) => ({
      language,
      adapter: 'standalone',
    }));

    const bundle = generateExportBundle(artifact, targets);
    const artifactFolder = root.folder(slugify(item.name || item.id))!;

    artifactFolder.file('README.md', bundle.readme);
    artifactFolder.file(
      'export-tier.json',
      JSON.stringify(
        {
          score: item.score,
          tier: item.publicTier,
          unlockedSoftwareLanguages: unlockedLanguages,
        },
        null,
        2,
      ),
    );

    for (const file of bundle.files) {
      artifactFolder.file(file.filename, file.content);
      fileCount += 1;
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${rootName}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);

  return {
    artifactCount: artifacts.length,
    totalLanguageVariants,
    fileCount,
  };
}
