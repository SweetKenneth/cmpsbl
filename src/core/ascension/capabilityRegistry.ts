/**
 * Ascension Capability Registry
 * All 5 capabilities from the api_gateway-20260328 export pack.
 * Pack fingerprint: FEDAC39F87A1
 */

import type { CapabilityMeta } from './capabilityEngine';

export const ASCENSION_CAPABILITIES: CapabilityMeta[] = [
  {
    id: 'ctp-004',
    name: 'Cognitive_Threat_Profiler_Plus_ENCODE_SOVEREIGN_EVOLUTION_IMMUNITY_FORGE',
    displayName: 'Cognitive Threat Profiler',
    cjpi: 97,
    tier: 'apex',
    chain: ['API_GATEWAY', 'ENCODE', 'SOVEREIGN', 'EVOLUTION', 'DEFENSE', 'BRAIN', 'IMMUNITY', 'FORGE'],
    fingerprint: '69162EC40ECB',
    moatSignature: 'bd0f75bd-1ddc-430a-a580-2a42918c8274',
    description: 'Profiles data through an 8-Primitive security chain. Detects XSS, prototype pollution, SQL injection, path traversal, and template injection patterns. Adds sovereign governance hashing, evolution fitness scoring, and immunity shielding.',
    protects: 'DEFENSE · IMMUNITY · ENCODE',
  },
  {
    id: 'gme-001',
    name: 'Generative_Mutation_Engine_Plus_SOVEREIGN_GOVERNANCE_INTENT_RELAY',
    displayName: 'Generative Mutation Engine',
    cjpi: 87,
    tier: 'mythic',
    chain: ['API_GATEWAY', 'SOVEREIGN', 'GOVERNANCE', 'INTENT', 'RELAY', 'EVOLUTION', 'DREAM'],
    fingerprint: 'FEDAC39F87A1',
    moatSignature: '29695ad9-e590-4c2c-ac57-eaed9592efe0',
    description: 'Governs mutation pipelines through sovereign policy checks, intent routing, and relay forwarding. Integrates evolution fitness tracking with dream-space exploration for generative discovery.',
    protects: 'EVOLUTION · GOVERNANCE · DREAM',
  },
  {
    id: 'ara-002',
    name: 'Accessibility_Reasoning_Advisor_Plus_SHADOW_SOVEREIGN_SYSTEM_ENGINEER',
    displayName: 'Accessibility Reasoning Advisor',
    cjpi: 92,
    tier: 'apex',
    chain: ['API_GATEWAY', 'SHADOW', 'SOVEREIGN', 'SYSTEM', 'INCLUSIVE', 'BRAIN', 'ENGINEER'],
    fingerprint: '851A629A8DAF',
    moatSignature: 'dc6f8ccf-d3fa-4684-94e8-25e4bb1ff79f',
    description: 'Scans data for accessibility compliance — alt text, ARIA labels, semantic HTML. Runs shadow verification, sovereign governance, system stability checks, and engineering quality gates.',
    protects: 'INCLUSIVE · SHADOW · SYSTEM',
  },
  {
    id: 'cen-003',
    name: 'Consensus_Event_Network_Plus_VISION_GOVERNANCE_ECHO_INTENT_CONSCIENCE',
    displayName: 'Consensus Event Network',
    cjpi: 87,
    tier: 'mythic',
    chain: ['API_GATEWAY', 'VISION', 'GOVERNANCE', 'ECHO', 'NERVE', 'RIPPLE', 'INTENT', 'CONSCIENCE'],
    fingerprint: 'B102B26FD2BE',
    moatSignature: 'a7c3e8f1-9d2b-4a76-b5e4-3f8c1d2a9b70',
    description: 'Builds consensus across the event mesh. Vision analysis feeds governance policy, echo replay captures state, nerve routes signals, ripple propagates cascading responses, and conscience applies ethical clearance.',
    protects: 'GOVERNANCE · NERVE · CONSCIENCE',
  },
  {
    id: 'zkr-005',
    name: 'Zero_Knowledge_Reasoner_Plus_IMMUNITY_TREATY_ENGINEER_ECHO_NEXUS',
    displayName: 'Zero Knowledge Reasoner',
    cjpi: 96,
    tier: 'apex',
    chain: ['API_GATEWAY', 'IMMUNITY', 'TREATY', 'PHANTOM', 'BRAIN', 'ENGINEER', 'ECHO', 'NEXUS'],
    fingerprint: 'AC97C7AD0669',
    moatSignature: 'f4a2c7e9-8b31-4d5a-a1c6-2e9f0d3b8a54',
    description: 'Privacy-preserving reasoning pipeline. Immunity shields errors, treaty enforces compliance, phantom anonymizes data through 3-hop proxy, brain analyzes complexity, and NEXUS routes to internal substrate providers only.',
    protects: 'IMMUNITY · TREATY · PHANTOM',
  },
];

export const PACK_META = {
  name: 'cmpsbl-capability-pack-api_gateway-20260328',
  totalCapabilities: 5,
  averageCjpi: 92,
  averageTier: 'apex' as const,
  fingerprint: 'FEDAC39F87A1',
  exported: '2026-03-28',
  source: 'proprietary-evolution-lifecycle',
  originalLanguage: 'PHP',
  translatedTo: 'TypeScript',
};
