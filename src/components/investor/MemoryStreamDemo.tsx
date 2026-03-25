/**
 * Investor Showcase — Memory Stream Demo (Tier 1.1)
 * Story-first: Featured discovery narrative + recent discoveries feed
 * Reads real data from the discoveries table.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, ArrowRight, ChevronDown, Layers, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    case "enterprise": return "text-primary";
    case "architect": return "text-accent-foreground";
    default: return "text-muted-foreground";
  }
};

const tierLabel = (tier: string) => {
  switch (tier) {
    case "cmpsbl-only": return "Apex";
    case "enterprise": return "Enterprise";
    case "architect": return "Architect";
    case "prototype": return "Prototype";
    case "experimental": return "Experimental";
    default: return tier;
  }
};

// ─── Featured Discovery (Story Format) ──────────────────────
const FeaturedDiscovery = ({ discovery }: { discovery: Discovery }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border-2 border-primary/20 bg-card overflow-hidden"
  >
    <div className="px-5 py-3 border-b border-border bg-primary/5 flex items-center justify-between">
      <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Featured Discovery</span>
      <span className={`text-[10px] font-mono font-bold ${tierColor(discovery.tier)}`}>
        {tierLabel(discovery.tier)} · CJPI {discovery.cjpi}
      </span>
    </div>

    <div className="p-5 space-y-5">
      <h3 className="text-lg font-bold text-foreground">{discovery.name}</h3>

      {/* Story: SAW → BUILT → BECAME */}
      <div className="space-y-4">
        {/* What the system SAW */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">The Signal</p>
            <p className="text-sm text-foreground/80">
              The system observed {discovery.module_chain.length} primitives ({discovery.module_chain.join(", ")}) interacting across the {discovery.category} domain and detected a novel coordination pattern.
            </p>
          </div>
        </div>

        <div className="ml-4 w-px h-4 bg-border" />

        {/* What it BUILT */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">The Pipeline</p>
            <p className="text-sm text-foreground/80">
              {discovery.description || `A ${discovery.module_chain.length}-stage pipeline was crystallized, combining ${discovery.module_chain.join(" → ")} into a reusable capability.`}
            </p>
          </div>
        </div>

        <div className="ml-4 w-px h-4 bg-border" />

        {/* What it BECAME */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">The Artifact</p>
            <p className="text-sm text-foreground/80">
              Scored {discovery.cjpi}/100 (CJPI) and classified as <span className="font-semibold">{tierLabel(discovery.tier)}</span>-tier — exportable as a standalone artifact pack with runtime, documentation, and test harness.
            </p>
          </div>
        </div>
      </div>

      {/* Module chain visual */}
      <div className="flex items-center gap-1.5 flex-wrap pt-2">
        {discovery.module_chain.map((mod, i) => (
          <div key={mod} className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-muted border border-border text-foreground">
              {mod}
            </span>
            {i < discovery.module_chain.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Recent Discovery Card ──────────────────────────────────
const RecentCard = ({ discovery }: { discovery: Discovery }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <div className="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0">
      <Zap className="w-3.5 h-3.5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{discovery.name}</p>
      <p className="text-[10px] text-muted-foreground">
        {discovery.module_chain.join(" → ")} · {discovery.category}
      </p>
    </div>
    <div className="text-right shrink-0">
      <p className={`text-xs font-mono font-bold ${tierColor(discovery.tier)}`}>{discovery.cjpi}</p>
      <p className="text-[10px] text-muted-foreground">{tierLabel(discovery.tier)}</p>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────
export const MemoryStreamDemo = () => {
  const [featured, setFeatured] = useState<Discovery | null>(null);
  const [recent, setRecent] = useState<Discovery[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Featured: highest CJPI with a good description
      const { data: featuredData } = await supabase
        .from("discoveries")
        .select("id, name, tier, cjpi, category, module_chain, description, created_at, rationale")
        .not("description", "is", null)
        .order("cjpi", { ascending: false })
        .limit(1);

      if (featuredData?.[0]) {
        setFeatured(featuredData[0] as Discovery);
      }

      // Recent: next 8 by date
      const { data: recentData } = await supabase
        .from("discoveries")
        .select("id, name, tier, cjpi, category, module_chain, description, created_at, rationale")
        .order("created_at", { ascending: false })
        .limit(8);

      if (recentData) setRecent(recentData as Discovery[]);

      // Total count
      const { count } = await supabase
        .from("discoveries")
        .select("id", { count: "exact", head: true });
      
      setTotalCount(count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WHAT / WHY / VALUE header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Memory Stream</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            CORE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What You're Seeing</p>
            <p className="text-xs text-foreground/80">The system observes its own behavior and discovers new software pipelines — autonomously, without human input.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-3 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
              <p className="text-xs text-foreground/80">No other system discovers its own capabilities. Self-improving infrastructure.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
              <p className="text-xs text-foreground/80">Every discovery is potential IP. The system generates its own products.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live stats bar */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {totalCount.toLocaleString()} discoveries
        </span>
        <span>Live data — not simulated</span>
      </div>

      {/* Featured discovery story */}
      {featured && <FeaturedDiscovery discovery={featured} />}

      {/* Recent discoveries */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Recent Discoveries</h3>
        </div>
        <div className="px-4 py-1">
          {recent.map((d) => (
            <RecentCard key={d.id} discovery={d} />
          ))}
        </div>
      </div>
    </div>
  );
};
