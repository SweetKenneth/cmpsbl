/**
 * Shared demo data for Investor Showcase layouts
 */
import { Brain, Zap, Sparkles, ArrowRight, Eye, Shield, Activity, BookOpen } from "lucide-react";

export interface DemoCardData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tier: 1 | 2 | 3;
  status: "live" | "in-progress" | "planned";
  what: string;
  why: string;
  value: string;
}

export const TIER_1_DEMOS: DemoCardData[] = [
  {
    title: "Memory Stream",
    subtitle: "Autonomous Discovery",
    icon: <Brain className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "The system observes its own behavior and discovers new software pipelines autonomously.",
    why: "No other system discovers its own capabilities. This is self-improving infrastructure.",
    value: "Every discovery is a potential product. The system generates its own IP.",
  },
  {
    title: "Evolution",
    subtitle: "Self-Improving Code",
    icon: <Zap className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "System scans its codebase, AI generates real patches, validates, scores, approve/reject.",
    why: "Software that fixes and improves itself. The core promise.",
    value: "Reduces engineering costs, eliminates tech debt, scales without hiring.",
  },
  {
    title: "Ascension",
    subtitle: "Single-File Export Engine",
    icon: <Sparkles className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "Upload code → classify archetype → filter capabilities → export as a single-file, zero-dependency distribution in 25 languages.",
    why: "The clearest proof of value — input basic code, output IP-protected production software.",
    value: "Every developer becomes 10x. Every script becomes a portable, sellable product.",
  },
  {
    title: "Build With the Substrate",
    subtitle: "Platform Proof",
    icon: <ArrowRight className="w-4 h-4 text-primary" />,
    tier: 1, status: "live",
    what: "One click generates a working app with memory, learning, and security already wired in.",
    why: "This bridges 'impressive system' to 'investable platform.' Apps export and run anywhere.",
    value: "Platform economics — every app built on the substrate is recurring revenue.",
  },
];

export const TIER_2_DEMOS: DemoCardData[] = [
  {
    title: "DREAM Engine",
    subtitle: "Background Learning",
    icon: <Eye className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "The system consolidates learning during idle time — dream cycles, memory synthesis.",
    why: "Autonomous background improvement. No other system does this.",
    value: "Compound intelligence — the system gets smarter every day without intervention.",
  },
  {
    title: "DEFENSE Layer",
    subtitle: "Enterprise Security",
    icon: <Shield className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "Live threat score calculation. O(1) Trie-based evaluation, anomaly detection.",
    why: "Enterprise-grade security baked into the substrate, not bolted on.",
    value: "Security is the #1 enterprise concern. Prerequisite for adoption.",
  },
  {
    title: "SEBA Pipeline",
    subtitle: "Governance Rails",
    icon: <Activity className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "7-gate promotion pipeline. Real pass/fail history.",
    why: "AI mutations can't bypass governance. Safety rails are structural.",
    value: "Regulatory compliance, auditability, risk mitigation.",
  },
  {
    title: "Investor Library",
    subtitle: "Printable Documentation",
    icon: <BookOpen className="w-4 h-4 text-primary" />,
    tier: 2, status: "live",
    what: "Browse, read, and print the complete investor documentation — executive summary, architecture, IP, valuation.",
    why: "Professional due diligence materials ready for download and distribution.",
    value: "Self-serve investor education that scales without meetings.",
  },
];

export const DEMO_ROUTE_MAP: Record<string, string> = {
  "Memory Stream": "memory-stream",
  "Evolution": "evolution",
  "Ascension": "ascension",
  "Build With the Substrate": "build-substrate",
  "DREAM Engine": "dream-engine",
  "DEFENSE Layer": "defense-layer",
  "SEBA Pipeline": "seba-pipeline",
  "Investor Library": "doc-library",
};
