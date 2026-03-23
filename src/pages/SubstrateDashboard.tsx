/**
 * CMPSBL Substrate Dashboard
 * Production Module Architecture
 *
 * Unified control center for all entities, mesh overlays, and zones:
 * 
 * KERNEL LAYER:
 * - Core: Kernel scheduler, lifecycle, orchestration
 * - Ripple: Message bus, pub/sub, queues
 * - Access: API keys, billing, metering
 * 
 * COGNITIVE LAYER:
 * - Brain: Memory, learning, reflection
 * - Decode: Intent decoding, chat, dreams
 * - Dream: Dream-Eater operations, nightly processing
 * 
 * OPERATIONAL LAYER:
 * - Defense: Bot detection, threat analysis
 * - Nexus: Multi-provider AI routing
 * - Vision: Observability, metrics, health
 * 
 * ADMINISTRATIVE LAYER:
 * - System: Administration, configuration
 * - Evolution: Bounded self-evolution, governed upgrades
 * - Integration: Enterprise adapters, LLM governance
 * - Inclusive: Human compatibility, WCAG, a11y
 * 
 * ORCHESTRATOR LAYER:
 * - Cortex: Agency orchestrator, evolution, governance
 */

import { useState, useEffect } from "react";
import { 
  Brain, Shield, MessageSquare, Zap, Eye, Activity, RefreshCw, 
  CheckCircle2, AlertTriangle, Layers, ArrowRight, Cpu, Radio, 
  Key, Settings, Sparkles, Plug, Wand2, Accessibility, Moon,
  Database, Network, ClipboardCheck, Fingerprint, Coins, Box, FileCode,
  Compass, AudioLines, Dna, Ghost, Scale, Globe, Hammer, Languages, Wheat,
  Gauge, Orbit, HeartPulse, Siren,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { substrate } from "@/lib/substrate";
import { useSubstrateContext } from "@/components/substrate/SubstrateProvider";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { DefenseAnalytics } from "@/components/substrate-os/DefenseAnalytics";

interface SubstrateStatus {
  healthy: boolean;
  checks: {
    brain: boolean;
    defense: boolean;
    nexus: boolean;
  };
  version: string;
}

interface SubstrateMetrics {
  brain_memories: number;
  defense_events: number;
  decode_conversations: number;
}

// 40-primitive / 4-category field-based topology organized by layer
const modulesByLayer = {
  kernel: [
    {
      id: "core",
      name: "CORE",
      description: "Kernel scheduler, lifecycle, orchestration",
      icon: Cpu,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["init", "status", "schedule", "lifecycle"],
    },
    {
      id: "ripple",
      name: "RIPPLE Organ",
      description: "Message bus, pub/sub, queues",
      icon: Radio,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      actions: ["publish", "subscribe", "queue", "broadcast"],
    },
    {
      id: "access",
      name: "ACCESS Organ",
      description: "API keys, billing, metering",
      icon: Key,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["validate", "meter", "quota", "billing"],
    },
  ],
  cognitive: [
    {
      id: "brain",
      name: "BRAIN Organ",
      description: "Memory, learning cycles, reflection",
      icon: Brain,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      actions: ["query", "remember", "reflect", "reinforce", "dream"],
    },
    {
      id: "decode",
      name: "DECODE Agent",
      description: "Intent decoding, chat, oracle",
      icon: MessageSquare,
      color: "text-neon-blue",
      bg: "bg-neon-blue/10",
      actions: ["chat", "propose", "interpret", "status"],
    },
    {
      id: "dream",
      name: "DREAM Engine",
      description: "Dream-Eater operations, nightly processing",
      icon: Moon,
      color: "text-primary",
      bg: "bg-primary/10",
      actions: ["process", "consolidate", "analyze", "schedule"],
    },
  ],
  operational: [
    {
      id: "nerve",
      name: "NERVE Organ",
      description: "Signal propagation, consensus repair",
      icon: Activity,
      color: "text-neon-magenta",
      bg: "bg-neon-magenta/10",
      actions: ["propagate", "consensus", "repair", "status"],
    },
    {
      id: "nexus",
      name: "NEXUS Organ",
      description: "Multi-provider AI routing",
      icon: Zap,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["route", "fallback", "balance", "status"],
    },
    {
      id: "vision",
      name: "VISION Agent",
      description: "Observability, metrics, health",
      icon: Eye,
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      actions: ["health", "metrics", "trace", "alert"],
    },
  ],
  admin: [
    {
      id: "system",
      name: "SYSTEM Organ",
      description: "Administration, configuration",
      icon: Settings,
      color: "text-gray-400",
      bg: "bg-gray-400/10",
      actions: ["config", "audit", "backup", "restore"],
    },
    {
      id: "integration",
      name: "INTEGRATION Organ",
      description: "Enterprise adapters, LLM governance",
      icon: Plug,
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      actions: ["connect", "discover", "govern", "sync"],
    },
    {
      id: "inclusive",
      name: "INCLUSIVE Layer",
      description: "Human compatibility, WCAG, a11y",
      icon: Accessibility,
      color: "text-neon-magenta",
      bg: "bg-neon-magenta/10",
      actions: ["scan", "repair", "validate", "profile", "report"],
    },
    {
      id: "medic",
      name: "MEDIC Engine",
      description: "Self-healing diagnostics & recovery",
      icon: HeartPulse,
      color: "text-destructive",
      bg: "bg-destructive/10",
      actions: ["diagnose", "heal", "triage", "status"],
    },
  ],
  orchestrator: [
    {
      id: "cortex",
      name: "CORTEX Engine",
      description: "Agency orchestrator, evolution, governance",
      icon: Wand2,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      actions: ["propose", "evaluate", "apply", "audit", "learn"],
    },
  ],
  infrastructure: [
    {
      id: "memory",
      name: "MEMORY Organ",
      description: "Embedding store, staleness detection, relevance feedback",
      icon: Database,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      actions: ["store", "recall", "compress", "stale-check"],
    },
    {
      id: "relay",
      name: "RELAY Organ",
      description: "HMAC verification, adaptive retry, webhook dispatch",
      icon: Network,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      actions: ["dispatch", "verify", "retry", "status"],
    },
    {
      id: "audit",
      name: "AUDIT",
      description: "Compliance templates, log compression, SOC2/GDPR",
      icon: ClipboardCheck,
      color: "text-slate-400",
      bg: "bg-slate-400/10",
      actions: ["log", "compress", "export", "compliance"],
    },
    {
      id: "identity",
      name: "IDENTITY",
      description: "Actor reputation, passkeys, biometric portability",
      icon: Fingerprint,
      color: "text-neon-magenta",
      bg: "bg-neon-magenta/10",
      actions: ["register", "authenticate", "reputation", "passkey"],
    },
    {
      id: "economy",
      name: "ECONOMY",
      description: "Predictive cost forecasting, per-capability attribution",
      icon: Coins,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["forecast", "attribute", "budget", "report"],
    },
    {
      id: "sandbox",
      name: "SANDBOX",
      description: "Resource limits, state snapshots, isolated execution",
      icon: Box,
      color: "text-lime-500",
      bg: "bg-lime-500/10",
      actions: ["create", "snapshot", "restore", "enforce"],
    },
    {
      id: "encode",
      name: "ENCODE",
      description: "Structural generation, filesystem-aware, error patterns",
      icon: FileCode,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      actions: ["generate", "validate", "structure", "pattern"],
    },
  ],
  // ── Ethical Sovereignty Zone (ESZ) ──
  esz: [
    {
      id: "sovereign",
      name: "SOVEREIGN",
      description: "Ethical policy engine, consent enforcement",
      icon: Scale,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["enforce", "consent", "policy", "audit"],
    },
    {
      id: "oracle",
      name: "ORACLE",
      description: "Predictive analytics, scenario simulation",
      icon: Compass,
      color: "text-primary",
      bg: "bg-primary/10",
      actions: ["predict", "simulate", "foresight", "calibrate"],
    },
    {
      id: "conscience",
      name: "CONSCIENCE",
      description: "Moral reasoning, value alignment verification",
      icon: Globe,
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      actions: ["evaluate", "align", "flag", "report"],
    },
    {
      id: "treaty",
      name: "TREATY",
      description: "Inter-system agreements, trust federation",
      icon: ClipboardCheck,
      color: "text-neon-blue",
      bg: "bg-neon-blue/10",
      actions: ["negotiate", "ratify", "verify", "revoke"],
    },
  ],
  // ── Engine Performance Zone (EPZ) ──
  epz: [
    {
      id: "compass",
      name: "COMPASS",
      description: "Navigation heuristics, path optimization",
      icon: Compass,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      actions: ["navigate", "optimize", "calibrate", "explore"],
    },
    {
      id: "echo",
      name: "ECHO",
      description: "Pattern detection, signal amplification",
      icon: AudioLines,
      color: "text-sky-300",
      bg: "bg-sky-300/10",
      actions: ["detect", "amplify", "correlate", "replay"],
    },
    {
      id: "reflex",
      name: "REFLEX",
      description: "Rapid response, instinctive routing",
      icon: Zap,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["trigger", "route", "respond", "throttle"],
    },
  ],
  // ── Evolution Manufacturing Zone (EMZ) ──
  emz: [
    {
      id: "forge",
      name: "FORGE",
      description: "Artifact production, template smithing",
      icon: Hammer,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["craft", "temper", "mint", "catalog"],
    },
    {
      id: "lingua",
      name: "LINGUA",
      description: "Translation, localization, semantic bridging",
      icon: Languages,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      actions: ["translate", "localize", "bridge", "validate"],
    },
    {
      id: "harvest",
      name: "HARVEST",
      description: "Data ingestion, ETL processes, enrichment",
      icon: Wheat,
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      actions: ["ingest", "transform", "enrich", "schedule"],
    },
  ],
  // ── Cognitive Shadow Zone (CSZ) ──
  csz: [
    {
      id: "evolution",
      name: "EVOLUTION",
      description: "Self-improvement lifecycle, mutation process",
      icon: Dna,
      color: "text-neon-magenta",
      bg: "bg-neon-magenta/10",
      actions: ["mutate", "evaluate", "promote", "rollback"],
    },
    {
      id: "shadow",
      name: "SHADOW",
      description: "Adversarial probing, trust surface analysis",
      icon: Ghost,
      color: "text-slate-300",
      bg: "bg-slate-300/10",
      actions: ["probe", "analyze", "escalate", "stealth"],
    },
    {
      id: "phantom",
      name: "PHANTOM",
      description: "Simulation doubles, canary deployment",
      icon: Ghost,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      actions: ["spawn", "mirror", "canary", "dissolve"],
    },
  ],
  // ── Fields ──
  fields: [
    {
      id: "immunity",
      name: "IMMUNITY",
      description: "Cascade breaking, anomaly signature training",
      icon: Shield,
      color: "text-destructive",
      bg: "bg-destructive/10",
      actions: ["isolate", "quarantine", "heal", "vaccinate"],
    },
    {
      id: "intent",
      name: "INTENT",
      description: "Goal decomposition, capability mesh routing",
      icon: Orbit,
      color: "text-neon-blue",
      bg: "bg-neon-blue/10",
      actions: ["route", "classify", "approve", "trace"],
    },
  ],
  // ── Plane ──
  plane: [
    {
      id: "governance",
      name: "GOVERNANCE",
      description: "Policy mesh, veto precision, compliance",
      icon: Gauge,
      color: "text-neon-amber",
      bg: "bg-neon-amber/10",
      actions: ["enforce", "audit", "policy", "override"],
    },
    {
      id: "engineer",
      name: "ENGINEER",
      description: "Engine health scoring, maintenance scheduling",
      icon: Settings,
      color: "text-stone-400",
      bg: "bg-stone-400/10",
      actions: ["diagnose", "schedule", "optimize", "report"],
    },
    {
      id: "atlas",
      name: "ATLAS",
      description: "Capability discovery, dependency mapping",
      icon: Globe,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      actions: ["discover", "map", "govern", "audit"],
    },
  ],
  // ── Shell ──
  shell: [
    {
      id: "defense",
      name: "DEFENSE",
      description: "Bot detection, behavioral fingerprinting, perimeter security",
      icon: Siren,
      color: "text-neon-magenta",
      bg: "bg-neon-magenta/10",
      actions: ["detect", "block", "fingerprint", "report"],
    },
  ],
};

// Flatten all modules for iteration
const allModules = [
  ...modulesByLayer.kernel,
  ...modulesByLayer.cognitive,
  ...modulesByLayer.operational,
  ...modulesByLayer.admin,
  ...modulesByLayer.orchestrator,
  ...modulesByLayer.infrastructure,
  ...modulesByLayer.esz,
  ...modulesByLayer.epz,
  ...modulesByLayer.emz,
  ...modulesByLayer.csz,
  ...modulesByLayer.fields,
  ...modulesByLayer.plane,
  ...modulesByLayer.shell,
];

const layerLabels: Record<string, { label: string; color: string }> = {
  kernel: { label: "KERNEL", color: "text-neon-amber border-neon-amber/30" },
  cognitive: { label: "COGNITIVE", color: "text-neon-purple border-neon-purple/30" },
  operational: { label: "OPERATIONAL", color: "text-neon-blue border-neon-blue/30" },
  admin: { label: "ADMIN", color: "text-neon-green border-neon-green/30" },
  orchestrator: { label: "ORCHESTRATOR", color: "text-neon-purple border-neon-purple/30" },
  infrastructure: { label: "INFRASTRUCTURE", color: "text-neon-cyan border-neon-cyan/30" },
  esz: { label: "ESZ — ETHICAL SOVEREIGNTY", color: "text-neon-amber border-neon-amber/30" },
  epz: { label: "EPZ — ENGINE PERFORMANCE", color: "text-sky-300 border-sky-400/30" },
  emz: { label: "EMZ — EVOLUTION MANUFACTURING", color: "text-neon-green border-neon-green/30" },
  csz: { label: "CSZ — COGNITIVE SHADOW", color: "text-neon-magenta border-neon-magenta/30" },
  fields: { label: "FIELDS", color: "text-destructive border-destructive/30" },
  plane: { label: "PLANE", color: "text-neon-amber border-neon-amber/30" },
  shell: { label: "SHELL", color: "text-neon-magenta border-neon-magenta/30" },
};

export default function SubstrateDashboard() {
  const { initialized, modules: contextModules, overallHealth, refresh: contextRefresh } = useSubstrateContext();
  const [status, setStatus] = useState<SubstrateStatus | null>(null);
  const [metrics, setMetrics] = useState<SubstrateMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStatus = async () => {
    try {
      const visionHealth = await substrate.vision.health();
      const visionMetrics = await substrate.vision.metrics();
      
      if (visionHealth.success && visionHealth.data) {
        setStatus(visionHealth.data as unknown as SubstrateStatus);
      }

      if (visionMetrics.success && visionMetrics.data) {
        const metricsData = visionMetrics.data as { metrics?: SubstrateMetrics };
        if (metricsData.metrics) {
          setMetrics(metricsData.metrics);
        }
      }
    } catch (error) {
      console.error("Status fetch error:", error);
      toast.error("Failed to fetch substrate status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dashboard — Primitive Health & Stream Metrics | CMPSBL"
        description="CMPSBL substrate dashboard: real-time primitive health across agents, engines, layers, and organs — Memory Stream crystallization metrics, mesh communication logs, governance status, and per-primitive telemetry at a glance."
        canonical="https://cmpsbl.com/substrate"
        keywords={["cognitive orchestration", "AI substrate", "CMPSBL dashboard", "primitive architecture", "cortex"]}
      />

      <PublicNav />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 md:mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Layers className="w-3 h-3 mr-2" />
            Live Infrastructure — Entities + Meshes + Zones
          </Badge>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">CMPSBL Substrate</h1>
              <p className="text-sm md:text-base text-muted-foreground">40-Primitive Cognitive Architecture · Agents · Engines · Layers · Organs</p>
            </div>
          </div>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-6">
            The complete cognitive operating system — 40 primitives coordinated by a weighted matrix where Σ = 1.000. The CORE Organ boots every primitive in dependency order, the DEFENSE Layer wraps the outer shell, and the DREAM Engine synthesizes improvements autonomously.
          </p>
          
          <div className="flex gap-3">
            <Link to="/investors">
              <Button variant="outline" size="sm" className="gap-2 hover:border-primary/30 transition-all duration-200">
                Acquisition Info
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/docs/substrate/capabilities">
              <Button variant="outline" size="sm" className="gap-2 hover:border-primary/30 transition-all duration-200">
                SDK Docs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">

        {/* Status Bar */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8 border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {status?.healthy ? (
                <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20 gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All Systems Operational
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Degraded Performance
                </Badge>
              )}
              <span className="text-xs md:text-sm text-muted-foreground">
                Version: {status?.version || "loading..."}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
            <Card className="p-4 md:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-3 md:gap-4">
                <Brain className="w-6 h-6 md:w-8 md:h-8 text-neon-purple shrink-0" />
                <div>
                  <p className="text-xl md:text-2xl font-bold font-mono tabular-nums">{metrics.brain_memories.toLocaleString()}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Brain Memories</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-3 md:gap-4">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-destructive shrink-0" />
                <div>
                  <p className="text-xl md:text-2xl font-bold font-mono tabular-nums">{metrics.defense_events.toLocaleString()}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Defense Events</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-3 md:gap-4">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-neon-blue shrink-0" />
                <div>
                  <p className="text-xl md:text-2xl font-bold font-mono tabular-nums">{metrics.decode_conversations?.toLocaleString() || 0}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Conversations</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modules Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Scrollable tabs for mobile - NO overlap */}
          <div className="relative">
             <ScrollArea className="w-full">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-lg w-max min-w-full md:w-full md:grid md:grid-cols-6 gap-1">
                <TabsTrigger value="overview" className="px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                  Overview ({allModules.length})
                </TabsTrigger>
                <TabsTrigger value="defense" className="px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                  🛡️ Defense
                </TabsTrigger>
                <TabsTrigger value="core" className="px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                  Core Layers (21)
                </TabsTrigger>
                <TabsTrigger value="zones" className="px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                  Expansion Zones (14)
                </TabsTrigger>
                <TabsTrigger value="fields" className="px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                  Fields · Plane · Shell (6)
                </TabsTrigger>
                <TabsTrigger value="api" className="px-3 py-2 text-xs md:text-sm whitespace-nowrap">
                  API Reference
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
          </div>

          {/* Defense Analytics - Live Feed */}
          <TabsContent value="defense" className="mt-6">
            <DefenseAnalytics />
          </TabsContent>

          {/* Overview — All entities + meshes + zones */}
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-8">
              {Object.entries(modulesByLayer).map(([layer, modules]) => (
                <div key={layer}>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline" className={`text-[10px] md:text-xs ${layerLabels[layer].color}`}>
                      {layerLabels[layer].label}
                    </Badge>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {modules.length} module{modules.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((module) => (
                      <Card key={module.id} className="p-4 md:p-6 hover:border-primary/30 transition-all duration-300 card-lift">
                        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${module.bg} flex items-center justify-center shrink-0`}>
                            <module.icon className={`w-5 h-5 md:w-6 md:h-6 ${module.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base md:text-lg">{module.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {module.actions.slice(0, 4).map((action) => (
                            <Badge key={action} variant="outline" className="text-[10px] md:text-xs">
                              {action}
                            </Badge>
                          ))}
                          {module.actions.length > 4 && (
                            <Badge variant="outline" className="text-[10px] md:text-xs text-muted-foreground">
                              +{module.actions.length - 4}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Core Layers tab — kernel, cognitive, operational, admin, orchestrator, infrastructure */}
          <TabsContent value="core" className="mt-6">
            <div className="space-y-8">
              {(['kernel', 'cognitive', 'operational', 'admin', 'orchestrator', 'infrastructure'] as const).map(layer => {
                const modules = modulesByLayer[layer];
                return (
                  <div key={layer}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className={`text-[10px] md:text-xs ${layerLabels[layer].color}`}>
                        {layerLabels[layer].label}
                      </Badge>
                      <span className="text-xs md:text-sm text-muted-foreground">{modules.length} modules</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map((module) => (
                        <Card key={module.id} className="p-4 md:p-6 hover:border-primary/30 transition-all duration-300 card-lift">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${module.bg} flex items-center justify-center shrink-0`}>
                              <module.icon className={`w-5 h-5 ${module.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold">{module.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {module.actions.map((action) => (
                              <Badge key={action} variant="outline" className="text-[10px]">{action}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Expansion Zones tab — ESZ, EPZ, EMZ, CSZ */}
          <TabsContent value="zones" className="mt-6">
            <div className="space-y-8">
              {(['esz', 'epz', 'emz', 'csz'] as const).map(layer => {
                const modules = modulesByLayer[layer];
                return (
                  <div key={layer}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className={`text-[10px] md:text-xs ${layerLabels[layer].color}`}>
                        {layerLabels[layer].label}
                      </Badge>
                      <span className="text-xs md:text-sm text-muted-foreground">{modules.length} modules</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map((module) => (
                        <Card key={module.id} className="p-4 md:p-6 hover:border-primary/30 transition-all duration-300 card-lift">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${module.bg} flex items-center justify-center shrink-0`}>
                              <module.icon className={`w-5 h-5 ${module.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold">{module.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {module.actions.map((action) => (
                              <Badge key={action} variant="outline" className="text-[10px]">{action}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Fields + Plane + Shell tabs */}
          <TabsContent value="fields" className="mt-6">
            <div className="mb-6">
              <Badge variant="outline" className={layerLabels.fields.color}>FIELDS · PLANE · SHELL</Badge>
              <p className="text-sm text-muted-foreground mt-2">Cross-cutting layers: immunity isolation, intent routing, governance policy, maintenance intelligence, capability discovery, and perimeter defense.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...modulesByLayer.fields, ...modulesByLayer.plane, ...modulesByLayer.shell].map((module) => (
                <Card key={module.id} className="p-5 hover:border-primary/30 transition-all duration-300 card-lift">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${module.bg} flex items-center justify-center shrink-0`}>
                      <module.icon className={`w-5 h-5 ${module.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{module.name}</h3>
                      <p className="text-xs text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {module.actions.map((action) => (
                      <Badge key={action} variant="outline" className="text-[10px]">{action}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Reference tab */}
          <TabsContent value="api" className="mt-6">
            <Card className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">API Reference</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Base Endpoint</h3>
                  <code className="block bg-muted/30 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
                    POST /functions/v1/pf-substrate
                  </code>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">40-Primitive Architecture ({allModules.length} primitives)</h3>
                  <pre className="bg-muted/30 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
{`{
  "module": "core" | "ripple" | "access" |       // Kernel
            "brain" | "decode" | "dream" |       // Cognitive
            "defense" | "nexus" | "vision" |     // Operational
            "system" | "integration" |           // Admin
            "inclusive" | "medic" |
            "cortex" |                           // Orchestrator
            "memory" | "relay" | "audit" |       // Infrastructure
            "identity" | "economy" | "sandbox" |
            "encode" |
            "sovereign" | "oracle" |             // ESZ
            "conscience" | "treaty" |
            "compass" | "echo" | "reflex" |      // EPZ
            "forge" | "lingua" | "harvest" |     // EMZ
            "evolution" | "shadow" | "phantom" | // CSZ
            "governance" | "intent" |            // Mesh
            "immunity" | "defense_mesh",
  "action": "<module-specific-action>",
  "data": { <action-parameters> }
}`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact */}
        <Card className="p-6 md:p-8 mt-8 border-primary/20 bg-primary/5">
          <h2 className="text-lg md:text-xl font-bold mb-2">Licensing & Inquiries</h2>
          <p className="text-sm text-muted-foreground mb-4">
            CMPSBL® is a registered trademark. For ownership inquiries, licensing arrangements, or enterprise partnerships:
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs md:text-sm">
            <span><strong>Founder:</strong> <a href="https://orcid.org/0009-0001-4237-1243" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Kenneth E Sweet Jr</a></span>
            <span><strong>Email:</strong> Dev@CMPSBL.com</span>
            <span><strong>Phone:</strong> (760) FLUID-AI</span>
          </div>
        </Card>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
