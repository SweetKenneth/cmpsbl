/**
 * Documentation Hub — CMPSBL Platform
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
  { id: "byok",           label: "BYOK",            icon: Key,        color: "text-neon-amber" },
  { id: "brain",          label: "BRAIN",           icon: Brain,      color: "text-neon-purple" },
  { id: "nexus",          label: "NEXUS",           icon: Zap,        color: "text-neon-cyan" },
  { id: "dream",          label: "DREAM",           icon: Moon,       color: "text-primary" },
  { id: "defense",        label: "DEFENSE",         icon: Shield,     color: "text-neon-green" },
  { id: "evolution",      label: "EVOLUTION",       icon: GitBranch,  color: "text-neon-magenta" },
  { id: "extensions",     label: "Extensions",      icon: Package,    color: "text-neon-amber" },
  { id: "agents",         label: "Agents",          icon: Bot,        color: "text-neon-magenta" },
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
        {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
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
    warning: "bg-neon-amber/5 border-neon-amber/20 text-neon-amber dark:text-neon-amber",
    tip: "bg-neon-green/5 border-neon-green/20 text-neon-green dark:text-neon-green",
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
          CMPSBL is a cognitive AI operating system with 40 Core Primitives organized into 4 categories —
          Organs, Layers, Engines, and Agents — covering routing, memory, self-improvement, monitoring, security,
          and orchestration for AI applications.{" "}
          <span className="text-foreground font-medium">{capabilitiesCount}+ capabilities</span> ready to use.
        </p>
      </div>

      <Callout type="tip">
        <strong>New to CMPSBL?</strong> Start with the <Link to="/developers/guide" className="text-primary underline">Developer Guide</Link> to
        get persistent memory running in under an hour — no framework changes needed.
      </Callout>

      {/* Architecture at a glance */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Architecture at a Glance</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The platform is organized into four primitive categories following a symmetric 12·12·8·8 matrix.
          <strong className="text-foreground"> Organs</strong> provide vital internal infrastructure,
          <strong className="text-foreground"> Layers</strong> supply ambient overlays and protection,
          <strong className="text-foreground"> Engines</strong> are invoked processing powerhouses, and
          <strong className="text-foreground"> Agents</strong> are autonomous self-directed actors.
        </p>
        <CodeBlock title="40-primitive / 4-category platform topology">{`┌─────────────────────────────────────────────────────────┐
│  ORGANS (12)     Vital internal infrastructure          │
│  CORE · SYSTEM · BRAIN · MEMORY · NERVE · NEXUS        │
│  IDENTITY · SOVEREIGN · ATLAS · MEDIC · RELAY ·         │
│  CONSCIENCE                                             │
├─────────────────────────────────────────────────────────┤
│  LAYERS (12)     Ambient overlays & protection          │
│  DEFENSE · IMMUNITY · GOVERNANCE · TREATY · EVOLUTION   │
│  REFLEX · COMPASS · INTEGRATION · INTENT · ACCESS ·     │
│  VISION · SHADOW                                        │
├─────────────────────────────────────────────────────────┤
│  ENGINES (8)     Invoked processing powerhouses         │
│  DREAM · HARVEST · FORGE · LINGUA · ECHO · PHANTOM ·    │
│  SANDBOX · RIPPLE                                       │
├─────────────────────────────────────────────────────────┤
│  AGENTS (8)      Autonomous self-directed actors        │
│  ENCODE · DECODE · AUDIT · ECONOMY · INCLUSIVE ·         │
│  CORTEX · ORACLE · ENGINEER                             │
└─────────────────────────────────────────────────────────┘
Total: 40 primitives · 4 categories · Σ weights = 1.000`}</CodeBlock>
      </div>

      {/* Core systems grid */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Key Primitives</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: Key,     name: "BYOK",            desc: "Bring your own API keys — zero compute costs to operators" },
            { icon: Brain,   name: "BRAIN Organ",     desc: "Persistent memory with automatic temperature tiering and self-improvement consolidation" },
            { icon: Zap,     name: "NEXUS Organ",     desc: "Smart AI routing across 14+ providers with automatic failover and cost controls" },
            { icon: Moon,    name: "DREAM Engine",    desc: "Background self-improvement — consolidates memory, extracts patterns, generates insights" },
            { icon: Shield,  name: "DEFENSE Layer",   desc: "Bot detection, rate limiting, input filtering, and authentication" },
            { icon: Eye,     name: "VISION Layer",    desc: "System health monitoring, metrics dashboards, and performance tracking" },
            { icon: Scroll,  name: "AUDIT Agent",     desc: "Tamper-proof activity log with cryptographic verification" },
            { icon: Code,    name: "DECODE Agent",    desc: "Natural language understanding, intent detection, and response generation" },
            { icon: Bot,     name: "CORTEX Agent",    desc: "Multi-agent orchestration with 5 built-in coordination patterns" },
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

      {/* Documentation Libraries */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Documentation Libraries</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/docs/users" className="group rounded-xl border border-border/50 bg-card/50 p-5 hover:border-primary/30 transition-all duration-300 card-lift">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--neon-cyan))]/10">
                <BookOpen className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
              </div>
              <h4 className="font-semibold text-sm">User & Developer Library</h4>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              API reference, primitives guide, CLI & SDK, webhooks, rate limits, agency framework, and getting started tutorials.
            </p>
          </Link>
          <Link to="/docs/system" className="group rounded-xl border border-border/50 bg-card/50 p-5 hover:border-primary/30 transition-all duration-300 card-lift">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--neon-purple))]/10">
                <Cpu className="w-4 h-4 text-[hsl(var(--neon-purple))]" />
              </div>
              <h4 className="font-semibold text-sm">System Reference Library</h4>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Architecture deep-dives, primitive specifications, memory chains, security model, and governance documentation.
            </p>
          </Link>
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
          CMPSBL is built from 40 Core Primitives organized into a symmetric 12·12·8·8 matrix across
          4 categories. Each primitive has a priority weight managed by the CORE Organ, which coordinates
          startup and overall system health.
        </p>
      </div>

      {/* Category breakdown */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Primitive Categories</h3>
        <DocTable
          headers={["Category", "Count", "Role", "Primitives"]}
          rows={[
            ["Organs", "12", "Vital internal infrastructure", "CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE"],
            ["Layers", "12", "Ambient overlays and protection", "DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW"],
            ["Engines", "8", "Invoked processing powerhouses", "DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE"],
            ["Agents", "8", "Autonomous self-directed actors", "ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER"],
          ]}
        />
      </div>

      {/* Matrix weighting */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Priority Weights</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Every primitive has a priority weight that determines how much it affects overall system health.
          Higher-weight primitives (like CORE Organ and DEFENSE Layer) trigger faster alerts when degraded.
          Weights are recalculated during startup and after system updates.
        </p>
        <CodeBlock title="Primitive weight categories">{`// Weight categories (higher = more critical)
CRITICAL:    CORE Organ, DEFENSE Layer, GOVERNANCE Layer  (weight ≥ 8)
HIGH:        BRAIN Organ, NEXUS Organ, AUDIT Agent, ACCESS Layer  (weight 5-7)
STANDARD:    DECODE Agent, ENCODE Agent, VISION Layer, etc.  (weight 3-4)
AUXILIARY:   SANDBOX Engine, RIPPLE Engine, etc.  (weight 1-2)

// Health score = Σ(primitive_health × weight) / Σ(weights)
// Circuit breaker trips when primitive health < 0.3`}</CodeBlock>
      </div>

      {/* Safety switches */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Circuit Breakers</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Circuit breakers prevent failures from spreading across primitives. When a primitive's health drops below threshold,
          it's automatically isolated. The MEDIC Organ then runs self-healing diagnostics to restore it.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Open", desc: "Primitive isolated — all traffic rejected. MEDIC Organ healing active.", color: "border-destructive/30 bg-destructive/5" },
            { label: "Half-Open", desc: "Probe traffic allowed to test recovery. Metrics monitored.", color: "border-neon-amber/30 bg-neon-amber/5" },
            { label: "Closed", desc: "Normal operation — full traffic flows through primitive.", color: "border-neon-green/30 bg-neon-green/5" },
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
          The platform operates in one of four modes, controlled by the GOVERNANCE Layer.
          Switching modes requires authorization and is logged for auditability.
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
          and pay compute costs directly to providers. Zero LLM costs for platform operators.
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

      <CodeBlock title="Register & use your keys via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';

// Register a provider key
const res = await fetch(GATEWAY, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    module: 'ACCESS',
    action: 'register_key',
    payload: {
      provider: 'openai',
      key: 'sk-...',
      name: 'Production GPT-4o Key',
      scopes: ['nexus.route', 'brain.query'],
      rate_limit: { per_minute: 60, per_day: 5000 },
      budget_cents: 10000
    }
  }),
});

// Check usage
const usage = await fetch(GATEWAY, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ module: 'ACCESS', action: 'usage', payload: { provider: 'openai', days: 30 } }),
});
// → { tokens: 142850, cost_cents: 428, requests: 1203 }`}</CodeBlock>

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
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">BRAIN Organ</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          The cognitive core — a four-tier memory system with automatic demotion, compression,
          and background consolidation. Protected memory types are locked at 1.0 value with zero decay.
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
            ["Glacier", "Unlimited", "<500ms", "Permanent", "Compressed summaries, institutional knowledge"],
          ]}
        />
      </div>

      <Callout type="info">
        Memory demotion is automatic via FIFO/LRU eviction. When the Hot tier reaches capacity, the least-recently-used
        entries are bulk-demoted to Warm. Self-improvement cycles compress Warm → Cold transitions during idle periods.
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

      <CodeBlock title="Store, query, and manage memories via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Store a memory with metadata
await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'MEMORY',
    action: 'store',
    payload: {
      content: "User prefers dark mode and minimal notifications",
      tags: ["preference", "ui"],
      tier: "hot",
      confidence: 0.95
    }
  }),
});

// Semantic search across all tiers
const res = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'MEMORY',
    action: 'recall',
    payload: {
      query: "user interface preferences",
      limit: 10,
      tier: "all",
      min_confidence: 0.5
    }
  }),
});
const { data } = await res.json();
// → { memories: [...], total: 3, search_time_ms: 12 }`}</CodeBlock>

      {/* Memory scoring */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Memory Scoring (RPS)</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Every memory is scored using the RPS (Relevance, Proximity, Specificity) model. Scores decay over time
          unless the memory is accessed, which resets the decay timer. Self-improvement cycles recalculate scores in bulk.
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">NEXUS Organ</h2>
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

      <CodeBlock title="Route with constraints via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Basic routing (NEXUS picks the best provider)
const res = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'NEXUS',
    action: 'route',
    payload: {
      messages: [{ role: "user", content: "Analyze this dataset" }],
      task_type: "analysis"
    }
  }),
});

// Route with specific constraints
const constrained = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'NEXUS',
    action: 'route',
    payload: {
      messages: [{ role: "user", content: "Generate a haiku" }],
      task_type: "creative",
      constraints: {
        max_latency_ms: 3000,
        max_cost_cents: 5,
        preferred_providers: ["anthropic", "openai"],
        fallback: true
      }
    }
  }),
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Self-Improvement Cycles</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Autonomous background processing. During idle periods, the platform consolidates patterns,
          compresses redundant memories, scores relevance, and surfaces lateral insights that wouldn't
          emerge from direct queries alone.
        </p>
      </div>

      {/* Dream modes */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Processing Modes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={Clock} title="Simnap Mode">
            Quick 30-second consolidation cycle. Compresses recent Hot-tier memories, rescores Warm-tier
            entries, and prunes duplicates. Runs automatically every 15 minutes during low-traffic periods.
            Minimal compute cost — designed for always-on operation.
          </InfoCard>
          <InfoCard icon={Brain} title="Deep Processing Mode">
            Full synthesis cycle (2-5 minutes). Cross-references all memory tiers, identifies latent patterns
            across categories, generates heuristics, and prunes stale entries. Runs daily during lowest-traffic
            window or can be triggered manually.
          </InfoCard>
        </div>
      </div>

      <CodeBlock title="DREAM Engine API via REST">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Trigger a simnap (quick consolidation)
const res = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'DREAM',
    action: 'trigger',
    payload: { mode: "simnap" }
  }),
});
// → { memories_compressed: 42, duplicates_pruned: 7, duration_ms: 28400 }

// Trigger a deep processing cycle
const deep = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'DREAM',
    action: 'trigger',
    payload: {
      mode: "deep",
      cross_reference: true,
      generate_heuristics: true,
      prune_threshold: 0.1
    }
  }),
});
// → { memories_consolidated: 847, heuristics_generated: 3,
//    patterns_discovered: 12, pruned: 156, duration_ms: 187000 }`}</CodeBlock>

      {/* What dreams produce */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Cycle Outputs</h3>
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
        <strong>Processing consent:</strong> For multi-tenant deployments, background processing can be configured per-tenant.
        Tenants can opt in/out of global pattern pooling, heuristic sharing, and template sharing independently.
      </Callout>
    </div>
  );
}

function DefenseSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">DEFENSE Layer</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Enterprise-grade security built into the platform core. DEFENSE is the outermost boundary —
          the security layer that every request must pass through before reaching any other module.
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
              <f.icon className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">{f.label}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock title="DEFENSE Layer configuration via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Run a security scan
const res = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'DEFENSE',
    action: 'scan',
    payload: {
      target: "example.com",
      scan_type: "full",
      wcag_level: "AA"
    }
  }),
});
// → { score: 87, issues: [...], recommendations: [...] }`}</CodeBlock>

      {/* Compliance */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Compliance & Certifications</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {["SOC 2 Type II", "GDPR Ready", "HIPAA Eligible", "WCAG 2.2 AA", "CCPA Compliant", "ISO 27001"].map(c => (
            <div key={c} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40 bg-card/30 text-sm">
              <Check className="w-3.5 h-3.5 text-neon-green shrink-0" />
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">EVOLUTION Layer</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Governed self-improvement. EVOLUTION manages version control, shadow testing, and promotion of
          system changes — ensuring the platform improves over time while maintaining integrity guarantees.
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
          estimates blast radius (which primitives affected), and projects confidence level. No production state is modified.
        </InfoCard>
        <InfoCard icon={RefreshCw} title="One-Click Rollback">
          Manages restoration of immutable snapshots. Lists available snapshots with timestamps and health scores.
          Automatic post-restore health verification. All rollback events are audited.
        </InfoCard>
        <InfoCard icon={Activity} title="Scan Trend Dashboard">
          Visualizes health over time with trend lines, technical debt reduction curves, primitive-by-primitive breakdown,
          and alert threshold markers. Identifies patterns in evolution success rates.
        </InfoCard>
        <InfoCard icon={GitBranch} title="Shadow Testing">
          Run proposed changes in parallel with production using shadow traffic. Compare outcomes without
          risk. Validate behavior before promotion.
        </InfoCard>
      </div>

      <CodeBlock title="EVOLUTION Layer API via REST">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Scan current system state
const scan = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({ module: 'EVOLUTION', action: 'scan' }),
}).then(r => r.json());
// → { health_score: 94.2, improvements: [...], debt_items: 3 }

// Run a dry-run of proposed changes
const preview = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'EVOLUTION',
    action: 'dry_run',
    payload: {
      changes: scan.data.improvements,
      target_primitives: ["BRAIN", "NEXUS"]
    }
  }),
}).then(r => r.json());
// → { projected_health: 96.1, delta: +1.9 }`}</CodeBlock>


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
          Extend platform functionality with custom hooks that run before or after system actions.
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

      <CodeBlock title="Register extensions via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Register a pre-query brain hook
await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'INTEGRATION',
    action: 'register_hook',
    payload: {
      name: 'pii-filter',
      extension_type: 'brain_hook',
      hook_point: 'pre_query',
      endpoint_url: 'https://your-api.com/hooks/pii-filter',
      timeout_ms: 5000,
      fail_open: true
    }
  }),
});

// List registered extensions
const res = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({ module: 'INTEGRATION', action: 'list_hooks' }),
}).then(r => r.json());`}</CodeBlock>

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
          persistent memory, continuous learning, and sealed runtime environment.
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

      <CodeBlock title="Create & orchestrate agents via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Create a specialized agent
const researcher = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'CORTEX',
    action: 'create_agent',
    payload: {
      name: 'ResearchAgent',
      system_prompt: 'You are a research specialist.',
      provider: 'anthropic',
      model: 'claude-sonnet',
      memory_scope: 'agent'
    }
  }),
}).then(r => r.json());

// Run agents with debate pattern
const result = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'CORTEX',
    action: 'run',
    payload: {
      agent_ids: [researcher.data.id, analyst_id],
      prompt: 'Evaluate the ROI of implementing persistent memory',
      pattern: 'debate',
      max_rounds: 3,
      consensus_threshold: 0.8
    }
  }),
}).then(r => r.json());
// → { consensus: true, conclusion: "...", rounds: 2 }`}</CodeBlock>

      {/* Agent capabilities */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Built-in Agent Capabilities</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Auto-Tiering Memory", desc: "Each agent has its own 4-tier memory that auto-manages itself" },
            { label: "Continuous Learning", desc: "Agents improve around the clock from every interaction" },
            { label: "RIPPLE Orchestrator", desc: "Internal event bus for coordination between agents" },
            { label: "Version Minting", desc: "Purchase an agent and receive a unique snapshot of its learned state" },
            { label: "DECODE Channel", desc: "Natural language interface for direct agent interaction" },
            { label: "Sealed Runtime", desc: "Black-box execution — agent internals are tamper-proof" },
          ].map(f => (
            <div key={f.label} className="p-3 rounded-xl border border-border/50 bg-card/30">
              <h4 className="font-semibold text-xs mb-1">{f.label}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
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
          Connect external services through the INTEGRATION module. Manage credentials, invoke APIs,
          and receive webhooks — all within the platform's governance and audit boundaries.
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

      <CodeBlock title="Connect and use integrations via REST API">{`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
};

// Connect Stripe
await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'INTEGRATION',
    action: 'connect',
    payload: {
      name: 'My Stripe',
      integration_type: 'stripe',
      credentials: { api_key: 'sk_live_...' },
      webhook_secret: 'whsec_...'
    }
  }),
});

// Invoke an integration action
const customer = await fetch(GATEWAY, {
  method: 'POST', headers,
  body: JSON.stringify({
    module: 'INTEGRATION',
    action: 'call',
    payload: {
      integration_id: 'integration-id',
      method: 'customers.create',
      data: { email: 'user@example.com', name: 'Jane Doe' }
    }
  }),
}).then(r => r.json());`}</CodeBlock>

      <Callout type="info">
        All integration credentials are encrypted at rest. API calls through integrations are logged to the
        AUDIT chain and subject to the same rate limiting and governance policies as direct platform calls.
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
          All platform actions are sent via <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded font-mono">POST</code> to a
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
                <Badge className="bg-neon-green/15 text-neon-green border-neon-green/30 text-xs font-mono px-2">
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

      {/* NPM Packages */}
      <div>
        <h3 className="font-semibold mb-3">NPM Packages</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Published packages under the <code className="text-primary font-mono">@cmpsbl</code> org on NPM. Install only what you need.
        </p>
        <CodeBlock title="Install">{`npm i @cmpsbl/sdk @cmpsbl/types @cmpsbl/runtime @cmpsbl/cli`}</CodeBlock>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          {[
            { pkg: '@cmpsbl/sdk', desc: 'Authenticated Substrate API client' },
            { pkg: '@cmpsbl/types', desc: 'Shared TypeScript schemas' },
            { pkg: '@cmpsbl/runtime', desc: 'Mini-Runtime™ engine' },
            { pkg: '@cmpsbl/cli', desc: 'CLI developer tools' },
            { pkg: '@cmpsbl/failsafe', desc: 'Zero-dep migration toolkit' },
          ].map(p => (
            <div key={p.pkg} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-card/50 text-xs">
              <Package className="w-3 h-3 text-primary shrink-0" />
              <code className="font-mono font-semibold">{p.pkg}</code>
              <span className="text-muted-foreground ml-auto hidden sm:inline">{p.desc}</span>
            </div>
          ))}
        </div>
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const ActiveComponent = sectionComponents[active] || OverviewSection;
  const activeSection = sections.find(s => s.id === active);

  const handleNav = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="Documentation — API & Module Reference | CMPSBL"
        description="Complete CMPSBL technical docs: BRAIN memory API, NEXUS routing, self-improvement cycles, DEFENSE security, EVOLUTION system, SDK guides, and full 40-module integration reference."
        canonical="https://cmpsbl.com/documentation"
        image="https://cmpsbl.com/og/documentation.jpg"
        keywords={['CMPSBL documentation', 'platform docs', 'AI API reference', 'persistent memory API', 'AI module reference']}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div
          className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 55%)" }}
        />
      </div>

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
              Platform <span className="text-primary">Documentation</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Everything you need to build on the platform — persistent memory, self-improvement cycles,
              smart routing, governed evolution, and complete API reference.{" "}
              <span className="text-primary font-medium">100% BYOK.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Mobile: sticky section selector button ── */}
      <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-2.5">
          <button
            onClick={() => setMobileNavOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm min-h-[48px] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              {activeSection && <activeSection.icon className={cn("w-4 h-4", activeSection.color)} />}
              <span className="text-sm font-medium text-foreground">{activeSection?.label || "Overview"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {sections.findIndex(s => s.id === active) + 1}/{sections.length}
              </span>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                mobileNavOpen && "rotate-90"
              )} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile: full nav drawer ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-border/50 bg-background shadow-2xl"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-4 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Sections</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleNav(s.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] text-left",
                        active === s.id
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                          : "text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 border border-transparent"
                      )}
                    >
                      <s.icon className={cn("w-4 h-4 shrink-0", active === s.id ? "text-primary" : s.color)} />
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>

                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Libraries</h3>
                <div className="grid grid-cols-1 gap-2 mb-6">
                  <Link
                    to="/docs/users"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3.5 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/30 min-h-[48px] transition-colors"
                  >
                    <BookOpen className="w-4 h-4 shrink-0 text-[hsl(var(--neon-cyan))]" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block">User & Developer Library</span>
                      <span className="text-xs text-muted-foreground">API, CLI, webhooks, guides</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </Link>
                  <Link
                    to="/docs/system"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3.5 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/30 min-h-[48px] transition-colors"
                  >
                    <Cpu className="w-4 h-4 shrink-0 text-[hsl(var(--neon-purple))]" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block">System Reference Library</span>
                      <span className="text-xs text-muted-foreground">Architecture, specs, security</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content area — sidebar + main */}
      <div className="container mx-auto px-4 py-6 sm:py-12">
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
              <div className="my-2 mx-2 border-t border-border/30" />
              <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Libraries</p>
              <Link
                to="/docs/users"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <BookOpen className="w-4 h-4 shrink-0 text-[hsl(var(--neon-cyan))]" />
                <span>User Docs</span>
                <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground/40" />
              </Link>
              <Link
                to="/docs/system"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Cpu className="w-4 h-4 shrink-0 text-[hsl(var(--neon-purple))]" />
                <span>System Docs</span>
                <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground/40" />
              </Link>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile: prev/next nav at top */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === active);
                  if (idx > 0) handleNav(sections[idx - 1].id);
                }}
                disabled={sections.findIndex(s => s.id === active) === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[44px]"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Prev
              </button>
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === active);
                  if (idx < sections.length - 1) handleNav(sections[idx + 1].id);
                }}
                disabled={sections.findIndex(s => s.id === active) === sections.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[44px]"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

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

            {/* Mobile: prev/next nav at bottom */}
            <div className="lg:hidden flex items-center justify-between mt-8 pt-6 border-t border-border/30">
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === active);
                  if (idx > 0) handleNav(sections[idx - 1].id);
                }}
                disabled={sections.findIndex(s => s.id === active) === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[44px]"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                {sections.findIndex(s => s.id === active) > 0
                  ? sections[sections.findIndex(s => s.id === active) - 1].label
                  : "Prev"}
              </button>
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === active);
                  if (idx < sections.length - 1) handleNav(sections[idx + 1].id);
                }}
                disabled={sections.findIndex(s => s.id === active) === sections.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[44px]"
              >
                {sections.findIndex(s => s.id === active) < sections.length - 1
                  ? sections[sections.findIndex(s => s.id === active) + 1].label
                  : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
            Deploy your own platform instance and start building with BYOK architecture.
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
        { question: "How do I get started with CMPSBL?", answer: "Create a free account at cmpsbl.com. You get 3 capability slots immediately with full platform access. No credit card required." },
        { question: "Does CMPSBL have an API?", answer: "Yes. The CMPSBL platform exposes a RESTful API with authentication, rate limiting, and full documentation at cmpsbl.com/api-access." },
        { question: "What programming languages does CMPSBL support?", answer: "CMPSBL is language-agnostic. The API works with any language that can make HTTP requests. SDKs are available for JavaScript/TypeScript with more coming." },
      ]} />
      <EnhancedFooter />
    </div>
  );
}
