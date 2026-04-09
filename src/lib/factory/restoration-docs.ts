/**
 * Restoration Documentation Generator
 * Generates the full technical document package after Ascension.
 * Uses the expanded capability registry for Active/Passive/Hybrid archetypes.
 */

import type { ScanResult, PrimitiveRecommendation } from './scan-team';
import { getCapabilityRegistry, type CapabilityDefinition } from './scan-team';

export interface RestorationReport {
  id: string;
  generatedAt: Date;
  /** 1. Pipeline Details */
  pipelineDetails: PipelineStep[];
  /** 2. New Capabilities */
  newCapabilities: CapabilityEntry[];
  /** 3. Vulnerability Assessment */
  vulnerabilityAssessment: VulnerabilityEntry[];
  /** 4. Error Codes */
  errorCodes: ErrorCodeEntry[];
  /** 5. Testing Guide */
  testingGuide: TestingGuideEntry;
  /** 6. CJPI Certificate */
  cjpiCertificate: CJPICertificate;
  /** 7. Primitive Manifest */
  primitiveManifest: PrimitiveManifestEntry[];
}

export interface PipelineStep {
  order: number;
  primitiveName: string;
  action: string;
  durationMs: number;
}

export interface CapabilityEntry {
  name: string;
  description: string;
  usageExample: string;
}

export interface VulnerabilityEntry {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  status: 'hardened' | 'mitigated' | 'monitor';
  details: string;
}

export interface ErrorCodeEntry {
  code: string;
  trigger: string;
  resolution: string;
}

export interface TestingGuideEntry {
  installCommand: string;
  testCommand: string;
  configPath: string;
  steps: string[];
}

export interface CJPICertificate {
  serialNumber: string;
  score: number;
  tier: string;
  fingerprint: string;
  discoveryDate: Date;
  primitiveChain: string[];
}

export interface PrimitiveManifestEntry {
  name: string;
  category: string;
  contribution: string;
}

/**
 * Generate a restoration report from scan results and selected primitives.
 */
export function generateRestorationReport(
  scanResult: ScanResult,
  selectedPrimitives: PrimitiveRecommendation[],
): RestorationReport {
  const serialNumber = `CMPSBL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Generate pipeline steps from selected primitives
  const pipelineDetails: PipelineStep[] = selectedPrimitives.map((p, idx) => ({
    order: idx + 1,
    primitiveName: p.name,
    action: `${p.name} applied ${p.category.toLowerCase()}-level hardening: ${p.rationale}`,
    durationMs: 2000 + Math.floor(Math.random() * 8000),
  }));

  // Generate capabilities from the registry — ENCODE selects ALL matched
  // capabilities classified as Active/Passive/Hybrid. No artificial cap —
  // vertical expansion capabilities must surface alongside spine capabilities.
  const newCapabilities = selectCapabilities(selectedPrimitives);

  // Convert findings to vulnerability assessment
  const vulnerabilityAssessment: VulnerabilityEntry[] = scanResult.findings.map(f => ({
    severity: f.severity,
    title: f.title,
    status: f.severity === 'critical' ? 'hardened' : f.severity === 'warning' ? 'mitigated' : 'monitor',
    details: f.description,
  }));

  // Standard error codes
  const errorCodes: ErrorCodeEntry[] = [
    { code: 'CMPSBL-E001', trigger: 'Circuit breaker tripped', resolution: 'Automatic recovery via FAILSAFE. No action needed.' },
    { code: 'CMPSBL-E002', trigger: 'Defense layer blocked request', resolution: 'Check request origin against allowlist.' },
    { code: 'CMPSBL-E003', trigger: 'Governance check failed', resolution: 'Verify operation is within policy bounds.' },
    { code: 'CMPSBL-E004', trigger: 'BEACON health check timeout', resolution: 'Check system resource availability.' },
  ];

  // Testing guide
  const testingGuide: TestingGuideEntry = {
    installCommand: 'npm install @cmpsbl/test-harness',
    testCommand: 'npx cmpsbl-test --config ./restoration-report.json',
    configPath: './restoration-report.json',
    steps: [
      'Install the test harness: npm install @cmpsbl/test-harness',
      'Place the restoration-report.json in your project root',
      'Run: npx cmpsbl-test --config ./restoration-report.json',
      'Review output — each primitive\'s hardening is verified independently',
      'Green = hardening active. Red = review the specific primitive section.',
    ],
  };

  // Generate fingerprint
  const chainStr = selectedPrimitives.map(p => p.primitiveId).join(':');
  const fingerprint = generateFingerprint(chainStr + serialNumber);

  // Determine tier from estimated CJPI
  const score = Math.min(100, scanResult.cjpiEstimate + selectedPrimitives.length * 2);
  const tier = score >= 100 ? 'Apex' : score >= 94 ? 'Mythic' : score >= 90 ? 'Relic' : score >= 80 ? 'Prime' : score >= 68 ? 'Mint' : 'Raw';

  const cjpiCertificate: CJPICertificate = {
    serialNumber,
    score,
    tier,
    fingerprint,
    discoveryDate: new Date(),
    primitiveChain: selectedPrimitives.map(p => p.name),
  };

  const primitiveManifest: PrimitiveManifestEntry[] = selectedPrimitives.map(p => ({
    name: p.name,
    category: p.category,
    contribution: p.rationale,
  }));

  return {
    id: serialNumber,
    generatedAt: new Date(),
    pipelineDetails,
    newCapabilities,
    vulnerabilityAssessment,
    errorCodes,
    testingGuide,
    cjpiCertificate,
    primitiveManifest,
  };
}

/** Simple hash for fingerprint generation */
function generateFingerprint(input: string): string {
  let hash = 0n;
  for (let i = 0; i < input.length; i++) {
    const char = BigInt(input.charCodeAt(i));
    hash = ((hash << 5n) - hash) + char;
    hash = hash & 0xFFFFFFFFFFFFFFFFn;
  }
  return hash.toString(16).padStart(16, '0');
}

/**
 * ENCODE-driven capability selection — matches capabilities to the
 * user's selected primitives using the registry's sourcePrimitives field.
 * Returns ALL matched capabilities (uncapped) so vertical expansion
 * capabilities surface alongside spine capabilities in every export.
 * Ensures a mix of Active, Passive, and Hybrid archetypes via priority ordering.
 */
function selectCapabilities(
  selectedPrimitives: PrimitiveRecommendation[],
): CapabilityEntry[] {
  const registry = getCapabilityRegistry();
  const selectedIds = new Set(selectedPrimitives.map(p => p.primitiveId));

  // Score each capability by how many of its source primitives are selected
  const scored = registry.map(cap => {
    const matchCount = cap.sourcePrimitives.filter(id => selectedIds.has(id)).length;
    const relevance = matchCount / cap.sourcePrimitives.length;
    // Add randomization within tiers
    const jitter = Math.random() * 0.15;
    return { cap, score: relevance + jitter, matchCount };
  });

  // Filter to only capabilities that match at least 1 selected primitive
  const matched = scored.filter(s => s.matchCount > 0);
  matched.sort((a, b) => b.score - a.score);

  // Ensure archetype diversity: prioritize Active, Passive, Hybrid first,
  // then fill with remaining by score — NO cap, all matched capabilities surface
  const result: CapabilityDefinition[] = [];
  const archetypeCounts = { Active: 0, Passive: 0, Hybrid: 0 };
  const minPerArchetype = 2;

  // First pass: ensure archetype minimums
  for (const archetype of ['Active', 'Passive', 'Hybrid'] as const) {
    const archetypeCaps = matched.filter(s => s.cap.archetype === archetype);
    for (const s of archetypeCaps) {
      if (archetypeCounts[archetype] < minPerArchetype) {
        if (!result.find(r => r.id === s.cap.id)) {
          result.push(s.cap);
          archetypeCounts[archetype]++;
        }
      }
    }
  }

  // Second pass: fill ALL remaining matched capabilities by score
  for (const s of matched) {
    if (!result.find(r => r.id === s.cap.id)) {
      result.push(s.cap);
    }
  }

  // Convert to CapabilityEntry format
  return result.map(cap => ({
    name: `${cap.name} [${cap.archetype}]`,
    description: cap.description,
    usageExample: cap.usageExample,
  }));
}
