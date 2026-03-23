/**
 * Unified Store Catalog — 5 Meta-Agents + 5 Engines
 * All products on a single $0 / $79 / $129 / $159 / $249 pricing ladder.
 */

import {
  Cpu, Network, Brain, Cog, Radio,
  Shield, Code, ShieldCheck, Briefcase,
  Lock, HardDrive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AGENTS_WITH_POWERS, type AgentWithPowers } from "@/lib/agents/crownJewelPowers";

import primitiveImg from "@/assets/agents/primitive.png";
import wraithImg from "@/assets/agents/wraith.png";
import obsidianImg from "@/assets/agents/obsidian.png";
import monolithImg from "@/assets/agents/monolith.png";
import raptorImg from "@/assets/agents/raptor.png";

import beaconImg from "@/assets/engines/beacon.png";
import automatonImg from "@/assets/engines/automaton.png";
import cortexImg from "@/assets/engines/cortex.png";
import nexusImg from "@/assets/engines/nexus.png";
import architectImg from "@/assets/engines/architect.png";
import failsafeImg from "@/assets/engines/failsafe.png";

// ═══════════════════════════════════════════════════════════════
// UNIFIED STORE ITEM
// ═══════════════════════════════════════════════════════════════

export type StoreItemKind = "agent" | "engine";
export type StoreTier = "free" | "starter" | "pro" | "elite" | "apex";

export interface StoreItem {
  id: string;
  kind: StoreItemKind;
  name: string;
  subtitle: string;
  bio: string;
  description: string;
  image?: string;
  icon: LucideIcon;
  tier: StoreTier;
  priceCents: number;
  priceDisplay: string;
  gradient: string;
  glowColor: string;
  capabilities: string[];
  fusedFrom?: string[];
  /** Reference to full agent data if kind === "agent" */
  agentRef?: AgentWithPowers;
}

// ═══════════════════════════════════════════════════════════════
// 5 STORE ENGINES — Top 5 by value, repriced to agent tier ladder
// ═══════════════════════════════════════════════════════════════

const STORE_ENGINES: StoreItem[] = [
  {
    id: "engine-failsafe",
    kind: "engine",
    name: "FAILSAFE",
    subtitle: "Disaster Recovery & Platform Migration Engine",
    bio: "One-click backup, restore, and platform migration for any website or app. Transfer off Lovable Cloud, create disaster recovery checkpoints, or migrate between hosts — your data fortress in a single import.",
    description: "FAILSAFE is a standalone, zero-dependency disaster recovery and migration engine. Streaming ZIP output, adaptive page-sizing, integrity validation (magic bytes + EOCD), nightly scheduled backups with 7-day rolling rotation, a 9-step AI-agent restore protocol, and full platform migration support.",
    image: failsafeImg,
    icon: HardDrive,
    tier: "free",
    priceCents: 0,
    priceDisplay: "FREE",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    glowColor: "rgba(6, 182, 212, 0.15)",
    capabilities: [
      "One-click full database backup",
      "Streaming ZIP with integrity validation",
      "7-day rolling nightly rotation",
      "Adaptive page-sizing for large tables",
      "9-step AI-agent restore protocol",
      "Zero-dependency standalone deployment",
    ],
  },
  {
    id: "engine-beacon",
    kind: "engine",
    name: "BEACON",
    subtitle: "Observability & Monitoring Stack",
    bio: "Illuminates everything. Unified metrics, distributed tracing, structured logging, and real-time health dashboards — a single pane of glass for your entire stack.",
    description: "BEACON unifies metrics collection, distributed request tracing, structured log aggregation, and health monitoring. SLA tracking, alert management, and real-time dashboards.",
    image: beaconImg,
    icon: Radio,
    tier: "free",
    priceCents: 0,
    priceDisplay: "FREE",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    glowColor: "rgba(34, 197, 94, 0.15)",
    capabilities: [
      "Unified metrics collection",
      "Distributed request tracing",
      "Structured log aggregation",
      "Real-time health dashboards",
      "Alert & threshold management",
      "SLA tracking & reporting",
    ],
  },
  {
    id: "engine-automaton",
    kind: "engine",
    name: "AUTOMATON",
    subtitle: "Workflow Automation Engine",
    bio: "Turns repetition into reliability. Conditional workflows, scheduled execution, and event-driven automation — the boring stuff handled, brilliantly.",
    description: "AUTOMATON handles visual workflow composition, conditional branching, scheduled tasks, event-driven triggers, retry logic, and parallel execution paths.",
    image: automatonImg,
    icon: Cog,
    tier: "starter",
    priceCents: 7900,
    priceDisplay: "$79",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "rgba(245, 158, 11, 0.15)",
    capabilities: [
      "Visual workflow composition",
      "Conditional branching logic",
      "Scheduled task execution",
      "Event-driven triggers",
      "Retry & error handling",
      "Parallel execution paths",
    ],
  },
  {
    id: "engine-cortex",
    kind: "engine",
    name: "CORTEX Engine",
    subtitle: "Agent Runtime & Orchestration",
    bio: "Gives your AI agents a brain. Multi-agent orchestration, task delegation, memory coordination, and cognitive load balancing — agents think together.",
    description: "CORTEX provides multi-agent task delegation, cognitive load balancing, shared memory coordination, agent competency tracking, automatic skill routing, and collaborative reasoning.",
    image: cortexImg,
    icon: Brain,
    tier: "pro",
    priceCents: 12900,
    priceDisplay: "$129",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    capabilities: [
      "Multi-agent task delegation",
      "Cognitive load balancing",
      "Shared memory coordination",
      "Agent competency tracking",
      "Automatic skill routing",
      "Collaborative reasoning",
    ],
  },
  {
    id: "engine-nexus",
    kind: "engine",
    name: "NEXUS Organ",
    subtitle: "Multi-Model AI Router",
    bio: "Routes every AI call to the optimal model in real time. Cost-aware, latency-based, quality-scored — best answer at the best price, always.",
    description: "NEXUS provides real-time model selection, cost-aware provider optimization, latency-based failover, response quality scoring, token budget management, and multi-provider load balancing.",
    image: nexusImg,
    icon: Network,
    tier: "elite",
    priceCents: 15900,
    priceDisplay: "$159",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    glowColor: "rgba(14, 165, 233, 0.15)",
    capabilities: [
      "Real-time model selection & routing",
      "Cost-aware provider optimization",
      "Latency-based automatic failover",
      "Response quality scoring & feedback",
      "Token budget management",
      "Multi-provider load balancing",
    ],
  },
  {
    id: "engine-architect",
    kind: "engine",
    name: "ARCHITECT",
    subtitle: "The Unified Mega-Engine",
    bio: "Orchestrates all 8 core pipelines into a single sealed runtime. Parse, Route, Execute, Heal, Defend, Learn, Observe, Audit — one import.",
    description: "ARCHITECT is the apex of the engine catalog. Unified 8-stage cognitive pipeline with self-healing, built-in security, real-time observability, intelligent routing, and continuous learning from every execution.",
    image: architectImg,
    icon: Cpu,
    tier: "apex",
    priceCents: 24900,
    priceDisplay: "$249",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    glowColor: "rgba(244, 63, 94, 0.15)",
    capabilities: [
      "Unified 8-stage cognitive pipeline",
      "Self-healing with automatic recovery",
      "Built-in security and anomaly defense",
      "Real-time observability and audit trail",
      "Intelligent multi-path routing",
      "Continuous learning from every execution",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// UNIFIED CATALOG — Agents first, then Engines
// ═══════════════════════════════════════════════════════════════

function agentToStoreItem(agent: AgentWithPowers): StoreItem {
  const tier: StoreTier = agent.isFree ? "free"
    : agent.isApex ? "apex"
    : agent.isElite ? "elite"
    : agent.isFlagship ? "pro"
    : "starter";

  return {
    id: `agent-${agent.id}`,
    kind: "agent",
    name: agent.name,
    subtitle: agent.subtitle,
    bio: agent.bio,
    description: agent.description,
    image: agent.image,
    icon: agent.icon,
    tier,
    priceCents: agent.priceCents ?? 0,
    priceDisplay: agent.isFree ? "FREE"
      : agent.isApex ? "$249"
      : agent.isElite ? "$159"
      : agent.isFlagship ? "$129"
      : "$79",
    gradient: agent.gradient,
    glowColor: agent.glowColor,
    capabilities: agent.powers.map((p) => p.name),
    fusedFrom: agent.fusedFrom,
    agentRef: agent,
  };
}

export const STORE_AGENTS: StoreItem[] = AGENTS_WITH_POWERS.map(agentToStoreItem);
export const ALL_STORE_ITEMS: StoreItem[] = [...STORE_AGENTS, ...STORE_ENGINES];

export const STORE_ITEMS_BY_TIER = (tier: StoreTier) =>
  ALL_STORE_ITEMS.filter((item) => item.tier === tier);

export const TIER_META: Record<StoreTier, { label: string; price: string; color: string; border: string; bg: string }> = {
  free: { label: "FREE", price: "$0", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/15" },
  starter: { label: "STARTER", price: "$79", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/15" },
  pro: { label: "PRO", price: "$129", color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/15" },
  elite: { label: "ELITE", price: "$159", color: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/15" },
  apex: { label: "APEX", price: "$249", color: "text-fuchsia-400", border: "border-fuchsia-500/30", bg: "bg-fuchsia-500/15" },
};

export { STORE_ENGINES };
