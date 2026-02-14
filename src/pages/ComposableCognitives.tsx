/**
 * Composable Cognitives — Black-ops storefront
 * Polished v2: Cinematic hero, market differentiation, black-box emphasis
 */

import { useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Download, ExternalLink, Sparkles, Shield, Terminal, Code,
  Zap, CheckCircle, Mail, Phone, ChevronDown, ChevronUp,
  Lock, Eye, EyeOff, Box, Cpu, X, ArrowRight, Server, Cloud, CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { NameChooser } from "@/components/cognitives/NameChooser";
import { COGNITIVES_CATALOG, INSTALL_SNIPPETS, type CognitiveItem } from "@/lib/cognitives/catalog";
import { validateCognitiveName } from "@/lib/cognitives/nameGen";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Creature images
import researchImg from "@/assets/cognitives/research.png";
import codingImg from "@/assets/cognitives/coding.png";
import analystImg from "@/assets/cognitives/analyst.png";
import opsImg from "@/assets/cognitives/ops.png";
import writerImg from "@/assets/cognitives/writer.png";
import hybridImg from "@/assets/cognitives/hybrid.png";

const IMAGE_MAP: Record<string, string> = {
  research: researchImg, coding: codingImg, analyst: analystImg,
  ops: opsImg, writer: writerImg, hybrid: hybridImg,
};

const ACCENT_COLORS: Record<string, { card: string; text: string; glow: string; ring: string }> = {
  cyan: { card: "from-cyan-500/10 to-transparent border-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/10", ring: "ring-cyan-500/30" },
  green: { card: "from-emerald-500/10 to-transparent border-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/10", ring: "ring-emerald-500/30" },
  purple: { card: "from-violet-500/10 to-transparent border-violet-500/20", text: "text-violet-400", glow: "shadow-violet-500/10", ring: "ring-violet-500/30" },
  orange: { card: "from-orange-500/10 to-transparent border-orange-500/20", text: "text-orange-400", glow: "shadow-orange-500/10", ring: "ring-orange-500/30" },
  pink: { card: "from-pink-500/10 to-transparent border-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/10", ring: "ring-pink-500/30" },
  gold: { card: "from-amber-500/10 to-transparent border-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/10", ring: "ring-amber-500/30" },
};

/* ───── Comparison data ───── */
const COMPARISON_ROWS = [
  { label: "Runs locally", us: true, them: false },
  { label: "No cloud dependency", us: true, them: false },
  { label: "Persistent memory across sessions", us: true, them: false },
  { label: "Own your agent forever (MIT)", us: true, them: false },
  { label: "No monthly subscription", us: true, them: false },
  { label: "Multi-framework adapters (LangChain, CrewAI)", us: true, them: false },
  { label: "Black-box protected runtime", us: true, them: false },
  { label: "Requires internet to function", us: false, them: true },
];

/* ───── Cognitive Card ───── */
function CognitiveCard({ item, chosenName, onBuy }: { item: CognitiveItem; chosenName: string; onBuy: (sku: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const accent = ACCENT_COLORS[item.accentColor];

  const handleBuy = async () => {
    setLoading(true);
    try { await onBuy(item.sku); } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        "relative overflow-hidden border bg-gradient-to-b transition-all duration-500 group",
        "hover:shadow-2xl hover:-translate-y-1",
        accent.card, `hover:${accent.glow}`
      )}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
        }} />

        {/* Black-box badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="text-[9px] font-mono gap-1 bg-background/80 backdrop-blur-sm border-border/50">
            <Lock className="w-2.5 h-2.5" />
            BLACK-BOX
          </Badge>
        </div>

        <CardContent className="p-6 space-y-4 relative">
          {/* Header */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-20 h-20 rounded-xl bg-background/60 border border-border/40 overflow-hidden shrink-0 p-1.5"
            >
              <img src={IMAGE_MAP[item.imagePath]} alt={item.displayName} className="w-full h-full object-contain drop-shadow-lg" loading="lazy" />
            </motion.div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg tracking-tight">{item.displayName}</h3>
              </div>
              <Badge variant="outline" className={cn("text-[10px] font-mono mt-1", accent.text)}>
                {item.className}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.tagline}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            {item.isFree ? (
              <span className="text-3xl font-black tracking-tighter text-amber-400">FREE</span>
            ) : (
              <>
                <span className="text-3xl font-black tracking-tighter">$39</span>
                <span className="text-xs text-muted-foreground font-mono">one-time</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Capabilities */}
          <div className="space-y-2">
            {item.capabilities.slice(0, 4).map((cap, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <CheckCircle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", accent.text)} />
                <span className="text-muted-foreground">{cap}</span>
              </div>
            ))}
          </div>

          {/* Expandable */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-primary/80 hover:text-primary transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide" : "View"} enhancements ({item.enhancements.length})
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {item.enhancements.map((enh, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <Sparkles className={cn("w-3 h-3 mt-0.5 shrink-0", accent.text)} />
                    <span>{enh}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <Button
            onClick={handleBuy}
            disabled={loading}
            className={cn("w-full gap-2 font-mono text-sm h-11 transition-all duration-300", 
              !item.isFree && "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            )}
            variant={item.isFree ? "outline" : "default"}
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : item.isFree ? (
              <>
                <Download className="w-4 h-4" />
                Free Download
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Buy & Download — $39
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ───── Main Page ───── */
export default function ComposableCognitives() {
  const [searchParams] = useSearchParams();
  const [chosenName, setChosenName] = useState("");
  const { user } = useAuth();
  const canceled = searchParams.get("canceled") === "1";

  const handleBuy = useCallback(async (sku: string) => {
    const validation = validateCognitiveName(chosenName);
    if (!validation.valid) {
      alert(validation.error || "Please enter a valid name");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("cognitives-checkout", {
        body: { sku, chosenName },
      });
      if (error) throw error;
      if (data?.free && data?.redirect) { window.location.href = data.redirect; return; }
      if (data?.url) { window.location.href = data.url; }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
    }
  }, [chosenName]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Composable Cognitives — CMPSBL®</title>
        <meta name="description" content="Own superpowered AI agents. Download once. Run anywhere. No subscriptions. No cloud dependency. Black-box protected runtimes." />
      </Helmet>

      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Ambient mesh */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        {/* Animated grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(185 100% 50% / 0.06) 0%, transparent 70%)' }}
        />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge variant="outline" className="font-mono text-[10px] tracking-[0.2em] border-primary/20 bg-primary/5 px-4 py-1.5">
                BLACK-BOX ARTIFACTS • DOWNLOAD & OWN FOREVER
              </Badge>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              <span className="block">Not Another</span>
              <span className="block glow-text mt-1">AI Wrapper.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              These are <span className="text-foreground font-semibold">compiled cognitive runtimes</span> — 
              agents with persistent memory, self-improvement loops, and zero cloud dependency. 
              Download once. Run forever. <span className="text-foreground font-semibold">No subscription.</span>
            </p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-6 md:gap-10 text-sm"
            >
              {[
                { icon: Box, label: "6 Cognitives", sub: "5 paid + 1 free" },
                { icon: CloudOff, label: "Zero Cloud", sub: "100% local" },
                { icon: Lock, label: "Black-Box", sub: "Protected IP" },
                { icon: Cpu, label: "Own Forever", sub: "MIT licensed" },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5 text-primary/80" />
                  <span className="font-bold text-xs">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{sub}</span>
                </div>
              ))}
            </motion.div>

            {/* Name Chooser */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-sm mx-auto"
            >
              <NameChooser value={chosenName} onChange={setChosenName} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MARKET DIFFERENTIATION ═══ */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3 mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Why Developers Switch to <span className="glow-text">Cognitives</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stop renting intelligence. Start owning it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/50 bg-muted/30">
                  <div className="p-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Feature</div>
                  <div className="p-4 text-center">
                    <span className="text-xs font-black tracking-tight text-primary">CMPSBL</span>
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-xs font-mono text-muted-foreground">Others</span>
                  </div>
                </div>
                {/* Rows */}
                {COMPARISON_ROWS.map((row, i) => (
                  <div key={i} className={cn(
                    "grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/30 last:border-b-0",
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                  )}>
                    <div className="p-3.5 md:p-4 text-sm text-muted-foreground">{row.label}</div>
                    <div className="p-3.5 md:p-4 flex items-center justify-center">
                      {row.us ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="p-3.5 md:p-4 flex items-center justify-center">
                      {row.them ? (
                        <CheckCircle className="w-4 h-4 text-muted-foreground/40" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Canceled alert */}
      {canceled && (
        <div className="container mx-auto px-4 pb-6">
          <Alert className="max-w-2xl mx-auto border-orange-500/30 bg-orange-500/5">
            <AlertDescription>
              Checkout was canceled. No charge was made.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ═══ COGNITIVE CARDS ═══ */}
      <section className="container mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Choose Your Cognitive</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Each ships as a self-contained, compiled runtime with persistent memory and zero cloud callbacks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {COGNITIVES_CATALOG.map((item) => (
            <CognitiveCard key={item.sku} item={item} chosenName={chosenName} onBuy={handleBuy} />
          ))}
        </div>
      </section>

      {/* ═══ BLACK-BOX ENFORCEMENT ═══ */}
      <section className="relative py-24 overflow-hidden">
        {/* Dark overlay band */}
        <div className="absolute inset-0 bg-muted/30" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, currentColor 3px, currentColor 4px)',
        }} />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-4 mb-16"
            >
              <Badge variant="outline" className="font-mono text-[10px] tracking-[0.15em] border-primary/20">
                SECURITY PROTOCOL
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Black-Box <span className="glow-text">Enforcement</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                You get the power, not the blueprint. Every cognitive ships as a compiled, sealed artifact.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What you GET */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-emerald-500/20 bg-emerald-500/5 h-full">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold">What You Get</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Full execution capability — run anywhere",
                        "MIT License — use, modify, distribute",
                        "Complete API + config documentation",
                        "Multi-framework adapters included",
                        "No telemetry, no cloud callbacks",
                        "Persistent memory between sessions",
                        "One-time purchase, own forever",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* What's SEALED */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-border/30 h-full">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold">What's Sealed</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Internal reasoning architecture",
                        "Self-improvement loop mechanics",
                        "Memory optimization algorithms",
                        "Source code of compiled modules",
                        "Prompt engineering internals",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <EyeOff className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground/70">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground/60 italic">
                        Compiled runtimes protect our architecture while giving you full operational power.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INSTALL ═══ */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl font-black tracking-tight">Install in 3 Minutes</h2>
            <p className="text-sm text-muted-foreground">
              Every cognitive ships as a self-contained runtime. Plug into Node, HTTP, LangChain, or CrewAI.
            </p>
          </motion.div>

          <Tabs defaultValue="node" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="node" className="font-mono text-xs gap-1"><Terminal className="w-3 h-3" /> Node</TabsTrigger>
              <TabsTrigger value="http" className="font-mono text-xs gap-1"><Code className="w-3 h-3" /> HTTP</TabsTrigger>
              <TabsTrigger value="langchain" className="font-mono text-xs">LangChain</TabsTrigger>
              <TabsTrigger value="crewai" className="font-mono text-xs">CrewAI</TabsTrigger>
            </TabsList>
            {Object.entries(INSTALL_SNIPPETS).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <pre className="bg-muted/30 rounded-xl p-5 text-xs font-mono overflow-x-auto border border-border/30 leading-relaxed">
                  <code>{code}</code>
                </pre>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ═══ SUPPORT ═══ */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-xl font-bold">Need Help?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:help@CMPSBL.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" /> help@CMPSBL.com
            </a>
            <span className="hidden sm:inline text-border">|</span>
            <a href="tel:+17603548324" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" /> (760) FLUID-AI
            </a>
            <span className="hidden sm:inline text-border">|</span>
            <Link to="/support" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <ExternalLink className="w-4 h-4" /> Support Page
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
