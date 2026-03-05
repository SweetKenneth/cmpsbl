/**
 * Substrate Plans Module — Controlled Patch Orchestration
 * 
 * Provides the PLAN stage for DECODE and plan-gated execution for ENCODE.
 * All code generation requires an approved PatchPlan.
 */

export type { PatchPlan, PatchChange, PlanStatus } from './types';

export { generatePatchPlan, type IntentContext } from './generatePatchPlan';

export {
  verifyPlan,
  VALID_MODULES,
  SAFE_PATH_PREFIXES,
  BLOCKED_PATHS,
  type VerificationResult,
} from './verifyPlan';

export {
  storePlan,
  loadPlan,
  listPlans,
  approvePlan,
  rejectPlan,
  markPlanExecuted,
} from './planStore';
