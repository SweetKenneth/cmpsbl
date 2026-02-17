/**
 * Substrate Module Hooks - Barrel Export
 * v10.5.4 ARCHITECT Epoch — Dedicated React hooks for all 21 substrate modules + SEBA
 * 
 * Unified caching, loading/error states, and automatic cache invalidation
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

// Infrastructure Layer (v9.1.0 — 21-Module Epoch)
export { useMemoryModule, type UseMemoryModuleReturn } from './useMemoryModule';
export { useRelay, type UseRelayReturn } from './useRelay';
export { useAuditModule, type UseAuditModuleReturn } from './useAuditModule';
export { useIdentity, type UseIdentityReturn } from './useIdentity';
export { useEconomy, type UseEconomyReturn } from './useEconomy';
export { useSandbox, type UseSandboxReturn } from './useSandbox';

// Self-Evolving Agent
export { useSEBAHook as useSEBA, type UseSEBAHookReturn } from './useSEBA';

// Re-export existing specialized hooks from lib/substrate
export { useSEBA as useSEBALegacy, type UseSEBAReturn } from '@/lib/substrate/seba/useSEBA';
export { useCLM, type UseCLMReturn } from '@/lib/substrate/clm/useCLM';
export { useModuleCLM, type UseModuleCLMReturn } from '@/lib/substrate/module-clm/useModuleCLM';
export { useCapabilities, type UseCapabilitiesReturn } from '@/lib/substrate/capabilities/useCapabilities';
export { useArchivedCapabilities, type UseArchivedCapabilitiesReturn } from '@/lib/substrate/capabilities/useArchivedCapabilities';
export { useSupportBot, type UseSupportBotReturn } from '@/lib/substrate/support-bot/useSupportBot';
export { useDecodePersonality, type UseDecodePersonalityReturn } from '@/lib/substrate/decode/useDecodePersonality';
