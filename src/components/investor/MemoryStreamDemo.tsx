/**
 * Memory Stream Demo — SYMBIOTIC Epoch v19
 * Autonomous discovery with curated highlights and compound intelligence narrative.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, ArrowRight, Layers, Sparkles, Shield, Activity, Eye, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveArchetypeName, getDepthTier, getDepthTierStyle } from "@/lib/discovery/chain-archetypes";

const CURATED_DESCRIPTIONS: Record<string, { headline: string; description: string; businessValue: string }> = {
  "Causal Reasoning Engine": {
    headline: "AI That Understands Cause & Effect",
    description: "Performs structured causal inference — not correlations, but real causal chains. Generates counterfactual 'what if' scenarios automatically.",
    businessValue: "Replaces $50K+/yr data science tools for root cause analysis.",
  },
  "Constitutional AI Guardian": {
    headline: "Self-Governing Safety System",
    description: "Enforces constitutional constraints on all autonomous behavior with graduated intervention — gentle nudges to hard blocks.",
    businessValue: "Structural safety solution for regulated industries. Enterprise prerequisite.",
  },
  "Meta-Learning Optimizer": {
    headline: "System That Learns How to Learn",
    description: "Analyzes its own learning history to discover optimal strategies, then applies meta-strategies to accelerate future learning.",
    businessValue: "Compound intelligence — cheaper and faster to run every day.",
  },
  "Component Synthesis Engine": {
    headline: "Automatic Software Generator",
    description: "Generates entirely new software modules by recombining proven patterns. Not copy-paste — genuine synthesis producing tested, production-ready code.",
    businessValue: "Each generated component is IP. The system manufactures sellable products.",
  },
  "Cross-Domain Fusion Reactor": {
    headline: "Innovation Engine Across Disciplines",
    description: "Fuses capabilities from separate domains into novel hybrid pipelines no human would think to combine.",
    businessValue: "Creates new market categories through non-obvious combinations.",
  },
  "Digital Twin Orchestrator": {
    headline: "Safe Experimentation Environment",
    description: "Creates digital twins for risk-free experimentation. Tests changes on replicas before production with automatic regression detection.",
    businessValue: "Zero-risk deployment. Enterprise-critical for finance, healthcare.",
  },
  "Fitness Landscape Navigator": {
    headline: "Optimal Evolution Path Finder",
    description: "Maps the entire fitness landscape and navigates toward optimal evolution paths — strategic mutations, not random.",
    businessValue: "10-100x faster improvement cycles. Every upgrade is optimal.",
  },
  "Hierarchical Weaver": {
    headline: "System Integration Orchestrator",
    description: "Weaves complex multi-layer integrations that would take engineering teams weeks to design.",
    businessValue: "Integration engineering time from weeks to minutes.",
  },
  "Compositional Reasoner": {
    headline: "Predictive System Intelligence",
    description: "Anticipates system events before they happen. Decomposes problems, reassembles solutions proactively.",
    businessValue: "Prevents outages. Fixes problems before users notice.",
  },
  "Spectral Archiver": {
    headline: "Intelligent Evolution Optimizer",
    description: "Uses deep pattern recognition to guide evolutionary optimization — identifies which mutations will succeed.",
    businessValue: "5x more efficient Evolution. Fewer wasted compute cycles.",
  },
};

interface Discovery {
  id: string;
  name: string;
  tier: string;
  cjpi: number;
  category: string;
  module_chain: string[];
  description: string | null;
  created_at: string;
  rationale: string | null;
}

const tierColor = (tier: string) => {
  switch (tier) {
    case "cmpsbl-only": return "text-primary";
    case "enterprise": return "text-neon-amber";
    case "architect": return "text-neon-purple";
    case "prototype": return "text-neon-cyan";
    default: return "text-muted-foreground";
  }
};

const tierLabel = (tier: string) => {
  switch (tier) {
    case "cmpsbl-only": return "Apex";
    case "enterprise": return "Relic";
    case "architect": return "Mythic";
    case "prototype": return "Prime";
    case "experimental": return "Mint";
    default: return tier;
  }
};

const categoryIcon = (category: string) => {
  switch (category) {
    case "cognitive": return <Brain className="w-4 h-4" />;
    case "governance": return <Shield className="w-4 h-4" />;
    case "learning": return <Sparkles className="w-4 h-4" />;
    case "synthesis": return <Layers className="w-4 h-4" />;
    case "evolution": return <Zap className="w-4 h-4" />;
    case "simulation": return <Eye className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

function FeaturedDiscovery({ discovery }: { discovery: Discovery }) {
  const curated = CURATED_DESCRIPTIONS[discovery.name];
  const archetypeName = resolveArchetypeName(discovery.module_chain);
  const depthTier = getDepthTier(discovery.module_chain.length);
  const depthStyle = getDepthTierStyle(depthTier);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between flex-wrap gap-2" style={{ background: "var(--gradient-primary)", opacity: 1 }}>
        <div className="flex items-center gap-2 bg-background/90 rounded-full px-3 py-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Featured Discovery</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${depthStyle} font-semibold`}>{depthTier} · {discovery.module_chain.length}N</span>
          <div className="bg-background/90 rounded-full px-3 py-1">
            <span className={`text-[10px] font-mono font-bold ${tierColor(discovery.tier)}`}>{tierLabel(discovery.tier)} · CJPI {discovery.cjpi}/100</span>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          {archetypeName && <p className="text-[10px] font-mono text-primary/70 tracking-wide mb-1">{archetypeName}</p>}
          <h3 className="text-xl font-black text-foreground tracking-tight">{discovery.name}</h3>
          {curated && <p className="text-sm font-semibold text-primary mt-1">{curated.headline}</p>}
        </div>
        <div className="rounded-xl border border-border/20 bg-muted/30 p-4 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">What It Does</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {curated?.description || discovery.description || `A ${discovery.module_chain.length}-stage pipeline combining ${discovery.module_chain.join(", ")}.`}
          </p>
        </div>
        {curated?.businessValue && (
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Business Value</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{curated.businessValue}</p>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground font-bold">Primitive Chain</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {discovery.module_chain.map((mod, i) => (
              <div key={mod} className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg bg-card border border-border/30 text-foreground font-semibold shadow-sm">{mod}</span>
                {i < discovery.module_chain.length - 1 && <ArrowRight className="w-3 h-3 text-primary/40" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DiscoveryRow({ discovery, index }: { discovery: Discovery; index: number }) {
  const curated = CURATED_DESCRIPTIONS[discovery.name];
  const archetypeName = resolveArchetypeName(discovery.module_chain);
  const depthTier = getDepthTier(discovery.module_chain.length);
  const depthStyle = getDepthTierStyle(depthTier);

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06, duration: 0.4 }}
      className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/15 hover:bg-card/60 transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 ${tierColor(discovery.tier)}`}>
          {categoryIcon(discovery.category)}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-foreground text-sm">{discovery.name}</h4>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
              discovery.tier === "cmpsbl-only" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/30"
            }`}>{tierLabel(discovery.tier)}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${depthStyle} font-semibold`}>{depthTier} · {discovery.module_chain.length}N</span>
          </div>
          {archetypeName && <p className="text-[10px] font-mono text-primary/60 tracking-wide">{archetypeName}</p>}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {curated?.headline || discovery.description || `${discovery.module_chain.join(" → ")} · ${discovery.category}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-mono font-black ${tierColor(discovery.tier)}`}>{discovery.cjpi}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">CJPI</p>
        </div>
      </div>
    </motion.div>
  );
}

export const MemoryStreamDemo = () => {
  const [featured, setFeatured] = useState<Discovery | null>(null);
  const [topDiscoveries, setTopDiscoveries] = useState<Discovery[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const curatedNames = Object.keys(CURATED_DESCRIPTIONS);
      const { data: curatedData } = await supabase
        .from("discoveries")
        .select("id, name, tier, cjpi, category, module_chain, description, created_at, rationale")
        .in("name", curatedNames)
        .order("cjpi", { ascending: false })
        .limit(10);

      if (curatedData && curatedData.length > 0) {
        setFeatured(curatedData[0] as Discovery);
        setTopDiscoveries(curatedData.slice(1) as Discovery[]);
      }
      const { count } = await supabase.from("discoveries").select("id", { count: "exact", head: true });
      setTotalCount(count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Autonomous · No Human Trigger
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow)" }}>
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Memory Stream</h2>
            <p className="text-xs text-muted-foreground">Autonomous Software Discovery Engine</p>
          </div>
        </div>

        {/* Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "How It Works", desc: "8-hour autonomous cycles explore 10²³ primitive combinations. Every cycle surfaces novel capabilities the system invented itself." },
            { label: "Not AI", desc: "Deterministic curing — lexical analysis, structural pattern matching, and CJPI scoring. No neural networks, no LLMs, no probability." },
            { label: "Business Value", desc: "Every discovery is IP. The system manufactures sellable software products from its own patterns — compounding revenue." },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">{card.label}</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live count */}
      <div className="flex items-center gap-5 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.4)" }} />
          <span className="font-bold text-foreground">{totalCount.toLocaleString()}</span> discoveries surfaced
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          8-hour cycles · Live data
        </span>
      </div>

      {featured && <FeaturedDiscovery discovery={featured} />}

      {topDiscoveries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Top Discoveries by CJPI Score</h3>
          <div className="space-y-3">
            {topDiscoveries.map((d, i) => <DiscoveryRow key={d.id} discovery={d} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
};
