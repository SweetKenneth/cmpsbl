/**
 * Composable Minds — Phase 1 Marketplace
 * Horizontal shift card layout, mobile-first, sticky header
 * Public agents only: 2 free + 1 paid
 */

import { useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Download, Sparkles, Shield, Terminal, Code,
  Zap, CheckCircle, Mail, Phone, ChevronDown, ChevronUp,
  Lock, EyeOff, Box, Cpu, X, Server, CloudOff,
  ChevronLeft, ChevronRight, Brain, ArrowRight, ExternalLink,
  Search, Workflow, FileText, RotateCcw, Layers, Gauge,
  Activity, Target, Mic, BookOpen, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { NameChooser } from "@/components/cognitives/NameChooser";
import { PUBLIC_CATALOG, INSTALL_SNIPPETS, type CognitiveItem } from "@/lib/cognitives/catalog";
import { validateCognitiveName } from "@/lib/cognitives/nameGen";
import { supabase } from "@/integrations/supabase/client";
import { pushToast } from "@/components/toast/SmartToastStore";
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
  // New agents reuse hybrid image until custom assets are generated
  educator: hybridImg, sales: analystImg,
  legal: opsImg, recruiter: researchImg, support: codingImg,
  'data-engineer': codingImg, marketing: writerImg, product: analystImg,
  security: opsImg, finance: analystImg, designer: writerImg,
  devops: codingImg, strategist: researchImg, translator: hybridImg,
};

const ACCENT_COLORS: Record<string, { card: string; text: string; glow: string; ring: string }> = {
  cyan: { card: "from-cyan-500/10 to-transparent border-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/10", ring: "ring-cyan-500/30" },
  green: { card: "from-emerald-500/10 to-transparent border-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/10", ring: "ring-emerald-500/30" },
  emerald: { card: "from-emerald-500/10 to-transparent border-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/10", ring: "ring-emerald-500/30" },
  purple: { card: "from-violet-500/10 to-transparent border-violet-500/20", text: "text-violet-400", glow: "shadow-violet-500/10", ring: "ring-violet-500/30" },
  orange: { card: "from-orange-500/10 to-transparent border-orange-500/20", text: "text-orange-400", glow: "shadow-orange-500/10", ring: "ring-orange-500/30" },
  pink: { card: "from-pink-500/10 to-transparent border-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/10", ring: "ring-pink-500/30" },
  gold: { card: "from-amber-500/10 to-transparent border-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/10", ring: "ring-amber-500/30" },
  blue: { card: "from-blue-500/10 to-transparent border-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/10", ring: "ring-blue-500/30" },
  slate: { card: "from-slate-500/10 to-transparent border-slate-500/20", text: "text-slate-400", glow: "shadow-slate-500/10", ring: "ring-slate-500/30" },
  teal: { card: "from-teal-500/10 to-transparent border-teal-500/20", text: "text-teal-400", glow: "shadow-teal-500/10", ring: "ring-teal-500/30" },
  sky: { card: "from-sky-500/10 to-transparent border-sky-500/20", text: "text-sky-400", glow: "shadow-sky-500/10", ring: "ring-sky-500/30" },
  indigo: { card: "from-indigo-500/10 to-transparent border-indigo-500/20", text: "text-indigo-400", glow: "shadow-indigo-500/10", ring: "ring-indigo-500/30" },
  rose: { card: "from-rose-500/10 to-transparent border-rose-500/20", text: "text-rose-400", glow: "shadow-rose-500/10", ring: "ring-rose-500/30" },
  violet: { card: "from-violet-500/10 to-transparent border-violet-500/20", text: "text-violet-400", glow: "shadow-violet-500/10", ring: "ring-violet-500/30" },
  red: { card: "from-red-500/10 to-transparent border-red-500/20", text: "text-red-400", glow: "shadow-red-500/10", ring: "ring-red-500/30" },
  fuchsia: { card: "from-fuchsia-500/10 to-transparent border-fuchsia-500/20", text: "text-fuchsia-400", glow: "shadow-fuchsia-500/10", ring: "ring-fuchsia-500/30" },
  amber: { card: "from-amber-500/10 to-transparent border-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/10", ring: "ring-amber-500/30" },
  lime: { card: "from-lime-500/10 to-transparent border-lime-500/20", text: "text-lime-400", glow: "shadow-lime-500/10", ring: "ring-lime-500/30" },
};

/* ───── Comparison data ───── */
const COMPARISON_ROWS = [
  { label: "Runs locally", us: true, them: false },
  { label: "No cloud dependency", us: true, them: false },
  { label: "Persistent memory across sessions", us: true, them: false },
  { label: "Own your agent forever (MIT)", us: true, them: false },
  { label: "No monthly subscription", us: true, them: false },
  { label: "Scoped research per domain", us: true, them: false },
  { label: "Deterministic failure recovery", us: true, them: false },
  { label: "Confidence-scored outputs", us: true, them: false },
  { label: "Multi-framework adapters (LangChain, CrewAI)", us: true, them: false },
  { label: "Black-box protected runtime", us: true, them: false },
  { label: "Requires internet to function", us: false, them: true },
];

/* ───── Intelligence Layer capabilities ───── */
const INTELLIGENCE_FEATURES = [
  {
    icon: Search,
    title: "Scoped Research",
    description: "Domain-specific whitelists enforce research boundaries. Each Mind only accesses verified, relevant sources.",
    status: "ACTIVE",
  },
  {
    icon: Workflow,
    title: "Tool Chain Composition",
    description: "Deterministic multi-step workflows — research → summarize → draft → format — configurable per Mind.",
    status: "ACTIVE",
  },
  {
    icon: FileText,
    title: "Prompt Scaffolding",
    description: "Hardened, role-specific system prompts with embedded reasoning patterns. No generic fallback.",
    status: "ACTIVE",
  },
  {
    icon: RotateCcw,
    title: "Failure Recovery",
    description: "Structured retry and repair playbooks for tool failures. No generic apology — deterministic recovery.",
    status: "ACTIVE",
  },
  {
    icon: Layers,
    title: "Context Windowing",
    description: "Signal-weighted memory prioritization. Recent + high-relevance beats chronological. Prevents runaway growth.",
    status: "ACTIVE",
  },
  {
    icon: Gauge,
    title: "Confidence Signaling",
    description: "Every output includes a confidence score. Internal rubric stays sealed — you see the signal, not the math.",
    status: "ACTIVE",
  },
];

/* ───── Horizontal Mind Card ───── */
function MindCard({ item, chosenName, onBuy }: { item: CognitiveItem; chosenName: string; onBuy: (sku: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const accent = ACCENT_COLORS[item.accentColor] || ACCENT_COLORS.cyan;

  const handleBuy = async () => {
    setLoading(true);
    try { await onBuy(item.sku); } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
      className="min-w-[320px] max-w-[360px] snap-center shrink-0"
    >
      <Card className={cn(
        "relative overflow-hidden border bg-gradient-to-b transition-all duration-500 group h-full",
        "hover:shadow-2xl hover:-translate-y-1",
        accent.card, `hover:${accent.glow}`
      )}>
        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
        }} />

        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <Badge variant="outline" className="text-[9px] font-mono gap-1 bg-background/80 backdrop-blur-sm border-border/50">
            {item.version}
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono gap-1 bg-background/80 backdrop-blur-sm border-border/50">
            <Lock className="w-2.5 h-2.5" />
            BLACK-BOX
          </Badge>
        </div>

        <CardContent className="p-6 space-y-4 relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 rounded-xl bg-background/60 border border-border/40 overflow-hidden shrink-0 p-1.5"
            >
              <img src={IMAGE_MAP[item.imagePath] || hybridImg} alt={item.displayName} className="w-full h-full object-contain drop-shadow-lg" loading="lazy" />
            </motion.div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-black text-base tracking-tight leading-tight">{item.displayName}</h3>
              <Badge variant="outline" className={cn("text-[10px] font-mono mt-1", accent.text)}>
                {item.className}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{item.tagline}</p>
            </div>
          </div>

           {/* Price + Persistent Memory label */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              {item.isFree ? (
                <span className="text-2xl font-black tracking-tighter text-amber-400">FREE</span>
              ) : (
                <>
                  <span className="text-2xl font-black tracking-tighter">${item.priceCents >= 15900 ? '159' : '129'}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">one-time · sealed runtime</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Brain className="w-3 h-3 text-primary/60" />
              <span>Powered by Persistent Memory</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Capabilities */}
          <div className="space-y-1.5 flex-1">
            {item.capabilities.slice(0, 3).map((cap, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <CheckCircle className={cn("w-3 h-3 mt-0.5 shrink-0", accent.text)} />
                <span className="text-muted-foreground">{cap}</span>
              </div>
            ))}
          </div>

          {/* Expand */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-primary/80 hover:text-primary transition-colors"
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
                className="overflow-hidden space-y-1.5"
              >
                {item.enhancements.map((enh, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
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
            className={cn("w-full gap-2 font-mono text-sm h-11 transition-all duration-300 mt-auto",
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
                Acquire — ${item.priceCents >= 15900 ? '159' : '129'}
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
  const canceled = searchParams.get("canceled") === "1";
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleBuy = useCallback(async (sku: string) => {
    const validation = validateCognitiveName(chosenName);
    if (!validation.valid) {
      pushToast({ message: validation.error || "Please name your Mind first — scroll up to the name field", variant: "warning", anchor: "center", durationMs: 5000 });
      const nameInput = document.querySelector('input[placeholder*="Nova"]') || document.querySelector('input[placeholder*="Agent"]');
      if (nameInput) nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    try {
      const item = PUBLIC_CATALOG.find(c => c.sku === sku);
      const { data, error } = await supabase.functions.invoke("agent-checkout", {
        body: { agent_id: sku, agent_name: item?.displayName || sku, chosen_name: chosenName },
      });
      if (error) throw error;
      if (data?.free && data?.redirect) { window.location.href = data.redirect; return; }
      if (data?.url) { window.location.href = data.url; }
    } catch (err) {
      console.error("Checkout error:", err);
      pushToast({ message: "Checkout failed. Please try again.", variant: "error", anchor: "center", durationMs: 5000 });
    }
  }, [chosenName]);

  const scrollCards = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Composable Minds — CMPSBL®</title>
        <meta name="description" content="Persistent Minds that remember, improve, and stay stable. Download once. Run anywhere. No subscriptions. No cloud dependency." />
      </Helmet>

      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
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

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              <span className="block">Persistent Minds that</span>
              <span className="block glow-text mt-1">remember, improve, and stay stable.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              These are <span className="text-foreground font-semibold">compiled cognitive runtimes</span> — 
              agents with persistent memory, a 6-layer intelligence engine, versioned stability, and zero cloud dependency. 
              Download once. Run forever. <span className="text-foreground font-semibold">No subscription.</span>
            </p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 sm:gap-8 text-sm flex-wrap"
            >
              {[
                { icon: Brain, label: "20 Agents", sub: "3 free + 17 paid" },
                { icon: Activity, label: "6 Active", sub: "intelligence layers" },
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

      {/* ═══ HORIZONTAL MIND CARDS ═══ */}
      <section className="pb-24 relative">
        {/* Sticky section header */}
        <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 py-4 mb-8">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Choose Your Mind</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each ships as a versioned, stable runtime with persistent memory.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => scrollCards('left')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => scrollCards('right')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 sm:px-8 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Leading spacer for centering on desktop */}
          <div className="shrink-0 w-0 sm:w-[calc((100vw-1200px)/2)]" />

          {PUBLIC_CATALOG.map((item) => (
            <MindCard key={item.sku} item={item} chosenName={chosenName} onBuy={handleBuy} />
          ))}

          {/* "More Coming" teaser card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="min-w-[320px] max-w-[360px] snap-center shrink-0"
          >
            <Card className="border-dashed border-border/40 h-full flex items-center justify-center bg-muted/5">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7 text-primary/60" />
                </div>
                <h3 className="font-bold text-lg">17 More Minds</h3>
                <p className="text-sm text-muted-foreground">
                  Research, Coding, Legal, DevOps, and more — training internally and shipping soon.
                </p>
                <Badge variant="outline" className="font-mono text-[10px]">
                  COMING SOON
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trailing spacer */}
          <div className="shrink-0 w-4 sm:w-[calc((100vw-1200px)/2)]" />
        </div>

        {/* Mobile scroll hint */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <ChevronLeft className="w-3 h-3" />
          <span>Swipe to browse</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </section>

      {/* ═══ INTELLIGENCE LAYER ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-4 mb-16"
            >
              <Badge variant="outline" className="font-mono text-[10px] tracking-[0.15em] border-primary/20 bg-primary/5">
                INTELLIGENCE LAYER
              </Badge>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Not just memory. <span className="glow-text">Intelligence.</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                Every Mind ships with 6 production-active intelligence capabilities. 
                These aren't features — they're how the Mind thinks.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {INTELLIGENCE_FEATURES.map((feature, i) => {
                const FeatureIcon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="border-border/40 bg-background/60 backdrop-blur-sm h-full hover:border-primary/30 transition-all duration-300 group">
                      <CardContent className="p-5 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                            <FeatureIcon className="w-4 h-4 text-primary" />
                          </div>
                          <Badge variant="outline" className="text-[8px] font-mono tracking-wider border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                            {feature.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Gated features teaser */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/30 bg-muted/30 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>5 more intelligence layers training internally — memory consolidation, quality scoring, adaptive tone, vocabulary growth, proficiency gating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FREE vs PAID TIER ═══ */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3 mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Free vs Paid</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Start free with Hybrid or Educator. Unlock deeper capabilities with paid Minds.
            </p>
          </motion.div>

          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/50 bg-muted/30">
                <div className="p-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Capability</div>
                <div className="p-4 text-center">
                  <span className="text-xs font-bold text-amber-400">FREE</span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-xs font-bold text-primary">PAID</span>
                </div>
              </div>
              {[
                { label: "Persistent memory", free: true, paid: true },
                { label: "Black-box runtime", free: true, paid: true },
                { label: "Intelligence Layer (6 capabilities)", free: true, paid: true },
                { label: "Scoped research domains", free: true, paid: true },
                { label: "Confidence-scored outputs", free: true, paid: true },
                { label: "Deep memory depth (256MB)", free: false, paid: true },
                { label: "Full tool chain expansion (24 tools)", free: false, paid: true },
                { label: "Domain-specific prompt scaffolding", free: false, paid: true },
                { label: "Failure recovery playbooks", free: false, paid: true },
                { label: "Version upgrade priority", free: false, paid: true },
                { label: "MIT license", free: true, paid: true },
              ].map((row, i) => (
                <div key={i} className={cn(
                  "grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/30 last:border-b-0",
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                )}>
                  <div className="p-3 md:p-4 text-sm text-muted-foreground">{row.label}</div>
                  <div className="p-3 md:p-4 flex items-center justify-center">
                    {row.free ? <CheckCircle className="w-4 h-4 text-amber-400" /> : <X className="w-4 h-4 text-muted-foreground/30" />}
                  </div>
                  <div className="p-3 md:p-4 flex items-center justify-center">
                    {row.paid ? <CheckCircle className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-muted-foreground/30" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Why Developers Switch to <span className="glow-text">Minds</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Stop renting intelligence. Start owning it.
            </p>
          </motion.div>

          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/50 bg-muted/30">
                <div className="p-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Feature</div>
                <div className="p-4 text-center">
                  <span className="text-xs font-black tracking-tight text-primary">CMPSBL</span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-xs font-mono text-muted-foreground">Others</span>
                </div>
              </div>
              {COMPARISON_ROWS.map((row, i) => (
                <div key={i} className={cn(
                  "grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/30 last:border-b-0",
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                )}>
                  <div className="p-3 md:p-4 text-sm text-muted-foreground">{row.label}</div>
                  <div className="p-3 md:p-4 flex items-center justify-center">
                    {row.us ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-muted-foreground/30" />}
                  </div>
                  <div className="p-3 md:p-4 flex items-center justify-center">
                    {row.them ? <CheckCircle className="w-4 h-4 text-muted-foreground/40" /> : <X className="w-4 h-4 text-muted-foreground/30" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ BLACK-BOX ENFORCEMENT ═══ */}
      <section className="relative py-24 overflow-hidden">
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
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Black-Box <span className="glow-text">Enforcement</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                You get the power, not the blueprint. Every mind ships as a compiled, sealed artifact.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-emerald-500/20 bg-emerald-500/5 h-full">
                  <CardContent className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold">What You Get</h3>
                    </div>
                    <div className="space-y-2.5">
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

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-border/30 h-full">
                  <CardContent className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold">What's Sealed</h3>
                    </div>
                    <div className="space-y-2.5">
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
            <h2 className="text-2xl font-black tracking-tight">Install in 3 Minutes</h2>
            <p className="text-sm text-muted-foreground">
              Every mind ships as a self-contained runtime. Plug into Node, HTTP, LangChain, or CrewAI.
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
