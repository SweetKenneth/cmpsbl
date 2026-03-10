/**
 * INCLUSIVE Module — Human Compatibility Pipeline
 * Substrate Module
 *
 * @origin(cmptbl) — Migrated from archived CMPTBL utilities
 * @origin(ptchbl) — Enhanced with PTCHBL WCAG Scanner assets
 * Developed by CMPSBL® as part of the cognitive orchestration substrate.
 * 
 * Provides accessibility scanning, repair, validation, profiling, reporting,
 * contrast analysis, ARIA/link/form/keyboard/media/structure/image validation,
 * drift detection, and runtime accessibility engine.
 * 
 * Integrates with:
 * - SYSTEM: Audit aggregation, health surfaces
 * - VISION: Metrics, observability, health snapshots
 * - DEFENSE: Severity escalation to risk pipeline
 * - EVOLUTION: Regression-triggered proposals
 * - TEMPLATES: Compliance gate (scan→repair→validate→approve)
 * - MARKETPLACE: Publish blocking on critical violations
 * - ACCESS: Role-based capability gating
 */

// Core pipeline
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

// @origin(ptchbl) — WCAG Registry with principle/guideline taxonomy
export * from './wcag-registry';

// @origin(ptchbl) — Contrast engine with luminance, ratio, suggestions
export * from './contrast-engine';

// @origin(ptchbl) — Unified validator suite (ARIA, links, forms, keyboard, media, structure, images)
export * from './validators';

// @origin(ptchbl) — Drift detection via content hashing
export * from './drift-detector';

// @origin(ptchbl) — Runtime accessibility engine (font, contrast, reading guide, dyslexia)
export * from './accessibility-engine';
