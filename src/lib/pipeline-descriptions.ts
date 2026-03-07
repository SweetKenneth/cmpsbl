/**
 * Pipeline Description Utility
 * Maps module chains to human-readable functional descriptions.
 * Used across all pipeline/discovery card renderers site-wide.
 */

/** Generate a human-readable description of what a pipeline does based on its module chain */
export function getFunctionalDescription(name: string, modules: string[]): string {
  const moduleSet = new Set(modules.map(m => m.toUpperCase()));

  if (moduleSet.has('EVOLUTION') && moduleSet.has('VISION'))
    return 'Explores solution spaces and adapts strategies using visual pattern recognition.';
  if (moduleSet.has('BRAIN') && moduleSet.has('CORTEX') && moduleSet.has('DREAM'))
    return 'Combines reasoning, pattern analysis, and speculative simulation for deep inference.';
  if (moduleSet.has('DEFENSE') && moduleSet.has('GOVERNANCE'))
    return 'Enforces security constraints and policy compliance across system operations.';
  if (moduleSet.has('MEMORY') && moduleSet.has('NEXUS'))
    return 'Routes and stores persistent signals across the substrate network.';
  if (moduleSet.has('RIPPLE') && moduleSet.has('SYSTEM'))
    return 'Propagates state changes through interconnected system components.';
  if (moduleSet.has('CORTEX') && moduleSet.has('EVOLUTION'))
    return 'Applies pattern recognition to guide evolutionary optimization.';
  if (moduleSet.has('BRAIN') && moduleSet.has('GOVERNANCE'))
    return 'Coordinates intelligent decision-making with governance oversight.';
  if (moduleSet.has('BRAIN') && moduleSet.has('CORTEX'))
    return 'Combines reasoning and pattern analysis for intelligent processing.';
  if (moduleSet.has('DREAM') && moduleSet.has('EVOLUTION'))
    return 'Uses speculative simulation to explore and evolve system configurations.';
  if (moduleSet.has('DREAM'))
    return 'Uses speculative simulation to explore hypothetical system configurations.';
  if (moduleSet.has('VISION'))
    return 'Analyzes structural patterns across data and system state.';
  if (moduleSet.has('EVOLUTION'))
    return 'Applies adaptive optimization to discover improved configurations.';
  if (moduleSet.has('DEFENSE'))
    return 'Monitors and enforces security boundaries across system operations.';
  if (moduleSet.has('GOVERNANCE'))
    return 'Enforces policy compliance and operational constraints.';
  if (moduleSet.has('MEMORY'))
    return 'Manages persistent state and signal retention across the substrate.';
  if (moduleSet.has('CORTEX'))
    return 'Performs deep pattern analysis on system behavior and data.';
  if (moduleSet.has('BRAIN'))
    return 'Applies reasoning and decision-making to system operations.';
  if (moduleSet.has('NEXUS'))
    return 'Routes signals and coordinates communication between systems.';
  if (moduleSet.has('RIPPLE'))
    return 'Propagates changes and events across interconnected components.';
  if (moduleSet.has('SYSTEM'))
    return 'Manages core system orchestration and lifecycle operations.';

  // Fallback
  return `Autonomous pipeline combining ${modules.length} substrate system${modules.length !== 1 ? 's' : ''} into a unified capability.`;
}
