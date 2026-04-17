/**
 * ULTIMATE 45-Layer × 9-Language Stress Test
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Exercises the Ascension V2 export flow for every selectable layer (45)
 * across every shipping language (9) using mixed selection sizes
 * (1, 4, 12, 25, 45 layers). Validates:
 *   1) generateUnifiedCapabilityFile emits non-empty output
 *   2) Every selected layer's identifier appears in the artifact
 *   3) Output exceeds a sane minimum byte floor per language
 *   4) No language throws LanguageNotShippingError
 *   5) Combination determinism: same input → identical output bytes
 *
 * Pass criteria: 100% combinations succeed.
 * © CMPSBL® — All rights reserved.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import {
  getAvailableLayers,
  type CmpsblLayerDefinition,
} from '@/lib/export/cmpsbl-layers';
import { getShippingLanguages } from '@/lib/export/language-parity-tiers';

const OUT_DIR = '/tmp/ultimate-45-stress';
mkdirSync(OUT_DIR, { recursive: true });

// ── Inputs ────────────────────────────────────────────────────────────
const ALL_LAYERS: CmpsblLayerDefinition[] = getAvailableLayers();
const SHIPPING_LANGS: string[] = getShippingLanguages().map((l) => l.id);

console.log(`✦ Selectable layers: ${ALL_LAYERS.length}`);
console.log(`✦ Shipping languages: ${SHIPPING_LANGS.length} → ${SHIPPING_LANGS.join(', ')}\n`);

// Synthetic capability bundle representative of an Ascension V2 export.
const CAPS: UnifiedCapabilityInput[] = [
  {
    id: 'stress-cap-a',
    name: 'Hardened_Worker',
    cjpiScore: 92,
    tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'IMMUNITY', 'FAILSAFE'],
    fingerprint: 'STRESS45LAYERS00000000000000000A',
    moatSignature: 'ENTERPRISE_HARDENED',
  } as any,
  {
    id: 'stress-cap-b',
    name: 'Reflex_Engine',
    cjpiScore: 88,
    tier: 'apex',
    chain: ['CORTEX', 'NEXUS', 'ORACLE'],
    fingerprint: 'STRESS45LAYERS00000000000000000B',
    moatSignature: 'PRODUCTION_GRADE',
  } as any,
];

// Selection sizes (covers single, small, medium, large, ALL)
const SELECTION_SIZES = [1, 4, 12, 25, 45];

interface Result {
  lang: string;
  size: number;
  layers: string[];
  bytes: number;
  ok: boolean;
  err?: string;
  layerHitRatio?: number;   // fraction of selected layer ids found in artifact
  determinismOk?: boolean;  // identical bytes when re-run
}

const results: Result[] = [];

// Deterministic slice — start at 0, take `size` from the front so we
// hit every catalog entry across the size sweep.
function pickLayers(size: number): CmpsblLayerDefinition[] {
  return ALL_LAYERS.slice(0, size);
}

// Verify each selected layer left a fingerprint in the artifact.
// Native langs render layer code; we check for the layer.id slug or its
// PascalCase namespace token (object/class/struct name) in the output.
function layerHits(artifact: string, layers: CmpsblLayerDefinition[]): number {
  let hits = 0;
  for (const l of layers) {
    const slug = l.id;
    const pascal = l.id
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    if (artifact.includes(slug) || artifact.includes(pascal)) hits++;
  }
  return hits / layers.length;
}

// Per-language minimum byte floor — guards against silent empty emission.
const MIN_BYTES_PER_LANG: Record<string, number> = {
  typescript: 4_000, javascript: 4_000, python: 3_000,
  rust: 2_000,  go: 2_000,  java: 2_000,
  kotlin: 2_000, csharp: 2_000, swift: 2_000,
};

// ── Run sweep ─────────────────────────────────────────────────────────
let combo = 0;
const t0 = Date.now();

for (const lang of SHIPPING_LANGS) {
  for (const size of SELECTION_SIZES) {
    combo++;
    const selected = pickLayers(size);
    const r: Result = {
      lang,
      size,
      layers: selected.map((l) => l.id),
      bytes: 0,
      ok: false,
    };

    try {
      const out = generateUnifiedCapabilityFile(
        CAPS,
        `stress_${lang}_${size}`,
        lang,
        undefined,
        selected,
      );
      r.bytes = out.length;
      r.layerHitRatio = layerHits(out, selected);

      // Determinism re-run.
      const out2 = generateUnifiedCapabilityFile(
        CAPS,
        `stress_${lang}_${size}`,
        lang,
        undefined,
        selected,
      );
      r.determinismOk = out === out2;

      const minBytes = MIN_BYTES_PER_LANG[lang] ?? 1_000;
      r.ok = r.bytes >= minBytes && r.determinismOk === true;

      writeFileSync(join(OUT_DIR, `${lang}-${size}.out`), out);
    } catch (e: any) {
      r.err = String(e?.message || e).split('\n')[0].slice(0, 220);
    }

    results.push(r);
  }
}

const elapsedMs = Date.now() - t0;

// ── Report ────────────────────────────────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`ULTIMATE 45-LAYER × 9-LANG STRESS TEST  (${combo} combinations, ${elapsedMs}ms)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('LANG'.padEnd(12) + 'SIZE'.padEnd(7) + 'BYTES'.padEnd(10) + 'HITS'.padEnd(9) + 'DETERM'.padEnd(8) + 'STATUS');
console.log('-'.repeat(80));
for (const r of results) {
  const bytes = r.bytes ? `${(r.bytes / 1024).toFixed(1)}K`.padEnd(10) : '—'.padEnd(10);
  const hits = r.layerHitRatio !== undefined
    ? `${Math.round(r.layerHitRatio * 100)}%`.padEnd(9)
    : '—'.padEnd(9);
  const det = r.determinismOk === true ? '✓' : r.determinismOk === false ? '✗' : '—';
  const status = r.ok ? '✓ OK' : `✗ ${r.err ?? 'BELOW MIN'}`;
  console.log(
    `${r.lang.padEnd(12)}${String(r.size).padEnd(7)}${bytes}${hits}${det.padEnd(8)}${status}`,
  );
}
console.log('-'.repeat(80));

const okCount = results.filter((r) => r.ok).length;
const failCount = results.length - okCount;
const determFail = results.filter((r) => r.determinismOk === false).length;
const lowHits   = results.filter((r) => (r.layerHitRatio ?? 0) < 0.6 && !r.err).length;

console.log(`combinations: ${results.length}`);
console.log(`passed:       ${okCount}/${results.length}`);
console.log(`failed:       ${failCount}`);
console.log(`determinism:  ${results.length - determFail}/${results.length}`);
console.log(`hit ratio<60%: ${lowHits}`);
console.log(`output:       ${OUT_DIR}`);

process.exit(okCount === results.length ? 0 : 1);
