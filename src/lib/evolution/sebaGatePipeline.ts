/**
 * SEBA Gate Pipeline — EVOLUTION v9.0.0
 * 7-gate promotion pipeline with blocking semantics.
 * Lint → Test → Security → Blast Radius → Evidence → Governance → Prod
 */

import type { EvidenceBundle } from './evidence';
import { validateEvidenceBundle } from './evidence';

// --- Types ---

export type GateId = 'LINT' | 'TEST' | 'SECURITY' | 'BLAST_RADIUS' | 'EVIDENCE' | 'GOVERNANCE' | 'PROD';

export interface GateResult {
  gate: GateId;
  passed: boolean;
  blocking: boolean;
  findings: string[];
  timestamp: number;
  durationMs: number;
}

export interface PipelineResult {
  proposalId: string;
  gates: GateResult[];
  allPassed: boolean;
  failedAt?: GateId;
  totalDurationMs: number;
  timestamp: number;
}

export interface GateInputs {
  proposalId: string;
  lintClean: boolean;
  lintErrors: number;
  testsPassed: number;
  testsFailed: number;
  testCoverage: number;
  securityScanPassed: boolean;
  vulnerabilities: number;
  blastRadius: number; // 0-1
  maxAllowedBlastRadius: number;
  evidence: EvidenceBundle;
  governanceMode: 'ACTIVE' | 'OBSERVE' | 'LOCKDOWN' | 'EVOLVE';
  governorApproval: boolean;
}

// --- Constants ---

const GATE_ORDER: GateId[] = ['LINT', 'TEST', 'SECURITY', 'BLAST_RADIUS', 'EVIDENCE', 'GOVERNANCE', 'PROD'];
const MAX_RESULTS = 200;

// --- State ---

const results: PipelineResult[] = [];

// --- Gate Evaluators ---

function evaluateLint(inputs: GateInputs): GateResult {
  const start = Date.now();
  return {
    gate: 'LINT',
    passed: inputs.lintClean && inputs.lintErrors === 0,
    blocking: true,
    findings: inputs.lintErrors > 0 ? [`${inputs.lintErrors} lint error(s)`] : [],
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

function evaluateTest(inputs: GateInputs): GateResult {
  const start = Date.now();
  const findings: string[] = [];
  if (inputs.testsFailed > 0) findings.push(`${inputs.testsFailed} test(s) failing`);
  if (inputs.testCoverage < 0.6) findings.push(`Coverage ${(inputs.testCoverage * 100).toFixed(0)}% below 60% threshold`);

  return {
    gate: 'TEST',
    passed: inputs.testsFailed === 0 && inputs.testCoverage >= 0.6,
    blocking: true,
    findings,
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

function evaluateSecurity(inputs: GateInputs): GateResult {
  const start = Date.now();
  return {
    gate: 'SECURITY',
    passed: inputs.securityScanPassed && inputs.vulnerabilities === 0,
    blocking: true,
    findings: inputs.vulnerabilities > 0 ? [`${inputs.vulnerabilities} vulnerability(ies) found`] : [],
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

function evaluateBlastRadius(inputs: GateInputs): GateResult {
  const start = Date.now();
  const passed = inputs.blastRadius <= inputs.maxAllowedBlastRadius;
  return {
    gate: 'BLAST_RADIUS',
    passed,
    blocking: true,
    findings: passed ? [] : [`Blast radius ${(inputs.blastRadius * 100).toFixed(0)}% exceeds max ${(inputs.maxAllowedBlastRadius * 100).toFixed(0)}%`],
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

function evaluateEvidence(inputs: GateInputs): GateResult {
  const start = Date.now();
  const validation = validateEvidenceBundle(inputs.evidence);
  return {
    gate: 'EVIDENCE',
    passed: validation.valid,
    blocking: true,
    findings: validation.errors,
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

function evaluateGovernance(inputs: GateInputs): GateResult {
  const start = Date.now();
  const findings: string[] = [];
  let passed = true;

  if (inputs.governanceMode === 'LOCKDOWN') {
    passed = false;
    findings.push('System in LOCKDOWN — mutations blocked');
  } else if (inputs.governanceMode === 'OBSERVE') {
    passed = false;
    findings.push('System in OBSERVE — mutations paused');
  }

  if (!inputs.governorApproval && inputs.governanceMode !== 'EVOLVE') {
    passed = false;
    findings.push('Governor approval required');
  }

  return {
    gate: 'GOVERNANCE',
    passed,
    blocking: true,
    findings,
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

function evaluateProd(_inputs: GateInputs): GateResult {
  const start = Date.now();
  // Final gate — all prior gates must have passed
  return {
    gate: 'PROD',
    passed: true,
    blocking: false,
    findings: [],
    timestamp: Date.now(),
    durationMs: Date.now() - start,
  };
}

const EVALUATORS: Record<GateId, (inputs: GateInputs) => GateResult> = {
  LINT: evaluateLint,
  TEST: evaluateTest,
  SECURITY: evaluateSecurity,
  BLAST_RADIUS: evaluateBlastRadius,
  EVIDENCE: evaluateEvidence,
  GOVERNANCE: evaluateGovernance,
  PROD: evaluateProd,
};

// --- Core ---

export function runPipeline(inputs: GateInputs): PipelineResult {
  const start = Date.now();
  const gates: GateResult[] = [];
  let failedAt: GateId | undefined;

  for (const gateId of GATE_ORDER) {
    const result = EVALUATORS[gateId](inputs);
    gates.push(result);

    if (!result.passed && result.blocking) {
      failedAt = gateId;
      break;
    }
  }

  const pipelineResult: PipelineResult = {
    proposalId: inputs.proposalId,
    gates,
    allPassed: !failedAt,
    failedAt,
    totalDurationMs: Date.now() - start,
    timestamp: Date.now(),
  };

  results.push(pipelineResult);
  if (results.length > MAX_RESULTS) results.splice(0, results.length - MAX_RESULTS);

  return pipelineResult;
}

export function getGateOrder(): GateId[] {
  return [...GATE_ORDER];
}

export function getPipelineResults(count: number = 50): PipelineResult[] {
  return results.slice(-count);
}

export function getPassRate(): number {
  if (results.length === 0) return 0;
  const passed = results.filter(r => r.allPassed).length;
  return Math.round((passed / results.length) * 100) / 100;
}

export function clearPipelineState(): void {
  results.length = 0;
}
