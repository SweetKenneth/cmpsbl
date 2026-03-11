/**
 * RIPPLE — S-Tier Primitives
 * Causal event propagation, temporal ripple analysis
 */

// causal-event-propagation has getStats/clearRules collisions
export {
  addRule,
  clearRules as clearCausalRules,
  propagate,
  getChain,
  getStats as getCausalStats,
  type CausalRule,
  type CausalEvent,
  type PropagationChain,
} from '@/crownjewels/s-tier/034-causal-event-propagation';
export * from '@/crownjewels/s-tier/186-temporal-ripple-analyzer';
