/**
 * Documentation Hub — CMPSBL Substrate
 * Mobile-first, sidebar navigation, polished cards
 * Full technical documentation with real content
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Code, Zap, Shield, Database, ArrowRight,
  Key, Package, Globe, Bot, Brain, Moon, Eye, Scroll,
  ChevronRight, Menu, X, Copy, Check, Terminal,
  AlertTriangle, Settings, Lock, Cpu, Layers, RefreshCw,
  Activity, FileText, GitBranch, Server, Clock, Hash,
  Network, BarChart3, Search, Filter, Webhook,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { SEO } from "@/components/SEO";
import { useMetric } from "@/stores/publicMetricsStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Section definitions ─── */

interface DocSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const sections: DocSection[] = [
  { id: "overview",       label: "Overview",        icon: BookOpen,   color: "text-primary" },
  { id: "architecture",   label: "Architecture",    icon: Layers,     color: "text-sky-500" },
  { id: "byok",           label: "BYOK",            icon: Key,        color: "text-amber-500" },
  { id: "brain",          label: "BRAIN",           icon: Brain,      color: "text-violet-500" },
  { id: "nexus",          label: "NEXUS",           icon: Zap,        color: "text-cyan-500" },
  { id: "dream",          label: "DREAM",           icon: Moon,       color: "text-indigo-500" },
  { id: "defense",        label: "DEFENSE",         icon: Shield,     color: "text-emerald-500" },
  { id: "evolution",      label: "EVOLUTION",       icon: GitBranch,  color: "text-rose-500" },
  { id: "extensions",     label: "Extensions",      icon: Package,    color: "text-orange-500" },
  { id: "agents",         label: "Agents",          icon: Bot,        color: "text-pink-500" },
  { id: "integrations",   label: "Integrations",    icon: Globe,      color: "text-sky-500" },
  { id: "api",            label: "API Reference",   icon: Terminal,   color: "text-primary" },
];
// SEO is below in JSX

/* ─── Code block with copy ─── */

function CodeBlock({ children, title }: { children: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-border/40 text-xs font-mono text-muted-foreground bg-muted/30">
          {title}
        </div>
      )}
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-foreground/90">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

/* ─── Info card ─── */

function InfoCard({ icon: Icon, title, children, accent = "border-primary" }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-card/50 backdrop-blur-sm p-5 sm:p-6 card-lift gradient-border-reveal",
      "border-border/50 hover:border-primary/20 transition-all duration-500"
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("p-2 rounded-lg bg-muted/50 shrink-0", accent.replace("border-", "text-"))}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

/* ─── Callout box ─── */

function Callout({ type = "info", children }: { type?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    info: "bg-sky-500/5 border-sky-500/20 text-sky-600 dark:text-sky-400",
    warning: "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400",
    tip: "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  };
  const icons = { info: AlertTriangle, warning: AlertTriangle, tip: Zap };
  const Icon = icons[type];
  return (
    <div className={cn("rounded-xl border p-4 flex gap-3", styles[type])}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

/* ─── Table component ─── */

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/40">
              {headers.map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-foreground text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-muted-foreground text-xs">
                    {j === 0 ? <code className="text-foreground font-medium font-mono">{cell}</code> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Section content components ─── */

function OverviewSection() {
  const capabilitiesCount = useMetric('capabilitiesCount');
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Platform Overview</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          CMPSBL is a modular AI platform with 40 specialized modules organized into 12 functional groups — covering routing, memory, 
          self-improvement, monitoring, security, and orchestration for AI applications.{" "}
          <span className="text-foreground font-medium">{capabilitiesCount}+ capabilities</span> ready to use.
        </p>
      </div>

      <Callout type="tip">
        <strong>New to CMPSBL?</strong> Start with the <Link to="/documentation" className="text-primary underline">Quick Start Guide</Link> to
        get persistent memory running in under an hour — no framework changes needed.
      </Callout>

      {/* Architecture at a glance */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Architecture at a Glance</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The platform is organized into layers, each with a clear job. The <strong className="text-foreground">Spine</strong> handles startup and lifecycle, 
          the <strong className="text-foreground">Cognitive Core</strong> powers reasoning and memory, and the <strong className="text-foreground">Execution tier</strong> runs 
          all user-facing features. Cross-cutting systems like <strong className="text-foreground">Evolution, Security, and Routing</strong> span every layer.
        </p>
        <CodeBlock title="40-node / 12-sector substrate topology">{`┌─────────────────────────────────────────────────────────┐
│  GOVERNANCE (Plane)        Legitimacy supervision       │
├─────────────────────────────────────────────────────────┤
│  DEFENSE (Shell)           Terminal boundary enforcement │
├─────────────────────────────────────────────────────────┤
│  EXECUTION                 NEXUS · DECODE · ENCODE ·    │
│                            VISION · CORTEX · ECONOMY    │
│                            SANDBOX · INCLUSIVE · MEDIC  │
│                            INTEGRATION                  │
├─────────────────────────────────────────────────────────┤
│  OCG                       RIPPLE · ACCESS · IDENTITY   │
│                            RELAY · AUDIT · NERVE        │
├─────────────────────────────────────────────────────────┤
│  CCR (Cognitive Core)      BRAIN · MEMORY · DREAM       │
├─────────────────────────────────────────────────────────┤
│  SPINE                     CORE → SYSTEM                │
├─────────────────────────────────────────────────────────┤
│  ESZ                       COMPLIANCE · PREDICT ·       │
│                            ETHICS · CONTRACT            │
│  EPZ                       SIMULATE · GEOSPATIAL · EDGE │
│  EMZ                       FORGE · TRANSLATE · INGEST   │
│  CSZ                       EVOLUTION · SHADOW · PHANTOM │
├─────────────────────────────────────────────────────────┤
│  ATLAS                     Control plane (Node 40)      │
└─────────────────────────────────────────────────────────┘
Fields: EVOLUTION · IMMUNITY · INTENT (cross-cutting)
Total: 40 nodes · 12 sectors · Σ weights = 1.000`}</CodeBlock>
      </div>

      {/* Core systems grid */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Core Nodes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: Key,     name: "BYOK",       desc: "Bring your own API keys — zero compute costs to operators" },
            { icon: Brain,   name: "BRAIN",      desc: "Persistent memory with automatic temperature tiering and self-improvement consolidation" },
            { icon: Zap,     name: "NEXUS",      desc: "Smart AI routing across 13+ providers with automatic failover and cost controls" },
            { icon: Moon,    name: "DREAM",      desc: "Background self-improvement — consolidates memory, extracts patterns, generates insights" },
            { icon: Shield,  name: "DEFENSE",    desc: "Bot detection, rate limiting, input filtering, and authentication" },
            { icon: Eye,     name: "VISION",     desc: "System health monitoring, metrics dashboards, and performance tracking" },
            { icon: Scroll,  name: "AUDIT",      desc: "Tamper-proof activity log with cryptographic verification" },
            { icon: Code,    name: "DECODE",     desc: "Natural language understanding, intent detection, and response generation" },
            { icon: Bot,     name: "AGENCY",     desc: "Multi-agent teams with 5 built-in coordination patterns" },
          ].map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <InfoCard icon={s.icon} title={s.name}>
                {s.desc}
              </InfoCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/developers/guide">Quick Start <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/developers">Developer Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
        </Button>
      </div>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Architecture</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          CMPSBL is built from 40 modules organized into 12 functional groups. Each module has a priority weight 
          managed by the CORE module, which coordinates startup and system health.
        </p>
      </div>

      {/* Layer breakdown */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Layer Hierarchy</h3>
        <DocTable
          headers={["Sector", "Role", "Nodes"]}
          rows={[
            ["Spine", "Startup and lifecycle management", "CORE, SYSTEM"],
            ["Cognitive Core", "Reasoning, memory, and self-improvement", "BRAIN, MEMORY, DREAM"],
            ["Operations", "Access control, auditing, and coordination", "RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE"],
            ["Execution", "User-facing features and AI orchestration", "NEXUS, DECODE, ENCODE, VISION, CORTEX, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION"],
            ["Enterprise Safety", "Compliance, prediction, and ethics", "COMPLIANCE, PREDICT, ETHICS, CONTRACT"],
            ["Enterprise Performance", "Simulation and edge computing", "SIMULATE, GEOSPATIAL, EDGE"],
            ["Enterprise Manufacturing", "Data ingestion, translation, and generation", "FORGE, TRANSLATE, INGEST"],
            ["Continuous Safety", "Evolution, testing, and anomaly detection", "EVOLUTION, SHADOW, PHANTOM"],
            ["Cross-Cutting", "Systems that span all layers", "EVOLUTION, IMMUNITY, INTENT"],
            ["Governance", "Supervisory oversight and policy enforcement", "GOVERNANCE"],
            ["Defense", "Outer security boundary", "DEFENSE"],
          ]}
        />
      </div>

      {/* Matrix weighting */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Priority Weights</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Every module has a priority weight that determines how much it affects overall system health.
          Higher-weight modules (like CORE and DEFENSE) trigger faster alerts when degraded. Weights are 
          recalculated during startup and after system updates.
        </p>
        <CodeBlock title="Matrix weight categories">{`// Weight categories (higher = more critical)
CRITICAL:    CORE, DEFENSE, GOVERNANCE    (weight ≥ 8)
HIGH:        BRAIN, NEXUS, AUDIT, ACCESS  (weight 5-7)
STANDARD:    DECODE, ENCODE, VISION, etc. (weight 3-4)
AUXILIARY:   SIMULATE, GEOSPATIAL, etc.   (weight 1-2)

// Health score = Σ(node_health × weight) / Σ(weights)
// Safety switch trips when node health < 0.3`}</CodeBlock>
      </div>

      {/* Safety switches */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Safety Switches</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Safety switches prevent cascading failures across nodes. When a node's health drops below threshold,
          the switch isolates it from the rest of the system. MEDIC then initiates self-healing diagnostics.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Open", desc: "Node isolated — all traffic rejected. MEDIC healing active.", color: "border-red-500/30 bg-red-500/5" },
            { label: "Half-Open", desc: "Probe traffic allowed to test recovery. Metrics monitored.", color: "border-amber-500/30 bg-amber-500/5" },
            { label: "Closed", desc: "Normal operation — full traffic flows through node.", color: "border-emerald-500/30 bg-emerald-500/5" },
          ].map(s => (
            <div key={s.label} className={cn("p-4 rounded-xl border", s.color)}>
              <h4 className="font-semibold text-sm mb-1">{s.label}</h4>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Governance modes */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Governance Modes</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The substrate operates in one of four governance modes, managed by the GOVERNANCE plane.
          Mode transitions require authorization and are recorded in the audit chain.
        </p>
        <DocTable
          headers={["Mode", "Description", "Evolution", "Mutations"]}
          rows={[
            ["ACTIVE", "Normal operation — all systems running", "Enabled", "Governed"],
            ["OBSERVE", "Read-only monitoring — no state changes", "Disabled", "Blocked"],
            ["LOCKDOWN", "Emergency containment — critical ops only", "Frozen", "Blocked"],
            ["EVOLVE", "Accelerated evolution with reduced friction", "Accelerated", "Expedited"],
          ]}
        />
      </div>
    </div>
  );
}

function BYOKSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">BYOK Architecture</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          <strong className="text-foreground">Bring Your Own Keys</strong> — developers register their own AI provider API keys
          and pay compute costs directly to providers. Zero LLM costs for substrate operators.
        </p>
      </div>

      <Callout type="info">
        All API keys are encrypted at rest with AES-256 and never logged or exposed in responses.
        Keys can be rotated, scoped, and rate-limited independently.
      </Callout>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Key} title="Key Management">
          Register, rotate, and monitor API keys for any supported provider. Set per-key rate limits, usage budgets, and expiration dates. Keys are encrypted at rest with AES-256.
        </InfoCard>
        <InfoCard icon={Zap} title="Auto-Routing">
          When no provider is specified, NEXUS selects the optimal provider based on latency, cost, task type, and current provider health scores.
        </InfoCard>
        <InfoCard icon={Lock} title="Scope Control">
          Restrict keys to specific actions (e.g., read-only memory access, chat-only routing) using the scopes system. Minimize blast radius of compromised keys.
        </InfoCard>
        <InfoCard icon={BarChart3} title="Usage Tracking">
          Track token consumption, cost estimates, and request counts per key with 30-day rolling windows. Set budget alerts to prevent overspend.
        </InfoCard>
      </div>

      <CodeBlock title="Register & use your keys">{`// Register a provider key
await substrate.keys.register('openai', 'sk-...', {
  name: 'Production GPT-4o Key',
  scopes: ['nexus.route', 'brain.query'],
  rate_limit: { per_minute: 60, per_day: 5000 },
  budget_cents: 10000  // $100 monthly budget
});

// Make an AI call — billed to YOUR account
const response = await substrate.ai.chat(
  [{ role: 'user', content: 'Hello!' }],
  { provider: 'openai', model: 'gpt-4o' }
);

// Check usage
const usage = await substrate.keys.usage('openai', 30);
// → { tokens: 142850, cost_cents: 428, requests: 1203 }

// Rotate a key
await substrate.keys.rotate('openai', 'sk-new-key-...');`}</CodeBlock>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Supported Providers</h3>
        <DocTable
          headers={["Provider", "Type", "Models"]}
          rows={[
            ["Groq", "Managed (free tier)", "Llama 3.1, Mixtral, Gemma 2"],
            ["Cerebras", "Managed (free tier)", "Llama 3.1 70B"],
            ["SambaNova", "Managed (free tier)", "Llama 3.1, DeepSeek-R1"],
            ["Google AI Studio", "Managed (free tier)", "Gemini 2.5 Flash/Pro"],
            ["DeepSeek", "Managed (free tier)", "DeepSeek-R1, DeepSeek-V3"],
            ["Together", "Managed (free tier)", "Various open-source models"],
            ["OpenRouter", "Managed (free tier)", "Multi-model access"],
            ["OpenAI", "BYOK", "GPT-4o, GPT-4o-mini, o1, o3"],
            ["Anthropic", "BYOK", "Claude Sonnet 4, Claude Haiku"],
            ["Mistral", "BYOK", "Mistral Large, Codestral"],
            ["Cohere", "BYOK", "Command R+"],
            ["Fireworks", "BYOK", "Fine-tuned models"],
          ]}
        />
      </div>

      <Callout type="tip">
        <strong>Cost optimization:</strong> The NEXUS router always tries managed (free) providers first when they
        can handle the task. BYOK providers are used when managed providers can't meet quality or latency constraints.
      </Callout>
    </div>
  );
}

function BrainSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">BRAIN Node</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          The cognitive core — a four-tier memory system with automatic demotion, compression,
          and DREAM-cycle consolidation. Protected memory types are locked at 1.0 value with zero decay.
        </p>
      </div>

      {/* Memory tiers */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Four-Tier Memory Architecture</h3>
        <DocTable
          headers={["Tier", "Capacity", "Latency", "Retention", "Use Case"]}
          rows={[
            ["Hot", "500 entries", "<10ms", "Active session", "Current conversation context, recent actions"],
            ["Warm", "10,000 entries", "<50ms", "30 days", "User preferences, learned patterns, frequent context"],
            ["Cold", "10,000 entries", "<200ms", "1 year", "Historical interactions, archived knowledge"],
            ["Legacy", "Unlimited", "<500ms", "Permanent", "Compressed summaries, institutional knowledge"],
          ]}
        />
      </div>

      <Callout type="info">
        Memory demotion is automatic via FIFO/LRU eviction. When the Hot tier reaches capacity, the least-recently-used
        entries are bulk-demoted to Warm. DREAM cycles compress Warm → Cold transitions during idle periods.
      </Callout>

      {/* Protected types */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Protected Memory Types</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Certain memory categories are classified as <strong className="text-foreground">protected</strong> — they bypass
          all decay, scoring, and eviction mechanisms. Protected memories always retain a value of 1.0.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {["identity", "system_prompt", "safety_rule", "compliance_constraint", "user_boundary", "governance_directive"].map(t => (
            <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card/30">
              <Lock className="w-3 h-3 text-primary shrink-0" />
              <code className="text-xs font-mono text-foreground">{t}</code>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock title="Store, query, and manage memories">{`// Store a memory with metadata
await substrate.brain.store({
  content: "User prefers dark mode and minimal notifications",
  tags: ["preference", "ui", "notifications"],
  tier: "hot",
  category: "preference",
  confidence: 0.95
});

// Semantic search across all tiers
const results = await substrate.brain.query({
  query: "user interface preferences",
  limit: 10,
  tier: "all",              // "hot" | "warm" | "cold" | "legacy" | "all"
  min_confidence: 0.5,
  tags: ["preference"]      // optional tag filter
});
// → { memories: [...], total: 3, search_time_ms: 12 }

// Store a protected memory (never decays)
await substrate.brain.store({
  content: "Never share PII with third-party APIs",
  category: "safety_rule",  // protected type
  tier: "hot"
});

// Compress memories manually
await substrate.brain.compress({
  source_tier: "warm",
  target_tier: "cold",
  strategy: "semantic"      // "semantic" | "temporal" | "frequency"
});

// Get memory statistics
const stats = await substrate.brain.stats();
// → { hot: 342, warm: 8120, cold: 6543, legacy: 24100, protected: 18 }`}</CodeBlock>

      {/* Memory scoring */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Memory Scoring (RPS)</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Every memory is scored using the RPS (Relevance, Proximity, Specificity) model. Scores decay over time
          unless the memory is accessed, which resets the decay timer. DREAM cycles recalculate scores in bulk.
        </p>
        <CodeBlock title="RPS scoring model">{`// Score = (Relevance × 0.4) + (Proximity × 0.3) + (Specificity × 0.3)
//
// Relevance:   Semantic similarity to current query context
// Proximity:   Temporal distance from last access (decays)
// Specificity: How unique this memory is within its category
//
// Protected memories: score = 1.0 (constant, no decay)
// Decay rate: 0.02/day for hot, 0.005/day for warm, 0.001/day for cold`}</CodeBlock>
      </div>
    </div>
  );
}

function NexusSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">NEXUS Router</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Intelligent multi-provider AI routing. NEXUS selects the optimal model based on task type,
          latency constraints, cost budget, and provider health — with automatic failover across 14+ providers.
        </p>
      </div>

      {/* Routing algorithm */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Routing Algorithm</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          NEXUS uses a multi-factor scoring algorithm to select the best provider for each request. The algorithm
          considers task type affinity, current latency, cost-per-token, provider health, and rate limit headroom.
        </p>
        <CodeBlock title="Routing decision flow">{`1. Parse request → extract task_type, constraints, preferences
2. Filter providers → remove unhealthy, rate-limited, incompatible
3. Score remaining providers:
   score = (quality_fit × 0.35)       // task-type match
         + (latency_fit × 0.25)       // within latency constraint
         + (cost_fit × 0.20)          // cost efficiency
         + (health_score × 0.15)      // current provider health
         + (headroom × 0.05)          // rate limit headroom
4. Select highest-scoring provider
5. On failure → auto-failover to next-best provider`}</CodeBlock>
      </div>

      <CodeBlock title="Route with constraints">{`// Basic routing (NEXUS picks the best provider)
const response = await substrate.nexus.route({
  messages: [{ role: "user", content: "Analyze this dataset" }],
  task_type: "analysis"
});

// Route with specific constraints
const response = await substrate.nexus.route({
  messages: [{ role: "user", content: "Generate a haiku" }],
  task_type: "creative",
  constraints: {
    max_latency_ms: 3000,
    max_cost_cents: 5,
    preferred_providers: ["anthropic", "openai"],
    fallback: true,                // auto-failover on error
    exclude_providers: ["cohere"]  // skip specific providers
  }
});

// Stream a response
const stream = await substrate.nexus.stream({
  messages: messages,
  task_type: "chat",
  on_token: (token) => process.stdout.write(token)
});`}</CodeBlock>

      {/* Task types */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Task Types</h3>
        <DocTable
          headers={["Task Type", "Optimized For", "Preferred Providers"]}
          rows={[
            ["chat", "Conversational responses, Q&A", "Managed fleet → GPT-4o → Claude Sonnet"],
            ["analysis", "Data analysis, reasoning, math", "DeepSeek-R1 → Claude Sonnet → GPT-4o"],
            ["creative", "Writing, brainstorming, ideation", "Claude Sonnet → GPT-4o"],
            ["code", "Code generation, debugging, review", "DeepSeek-V3 → Codestral → GPT-4o"],
            ["summarization", "Document summarization, extraction", "Gemini Flash → Llama 3.1 → GPT-4o-mini"],
            ["classification", "Categorization, sentiment, labeling", "GPT-4o-mini → Gemini Flash → Llama 3.1"],
            ["extraction", "Structured data extraction from text", "GPT-4o → Claude Sonnet → Gemini Pro"],
          ]}
        />
      </div>

      {/* Provider health */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Provider Health Monitoring</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Latency Tracking", desc: "Rolling P50/P95/P99 latency per provider with 5-minute windows" },
            { label: "Error Rate", desc: "5xx error rate tracking with automatic demotion above 5% threshold" },
            { label: "Rate Limit Awareness", desc: "Proactive headroom tracking — avoids providers near their limits" },
          ].map(f => (
            <div key={f.label} className="p-4 rounded-xl border border-border/50 bg-card/30">
              <h4 className="font-semibold text-sm mb-1">{f.label}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DreamSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">DREAM Cycles</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Autonomous offline synthesis. During idle periods, the substrate consolidates patterns,
          compresses redundant memories, scores relevance, and surfaces lateral insights that wouldn't
          emerge from direct queries alone.
        </p>
      </div>

      {/* Dream modes */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Dream Modes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={Clock} title="Simnap Mode">
            Quick 30-second consolidation cycle. Compresses recent Hot-tier memories, rescores Warm-tier
            entries, and prunes duplicates. Runs automatically every 15 minutes during low-traffic periods.
            Minimal compute cost — designed for always-on operation.
          </InfoCard>
          <InfoCard icon={Brain} title="Deep Dream Mode">
            Full synthesis cycle (2-5 minutes). Cross-references all memory tiers, identifies latent patterns
            across categories, generates heuristics, and prunes stale entries. Runs daily during lowest-traffic
            window or can be triggered manually.
          </InfoCard>
        </div>
      </div>

      <CodeBlock title="Dream cycle API">{`// Trigger a simnap (quick consolidation)
const result = await substrate.dream.trigger({ mode: "simnap" });
// → { memories_compressed: 42, duplicates_pruned: 7, duration_ms: 28400 }

// Trigger a deep dream cycle
const result = await substrate.dream.trigger({
  mode: "deep",
  options: {
    cross_reference: true,     // find patterns across categories
    generate_heuristics: true, // create new heuristic rules
    prune_threshold: 0.1       // remove memories below this score
  }
});
// → { memories_consolidated: 847, heuristics_generated: 3,
//    patterns_discovered: 12, pruned: 156, duration_ms: 187000 }

// Check dream status and history
const status = await substrate.dream.status();
// → { last_simnap: "2026-03-05T02:30:00Z",
//    last_deep: "2026-03-05T04:00:00Z",
//    total_cycles: 1847,
//    memories_consolidated_lifetime: 284000 }

// Schedule dream cycles
await substrate.dream.schedule({
  simnap_interval_minutes: 15,
  deep_dream_time: "04:00",       // UTC
  deep_dream_timezone: "America/Los_Angeles"
});`}</CodeBlock>

      {/* What dreams produce */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Dream Outputs</h3>
        <DocTable
          headers={["Output Type", "Description", "Example"]}
          rows={[
            ["Compression", "Merges redundant memories into summaries", "5 dark-mode preferences → 1 consolidated entry"],
            ["Heuristic", "Generates reusable decision rules", "\"User prefers concise responses under 200 words\""],
            ["Pattern", "Identifies recurring themes across categories", "\"Support queries spike on Mondays at 9am\""],
            ["Prune", "Removes stale, low-confidence entries", "Memories with score < 0.1 and no access in 90 days"],
            ["Lateral Insight", "Surfaces non-obvious connections", "\"Users who prefer dark mode also prefer compact layouts\""],
          ]}
        />
      </div>

      <Callout type="tip">
        <strong>Dream consent:</strong> For multi-tenant deployments, dream pooling can be configured per-tenant.
        Tenants can opt in/out of global pattern pooling, heuristic sharing, and template sharing independently.
      </Callout>
    </div>
  );
}

function DefenseSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">DEFENSE Node</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Enterprise-grade security built into the substrate core. DEFENSE is the terminal boundary —
          the outermost shell that every request must pass through before reaching any other node.
        </p>
      </div>

      {/* Defense layers */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Security Layers</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Shield, label: "Bot Detection", desc: "Behavioral fingerprinting and challenge-response to identify automated traffic" },
            { icon: Activity, label: "Rate Limiting", desc: "Per-key, per-IP, and per-endpoint rate limiting with sliding window counters" },
            { icon: Filter, label: "Input Sanitization", desc: "Prompt injection detection, SQL injection prevention, and content filtering" },
            { icon: Lock, label: "WebAuthn / FIDO2", desc: "Passwordless authentication with hardware security keys and biometrics" },
            { icon: Scroll, label: "Audit Logging", desc: "Every security event logged to the immutable AUDIT chain with Merkle receipts" },
            { icon: Network, label: "DDoS Protection", desc: "Automatic traffic shaping and IP reputation scoring under volumetric attacks" },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/30">
              <f.icon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">{f.label}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock title="Defense configuration">{`// Run a security scan
const scan = await substrate.defense.scan({
  target: "example.com",
  scan_type: "full",         // "quick" | "full" | "compliance"
  wcag_level: "AA"           // accessibility compliance level
});
// → { score: 87, issues: [...], recommendations: [...] }

// Configure rate limits
await substrate.defense.configure({
  rate_limits: {
    global: { per_minute: 1000, per_day: 50000 },
    per_key: { per_minute: 60, per_day: 5000 },
    per_ip: { per_minute: 30, per_day: 1000 }
  },
  bot_detection: {
    enabled: true,
    challenge_threshold: 0.7,   // confidence threshold
    block_threshold: 0.95
  },
  input_sanitization: {
    prompt_injection: true,
    sql_injection: true,
    xss_prevention: true
  }
});`}</CodeBlock>

      {/* Compliance */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Compliance & Certifications</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {["SOC 2 Type II", "GDPR Ready", "HIPAA Eligible", "WCAG 2.2 AA", "CCPA Compliant", "ISO 27001"].map(c => (
            <div key={c} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40 bg-card/30 text-sm">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvolutionSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">EVOLUTION System</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Governed self-improvement. EVOLUTION manages version control, shadow testing, and promotion of
          system changes — ensuring the substrate improves over time while maintaining integrity guarantees.
        </p>
      </div>

      {/* Evolution lifecycle */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Evolution Lifecycle</h3>
        <CodeBlock title="Four-phase evolution cycle">{`SCAN → DRY-RUN → APPLY → ROLLBACK (if needed)

1. SCAN:     Analyze current system state, identify improvement opportunities
2. DRY-RUN:  Simulate proposed changes without touching production
3. APPLY:    Promote validated changes with pre/post metrics
4. ROLLBACK: Restore immutable snapshot if post-apply health degrades

Each phase produces a Merkle-signed receipt in the audit chain.`}</CodeBlock>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Search} title="Dry-Run Impact Preview">
          Simulates evolution changes before application. Shows projected delta on all health metrics,
          estimates blast radius (which modules affected), and projects confidence level. No production state is modified.
        </InfoCard>
        <InfoCard icon={RefreshCw} title="One-Click Rollback">
          Manages restoration of immutable snapshots. Lists available snapshots with timestamps and health scores.
          Automatic post-restore health verification. All rollback events are audited.
        </InfoCard>
        <InfoCard icon={Activity} title="Scan Trend Dashboard">
          Visualizes health over time with trend lines, technical debt reduction curves, node-by-node breakdown,
          and alert threshold markers. Identifies patterns in evolution success rates.
        </InfoCard>
        <InfoCard icon={GitBranch} title="Shadow Testing">
          Run proposed changes in parallel with production using shadow traffic. Compare outcomes without
          risk. Validate behavior before promotion.
        </InfoCard>
      </div>

      <CodeBlock title="Evolution API">{`// Scan current system state
const scan = await substrate.evolution.scan();
// → { health_score: 94.2, improvements: [...], debt_items: 3 }

// Run a dry-run of proposed changes
const preview = await substrate.evolution.dryRun({
  changes: scan.improvements,
  target_modules: ["brain", "nexus"]
});
// → { projected_health: 96.1, delta: +1.9, blast_radius: ["brain", "nexus", "dream"] }

// Apply changes (requires governor approval)
const receipt = await substrate.evolution.apply({
  changes: preview.changes,
  approval_token: "gov_tok_...",
  rollback_on_decline: true    // auto-rollback if health drops
});

// List available rollback snapshots
const snapshots = await substrate.evolution.snapshots();
// → [{ id: "snap_...", timestamp: "...", health: 94.2 }, ...]

// Restore a snapshot
await substrate.evolution.rollback("snap_...");`}</CodeBlock>

      {/* Integrity enforcement */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Integrity Enforcement</h3>
        <DocTable
          headers={["Mechanism", "Description"]}
          rows={[
            ["Merkle receipt chain", "SHA-256 hash chain linking every evolution event — tamper-evident"],
            ["Linear regression detection", "Blocks promotions when health trends are declining"],
            ["Dry-run projections", "Impact simulation required before any production change"],
            ["Verified delta requirement", "Finalization rejected if post-apply metrics or scans fail"],
          ]}
        />
      </div>
    </div>
  );
}

function ExtensionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Extensions</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Extend substrate functionality with custom hooks that run before or after system actions.
          Extensions are sandboxed and rate-limited to prevent interference with core operations.
        </p>
      </div>

      {/* Hook types */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Available Hook Points</h3>
        <DocTable
          headers={["Hook Type", "Points", "Use Cases"]}
          rows={[
            ["brain_hook", "pre_store, post_store, pre_query, post_query", "Content filtering, enrichment, custom scoring"],
            ["nexus_hook", "pre_route, post_route, on_failover", "Request modification, response transformation, logging"],
            ["defense_hook", "pre_scan, post_scan, on_threat", "Custom threat rules, external WAF integration"],
            ["dream_hook", "pre_cycle, post_cycle, on_heuristic", "Custom consolidation logic, notification triggers"],
            ["audit_hook", "on_event", "External SIEM integration, compliance reporting"],
          ]}
        />
      </div>

      <CodeBlock title="Register and manage extensions">{`// Register a pre-query brain hook
await substrate.extensions.register({
  name: 'pii-filter',
  extension_type: 'brain_hook',
  hook_point: 'pre_query',
  endpoint_url: 'https://your-api.com/hooks/pii-filter',
  timeout_ms: 5000,           // max execution time
  retry_count: 1,             // retries on failure
  fail_open: true             // continue if hook fails
});

// Register a post-route nexus hook
await substrate.extensions.register({
  name: 'response-logger',
  extension_type: 'nexus_hook',
  hook_point: 'post_route',
  endpoint_url: 'https://your-api.com/hooks/log-response',
  headers: {
    'Authorization': 'Bearer hook-secret'
  }
});

// List registered extensions
const hooks = await substrate.extensions.list();

// Disable an extension without removing it
await substrate.extensions.disable('pii-filter');

// Remove an extension
await substrate.extensions.remove('pii-filter');`}</CodeBlock>

      <Callout type="warning">
        Extensions are sandboxed with a 5-second default timeout. If a hook exceeds its timeout,
        the <code className="font-mono text-xs">fail_open</code> setting determines whether the request continues
        or is rejected. Use <code className="font-mono text-xs">fail_open: false</code> for security-critical hooks.
      </Callout>
    </div>
  );
}

function AgentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Multi-Agent Orchestration</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Create and coordinate AI agents using five built-in orchestration patterns. Each agent has its own
          persistent memory, CLM (Constant Learning Mode) training, and sealed runtime environment.
        </p>
      </div>

      {/* Orchestration patterns */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Orchestration Patterns</h3>
        <DocTable
          headers={["Pattern", "Behavior", "Best For"]}
          rows={[
            ["Chain", "Sequential execution — output of one feeds into the next", "Multi-step workflows, data chains"],
            ["Parallel", "Concurrent execution — all agents run simultaneously", "Independent subtasks, speed-critical operations"],
            ["Supervisor", "Manager agent delegates to and reviews workers", "Quality-sensitive tasks, oversight required"],
            ["Debate", "Agents argue positions, consensus emerges", "Complex decisions, risk assessment"],
            ["Swarm", "Collaborative free-form interaction between agents", "Creative exploration, brainstorming"],
          ]}
        />
      </div>

      <CodeBlock title="Create & orchestrate agents">{`// Create specialized agents
const researcher = await substrate.agents.create({
  name: 'ResearchAgent',
  system_prompt: 'You are a research specialist. Find and synthesize information.',
  provider: 'anthropic',
  model: 'claude-sonnet',
  memory_scope: 'agent'    // agent-private memory
});

const analyst = await substrate.agents.create({
  name: 'AnalystAgent',
  system_prompt: 'You analyze data and provide structured insights.',
  provider: 'openai',
  model: 'gpt-4o',
  memory_scope: 'shared'   // shared memory pool
});

// Run with debate pattern
const result = await substrate.agents.run(
  [researcher.id, analyst.id],
  'Evaluate the ROI of implementing persistent memory',
  {
    pattern: 'debate',
    max_rounds: 3,
    consensus_threshold: 0.8
  }
);
// → { consensus: true, conclusion: "...", rounds: 2, agent_positions: [...] }

// Run with chain pattern
const chain = await substrate.agents.run(
  [researcher.id, analyst.id],
  'Research quantum computing trends, then analyze market impact',
  { pattern: 'chain' }
);`}</CodeBlock>

      {/* Agent capabilities */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Built-in Agent Capabilities</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Auto-Tiering Memory", desc: "Each agent has its own 4-tier memory that auto-manages itself" },
            { label: "CLM Training", desc: "Constant Learning Mode — agents improve 24/7 from every interaction" },
            { label: "RIPPLE Orchestrator", desc: "Internal event bus for coordination between agents" },
            { label: "Version Minting", desc: "Purchase an agent and receive a unique snapshot of its learned state" },
            { label: "DECODE Channel", desc: "Natural language interface for direct agent interaction" },
            { label: "Sealed Runtime", desc: "Black-box execution — agent internals are tamper-proof" },
          ].map(f => (
            <div key={f.label} className="p-3 rounded-xl border border-border/50 bg-card/30">
              <h4 className="font-semibold text-xs mb-1">{f.label}</h4>
              <p className="text-[11px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Integrations</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Connect external services through the INTEGRATION node. Manage credentials, invoke APIs,
          and receive webhooks — all within the substrate's governance and audit boundaries.
        </p>
      </div>

      {/* Available integrations */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Available Integrations</h3>
        <DocTable
          headers={["Integration", "Category", "Capabilities"]}
          rows={[
            ["Stripe", "Payments", "Create customers, manage subscriptions, process payments, handle webhooks"],
            ["Twilio", "Communications", "Send SMS, make voice calls, WhatsApp messaging, verify phone numbers"],
            ["Shopify", "E-Commerce", "Manage products, process orders, sync inventory, handle fulfillment"],
            ["n8n", "Automation", "Trigger workflows, receive webhook data, chain automations"],
            ["SendGrid", "Email", "Transactional email, templates, delivery tracking, bounce handling"],
            ["Slack", "Messaging", "Post messages, create channels, manage notifications"],
            ["Custom Webhook", "Custom", "Send/receive HTTP webhooks with HMAC signature verification"],
          ]}
        />
      </div>

      <CodeBlock title="Connect and use integrations">{`// Connect Stripe
await substrate.integrations.connect({
  name: 'My Stripe',
  integration_type: 'stripe',
  credentials: { api_key: 'sk_live_...' },
  webhook_secret: 'whsec_...'
});

// Invoke an integration action
const customer = await substrate.integrations.call(
  'integration-id',
  'customers.create',
  { email: 'user@example.com', name: 'Jane Doe' }
);

// Register a webhook listener
await substrate.integrations.webhook({
  integration_id: 'integration-id',
  events: ['invoice.paid', 'subscription.canceled'],
  endpoint_url: 'https://your-api.com/webhooks/stripe',
  hmac_secret: 'your-verification-secret'
});

// List all connected integrations
const connections = await substrate.integrations.list();
// → [{ id: "...", type: "stripe", status: "active", last_used: "..." }]`}</CodeBlock>

      <Callout type="info">
        All integration credentials are encrypted at rest. API calls through integrations are logged to the
        AUDIT chain and subject to the same rate limiting and governance policies as direct substrate calls.
      </Callout>
    </div>
  );
}

function APISection() {
  const endpoints = [
    { action: "brain.store",       method: "POST", desc: "Store a memory with tags, tier, and metadata", body: '{ "action": "brain.store", "content": "...", "tags": ["tag1"], "tier": "hot", "category": "preference" }' },
    { action: "brain.query",       method: "POST", desc: "Semantic search across memory tiers", body: '{ "action": "brain.query", "query": "search terms", "limit": 10, "tier": "all", "min_confidence": 0.5 }' },
    { action: "brain.compress",    method: "POST", desc: "Trigger memory compression between tiers", body: '{ "action": "brain.compress", "source_tier": "warm", "target_tier": "cold", "strategy": "semantic" }' },
    { action: "brain.stats",       method: "POST", desc: "Get memory tier statistics", body: '{ "action": "brain.stats" }' },
    { action: "nexus.route",       method: "POST", desc: "Route AI request to optimal provider", body: '{ "action": "nexus.route", "messages": [...], "task_type": "chat", "constraints": {} }' },
    { action: "nexus.stream",      method: "POST", desc: "Stream AI response token-by-token", body: '{ "action": "nexus.stream", "messages": [...], "task_type": "chat" }' },
    { action: "nexus.providers",   method: "POST", desc: "List configured providers and health", body: '{ "action": "nexus.providers" }' },
    { action: "dream.trigger",     method: "POST", desc: "Trigger dream consolidation cycle", body: '{ "action": "dream.trigger", "mode": "simnap" }' },
    { action: "dream.status",      method: "POST", desc: "Check dream cycle status and history", body: '{ "action": "dream.status" }' },
    { action: "defense.scan",      method: "POST", desc: "Run a security/accessibility scan", body: '{ "action": "defense.scan", "target": "example.com", "scan_type": "full" }' },
    { action: "evolution.scan",    method: "POST", desc: "Scan system for evolution opportunities", body: '{ "action": "evolution.scan" }' },
    { action: "evolution.dryRun",  method: "POST", desc: "Simulate proposed changes", body: '{ "action": "evolution.dryRun", "changes": [...] }' },
    { action: "vision.metrics",    method: "POST", desc: "Retrieve system health metrics", body: '{ "action": "vision.metrics", "module": "brain" }' },
    { action: "vision.health",     method: "POST", desc: "Get overall system health score", body: '{ "action": "vision.health" }' },
    { action: "audit.query",       method: "POST", desc: "Search the immutable audit ledger", body: '{ "action": "audit.query", "entity_type": "brain", "limit": 50 }' },
    { action: "keys.register",     method: "POST", desc: "Register a new provider API key", body: '{ "action": "keys.register", "provider": "openai", "key": "sk-..." }' },
    { action: "keys.usage",        method: "POST", desc: "Get usage statistics for a provider key", body: '{ "action": "keys.usage", "provider": "openai", "days": 30 }' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">API Reference</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          All substrate actions are sent via <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded font-mono">POST</code> to a
          single unified gateway endpoint. The <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded font-mono">action</code> field
          in the JSON body determines which module handles the request.
        </p>
      </div>

      {/* Base URL */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Base URL</h3>
        <CodeBlock>{`POST https://api.cmpsbl.com/v1/substrate`}</CodeBlock>
      </div>

      {/* Auth */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Authentication</h3>
        <CodeBlock title="Required headers">{`X-Developer-ID: your-developer-uuid
X-App-ID: your-app-uuid
Authorization: Bearer <jwt>
Content-Type: application/json`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2">
          All three auth headers are required. JWTs expire after 1 hour and can be refreshed
          using the <code className="font-mono">auth.refresh</code> action.
        </p>
      </div>

      {/* Endpoints */}
      <div>
        <h3 className="font-semibold mb-4 text-foreground">All Actions ({endpoints.length})</h3>
        <div className="space-y-3">
          {endpoints.map(ep => (
            <div key={ep.action} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-mono px-2">
                  {ep.method}
                </Badge>
                <code className="text-sm font-semibold text-foreground">{ep.action}</code>
                <span className="text-xs text-muted-foreground hidden sm:inline ml-auto">{ep.desc}</span>
              </div>
              <pre className="px-4 py-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                {ep.body}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Response format */}
      <div>
        <h3 className="font-semibold mb-3">Response Format</h3>
        <CodeBlock>{`// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "latency_ms": 42,
    "provider": "groq",          // for nexus.route
    "model": "llama-3.1-70b",   // for nexus.route
    "tokens_used": 1250,
    "request_id": "req_..."
  }
}

// Error
{
  "success": false,
  "error": "Descriptive error message",
  "code": "RATE_LIMITED",        // machine-readable error code
  "meta": { "retry_after_ms": 5000 }
}`}</CodeBlock>
      </div>

      {/* Error codes */}
      <div>
        <h3 className="font-semibold mb-3">Error Codes</h3>
        <DocTable
          headers={["Code", "HTTP Status", "Description"]}
          rows={[
            ["RATE_LIMITED", "429", "Too many requests — check meta.retry_after_ms"],
            ["AUTH_INVALID", "401", "Invalid or expired JWT token"],
            ["FORBIDDEN", "403", "Valid auth but insufficient permissions or scope"],
            ["PROVIDER_ERROR", "502", "Upstream AI provider returned an error"],
            ["PROVIDER_TIMEOUT", "504", "AI provider did not respond within latency constraint"],
            ["QUOTA_EXCEEDED", "429", "Daily or monthly quota exhausted for this key"],
            ["INVALID_ACTION", "400", "Unrecognized action field in request body"],
            ["VALIDATION_ERROR", "400", "Request body failed schema validation"],
          ]}
        />
      </div>

      {/* Rate limits */}
      <div>
        <h3 className="font-semibold mb-3">Rate Limits</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { tier: "Free",       rpm: "60/min",       rpd: "1K/day" },
            { tier: "Pro",        rpm: "600/min",      rpd: "50K/day" },
            { tier: "Enterprise", rpm: "Unlimited",    rpd: "Unlimited" },
          ].map(l => (
            <div key={l.tier} className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/30 text-center">
              <div className="font-semibold text-sm mb-1">{l.tier}</div>
              <div className="text-xs text-muted-foreground">{l.rpm}</div>
              <div className="text-xs text-muted-foreground">{l.rpd}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SDKs */}
      <div>
        <h3 className="font-semibold mb-3">SDK & Client Libraries</h3>
        <CodeBlock title="JavaScript / TypeScript">{`// Call the Substrate API directly via fetch
const res = await fetch('https://api.cmpsbl.com/v1/substrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'X-Developer-ID': 'YOUR_DEV_ID',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ action: 'brain.query', query: 'user preferences' }),
});
const data = await res.json();`}</CodeBlock>
        <CodeBlock title="cURL">{`curl -X POST https://api.cmpsbl.com/v1/substrate \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "X-Developer-ID: YOUR_DEV_ID" \\
  -H "X-App-ID: YOUR_APP_ID" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "brain.query", "query": "user preferences"}'`}</CodeBlock>
      </div>
    </div>
  );
}

/* ─── Section renderer ─── */

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  architecture: ArchitectureSection,
  byok: BYOKSection,
  brain: BrainSection,
  nexus: NexusSection,
  dream: DreamSection,
  defense: DefenseSection,
  evolution: EvolutionSection,
  extensions: ExtensionsSection,
  agents: AgentsSection,
  integrations: IntegrationsSection,
  api: APISection,
};

/* ─── Main page ─── */

export default function Documentation() {
  const [active, setActive] = useState("overview");
  

  const ActiveComponent = sectionComponents[active] || OverviewSection;

  const handleNav = (id: string) => {
    setActive(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Documentation — API & Node Reference | CMPSBL"
        description="Complete CMPSBL technical docs: BRAIN memory API, NEXUS routing, DREAM cycles, DEFENSE rules, EVOLUTION promotion, terminal commands, SDK guides, and full 40-node integration reference."
        canonical="https://cmpsbl.com/documentation"
        image="https://cmpsbl.com/og/documentation.jpg"
        keywords={['CMPSBL documentation', 'substrate docs', 'AI API reference', 'DREAM cycles docs', 'persistent memory API']}
      />

      <PublicNav />

      {/* Hero — compact */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[180px]" />
        </div>
        <div className="relative container mx-auto px-4 pt-28 sm:pt-32 pb-12 sm:pb-16">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            ← Back to Home
          </Link>
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-3 py-1 gap-1.5">
              <BookOpen className="w-3 h-3" />
              <span className="text-xs">Developer Resources</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Substrate{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Documentation</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Everything you need to build on the substrate — persistent memory, DREAM cycles,
              NEXUS routing, governed evolution, and complete API reference.{" "}
              <span className="text-primary font-medium">100% BYOK.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Mobile horizontal section picker — always visible */}
      <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 py-2 min-w-max">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => handleNav(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[36px]",
                  active === s.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                )}
              >
                <s.icon className={cn("w-3.5 h-3.5 shrink-0", active === s.id ? "text-primary" : s.color)} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area — sidebar + main */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex gap-8 max-w-7xl mx-auto">

          {/* Desktop sidebar */}
          <nav className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <div className="space-y-0.5 p-2 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleNav(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left relative",
                    active === s.id
                      ? "bg-primary/10 text-primary font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {active === s.id && (
                    <motion.div
                      layoutId="docs-sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <s.icon className={cn("w-4 h-4 shrink-0", active === s.id ? "text-primary" : s.color)} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* CTA */}
      <section className="border-t border-border/30 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative container mx-auto px-4 py-16 sm:py-20 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">Ready to Build?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Deploy your own substrate instance and start building with BYOK architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Link to="/developers">
                Developer Portal <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover:border-primary/30 transition-colors">
              <Link to="/developers/guide">Developer Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      <RelatedCapabilities />
      <PageSEOBlock path="/documentation" title="Documentation" faq={[
        { question: "How do I get started with CMPSBL?", answer: "Create a free account at cmpsbl.com. You get 3 memory slots immediately with full runtime access. No credit card required." },
        { question: "Does CMPSBL have an API?", answer: "Yes. The CMPSBL substrate exposes a RESTful API with authentication, rate limiting, and full documentation at cmpsbl.com/api-access." },
        { question: "What programming languages does CMPSBL support?", answer: "CMPSBL is language-agnostic. The API works with any language that can make HTTP requests. SDKs are available for JavaScript/TypeScript with more coming." },
      ]} />
      <EnhancedFooter />
    </div>
  );
}
