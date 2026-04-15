/**
 * Unified Roadmap V2 — Merged Mana Distribution + Strategic Architecture
 * Internal — Governor Eyes Only. Dual-gated via VerticalSecretGate.
 *
 * © CMPSBL® — PromptFluid™ · 2026
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield, Cpu, BarChart3, Zap, Lock, Layers, Package, Eye, AlertTriangle, CheckCircle2, Clock, Target, Rocket, Brain, Activity, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/* ── Shared sub-components ── */

function TickerBar() {
  const trackRef = useRef<HTMLDivElement>(null);

  const items = [
    { name: 'Self-Healing Orchestrator', cjpi: 96, domain: 'IMMUNITY' },
    { name: 'Oracle-Ripple Precognition', cjpi: 96, domain: 'ORACLE×RIPPLE' },
    { name: 'Defense Breeding Suite', cjpi: 95, domain: 'IMMUNITY×EVOLUTION' },
    { name: 'Fleet Intelligence', cjpi: 98, domain: 'NEXUS' },
    { name: 'AI Safety Suite', cjpi: 95, domain: 'DREAM×DEFENSE' },
    { name: 'Performance Surgery', cjpi: 96, domain: 'APEX×VISION' },
    { name: 'Cyber Defense Suite', cjpi: 97, domain: 'WATCHTOWER×AEGIS' },
    { name: 'Autonomous Triage', cjpi: 97, domain: 'MEDIC' },
    { name: 'Self-Evolution Suite', cjpi: 95, domain: 'EVOLUTION' },
    { name: 'Cognitive Memory', cjpi: 94, domain: 'BRAIN×MEMORY' },
  ];

  const doubled = [...items, ...items];

  return (
    <div className="sticky top-0 z-50 overflow-hidden" style={{ background: 'linear-gradient(90deg, #E94989 0%, #A855F7 35%, #3B82F6 70%, #06B6D4 100%)' }}>
      <div className="py-2.5">
        <div ref={trackRef} className="flex animate-ticker whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="text-white text-[13px] font-semibold px-8 opacity-95 tracking-wide">
              {item.name} <span className="opacity-60 mx-1.5">·</span> CJPI {item.cjpi} <span className="opacity-60 mx-1.5">·</span> {item.domain}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ icon: Icon, title, children }: { icon: typeof Cpu; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3.5 mb-5 pb-3.5 border-b-2 border-border">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Card({ accent, gradient, children, className = '' }: { accent?: boolean; gradient?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[14px] p-6 mb-4 ${gradient ? 'bg-primary/[0.04] border border-primary/15' : 'bg-card border border-border'} ${accent ? 'border-l-[3px] border-l-primary' : ''} ${className}`}>
      {children}
    </div>
  );
}

function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-[28px] font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>{s.value}</div>
          <div className="text-[12px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-[13.5px] border-collapse">
        <thead>
          <tr className="bg-muted/60">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-primary/[0.03] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 border-b border-border/50 leading-relaxed ${j === 0 ? 'font-medium text-foreground whitespace-nowrap' : 'text-muted-foreground'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PipelineBlock({ children }: { children: string }) {
  return (
    <div className="my-4 rounded-xl bg-[#1A1D26] p-6 overflow-x-auto">
      <pre className="text-[12.5px] font-mono leading-[1.8] text-[#C8D0DC] whitespace-pre">{children}</pre>
    </div>
  );
}

function EngineCard({ name, description, core }: { name: string; description: string; core?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: core ? 'linear-gradient(90deg, #E94989, #A855F7, #3B82F6, #06B6D4)' : 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }} />
      <p className="font-mono text-[15px] font-bold tracking-wider mt-1 mb-1.5 text-foreground">{name}</p>
      <p className="text-[12px] text-muted-foreground font-medium leading-snug">{description}</p>
    </div>
  );
}

function LayerCard({ rank, name, cjpi, pillar, price, description, tagline, stier, roi, colorClass }: {
  rank: number; name: string; cjpi: number; pillar: string; price: string;
  description: string; tagline: string; stier: string; roi: string; colorClass: string;
}) {
  const borderColors: Record<string, string> = { blue: '#3B7DDD', purple: '#7C5CFC', pink: '#E94989' };
  return (
    <div className="bg-card border border-border rounded-[14px] p-6 mb-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: borderColors[colorClass] || '#3B7DDD' }} />
      <div className="text-[48px] font-extrabold leading-none mb-2 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>#{rank}</div>
      <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary">CJPI {cjpi}</span>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600">{pillar}</span>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-green-500/10 text-green-600">{price}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
      <p className="text-sm font-semibold text-foreground italic mb-2">"{tagline}"</p>
      <p className="text-xs text-muted-foreground">{stier} · ROI: {roi}</p>
    </div>
  );
}

function WeekHeader({ week, title, subtitle }: { week: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3.5 mb-5 pb-3.5 border-b-2 border-border">
      <span className="text-[13px] font-bold text-white px-3.5 py-1.5 rounded-lg whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>WEEK {week}</span>
      <div>
        <p className="text-xl font-bold tracking-tight text-foreground">{title}</p>
        <p className="text-[13px] text-muted-foreground font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function TaskItem({ done, children }: { done?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2 text-sm text-muted-foreground">
      <div className={`w-[18px] h-[18px] rounded-[5px] shrink-0 mt-0.5 flex items-center justify-center ${done ? 'bg-green-500 border-green-500' : 'border-2 border-border'}`}>
        {done && <span className="text-white text-[11px] font-bold">✓</span>}
      </div>
      <span className={done ? 'line-through text-muted-foreground/60' : ''}>{children}</span>
    </div>
  );
}

function DeliverableTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-green-600 bg-green-500/10 border border-green-500/25 rounded-md px-2.5 py-0.5 mr-1.5">
      {children}
    </span>
  );
}

function TimelineItem({ date, title, description, parallel, future }: { date: string; title: string; description: string; parallel?: string; future?: boolean }) {
  return (
    <div className="relative pl-7 pb-6 last:pb-0">
      <div className={`absolute left-0 top-4 w-3.5 h-3.5 rounded-full border-[3px] ${future ? 'bg-background border-purple-500' : 'border-background'}`} style={!future ? { background: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' } : {}} />
      <p className="font-mono text-[13px] font-semibold text-primary mb-1">{date}</p>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
      {parallel && <p className="text-[12px] text-purple-500 font-semibold italic mt-1">{parallel}</p>}
    </div>
  );
}

/* ── Main Page ── */

export default function ManaDistributionDoc() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Unified Roadmap V2 — CMPSBL®</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <TickerBar />

        {/* Header */}
        <header className="max-w-[900px] mx-auto px-6 sm:px-8 pt-14 pb-10 text-center">
          <div className="w-[52px] h-[52px] rounded-[14px] mx-auto mb-6 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg" style={{ background: 'linear-gradient(90deg, #E94989, #A855F7, #3B82F6, #06B6D4)', boxShadow: '0 4px 20px rgba(168,85,247,0.3)' }}>
            C
          </div>
          <h1 className="text-[36px] sm:text-[42px] font-extrabold tracking-tighter bg-clip-text text-transparent mb-2" style={{ backgroundImage: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>
            Unified Roadmap V2
          </h1>
          <p className="text-[15px] text-muted-foreground mb-5">Internal — Strategic Architecture · April 15, 2026</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">U.S. App. 64/029,678</span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">U.S. App. 64/031,637</span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">Version 2.0.0</span>
          </div>
        </header>

        <main className="max-w-[900px] mx-auto px-6 sm:px-8 pb-20">

          {/* ═══ Strategic Objective ═══ */}
          <SectionBlock icon={Target} title="Strategic Objective">
            <Card gradient>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Unify all substrate output into one Store, one pipeline, one Ascension flow. Vertical substrates become internal discovery engines. COMPILER builds layers. MERCHANT curates. ECONOMY prices. Users buy layers as Ascension enhancements — never seeing the internal machinery.
              </p>
              <p className="text-sm font-semibold text-foreground">
                Core Insight: CMPSBL sells layers, not features. The entire system is layer composition at different price points. Developers consume layers, create layers, or own a factory that produces layers. Everything compounds.
              </p>
            </Card>
            <StatRow stats={[
              { value: '12', label: 'Internal Engines' },
              { value: '1', label: 'Pipeline' },
              { value: '1', label: 'Store' },
              { value: '∞', label: 'Layers' },
            ]} />
          </SectionBlock>

          {/* ═══ The Layer Model ═══ */}
          <SectionBlock icon={Layers} title="The Layer Model">
            <Card>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A layer is a Mana-wrapped capability that attaches to user code at function boundaries — no API calls, no source modification. Layers merge with host code before the 40-Primitive Ascension collision, producing richer and more accurate output.
              </p>
            </Card>
            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Three Relationships with the System</h3>
            <DataTable
              headers={['Role', 'What They Do', 'Revenue']}
              rows={[
                ['Consumer', 'Scans code free, buys layers to enhance it', 'Per-layer or bundle'],
                ['Creator', 'Builds layers with @cmpsbl/sdk, sells through Store', 'Revenue share (70/30)'],
                ['Factory Owner', 'Owns a compounding layer factory on their own domain', 'Enterprise contract'],
              ]}
            />
            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Three Revenue Tiers</h3>
            <DataTable
              headers={['Tier', 'What They Get', 'Price']}
              rows={[
                ['Free Ascension', 'Upload → Analyze → Export. Full product, no paywall. Every scan feeds the substrate.', '$0'],
                ['Paid Layers', 'Buy layers from the Store. Crown Jewels, COMPILER Suites, Showroom, Community. ECONOMY auto-prices.', '$10–$249'],
                ['Enterprise', 'Compounding layer factory on your domain. Custom primitives, 200 base layers, 80 S-Tier, autonomous everything. GENESIS spins it up in <5 min.', '$25K–$500K/yr'],
              ]}
            />
          </SectionBlock>

          {/* ═══ Five Behavioral Engines ═══ */}
          <SectionBlock icon={Cpu} title="The Five Behavioral Engines">
            <Card>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The heart of the algorithm. These five engines are specifically tuned for the output that Ascension's collision and attachment protocols produce. Together they form the deterministic behavioral core that makes Ascension work. Without any one of them, the pipeline breaks. They are not optional primitives — they are the foundation.
              </p>
            </Card>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <EngineCard core name="DEFENSE" description="Security hardening. Scans collision output for vulnerability surfaces and hardens attachment boundaries before export." />
              <EngineCard core name="CORTEX" description="Runtime orchestration. Manages execution context across all discovered capabilities during collision." />
              <EngineCard core name="NEXUS" description="Cross-capability linking. Resolves dependency graphs between discovered layers and ensures coherent output." />
              <EngineCard core name="BRAIN" description="Pattern recognition. Learns from every scan to improve discovery accuracy. Gets smarter with every Ascension run." />
              <EngineCard core name="ORACLE" description="Predictive analysis. Forecasts capability interactions and downstream effects before they manifest in output." />
            </div>
            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">Why These Five Matter</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Every layer that flows through Ascension — whether from the Store, COMPILER, SDK developers, or Enterprise substrates — is processed by these five engines. They are the reason Ascension produces deterministic, coherent, auditable output rather than arbitrary code merging. The collision matrix runs 40 Primitives, but these five govern the behavioral logic of how collisions resolve.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DEFENSE ensures nothing exits the pipeline with an exploitable surface. CORTEX orchestrates which capabilities activate in what order. NEXUS resolves conflicts when multiple layers claim the same function boundary. BRAIN learns from every run to sharpen future discovery. ORACLE predicts what will happen when layers interact — before it happens.
              </p>
            </Card>
            <div className="mt-4 rounded-[10px] p-4 flex items-start gap-3 border" style={{ background: 'linear-gradient(135deg, rgba(233,73,137,0.05), rgba(245,158,11,0.05))', borderColor: 'rgba(245,158,11,0.25)' }}>
              <AlertTriangle className="w-[18px] h-[18px] text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Architecture-critical.</strong> Do not modify, rename, merge, or deprecate. These five engines are load-bearing to the entire Ascension pipeline, the Mana attachment protocol, and every downstream system (COMPILER, MERCHANT, ECONOMY, Memory Stream). Any change to their interfaces or behavioral contracts would cascade across the full substrate. They are patented architecture (U.S. App. 64/029,678) and must be preserved as-is.
              </p>
            </div>
          </SectionBlock>

          {/* ═══ The Recursive Loop ═══ */}
          <SectionBlock icon={Activity} title="The Recursive Loop">
            <Card>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Every interaction with the system makes the system smarter. This is not a feature — <strong className="text-foreground">it is the product.</strong>
              </p>
            </Card>
            <PipelineBlock>{`Free scan → Ascension processes code
  → BRAIN + SYSTEM learn from the scan
  → Discovery engine gets smarter
  → Memory Stream produces better discoveries
  → COMPILER builds better layers
  → Store inventory improves
  → More developers scan (attracted by better layers)
  → More scans feed BRAIN + SYSTEM
  → Cycle compounds ∞`}</PipelineBlock>
            <Card accent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Free scans are not a loss leader.</strong> They are the growth engine AND the training data. A competitor would need to replicate the substrate, the patents, AND the compounding data from every scan that has already run.
              </p>
            </Card>
          </SectionBlock>

          {/* ═══ Live Layer Ticker ═══ */}
          <SectionBlock icon={Rocket} title="Live Layer Ticker">
            <Card>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Replace the scrolling quotes banner on cmpsbl.com with a <strong className="text-foreground">live inventory ticker</strong> showing this month's top layers from the Store. Real-time proof that the substrate is producing.
              </p>
            </Card>
            <DataTable
              headers={['Audience', 'Effect']}
              rows={[
                ['New users', 'Creates curiosity — "what are these, what\'s CJPI?" Pulls them into the scan.'],
                ['Returning users', 'Shows what\'s new. Changes as COMPILER builds, MERCHANT curates, ECONOMY prices.'],
                ['Social screenshots', 'Proof of life. Active marketplace, not a landing page mockup.'],
                ['Enterprise prospects', '"PayPal\'s Substrate just discovered Credit Card Oracle — Available now."'],
              ]}
            />
          </SectionBlock>

          {/* ═══ Top 20 Launch Layers ═══ */}
          <SectionBlock icon={Zap} title="Top 20 Launch Layers">
            <p className="text-sm text-muted-foreground mb-2">Curated from 233 core S-Tier entries + 960 vertical Crown Jewels across 12 substrates. Pressure-tested against: universal demand, clean Mana attachment, measurable ROI, deterministic (zero AI). Standalone jewels and compound suites combined for maximum impact.</p>
            <StatRow stats={[
              { value: '20', label: 'Launch Layers' },
              { value: '1,193', label: 'Jewels Evaluated' },
              { value: '8', label: 'Pillars' },
              { value: '98', label: 'Peak CJPI' },
            ]} />

            {/* ── Resilience Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3B82F6' }} />
              Resilience Pillar
            </h3>
            <LayerCard rank={1} name="Self-Healing Orchestrator" cjpi={96} pillar="Resilience" price="$149–$499/yr"
              description="Auto-detects failures, selects lowest-blast-radius repair strategy, executes recovery, and learns from outcomes. Attaches at function boundaries via Mana. No source modification."
              tagline="My software recovers itself." stier="S-Tier #008 · IMMUNITY" roi='"How much does one hour of downtime cost you?"' colorClass="blue" />
            <LayerCard rank={2} name="Autonomous Triage Engine" cjpi={97} pillar="Resilience" price="$129–$399/yr"
              description="Medical-grade triage protocol for distributed systems. Differential diagnosis with automated repair dispatch. Prioritizes by blast radius, dependency depth, and user impact."
              tagline="My software diagnoses itself." stier="S-Tier #004 · MEDIC" roi='"MTTR dropped from 47 minutes to 90 seconds."' colorClass="blue" />
            <LayerCard rank={3} name="Distributed Consensus Suite" cjpi={96} pillar="Resilience" price="$99–$349/yr"
              description="Consensus Heartbeat Protocol + Quorum Negotiator. Gossip-style liveness detection with Byzantine-fault-tolerant negotiation and split-brain prevention. Your services agree even when the network doesn't."
              tagline="My software survives network partitions." stier="S-Tier #005 + #083 · NERVE" roi='"Zero split-brain incidents across 14 regions."' colorClass="blue" />

            {/* ── Foresight Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#7C5CFC' }} />
              Foresight Pillar
            </h3>
            <LayerCard rank={4} name="Oracle-Ripple Precognition Chain" cjpi={96} pillar="Foresight" price="$199–$599/yr"
              description="Fuses predictive forecasting with causal propagation to predict downstream failures before they occur. Auto-executes preemptive actions (scale, reroute, throttle, isolate) before impact."
              tagline="My software prevents problems." stier="S-Tier #024 · ORACLE×RIPPLE" roi='"47 cascading failures averted this month."' colorClass="purple" />
            <LayerCard rank={5} name="Anomaly Correlation Engine" cjpi={96} pillar="Foresight" price="$149–$449/yr"
              description="Multi-stream anomaly correlation: temporal, causal, spatial, and behavioral. Produces ranked incident hypotheses from signals that no single monitor would catch alone."
              tagline="My software connects the dots." stier="S-Tier #007 · VISION" roi='"Reduced false positives by 89%. Real alerts only."' colorClass="purple" />

            {/* ── Security Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E94989' }} />
              Security Pillar
            </h3>
            <LayerCard rank={6} name="Adaptive Defense Breeding Suite" cjpi={95} pillar="Security" price="$249–$799/yr"
              description="Breeds progressively stronger security defenses via evolutionary pressure against attack simulations. Survivors promoted; failures extinct. Antibody Generator creates targeted countermeasures for novel threats."
              tagline="My software's defenses evolve." stier="S-Tier #027 + #023 · IMMUNITY×EVOLUTION" roi="Day 1 good. Day 90 exceptional. Day 365 nearly impenetrable." colorClass="pink" />
            <LayerCard rank={7} name="Zero-Trust Identity Suite" cjpi={91} pillar="Security" price="$99–$299/yr"
              description="Zero-Trust Session Binder + Behavioral Anomaly Detector. Continuous session verification with behavioral trust scoring that flags compromised credentials through usage pattern deviation."
              tagline="My software trusts nothing, verifies everything." stier="S-Tier #082 + #088 · IDENTITY×DEFENSE" roi='"Stopped 3 credential-stuffing attacks that passed MFA."' colorClass="pink" />
            <LayerCard rank={8} name="Cyber Defense Suite" cjpi={97} pillar="Security" price="$299–$899/yr"
              description="Adaptive IOC Correlation Engine + DDoS Absorption Matrix. Cross-correlates indicators of compromise across temporal, spatial, and contextual dimensions while dynamically absorbing volumetric attacks."
              tagline="My infrastructure fights back." stier="S-SENT03 + S-AEG01 · WATCHTOWER×AEGIS" roi='"Absorbed 340Gbps DDoS while maintaining 99.99% uptime."' colorClass="pink" />

            {/* ── Intelligence Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#06B6D4' }} />
              Intelligence Pillar
            </h3>
            <LayerCard rank={9} name="Fleet Intelligence Orchestrator" cjpi={98} pillar="Intelligence" price="$199–$599/yr"
              description="Real-time scoring matrix across all AI providers. Weighted round-robin with quality-gated fallback chains. Routes every request to the optimal model based on cost, latency, quality, and availability."
              tagline="My software picks the best AI, every time." stier="S-Tier #002 · NEXUS" roi='"Same quality output, 62% less AI spend."' colorClass="blue" />
            <LayerCard rank={10} name="AI Safety Suite" cjpi={95} pillar="Intelligence" price="$149–$449/yr"
              description="Hallucination Guard + Prompt Injection Shield. Multi-source verification prevents AI confabulation while multi-layer input sanitization blocks injection, XSS, and prompt manipulation attacks."
              tagline="My AI never hallucinates, never gets hijacked." stier="S-Tier #091 + #100 · DREAM×DEFENSE" roi='"Zero hallucination incidents in production since deployment."' colorClass="blue" />
            <LayerCard rank={11} name="AI Cost Intelligence Suite" cjpi={96} pillar="Intelligence" price="$129–$399/yr"
              description="Cost-Aware Routing Engine + Token Optimization Engine. Real-time budget tracking with progressive quality degradation under pressure, combined with dynamic token budget optimization across multi-model workflows."
              tagline="My software spends less on AI, gets more." stier="S-Tier #006 + #081 · NEXUS" roi='"Cut monthly AI costs from $12K to $4.2K without quality loss."' colorClass="blue" />
            <LayerCard rank={12} name="Cognitive Memory Suite" cjpi={94} pillar="Intelligence" price="$129–$399/yr"
              description="Semantic Knowledge Graph + Knowledge Compaction Engine. Graph-based knowledge representation with relationship inference, combined with lossless deduplication and semantic merging for perpetual memory."
              tagline="My software remembers everything, forgets nothing." stier="S-Tier #030 + #079 · BRAIN×MEMORY" roi='"Context retention across 10K+ sessions. Zero knowledge decay."' colorClass="blue" />

            {/* ── Performance Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
              Performance Pillar
            </h3>
            <LayerCard rank={13} name="Performance Surgery Suite" cjpi={98} pillar="Performance" price="$149–$499/yr"
              description="Hot Path Flame Graph Analyzer + Performance Regression Detector. Identifies CPU bottlenecks with automatic Big-O classification while detecting regressions via baseline comparison — before users notice."
              tagline="My software finds and fixes its own bottlenecks." stier="S-APX01 + S-Tier #076 · APEX×VISION" roi='"P99 latency dropped from 2.1s to 340ms in one scan."' colorClass="blue" />
            <LayerCard rank={14} name="Data Pipeline Resilience Suite" cjpi={98} pillar="Performance" price="$149–$449/yr"
              description="Stream Backpressure Manager + Event Sourcing Pattern Engine. Reactive backpressure with buffer overflow prevention and consumer lag monitoring, combined with snapshot strategies and projection rebuild optimization."
              tagline="My pipelines never drop a message." stier="S-CND01 + S-CND02 · CONDUIT" roi='"Processing 2.4M events/sec with zero message loss."' colorClass="blue" />

            {/* ── Orchestration Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
              Orchestration Pillar
            </h3>
            <LayerCard rank={15} name="Pipeline Composition Engine" cjpi={95} pillar="Orchestration" price="$99–$299/yr"
              description="Composable pipeline builder with typed stage connections and backpressure control. Build any data flow as a sequence of typed, reusable stages with automatic error propagation and retry."
              tagline="My software orchestrates anything." stier="S-Tier #020 · CORTEX" roi='"Replaced 4,000 lines of custom orchestration with 12 pipeline stages."' colorClass="blue" />
            <LayerCard rank={16} name="Universal Input Intelligence" cjpi={97} pillar="Orchestration" price="$129–$399/yr"
              description="Context Threading Engine + Multi-Modal Interpreter. Maintains conversational context across multi-turn interactions with thread forking, plus unified interpretation of natural language, terminal, structured data, and code."
              tagline="My software understands any input format." stier="S-Tier #031 + #003 · DECODE" roi='"One endpoint handles CLI, API, chat, and file uploads."' colorClass="blue" />

            {/* ── Evolution Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#8B5CF6' }} />
              Evolution Pillar
            </h3>
            <LayerCard rank={17} name="Self-Evolution Suite" cjpi={95} pillar="Evolution" price="$199–$599/yr"
              description="Mutation Proposal Engine + Shadow Run Environment. Generates, evaluates, and applies system mutations with rollback safety — all tested in sandboxed shadow environments before promotion to production."
              tagline="My software evolves itself safely." stier="S-Tier #021 + #050 · EVOLUTION" roi='"143 self-applied optimizations. Zero rollbacks needed."' colorClass="purple" />

            {/* ── Governance Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#EC4899' }} />
              Governance Pillar
            </h3>
            <LayerCard rank={18} name="Governance Shield Suite" cjpi={94} pillar="Governance" price="$129–$399/yr"
              description="Veto Authority Engine + Self-Audit Loop. Authority-gated veto system for high-impact decisions with escalation protocols, combined with continuous self-audit and policy compliance checking."
              tagline="My software governs itself." stier="S-Tier #033 + #075 · GOVERNANCE" roi='"Every decision auditable. Every override logged. Every policy enforced."' colorClass="pink" />
            <LayerCard rank={19} name="Tamper-Evident Audit Chain" cjpi={95} pillar="Governance" price="$99–$349/yr"
              description="Hash-chained audit log with merkle-tree batch verification. Cryptographic tamper detection makes every action provable. SOC2, HIPAA, and FedRAMP audit-trail requirements met out of the box."
              tagline="My software proves every action." stier="S-Tier #009 · AUDIT" roi='"Passed SOC2 Type II audit in 3 weeks instead of 6 months."' colorClass="pink" />

            {/* ── Compliance Pillar ── */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#14B8A6' }} />
              Compliance Pillar
            </h3>
            <LayerCard rank={20} name="Regulatory Compliance Suite" cjpi={93} pillar="Compliance" price="$199–$599/yr"
              description="Compliance Attestation Generator + Jurisdiction-Aware Router. Automated compliance report generation with evidence chain verification, plus intelligent routing that respects data residency requirements across jurisdictions."
              tagline="My software is always audit-ready." stier="S-Tier #084 + #188 · AUDIT×COMPASS" roi='"Regulatory filings automated. Zero compliance violations in 12 months."' colorClass="blue" />
          </SectionBlock>

          {/* ═══ Mana Distribution Channel ═══ */}
          <SectionBlock icon={Package} title="Mana as Distribution Channel">
            <Card gradient>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Mana becomes the <strong className="text-foreground">distribution channel</strong> for all substrate-produced software. Instead of selling standalone products that lack context, every item in the Showroom, Store, and Crown Jewel vault can be <strong className="text-foreground">attached to user code</strong> during the Ascension pipeline — giving substrate-produced software a concrete use case as capability add-ons.
              </p>
            </Card>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Pipeline Flow</h3>
            <PipelineBlock>{`┌─────────────────────────────────────────────────────────┐
│                ASCENSION V2 PIPELINE                    │
│                                                         │
│  Step 1: UPLOAD                                         │
│  ├─ User drops source files / pastes code               │
│  ├─ Fingerprint computed (FNV-1a structural hash)       │
│  └─ Candidate registered in artifact_registry           │
│                                                         │
│  Step 2: ENHANCE (Optional — Skippable)                 │
│  ├─ Mode A: SDK-Built Software                          │
│  │   └─ Developer uploads their own @cmpsbl/sdk-built   │
│  │      package that integrates via Mana (no API)       │
│  ├─ Mode B: Substrate Store Add-Ons (Future)            │
│  │   └─ Browse purchasable capabilities from:           │
│  │      • Crown Jewels (50+ substrate-native algorithms)│
│  │      • Memory Stream discoveries (COMPILER-built)    │
│  │      • Showroom products (curated substrate output)  │
│  │   └─ Selected items are Mana-wrapped and merged      │
│  │      with user code BEFORE Ascension collision       │
│  └─ Skip → proceeds with raw user code only             │
│                                                         │
│  Step 3: ANALYZE (Automated)                            │
│  ├─ 40-Primitive collision matrix runs against:         │
│  │   USER CODE + any Mana-attached enhancements         │
│  ├─ Dedup engine collapses to top 4-7 unique caps       │
│  ├─ Auto-lock (no manual step)                          │
│  └─ Audit chain records all operations                  │
│                                                         │
│  Step 4: RESULTS                                        │
│  ├─ Single wrapped cmpsbl.ts export                     │
│  ├─ Audit chain integrity badge (SHA-256)               │
│  ├─ Capability summary                                  │
│  └─ Post-Results Upsell: "Enhance Further"              │
└─────────────────────────────────────────────────────────┘`}</PipelineBlock>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Why Step 2 (Before Ascension)</h3>
            <Card>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mana-attached software is merged with user code <strong className="text-foreground">before</strong> the 40-Primitive collision. The primitives collide against the <strong className="text-foreground">combined</strong> codebase, producing richer and more accurate capability discovery. An add-on that provides DEFENSE capabilities will surface as a capability in the user's ascended output — not as a separate download.
              </p>
            </Card>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Primitive Roles in the Supply Chain</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="text-sm font-bold text-foreground">ECONOMY</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Automatic pricing engine. Sets prices based on CJPI, tier, demand, and complexity. Self-regulating marketplace.</p>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="text-sm font-bold text-foreground">MERCHANT</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Curation & catalog governance. Quality gate, suite composition, seasonal drops, gap analysis.</p>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="text-sm font-bold text-foreground">COMPILER</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Autonomous software factory. Memory Stream → packaged layers → suites. Builds Security Suite, Intelligence Suite, Resilience Suite.</p>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="text-sm font-bold text-foreground">SDK + DREAM + EVOLUTION</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Developer capability loop. SDK packages enhanced with substrate primitives before flowing into Step 2.</p>
              </Card>
            </div>
          </SectionBlock>

          {/* ═══ Already Complete — Phase 0 ═══ */}
          <SectionBlock icon={CheckCircle2} title="Already Complete — Phase 0">
            <Card>
              {[
                'Mana engine core (engine, lex, loader, manifest-consumer, findings-bridge, config, types)',
                'Ascension V2 pipeline (Upload → Enhance → Analyze → Results)',
                'ManaLab wizard UI (Upload → Merge → Lex → Attach → Export)',
                'Shield landing page + Lex Registry backend',
                'Lex Registry — lex_registry table, SHA-256 lookups, audit triggers, edge functions',
                'Vertical substrates moved behind dual-gate access (URL param + PIN)',
                'Prime Vault architecture documented',
                'ECONOMY/MERCHANT roles defined in distribution spec',
                '13 substrates operational (first: 3,000 hrs; subsequent: ~5 min via GENESIS)',
              ].map((item, i) => (
                <TaskItem key={i} done>{item}</TaskItem>
              ))}
            </Card>
          </SectionBlock>

          {/* ═══ Technical Substrate — Component Audit ═══ */}
          <SectionBlock icon={GitBranch} title="Technical Substrate — Component Audit">
            <p className="text-sm text-muted-foreground mb-4">
              Full inventory of the codebase as of April 15, 2026. Every component is classified as KEEP, RETIRE, or BUILD, and assigned to a version phase (V1 / V2 / V3).
            </p>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Mana Engine — 4,439 LOC (All KEEP)</h3>
            <DataTable
              headers={['File', 'LOC', 'V1 Role']}
              rows={[
                ['engine.ts', '1,593', 'Primary engine — attach/detach/scan/proof'],
                ['session.ts', '727', 'Session-scoped isolation, multi-module safety'],
                ['findings-bridge.ts', '800', 'Ascension→Mana convergence (built but unwired — wire in V1)'],
                ['types.ts', '597', 'All 92 capabilities + contracts — type foundation'],
                ['manifest-consumer.ts', '203', 'Ascension manifest→config auto-deploy bridge'],
                ['registry-bridge.ts', '195', 'Lex Registry→runtime enforcement (Shield integration)'],
                ['lex.ts', '110', 'Governance verdicts — core conscience'],
                ['config.ts', '98', 'Declarative config'],
              ]}
            />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Ascension Engine — 41 Files</h3>
            <p className="text-sm text-muted-foreground mb-3">15 files are V1-essential (core scanner, collision, CJPI scoring, dedup, quality gate, fingerprinting, effect injection, chain injection, contract extraction, polyglot export). 15 files are V2 (weights, advanced scoring, drift detection, feedback loop, BRAIN integration). 5 files are V3 (federated scanner, capability expansion, primitive learning).</p>
            <StatRow stats={[
              { value: '15', label: 'V1 Core' },
              { value: '15', label: 'V2 Enhanced' },
              { value: '5', label: 'V3 Future' },
              { value: '0', label: 'Retired' },
            ]} />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">V1 Hardening — Files That Must Be Rebuilt</h3>
            <p className="text-sm text-muted-foreground mb-3">Lost in the April 15 restore. These existed as in-session edits that were never committed as standalone files.</p>
            <DataTable
              headers={['Module', 'Path', 'Status', 'Depends On']}
              rows={[
                ['Audit Chain', 'src/core/audit/auditChain.ts', 'MUST BUILD', 'clocklessEpoch.ts'],
                ['Fingerprint Gate', 'src/core/boot/fingerprintGate.ts', 'MUST BUILD', 'FNV-1a (inline)'],
                ['Safe Detach', 'src/lib/mana/detach-safe.ts', 'MUST BUILD', 'MANA_LAYER_TAG from types'],
                ['Extended Lex', 'src/lib/mana/lex.ts (enhance)', 'MUST BUILD', 'Existing lex.ts'],
                ['VISION→LEX Bridge', 'src/lib/mana/vision-lex-bridge.ts', 'V2', 'Lex extended'],
                ['Phone-Home', 'src/lib/mana/phone-home.ts', 'V2', 'RELAY module'],
              ]}
            />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">V1 Pipeline Flowchart</h3>
            <p className="text-sm text-muted-foreground mb-3">The complete four-step pipeline from user code to export. Fingerprint Gate blocks tampered input. Lex Governance skips denied capabilities. Everything else flows through deterministically.</p>
            <PipelineBlock>{`Step 1: Upload + Fingerprint
  User Code → Language Detection → Function Boundary Extraction
  → Structural Fingerprint (FNV-1a) → Fingerprint Gate Verify
  → invalid: BLOCKED (Tampered)  |  valid/suspect: Register Candidate

Step 2: Discovery + Collision
  Collide with 40 Primitives → Multi-Chain Depth 2-8 → CJPI Scoring
  → Deduplication → Quality Gate → Confidence Banding → Audit Chain Entry

Step 3: Ascend + Mana Attach
  Batch Ascend Capabilities → Lex Governance Check
  → deny: Skip Capability  |  allow: Deterministic Wrapper Stack
  → GATE → VALIDATE → FAILSAFE → Original Function (Layer 1)
  → OBSERVE → ANALYZE → SHA-256 Proof → Audit Chain (Merkle Linked)

Step 4: Export + Proof
  Generate ZIP Bundle:
  ├─ /original/    — Untouched Source
  ├─ /layer2/      — Mana Wrapped
  ├─ receipt.json   — SHA-256 Proof
  └─ /activation/  — Guide`}</PipelineBlock>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Mana Wrapper Ordering — Layer 2 Execution Model</h3>
            <p className="text-sm text-muted-foreground mb-3">When Mana wraps a function, capabilities execute in a strict deterministic order around the original code. The original function (Layer 1) is never modified — SHA-256 verified.</p>
            <PipelineBlock>{`INCOMING CALL
      │
      ▼
┌─── GATE PHASE (outermost) ─────────────────────────┐
│  defense_gate → access_controller → governance_hook │
│  → identity_auth_gate → evolution_patch             │
│  [Any DENY → call blocked, returns early]           │
└────────────────────┬────────────────────────────────┘
                     │ (allowed)
                     ▼
┌─── VALIDATE PHASE ─────────────────────────────────┐
│  brain_confidence_gate → input_sanitizer            │
│  → payload_validator                                │
│  [Annotates context, may DENY]                      │
└────────────────────┬────────────────────────────────┘
                     ▼
┌─── FAILSAFE PHASE ─────────────────────────────────┐
│  circuit_breaker → timeout_guard → retry_handler    │
│  → fallback_provider → immunity_quarantine          │
│  [Wraps execution with resilience]                  │
└────────────────────┬────────────────────────────────┘
                     ▼
╔════════════════════════════════════════════════════╗
║      ORIGINAL FUNCTION (Layer 1)                  ║
║      Source code NEVER modified                   ║
║      SHA-256 verified                             ║
╚════════════════════════════════════════════════════╝
                     │ (return value)
                     ▼
┌─── OBSERVE PHASE ──────────────────────────────────┐
│  beacon_telemetry → audit_trail                    │
│  [Non-blocking, records execution data]            │
└────────────────────┬────────────────────────────────┘
                     ▼
┌─── ANALYZE PHASE (innermost) ──────────────────────┐
│  anomaly_detector → threat_scorer                  │
│  [Scores output, flags anomalies]                  │
└────────────────────┬────────────────────────────────┘
                     ▼
RETURN TO CALLER`}</PipelineBlock>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">V1 Active Capability Families — 25 of 92</h3>
            <p className="text-sm text-muted-foreground mb-3">Only these are wired in V1. The remaining 67 exist in types.ts but activate in V2/V3.</p>
            <DataTable
              headers={['Phase', 'Capabilities', 'Behavior']}
              rows={[
                ['GATE', 'defense_gate, access_controller, access_rbac_gate, access_api_key_check, governance_hook, identity_auth_gate, identity_session_bind, evolution_patch, evolution_rollback', 'Blocking — any DENY stops execution'],
                ['VALIDATE', 'brain_confidence_gate, brain_context_guard, brain_reasoning_trace, input_sanitizer, payload_validator', 'Check + annotate context, may DENY'],
                ['FAILSAFE', 'circuit_breaker, timeout_guard, retry_handler, fallback_provider, immunity_quarantine, immunity_self_heal, immunity_vaccination', 'Wraps execution with resilience'],
                ['OBSERVE', 'beacon_telemetry, audit_trail', 'Non-blocking telemetry'],
                ['ANALYZE', 'anomaly_detector, threat_scorer', 'Post-execution scoring'],
              ]}
            />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">NERVE + RIPPLE Retirement</h3>
            <p className="text-sm text-muted-foreground mb-3">Do NOT delete from types.ts — flag as deprecated. Replacements mapped:</p>
            <DataTable
              headers={['Retiring', 'Replacement', 'Reason']}
              rows={[
                ['nerve_priority_router', 'relay_sync', 'RELAY handles routing with delivery guarantees'],
                ['nerve_backpressure', 'reflex_circuit_breaker', 'Circuit breaker registry handles backpressure'],
                ['ripple_impact_tracer', 'atlas_dependency_map', 'ATLAS traces impact chains'],
                ['ripple_dependency_check', 'atlas_complexity_check', 'ATLAS covers dependency analysis'],
              ]}
            />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Protected — Do Not Touch</h3>
            <div className="mt-2 rounded-[10px] p-4 flex items-start gap-3 border" style={{ background: 'linear-gradient(135deg, rgba(233,73,137,0.05), rgba(245,158,11,0.05))', borderColor: 'rgba(245,158,11,0.25)' }}>
              <AlertTriangle className="w-[18px] h-[18px] text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[13px] text-muted-foreground leading-relaxed space-y-1">
                <p>types.ts (92 capability definitions) — backward compat, retire via deprecation flags only.</p>
                <p>pf-proprietary-evolution edge function — working discovery + ascend logic.</p>
                <p>artifact_registry table — production data.</p>
                <p>lex_registry + events tables — Shield infrastructure.</p>
                <p>5 behavioral engines in runtime — stable, tested.</p>
                <p>159-primitive engine map — canonical classification.</p>
                <p>Export pipeline (language-postprocessor) — polyglot support.</p>
              </div>
            </div>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">V1 Acceptance Criteria</h3>
            <DataTable
              headers={['Criteria', 'Target']}
              rows={[
                ['TypeScript build', '0 errors'],
                ['Stress tests', '70+ assertions pass'],
                ['Wiring integration tests', '19+ assertions pass'],
                ['Audit chain integrity', 'verifyChainIntegrity() returns valid'],
                ['Fingerprint gate', 'Invalid module blocked, suspect limited'],
                ['Safe detach', 'No mid-execution detach, post-verify clean'],
                ['Export ZIP', 'Contains original/, layer2/, receipt.json'],
                ['Lex verdicts', 'Deterministic — same input = same output'],
              ]}
            />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">V2 / V3 Enhancement Roadmap</h3>
            <DataTable
              headers={['Version', 'Enhancement', 'Key Components']}
              rows={[
                ['V2', 'VISION→LEX Bridge', 'Progressive escalation from monitoring to governance'],
                ['V2', 'Phone-Home + RELAY', 'Outbound telemetry with privacy controls'],
                ['V2', 'Advanced Scoring', 'ascension-weights.ts, compatibility-scoring.ts — tuning from real data'],
                ['V2', 'Drift Detection', 'semantic-drift.ts, delta-measurement.ts — baseline from V1 runs'],
                ['V2', 'Feedback Loop', 'feedback-loop.ts, brain-learning-bridge.ts — self-improvement'],
                ['V2', 'CONSCIENCE + COMPASS', 'Ethics gating + intent validation'],
                ['V3', 'Federated Scanner', 'Multi-repo scanning across codebases'],
                ['V3', 'Hardware Export', 'VHDL/Verilog synthesis for silicon deployment'],
                ['V3', 'CLM Integration', 'Primitive learning — learned behaviors from usage'],
                ['V3', 'Registry Federation', 'Enterprise private registries'],
              ]}
            />

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">Live Internal Routes (Governor-Gated)</h3>
            <p className="text-sm text-muted-foreground mb-3">All routes are disallow: true in route registry + noindex, nofollow via VerticalSecretGate. Hidden from Google.</p>
            <DataTable
              headers={['Route', 'Content', 'Access']}
              rows={[
                ['/roadmap/substrate?1952=cmpsbl', '4-week build roadmap (this document, live)', 'Dual-gate + PIN'],
                ['/docs/internal/mana-distribution?1952=cmpsbl', 'Mana Distribution Channel Architecture spec', 'Dual-gate + PIN'],
                ['/[vertical]?1952=cmpsbl', 'Vertical substrate access (12 engines)', 'Dual-gate + PIN'],
              ]}
            />
          </SectionBlock>

          {/* ═══ Vertical Substrates ═══ */}
          <SectionBlock icon={Lock} title="Vertical Substrates — Internal Engines">
            <Card gradient>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Decision — April 15, 2026</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The 12 vertical substrates (Cyber, Fintech, Robotics, Healthcare, etc.) are <strong className="text-foreground">internal discovery engines</strong>, not user-facing products. They do not get their own subdomains, SSO configurations, stores, or showrooms.
                  </p>
                </div>
              </div>
            </Card>
            <PipelineBlock>{`GENESIS ──► 12+ Vertical Engines ──► Memory Streams
                                               │
                                       COMPILER builds layers + suites
                                               │
                                       MERCHANT curates, quality gates
                                               │
                                       ECONOMY auto-prices by CJPI
                                               │
                         ┌──────────────▼──────────────┐
                         │    UNIFIED STORE            │
                         │  Crown Jewels               │
                         │  COMPILER Suites            │ ◄── SDK Devs
                         │  Showroom · Community       │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │  LIVE LAYER TICKER          │ ← cmpsbl.com banner
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │  ASCENSION V2               │
                         │  Step 1: Upload             │
                         │  Step 2: Enhance ◄── Ticker │
                         │  Step 3: Analyze            │
                         │  Step 4: Results → Upsell   │
                         └──────────────┬──────────────┘
                                        │
                             Enhanced Code + Scan Data
                                        │
                             BRAIN + SYSTEM learn from scan
                                        │
                         ──────► Memory Streams (cycle compounds ∞)`}</PipelineBlock>
          </SectionBlock>

          {/* ═══ WEEK 1 ═══ */}
          <section className="mb-12">
            <WeekHeader week={1} title="Store Catalog & Layer Inventory" subtitle="Foundation for the unified layer marketplace" />

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">1A — Store Data Model</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>Create store_layers table (name, description, category, CJPI, tier, price_cents, origin_vertical, pillar, status)</TaskItem>
                <TaskItem>Create store_purchases table (user_id, layer_id, stripe_payment_id, purchased_at)</TaskItem>
                <TaskItem>RLS: public read on active layers, authenticated purchase, governor-only management</TaskItem>
                <TaskItem>Layer metadata schema — CJPI breakdown, primitive tags, pillar, compatibility matrix</TaskItem>
              </div>
              <DeliverableTag>Deliverable</DeliverableTag>
              <span className="text-xs text-muted-foreground">store_layers + store_purchases tables with RLS. Edge function for catalog queries.</span>
            </Card>

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">1B — ECONOMY Pricing Engine</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>ECONOMY pricing algorithm — inputs: CJPI score, tier, complexity, primitive count</TaskItem>
                <TaskItem>Price bands: Showroom $10–$50 · Suites $50–$99 · Crown Jewels $129–$249</TaskItem>
                <TaskItem>Auto-price trigger: new store_layers INSERT → ECONOMY sets price_cents</TaskItem>
                <TaskItem>Governor override with audit trail. $10 floor, $500 ceiling.</TaskItem>
              </div>
              <DeliverableTag>Deliverable</DeliverableTag>
              <span className="text-xs text-muted-foreground">ECONOMY pricing function. Auto-pricing on layer creation. Price audit log.</span>
            </Card>

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">1C — MERCHANT Curation Interface</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>Governor-only Store management UI — add/edit/archive layers</TaskItem>
                <TaskItem>CJPI minimum threshold gate (below threshold → Junkyard)</TaskItem>
                <TaskItem>Suite builder — group related layers into purchasable bundles</TaskItem>
                <TaskItem>Seed initial catalog: Top 3 launch layers + 7–17 from existing output</TaskItem>
                <TaskItem>Pillar tagging system (Resilience, Foresight, Security, Intelligence, Governance…)</TaskItem>
              </div>
              <DeliverableTag>Deliverable</DeliverableTag>
              <span className="text-xs text-muted-foreground">MERCHANT curation page (governor-gated). 10–20 layers seeded.</span>
            </Card>

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">1D — Live Layer Ticker</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>Ticker component replacing quotes banner on Ascension landing page</TaskItem>
                <TaskItem>Pulls from store_layers (status=active, ordered by CJPI / featured flag)</TaskItem>
                <TaskItem>Tappable items → layer detail preview or Store listing</TaskItem>
                <TaskItem>Auto-refreshes as MERCHANT curates new layers</TaskItem>
              </div>
              <DeliverableTag>Deliverable</DeliverableTag>
              <span className="text-xs text-muted-foreground">Live ticker on cmpsbl.com. Populated from Store catalog.</span>
            </Card>
          </section>

          {/* ═══ WEEK 2 ═══ */}
          <section className="mb-12">
            <WeekHeader week={2} title="COMPILER Pipeline & Prime Vault" subtitle="Autonomous production line from discovery to catalog" />

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">2A — COMPILER Build Pipeline</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>COMPILER intake — Memory Stream discoveries → standalone layer packages</TaskItem>
                <TaskItem>Auto-classification: tier by CJPI (Crown Jewel / Suite / Showroom / Junkyard)</TaskItem>
                <TaskItem>Build manifest — layer metadata, primitive tags, pillar, compatibility, origin vertical</TaskItem>
                <TaskItem>MERCHANT auto-review queue — new output lands as "pending curation"</TaskItem>
              </div>
              <DeliverableTag>Deliverable</DeliverableTag>
              <span className="text-xs text-muted-foreground">COMPILER pipeline: Memory Stream → packaged layer. Auto-tier. Review queue.</span>
            </Card>

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">2B — Prime Vault</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>Merged S-Tier vault — auto-ingests from all 12+ vertical vaults + core</TaskItem>
                <TaskItem>Dedup engine — prevent duplicate layers across verticals</TaskItem>
                <TaskItem>Origin tagging — every entry tracks source vertical</TaskItem>
                <TaskItem>Governor Prime Vault browser — filter by vertical/tier/primitive/pillar</TaskItem>
              </div>
              <DeliverableTag>Deliverable</DeliverableTag>
              <span className="text-xs text-muted-foreground">Prime Vault with auto-ingest triggers. Governor browser UI.</span>
            </Card>

            <Card accent>
              <h3 className="text-base font-bold text-foreground mb-2">2C — Vertical Discovery Engine Controls</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5 mb-3">
                <TaskItem>Per-vertical discovery controls behind dual-gate</TaskItem>
                <TaskItem>Manual "run discovery now" trigger for on-demand layer mining</TaskItem>
                <TaskItem>Vertical Memory Stream viewer — browse before COMPILER intake</TaskItem>
                <TaskItem>Prime Vault sync status indicator per vertical</TaskItem>
              </div>
            </Card>
          </section>

          {/* ═══ Patent Timeline ═══ */}
          <SectionBlock icon={Clock} title="Patent Timeline">
            <div className="relative pl-7 ml-2 border-l-2 border-border">
              <TimelineItem
                date="May 7, 2025"
                title="U.S. Provisional App. 64/029,678 Filed — Dual-Layer Code Hardening (Ascension)"
                description="Provisional patent filed for the Ascension collision pipeline and dual-layer code hardening architecture."
                parallel="73 years to the day after Geoffrey Dummer conceived the integrated circuit (May 7, 1952)"
              />
              <TimelineItem
                date="April 7, 2026"
                title="U.S. Provisional App. 64/031,637 Filed — Silent Symbiotic Attachment (Mana)"
                description="Provisional patent filed for Mana/Lex silent attachment layer. 54 languages, function-boundary attachment, Lex governance."
                parallel="57 years to the day after RFC 1 — the first message on the internet (April 7, 1969)"
              />
              <TimelineItem
                date="September 12, 2026"
                title="Full Utility Patent Filing — Target Date"
                description="Full patent prosecution. Converts provisional to full utility filing with complete claims."
                parallel="68 years to the day after Jack Kilby demonstrated the first working integrated circuit (September 12, 1958)"
                future
              />
            </div>
          </SectionBlock>

          {/* ═══ Closing Statement ═══ */}
          <div className="rounded-2xl p-8 my-10 text-center border" style={{ background: 'linear-gradient(135deg, rgba(233,73,137,0.06), rgba(59,130,246,0.06))', borderColor: 'rgba(168,85,247,0.15)' }}>
            <p className="text-base font-semibold bg-clip-text text-transparent mb-3" style={{ backgroundImage: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>
              CMPSBL is a compounding layer factory.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[600px] mx-auto mb-4">
              Free Ascension scans your code and scores it. Paid layers enhance it. Enterprise gets their own factory on their own domain — custom primitives, autonomous discovery, self-pricing store — that gets smarter the more their team uses it. First factory took 3,000 hours. GENESIS builds the next one in five minutes. Every substrate deployed is a new recursive loop that compounds independently.
            </p>
            <p className="text-sm text-foreground font-semibold">
              Short version: <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3B7DDD, #7C5CFC)' }}>Free Ascension. Pay for evolution.</span>
            </p>
          </div>

          {/* Footer */}
          <footer className="pt-10 mt-12 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © 2025–2026 CMPSBL® — PromptFluid™ · All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              U.S. Patent App. No. 64/029,678 · U.S. Patent App. No. 64/031,637
            </p>
          </footer>
        </main>
      </div>

      {/* Ticker animation */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker-scroll 30s linear infinite;
        }
      `}</style>
    </>
  );
}
