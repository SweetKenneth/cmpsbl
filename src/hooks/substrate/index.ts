/**
 * Substrate Node Hooks — Barrel Export
 * 40-Node / 12-Sector Architecture Hooks
 *
 * Sectors: CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell
 */

// Kernel Layer
export { useCore, type UseCoreReturn } from './useCore';
export { useRipple, type UseRippleReturn } from './useRipple';
export { useAccess, type UseAccessReturn } from './useAccess';

// Cognitive Layer (CCR)
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
// MODERNIZER deprecated alias removed — useEvolution is at line 65 (CSZ)

// Orchestrator Layer
export { useCortex, type UseCortexReturn } from './useCortex';
export { useEncode, type UseEncodeReturn } from './useEncode';
export { useEncodeOrchestration, type UseEncodeOrchestrationReturn } from './useEncodeOrchestration';

// OCG — Operational Compliance Grid (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE)
export { useMemoryModule, type UseMemoryModuleReturn } from './useMemoryModule';
export { useRelay, type UseRelayReturn } from './useRelay';
export { useAuditModule, type UseAuditModuleReturn } from './useAuditModule';
export { useIdentity, type UseIdentityReturn } from './useIdentity';
export { useEconomy, type UseEconomyReturn } from './useEconomy';
export { useSandbox, type UseSandboxReturn } from './useSandbox';
export { useNerve, type UseNerveReturn } from './useNerve';

// ═══════════════════════════════════════════════════════════════════
// EXPANSION NODES (40-Node Architecture)
// ═══════════════════════════════════════════════════════════════════

// ESZ — Expansion Sovereignty Zone
export { useSovereign, type UseSovereignReturn } from './useSovereign';
export { useConscience, type UseConscienceReturn } from './useConscience';
export { useTreaty, type UseTreatyReturn } from './useTreaty';
export { useOracle, type UseOracleReturn } from './useOracle';

// EPZ — Expansion Perception Zone
export { useCompass, type UseCompassReturn } from './useCompass';
export { useEcho, type UseEchoReturn } from './useEcho';
export { useReflex, type UseReflexReturn } from './useReflex';

// EMZ — Expansion Manufacturing Zone (FORGE, LINGUA, HARVEST)
export { useForge, type UseForgeReturn } from './useForge';
export { useLingua, type UseLinguaReturn } from './useLingua';
export { useHarvest, type UseHarvestReturn } from './useHarvest';

// CSZ — Covert Systems Zone (EVOLUTION, SHADOW, PHANTOM)
export { useEvolution, type UseEvolutionReturn } from './useEvolution';
export { usePhantom, type UsePhantomReturn } from './usePhantom';
export { useShadow, type UseShadowReturn } from './useShadow';

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

// Nodes 39-40 — Plane additions (Engine & Governance Authority)
export { useEngineer, type UseEngineerReturn } from './useEngineer';
export { useAtlas, type UseAtlasReturn } from './useAtlas';

// Field-level Specialist Hooks
export { useNodeDreaming } from './useNodeDreaming';
export { useCognitiveCapabilities } from './useCognitiveCapabilities';
