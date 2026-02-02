/**
 * Substrate Module Hooks - Barrel Export
 * v7.0.0 — Dedicated React hooks for all 14 substrate modules + SEBA
 */

// Kernel Layer
export { useCore, type UseCoreReturn } from './useCore';
export { useRipple, type UseRippleReturn } from './useRipple';
export { useAccess, type UseAccessReturn } from './useAccess';

// Cognitive Layer
export { useBrain, type UseBrainReturn } from './useBrain';
export { useDream, type UseDreamReturn } from './useDream';
export { useNexus, type UseNexusReturn } from './useNexus';
export { useDecode, type UseDecodeReturn } from './useDecode';

// Operational Layer
export { useDefense, type UseDefenseReturn } from './useDefense';
export { useVision, type UseVisionReturn } from './useVision';
export { useIntegration, type UseIntegrationReturn } from './useIntegration';

// Administrative Layer
export { useSystem, type UseSystemReturn } from './useSystem';
export { useInclusive, type UseInclusiveReturn } from './useInclusive';
export { useModernizer, type UseModernizerReturn } from './useModernizer';

// Orchestrator Layer
export { useCortex, type UseCortexReturn } from './useCortex';

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
