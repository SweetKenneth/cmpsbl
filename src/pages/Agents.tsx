/**
 * Legacy Agents — The Original 20 Standalone Runtime Agents
 * Individual agents that were later fused into 5 Meta-Agents.
 * Priced from Free → $79.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, ShieldCheck, ArrowRight, Lock, Zap, Download, Package, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import {
  LEGACY_AGENTS, LEGACY_TIER_CONFIG,
  type LegacyAgent, type LegacyAgentTier,
} from "@/lib/agents/legacy-catalog";

const TIER_ORDER: LegacyAgentTier[] = ["free", "engineering", "defense", "intelligence", "growth"];

function AgentCard({ agent, index }: { agent: LegacyAgent; index: number }) {
  const tierCfg = LEGACY_TIER_CONFIG[agent.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="snap-start shrink-0"
    >
      <Link to={`/agents/${agent.slug}`} className="block group h-full">
        <div className={cn(
          "relative h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden",
          tierCfg.border
        )}>
          {/* Accent line */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(90deg, transparent, hsl(${agent.color}), transparent)` }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              tierCfg.bg, tierCfg.border
            )}>
              <agent.icon className="w-5 h-5" style={{ color: `hsl(${agent.color})` }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black tracking-tight">{agent.codename}</h3>
              <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
            </div>
            <Badge variant="outline" className={cn("text-[10px] font-mono shrink-0", tierCfg.bg, tierCfg.color, tierCfg.border)}>
              {tierCfg.label}
            </Badge>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground mb-3">{agent.tagline}</p>

          {/* Capabilities */}
          <ul className="space-y-1 mb-4">
            {agent.capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-1.5 text-xs text-muted-foreground/80">
                <Zap className="w-3 h-3 mt-0.5 text-primary/50 shrink-0" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>

          {/* Fused into badge */}
          <div className="text-[10px] font-mono text-muted-foreground/50 mb-3">
            Now part of → <span className="text-primary/60 font-bold">{agent.fusedInto}</span> Meta-Agent
          </div>

          {/* Price + CTA */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-black">{agent.priceDisplay}</span>
              {agent.isFree ? (
                <span className="text-xs text-neon-green font-semibold ml-1">No card required</span>
              ) : (
                <span className="text-xs text-muted-foreground ml-1">one-time</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
              <Lock className="w-3 h-3" />
              Dossier
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<LegacyAgentTier | null>(null);

  const filtered = LEGACY_AGENTS.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.codename.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
    }
    if (selectedTier) return a.tier === selectedTier;
    return true;
  });

  const agentsByTier: Record<string, LegacyAgent[]> = {};
  LEGACY_AGENTS.forEach((a) => {
    if (!agentsByTier[a.tier]) agentsByTier[a.tier] = [];
    agentsByTier[a.tier].push(a);
  });

  const showBrowseMode = !searchQuery && !selectedTier;

  return (
    <>
      <Helmet>
        <title>20 Runtime Agents — Original Sealed Agents | CMPSBL</title>
        <meta name="description" content="Browse CMPSBL's 20 original standalone runtime agents across 5 tiers: Foundation (Free), Engineering ($19), Defense ($39), Intelligence ($59), and Growth ($79). Sealed runtimes with perpetual license." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />

        <div className="container mx-auto px-3 sm:px-4 pt-20">
          <PublicBreadcrumb />
        </div>

        {/* Hero */}
        <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-16 px-3 sm:px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative container mx-auto max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[11px] sm:text-xs font-mono tracking-wider text-primary">SEALED RUNTIME AGENTS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
                THE ORIGINAL <span className="text-primary">20</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
                The standalone runtime agents that power the CMPSBL substrate.
                Each is a <strong className="text-foreground">sealed, black-boxed AI runtime</strong> you own forever.
                Later fused into 5 Meta-Agents on the <Link to="/store" className="text-primary hover:underline font-medium">Store</Link> —
                but still available individually at legacy pricing.
              </p>

              {/* Standalone deployment info */}
              <div className="max-w-2xl mx-auto mb-4 p-4 rounded-xl border border-border/50 bg-card/50 text-left">
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  <strong className="text-foreground">Standalone deployment:</strong> Every agent purchase includes a
                  self-contained ZIP with the embedded <strong className="text-foreground">Mini-Runtime™</strong> —
                  deploy to your own infrastructure, no CMPSBL dependency required. Also activates via{" "}
                  <a href="https://www.npmjs.com/package/@cmpsbl/sdk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@cmpsbl/sdk</a>{" "}
                  and the{" "}
                  <a href="https://www.npmjs.com/package/@cmpsbl/cli" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CLI</a>.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Download className="w-3.5 h-3.5 text-primary/60" />
                    <span>ZIP download</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5 text-primary/60" />
                    <span>NPM activation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Terminal className="w-3.5 h-3.5 text-primary/60" />
                    <span>CLI activation</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {TIER_ORDER.map((tier) => {
                  const cfg = LEGACY_TIER_CONFIG[tier];
                  const count = agentsByTier[tier]?.length || 0;
                  return (
                    <div key={tier} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                      <span className="font-black text-lg">{count}</span>
                      <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                      <span className="text-xs text-muted-foreground">{cfg.price}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground/60 font-mono">
                {LEGACY_AGENTS.length} sealed runtimes · Perpetual license · From free to $79
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search + filter */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3">
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search 20 agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-card border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted" aria-label="Clear search">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedTier(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                  !selectedTier ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                )}
              >
                All Tiers
              </button>
              {TIER_ORDER.map((tier) => {
                const cfg = LEGACY_TIER_CONFIG[tier];
                const count = agentsByTier[tier]?.length || 0;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                      selectedTier === tier ? cn(cfg.bg, cfg.color, cfg.border) : "border-border text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {cfg.label} <span className="opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Agent grid */}
        <section className="container mx-auto px-4 py-8">
          {showBrowseMode ? (
            // Group by tier
            TIER_ORDER.map((tier) => {
              const agents = agentsByTier[tier] || [];
              if (agents.length === 0) return null;
              const cfg = LEGACY_TIER_CONFIG[tier];
              return (
                <div key={tier} className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("h-[3px] w-8 rounded bg-gradient-to-r", cfg.bg)} />
                    <h2 className={cn("text-xl font-black tracking-tight", cfg.color)}>{cfg.label}</h2>
                    <span className="text-sm text-muted-foreground">{cfg.price} · {agents.length} agents</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {agents.map((agent, i) => (
                      <AgentCard key={agent.slug} agent={agent} index={i} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map((agent, i) => (
                  <AgentCard key={agent.slug} agent={agent} index={i} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* CTA to Meta-Agents */}
        <section className="container mx-auto px-4 pb-16">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="text-2xl font-black mb-2">Want more power?</h2>
            <p className="text-muted-foreground mb-4">
              These 20 agents were fused into 5 Meta-Agents — each combining 4-5 originals into one sealed runtime with DREAM Synthesis.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/store">Browse Meta-Agents on the Store</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/composable-cognitives">View Meta-Agents</Link>
              </Button>
            </div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}
