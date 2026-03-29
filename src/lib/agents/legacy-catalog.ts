/**
 * Legacy Agents Catalog — The Original 20 Standalone Runtime Agents
 * These are the individual agents that were later fused into 5 Meta-Agents.
 * Priced from Free → $79. Perpetual license, sealed runtime.
 */

import {
  Cog, GraduationCap, Pen, Languages,
  Code, Palette, Server, Database,
  Shield, Lock, Headphones, Gavel,
  Brain, BarChart3, Search, Compass,
  TrendingUp, Megaphone, Users, Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type LegacyAgentTier = "free" | "engineering" | "defense" | "intelligence" | "growth";

export interface LegacyAgent {
  slug: string;
  codename: string;
  role: string;
  tagline: string;
  description: string;
  capabilities: string[];
  icon: LucideIcon;
  tier: LegacyAgentTier;
  priceCents: number;
  priceDisplay: string;
  fusedInto: string;
  color: string;
  isFree: boolean;
}

export const LEGACY_TIER_CONFIG: Record<LegacyAgentTier, { label: string; price: string; color: string; border: string; bg: string }> = {
  free:         { label: "FREE",         price: "$0",  color: "text-neon-green",   border: "border-neon-green/30",   bg: "bg-neon-green/10" },
  engineering:  { label: "ENGINEERING",  price: "$19", color: "text-neon-amber",   border: "border-neon-amber/30",   bg: "bg-neon-amber/10" },
  defense:      { label: "DEFENSE",      price: "$39", color: "text-destructive",  border: "border-destructive/30",  bg: "bg-destructive/10" },
  intelligence: { label: "INTELLIGENCE", price: "$59", color: "text-neon-purple",  border: "border-neon-purple/30",  bg: "bg-neon-purple/10" },
  growth:       { label: "GROWTH",       price: "$79", color: "text-neon-cyan",    border: "border-neon-cyan/30",    bg: "bg-neon-cyan/10" },
};

export const LEGACY_AGENTS: LegacyAgent[] = [
  // ═══ FREE — Foundation (fused into PRIMITIVE) ═══
  {
    slug: "hybrid", codename: "HYBRID", role: "Generalist Router",
    tagline: "Routes tasks across domains with adaptive intelligence",
    description: "Cross-domain task routing that classifies incoming work and delegates to the optimal reasoning path. The foundation of all multi-domain agents.",
    capabilities: ["Cross-domain task classification", "Adaptive routing logic", "Context-aware delegation", "Multi-step chaining"],
    icon: Cog, tier: "free", priceCents: 0, priceDisplay: "FREE", fusedInto: "PRIMITIVE", color: "38 90% 50%", isFree: true,
  },
  {
    slug: "educator", codename: "EDUCATOR", role: "Socratic Teacher",
    tagline: "Teaches through questions, not lectures",
    description: "Socratic reasoning loops that guide learners to answers through adaptive questioning. Adjusts difficulty in real-time based on comprehension signals.",
    capabilities: ["Socratic questioning loops", "Adaptive difficulty scaling", "Knowledge scaffolding", "Comprehension tracking"],
    icon: GraduationCap, tier: "free", priceCents: 0, priceDisplay: "FREE", fusedInto: "PRIMITIVE", color: "210 80% 55%", isFree: true,
  },
  {
    slug: "writer", codename: "ELOQUENCE", role: "Voice-Locked Writer",
    tagline: "Writes with locked brand voice and citation awareness",
    description: "Persona-locked longform writing engine with citation-aware RAG. Maintains tone, style, and brand consistency across unlimited sessions.",
    capabilities: ["Brand voice locking", "Citation-aware generation", "Longform composition", "Multi-format output"],
    icon: Pen, tier: "free", priceCents: 0, priceDisplay: "FREE", fusedInto: "PRIMITIVE", color: "270 70% 55%", isFree: true,
  },
  {
    slug: "translator", codename: "TRANSLATOR", role: "Cultural Translator",
    tagline: "Context-aware translation that preserves meaning",
    description: "Multi-language translation that preserves tone, register, and cultural nuance. Learns domain-specific glossaries over time.",
    capabilities: ["Context-aware translation", "Cultural nuance preservation", "Glossary learning", "Register matching"],
    icon: Languages, tier: "free", priceCents: 0, priceDisplay: "FREE", fusedInto: "PRIMITIVE", color: "160 70% 45%", isFree: true,
  },

  // ═══ ENGINEERING $19 (fused into WRAITH) ═══
  {
    slug: "coder", codename: "CODING", role: "Code Generator",
    tagline: "Multi-language code generation with AST analysis",
    description: "Production-grade code generation with dependency graph analysis, dead code elimination, and type-safe transformations across multiple languages.",
    capabilities: ["Multi-language generation", "AST-level analysis", "Dead code elimination", "Type-safe transforms"],
    icon: Code, tier: "engineering", priceCents: 1900, priceDisplay: "$19", fusedInto: "WRAITH", color: "145 70% 45%", isFree: false,
  },
  {
    slug: "designer", codename: "AURORA", role: "UI/UX Designer",
    tagline: "Component design systems with WCAG compliance",
    description: "Generates production-ready UI components from design specs with tokens, variants, accessibility auditing, and WCAG compliance baked in.",
    capabilities: ["Design system generation", "WCAG compliance", "Token management", "Responsive variants"],
    icon: Palette, tier: "engineering", priceCents: 1900, priceDisplay: "$19", fusedInto: "WRAITH", color: "340 80% 55%", isFree: false,
  },
  {
    slug: "devops", codename: "DEPLOYER", role: "DevOps Engineer",
    tagline: "CI/CD pipeline orchestration with rollback gates",
    description: "Auto-generates build, test, and deploy pipelines with parallelized stages, rollback gates, and environment promotion logic.",
    capabilities: ["Pipeline generation", "Rollback gates", "Environment promotion", "Parallelized stages"],
    icon: Server, tier: "engineering", priceCents: 1900, priceDisplay: "$19", fusedInto: "WRAITH", color: "200 60% 45%", isFree: false,
  },
  {
    slug: "data-engineer", codename: "MERIDIAN", role: "Data Engineer",
    tagline: "Self-healing ETL and data flow orchestration",
    description: "Designs self-healing data pipelines with schema evolution, backpressure awareness, dead letter queues, and full lineage tracking.",
    capabilities: ["ETL pipeline design", "Schema evolution", "Backpressure handling", "Data lineage tracking"],
    icon: Database, tier: "engineering", priceCents: 1900, priceDisplay: "$19", fusedInto: "WRAITH", color: "185 80% 45%", isFree: false,
  },

  // ═══ DEFENSE $39 (fused into OBSIDIAN) ═══
  {
    slug: "guardian", codename: "WARDEN", role: "Threat Modeler",
    tagline: "STRIDE-based threat modeling and attack surface mapping",
    description: "Predictive threat modeling with STRIDE analysis, behavioral fingerprinting, and exploit vector prediction before vulnerabilities are discovered.",
    capabilities: ["STRIDE threat modeling", "Attack surface mapping", "Behavioral fingerprinting", "Exploit prediction"],
    icon: Shield, tier: "defense", priceCents: 3900, priceDisplay: "$39", fusedInto: "OBSIDIAN", color: "0 80% 50%", isFree: false,
  },
  {
    slug: "security", codename: "SECURITY", role: "Zero-Trust Enforcer",
    tagline: "Policy-as-code enforcement across all access boundaries",
    description: "Zero-trust policy enforcement with automatic credential rotation, GDPR/SOC2/HIPAA compliance, and access boundary management.",
    capabilities: ["Zero-trust enforcement", "Credential rotation", "Compliance scanning", "Policy-as-code"],
    icon: Lock, tier: "defense", priceCents: 3900, priceDisplay: "$39", fusedInto: "OBSIDIAN", color: "15 85% 50%", isFree: false,
  },
  {
    slug: "support", codename: "BASTION", role: "Support Agent",
    tagline: "Autonomous incident triage and ticket resolution",
    description: "Self-classifying severity scoring with auto-executing remediation playbooks. Routes tickets to optimal resolvers across fleets.",
    capabilities: ["Severity scoring", "Auto-remediation", "Ticket routing", "SLA tracking"],
    icon: Headphones, tier: "defense", priceCents: 3900, priceDisplay: "$39", fusedInto: "OBSIDIAN", color: "200 70% 50%", isFree: false,
  },
  {
    slug: "legal", codename: "TRIBUNAL", role: "Legal Analyst",
    tagline: "Contract intelligence and compliance scanning",
    description: "Extracts clauses, maps obligations, detects adversarial terms, and enforces compliance as code. Scans for hidden liabilities.",
    capabilities: ["Clause extraction", "Obligation mapping", "Adversarial term detection", "Compliance enforcement"],
    icon: Gavel, tier: "defense", priceCents: 3900, priceDisplay: "$39", fusedInto: "OBSIDIAN", color: "30 60% 45%", isFree: false,
  },

  // ═══ INTELLIGENCE $59 (fused into MONOLITH) ═══
  {
    slug: "memory", codename: "MEMORY", role: "Knowledge Keeper",
    tagline: "Temporal knowledge graph with dream consolidation",
    description: "Relationship-aware recall across time. Dream consolidation merges memories during idle cycles. Tiered recall from <1ms to deep history.",
    capabilities: ["Temporal knowledge graph", "Dream consolidation", "Tiered recall", "Relationship mapping"],
    icon: Brain, tier: "intelligence", priceCents: 5900, priceDisplay: "$59", fusedInto: "MONOLITH", color: "270 80% 55%", isFree: false,
  },
  {
    slug: "analyst", codename: "AXIOM", role: "Data Analyst",
    tagline: "Anomaly detection with confidence intervals",
    description: "Pattern recognition across time-series data. Surfaces statistical anomalies with confidence intervals, root cause hints, and decision-gate enforcement.",
    capabilities: ["Anomaly detection", "Confidence scoring", "Root cause analysis", "Time-series patterns"],
    icon: BarChart3, tier: "intelligence", priceCents: 5900, priceDisplay: "$59", fusedInto: "MONOLITH", color: "45 90% 50%", isFree: false,
  },
  {
    slug: "researcher", codename: "VESSEL", role: "Deep Researcher",
    tagline: "Multi-source research synthesis with citation chains",
    description: "Multi-source parallel research with entity extraction, credibility scoring, knowledge graph building, and executive-ready synthesis.",
    capabilities: ["Multi-source research", "Credibility scoring", "Entity extraction", "Executive synthesis"],
    icon: Search, tier: "intelligence", priceCents: 5900, priceDisplay: "$59", fusedInto: "MONOLITH", color: "210 75% 50%", isFree: false,
  },
  {
    slug: "strategist", codename: "VISIONARY", role: "Strategist",
    tagline: "Market sizing, competitive intel, and GTM strategy",
    description: "Market sizing (TAM/SAM/SOM), competitive intelligence graphs, multi-scenario modeling, PRD generation, and roadmap prioritization.",
    capabilities: ["Market sizing", "Competitive intelligence", "Multi-scenario modeling", "Roadmap scoring"],
    icon: Compass, tier: "intelligence", priceCents: 5900, priceDisplay: "$59", fusedInto: "MONOLITH", color: "310 70% 50%", isFree: false,
  },

  // ═══ GROWTH $79 (fused into RAPTOR) ═══
  {
    slug: "sales", codename: "SALES", role: "Deal Closer",
    tagline: "Predictive deal scoring and pipeline intelligence",
    description: "Closes deals with predictive scoring, pipeline health analysis, and battle card generation. Learns what converts and applies it to every interaction.",
    capabilities: ["Deal scoring", "Pipeline intelligence", "Battle cards", "Conversion learning"],
    icon: TrendingUp, tier: "growth", priceCents: 7900, priceDisplay: "$79", fusedInto: "RAPTOR", color: "145 75% 45%", isFree: false,
  },
  {
    slug: "marketer", codename: "TEMPEST", role: "Campaign Strategist",
    tagline: "Campaign strategy with A/B test prediction",
    description: "Launches campaigns with predictive A/B testing, audience segmentation, and competitive positioning. Learns which messages resonate.",
    capabilities: ["Campaign strategy", "A/B prediction", "Audience segmentation", "Competitive positioning"],
    icon: Megaphone, tier: "growth", priceCents: 7900, priceDisplay: "$79", fusedInto: "RAPTOR", color: "25 90% 50%", isFree: false,
  },
  {
    slug: "recruiter", codename: "VANGUARD", role: "Talent Scout",
    tagline: "Candidate scoring and interview orchestration",
    description: "Skills-gap mapping, candidate scoring, interview question generation, and salary benchmarking. Builds organizational capability profiles.",
    capabilities: ["Candidate scoring", "Skills-gap mapping", "Interview orchestration", "Salary benchmarking"],
    icon: Users, tier: "growth", priceCents: 7900, priceDisplay: "$79", fusedInto: "RAPTOR", color: "200 80% 50%", isFree: false,
  },
  {
    slug: "finance", codename: "FINANCE", role: "Financial Modeler",
    tagline: "Multi-scenario financial modeling and budgeting",
    description: "Revenue forecasting, multi-scenario financial modeling, budget allocation, and board deck generation with automated variance analysis.",
    capabilities: ["Revenue forecasting", "Multi-scenario modeling", "Budget allocation", "Board deck generation"],
    icon: Calculator, tier: "growth", priceCents: 7900, priceDisplay: "$79", fusedInto: "RAPTOR", color: "160 65% 40%", isFree: false,
  },
];

export const FREE_LEGACY_AGENTS = LEGACY_AGENTS.filter(a => a.isFree);
export const PAID_LEGACY_AGENTS = LEGACY_AGENTS.filter(a => !a.isFree);
export const getLegacyAgentBySlug = (slug: string): LegacyAgent | undefined =>
  LEGACY_AGENTS.find(a => a.slug === slug);
