/**
 * Agent Detail — Full product page for Meta-Agents
 * SEO-optimized, purchasable/downloadable, mirrors EngineDetail pattern
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Download, Lock, FileText, Sparkles, ArrowRight, Brain, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AGENTS_WITH_POWERS, STANDARD_CAPABILITIES, type AgentWithPowers } from "@/lib/agents/crownJewelPowers";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { generateProductZip } from "@/lib/export/product-zip";
import { saveAs } from "file-saver";

function getAgentBySlug(slug: string): AgentWithPowers | undefined {
  return AGENTS_WITH_POWERS.find(a => a.id === slug);
}

function getTierLabel(agent: AgentWithPowers): string {
  if (agent.isApex) return "APEX";
  if (agent.isElite) return "ELITE";
  if (agent.isFlagship) return "PRO";
  if (agent.isFree) return "FREE";
  return "STARTER";
}

function getPriceDisplay(agent: AgentWithPowers): string {
  if (agent.isFree) return "FREE";
  if (agent.isApex) return "$249";
  if (agent.isElite) return "$159";
  if (agent.isFlagship) return "$129";
  return "$79";
}

const TIER_ACCENT: Record<string, string> = {
  APEX: "text-fuchsia-400",
  ELITE: "text-violet-400",
  PRO: "text-sky-400",
  STARTER: "text-amber-400",
  FREE: "text-emerald-400",
};

const TIER_BORDER: Record<string, string> = {
  APEX: "border-fuchsia-500/20",
  ELITE: "border-violet-500/20",
  PRO: "border-sky-500/20",
  STARTER: "border-amber-500/20",
  FREE: "border-emerald-500/20",
};

const TIER_GLOW: Record<string, string> = {
  APEX: "shadow-fuchsia-500/10",
  ELITE: "shadow-violet-500/10",
  PRO: "shadow-sky-500/10",
  STARTER: "shadow-amber-500/10",
  FREE: "shadow-emerald-500/10",
};

export default function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const agent = getAgentBySlug(slug ?? "");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!agent) return <Navigate to="/store" replace />;

  const tier = getTierLabel(agent);
  const price = getPriceDisplay(agent);
  const isFree = agent.isFree;

  const handleAcquire = async () => {
    if (isFree) {
      if (!user) {
        toast.error("Create a free account to download — it only takes a moment.", {
          action: { label: "Sign Up", onClick: () => window.location.href = "/auth" },
        });
        return;
      }
      setLoading(true);
      try {
        const blob = await generateProductZip({
          id: `agent-${agent.id}`,
          kind: "agent",
          name: agent.name,
          subtitle: agent.subtitle,
          price,
          tier: tier.toLowerCase(),
          slug: agent.id,
          version: "1.0.0",
          capabilities: agent.powers.map(p => p.name),
        });
        saveAs(blob, `cmpsbl-agent-${agent.id}.zip`);
        toast.success(`${agent.name} downloaded successfully`);
      } catch {
        toast.error("Download failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-checkout", {
        body: { agent_id: agent.id },
      });
      if (error) throw error;
      if ((data as any)?.url) {
        window.location.href = (data as any).url;
      }
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const path = `/agents/${agent.id}`;

  return (
    <>
      <Helmet>
        <title>{agent.name} Meta-Agent — Sealed AI Runtime | CMPSBL</title>
        <meta name="description" content={agent.description} />
        <link rel="canonical" href={`https://cmpsbl.com${path}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${agent.name} Meta-Agent`,
            description: agent.description,
            brand: { "@type": "Brand", name: "CMPSBL" },
            offers: {
              "@type": "Offer",
              price: isFree ? "0" : (agent.priceCents ?? 0) / 100,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `https://cmpsbl.com${path}`,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="container mx-auto px-4 pt-20">
          <PublicBreadcrumb />
        </div>
        <div className="container mx-auto max-w-4xl px-4 pt-6 pb-20">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Store
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
            <div className="flex items-start gap-4 sm:gap-5 mb-6">
              {agent.image ? (
                <img
                  src={agent.image}
                  alt={agent.name}
                  className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border object-cover shadow-lg", TIER_BORDER[tier], TIER_GLOW[tier])}
                />
              ) : (
                <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center shadow-lg", TIER_BORDER[tier], TIER_GLOW[tier])}>
                  <agent.icon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{agent.name}</h1>
                  <Badge variant="outline" className={cn("text-[11px] font-mono", TIER_ACCENT[tier])}>{tier}</Badge>
                </div>
                <p className="text-lg text-muted-foreground">{agent.subtitle}</p>
              </div>
            </div>

            {/* Classification grid */}
            <div className={cn("rounded-xl border bg-muted/20 p-4 font-mono text-xs space-y-2", TIER_BORDER[tier])}>
              {[
                { label: "CLASSIFICATION", value: `${tier} Meta-Agent`, accent: true },
                { label: "FUSED FROM", value: agent.fusedFrom.join(" · ") },
                { label: "POWER COUNT", value: `${agent.powers.length} Crown Jewel Powers` },
                { label: "ARTIFACT TYPE", value: "Sealed Fused Runtime" },
                { label: "MEMORY", value: "4-Tier Auto-Tiering (HOT → WARM → COOL → COLD)" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground shrink-0">{item.label}:</span>
                  <span className={cn("text-right", item.accent ? TIER_ACCENT[tier] : "text-foreground")}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            {/* Left — Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
              {/* Bio */}
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-3">AGENT DOSSIER</h2>
                <p className="text-foreground leading-relaxed text-base">{agent.bio}</p>
                <p className="text-foreground/80 leading-relaxed text-sm mt-4">{agent.description}</p>
              </div>

              {/* Crown Jewel Powers */}
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">CROWN JEWEL POWERS</h2>
                <div className="space-y-3">
                  {agent.powers.map((power, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <power.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{power.name}</p>
                          <p className="text-[10px] text-muted-foreground/60 font-mono">Source: {power.source}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{power.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Standard Capabilities */}
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">STANDARD CAPABILITIES</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {STANDARD_CAPABILITIES.map((cap, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <cap.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{cap.name}</p>
                        <p className="text-[10px] text-muted-foreground/60">{cap.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLM Goals */}
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">CLM LEARNING GOALS</h2>
                <div className="space-y-2">
                  {agent.clmGoals.map((goal, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                        {i + 1}
                      </div>
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right — Purchase card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className={cn("sticky top-28 shadow-xl", TIER_BORDER[tier], TIER_GLOW[tier])}>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="text-4xl font-black tracking-tight">{price}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isFree ? "Free — no payment required" : "One-time license — yours forever"}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-13 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all"
                    onClick={handleAcquire}
                    disabled={loading}
                  >
                    {loading ? "Processing…" : isFree ? (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Free
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Acquire {agent.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {isFree && (
                    <p className="text-xs text-center text-muted-foreground">Free account required for download</p>
                  )}

                  <div className="pt-4 border-t border-border/30 space-y-2.5 text-xs text-muted-foreground">
                    {[
                      "Sealed fused runtime — black-box protected",
                      "4-tier auto-tiering memory system",
                      "Always-on CLM — learns 24/7",
                      "RIPPLE Orchestrator included",
                      "Version minted at purchase",
                      "Secure checkout via Stripe",
                    ].map(t => (
                      <p key={t} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-primary/60" />
                        {t}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Cross-sell: Engines */}
          <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center">
            <h3 className="text-lg font-black mb-2">Pair with a Sealed Engine</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Combine this meta-agent with a composable engine for maximum operational power.
            </p>
            <Button asChild className="gap-2">
              <Link to="/store">
                <Sparkles className="w-4 h-4" />
                Browse Engines & Agents
              </Link>
            </Button>
          </div>
        </div>

        <PageSEOBlock path={path} title={`${agent.name} Meta-Agent`} />
        <EnhancedFooter />
      </div>
    </>
  );
}
