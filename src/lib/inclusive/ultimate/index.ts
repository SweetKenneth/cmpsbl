/**
 * INCLUSIVE Ultimate — "Clarity Prime" v9.0.0
 * 
 * The substrate's Human Compatibility Engine — WCAG scanning, intelligent repair,
 * contrast intelligence, ARIA validation, keyboard auditing, regression guarding,
 * adaptive interfaces, inclusive testing, compliance reporting, and learning telemetry.
 * 
 * @module inclusive/ultimate
 * @version 9.0.0 — Clarity Prime
 */

// System 1: Deep WCAG 2.2 Scanner Engine
export {
  deepScan, getAllCriteria, getCriteriaByLevel, getScanHistory,
  getScannerHealth, resetScanner,
  type DeepScanResult, type WcagCriterion, type CriterionResult, type CriterionViolation,
} from './deepWcagScanner';

// System 2: Intelligent Auto-Repair Pipeline
export {
  executeRepair, batchRepair, getRepairProfiles,
  getRepairHealth, resetRepairPipeline,
  type RepairAttempt, type RepairStep, type RepairProfile, type RepairStrategy,
} from './intelligentRepairPipeline';

// System 3: Contrast Intelligence Engine
export {
  relativeLuminance, contrastRatio, evaluateContrast, suggestFix, auditPalette,
  getContrastHealth, resetContrastEngine,
  type ContrastPair, type PaletteSuggestion, type ContrastAudit,
} from './contrastIntelligence';

// System 4: ARIA Compliance Validator
export {
  validateAria, getAriaHealth, resetAriaValidator,
  type AriaViolation, type AriaValidationResult, type AriaViolationType,
} from './ariaComplianceValidator';

// System 5: Keyboard Navigation Auditor
export {
  auditKeyboardNav, getKeyboardHealth, resetKeyboardAuditor,
  type FocusableElement, type NavigationIssue, type NavigationGraph, type KeyboardAuditResult,
} from './keyboardNavigationAuditor';

// System 6: Accessibility Regression Guardian
export {
  captureSnapshot, getTrend, getRegressions,
  getGuardianHealth, resetGuardian,
  type ScanSnapshot, type RegressionEvent, type RegressionTrend,
} from './regressionGuardian';

// System 7: Adaptive Interface Engine
export {
  setProfile, getAdaptationSet, getProfile,
  getAdaptiveHealth, resetAdaptiveEngine,
  type UserAccessibilityProfile, type Adaptation, type AdaptationSet,
} from './adaptiveInterfaceEngine';

// System 8: Inclusive Testing Orchestrator
export {
  runScenario, runModeTests, generateCoverageReport,
  getTestOrchestratorHealth, resetTestOrchestrator,
  type TestScenario, type TestResult, type CoverageReport, type InteractionMode,
} from './inclusiveTestOrchestrator';

// System 9: Compliance Report Generator
export {
  generateComplianceReport, reportToMarkdown,
  getReportHealth, resetReportGenerator,
  type ComplianceReport, type VpatEntry, type RemediationItem,
} from './complianceReportGenerator';

// System 10: Accessibility Telemetry & Learning Loop
export {
  beginCycle, recordCyclePhase, recordFixOutcome, getBestStrategy,
  generateLearningSnapshot, getAccessibilityTelemetryHealth, resetAccessibilityTelemetry,
  type CompleteCycle, type FixPattern, type LearningSnapshot,
} from './accessibilityTelemetry';

// ── Unified Health ─────────────────────────────────────────────

import { getScannerHealth } from './deepWcagScanner';
import { getRepairHealth } from './intelligentRepairPipeline';
import { getContrastHealth } from './contrastIntelligence';
import { getAriaHealth } from './ariaComplianceValidator';
import { getKeyboardHealth } from './keyboardNavigationAuditor';
import { getGuardianHealth } from './regressionGuardian';
import { getAdaptiveHealth } from './adaptiveInterfaceEngine';
import { getTestOrchestratorHealth } from './inclusiveTestOrchestrator';
import { getReportHealth } from './complianceReportGenerator';
import { getAccessibilityTelemetryHealth } from './accessibilityTelemetry';

export interface InclusiveUltimateHealth {
  version: '9.0.0';
  codename: 'Clarity Prime';
  systems: {
    scanner: ReturnType<typeof getScannerHealth>;
    repair: ReturnType<typeof getRepairHealth>;
    contrast: ReturnType<typeof getContrastHealth>;
    aria: ReturnType<typeof getAriaHealth>;
    keyboard: ReturnType<typeof getKeyboardHealth>;
    guardian: ReturnType<typeof getGuardianHealth>;
    adaptive: ReturnType<typeof getAdaptiveHealth>;
    testing: ReturnType<typeof getTestOrchestratorHealth>;
    reporting: ReturnType<typeof getReportHealth>;
    telemetry: ReturnType<typeof getAccessibilityTelemetryHealth>;
  };
  overallHealth: number;
}

/** Unified health across all 10 INCLUSIVE systems */
export function getInclusiveUltimateHealth(): InclusiveUltimateHealth {
  const scanner = getScannerHealth();
  const repair = getRepairHealth();
  const keyboard = getKeyboardHealth();
  const guardian = getGuardianHealth();
  const telemetry = getAccessibilityTelemetryHealth();

  // Composite: scanner avg (25%) + repair success (25%) + keyboard nav (25%) + telemetry (25%)
  const scannerScore = scanner.avgScore;
  const repairScore = repair.recentSuccessRate;
  const keyboardScore = keyboard.avgNavigabilityScore;
  const telemetryScore = telemetry.overallSuccessRate;

  const overallHealth = Math.round(
    (scannerScore * 0.25) + (repairScore * 0.25) + (keyboardScore * 0.25) + (telemetryScore * 0.25)
  );

  return {
    version: '9.0.0',
    codename: 'Clarity Prime',
    systems: {
      scanner,
      repair,
      contrast: getContrastHealth(),
      aria: getAriaHealth(),
      keyboard,
      guardian,
      adaptive: getAdaptiveHealth(),
      testing: getTestOrchestratorHealth(),
      reporting: getReportHealth(),
      telemetry,
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };
}
