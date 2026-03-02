/**
 * Engine Detail — Mission Briefing + Unlock Ceremony + Checkout
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, ArrowLeft, Check, Download, FileText, Sparkles } from "lucide-react";
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

function UnlockCeremony({ engine, onComplete }: { engine: Engine; onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => { setPhase(4); onComplete(); }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Lock className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-lg font-mono text-muted-foreground mt-4">Verifying purchase…</p>
            </motion.div>
          )}
          {phase === 1 && (
            <motion.div key="p1" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <ShieldCheck className="w-16 h-16 mx-auto text-primary" />
              <p className="text-lg font-mono mt-4">Unsealing runtime…</p>
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="p2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <engine.icon className="w-20 h-20 mx-auto" style={{ color: `hsl(${engine.color})` }} />
              <p className="text-xl font-bold mt-4">{engine.codename}</p>
              <p className="text-sm text-muted-foreground">is now yours.</p>
            </motion.div>
          )}
          {phase >= 3 && (
            <motion.div key="p3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mt-4">License Activated</h2>
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
      supabase.functions.invoke("operative-verify", {
        body: { session_id: sessionId, operative_slug: engine.slug },
      }).then(({ data }) => {
        if (data?.success) {
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
      const { data, error } = await supabase.functions.invoke("operative-checkout", {
        body: { price_id: engine.priceId, operative_slug: engine.slug },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
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

      {showCeremony && (
        <UnlockCeremony engine={engine} onComplete={() => { setLicensed(true); setTimeout(() => setShowCeremony(false), 2000); }} />
      )}

      <div className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/engines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Engines
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center">
                <engine.icon className="w-8 h-8" style={{ color: `hsl(${engine.color})` }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{engine.codename}</h1>
                  <Badge variant="outline" className={cn("text-[10px] font-mono", TIER_ACCENT[engine.tier])}>
                    {engine.tier}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{engine.tagline}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CLASSIFICATION:</span>
                <span className={TIER_ACCENT[engine.tier]}>{engine.threatLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CLEARANCE REQUIRED:</span>
                <span>{engine.clearance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ARTIFACT TYPE:</span>
                <span>Sealed Runtime Binary</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EDITION:</span>
                <span>{engine.edition}</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
              <div>
                <h2 className="text-sm font-mono text-muted-foreground tracking-wider uppercase mb-3">MISSION BRIEFING</h2>
                <p className="text-foreground leading-relaxed">{engine.briefing}</p>
              </div>

              <div>
                <h2 className="text-sm font-mono text-muted-foreground tracking-wider uppercase mb-4">OPERATIONAL CAPABILITIES</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {engine.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-mono text-muted-foreground tracking-wider uppercase mb-4">YOUR LICENSE INCLUDES</h2>
                <div className="space-y-3">
                  {[
                    { icon: Lock, text: "Sealed runtime binary — obfuscated, tamper-proof" },
                    { icon: FileText, text: "Complete integration documentation" },
                    { icon: Sparkles, text: "Numbered Ownership Certificate" },
                    { icon: Download, text: "Lifetime download access" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="sticky top-28 border-border/50">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="text-3xl font-bold tracking-tight">{engine.priceDisplay}</div>
                    <p className="text-sm text-muted-foreground">
                      {engine.isSubscription ? "Annual subscription" : "One-time license — yours forever"}
                    </p>
                    {!engine.isSubscription && (
                      <p className="text-sm text-primary font-semibold mt-1">
                        {engine.bundleDisplay} when bundled with another engine
                      </p>
                    )}
                  </div>

                  {licensed ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        <Check className="w-4 h-4" />
                        License Active
                      </div>
                      <Button asChild className="w-full">
                        <Link to={`/docs/engines/${engine.slug}`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Documentation
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button size="lg" className="w-full text-base font-semibold" onClick={handlePurchase} disabled={loading}>
                      {loading ? "Preparing checkout…" : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Acquire {engine.codename}
                        </>
                      )}
                    </Button>
                  )}

                  <div className="pt-4 border-t border-border/30 space-y-2 text-xs text-muted-foreground">
                    <p>✓ Instant delivery after purchase</p>
                    <p>✓ License emailed with docs link</p>
                    <p>✓ No account required</p>
                    <p>✓ Secure checkout via Stripe</p>
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
