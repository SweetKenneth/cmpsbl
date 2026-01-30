/**
 * AutoBlog Policy Gates
 * Simple, explicit governance checks
 */

import type { AutoblogSettings, AutoblogGateResult } from './types';
import { checkAutoblogCircuit } from './circuit';
import { countPostsToday } from './store';

export type AutoblogAction = 'plan' | 'draft' | 'verify' | 'publish';

/**
 * Guard an AutoBlog action
 */
export async function guardAutoblogAction(
  action: AutoblogAction,
  settings: AutoblogSettings | null
): Promise<AutoblogGateResult> {
  // Settings must exist
  if (!settings) {
    return { allowed: false, reason: 'AutoBlog settings not configured' };
  }

  // Must be enabled
  if (!settings.enabled) {
    return { allowed: false, reason: 'AutoBlog is disabled' };
  }

  // Must not be in off mode
  if (settings.mode === 'off') {
    return { allowed: false, reason: 'AutoBlog mode is off' };
  }

  // Check circuit breaker
  const circuit = await checkAutoblogCircuit();
  if (!circuit.canProceed) {
    return { allowed: false, reason: `Circuit ${circuit.state}: ${circuit.reason}` };
  }

  // Publish requires dry_run to be false
  if (action === 'publish' && settings.dry_run) {
    return { allowed: false, reason: 'Dry-run enabled (publish blocked)' };
  }

  // Check daily post limit
  if (action === 'plan' || action === 'publish') {
    const postsToday = await countPostsToday();
    if (postsToday >= settings.max_posts_per_day) {
      return { allowed: false, reason: `Daily limit reached (${postsToday}/${settings.max_posts_per_day})` };
    }
  }

  // Shadow mode only allows plan and draft
  if (settings.mode === 'shadow' && (action === 'verify' || action === 'publish')) {
    return { allowed: false, reason: 'Shadow mode: only planning and drafting allowed' };
  }

  return { allowed: true };
}

/**
 * Check if user has required role for action
 */
export function getRequiredRole(action: AutoblogAction): 'observer' | 'operator' | 'governor' {
  switch (action) {
    case 'publish':
      return 'governor';
    case 'plan':
    case 'draft':
    case 'verify':
      return 'operator';
    default:
      return 'observer';
  }
}
