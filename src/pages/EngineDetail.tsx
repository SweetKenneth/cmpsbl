/**
 * Engine Detail — Mission Briefing + Unlock Ceremony + Checkout
 * Uses standalone-engine-checkout for one-time $199 purchases
 * Uses cmpsbl-engine-checkout for ARCHITECT $999/yr subscription
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, ArrowLeft, Check, Download, FileText, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getEngineBySlug, type Engine } from "@/lib/engines/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const TIER_ACCENT: Record<string, string> = {
  APEX: "text-red-400",
  ELITE: "text-purple-400",
  CORE: "text-cyan-400",
};

const TIER_GLOW: Record<string, string> = {
  APEX: "shadow-red-500/10",
  ELITE: "shadow-purple-500/10",
  CORE: "shadow-cyan-500/10",
};

const TIER_BORDER: Record<string, string> = {
  APEX: "border-red-500/20",
  ELITE: "border-purple-500/20",
  CORE: "border-cyan-500/20",
};

function UnlockCeremony({ engine, onComplete }: { engine: Engine; onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => { setPhase(4); onComplete(); }, 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const phases = [
    { key: "verify", icon: <Lock className="w-16 h-16 text-muted-foreground animate-pulse" />, text: "Verifying purchase…" },
    { key: "unseal", icon: <ShieldCheck className="w-16 h-16 text-primary" />, text: "Unsealing runtime…" },
    { key: "activate", icon: <engine.icon className="w-20 h-20" style={{ color: `hsl(${engine.color})` }} />, text: engine.codename, sub: "is now yours." },
    { key: "done", icon: null, text: "License Activated" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md px-4">
        <AnimatePresence mode="wait">
          {phase <= 1 && (
            <motion.div key={phases[phase].key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
              <div className="mb-4">{phases[phase].icon}</div>
              <p className="text-lg font-mono text-muted-foreground">{phases[phase].text}</p>
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="activate" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-4">{phases[2].icon}</div>
              <p className="text-2xl font-bold">{phases[2].text}</p>
              <p className="text-sm text-muted-foreground mt-1">{phases[2].sub}</p>
            </motion.div>
          )}
          {phase >= 3 && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">License Activated</h2>
              <p className="text-sm text-muted-foreground mt-2">{engine.edition}</p>
              <p className="text-xs text-muted-foreground/70 font-mono mt-1">
                Ownership certificate and docs link sent to your email.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function EngineDetail() {
  const { slug } = useParams<{ slug: string }>();
  const engine = getEngineBySlug(slug ?? "");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCeremony, setShowCeremony] = useState(false);
  const [licensed, setLicensed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const success = params.get("licensed");
    if (success === "true" && sessionId && engine) {
      setShowCeremony(true);
      // Use the correct verify function based on engine type
      const verifyFn = engine.isSubscription ? "cmpsbl-engine-verify" : "standalone-engine-verify";
      supabase.functions.invoke(verifyFn, {
        body: { session_id: sessionId, engine_slug: engine.slug },
      }).then(({ data }) => {
        if ((data as any)?.success) {
          toast.success("License activated! Check your email for your ownership certificate.");
        }
      }).catch(() => {});
    }
  }, [engine]);

  if (!engine) return <Navigate to="/engines" replace />;
  if (engine.externalPath) return <Navigate to={engine.externalPath} replace />;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Route to the correct checkout function:
      // - ARCHITECT ($999/yr) → cmpsbl-engine-checkout (subscription)
      // - All others ($199) → standalone-engine-checkout (one-time payment)
      const checkoutFn = engine.isSubscription ? "cmpsbl-engine-checkout" : "standalone-engine-checkout";
      
      const { data, error } = await supabase.functions.invoke(checkoutFn, {
        body: { price_id: engine.priceId, engine_slug: engine.slug },
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

  return (
    <>
      <Helmet>
        <title>{engine.codename} Engine — Sealed Runtime | CMPSBL</title>
        <meta name="description" content={engine.briefing} />
      </Helmet>

      <AnimatePresence>
        {showCeremony && (
          <UnlockCeremony engine={engine} onComplete={() => { setLicensed(true); setTimeout(() => setShowCeremony(false), 2000); }} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/engines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            All Engines
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
            {/* Engine header */}
            <div className="flex items-start gap-4 sm:gap-5 mb-6">
              <div
                className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center shadow-lg", TIER_BORDER[engine.tier], TIER_GLOW[engine.tier])}
                style={{ background: `linear-gradient(135deg, hsl(${engine.color} / 0.1), hsl(${engine.color} / 0.03))` }}
              >
                <engine.icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: `hsl(${engine.color})` }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{engine.codename}</h1>
                  <Badge variant="outline" className={cn("text-[10px] font-mono", TIER_ACCENT[engine.tier])}>
                    {engine.tier}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{engine.tagline}</p>
              </div>
            </div>

            {/* Classification grid */}
            <div className={cn("rounded-xl border bg-muted/20 p-4 font-mono text-xs space-y-2", TIER_BORDER[engine.tier])}>
              {[
                { label: "CLASSIFICATION", value: engine.threatLevel, accent: true },
                { label: "CLEARANCE REQUIRED", value: engine.clearance },
                { label: "ARTIFACT TYPE", value: "Sealed Runtime Binary" },
                { label: "EDITION", value: engine.edition },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className={item.accent ? TIER_ACCENT[engine.tier] : "text-foreground"}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            {/* Left — Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-3">MISSION BRIEFING</h2>
                <p className="text-foreground leading-relaxed text-base">{engine.briefing}</p>
              </div>

              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">OPERATIONAL CAPABILITIES</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {engine.capabilities.map((cap, i) => (
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

              <div>
                <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4">YOUR LICENSE INCLUDES</h2>
                <div className="space-y-3">
                  {[
                    { icon: Lock, text: "Sealed runtime binary — obfuscated, tamper-proof" },
                    { icon: FileText, text: "Complete integration documentation" },
                    { icon: Sparkles, text: "Numbered Ownership Certificate" },
                    { icon: Download, text: "Lifetime download access" },
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
              <Card className={cn("sticky top-28 shadow-xl", TIER_BORDER[engine.tier], TIER_GLOW[engine.tier])}>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="text-4xl font-black tracking-tight">{engine.priceDisplay}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {engine.isSubscription ? "Annual subscription" : "One-time license — yours forever"}
                    </p>
                    {!engine.isSubscription && (
                      <p className="text-sm text-primary font-semibold mt-1.5">
                        {engine.bundleDisplay} when bundled with another engine
                      </p>
                    )}
                  </div>

                  {licensed ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                        <Check className="w-4 h-4" />
                        License Active
                      </div>
                      <Button asChild className="w-full h-12 rounded-xl font-semibold">
                        <Link to={`/docs/engines/${engine.slug}`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Documentation
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full h-13 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all"
                      onClick={handlePurchase}
                      disabled={loading}
                    >
                      {loading ? "Preparing checkout…" : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Acquire {engine.codename}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}

                  <div className="pt-4 border-t border-border/30 space-y-2.5 text-xs text-muted-foreground">
                    {["Instant delivery after purchase", "License emailed with docs link", "No account required", "Secure checkout via Stripe"].map(t => (
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
        </div>
      </div>
    </>
  );
}
