/**
 * Unified Pipeline Architecture & Roadmap
 * Ascension → Mana → Trace → Lex
 * U.S. Patent App. No. 64/029,678 & 64/031,637
 * 
 * © CMPSBL® — All rights reserved.
 */

const PipelineRoadmap = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border/40 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase mb-2">CMPSBL® — Governed Cognitive Infrastructure</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Unified Pipeline Architecture</h1>
          <p className="text-muted-foreground mt-2 text-sm">Ascension → Mana → Trace → Lex · Two Patents, One System</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-16">

        {/* ASCII Pipeline Flow */}
        <section>
          <SectionHeader title="PIPELINE FLOW" subtitle="The canonical data path from scan to deployment" />
          <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
            <pre className="text-xs md:text-sm leading-relaxed text-foreground whitespace-pre">
{`
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │                        CMPSBL® UNIFIED PIPELINE v1.0.0                             │
  │                  U.S. Patent App. No. 64/029,678 & 64/031,637                      │
  └─────────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐    attachment     ┌──────────────┐    merge?     ┌──────────────┐
  │              │    plan +         │              │    Trace      │              │
  │  ASCENSION   │───fingerprint───▶│     MANA     │─────SDK──────▶│    TRACE     │
  │  (Layer 1    │                   │  (Layer 2    │               │  (Layer 3    │
  │   Scanner)   │                   │   Engine)    │               │   SDK)       │
  │              │                   │              │               │              │
  └──────────────┘                   └──────┬───────┘               └──────┬───────┘
        │                                   │                              │
        │ identifies                        │ attaches via                 │ developer
        │ opportunities                     │ 5 engines                    │ authored
        │ classifies                        │                              │ attachments
        │ primitives                        │                              │
        ▼                                   ▼                              ▼
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                  │
  │                            LEX GOVERNANCE GATE                                   │
  │                     ┌─────────────────────────────┐                               │
  │                     │   FINGERPRINT VERIFICATION  │◀── Required (non-removable)   │
  │                     │   match? ──▶ ATTACH         │                               │
  │                     │   fail?  ──▶ DENY + HOME    │                               │
  │                     └─────────────────────────────┘                               │
  │                     ┌─────────────────────────────┐                               │
  │                     │   DEVELOPER RULES (tunable) │◀── Custom via Dashboard       │
  │                     │   payments fail 3x ──▶ detach│                               │
  │                     │   traffic spike    ──▶ guard │                               │
  │                     │   layer tampered   ──▶ detach│                               │
  │                     │   Trace fails 2x   ──▶ detach│                               │
  │                     └─────────────────────────────┘                               │
  │                                                                                  │
  └───────────────────────────────┬──────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    ▼                            ▼
           ┌───────────────┐           ┌────────────────┐
           │  WITH TRACE   │           │ WITHOUT TRACE  │
           │  Symbiotic    │           │ Pure Layer 2   │
           │  Deployment   │           │ Ascension      │
           │  (Both        │           │ (Single        │
           │   Patents)    │           │  Patent)       │
           └───────────────┘           └────────────────┘
`}
            </pre>
          </div>
        </section>

        {/* 5 Behavioral Engines */}
        <section>
          <SectionHeader title="BEHAVIORAL ENGINES" subtitle="Shared across Ascension, Mana, and Lex" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <EngineCard
              name="DEFENSE"
              tag="GATING"
              duties={["Lex deny semantics", "Attachment-time enforcement", "Runtime enforcement", "Threat classification"]}
              color="text-red-400"
            />
            <EngineCard
              name="CORTEX"
              tag="ORCHESTRATION"
              duties={["Wrapper composition order", "Execution flow control", "Policy-driven enforcement", "Engine sequencing"]}
              color="text-blue-400"
            />
            <EngineCard
              name="NEXUS"
              tag="ROUTING"
              duties={["Cost gate decisions", "Fallback path resolution", "Flow routing logic", "Provider selection"]}
              color="text-purple-400"
            />
            <EngineCard
              name="BRAIN"
              tag="REASONING"
              duties={["Confidence gate scoring", "Context integrity checks", "Traceability anchoring", "Decision auditing"]}
              color="text-amber-400"
            />
            <EngineCard
              name="ORACLE"
              tag="ANALYSIS"
              duties={["Anomaly detection", "Prediction signals", "Causal tracing", "Pattern recognition"]}
              color="text-emerald-400"
            />
          </div>
        </section>

        {/* Nervous System Wiring */}
        <section>
          <SectionHeader title="NERVOUS SYSTEM WIRING" subtitle="Built components and their pipeline connections" />
          <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
            <pre className="text-xs md:text-sm leading-relaxed text-foreground whitespace-pre">
{`
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                    AUTONOMOUS NERVOUS SYSTEM                                │
  │                    (All components built — wiring required)                  │
  └─────────────────────────────────────────────────────────────────────────────┘

  PERCEPTION                    DECISION                     ACTION
  ─────────                     ────────                     ──────

  ┌──────────┐   anomalies    ┌──────────┐   verdict      ┌──────────┐
  │  VISION  │───────────────▶│   LEX    │──────────────▶│   GATE   │
  │ baselines│                │ governor │               │ enforcer │
  │ watchdog │                │ rules    │               │          │
  └──────────┘                └────┬─────┘               └──────────┘
                                   │
  PROPAGATION                      │ event               RECOVERY
  ───────────                      ▼                     ────────

  ┌──────────┐   broadcast    ┌──────────┐   heal       ┌──────────┐
  │  RIPPLE  │◀──────────────│   BUS    │────────────▶│  MEDIC   │
  │ events   │                │ backbone │               │ quarantine│
  │ replay   │                │          │               │ playbooks│
  └──────────┘                └────┬─────┘               └──────────┘
                                   │
  VALIDATION                       │ test               PROOF
  ──────────                       ▼                    ─────

  ┌──────────┐   promote      ┌──────────┐   anchor    ┌──────────┐
  │  SHADOW  │───────────────▶│EVOLUTION │────────────▶│  AUDIT   │
  │ sandbox  │                │ dag/gates│               │ merkle   │
  │ probes   │                │ rollback │               │ receipts │
  └──────────┘                └──────────┘               └──────────┘

  INFRASTRUCTURE
  ──────────────

  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  BOOT    │  │  CLOCK   │  │  GRAPH   │  │HEARTBEAT │  │  NERVE   │
  │ sequencer│  │ clockless│  │ deps DAG │  │ pulse    │  │ mesh     │
  │ fp gate  │  │ ordering │  │ cascade  │  │ home     │  │ activate │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
`}
            </pre>
          </div>
        </section>

        {/* Wiring Connections */}
        <section>
          <SectionHeader title="WIRING CONNECTIONS" subtitle="6 critical integrations to activate the nervous system" />
          <div className="space-y-3">
            <WiringRow
              num={1}
              from="VISION"
              to="LEX"
              description="Anomaly signals auto-generate Lex rules. Adaptive baselines trigger escalation verdicts."
              status="built"
            />
            <WiringRow
              num={2}
              from="LEX verdict"
              to="RIPPLE → phone home"
              description="Detach/escalate verdicts broadcast via event propagation layer. Persistent store for replay."
              status="built"
            />
            <WiringRow
              num={3}
              from="LEX detach"
              to="MEDIC"
              description="Post-detach recovery. Quarantine manager isolates. Recovery playbooks execute. Self-repair loop."
              status="built"
            />
            <WiringRow
              num={4}
              from="SHADOW"
              to="Trace validation"
              description="Before Trace deploys, Shadow runs it in isolation. EVOLUTION gates the promotion to production."
              status="built"
            />
            <WiringRow
              num={5}
              from="AUDIT chain"
              to="every Lex verdict"
              description="Merkle receipt chain anchors every allow/deny/detach/escalate. Cryptographic proof of governance."
              status="built"
            />
            <WiringRow
              num={6}
              from="BOOT sequencer"
              to="fingerprint gate"
              description="Lex fingerprint verification enforced before ANY attachment activates. Non-bypassable."
              status="built"
            />
          </div>
        </section>

        {/* Lex Verdict Expansion */}
        <section>
          <SectionHeader title="LEX VERDICT EXPANSION" subtitle="From binary to full governance vocabulary" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h4 className="text-xs text-muted-foreground tracking-wider uppercase mb-3">Current (v1)</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2"><span className="text-emerald-400">●</span> allow</div>
                <div className="flex items-center gap-2"><span className="text-red-400">●</span> deny</div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <h4 className="text-xs text-muted-foreground tracking-wider uppercase mb-3">Expanded (v2)</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2"><span className="text-emerald-400">●</span> allow</div>
                <div className="flex items-center gap-2"><span className="text-red-400">●</span> deny</div>
                <div className="flex items-center gap-2"><span className="text-amber-400">●</span> escalate <span className="text-muted-foreground text-xs">— heighten DEFENSE posture</span></div>
                <div className="flex items-center gap-2"><span className="text-red-500">●</span> detach <span className="text-muted-foreground text-xs">— sever Layer 2, phone home</span></div>
                <div className="flex items-center gap-2"><span className="text-blue-400">●</span> quarantine <span className="text-muted-foreground text-xs">— isolate via MEDIC</span></div>
                <div className="flex items-center gap-2"><span className="text-purple-400">●</span> phone-home <span className="text-muted-foreground text-xs">— notify without action</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <SectionHeader title="IMPLEMENTATION ROADMAP" subtitle="From current state to unified pipeline" />
          <div className="space-y-6">
            <RoadmapPhase
              phase="Phase 0 — Foundation"
              status="COMPLETE"
              items={[
                "Mana engine with 92 capabilities across 5 engines",
                "Lex governor with priority-sorted rules and wildcards",
                "Ascension scan, classify, and fingerprint generation",
                "All 5 behavioral engines (DEFENSE, CORTEX, NEXUS, BRAIN, ORACLE)",
                "VISION observability suite (baselines, anomalies, watchdog)",
                "MEDIC self-healing engine (quarantine, playbooks, repair loop)",
                "RIPPLE event propagation (broadcast, replay, persistent store)",
                "SHADOW validation (sandbox execution, mutation probing)",
                "EVOLUTION deployment gates (DAG, promotion rules, rollback ledger)",
                "AUDIT cryptographic chain (Merkle receipts, anchoring)",
                "Core infrastructure (Boot, Clock, Graph, Heartbeat, Nerve)",
              ]}
            />
            <RoadmapPhase
              phase="Phase 1 — Lex Expansion"
              status="NEXT"
              items={[
                "Expand LexVerdict: add 'detach', 'escalate', 'quarantine', 'phone-home'",
                "Add phoneHome callback hook on verdict execution",
                "Add 'protected' flag on fingerprint rule (non-revocable)",
                "Wire VISION anomaly signals → Lex auto-rule generation",
                "Wire Lex verdicts → RIPPLE event propagation",
                "Wire Boot Sequencer → mandatory fingerprint gate on startup",
              ]}
            />
            <RoadmapPhase
              phase="Phase 2 — Nervous System Wiring"
              status="PLANNED"
              items={[
                "Connect Lex detach → MEDIC quarantine + recovery playbooks",
                "Connect AUDIT Merkle chain to every Lex verdict",
                "Connect SHADOW → Trace pre-deployment validation",
                "Connect EVOLUTION → Trace promotion gating",
                "Connect GATE engine as Lex enforcement arm",
                "Connect NERVE mesh for state change propagation",
                "Connect Heartbeat Engine → phone-home pulse",
                "Connect Dependency Graph → detach cascade ordering",
              ]}
            />
            <RoadmapPhase
              phase="Phase 3 — Trace SDK (Layer 3)"
              status="PLANNED"
              items={[
                "@cmpsbl/trace package creation",
                "Developer-facing API for authoring Traces",
                "Trace → Mana merge protocol",
                "Trace validation via SHADOW before promotion",
                "Trace dashboard for Lex rule composition (no-code)",
                "Symbiotic deployment mode (both patents active)",
                "Pure Layer 2 mode (Ascension-only, single patent)",
              ]}
            />
            <RoadmapPhase
              phase="Phase 4 — Developer Dashboard"
              status="FUTURE"
              items={[
                "Lex rule composer UI (custom governance without code)",
                "Real-time VISION metrics dashboard",
                "Trace deployment history and rollback controls",
                "AUDIT receipt explorer (Merkle chain viewer)",
                "MEDIC recovery status and quarantine management",
                "Phone-home event log and alert configuration",
              ]}
            />
          </div>
        </section>

        {/* Hidden Arsenal — Discovered Components */}
        <section>
          <SectionHeader title="HIDDEN ARSENAL" subtitle="Built systems not yet wired into the pipeline — discovered via codebase audit" />
          
          {/* Tier 1: Direct Pipeline Amplifiers */}
          <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3 mt-2">Tier 1 — Direct Pipeline Amplifiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ArsenalCard
              name="NERVE"
              path="src/lib/nerve/"
              description="Autonomic activation engine + Enhancement Mesh. Transforms idle capabilities into event-reactive behaviors via signal routing, confidence gating, and always-on ambient amplifiers."
              pipelineUse="Wire NERVE signals into Lex rule triggers. Enhancement Mesh provides passive uplift to all 40 primitives during Trace execution."
              color="text-cyan-400"
            />
            <ArsenalCard
              name="RELAY"
              path="src/lib/relay/ultimate/"
              description="Adaptive route optimizer, circuit breaker matrix, delivery guarantor, message compression, protocol translation, rate governor, sector gateway."
              pipelineUse="Relay hardens all phone-home and RIPPLE broadcasts with delivery guarantees, compression, and rate limiting. Circuit breaker matrix protects against cascade failures."
              color="text-indigo-400"
            />
            <ArsenalCard
              name="TREATY"
              path="src/lib/treaty/ultimate/"
              description="Compliance prover, contract negotiation, dispute resolution, multi-party arbitration, penalty calculus, SLA forecaster, term optimizer, audit chain."
              pipelineUse="Treaty IS the developer's custom Lex rule framework. Developers author treaties (SLA contracts) that Lex enforces. Dispute resolution handles Lex verdict appeals."
              color="text-rose-400"
            />
            <ArsenalCard
              name="CONTROL PLANE"
              path="src/lib/control-plane/"
              description="Write-Ahead Log (WAL), atomic versioned persistence, INTEL aggregation, ENGINEER maintenance node, CLM bridge, rehydration engine."
              pipelineUse="WAL captures every Lex verdict mutation for tamper-evidence and replay. Persistence layer gives the pipeline crash-recovery and state rehydration."
              color="text-orange-400"
            />
            <ArsenalCard
              name="COMPASS"
              path="src/lib/compass/ultimate/"
              description="Drift compass, spatial anomaly detector, trajectory analyzer, bearing calculator, geofence engine, exploration frontier, proximity graph."
              pipelineUse="Drift Compass detects when Trace behavior drifts from its fingerprint baseline. Spatial anomaly detector feeds VISION. Geofence engine adds jurisdiction-aware Lex rules."
              color="text-teal-400"
            />
            <ArsenalCard
              name="HARVEST"
              path="src/lib/harvest/ultimate/"
              description="Crawler swarm, anticipatory prefetch, deduplication forge, freshness oracle, provenance ledger, quality furnace, pipeline choreographer."
              pipelineUse="Harvest feeds Ascension's scanner with pre-crawled, deduplicated, quality-scored code. Provenance ledger anchors source lineage for AUDIT chain."
              color="text-lime-400"
            />
          </div>

          {/* Tier 2: Governance & Validation */}
          <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">Tier 2 — Governance & Validation Hardening</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ArsenalCard
              name="EVOLUTION MESH"
              path="src/lib/evolution-mesh/"
              description="Snapshot service, diff service, integrity service, promotion service, mutation engine, hardening registry, telemetry."
              pipelineUse="Replaces ad-hoc EVOLUTION wiring with a full service mesh: snapshot before Trace deploy, diff against baseline, integrity check, gated promotion, automatic rollback."
              color="text-yellow-400"
            />
            <ArsenalCard
              name="CAPABILITY LIFECYCLE"
              path="src/lib/capability-lifecycle/"
              description="Activation guide, behavioral verifier, constrained reporter, export bridge, Mana bridge, ledger builder, generic activation."
              pipelineUse="Manages the full lifecycle from discovery → activation → verification → export. The Mana bridge directly connects capability state to Mana's attachment engine."
              color="text-sky-400"
            />
            <ArsenalCard
              name="DILIGENCE"
              path="src/lib/diligence/"
              description="Investor-grade test battery across terminal, governance, and command paths. Runs all handler suites in parallel."
              pipelineUse="Automated pre-deployment validation. Run Diligence before any Trace promotion to ensure governance paths are intact."
              color="text-fuchsia-400"
            />
            <ArsenalCard
              name="CONTRACTS"
              path="src/lib/contracts/"
              description="Decode Contract system with typed interfaces and RFC specification for interpreter-primitive binding."
              pipelineUse="Contracts define the interface between DECODE (conversational agent) and the pipeline. Ensures API stability as Lex expands."
              color="text-violet-400"
            />
            <ArsenalCard
              name="ERROR RECOVERY"
              path="src/lib/error-recovery/"
              description="Global fetch interceptor for 429/5xx detection, rate-limit event emission, automatic retry with backoff."
              pipelineUse="Wraps all pipeline HTTP calls (phone-home, NEXUS routing, RELAY broadcasts) with automatic recovery. Prevents silent failures."
              color="text-red-300"
            />
            <ArsenalCard
              name="PHANTOM"
              path="src/lib/phantom/ultimate/"
              description="10-system privacy suite: differential privacy, synthetic data forge, anonymization, privacy budget, data masking, canary tokens, consent registry, re-identification scoring, jurisdictional routing, telemetry."
              pipelineUse="When Trace handles user data, PHANTOM enforces privacy automatically. Canary tokens detect data leaks. Jurisdictional router ensures Lex rules respect GDPR/CCPA boundaries."
              color="text-gray-400"
            />
          </div>

          {/* Tier 3: Production Infrastructure */}
          <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">Tier 3 — Production Infrastructure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ArsenalCard
              name="FORGE"
              path="src/lib/forge/ultimate/"
              description="Artifact foundry, blueprint genome, collaborative forge, fabrication pipeline, material science, pattern library, forge memory."
              pipelineUse="Forge generates the actual deployment artifacts from Trace specs. Blueprint genome stores proven attachment patterns for reuse."
              color="text-amber-300"
            />
            <ArsenalCard
              name="FACTORY"
              path="src/lib/factory/"
              description="Collision engine, genesis seed engine, template mutation engine, vertical factory, incubator, product compiler, licensing engine."
              pipelineUse="Collision Engine merges two codebases discovering capabilities neither has alone. Template Mutation Engine evolves attachment patterns across generations. Product Compiler graduates discoveries into products."
              color="text-emerald-300"
            />
            <ArsenalCard
              name="TELEMETRY"
              path="src/lib/telemetry/"
              description="Aggregate core, analytics events, error telemetry, web vitals, contract-based telemetry schema."
              pipelineUse="Unified telemetry across the entire pipeline. Every Lex verdict, Trace deployment, VISION anomaly, and phone-home event flows through one telemetry contract."
              color="text-blue-300"
            />
            <ArsenalCard
              name="CASCADE"
              path="src/lib/cascade/"
              description="Coder logs, project management, sandbox execution environment."
              pipelineUse="Sandbox provides isolated execution for SHADOW validation of Traces before production promotion."
              color="text-pink-400"
            />
            <ArsenalCard
              name="QUARRY"
              path="src/lib/quarry/"
              description="Pack density analysis, template policy enforcement, type system."
              pipelineUse="Ensures attachment packs respect density limits and template policies before Lex approval."
              color="text-stone-400"
            />
            <ArsenalCard
              name="CLOCKLESS RADIO"
              path="src/lib/clockless-radio/"
              description="DJ engine, SFX system, TTS, track management — event-driven audio signaling."
              pipelineUse="Provides audible alerts for critical Lex verdicts (detach, phone-home). Developer dashboard gets sonic feedback on pipeline state changes."
              color="text-purple-300"
            />
          </div>
        </section>

        {/* Updated Architecture Diagram */}
        <section>
          <SectionHeader title="COMPLETE ARCHITECTURE" subtitle="Full system topology with all discovered components" />
          <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
            <pre className="text-xs md:text-sm leading-relaxed text-foreground whitespace-pre">
{`
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │                    CMPSBL® COMPLETE SYSTEM TOPOLOGY v2.0.0                          │
  │                    U.S. Patent App. No. 64/029,678 & 64/031,637                     │
  └─────────────────────────────────────────────────────────────────────────────────────┘

  ┌─ INTAKE ──────────────────────────────────────────────────────────────────────────┐
  │                                                                                   │
  │  HARVEST ──▶ ASCENSION ──▶ FACTORY ──▶ CAPABILITY LIFECYCLE                       │
  │  (crawl,     (scan,        (collision,  (activation, ledger,                      │
  │   dedup,      classify,     genesis,     behavioral verify,                       │
  │   quality)    fingerprint)  mutation)    Mana bridge)                              │
  │                                                                                   │
  └──────────────────────────────────────────┬────────────────────────────────────────┘
                                             │
                                             ▼
  ┌─ EXECUTION ───────────────────────────────────────────────────────────────────────┐
  │                                                                                   │
  │  ┌────────────────────────────────────────────────────────────────────────────┐    │
  │  │                         MANA ENGINE                                       │    │
  │  │  DEFENSE · CORTEX · NEXUS · BRAIN · ORACLE                                │    │
  │  │  ──────────────────────────────────────                                   │    │
  │  │  + NERVE (auto-activation + enhancement mesh)                             │    │
  │  │  + COMPASS (drift detection + spatial anomaly)                            │    │
  │  │  + FORGE (artifact generation + blueprint genome)                         │    │
  │  └────────────────────────────────────────────────────────────────────────────┘    │
  │                              │                                                    │
  │                    ┌─────────┴─────────┐                                          │
  │                    ▼                   ▼                                           │
  │             ┌──────────┐        ┌──────────┐                                      │
  │             │  TRACE   │        │ PURE L2  │                                      │
  │             │  (SDK)   │        │ (no SDK) │                                      │
  │             └──────────┘        └──────────┘                                      │
  │                                                                                   │
  └──────────────────────────────────────────┬────────────────────────────────────────┘
                                             │
                                             ▼
  ┌─ GOVERNANCE ──────────────────────────────────────────────────────────────────────┐
  │                                                                                   │
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐              │
  │  │   LEX   │──│  GATE   │──│ TREATY  │──│ PHANTOM  │──│ QUARRY   │              │
  │  │governor │  │enforcer │  │SLA/rules│  │ privacy  │  │ density  │              │
  │  │verdicts │  │arm      │  │disputes │  │ canary   │  │ policy   │              │
  │  └────┬────┘  └─────────┘  └─────────┘  └──────────┘  └──────────┘              │
  │       │                                                                           │
  │       ▼ every verdict                                                             │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │
  │  │  AUDIT CHAIN ──▶ CONTROL PLANE WAL ──▶ CONTRACTS (interface stability)     │  │
  │  └─────────────────────────────────────────────────────────────────────────────┘  │
  │                                                                                   │
  └──────────────────────────────────────────┬────────────────────────────────────────┘
                                             │
                                             ▼
  ┌─ RESPONSE ────────────────────────────────────────────────────────────────────────┐
  │                                                                                   │
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐              │
  │  │ VISION  │──│ RIPPLE  │──│  MEDIC  │──│  RELAY   │──│  ERROR   │              │
  │  │perceive │  │broadcast│  │ recover │  │ deliver  │  │ RECOVERY │              │
  │  │baseline │  │phone-   │  │quarantin│  │guarantee │  │ retry    │              │
  │  │anomaly  │  │home     │  │playbook │  │compress  │  │ intercept│              │
  │  └─────────┘  └─────────┘  └─────────┘  └──────────┘  └──────────┘              │
  │                                                                                   │
  └──────────────────────────────────────────┬────────────────────────────────────────┘
                                             │
                                             ▼
  ┌─ VALIDATION ──────────────────────────────────────────────────────────────────────┐
  │                                                                                   │
  │  ┌─────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
  │  │ SHADOW  │──│  EVOLUTION  │──│DILIGENCE │──│ CASCADE  │──│TELEMETRY │         │
  │  │sandbox  │  │  MESH       │──│ test     │  │ sandbox  │  │ unified  │         │
  │  │mutation │  │snapshot/diff│  │ battery  │  │ isolated │  │ contract │         │
  │  │ probes  │  │promote/roll │  │ govnce   │  │ exec     │  │ events   │         │
  │  └─────────┘  └─────────────┘  └──────────┘  └──────────┘  └──────────┘         │
  │                                                                                   │
  └──────────────────────────────────────────────────────────────────────────────────┘

  ┌─ INFRASTRUCTURE ──────────────────────────────────────────────────────────────────┐
  │  BOOT · CLOCK · GRAPH · HEARTBEAT · NERVE MESH · CLOCKLESS RADIO                 │
  │  (ordered startup, causal ordering, dependency DAG, health pulse, ambient uplift) │
  └───────────────────────────────────────────────────────────────────────────────────┘
`}
            </pre>
          </div>
        </section>

        {/* Patent Unification */}
        <section>
          <SectionHeader title="PATENT UNIFICATION" subtitle="Two patents, one system, two deployment modes" />
          <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
            <pre className="text-xs md:text-sm leading-relaxed text-foreground whitespace-pre">
{`
  ┌───────────────────────────────────────────────────────────┐
  │              PATENT UNIFICATION MODEL                     │
  ├───────────────────────────────────────────────────────────┤
  │                                                           │
  │  Patent 64/029,678 (Ascension)                            │
  │  ├── Code scanning & classification                       │
  │  ├── Layer 2 generation                                   │
  │  └── Fingerprint anchoring                                │
  │                                                           │
  │  Patent 64/031,637 (Mana/Symbiosis)                       │
  │  ├── Silent software attachment                           │
  │  ├── Runtime governance (Lex)                             │
  │  └── Behavioral engine enforcement                        │
  │                                                           │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │                 UNIFIED SYSTEM                      │  │
  │  │                                                     │  │
  │  │  Ascension ──▶ Mana ──┬──▶ Trace ──▶ Symbiotic    │  │
  │  │                       │                             │  │
  │  │                       └──▶ (skip) ──▶ Layer 2      │  │
  │  │                                                     │  │
  │  │  Both paths governed by Lex.                        │  │
  │  │  Both paths use 5 behavioral engines.               │  │
  │  │  Trace presence = deployment mode selector.         │  │
  │  └─────────────────────────────────────────────────────┘  │
  │                                                           │
  └───────────────────────────────────────────────────────────┘
`}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 pt-8 pb-12 text-center">
          <p className="text-xs text-muted-foreground tracking-wider">
            CMPSBL® · PromptFluid™ · Governed Cognitive Infrastructure
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            U.S. Patent App. No. 64/029,678 & 64/031,637 · © {new Date().getFullYear()} All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

/* ─── Sub-components ─── */

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-6">
    <h2 className="text-xs tracking-[0.3em] text-muted-foreground uppercase">{title}</h2>
    <p className="text-lg font-semibold mt-1">{subtitle}</p>
  </div>
);

const EngineCard = ({ name, tag, duties, color }: { name: string; tag: string; duties: string[]; color: string }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className={`text-lg font-bold ${color}`}>{name}</div>
    <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-3">{tag}</div>
    <ul className="space-y-1">
      {duties.map((d, i) => (
        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
          <span className="text-foreground/40 mt-0.5">▸</span>
          <span>{d}</span>
        </li>
      ))}
    </ul>
  </div>
);

const WiringRow = ({ num, from, to, description, status }: { num: number; from: string; to: string; description: string; status: string }) => (
  <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-xs text-muted-foreground font-mono w-5">{String(num).padStart(2, '0')}</span>
      <span className="font-mono text-sm font-semibold text-foreground">{from}</span>
      <span className="text-muted-foreground">→</span>
      <span className="font-mono text-sm font-semibold text-foreground">{to}</span>
    </div>
    <p className="text-xs text-muted-foreground flex-1">{description}</p>
    <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 shrink-0">
      {status}
    </span>
  </div>
);

const RoadmapPhase = ({ phase, status, items }: { phase: string; status: string; items: string[] }) => {
  const statusColors: Record<string, string> = {
    'COMPLETE': 'border-emerald-500/30 text-emerald-400',
    'NEXT': 'border-amber-500/30 text-amber-400',
    'PLANNED': 'border-blue-500/30 text-blue-400',
    'FUTURE': 'border-purple-500/30 text-purple-400',
  };
  const dotColors: Record<string, string> = {
    'COMPLETE': 'bg-emerald-400',
    'NEXT': 'bg-amber-400',
    'PLANNED': 'bg-blue-400',
    'FUTURE': 'bg-purple-400',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-2 h-2 rounded-full ${dotColors[status] ?? 'bg-muted-foreground'}`} />
        <h3 className="font-semibold text-sm">{phase}</h3>
        <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border ${statusColors[status] ?? ''}`}>
          {status}
        </span>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${status === 'COMPLETE' ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PipelineRoadmap;
