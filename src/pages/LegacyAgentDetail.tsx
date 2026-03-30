/**
 * Legacy Agent Detail — Full product page for standalone legacy agents.
 * Mirrors EngineDetail: download ZIP + Stripe checkout + SDK activation info.
 * Black-boxed Mini-Runtime embedded in every export.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, Download, Lock, FileText, Sparkles,
  ArrowRight, Zap, Terminal, Package, Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLegacyAgentBySlug, LEGACY_TIER_CONFIG, type LegacyAgent } from "@/lib/agents/legacy-catalog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { generateProductZip } from "@/lib/export/product-zip";
import { saveAs } from "file-saver";
import { useDownloadCeremony } from "@/hooks/useDownloadCeremony";

export default function LegacyAgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const agent = getLegacyAgentBySlug(slug ?? "");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [licensed, setLicensed] = useState(false);
  const { runWithCeremony, overlayElement } = useDownloadCeremony();

  if (!agent) return <Navigate to="/agents" replace />;

  const tierCfg = LEGACY_TIER_CONFIG[agent.tier];

  const handleDownload = async () => {
    if (!user) {
      toast.error("Create a free account to download.", {
        action: { label: "Sign Up", onClick: () => { window.location.href = "/auth"; } },
      });
      return;
    }

    setLoading(true);
    try {
      await runWithCeremony(
        {
          itemName: agent.codename,
          kindLabel: "Agent",
          note: "Your sealed agent bundle will begin downloading shortly.",
        },
        async () => {
          const blob = await generateProductZip({
            id: `agent-${agent.slug}`,
            kind: "agent",
            name: agent.codename,
            subtitle: agent.tagline,
            price: agent.priceDisplay,
            tier: agent.tier,
            slug: agent.slug,
            version: "1.0.0",
            capabilities: agent.capabilities,
          });
          saveAs(blob, `cmpsbl-agent-${agent.slug}.zip`);
        }
      );
      setLicensed(true);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (agent.isFree) {
      await handleDownload();
      return;
    }

    if (!user) {
      toast.error("Please sign in to purchase.", {
        action: { label: "Sign In", onClick: () => { window.location.href = "/auth"; } },
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("legacy-agent-checkout", {
        body: { agent_slug: agent.slug },
      });
      if (error) throw error;
      if ((data as Record<string, unknown>)?.free) {
        await handleDownload();
        return;
      }
      if ((data as Record<string, unknown>)?.url) {
        window.location.href = (data as Record<string, unknown>).url as string;
      }
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{agent.codename} Agent — Sealed Runtime | CMPSBL</title>
        <meta name="description" content={agent.description} />
        <link rel="canonical" href={`https://cmpsbl.com/agents/${agent.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${agent.codename} Agent`,
            description: agent.description,
            brand: { "@type": "Brand", name: "CMPSBL" },
            offers: {
              "@type": "Offer",
              price: agent.priceCents / 100,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `https://cmpsbl.com/agents/${agent.slug}`,
            },
          })}
        </script>
      </Helmet>

      {overlayElement}

      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="container mx-auto px-4 pt-20">
          <PublicBreadcrumb />
        </div>
        <div className="container mx-auto max-w-4xl px-4 pt-6 pb-20">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            All Legacy Agents
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
            {/* Agent header */}
            <div className="flex items-start gap-4 sm:gap-5 mb-6">
              <div
                className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center shadow-lg", tierCfg.border)}
                style={{ background: `linear-gradient(135deg, hsl(${agent.color} / 0.1), hsl(${agent.color} / 0.03))` }}
              >
                <agent.icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: `hsl(${agent.color})` }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{agent.codename}</h1>
                  <Badge variant="outline" className={cn("text-[11px] font-mono", tierCfg.color, tierCfg.border, tierCfg.bg)}>
                    {tierCfg.label}
                  </Badge>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground">{agent.tagline}</p>
                <p className="text-xs text-muted-foreground/60 font-mono mt-1">
                  Role: {agent.role} · Now part of {agent.fusedInto} Meta-Agent
                </p>
              </div>
            </div>

            {/* Classification grid */}
            <div className={cn("rounded-xl border bg-muted/20 p-4 font-mono text-xs space-y-2", tierCfg.border)}>
              {[
                { label: "VERSION", value: "v1.0.0" },
                { label: "TIER", value: tierCfg.label },
                { label: "LICENSE", value: agent.isFree ? "Free — perpetual" : "Perpetual one-time" },
                { label: "ARTIFACT TYPE", value: "Sealed Runtime Agent" },
                { label: "FUSED INTO", value: `${agent.fusedInto} Meta-Agent` },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            {/* Left — Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-3">AGENT BRIEFING</h2>
                <p className="text-foreground leading-relaxed text-base">{agent.description}</p>
              </div>

              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">CAPABILITIES</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {agent.capabilities.map((cap, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors"
                    >
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{cap}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Deployment section */}
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">STANDALONE DEPLOYMENT</h2>
                <div className="space-y-3">
                  {[
                    { icon: Download, title: "Download ZIP", desc: "Self-contained bundle with Mini-Runtime™, docs, and manifest. Deploy anywhere." },
                    { icon: Package, title: "NPM / SDK Activation", desc: "Import via @cmpsbl/sdk — agent activates automatically in your project." },
                    { icon: Terminal, title: "CLI Activation", desc: "Run `cmpsbl agents activate " + agent.slug + "` to enable via terminal." },
                    { icon: Code, title: "Zero Dependencies", desc: "Embedded Mini-Runtime ensures standalone execution without external services." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/30">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">YOUR LICENSE INCLUDES</h2>
                <div className="space-y-3">
                  {[
                    { icon: Lock, text: "Sealed runtime binary — obfuscated, tamper-proof" },
                    { icon: FileText, text: "Complete integration documentation" },
                    { icon: Sparkles, text: "Numbered Ownership Certificate" },
                    { icon: Download, text: "Lifetime download access" },
                    { icon: Zap, text: "SDK + CLI activation included" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right — Purchase card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className={cn("sticky top-28 shadow-xl", tierCfg.border)}>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="text-4xl font-black tracking-tight">{agent.priceDisplay}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.isFree ? "Free — no payment required" : "One-time license — yours forever"}
                    </p>
                  </div>

                  {licensed ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                        <Check className="w-4 h-4" />
                        License Active — Downloaded
                      </div>
                      <Button
                        className="w-full h-12 rounded-xl font-semibold"
                        onClick={handleDownload}
                        disabled={loading}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Again
                      </Button>
                    </div>
                  ) : agent.isFree ? (
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full h-13 text-base font-bold rounded-xl"
                        onClick={handleDownload}
                        disabled={loading}
                      >
                        {loading ? "Preparing…" : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Free
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Free account required</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full h-13 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all"
                        onClick={handlePurchase}
                        disabled={loading}
                      >
                        {loading ? "Preparing checkout…" : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Acquire {agent.codename}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-10 rounded-xl text-sm"
                        onClick={handleDownload}
                        disabled={loading}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Preview ZIP Bundle
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border/30 space-y-2.5 text-xs text-muted-foreground">
                    {[
                      "Instant delivery after purchase",
                      "Full ZIP bundle with Mini-Runtime™",
                      "SDK + CLI activation included",
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

          {/* Cross-sell */}
          <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center">
            <h3 className="text-lg font-black mb-2">Want more power?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This agent was fused into the <strong>{agent.fusedInto}</strong> Meta-Agent — combining 4-5 originals with DREAM Synthesis.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/store">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Meta-Agents
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/engines">
                  Browse Engines
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <EnhancedFooter />
      </div>
    </>
  );
}
