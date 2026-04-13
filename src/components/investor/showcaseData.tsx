/**
 * Shared demo data for Investor Showcase layouts
 * SYMBIOTIC Epoch v19.0.0 — Deterministic Coding Model
 */
import { Brain, Zap, Sparkles, ArrowRight, Eye, Shield, Activity, BookOpen, Globe, Store, Flame, Scale } from "lucide-react";

export interface DemoCardData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tier: 1 | 2 | 3;
  status: "live" | "in-progress" | "planned";
  what: string;
  why: string;
  value: string;
  badge?: string;
}

export const TIER_1_DEMOS: DemoCardData[] = [
  {
    title: "Memory Stream",
    subtitle: "Autonomous Discovery",
    icon: <Brain className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "8-hour autonomous cycles explore 10²³ primitive combinations — no human trigger. Every cycle surfaces novel software capabilities the system invented itself.",
    why: "No other system discovers its own capabilities. This is genuine machine creativity through deterministic coding, not probabilistic AI.",
    value: "Every discovery is IP. The system manufactures sellable software from its own patterns — compounding revenue.",
    badge: "autonomous",
  },
  {
    title: "Evolution",
    subtitle: "Self-Improving Code",
    icon: <Zap className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "Scans its own 200k+ LOC codebase, generates real patches, validates through 7 independent gates, and applies improvements — continuously.",
    why: "Software that fixes and improves itself. Deterministic analysis, not guesswork. Every patch is provably better.",
    value: "Eliminates tech debt, reduces engineering costs, scales quality without scaling headcount.",
    badge: "self-improving",
  },
  {
    title: "Ascension",
    subtitle: "Single-File Export Engine",
    icon: <Sparkles className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "Upload code → CJPI scoring → capability injection → export as zero-dependency distribution in 90+ languages. Original code untouched.",
    why: "The clearest proof of value. Input basic code, output IP-protected production software. Zero AI in the output — pure deterministic coding.",
    value: "Every developer becomes 10x. Every script becomes a portable, sellable product across 12 industry verticals.",
    badge: "patent-pending",
  },
  {
    title: "Mana",
    subtitle: "The Real Product",
    icon: <Flame className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "Layer 2 silent software symbiont — attaches to any codebase and grants emergent capabilities without modifying a single line of source code.",
    why: "Non-cooperative attachment means Mana works on software that doesn't know it's there. Governed by Lex. Fear of what it can do = free advertising.",
    value: "The Shield/Lex Registry becomes the antidote. Every Mana demonstration drives demand for the governance layer — $0 CAC.",
    badge: "the-real-product",
  },
  {
    title: "Build With the Substrate",
    subtitle: "Platform Proof",
    icon: <ArrowRight className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "One click generates a working app with memory, learning, and security wired in across 12 verticals and 40 Primitives.",
    why: "Bridges 'impressive system' to 'investable platform.' Apps export and run anywhere — no vendor lock-in.",
    value: "Platform economics — every app built on the substrate is recurring revenue. Every export proves independence.",
  },
];

export const TIER_2_DEMOS: DemoCardData[] = [
  {
    title: "DREAM Engine",
    subtitle: "Background Learning",
    icon: <Eye className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "Consolidates learning during idle time — dream cycles, memory synthesis. No AI inside — pure algorithmic coding.",
    why: "Autonomous background improvement. Patentable. The system gets smarter every day without intervention or compute cost.",
    value: "Compound intelligence — each cycle reduces future costs and increases capability.",
    badge: "no-ai-inside",
  },
  {
    title: "DEFENSE Layer",
    subtitle: "Enterprise Security",
    icon: <Shield className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "6-layer Cognitive Security Matrix. O(1) Trie-based evaluation. Sub-millisecond threat scoring on every action.",
    why: "Security is structural, not bolted on. Baked into the substrate at the primitive level.",
    value: "Enterprise prerequisite. Audit-ready from day one. #1 concern for adoption — solved.",
  },
  {
    title: "SEBA Pipeline",
    subtitle: "Governance Rails",
    icon: <Activity className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "7-gate promotion pipeline. Real pass/fail history. Constitutional AI governance — nothing ships without proof.",
    why: "AI mutations can't bypass governance. Safety rails are structural, not policy documents.",
    value: "Regulatory compliance, full auditability, risk mitigation that scales with the system.",
  },
  {
    title: "Investor Library",
    subtitle: "Due Diligence Docs",
    icon: <BookOpen className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "Browse, read, and print the complete investor documentation — executive summary, architecture, IP, valuation, patents.",
    why: "Professional due diligence materials ready for download and distribution.",
    value: "Self-serve investor education that scales without meetings.",
  },
];

export const DEMO_ROUTE_MAP: Record<string, string> = {
  "Memory Stream": "memory-stream",
  "Evolution": "evolution",
  "Ascension": "ascension",
  "Mana": "mana",
  "Build With the Substrate": "build-substrate",
  "DREAM Engine": "dream-engine",
  "DEFENSE Layer": "defense-layer",
  "SEBA Pipeline": "seba-pipeline",
  "Investor Library": "doc-library",
};
