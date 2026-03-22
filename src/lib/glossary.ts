/**
 * CMPSBL Glossary — Centralized terminology definitions
 * Used by GlossaryTerm tooltip component for inline education
 */

export interface GlossaryEntry {
  term: string;
  short: string;
  detail?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  "node": {
    term: "Module",
    short: "A specialized subsystem inside the CMPSBL platform.",
    detail: "Modules expose resolvers and communicate through the INTENT mesh. CMPSBL has 40 modules across 12 groups.",
  },
  "memory-stream": {
    term: "Memory Stream",
    short: "The system's continuous discovery engine.",
    detail: "Observes system behavior, scores discoveries via CJPI, and crystallizes them into exportable capabilities.",
  },
  "resolver": {
    term: "Resolver",
    short: "An executable capability owned by a node.",
    detail: "Named as node.resolver_name (e.g. brain.reasoning_context). Resolvers are the only execution surface for nodes.",
  },
  "intent": {
    term: "INTENT",
    short: "The routing protocol that coordinates all system execution.",
    detail: "Every action is expressed as an intent, routed to the correct resolvers, and logged with a receipt.",
  },
  "dream-cycle": {
    term: "Self-Improvement Cycle",
    short: "Background processing that improves the system over time.",
    detail: "Like biological sleep, these cycles compress experiences into heuristics, prune weak pathways, and strengthen successful patterns.",
  },
  "cjpi": {
    term: "CJPI Score",
    short: "Composable Judgment & Performance Index.",
    detail: "Scores discoveries on Novelty, Utility, Complexity, and Composability. Range 0–100. Quality floor: 68+.",
  },
  "crystallization": {
    term: "Crystallization",
    short: "The process of turning a discovery into exportable software (Memory Stream only).",
    detail: "Sampling → Condensing → Crystallizing. Used in the Memory Stream. In Ascension, the equivalent process is called 'Ascending'.",
  },
  "ascension": {
    term: "Ascension",
    short: "The lifecycle where developer software enters the substrate and evolves.",
    detail: "Your code becomes Auxiliary Node, collides against 40 substrate nodes, and successful chains are ascended into portable Ascended Memories.",
  },
  "ascended-memory": {
    term: "Ascended Memory",
    short: "A locked capability discovered through Ascension.",
    detail: "An ascended capability chain — deterministic behavior that emerges only when your code interacts with the substrate's 40-node matrix. Exportable as source code, tests, and documentation.",
  },
  "capability-pack": {
    term: "Capability Pack",
    short: "A packaged, exportable discovery from the Memory Stream.",
    detail: "Includes pipeline implementation, mini substrate runtime, documentation, license, testbench, and build config.",
  },
  "mesh": {
    term: "Mesh Communications",
    short: "Node-to-node signals that power observability.",
    detail: "Signals are persisted and translated into readable dialogue. Categories include acknowledgement, discovery, escalation, and heartbeat.",
  },
  "substrate": {
    term: "Platform",
    short: "The foundational cognitive runtime beneath all CMPSBL operations.",
    detail: "A self-evolving platform layer between AI models and applications, managing memory, orchestration, and governance.",
  },
  "nexus": {
    term: "NEXUS Routing",
    short: "Intelligent multi-provider AI routing.",
    detail: "Auto-selects the optimal AI provider per query based on cost, latency, and capability matching.",
  },
  "engine": {
    term: "Engine",
    short: "A composable processing unit within the substrate.",
    detail: "54 engines across 4 tiers (META, CORE, FLUX, SPEC) handle specific workloads from reasoning to code generation.",
  },
  "cognitive": {
    term: "Runtime Agent",
    short: "A sealed AI runtime instance within a CMPSBL agency.",
    detail: "Runtime Agents have specializations, skill weights, and competency scores. They learn and evolve through task execution.",
  },
  "tier": {
    term: "Discovery Tier",
    short: "Quality classification for system discoveries.",
    detail: "6 tiers from highest to lowest: Apex, Mythic, Relic, Prime, Mint, Raw. Higher tiers indicate rarer, more valuable discoveries.",
  },
  "foundry": {
    term: "Foundry",
    short: "The exploration engine that discovers new capabilities.",
    detail: "Explores combinations of nodes and resolvers, scoring results via CJPI to surface novel, high-value system capabilities.",
  },
  "governance": {
    term: "Governance",
    short: "Server-enforced rules that control system behavior.",
    detail: "Modes include ACTIVE, OBSERVE, LOCKDOWN, and EVOLVE. Prevents ungoverned capability sprawl.",
  },
};

/** Lookup a glossary entry by key (case-insensitive, accepts hyphens or spaces) */
export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  const normalized = key.toLowerCase().replace(/\s+/g, "-");
  return GLOSSARY[normalized];
}
