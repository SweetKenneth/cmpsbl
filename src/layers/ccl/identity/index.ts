/**
 * CCL Identity Subsystem
 * Session management, actor resolution, trust scoring, cross-agency portability
 * Formerly the IDENTITY module — now part of Clockless Cognitive Lucidity
 */

export { resolveIdentityAction, isIdentityAction, handleIdentityProxy, IDENTITY_MERGED, IDENTITY_TARGET_MODULE } from '@/lib/substrate/identity-access-merge';

// Re-export identity module primitives for backward compat
export * from '@/lib/substrate/identity-module';
