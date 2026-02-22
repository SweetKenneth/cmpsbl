/**
 * Evolution Mesh SDK — Public API Surface
 * Framework-agnostic immune system for any JS/TS async function.
 * 
 * Usage:
 *   import { wrap, defineSchema } from '@cmpsbl/evolution-mesh';
 *   
 *   const safe = wrap(myHandler, {
 *     schema: defineSchema({
 *       email: { type: 'string', required: true },
 *       age: { type: 'number' },
 *     }),
 *   });
 */

// Core wrapper
export { wrap, type WrapConfig, type WrappedFunction } from './core/wrap';

// Schema & validation
export { defineSchema } from './schema/validator';
export type { FieldSchema, ExecutorSchema, ValidationReport, ValidationIssue } from './schema/types';
export type { InputArchetype } from './schema/archetypes';

// Repair engine (read-only stats)
export { getRepairStats } from './repair/deterministic';

// Learning (read-only)
export { getRules, getPerformanceStats } from './learning/rules';

// Shadow mode
export { shadow, type ShadowResult } from './shadow/probe';

// Telemetry
export { configure, type EvolutionMeshConfig } from './config';
export { getMetrics, type MeshMetrics } from './telemetry/tracker';
