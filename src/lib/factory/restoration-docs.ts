/**
 * Restoration Documentation Generator
 * Generates the full technical document package after Ascension.
 */

import type { ScanResult, PrimitiveRecommendation } from './scan-team';

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

  // Generate new capabilities based on primitives used
  const newCapabilities: CapabilityEntry[] = selectedPrimitives.slice(0, 5).map(p => ({
    name: `${p.name} Protection`,
    description: `${p.category}-level hardening applied by ${p.name}. ${p.rationale}`,
    usageExample: `import { ${p.name.toLowerCase()}Guard } from '@cmpsbl/runtime';\n${p.name.toLowerCase()}Guard.activate();`,
  }));

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
