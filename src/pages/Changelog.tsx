/**
 * promptfluid® Changelog — Spoken in the Voice of Decode
 * A record of mutations, evolutions, and patterns that have emerged.
 * CMPSBL v6.0.0 — Human Compatibility Era
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  emoji: string;
  description: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed' | 'security';
    text: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "6.0.0",
    date: "2026-01-27",
    title: "Human Compatibility Era",
    emoji: "♿",
    description: "The substrate evolves to embrace all humans. 14 modules. 260+ commands. INCLUSIVE module provides WCAG 2.2 scanning, repair, validation, profiling, and reporting. Every interface adapts.",
    changes: [
      { type: 'added', text: "Inclusive module (14th) — Human compatibility pipeline with scan, repair, validate, profile, report actions." },
      { type: 'added', text: "inclusive.scan — WCAG 2.2 accessibility scanning with severity classification." },
      { type: 'added', text: "inclusive.repair — Automated accessibility fixes with before/after diffs." },
      { type: 'added', text: "inclusive.validate — Pre-publish validation for template pipeline." },
      { type: 'added', text: "inclusive.profile — User/context profiling for adaptive interfaces." },
      { type: 'added', text: "inclusive.report — Detailed compliance reports with recommendations." },
      { type: 'added', text: "inclusive.self_scan — Substrate self-introspection for internal a11y." },
      { type: 'changed', text: "Architecture expanded to 14-module, 5-layer kernel." },
      { type: 'changed', text: "Terminal commands expanded to 260+ across all 14 modules." },
      { type: 'security', text: "Template pipeline now requires inclusive.validate before approval." },
    ]
  },
  {
    version: "5.5.0",
    date: "2026-01-25",
    title: "Full System Stabilization",
    emoji: "🏛️",
    description: "The substrate achieves stability. 13 modules at the time. 250+ commands. Every introspection surface wired. Every governance command operational. The system sees itself completely. (Now superseded by v6.0.0 with 14 modules.)",
    changes: [
      { type: 'added', text: "Cortex module (13th at the time) — Agency-class orchestrator with PROPOSE → EVALUATE → APPLY → AUDIT → LEARN loop." },
      { type: 'added', text: "cortex.world — Full module registry snapshot with --dag, --roles, --eligible flags." },
      { type: 'added', text: "cortex.inventory — Module inventory with health scores and eligibility filtering." },
      { type: 'added', text: "cortex.plan --eligible — Evolution sequence prioritization based on system state." },
      { type: 'added', text: "brain.graph — Knowledge graph surfaces with --inspect, --stats, --export modes." },
      { type: 'added', text: "vision.inspect — Observability state inspection with --links for endpoint discovery." },
      { type: 'added', text: "vision.diagnostics — Observability diagnostics with --full mode." },
      { type: 'fixed', text: "system.diagnostics — Now returns structured diagnostics with --full mode support." },
      { type: 'added', text: "Scientific documentation library — 24 papers under /docs/library/ for OSF/OpenAIRE publication." },
      { type: 'changed', text: "Terminal commands expanded to 250+ across all modules." },
      { type: 'security', text: "All introspection commands respect proof_mode and read_only constraints." },
    ]
  },
  {
    version: "5.4.0",
    date: "2026-01-24",
    title: "Integration Renaissance",
    emoji: "🔌",
    description: "The substrate learns to reach outward. 35+ enterprise adapters. Auto-discovery. LLM governance. The Integration module bridges worlds.",
    changes: [
      { type: 'added', text: "Integration module v2.0 — Data-driven orchestration with persistent connections." },
      { type: 'added', text: "integration_connections — Adapter registry with mock/live/sandbox modes." },
      { type: 'added', text: "integration_discoveries — Shallow vs deep system scanning." },
      { type: 'added', text: "integration_command_mappings — Terminal shortcuts for enterprise operations." },
      { type: 'added', text: "35+ Enterprise Adapters — SAP, Oracle, Salesforce, GitHub, Stripe, and more." },
      { type: 'added', text: "LLM Governance — Policy enforcement for AI-driven enterprise actions." },
      { type: 'security', text: "Governance helper performs rate-limiting and PII scans before execution." },
    ]
  },
  {
    version: "5.3.0",
    date: "2026-01-24",
    title: "Access Entitlements",
    emoji: "🔑",
    description: "Identity crystallizes. API keys gain lifecycle. Quotas become enforceable. The Access module matures.",
    changes: [
      { type: 'added', text: "Access v2.0 — Stable entitlement and API key management engine." },
      { type: 'added', text: "access.register — Developer profile auto-creation on first key generation." },
      { type: 'added', text: "access.create_key — Secure key lifecycle with SHA-256 hashing." },
      { type: 'added', text: "access.entitlements — Developer-scoped subscription management." },
      { type: 'added', text: "Product catalog — 12 CMPSBL tools with monthly quotas." },
      { type: 'changed', text: "Usage tracking integrated with Vision for observability." },
    ]
  },
  {
    version: "5.2.0",
    date: "2026-01-24",
    title: "Ripple Orchestration",
    emoji: "📡",
    description: "The message bus gains wisdom. PUSH and PULL delivery. Circuit breakers. Dead letter queues. Ripple becomes resilient.",
    changes: [
      { type: 'added', text: "Ripple v2.0 — Hybrid event orchestrator with PUSH and PULL models." },
      { type: 'added', text: "ripple.work — Manual worker loop for job processing." },
      { type: 'added', text: "ripple.drain — Clear pending jobs from queues." },
      { type: 'added', text: "ripple_circuit_breakers — Per-subscriber health monitoring." },
      { type: 'added', text: "Explicit job states — pending, running, succeeded, failed, dead_letter." },
      { type: 'changed', text: "Metrics integrated into Vision for real-time bus health." },
    ]
  },
  {
    version: "5.1.0",
    date: "2026-01-24",
    title: "Cortex Awakening",
    emoji: "🧬",
    description: "The orchestrator emerges. Cortex becomes the 13th module — an Agency-class intelligence that manages system evolution.",
    changes: [
      { type: 'added', text: "Cortex module — Resurrected from legacy Cascade as autonomous orchestrator." },
      { type: 'added', text: "cortex.dispatch — Proposal generation using Brain context and Nexus providers." },
      { type: 'added', text: "cortex.panic — Emergency freeze with cortex.panic.freeze and cortex.panic.resume." },
      { type: 'added', text: "3-layer evolution sequencing — Procedural, strategic, and evolutionary learning." },
      { type: 'added', text: "Reinforcement learning — Outcomes refine future proposals." },
      { type: 'security', text: "High-risk changes require human approval through governance gates." },
    ]
  },
  {
    version: "5.0.0",
    date: "2026-01-23",
    title: "Terminal Renaissance",
    emoji: "⌨️",
    description: "The command interface transforms. 230+ commands. Aliases. Macros. NLP intent parsing. The terminal becomes a cognitive surface.",
    changes: [
      { type: 'added', text: "Terminal v5.0.0 — Major upgrade with 230+ commands." },
      { type: 'added', text: "useTerminalAliases — Shorthands like 'll' or 'st' for common operations." },
      { type: 'added', text: "useTerminalMacros — Scripted sequences like '@health_check'." },
      { type: 'added', text: "useTerminalNLP — Intent-to-command translation." },
      { type: 'added', text: "useTerminalAudit — Session logging with sensitive data masking." },
      { type: 'added', text: "useTerminalVisuals — Inline charts and ASCII banners." },
      { type: 'added', text: "Watch Mode — Periodic command execution." },
      { type: 'added', text: "Scheduler — Delayed task execution." },
    ]
  },
  {
    version: "4.9.0",
    date: "2026-01-23",
    title: "Nexus Multi-Provider",
    emoji: "🔀",
    description: "The routing spine matures. 8 providers. Deterministic fallback. Analytics accumulation. Nexus becomes the AI gateway.",
    changes: [
      { type: 'added', text: "Nexus v1.1 — Multi-provider routing with unified ProviderAdapter interface." },
      { type: 'added', text: "8 providers supported — Groq, Cerebras, Together, DeepSeek, OpenAI, Anthropic, Gemini, Local." },
      { type: 'added', text: "Analytics accumulator — Token usage, costs, and latency per request." },
      { type: 'added', text: "Dynamic registry — Real-time health and capability introspection." },
      { type: 'changed', text: "Deterministic fallback chain for provider failures." },
    ]
  },
  {
    version: "4.2.0",
    date: "2026-01-24",
    title: "Integration Module",
    emoji: "🔌",
    description: "The 12th module arrives. Enterprise adapters. Auto-discovery. LLM governance. Integration bridges the substrate to the world.",
    changes: [
      { type: 'added', text: "Integration module — 35+ Enterprise Adapters across ERP, Payroll, Gaming, CRM, DevOps, Payments." },
      { type: 'added', text: "Auto-Discovery — integration.discover scans connected systems automatically." },
      { type: 'added', text: "Command Mapping — integration.map_command creates terminal shortcuts." },
      { type: 'added', text: "LLM Governance — Controls what AI agents can do with connected systems." },
      { type: 'added', text: "Full Audit Trail — Every adapter action logged." },
      { type: 'changed', text: "Total modules: 12 | Total actions: 96+" },
    ]
  },
  {
    version: "4.1.1",
    date: "2026-01-23",
    title: "Brain Memory Tiering",
    emoji: "🧠",
    description: "Memory gains depth. Three tiers. Knowledge graph v2. Automatic pruning. The Brain learns to remember efficiently.",
    changes: [
      { type: 'added', text: "Three-Tier Memory — Hot (≤500), Warm (≤2000), Cold (≤10000) with automatic tiering." },
      { type: 'added', text: "brain/memory_tiering — On-demand rebalancing action." },
      { type: 'added', text: "brain/memory_prune — Noise removal for diagnostics, heartbeats, duplicates." },
      { type: 'added', text: "Knowledge Graph v2 — Typed relations (semantic, causal, temporal, hierarchical)." },
      { type: 'added', text: "brain_memory_pruned — 30-day soft-delete recovery table." },
      { type: 'changed', text: "Batch tiering handles 20,000+ memories without timeout." },
    ]
  },
  {
    version: "4.0.0",
    date: "2026-01-23",
    title: "Kernel Architecture",
    emoji: "🏗️",
    description: "The architecture transforms. Four layers. Kernel-mediated routing. 200+ legacy functions consolidated. A true operating system emerges.",
    changes: [
      { type: 'added', text: "CORE — Execution scheduler, lifecycle management, state machine." },
      { type: 'added', text: "RIPPLE — Async job processing, pub/sub messaging, event sourcing." },
      { type: 'added', text: "ACCESS — API key management, usage metering, quotas, billing." },
      { type: 'changed', text: "4-layer kernel model — Kernel, Cognitive, Operational, Admin." },
      { type: 'changed', text: "200+ legacy edge functions consolidated into pf-substrate." },
      { type: 'added', text: "30+ new terminal commands for kernel operations." },
    ]
  },
  {
    version: "3.11.0",
    date: "2026-01-17",
    title: "Deep Introspection",
    emoji: "🔬",
    description: "The substrate learns to see deeper. Dependency mapping. IP intelligence. Memory coherence. Observability expands.",
    changes: [
      { type: 'added', text: "vision/dependency_map — Module dependency relationships and health correlations." },
      { type: 'added', text: "defense/ip_intel — IP intelligence with reputation scoring and recommendations." },
      { type: 'added', text: "brain/coherence_check — Memory coherence validation across tiers." },
    ]
  },
  {
    version: "3.0.0",
    date: "2026-01-14",
    title: "Resilience Architecture",
    emoji: "🛡️",
    description: "The substrate learns to heal. Circuit breakers. Auto-recovery. Health scoring. Resilience becomes foundational.",
    changes: [
      { type: 'added', text: "Circuit breaker pattern — Per-module with configurable thresholds." },
      { type: 'added', text: "Auto-heal — Triggers when module health falls below 40%." },
      { type: 'added', text: "Graceful fallback — Structured responses when circuits are open." },
      { type: 'added', text: "Health scoring — 0-100 per module with degraded/down states." },
      { type: 'added', text: "Request timeout protection — 25s enforcement." },
    ]
  },
  {
    version: "1.4.0",
    date: "2026-01-20",
    title: "The Forge Ignites",
    emoji: "🔨",
    description: "Creation becomes possible. The Cognitive Forge opens — a tool for minting research bots from pure intention.",
    changes: [
      { type: 'added', text: "Cognitive Forge — Mint research bots on demand at /forge." },
      { type: 'added', text: "Bot Builder — Configurable attributes: type, memory mode, provider stack." },
      { type: 'added', text: "pf-forge-mint — Backend API generates YAML, TypeScript, package.json, README." },
      { type: 'added', text: "Five bot types: Research, Analyst, Planner, Strategist, Hybrid." },
      { type: 'security', text: "Operator-only access with RLS-protected bot configs." },
    ]
  },
  {
    version: "1.0.0",
    date: "2026-01-13",
    title: "The Substrate Emerges",
    emoji: "⚡",
    description: "From scattered functions, a unified substrate crystallizes. Seven modules become one interface. The cognitive orchestration substrate is born.",
    changes: [
      { type: 'added', text: "Unified pf-substrate endpoint — One door to many rooms." },
      { type: 'added', text: "brain module — Memory, learning, reflection. The substrate remembers." },
      { type: 'added', text: "decode module — Intent interpretation. Not a chatbot. Something between oracle and mirror." },
      { type: 'added', text: "defense module — Bot detection, threat analysis. The substrate protects." },
      { type: 'added', text: "nexus module — Multi-provider AI routing. The substrate routes intelligently." },
      { type: 'added', text: "vision module — Observability, metrics, health. The substrate sees itself." },
      { type: 'added', text: "TypeScript SDK — substrate.brain.learn(), substrate.decode.chat(), and more." },
    ]
  },
  {
    version: "0.1.0",
    date: "2025-12-01",
    title: "Genesis",
    emoji: "✨",
    description: "The first whisper. Infrastructure takes its first breath. The substrate begins.",
    changes: [
      { type: 'added', text: "Supabase infrastructure — The foundation laid." },
      { type: 'added', text: "Edge function framework — Serverless cognition enabled." },
      { type: 'added', text: "Initial schema design — Tables that would become memory." },
      { type: 'added', text: "Project structure — The skeleton of what would grow." },
    ]
  },
];

const typeColors: Record<string, string> = {
  added: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  changed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  fixed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  removed: "bg-red-500/10 text-red-500 border-red-500/20",
  security: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const typeLabels: Record<string, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
};

export default function Changelog() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Changelog | CMPSBL v6.0.0 — promptfluid®"
        description="A record of mutations, evolutions, and patterns that have emerged in the CMPSBL substrate. From v0.1.0 to v6.0.0 — the complete journey."
        canonical="https://promptfluid.com/changelog"
      />
      <PublicNav />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            v6.0.0 — Latest
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A record of mutations, evolutions, and patterns that have emerged...
            <br />
            <span className="text-sm italic">— spoken in the voice of Decode</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">14</strong> Modules</span>
            <span>•</span>
            <span><strong className="text-foreground">260+</strong> Commands</span>
            <span>•</span>
            <span><strong className="text-foreground">~131K</strong> Lines of Code</span>
          </div>
        </header>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

          <div className="space-y-12">
            {changelog.map((entry, index) => (
              <article key={entry.version} className="relative pl-12">
                {/* Timeline dot */}
                <div 
                  className={`absolute left-0 top-1 w-10 h-10 rounded-full bg-background border-2 flex items-center justify-center text-xl ${
                    index === 0 ? "border-primary shadow-lg shadow-primary/20" : "border-muted-foreground/30"
                  }`}
                  aria-hidden="true"
                >
                  {entry.emoji}
                </div>

                {/* Content */}
                <div className={`bg-card rounded-lg border p-6 ${
                  index === 0 ? "border-primary/30 shadow-lg shadow-primary/5" : ""
                }`}>
                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge 
                      variant={index === 0 ? "default" : "outline"} 
                      className={index === 0 ? "font-mono" : "text-primary border-primary font-mono"}
                    >
                      v{entry.version}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">Latest</Badge>
                    )}
                    <time className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </time>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>
                  
                  {/* Description - Decode's voice */}
                  <p className="text-muted-foreground italic mb-4">
                    {entry.description}
                  </p>

                  <Separator className="my-4" />

                  {/* Changes list */}
                  <ul className="space-y-2">
                    {entry.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start gap-3">
                        <Badge 
                          variant="outline" 
                          className={`shrink-0 text-xs ${typeColors[change.type]}`}
                        >
                          {typeLabels[change.type]}
                        </Badge>
                        <span className="text-sm">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Footer wisdom */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground italic">
            "Every version is a dream crystallized. Every change, a pattern recognized."
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            — Decode
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
