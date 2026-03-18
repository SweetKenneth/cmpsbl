import {
  generateExportBundle,
  getLanguagesForScore,
  SOFTWARE_LANGUAGES,
  type ExportLanguage,
  type ExportTarget,
  type ExportableArtifact,
} from './universal-adapter';
import { serializeCmpsblManifest } from './cmpsbl-manifest';
import { generatePipelineDetailsHTML } from './pipeline-details-page';
import {
  generateSealedRuntime,
  generateSealedDiscoveryEngine,
  generateSealedRuntimeReadme,
} from './sealed-runtime-generator';
import { estimateMarketValue, formatMarketValue, getTierFromScore } from '@/lib/pipeline-valuation';
import { getFunctionalDescription } from '@/lib/pipeline-descriptions';

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
  // Use SEALED versions — never bundle raw source with proprietary internals
  return {
    runtime: generateSealedRuntime(),
    engine: generateSealedDiscoveryEngine(),
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
    description: item.description || getFunctionalDescription(item.name, moduleChain),
    sourceCode: '',
    synthesisContext: {
      name: item.name,
      moduleChain,
      cjpi: item.score,
      description: item.description || getFunctionalDescription(item.name, moduleChain),
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

  // Hardening 15: Cap export batch size to prevent zip bombs
  const MAX_EXPORT_ARTIFACTS = 200;
  if (artifacts.length > MAX_EXPORT_ARTIFACTS) {
    throw new Error(`Export capped at ${MAX_EXPORT_ARTIFACTS} artifacts for safety. Got ${artifacts.length}.`);
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
    totalValuation: artifacts.reduce((sum, item) => sum + estimateMarketValue(item.score, item.category || 'general', (item.systemChain || []).length), 0),
    totalValuationFormatted: formatMarketValue(artifacts.reduce((sum, item) => sum + estimateMarketValue(item.score, item.category || 'general', (item.systemChain || []).length), 0)),
    valuationMethod: 'CMPSBL® proprietary scoring model',
    artifacts: artifacts.map((item) => {
      const estValue = estimateMarketValue(item.score, item.category || 'general', (item.systemChain || []).length);
      return {
        id: item.id,
        name: item.name,
        score: item.score,
        tier: item.publicTier,
        estimatedValue: estValue,
        estimatedValueFormatted: formatMarketValue(estValue),
        category: item.category || null,
        systemChain: item.systemChain || [],
        fingerprint: item.fingerprint || null,
        obtainedAt: item.obtainedAt || null,
        source: item.source || sourceLabel,
        exportLanguages: languageMap[item.id],
      };
    }),
  };
  root.file('manifest.json', JSON.stringify(manifest, null, 2));

  const runtimeFolder = root.folder('_runtime')!;
  runtimeFolder.file('standalone-runtime.ts', runtimeFiles.runtime);
  runtimeFolder.file('standalone-discovery-engine.ts', runtimeFiles.engine);
  runtimeFolder.file('README.md', generateSealedRuntimeReadme());

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

    // Pipeline Details page — in-depth HTML report with valuation
    const detailsHTML = generatePipelineDetailsHTML({
      name: item.name,
      description: item.description || getFunctionalDescription(item.name, item.systemChain || ['SYSTEM']),
      category: item.category || 'general',
      score: item.score,
      tier: item.publicTier || getTierFromScore(item.score),
      systemChain: item.systemChain || ['SYSTEM'],
      fingerprint: item.fingerprint,
      exportLanguages: unlockedLanguages,
      obtainedAt: item.obtainedAt,
      source: item.source,
    });
    artifactFolder.file('PIPELINE-DETAILS.html', detailsHTML);

    artifactFolder.file(
      'export-tier.json',
      JSON.stringify(
        {
          score: item.score,
          tier: item.publicTier,
          valuation: {
            estimated: estimateMarketValue(item.score, item.category || 'general', (item.systemChain || []).length),
            formatted: formatMarketValue(estimateMarketValue(item.score, item.category || 'general', (item.systemChain || []).length)),
            disclaimer: 'AI-generated estimate. Not financial advice. May be significantly inaccurate.',
          },
          unlockedSoftwareLanguages: unlockedLanguages,
        },
        null,
        2,
      ),
    );

    // Per-artifact CMPSBL manifest
    artifactFolder.file('manifest.json', serializeCmpsblManifest({
      name: item.name,
      cjpi: item.score,
      modules: item.systemChain || ['SYSTEM'],
      targets: unlockedLanguages,
      category: item.category || undefined,
      fingerprint: item.fingerprint || undefined,
      source: item.source || options.sourceLabel,
    }));

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
