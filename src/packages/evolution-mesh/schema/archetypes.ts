/**
 * Evolution Mesh — Input Archetypes
 * Clusters malformed inputs into categories for targeted repair.
 */

export type InputArchetype =
  | 'well_formed'       // passes schema
  | 'empty_shell'       // {} or all nulls
  | 'type_mismatch'     // right keys, wrong types
  | 'missing_required'  // missing critical fields
  | 'oversized'         // values too large
  | 'injection_attempt' // XSS/SQL patterns detected
  | 'shape_alien'       // no recognized keys at all
  | 'partial_valid';    // some fields valid, some not

/**
 * Archetypes that are worth attempting repair on.
 * Garbage inputs (empty_shell, shape_alien, injection_attempt, oversized)
 * should safe-fail immediately.
 */
export const REPAIRABLE_ARCHETYPES: Set<InputArchetype> = new Set([
  'type_mismatch',
  'missing_required',
]);

export function isRepairable(archetype: InputArchetype): boolean {
  return REPAIRABLE_ARCHETYPES.has(archetype);
}
