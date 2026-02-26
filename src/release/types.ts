/**
 * Release Gate Types — SPARTA Epoch
 * Shared types for the 10-pass release gate framework
 */

export type PassStatus = 'PASS' | 'FAIL' | 'SKIP';

export interface PassResult {
  pass: number;
  name: string;
  status: PassStatus;
  required: boolean;
  durationMs: number;
  notes: string[];
  artifacts: string[];
  details?: Record<string, unknown>;
}

export interface ReleaseReport {
  version: string;
  timestamp: string;
  gitSha: string;
  gitBranch: string;
  environment: string;
  passes: PassResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    allRequiredPassed: boolean;
    totalDurationMs: number;
  };
  metadata: {
    nodeVersion: string;
    platform: string;
    ci: boolean;
  };
}

export interface PassRunner {
  pass: number;
  name: string;
  required: boolean;
  gateEnvVar?: string;
  run: () => Promise<PassResult>;
}

export interface PerfBaseline {
  createdAt: string;
  thresholds: Record<string, number>;
}
