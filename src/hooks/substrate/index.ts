/**
 * Substrate Module Hooks — Barrel Export
 * 10-Entity + 5-Mesh + 9-Zone + 11-Expansion Architecture Hooks
 *
 * CORE (standalone kernel)
 * CCR zones: SYSTEM, BRAIN, MEMORY, DREAM (hooks exported for backcompat)
 * CCL zones: RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT (hooks exported as facades)
 * MODERNIZER → routed to EVOLUTION mesh (hook exported for backcompat)
 * EXPANSION: SOVEREIGN, ORACLE, CONSCIENCE, PHANTOM, FORGE, LINGUA, COMPASS, ECHO, TREATY, HARVEST, REFLEX
 */

// Kernel Layer
export { useCore, type UseCoreReturn } from './useCore';
export { useRipple, type UseRippleReturn } from './useRipple';
export { useAccess, type UseAccessReturn } from './useAccess';

// Cognitive Layer
export { useBrain, type UseBrainReturn } from './useBrain';
export { useDecode, type UseDecodeReturn } from './useDecode';

// Operational Layer
export { useDefense, type UseDefenseReturn } from './useDefense';
export { useNexus, type UseNexusReturn } from './useNexus';
export { useVision, type UseVisionReturn } from './useVision';
export { useDream, type UseDreamReturn } from './useDream';
export { useIntegration, type UseIntegrationReturn } from './useIntegration';

// Administrative Layer
export { useSystem, type UseSystemReturn } from './useSystem';
export { useInclusive, type UseInclusiveReturn } from './useInclusive';
export { useModernizer, type UseModernizerReturn } from './useModernizer';

// Orchestrator Layer
export { useCortex, type UseCortexReturn } from './useCortex';
export { useEncode, type UseEncodeReturn } from './useEncode';
export { useEncodeOrchestration, type UseEncodeOrchestrationReturn } from './useEncodeOrchestration';

// Infrastructure Layer (Zones)
export { useMemoryModule, type UseMemoryModuleReturn } from './useMemoryModule';
export { useRelay, type UseRelayReturn } from './useRelay';
export { useAuditModule, type UseAuditModuleReturn } from './useAuditModule';
export { useIdentity, type UseIdentityReturn } from './useIdentity';
export { useEconomy, type UseEconomyReturn } from './useEconomy';
export { useSandbox, type UseSandboxReturn } from './useSandbox';

// ═══════════════════════════════════════════════════════════════════
// EXPANSION MODULES (37-Node Architecture)
// ═══════════════════════════════════════════════════════════════════

// Compliance & Governance
export { useSovereign, type UseSovereignReturn } from './useSovereign';
export { useConscience, type UseConscienceReturn } from './useConscience';
export { useTreaty, type UseTreatyReturn } from './useTreaty';

// Predictive & Simulation
export { useOracle, type UseOracleReturn } from './useOracle';
export { useCompass, type UseCompassReturn } from './useCompass';
export { useEcho, type UseEchoReturn } from './useEcho';

// Privacy & Data
export { usePhantom, type UsePhantomReturn } from './usePhantom';
export { useHarvest, type UseHarvestReturn } from './useHarvest';

// Manufacturing & Translation
export { useForge, type UseForgeReturn } from './useForge';
export { useLingua, type UseLinguaReturn } from './useLingua';

// Edge Computing
export { useReflex, type UseReflexReturn } from './useReflex';

// Self-Evolving Agent
export { useSEBAHook as useSEBA, type UseSEBAHookReturn } from './useSEBA';

// Verification
export { useTSAC, type UseTSACReturn } from './useTSAC';

// Re-export existing specialized hooks from lib/substrate
export { useSEBA as useSEBALegacy, type UseSEBAReturn } from '@/lib/substrate/seba/useSEBA';
export { useCLM, type UseCLMReturn } from '@/lib/substrate/clm/useCLM';
export { useModuleCLM, type UseModuleCLMReturn } from '@/lib/substrate/module-clm/useModuleCLM';
export { useCapabilities, type UseCapabilitiesReturn } from '@/lib/substrate/capabilities/useCapabilities';
export { useArchivedCapabilities, type UseArchivedCapabilitiesReturn } from '@/lib/substrate/capabilities/useArchivedCapabilities';
export { useSupportBot, type UseSupportBotReturn } from '@/lib/substrate/support-bot/useSupportBot';
export { useDecodePersonality, type UseDecodePersonalityReturn } from '@/lib/substrate/decode/useDecodePersonality';

// Matrix Resilience (10 resilience engines)
export { useMatrixResilience, type UseMatrixResilienceReturn } from './useMatrixResilience';
