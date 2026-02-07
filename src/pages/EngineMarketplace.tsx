/**
 * Orchestration Engine Marketplace (OEM)
 * First-party, canonized orchestrations hardened for reliable execution
 * v2.0.0 — Real pricing tiers, no "contact sales" placeholders
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Terminal,
  Shield,
  Zap,
  Brain,
  Search,
  Crown,
  Check,
  Layers,
  Sparkles,
  Info,
  Package,
  Network,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Engine tier types
type EngineTier = 'free' | 'standard' | 'advanced' | 'meta';

// First-party engine definitions with real pricing
const OEM_ENGINES: {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: EngineTier;
  price: number; // in dollars, 0 = free
  features: string[];
  isMetaEngine?: boolean;
}[] = [
  // FREE TIER - Core engines included with platform
  {
    id: "intent-router",
    name: "Intent Router",
    description: "Basic multi-model routing with automatic provider selection",
    category: "orchestration",
    tier: "free",
    price: 0,
    features: ["Auto-routing", "Provider fallback", "Basic caching"],
  },
  {
    id: "memory-lite",
    name: "Memory Lite",
    description: "Simple persistent memory for single-agent applications",
    category: "intelligence",
    tier: "free",
    price: 0,
    features: ["Session memory", "Basic recall", "Auto-decay"],
  },
  {
    id: "health-monitor",
    name: "Health Monitor",
    description: "Basic system health monitoring and alerting",
    category: "observability",
    tier: "free",
    price: 0,
    features: ["Health checks", "Basic alerts", "Uptime tracking"],
  },
  
  // STANDARD TIER - $19-$49 one-time
  {
    id: "cognitive-orchestrator",
    name: "Cognitive Orchestrator",
    description: "Multi-model reasoning with automatic fallback and quality gates",
    category: "intelligence",
    tier: "standard",
    price: 29,
    features: ["Multi-model fusion", "Automatic fallback", "Quality gates", "Confidence scoring"],
  },
  {
    id: "security-sentinel",
    name: "Security Sentinel",
    description: "Real-time threat detection and automated response orchestration",
    category: "security",
    tier: "standard",
    price: 39,
    features: ["Threat detection", "Automated response", "Audit logging", "Risk scoring"],
  },
  {
    id: "workflow-automator",
    name: "Workflow Automator",
    description: "Complex multi-step workflow execution with error recovery",
    category: "automation",
    tier: "standard",
    price: 49,
    features: ["DAG execution", "Error recovery", "Retry logic", "State persistence"],
  },
  {
    id: "performance-optimizer",
    name: "Performance Optimizer",
    description: "Continuous performance monitoring with predictive scaling",
    category: "optimization",
    tier: "standard",
    price: 39,
    features: ["Auto-scaling hints", "Bottleneck detection", "Resource optimization"],
  },
  
  // ADVANCED TIER - $99-$199 one-time
  {
    id: "data-synthesizer",
    name: "Data Synthesizer",
    description: "Cross-source data fusion with semantic normalization",
    category: "intelligence",
    tier: "advanced",
    price: 149,
    features: ["Multi-source fusion", "Schema inference", "Semantic mapping", "Quality scoring"],
  },
  {
    id: "compliance-engine",
    name: "Compliance Engine",
    description: "Automated regulatory compliance checking and reporting",
    category: "security",
    tier: "advanced",
    price: 199,
    features: ["GDPR compliance", "SOC2 checks", "Audit trails", "Report generation"],
  },
  {
    id: "resilience-orchestrator",
    name: "Resilience Orchestrator",
    description: "Fault tolerance with chaos engineering and auto-remediation",
    category: "resilience",
    tier: "advanced",
    price: 149,
    features: ["Chaos testing", "Auto-remediation", "Failover management", "Recovery playbooks"],
  },
  {
    id: "knowledge-graph-engine",
    name: "Knowledge Graph Engine",
    description: "Build and query interconnected knowledge structures at scale",
    category: "intelligence",
    tier: "advanced",
    price: 99,
    features: ["Graph building", "Relationship mapping", "Cross-domain synthesis", "Query optimization"],
  },
  
  // META-ENGINES - $199-$299 one-time (compose other engines)
  {
    id: "meta-cognitive-pipeline",
    name: "Meta-Cognitive Pipeline",
    description: "Orchestrates multiple cognitive engines for complex reasoning chains",
    category: "orchestration",
    tier: "meta",
    price: 249,
    features: ["Engine composition", "Chain-of-thought", "Multi-step reasoning", "Result aggregation"],
    isMetaEngine: true,
  },
  {
    id: "meta-security-fortress",
    name: "Security Fortress",
    description: "Combines security engines for defense-in-depth architecture",
    category: "security",
    tier: "meta",
    price: 299,
    features: ["Layered defense", "Threat correlation", "Incident response", "Compliance automation"],
    isMetaEngine: true,
  },
  {
    id: "meta-autonomous-agent",
    name: "Autonomous Agent",
    description: "Self-orchestrating agent with memory, reasoning, and tool use",
    category: "intelligence",
    tier: "meta",
    price: 299,
    features: ["Self-directed", "Tool orchestration", "Long-term memory", "Goal decomposition"],
    isMetaEngine: true,
  },
];

const TIER_CONFIG: Record<EngineTier, { label: string; color: string; badge: string }> = {
  free: { label: "Free", color: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  standard: { label: "$19-$49", color: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  advanced: { label: "$99-$199", color: "text-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  meta: { label: "$199-$299", color: "text-primary", badge: "bg-primary/10 text-primary border-primary/30" },
};

const CATEGORY_CONFIG: Record<string, { icon: typeof Brain; color: string }> = {
  intelligence: { icon: Brain, color: "text-violet-400" },
  security: { icon: Shield, color: "text-red-400" },
  optimization: { icon: Zap, color: "text-cyan-400" },
  automation: { icon: Terminal, color: "text-emerald-400" },
  orchestration: { icon: Layers, color: "text-blue-400" },
  resilience: { icon: Network, color: "text-amber-400" },
  observability: { icon: Sparkles, color: "text-purple-400" },
};

export default function EngineMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<EngineTier | 'all'>('all');

  const filteredEngines = OEM_ENGINES.filter((engine) => {
    if (tierFilter !== 'all' && engine.tier !== tierFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      engine.name.toLowerCase().includes(query) ||
      engine.description.toLowerCase().includes(query) ||
      engine.category.toLowerCase().includes(query)
    );
  });

  const tierCounts = OEM_ENGINES.reduce((acc, e) => {
    acc[e.tier] = (acc[e.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <SEO
        title="Engine Marketplace | Production-Ready AI Engines | CMPSBL"
        description="OEM engines are first-party, canonized orchestrations hardened for reliable execution. One-time purchase, no subscriptions."
        keywords={["orchestration engines", "AI engines", "production AI", "enterprise engines"]}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 border-b border-border/50 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              OEM
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Engine Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Production-ready orchestration engines. One-time purchase, lifetime access.
              Capabilities and templates are free — engines are the products.
            </p>
            
            {/* Explainer Banner */}
            <div className="max-w-3xl mx-auto p-4 rounded-xl bg-muted/50 border border-border/50 mb-6">
              <div className="flex items-start gap-3 text-left">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">What is an Engine?</h3>
                  <p className="text-sm text-muted-foreground">
                    Engines are <strong>saved, governed orchestrations</strong> that compose multiple capabilities into reliable workflows. 
                    Unlike free capabilities (atomic, stateless), engines include persistence, versioning, and production guarantees.
                    Meta-engines compose other engines for even more sophisticated workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers Overview */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {(['free', 'standard', 'advanced', 'meta'] as EngineTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tierFilter === tier ? 'all' : tier)}
                  className={cn(
                    "px-4 py-2 rounded-lg border transition-all",
                    tierFilter === tier 
                      ? TIER_CONFIG[tier].badge + " ring-1 ring-current" 
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <div className={cn("text-lg font-bold", TIER_CONFIG[tier].color)}>
                    {tier === 'free' ? 'FREE' : TIER_CONFIG[tier].label}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {tier === 'meta' ? 'Meta-Engines' : `${tier} Engines`} ({tierCounts[tier] || 0})
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search engines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>
        </section>

        {/* Engine Grid */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredEngines.length} of {OEM_ENGINES.length} engines
            {tierFilter !== 'all' && ` (${tierFilter} tier)`}
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEngines.map((engine) => {
              const catConfig = CATEGORY_CONFIG[engine.category] || CATEGORY_CONFIG.intelligence;
              const tierConf = TIER_CONFIG[engine.tier];
              const Icon = catConfig.icon;

              return (
                <div
                  key={engine.id}
                  className={cn(
                    "group p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all",
                    engine.isMetaEngine && "ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted", catConfig.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      {engine.isMetaEngine && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          <Layers className="w-3 h-3 mr-1" />
                          Meta
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-xs", tierConf.badge)}>
                        {engine.tier === 'free' ? 'FREE' : `$${engine.price}`}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {engine.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {engine.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {engine.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div>
                      <div className={cn("text-xl font-bold", tierConf.color)}>
                        {engine.tier === 'free' ? 'Free' : `$${engine.price}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {engine.tier === 'free' ? 'Included' : 'One-time'}
                      </div>
                    </div>
                    <Button 
                      className="gap-2" 
                      variant={engine.tier === 'free' ? 'outline' : 'default'}
                    >
                      {engine.tier === 'free' ? (
                        <>
                          <Package className="w-4 h-4" />
                          Use Now
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEngines.length === 0 && (
            <div className="text-center py-16">
              <Terminal className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No engines found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          )}
        </main>

        {/* Free Adoption CTA */}
        <section className="border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore Free First</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Capabilities, templates, and pipelines are all FREE for exploration.
              Engines are the only products — everything else is adoption fuel.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/capabilities">
                  <Zap className="w-4 h-4 mr-2" />
                  Free Capabilities
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/marketplace">
                  <Package className="w-4 h-4 mr-2" />
                  Free Templates
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/synergies">
                  <Layers className="w-4 h-4 mr-2" />
                  Free Pipelines
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Philosophy Footer */}
        <section className="border-t border-border/30 bg-muted/30">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>Everything is free to explore. Engines are canon.</strong> — Capabilities and templates are free exploration layers. Engines are the only canonized, monetizable orchestration.
            </p>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}
