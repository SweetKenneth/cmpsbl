/**
 * INCLUSIVE Module — Human Compatibility Pipeline
 * v10.5.4 ARCHITECT — Substrate Module
 *
 * @origin(cmptbl) — Migrated from archived CMPTBL utilities
 * Developed by PromptFluid® as part of the CMPSBL cognitive orchestration substrate.
 * 
 * Provides accessibility scanning, repair, validation, profiling, and reporting
 * for WCAG 2.2 compliance. Integrates with:
 * - SYSTEM: Audit aggregation, health surfaces
 * - VISION: Metrics, observability, health snapshots
 * - DEFENSE: Severity escalation to risk pipeline
 * - MODERNIZER: Regression-triggered proposals
 * - TEMPLATES: Compliance gate (scan→repair→validate→approve)
 * - MARKETPLACE: Publish blocking on critical violations
 * - ACCESS: Role-based capability gating
 */

export * from './scan';
export * from './repair';
export * from './validate';
export * from './profile';
export * from './report';
export * from './types';
export * from './glue';
 
 // Compliance automation
 export * from './complianceAutomation';
 
 // Adaptive interface
 export * from './adaptiveInterface';
