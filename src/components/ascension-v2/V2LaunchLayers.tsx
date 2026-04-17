/**
 * V2 Launch Layers — Top 20 curated layers shown on /ascension-v2.
 *
 * Curated from 233 core S-Tier entries + 960 vertical Crown Jewels
 * across 12 substrates. Pressure-tested for universal demand,
 * clean Mana attachment, measurable ROI, and deterministic (zero AI).
 *
 * Displayed price is the LOW end of each range — entry pricing.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Eye, Lock, Brain, Zap, Workflow,
  Sparkles, ScrollText, ChevronDown, ArrowRight, Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  TIER_META,
  TIER_ORDER,
  TIER_LAYERS,
  ALWAYS_ON,
  tierForRank,
  type LayerTier,
} from '@/lib/ascension-v2/tier-layers';

interface LaunchLayer {
  rank: number;
  name: string;
  pillar: Pillar;
  cjpi: number;
  /** Low end of the published range, in dollars/yr */
  priceLow: number;
  /** High end of the published range, in dollars/yr */
  priceHigh: number;
  description: string;
  promise: string;
  source: string;
  roi: string;
}

type Pillar =
  | 'Resilience'
  | 'Foresight'
  | 'Security'
  | 'Intelligence'
  | 'Performance'
  | 'Orchestration'
  | 'Evolution'
  | 'Governance'
  | 'Compliance';

const PILLAR_META: Record<Pillar, { Icon: typeof Brain; tone: string }> = {
  Resilience:    { Icon: Shield,     tone: 'text-emerald-400'  },
  Foresight:     { Icon: Eye,        tone: 'text-sky-400'      },
  Security:      { Icon: Lock,       tone: 'text-rose-400'     },
  Intelligence:  { Icon: Brain,      tone: 'text-violet-400'   },
  Performance:   { Icon: Zap,        tone: 'text-amber-400'    },
  Orchestration: { Icon: Workflow,   tone: 'text-cyan-400'     },
  Evolution:     { Icon: Sparkles,   tone: 'text-fuchsia-400'  },
  Governance:    { Icon: ScrollText, tone: 'text-indigo-400'   },
  Compliance:    { Icon: ScrollText, tone: 'text-teal-400'     },
};

const LAYERS: LaunchLayer[] = [
  // Resilience
  { rank: 1, pillar: 'Resilience', name: 'Self-Healing Orchestrator', cjpi: 96, priceLow: 149, priceHigh: 499,
    description: 'Auto-detects failures, selects lowest-blast-radius repair strategy, executes recovery, and learns from outcomes. Attaches at function boundaries via Mana. No source modification.',
    promise: 'My software recovers itself.',
    source: 'S-Tier #008 · IMMUNITY',
    roi: 'How much does one hour of downtime cost you?' },
  { rank: 2, pillar: 'Resilience', name: 'Autonomous Triage Engine', cjpi: 97, priceLow: 129, priceHigh: 399,
    description: 'Medical-grade triage protocol for distributed systems. Differential diagnosis with automated repair dispatch. Prioritizes by blast radius, dependency depth, and user impact.',
    promise: 'My software diagnoses itself.',
    source: 'S-Tier #004 · MEDIC',
    roi: 'MTTR dropped from 47 minutes to 90 seconds.' },
  { rank: 3, pillar: 'Resilience', name: 'Distributed Consensus Suite', cjpi: 96, priceLow: 99, priceHigh: 349,
    description: 'Consensus Heartbeat Protocol + Quorum Negotiator. Gossip-style liveness detection with Byzantine-fault-tolerant negotiation and split-brain prevention. Your services agree even when the network doesn\'t.',
    promise: 'My software survives network partitions.',
    source: 'S-Tier #005 + #083 · NERVE',
    roi: 'Zero split-brain incidents across 14 regions.' },
  // Foresight
  { rank: 4, pillar: 'Foresight', name: 'Oracle-Ripple Precognition Chain', cjpi: 96, priceLow: 199, priceHigh: 599,
    description: 'Fuses predictive forecasting with causal propagation to predict downstream failures before they occur. Auto-executes preemptive actions (scale, reroute, throttle, isolate) before impact.',
    promise: 'My software prevents problems.',
    source: 'S-Tier #024 · ORACLE×RIPPLE',
    roi: '47 cascading failures averted this month.' },
  { rank: 5, pillar: 'Foresight', name: 'Anomaly Correlation Engine', cjpi: 96, priceLow: 149, priceHigh: 449,
    description: 'Multi-stream anomaly correlation: temporal, causal, spatial, and behavioral. Produces ranked incident hypotheses from signals that no single monitor would catch alone.',
    promise: 'My software connects the dots.',
    source: 'S-Tier #007 · VISION',
    roi: 'Reduced false positives by 89%. Real alerts only.' },
  // Security
  { rank: 6, pillar: 'Security', name: 'Adaptive Defense Breeding Suite', cjpi: 95, priceLow: 249, priceHigh: 799,
    description: 'Breeds progressively stronger security defenses via evolutionary pressure against attack simulations. Survivors promoted; failures extinct. Antibody Generator creates targeted countermeasures for novel threats.',
    promise: 'My software\'s defenses evolve.',
    source: 'S-Tier #027 + #023 · IMMUNITY×EVOLUTION',
    roi: 'Day 1 good. Day 90 exceptional. Day 365 nearly impenetrable.' },
  { rank: 7, pillar: 'Security', name: 'Zero-Trust Identity Suite', cjpi: 91, priceLow: 99, priceHigh: 299,
    description: 'Zero-Trust Session Binder + Behavioral Anomaly Detector. Continuous session verification with behavioral trust scoring that flags compromised credentials through usage pattern deviation.',
    promise: 'My software trusts nothing, verifies everything.',
    source: 'S-Tier #082 + #088 · IDENTITY×DEFENSE',
    roi: 'Stopped 3 credential-stuffing attacks that passed MFA.' },
  { rank: 8, pillar: 'Security', name: 'Cyber Defense Suite', cjpi: 97, priceLow: 299, priceHigh: 899,
    description: 'Adaptive IOC Correlation Engine + DDoS Absorption Matrix. Cross-correlates indicators of compromise across temporal, spatial, and contextual dimensions while dynamically absorbing volumetric attacks.',
    promise: 'My infrastructure fights back.',
    source: 'S-SENT03 + S-AEG01 · WATCHTOWER×AEGIS',
    roi: 'Absorbed 340Gbps DDoS while maintaining 99.99% uptime.' },
  // Intelligence
  { rank: 9, pillar: 'Intelligence', name: 'Fleet Intelligence Orchestrator', cjpi: 98, priceLow: 199, priceHigh: 599,
    description: 'Real-time scoring matrix across all AI providers. Weighted round-robin with quality-gated fallback chains. Routes every request to the optimal model based on cost, latency, quality, and availability.',
    promise: 'My software picks the best AI, every time.',
    source: 'S-Tier #002 · NEXUS',
    roi: 'Same quality output, 62% less AI spend.' },
  { rank: 10, pillar: 'Intelligence', name: 'AI Safety Suite', cjpi: 95, priceLow: 149, priceHigh: 449,
    description: 'Hallucination Guard + Prompt Injection Shield. Multi-source verification prevents AI confabulation while multi-layer input sanitization blocks injection, XSS, and prompt manipulation attacks.',
    promise: 'My AI never hallucinates, never gets hijacked.',
    source: 'S-Tier #091 + #100 · DREAM×DEFENSE',
    roi: 'Zero hallucination incidents in production since deployment.' },
  { rank: 11, pillar: 'Intelligence', name: 'AI Cost Intelligence Suite', cjpi: 96, priceLow: 129, priceHigh: 399,
    description: 'Cost-Aware Routing Engine + Token Optimization Engine. Real-time budget tracking with progressive quality degradation under pressure, combined with dynamic token budget optimization across multi-model workflows.',
    promise: 'My software spends less on AI, gets more.',
    source: 'S-Tier #006 + #081 · NEXUS',
    roi: 'Cut monthly AI costs from $12K to $4.2K without quality loss.' },
  { rank: 12, pillar: 'Intelligence', name: 'Cognitive Memory Suite', cjpi: 94, priceLow: 129, priceHigh: 399,
    description: 'Semantic Knowledge Graph + Knowledge Compaction Engine. Graph-based knowledge representation with relationship inference, combined with lossless deduplication and semantic merging for perpetual memory.',
    promise: 'My software remembers everything, forgets nothing.',
    source: 'S-Tier #030 + #079 · BRAIN×MEMORY',
    roi: 'Context retention across 10K+ sessions. Zero knowledge decay.' },
  // Performance
  { rank: 13, pillar: 'Performance', name: 'Performance Surgery Suite', cjpi: 98, priceLow: 149, priceHigh: 499,
    description: 'Hot Path Flame Graph Analyzer + Performance Regression Detector. Identifies CPU bottlenecks with automatic Big-O classification while detecting regressions via baseline comparison — before users notice.',
    promise: 'My software finds and fixes its own bottlenecks.',
    source: 'S-APX01 + S-Tier #076 · APEX×VISION',
    roi: 'P99 latency dropped from 2.1s to 340ms in one scan.' },
  { rank: 14, pillar: 'Performance', name: 'Data Pipeline Resilience Suite', cjpi: 98, priceLow: 149, priceHigh: 449,
    description: 'Stream Backpressure Manager + Event Sourcing Pattern Engine. Reactive backpressure with buffer overflow prevention and consumer lag monitoring, combined with snapshot strategies and projection rebuild optimization.',
    promise: 'My pipelines never drop a message.',
    source: 'S-CND01 + S-CND02 · CONDUIT',
    roi: 'Processing 2.4M events/sec with zero message loss.' },
  // Orchestration
  { rank: 15, pillar: 'Orchestration', name: 'Pipeline Composition Engine', cjpi: 95, priceLow: 99, priceHigh: 299,
    description: 'Composable pipeline builder with typed stage connections and backpressure control. Build any data flow as a sequence of typed, reusable stages with automatic error propagation and retry.',
    promise: 'My software orchestrates anything.',
    source: 'S-Tier #020 · CORTEX',
    roi: 'Replaced 4,000 lines of custom orchestration with 12 pipeline stages.' },
  { rank: 16, pillar: 'Orchestration', name: 'Universal Input Intelligence', cjpi: 97, priceLow: 129, priceHigh: 399,
    description: 'Context Threading Engine + Multi-Modal Interpreter. Maintains conversational context across multi-turn interactions with thread forking, plus unified interpretation of natural language, terminal, structured data, and code.',
    promise: 'My software understands any input format.',
    source: 'S-Tier #031 + #003 · DECODE',
    roi: 'One endpoint handles CLI, API, chat, and file uploads.' },
  // Evolution
  { rank: 17, pillar: 'Evolution', name: 'Self-Evolution Suite', cjpi: 95, priceLow: 199, priceHigh: 599,
    description: 'Mutation Proposal Engine + Shadow Run Environment. Generates, evaluates, and applies system mutations with rollback safety — all tested in sandboxed shadow environments before promotion to production.',
    promise: 'My software evolves itself safely.',
    source: 'S-Tier #021 + #050 · EVOLUTION',
    roi: '143 self-applied optimizations. Zero rollbacks needed.' },
  // Governance
  { rank: 18, pillar: 'Governance', name: 'Governance Shield Suite', cjpi: 94, priceLow: 129, priceHigh: 399,
    description: 'Veto Authority Engine + Self-Audit Loop. Authority-gated veto system for high-impact decisions with escalation protocols, combined with continuous self-audit and policy compliance checking.',
    promise: 'My software governs itself.',
    source: 'S-Tier #033 + #075 · GOVERNANCE',
    roi: 'Every decision auditable. Every override logged. Every policy enforced.' },
  { rank: 19, pillar: 'Governance', name: 'Tamper-Evident Audit Chain', cjpi: 95, priceLow: 99, priceHigh: 349,
    description: 'Hash-chained audit log with merkle-tree batch verification. Cryptographic tamper detection makes every action provable. SOC2, HIPAA, and FedRAMP audit-trail requirements met out of the box.',
    promise: 'My software proves every action.',
    source: 'S-Tier #009 · AUDIT',
    roi: 'Passed SOC2 Type II audit in 3 weeks instead of 6 months.' },
  // Compliance
  { rank: 20, pillar: 'Compliance', name: 'Regulatory Compliance Suite', cjpi: 93, priceLow: 199, priceHigh: 599,
    description: 'Compliance Attestation Generator + Jurisdiction-Aware Router. Automated compliance report generation with evidence chain verification, plus intelligent routing that respects data residency requirements across jurisdictions.',
    promise: 'My software is always audit-ready.',
    source: 'S-Tier #084 + #188 · AUDIT×COMPASS',
    roi: 'Regulatory filings automated. Zero compliance violations in 12 months.' },
];

const PILLARS: Pillar[] = [
  'Resilience', 'Foresight', 'Security', 'Intelligence',
  'Performance', 'Orchestration', 'Evolution', 'Governance', 'Compliance',
];

export function V2LaunchLayers() {
  const [activePillar, setActivePillar] = useState<Pillar | 'All'>('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const visible = useMemo(
    () => activePillar === 'All' ? LAYERS : LAYERS.filter(l => l.pillar === activePillar),
    [activePillar],
  );

  const peakCjpi = useMemo(() => Math.max(...LAYERS.map(l => l.cjpi)), []);

  return (
    <section id="launch-layers" className="mt-16 sm:mt-24 scroll-mt-20">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
          The Lineup
        </p>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          Top 20 Launch Layers
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Curated from 233 core S-Tier entries + 960 vertical Crown Jewels across 12 substrates.
          Pressure-tested against: universal demand, clean Mana attachment, measurable ROI,
          deterministic (zero AI). Standalone jewels and compound suites combined for maximum impact.
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto mb-8 sm:mb-10">
        {[
          { label: 'Launch Layers', value: '20' },
          { label: 'Jewels Evaluated', value: '1,193' },
          { label: 'Pillars', value: String(PILLARS.length) },
          { label: 'Peak CJPI', value: String(peakCjpi) },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm px-3 py-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pillar filter */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-6 sm:mb-8">
        {(['All', ...PILLARS] as const).map(p => {
          const isActive = activePillar === p;
          return (
            <button
              key={p}
              onClick={() => setActivePillar(p)}
              className={cn(
                'px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Layer cards */}
      <div className="space-y-2 sm:space-y-3 max-w-3xl mx-auto">
        {visible.map(layer => {
          const meta = PILLAR_META[layer.pillar];
          const Icon = meta.Icon;
          const isOpen = expanded === layer.rank;

          return (
            <div
              key={layer.rank}
              className={cn(
                'rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm transition-all',
                isOpen && 'border-primary/40 bg-card/70',
              )}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : layer.rank)}
                className="w-full flex items-start gap-3 p-3 sm:p-4 text-left"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 sm:w-10 text-center">
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    #
                  </div>
                  <div className="text-base sm:text-lg font-bold text-foreground tabular-nums">
                    {layer.rank}
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                      {layer.name}
                    </h3>
                    <ChevronDown className={cn(
                      'flex-shrink-0 w-4 h-4 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                    <span className={cn('inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium', meta.tone)}>
                      <Icon className="w-3 h-3" />
                      {layer.pillar}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">·</span>
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                      CJPI {layer.cjpi}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">·</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-primary tabular-nums">
                      ${layer.priceLow}/yr
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {layer.description}
                  </p>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pl-[calc(0.75rem+2rem+0.75rem)] sm:pl-[calc(1rem+2.5rem+0.75rem)] space-y-3 animate-fade-in">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    {layer.description}
                  </p>

                  <blockquote className="border-l-2 border-primary/40 pl-3 italic text-xs sm:text-sm text-foreground/90">
                    "{layer.promise}"
                  </blockquote>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
                    <div className="rounded-md bg-muted/30 px-2.5 py-2">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        Source
                      </div>
                      <div className="font-mono text-foreground/90">{layer.source}</div>
                    </div>
                    <div className="rounded-md bg-muted/30 px-2.5 py-2">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        Pricing
                      </div>
                      <div className="font-mono text-foreground/90 tabular-nums">
                        ${layer.priceLow}<span className="text-muted-foreground">–${layer.priceHigh}/yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-border/40 bg-background/40 px-2.5 py-2">
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      ROI
                    </div>
                    <div className="text-xs sm:text-sm text-foreground/90">{layer.roi}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] sm:text-xs text-muted-foreground/70 mt-8 max-w-xl mx-auto">
        Displayed price is the entry tier. Each layer attaches via Mana at function boundaries —
        no source modification, deterministic execution, zero AI calls in the runtime path.
      </p>
    </section>
  );
}
