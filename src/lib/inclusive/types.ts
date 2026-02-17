/**
 * INCLUSIVE Module Types
 * v10.5.4 ARCHITECT Epoch — Human Compatibility Pipeline
 * @origin(cmptbl) — Migrated from legacy CMPTBL utilities
 */

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type ScanDepth = 'quick' | 'standard' | 'deep';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface InclusiveIssue {
  id: string;
  type: string;
  wcag_criterion: string;
  severity: IssueSeverity;
  description: string;
  count?: number;
  element?: string;
  suggestion?: string;
  auto_fixable: boolean;
}

export interface InclusiveScanResult {
  target: string;
  issues: InclusiveIssue[];
  severity: IssueSeverity;
  repairs: InclusiveRepair[];
  score: number;
  metadata: {
    wcag_level: WCAGLevel;
    scan_depth: ScanDepth;
    scanned_at: string;
    duration_ms: number;
  };
}

export interface InclusiveRepair {
  issue_id: string;
  wcag_criterion: string;
  original: string;
  fixed: string;
  explanation: string;
  auto_applied: boolean;
}

export interface InclusiveProfile {
  context: string;
  user_preferences?: {
    high_contrast?: boolean;
    reduced_motion?: boolean;
    screen_reader?: boolean;
    font_scale?: number;
  };
  device_capabilities?: {
    has_touch?: boolean;
    has_keyboard?: boolean;
    has_pointer?: boolean;
  };
}

export interface InclusiveReport {
  target: string;
  summary: {
    total_issues: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  issues_by_wcag: Record<string, InclusiveIssue[]>;
  recommendations: string[];
  generated_at: string;
}

export interface InclusiveModuleStatus {
  active: boolean;
  version: string;
  global_score: number;
  total_violations: number;
  pending_repairs: number;
  regressions_24h: number;
  template_coverage: number;
  last_scan: string | null;
}
