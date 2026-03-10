/**
 * Capability Guards
 * Governance + Safety Layer
 */

import type { CapabilityGuardContext, GuardResult, CapabilityRisk } from './types';

// Blocked patterns for state mutation
const BLOCKED_PATTERNS = [
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /TRUNCATE/i,
  /ALTER\s+TABLE.*DROP/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
];

// Modules allowed to invoke capabilities
const ALLOWED_CALLER_MODULES = [
  'DECODE',
  'CORTEX',
  'EVOLUTION',
  'BRAIN',
  'SYSTEM',
  'VISION',
  'INCLUSIVE',
];

/**
 * Validate capability invocation against governance rules
 */
export function validateInvocation(context: CapabilityGuardContext): GuardResult {
  const { capability, caller, input } = context;
  
  // Hardening 10: Normalize caller to uppercase for case-insensitive matching
  const normalizedCaller = (caller || '').trim().toUpperCase();
  
  // Hardening 11: Reject empty or suspiciously long caller names
  if (!normalizedCaller || normalizedCaller.length > 64) {
    return {
      allowed: false,
      reason: 'Invalid caller identifier',
      riskLevel: 'high',
    };
  }
  
  // Check caller is allowed
  if (!ALLOWED_CALLER_MODULES.includes(normalizedCaller)) {
    return {
      allowed: false,
      reason: `Caller module '${caller}' is not authorized to invoke capabilities`,
      riskLevel: 'high',
    };
  }
  
  // Check capability is active
  if (capability.status !== 'active') {
    return {
      allowed: false,
      reason: `Capability '${capability.id}' is ${capability.status}`,
      riskLevel: 'medium',
    };
  }
  
  // Hardening 12: Input size guard — reject oversized payloads
  const inputStr = JSON.stringify(input);
  if (inputStr.length > 500_000) {
    return {
      allowed: false,
      reason: 'Input payload exceeds 500KB safety limit',
      riskLevel: 'high',
    };
  }
  
  // Check for blocked patterns in input
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(inputStr)) {
      return {
        allowed: false,
        reason: `Input contains blocked pattern: ${pattern.source}`,
        riskLevel: 'high',
      };
    }
  }
  
  // High-risk capabilities require additional scrutiny
  if (capability.risk === 'high') {
    // Check if caller is privileged for high-risk ops
    if (!['SYSTEM', 'CORTEX'].includes(normalizedCaller)) {
      return {
        allowed: false,
        reason: `High-risk capability '${capability.id}' requires SYSTEM or CORTEX caller`,
        riskLevel: 'high',
      };
    }
  }
  
  return {
    allowed: true,
    riskLevel: capability.risk,
  };
}

/**
 * Check if direct edge invocation is blocked
 */
export function isDirectInvocationBlocked(edgeFunctionName: string): boolean {
  // Block direct invocation of adapted capabilities
  // They must go through the adapter
  const adaptedPrefixes = [
    'pf-marketing-strategy',
    'pf-modernizer-export',
  ];
  
  return adaptedPrefixes.some(prefix => edgeFunctionName.startsWith(prefix));
}

/**
 * Assess risk level for an operation
 */
export function assessRisk(input: Record<string, unknown>): CapabilityRisk {
  const inputStr = JSON.stringify(input).toLowerCase();
  
  // High risk indicators
  if (
    inputStr.includes('delete') ||
    inputStr.includes('remove') ||
    inputStr.includes('destroy') ||
    inputStr.includes('admin')
  ) {
    return 'high';
  }
  
  // Medium risk indicators
  if (
    inputStr.includes('update') ||
    inputStr.includes('modify') ||
    inputStr.includes('write')
  ) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Log guard decision for audit trail
 */
export function logGuardDecision(
  context: CapabilityGuardContext,
  result: GuardResult
): void {
  console.log(`[CapabilityGuard] ${result.allowed ? '✓' : '✗'} ${context.capability.id}`, {
    caller: context.caller,
    risk: result.riskLevel,
    reason: result.reason,
  });
}
