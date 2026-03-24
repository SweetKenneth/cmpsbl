/**
 * Tech Showcase — Interactive demonstration of all CMPSBL execution surfaces
 * Premium terminal-style code display with syntax highlighting
 * 40 primitives across 4 categories
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Moon, 
  Zap, 
  Terminal,
  Copy,
  Check,
  Shield,
  Eye,
  MessageSquare,
  Cpu,
  Radio,
  Key,
  Settings,
  Sparkles,
  Code,
  Layers,
  Plug,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// All execution surfaces organized by architecture layer
const codeExamples = [
  // ORGANS
  {
    id: "core",
    icon: Cpu,
    layer: "Organs",
    title: "CORE Scheduling",
    description: "Kernel orchestration & task scheduling",
    color: "text-[hsl(var(--neon-amber))]",
    gradient: "from-[hsl(var(--neon-amber))] to-[hsl(var(--neon-amber)/0.7)]",
    code: `// Schedule a recurring task with CORE
const task = await cmpsbl.core.schedule({
  name: "daily_memory_cleanup",
  cron: "0 3 * * *", // 3am daily
  handler: "brain.prune",
  params: { threshold: 0.2, dry_run: false }
});

// Check scheduled tasks
const scheduled = await cmpsbl.core.list();
console.log(scheduled.tasks);
// [{ name: "daily_memory_cleanup", next_run: "2026-01-24T03:00:00Z" }]`,
  },
  {
    id: "ripple",
    icon: Radio,
    layer: "Engines",
    title: "RIPPLE Events",
    description: "Event-driven orchestration & cross-system communication",
    color: "text-[hsl(var(--neon-cyan))]",
    gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-cyan)/0.7)]",
    code: `// Publish an event to the message bus
await cmpsbl.ripple.emit({
  channel: "user.actions",
  event: "purchase_completed",
  payload: { user_id: "u_123", amount: 49.99 },
  ttl: 86400 // 24h retention
});

// Subscribe to events across modules
cmpsbl.ripple.on("dream.cycle_complete", (event) => {
  console.log("Dream cycle finished:", event.insights);
});`,
  },
  {
    id: "access",
    icon: Key,
    layer: "Layers",
    title: "ACCESS Identity",
    description: "API keys, metering & access control",
    color: "text-[hsl(var(--neon-amber))]",
    gradient: "from-[hsl(var(--neon-amber))] to-[hsl(var(--neon-amber)/0.7)]",
    code: `// Generate a scoped API key
const apiKey = await cmpsbl.access.createKey({
  name: "mobile-app-prod",
  scopes: ["brain.read", "nexus.route"],
  rate_limit: { requests: 1000, window: "1h" },
  expires_at: "2026-12-31T23:59:59Z"
});

// Check usage metrics
const usage = await cmpsbl.access.usage(apiKey.id);
console.log(usage.calls_today, usage.quota_remaining);`,
  },
  // ORGANS
  {
    id: "brain",
    icon: Brain,
    layer: "Organs",
    title: "BRAIN Memory",
    description: "4-tier persistent memory system",
    color: "text-[hsl(var(--neon-purple))]",
    gradient: "from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-purple)/0.7)]",
    code: `// Store a memory with semantic context
await cmpsbl.brain.remember({
  entity_id: "user_jane_doe",
  memory: {
    type: "preference",
    content: "Prefers dark mode and concise responses",
    emotional_weight: 0.9,
    tier: "hot" // hot/warm/cold
  }
});

// Recall relevant memories
const context = await cmpsbl.brain.recall({
  entity_id: "user_jane_doe",
  query: "communication style",
  limit: 5
});`,
  },
  {
    id: "decode",
    icon: MessageSquare,
    layer: "Agents",
    title: "DECODE Chat",
    description: "Epistemic conversation engine",
    color: "text-[hsl(var(--neon-magenta))]",
    gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-magenta)/0.7)]",
    code: `// Start an epistemic conversation
const session = await cmpsbl.decode.chat({
  context: "onboarding_flow",
  system_prompt: "Guide users through setup",
  memory_scope: "session", // persist to brain after
});

// Continue with memory-aware responses
const reply = await session.send({
  message: "What features should I explore first?",
  include_memories: true
});`,
  },
  {
    id: "nexus",
    icon: Zap,
    layer: "Organs",
    title: "NEXUS Routing",
    description: "Intelligent AI provider fleet management",
    color: "text-[hsl(var(--neon-green))]",
    gradient: "from-[hsl(var(--neon-green))] to-[hsl(var(--neon-green)/0.7)]",
    code: `// Auto-route to optimal provider
const response = await cmpsbl.nexus.route({
  task: "complex_reasoning",
  prompt: userMessage,
  constraints: {
    max_latency_ms: 2000,
    max_cost_cents: 5,
    min_quality: "high"
  },
  fallback_chain: ["gpt-4", "claude-3", "gemini-pro"]
});

console.log(response.provider); // "claude-3"`,
  },
  // OPERATIONAL LAYER
  {
    id: "defense",
    icon: Shield,
    layer: "Layers",
    title: "DEFENSE Security",
    description: "Threat detection & behavioral analysis",
    color: "text-[hsl(var(--neon-magenta))]",
    gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-magenta)/0.7)]",
    code: `// Check security posture
const posture = await cmpsbl.defense.posture();
console.log(posture.threat_level); // "low"

// Analyze request for threats
const analysis = await cmpsbl.defense.analyze({
  ip: request.ip,
  user_agent: request.headers["user-agent"],
  payload: request.body
});

if (analysis.risk_score > 0.7) {
  await cmpsbl.defense.block(request.ip, "24h");
}`,
  },
  {
    id: "vision",
    icon: Eye,
    layer: "Layers",
    title: "VISION Observability",
    description: "System monitoring & health scoring",
    color: "text-[hsl(var(--neon-blue))]",
    gradient: "from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-blue)/0.7)]",
    code: `// Get real-time system health
const health = await cmpsbl.vision.health();
console.log(health.overall); // 98.5
console.log(health.modules); // { brain: 100, nexus: 97, ... }

// Query historical metrics
const metrics = await cmpsbl.vision.query({
  metric: "api_latency_p99",
  range: "24h",
  group_by: "module"
});`,
  },
  {
    id: "dream",
    icon: Moon,
    layer: "Engines",
    title: "DREAM Engine",
    description: "Offline learning & pattern extraction",
    color: "text-[hsl(var(--neon-purple))]",
    gradient: "from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-purple)/0.7)]",
    code: `// Trigger a dream cycle
const dreamResult = await cmpsbl.dream.cycle({
  entity_ids: ["npc_merchant", "npc_guard"],
  mode: "consolidate",
  options: {
    extract_patterns: true,
    prune_weak_memories: true,
    min_confidence: 0.3
  }
});

console.log(dreamResult.patterns_extracted);
// ["player_prefers_stealth", "avoids_combat"]`,
  },
  {
    id: "system",
    icon: Settings,
    layer: "Organs",
    title: "SYSTEM Control",
    description: "Core administration & backups",
    color: "text-[hsl(var(--neon-green))]",
    gradient: "from-[hsl(var(--neon-green))] to-[hsl(var(--neon-green)/0.7)]",
    code: `// Create a system backup
const backup = await cmpsbl.system.backup({
  include: ["brain", "config", "access"],
  compress: true,
  encrypt: true
});

// Restore from backup
await cmpsbl.system.restore({
  backup_id: backup.id,
  target_modules: ["brain"]
});`,
  },
  {
    id: "evolution",
    icon: Sparkles,
    layer: "Layers",
    title: "EVOLUTION Lifecycle",
    description: "Self-improvement & shadow testing",
    color: "text-[hsl(var(--neon-magenta))]",
    gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-magenta)/0.7)]",
    code: `// Scan for improvement opportunities
const proposals = await cmpsbl.evolution.scan({
  scope: ["brain", "nexus"],
  types: ["performance", "security"]
});

// Review and apply a proposal
await cmpsbl.evolution.apply({
  proposal_id: proposals[0].id,
  shadow_test: true, // Test before production
  auto_rollback: true
});`,
  },
  {
    id: "integration",
    icon: Plug,
    layer: "Layers",
    title: "INTEGRATION Enterprise",
    description: "Enterprise adapters & LLM governance",
    color: "text-[hsl(var(--neon-cyan))]",
    gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-cyan)/0.7)]",
    code: `// Discover enterprise systems
const systems = await cmpsbl.integration.discover({
  target: "erp",
  depth: "full"
});

// Connect to SAP with governance
await cmpsbl.integration.connect({
  adapter: "sap_s4hana",
  config: { host: "erp.company.com" },
  governance: { approval_required: true }
});

// Execute governed action
await cmpsbl.integration.execute({
  system: "sap",
  action: "create_purchase_order",
  payload: { vendor: "V001", amount: 5000 }
});`,
  },
  {
    id: "inclusive",
    icon: Code,
    layer: "Agents",
    title: "INCLUSIVE A11y",
    description: "Human compatibility & accessibility engine",
    color: "text-[hsl(var(--neon-magenta))]",
    gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-magenta)/0.7)]",
    code: `// Scan a target for accessibility issues
const result = await cmpsbl.inclusive.scan({
  target: "https://example.com",
  wcagLevel: "AA"
});
console.log(result.issues); // WCAG violations
console.log(result.score);  // 0-100 accessibility score

// Auto-repair detected issues
const repairs = await cmpsbl.inclusive.repair({
  target: result.target,
  issues: result.issues.filter(i => i.autoFixable)
});

// Self-scan the substrate's own interfaces
const selfCheck = await cmpsbl.inclusive.selfScan();`,
  },
  {
    id: "cortex",
    icon: Layers,
    layer: "Agents",
    title: "CORTEX Orchestrator",
    description: "Agency-class autonomous orchestrator",
    color: "text-[hsl(var(--neon-purple))]",
    gradient: "from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-purple)/0.7)]",
    code: `// Get the world state
const world = await cmpsbl.cortex.world({
  flags: ["--eligible", "--dag"]
});
console.log(world.modules_by_category);

// Query evolution sequences
const plans = await cmpsbl.cortex.plan({
  filter: "eligible",
  sort_by: "priority"
});

// Dispatch an evolution proposal
const proposal = await cmpsbl.cortex.dispatch({
  scope: ["brain", "vision"],
  confidence_threshold: 0.85,
  auto_apply: false // Require approval
});`,
  },
  {
    id: "memory",
    icon: Layers,
    layer: "Organs",
    title: "MEMORY Vectors",
    description: "Vector embeddings & RAG orchestration",
    color: "text-[hsl(var(--neon-blue))]",
    gradient: "from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-blue)/0.7)]",
    code: `// Store vector embeddings
await cmpsbl.memory.embed({
  collection: "product_docs",
  documents: [
    { id: "doc_1", content: "Getting started guide..." },
    { id: "doc_2", content: "API reference..." }
  ],
  model: "text-embedding-3-large"
});

// Semantic search with RAG
const results = await cmpsbl.memory.search({
  collection: "product_docs",
  query: "how to authenticate",
  top_k: 5
});`,
  },
  {
    id: "relay",
    icon: Layers,
    layer: "Organs",
    title: "RELAY Webhooks",
    description: "Outbound notifications & event delivery",
    color: "text-[hsl(var(--neon-green))]",
    gradient: "from-[hsl(var(--neon-green))] to-[hsl(var(--neon-green)/0.7)]",
    code: `// Register a webhook endpoint
await cmpsbl.relay.register({
  url: "https://api.company.com/webhook",
  events: ["task.completed", "dream.cycle_done"],
  secret: "whsec_...",
  retry_policy: { max_retries: 3, backoff: "exponential" }
});

// Send a notification
await cmpsbl.relay.notify({
  channel: "email",
  to: "admin@company.com",
  template: "weekly_report",
  data: { period: "2026-W06" }
});`,
  },
  {
    id: "audit",
    icon: Layers,
    layer: "Agents",
    title: "AUDIT Ledger",
    description: "Immutable compliance & audit trail",
    color: "text-[hsl(var(--neon-amber))]",
    gradient: "from-[hsl(var(--neon-amber))] to-[hsl(var(--neon-amber)/0.7)]",
    code: `// Query the audit ledger
const trail = await cmpsbl.audit.query({
  entity_type: "user",
  entity_id: "u_123",
  actions: ["data_access", "config_change"],
  range: "30d"
});

// Export compliance report
const report = await cmpsbl.audit.export({
  format: "pdf",
  standard: "SOC2",
  period: "2026-Q1"
});`,
  },
  {
    id: "identity",
    icon: Layers,
    layer: "Infrastructure",
    title: "IDENTITY Attribution",
    description: "Actor signatures & provenance tracking",
    color: "text-[hsl(var(--neon-magenta))]",
    gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-magenta)/0.7)]",
    code: `// Verify actor identity
const verified = await cmpsbl.identity.verify({
  actor_id: "agent_cortex",
  action: "deploy_patch",
  signature: sig
});

// Get provenance chain
const chain = await cmpsbl.identity.provenance({
  artifact_id: "model_v3.2",
  depth: "full"
});
console.log(chain.origin, chain.transformations);`,
  },
  {
    id: "economy",
    icon: Layers,
    layer: "Infrastructure",
    title: "ECONOMY Budgets",
    description: "Cost attribution & budget enforcement",
    color: "text-[hsl(var(--neon-amber))]",
    gradient: "from-[hsl(var(--neon-amber))] to-[hsl(var(--neon-amber)/0.7)]",
    code: `// Set budget constraints
await cmpsbl.economy.budget({
  scope: "project_alpha",
  monthly_limit_cents: 50000,
  alert_threshold: 0.8
});

// Get cost breakdown
const costs = await cmpsbl.economy.breakdown({
  period: "2026-02",
  group_by: "module"
});
console.log(costs.total, costs.by_module);`,
  },
  {
    id: "sandbox",
    icon: Layers,
    layer: "Infrastructure",
    title: "SANDBOX Isolation",
    description: "Isolated execution environments",
    color: "text-[hsl(var(--neon-cyan))]",
    gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-cyan)/0.7)]",
    code: `// Create an isolated sandbox
const env = await cmpsbl.sandbox.create({
  runtime: "node20",
  memory_mb: 512,
  timeout_ms: 30000,
  network: "restricted"
});

// Execute untrusted code safely
const result = await env.execute({
  code: userProvidedCode,
  args: { data: inputData }
});
console.log(result.output, result.metrics);`,
  },
  // ENCODE
  {
    id: "encode",
    icon: Layers,
    layer: "Cognitive",
    title: "ENCODE Execution",
    description: "Code generation & execution intelligence",
    color: "text-[hsl(var(--neon-amber))]",
    gradient: "from-[hsl(var(--neon-amber))] to-[hsl(var(--neon-amber)/0.7)]",
    code: `// Generate code from intent (via DECODE memory formation)
const result = await cmpsbl.encode.generate({
  intent: "Create a REST API endpoint for user profiles",
  language: "typescript",
  framework: "express",
  preview: true // Score before applying
});

console.log(result.code);        // Generated code
console.log(result.score);       // Quality score 0-100
console.log(result.explanation); // Why this approach

// Apply after review
await cmpsbl.encode.apply(result.id);`,
  },
];

// Syntax highlighting helper - extended for all primitives including Cortex
function highlightCode(code: string): string {
  // Escape HTML first to prevent issues
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Apply syntax highlighting with explicit white base for non-highlighted text
  return escaped
    .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
    .replace(/(\bawait\b|\bconst\b|\blet\b|\bvar\b|\bif\b)/g, '<span class="text-neon-purple">$1</span>')
    .replace(/(\bcmpsbl\b)/g, '<span class="text-neon-cyan font-semibold">$1</span>')
    .replace(/(\.core|\.ripple|\.access|\.brain|\.decode|\.nexus|\.defense|\.vision|\.dream|\.system|\.evolution|\.integration|\.inclusive|\.cortex|\.memory|\.relay|\.audit|\.identity|\.economy|\.sandbox|\.encode)/g, '<span class="text-neon-blue">$1</span>')
    .replace(/(\.schedule|\.list|\.emit|\.on|\.createKey|\.usage|\.remember|\.recall|\.chat|\.send|\.route|\.posture|\.analyze|\.block|\.health|\.query|\.cycle|\.backup|\.restore|\.scan|\.apply|\.discover|\.connect|\.execute|\.world|\.plan|\.dispatch|\.inventory|\.repair|\.selfScan|\.embed|\.search|\.register|\.notify|\.export|\.verify|\.provenance|\.budget|\.breakdown|\.create|\.generate)/g, '<span class="text-neon-green">$1</span>')
    .replace(/(&quot;.*?&quot;|".*?")/g, '<span class="text-neon-amber">$1</span>')
    .replace(/(\d+)/g, '<span class="text-neon-amber">$1</span>')
    .replace(/(true|false|null)/g, '<span class="text-neon-magenta">$1</span>');
}

// Layer configuration for grouping modules
const LAYER_CONFIG = {
  Kernel: { color: 'text-[hsl(var(--neon-amber))]', bgGlow: 'from-[hsl(var(--neon-amber)/0.2)]' },
  Cognitive: { color: 'text-[hsl(var(--neon-purple))]', bgGlow: 'from-[hsl(var(--neon-purple)/0.2)]' },
  Operational: { color: 'text-[hsl(var(--neon-cyan))]', bgGlow: 'from-[hsl(var(--neon-cyan)/0.2)]' },
  Admin: { color: 'text-[hsl(var(--neon-green))]', bgGlow: 'from-[hsl(var(--neon-green)/0.2)]' },
  Infrastructure: { color: 'text-[hsl(var(--neon-blue))]', bgGlow: 'from-[hsl(var(--neon-blue)/0.2)]' },
  Orchestrator: { color: 'text-[hsl(var(--neon-purple))]', bgGlow: 'from-[hsl(var(--neon-purple)/0.2)]' },
  Overlay: { color: 'text-[hsl(var(--neon-magenta))]', bgGlow: 'from-[hsl(var(--neon-magenta)/0.2)]' },
} as const;

export function TechShowcase() {
  const [activeTab, setActiveTab] = useState("brain");
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [typedLines, setTypedLines] = useState(0);
  
  const activeExample = codeExamples.find(e => e.id === activeTab) || codeExamples[0];
  const codeLines = activeExample.code.split('\n');
  
  // Filter by layer if selected
  const filteredExamples = activeLayer 
    ? codeExamples.filter(e => e.layer === activeLayer)
    : codeExamples;
  
  // Memoize code lines to prevent recomputation
  const memoizedCodeLines = useMemo(() => activeExample.code.split('\n'), [activeExample.code]);
  const totalLines = memoizedCodeLines.length;
  
  // Optimized typing effect - batch updates and use refs to avoid stale closures
  useEffect(() => {
    setTypedLines(0);
    let currentLine = 0;
    let rafId: number;
    let lastTime = 0;
    const BATCH_SIZE = 3; // Type 3 lines at once for smoother animation
    const INTERVAL_MS = 50; // Slightly longer interval but batched
    
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;
      
      if (elapsed >= INTERVAL_MS) {
        lastTime = timestamp;
        currentLine = Math.min(currentLine + BATCH_SIZE, totalLines);
        setTypedLines(currentLine);
        
        if (currentLine >= totalLines) return;
      }
      
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [activeTab, totalLines]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <section className="relative py-14 sm:py-32 px-4 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/20 to-muted/30" />
      {/* Subtle flowing accent at top */}
      <div className="absolute inset-x-0 top-0 h-px memory-stream-bar opacity-30" />
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[180px] animate-hero-orb-2 hidden sm:block"
        />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px), 
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="relative inline-block">
            <span className="section-ordinal absolute -top-10 left-1/2 -translate-x-1/2 hidden sm:block" aria-hidden="true">05</span>
          </div>
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Layers className="w-3 h-3 text-primary" />
            <span className="text-xs">40 Primitives • Agents · Engines · Layers · Organs</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
            Complete{" "}
            <span className="text-[hsl(var(--neon-cyan))]">
              Cognitive SDK
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            One unified API for 
            <span className="text-foreground font-medium"> memory</span>, 
            <span className="text-foreground font-medium"> routing</span>, 
            <span className="text-foreground font-medium"> security</span>, 
            <span className="text-foreground font-medium"> evolution</span>, and 
            <span className="text-foreground font-medium"> self-improvement</span>.
          </p>
        </motion.div>
        
        {/* Layer Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6">
          <Button
            variant={activeLayer === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLayer(null)}
            className="h-8 px-4 text-xs font-medium"
          >
            All Surfaces
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{codeExamples.length}</Badge>
          </Button>
          {Object.entries(LAYER_CONFIG).map(([layer, config]) => {
            const count = codeExamples.filter(e => e.layer === layer).length;
            return (
              <Button
                key={layer}
                variant={activeLayer === layer ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLayer(layer)}
                className={cn("h-8 px-4 text-xs font-medium", activeLayer === layer && config.color)}
              >
                {layer}
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{count}</Badge>
              </Button>
            );
          })}
        </div>
        
        {/* Module Tab Navigation - Scrollable on mobile */}
        <div className="relative mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {filteredExamples.map((example, idx) => (
              <motion.button
                key={example.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setActiveTab(example.id)}
                className={cn(
                  "snap-start flex-shrink-0 relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300",
                  activeTab === example.id
                    ? `bg-gradient-to-r ${example.gradient} text-white border-transparent shadow-lg`
                    : "bg-card/50 border-border/50 text-muted-foreground hover:bg-card/80 hover:border-border"
                )}
              >
                <example.icon className="w-4 h-4" />
                <span className="text-xs font-semibold whitespace-nowrap">{example.title.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Premium Code Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Header bar - macOS style */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors cursor-pointer" />
                </div>
                <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-md bg-white/5">
                  <Terminal className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/40 font-mono">cmpsbl-example.ts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-neon-green" />
                      <span className="text-neon-green">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Code content with line numbers - NO animation to prevent overlap */}
            <div
              key={activeTab}
              className="p-3 sm:p-6 overflow-x-auto"
            >
              <div className="flex">
                {/* Line numbers */}
                <div className="pr-4 border-r border-white/10 select-none flex-shrink-0">
                  {codeLines.map((_, idx) => (
                    <div 
                      key={`ln-${activeTab}-${idx}`} 
                      className={cn(
                        "text-xs font-mono text-white/20 text-right h-6 leading-6",
                        idx < typedLines && "text-white/40"
                      )}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                
                {/* Code - using white text for dark terminal background */}
                <div className="pl-4 flex-1 min-w-0">
                  {codeLines.map((line, idx) => (
                    <div
                      key={`code-${activeTab}-${idx}`}
                      className={cn(
                        "text-sm font-mono h-6 leading-6 text-slate-300 whitespace-pre",
                        idx >= typedLines && "invisible"
                      )}
                      dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                    />
                  ))}
                  {typedLines < codeLines.length && (
                    <span className="inline-block w-2 h-5 bg-neon-cyan animate-pulse absolute" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating description card */}
          <motion.div
            key={activeTab + "-desc"}
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden xl:block"
          >
            <div className={cn(
              "p-5 rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl max-w-[240px]",
              "border-border/50"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  `bg-gradient-to-br ${activeExample.gradient}`
                )}>
                  <activeExample.icon className="w-5 h-5 text-white" />
                </div>
                <Badge variant="outline" className={cn(
                  "text-[9px] h-5",
                  LAYER_CONFIG[activeExample.layer as keyof typeof LAYER_CONFIG]?.color
                )}>
                  {activeExample.layer}
                </Badge>
              </div>
              <h4 className="font-bold text-foreground mb-1">{activeExample.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{activeExample.description}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
