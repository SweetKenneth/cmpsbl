/**
 * OCG Integrity Subsystem
 * Read-only health check surface binding
 * Substrate Health Check continues verifying registry shape, route integrity,
 * pipeline crystallization, edge functions, and RLS behavior.
 * No mutation permitted.
 */

export { runSubstrateHealthCheck, quickStructuralCheck } from '@/lib/audit/substrate-health-check';
