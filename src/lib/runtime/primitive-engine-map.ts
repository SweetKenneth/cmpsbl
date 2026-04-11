export type BehaviorEngine =
  | 'interception'
  | 'state'
  | 'execution'
  | 'analysis'
  | 'orchestration'
  | 'observability'
  | 'generic';

export const PRIMITIVE_ENGINE_MAP: Record<string, BehaviorEngine> = {
  DEFENSE: 'interception',
  GOVERNANCE: 'interception',
  IMMUNITY: 'interception',
  CONSCIENCE: 'interception',

  MEMORY: 'state',

  BEACON: 'observability',
  AUDIT: 'observability',

  FAILSAFE: 'execution',

  ORACLE: 'analysis',
  SENTINEL: 'analysis',

  CORTEX: 'orchestration',
};

export function getEngineForPrimitive(name: string): BehaviorEngine {
  return PRIMITIVE_ENGINE_MAP[name] ?? 'generic';
}
