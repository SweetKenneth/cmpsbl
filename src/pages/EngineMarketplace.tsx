/**
 * Orchestration Engine Marketplace (OEM)
 * First-party, canonized orchestrations hardened for reliable execution
 * v1.0.0 — Only official engines, no user-submitted content
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
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// First-party engine definitions (substrate-only engines excluded)
const OEM_ENGINES = [
  {
    id: "cognitive-orchestrator",
    name: "Cognitive Orchestrator",
    description: "Multi-model reasoning with automatic fallback and quality gates",
    category: "intelligence",
    tier: "professional",
    features: ["Multi-model fusion", "Automatic fallback", "Quality gates", "Confidence scoring"],
  },
  {
    id: "security-sentinel",
    name: "Security Sentinel",
    description: "Real-time threat detection and automated response orchestration",
    category: "security",
    tier: "professional",
    features: ["Threat detection", "Automated response", "Audit logging", "Compliance reports"],
  },
  {
    id: "performance-optimizer",
    name: "Performance Optimizer",
    description: "Continuous performance monitoring with predictive scaling",
    category: "optimization",
    tier: "professional",
    features: ["Auto-scaling", "Bottleneck detection", "Resource optimization", "Cost analysis"],
  },
  {
    id: "workflow-automator",
    name: "Workflow Automator",
    description: "Complex multi-step workflow execution with error recovery",
    category: "automation",
    tier: "professional",
    features: ["DAG execution", "Error recovery", "Retry logic", "State persistence"],
  },
  {
    id: "data-synthesizer",
    name: "Data Synthesizer",
    description: "Cross-source data fusion with semantic normalization",
    category: "intelligence",
    tier: "enterprise",
    features: ["Multi-source fusion", "Schema inference", "Semantic mapping", "Quality scoring"],
  },
  {
    id: "compliance-engine",
    name: "Compliance Engine",
    description: "Automated regulatory compliance checking and reporting",
    category: "security",
    tier: "enterprise",
    features: ["GDPR compliance", "SOC2 checks", "Audit trails", "Report generation"],
  },
];

const CATEGORY_CONFIG: Record<string, { icon: typeof Brain; color: string }> = {
  intelligence: { icon: Brain, color: "text-violet-400" },
  security: { icon: Shield, color: "text-red-400" },
  optimization: { icon: Zap, color: "text-cyan-400" },
  automation: { icon: Terminal, color: "text-emerald-400" },
};

export default function EngineMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEngines = OEM_ENGINES.filter((engine) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      engine.name.toLowerCase().includes(query) ||
      engine.description.toLowerCase().includes(query) ||
      engine.category.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <SEO
        title="Orchestration Engine Marketplace | First-Party Engines | CMPSBL"
        description="OEM engines are first-party, canonized orchestrations hardened for reliable execution. Subscribe to production-ready engines."
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
              Orchestration Engine Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              OEM engines are first-party, canonized orchestrations hardened for reliable execution.
              Saved, governed, and authoritative.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                No user-submitted engines
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                First-party only
              </span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl font-black text-primary">{OEM_ENGINES.length}</div>
                <div className="text-xs text-muted-foreground">Engines</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">Governed</div>
                <div className="text-xs text-muted-foreground">Orchestration</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400">Canon</div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEngines.map((engine) => {
              const catConfig = CATEGORY_CONFIG[engine.category] || CATEGORY_CONFIG.intelligence;
              const Icon = catConfig.icon;

              return (
                <div
                  key={engine.id}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted", catConfig.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      engine.tier === "enterprise" ? "border-amber-500/30 text-amber-500" : "border-primary/30 text-primary"
                    )}>
                      {engine.tier}
                    </Badge>
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

                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/contact">Contact Sales</Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {filteredEngines.length === 0 && (
            <div className="text-center py-16">
              <Terminal className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No engines found</h3>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </div>
          )}
        </main>

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
