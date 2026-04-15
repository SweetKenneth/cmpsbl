/**
 * Unified Ascension + Mana Export Pipeline
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Produces a single export that combines:
 *   1. Ascended code (full Convex Core™ runtime, capabilities pre-activated)
 *   2. Original user code (unchanged, byte-for-byte)
 *   3. USER-GUIDE.html (single unified doc with TOC)
 *   4. LICENSE.html (branded)
 *   5. manifest.json (machine-readable)
 *
 * This is the convergence of both patents:
 *   - U.S. App. No. 64/029,678 (Ascension — discovery + transformation)
 *   - U.S. App. No. 64/031,637 (Mana — runtime wrapping without source modification)
 *
 * Flow:
 *   Ascension discovers capabilities →
 *   generateRefurbishedCode() produces the full Convex Core™ sealed artifact →
 *   USER-GUIDE consolidates all documentation →
 *   ZIP bundles ascended/ + original/ + docs
 *
 * © CMPSBL® — All rights reserved.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  generateRefurbishedCode,
  getRefurbishedExtension,
} from '@/lib/factory/generate-refurbished-code';
import {
  detectFunctionBoundaries,
  buildAttachmentPlan,
} from '@/lib/mana/findings-bridge';
import { generateLicenseHTML } from '@/lib/export/elegant-html-docs';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { generateUserGuideHTML } from '@/lib/export/user-guide';
import type { AscensionResults } from './orchestrator';
import { deterministicFingerprint } from './orchestrator';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface SourceFile {
  readonly name: string;
  readonly content: string;
}

interface UnifiedExportInput {
  /** Canonical results from the Ascension run */
  readonly results: AscensionResults;
  /** User's original source files */
  readonly sourceFiles: ReadonlyArray<SourceFile>;
}

// ═══════════════════════════════════════════════════════════════
// §1 — Map Ascension capabilities → PrimitiveRecommendation[]
// ═══════════════════════════════════════════════════════════════

/**
 * Convert Ascension's DiscoveredCapability[] to the PrimitiveRecommendation[]
 * format expected by generateRefurbishedCode(). This bridges the two systems.
 */
function capabilitiesToPrimitives(
  capabilities: AscensionResults['capabilities'],
): PrimitiveRecommendation[] {
  // Deduplicate by nodeA/nodeB — each unique primitive node becomes one recommendation
  const seen = new Map<string, PrimitiveRecommendation>();

  for (const cap of capabilities) {
    for (const nodeName of [cap.nodeA, cap.nodeB]) {
      if (!seen.has(nodeName)) {
        seen.set(nodeName, {
          primitiveId: nodeName.toLowerCase(),
          name: nodeName,
          category: categorizeNode(nodeName),
          impactScore: cap.score,
          rationale: cap.description,
          chainPosition: seen.size + 1,
          collisionScore: cap.score,
        });
      }
    }
  }

  return Array.from(seen.values());
}

/** Categorize a primitive node into Organ/Layer/Engine/Agent */
function categorizeNode(name: string): 'Organ' | 'Layer' | 'Engine' | 'Agent' {
  const organs = new Set([
    'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
    'IDENTITY', 'SOVEREIGN', 'DREAM', 'ORACLE', 'CONSCIENCE', 'ATLAS',
  ]);
  const layers = new Set([
    'DEFENSE', 'BEACON', 'GOVERNANCE', 'FAILSAFE', 'AUDIT', 'SHADOW',
    'REFLEX', 'SANDBOX', 'RELAY', 'ENCODE', 'DECODE', 'ACCESS',
  ]);
  const engines = new Set([
    'CORTEX', 'VISION', 'HARVEST', 'FORGE', 'EVOLUTION', 'COMPASS', 'ECHO', 'INCLUSIVE',
  ]);
  if (organs.has(name)) return 'Organ';
  if (layers.has(name)) return 'Layer';
  if (engines.has(name)) return 'Engine';
  return 'Agent';
}

// ═══════════════════════════════════════════════════════════════
// §2 — Unified Export Generator
// ═══════════════════════════════════════════════════════════════

export async function generateUnifiedExport(input: UnifiedExportInput): Promise<void> {
  const { results, sourceFiles } = input;
  const { runId, candidateName, sourceLanguage, capabilities } = results;

  const zip = new JSZip();
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const packName = `cmpsbl-ascended-${candidateName.toLowerCase()}-${timestamp}`;

  // ─── Step 1: Convert capabilities to PrimitiveRecommendation[] ───
  const primitives = capabilitiesToPrimitives(capabilities);

  // ─── Step 2: Compute fingerprint ───
  const packFingerprint = deterministicFingerprint(
    candidateName,
    primitives.map(p => p.name).join(','),
    runId,
    runId,
  );

  // ─── Step 3: Generate ascended code via the REAL factory engine ───
  // This produces the full Convex Core™ sealed artifact with:
  //   - Sealed header with fingerprint, chain, patent refs
  //   - Full inline runtime classes (PersistentMemory, DefenseLayer, etc.)
  //   - Dispatch matrix (_CMPSBL_DT, _CMPSBL_CM)
  //   - Pipeline stage comments
  //   - Primitive instrumentation guards
  //   - Mana attachment manifest with targeted function wrappers
  //   - Original source (Layer 1) — byte-identical
  //   - Self-verification block
  //   - Sealed footer
  const ascendedFolder = zip.folder('ascended')!;
  for (const sf of sourceFiles) {
    const ascendedCode = generateRefurbishedCode(
      sf.content,
      primitives,
      packFingerprint,
      sourceLanguage,
      sf.name,
    );
    // Use the correct file extension for the target language
    const ext = getRefurbishedExtension(sourceLanguage);
    const baseName = sf.name.replace(/\.[^.]+$/, '') + ext;
    ascendedFolder.file(baseName, ascendedCode);
  }

  // ─── Step 4: Original source files (untouched copy for reference) ───
  const originalFolder = zip.folder('original')!;
  for (const sf of sourceFiles) {
    originalFolder.file(sf.name, sf.content);
  }
  originalFolder.file('README.md', [
    `# Original Source — ${sourceLanguage}`,
    '',
    'These are your original source files — **unchanged and authoritative**.',
    '',
    '## How It Works',
    '',
    '- **ascended/** — Your code with the CMPSBL® Convex Core™ runtime embedded inline.',
    '- **original/** (this folder) — Your untouched source for reference and comparison.',
    '',
    'The ascended versions contain everything needed to run — no external imports required.',
    'To deactivate capabilities, use the CMPSBL® Terminal.',
    '',
    '---',
    '© Your original work. Layer 2 overlay © 2025–2026 CMPSBL®.',
  ].join('\n'));

  // ─── Step 5: Detect boundaries for docs ───
  const allBoundaries = sourceFiles.flatMap(f => {
    const boundaries = detectFunctionBoundaries(f.content);
    return boundaries.map(b => ({ ...b, sourceFile: f.name }));
  });
  const activePrimitiveNames = new Set(primitives.map(p => p.name));
  const allFindings = buildAttachmentPlan(allBoundaries, activePrimitiveNames);

  // ─── Step 6: Build capability index for docs ───
  const capabilitiesForDocs = capabilities.map(cap => ({
    name: cap.name.replace(/\s+/g, '_'),
    description: cap.description,
    score: cap.score,
    tier: cap.tier,
    nodeA: cap.nodeA,
    nodeB: cap.nodeB,
    fingerprint: deterministicFingerprint(cap.name, cap.nodeA, cap.nodeB, runId),
  }));

  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.score, 0) / capabilities.length);
  const allModules = [...new Set(capabilities.flatMap(c => [c.nodeA, c.nodeB]))];

  // ─── Step 7: USER-GUIDE.html (single unified doc) ───
  const attachmentEntries = allFindings.map(f => ({
    functionName: f.functionName,
    capability: f.capability,
    primitive: f.primitive,
    reason: f.reason,
  }));

  zip.file('USER-GUIDE.html', generateUserGuideHTML({
    candidateName,
    runId,
    sourceLanguage,
    capabilities: capabilitiesForDocs,
    attachments: attachmentEntries,
    totalBoundaries: allBoundaries.length,
    sourceFileNames: sourceFiles.map(f => f.name),
    avgCjpi,
    packFingerprint,
  }));

  // ─── Step 8: LICENSE.html (branded) ───
  zip.file('LICENSE.html', generateLicenseHTML(candidateName));

  // ─── Step 9: manifest.json (machine-readable only) ───
  zip.file('manifest.json', serializeCmpsblManifest({
    name: packName,
    cjpi: avgCjpi,
    modules: allModules,
    targets: [sourceLanguage],
    version: '1.0.0',
    category: 'ascended-wrapped',
    fingerprint: packFingerprint,
    source: 'unified-ascension-mana-pipeline',
  }));

  // ─── Generate and download ───
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  saveAs(blob, `${packName}.zip`);
}
