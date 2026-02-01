/**
 * Capability System
 * v7.0.0 — Auto-Adapt Edge Function Ingestion
 * 
 * This module provides:
 * - Registry: Single source of truth for capabilities
 * - Adapter: Governed invocation wrapper
 * - Guards: Safety + governance layer
 * - Auto-loader: Drop-in capability scanning
 * - Confidence: Feedback + scoring
 * - Normalize: Output shaping
 */

export * from './types';
export * from './registry';
export * from './adapter';
export * from './guards';
export * from './normalize';
export * from './confidence';
export * from './auto-loader';

// Re-export key functions for convenience
export { invokeCapability, canInvoke, invokeBatch } from './adapter';
export { registerCapability, getCapability, listCapabilities, getManifest } from './registry';
export { runScanAdapt, auditEdgeFunction, adaptCapability } from './auto-loader';
