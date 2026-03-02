/**
 * Composable Minds — Full Marketplace
 * Flip cards with personality fronts & sales backs
 * Grouped by abstract role categories
 * All 20 agents with DREAM Synthesis
 */

import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Download, Sparkles, Shield, Zap, CheckCircle, Lock,
  Brain, Code, Palette, TrendingUp, ChevronDown, ChevronUp, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { NameChooser } from "@/components/cognitives/NameChooser";
import { FlipCard } from "@/components/commerce/FlipCard";
import {
  PUBLIC_CATALOG, AGENTS_BY_CATEGORY, DREAM_ABILITY, TIER_CONFIG, CATEGORY_CONFIG,
  type CognitiveItem, type AgentCategory,
} from "@/lib/cognitives/catalog";
import { validateCognitiveName } from "@/lib/cognitives/nameGen";
import { supabase } from "@/integrations/supabase/client";
import { pushToast } from "@/components/toast/SmartToastStore";
import { cn } from "@/lib/utils";

import researchImg from "@/assets/cognitives/research.png";
import codingImg from "@/assets/cognitives/coding.png";
import analystImg from "@/assets/cognitives/analyst.png";
import opsImg from "@/assets/cognitives/ops.png";
import writerImg from "@/assets/cognitives/writer.png";
import hybridImg from "@/assets/cognitives/hybrid.png";

const IMAGE_MAP: Record<string, string> = {
  research: researchImg, coding: codingImg, analyst: analystImg,
  ops: opsImg, writer: writerImg, hybrid: hybridImg,
  educator: hybridImg, sales: analystImg, legal: opsImg,
  recruiter: researchImg, support: codingImg, 'data-engineer': codingImg,
  marketing: writerImg, product: analystImg, security: opsImg,
  finance: analystImg, designer: writerImg, devops: codingImg,
  strategist: researchImg, translator: hybridImg,
};

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  'Cognitive Synthesis': Brain,
  'Creative Force': Palette,
  'Structural Logic': Code,
  'Sovereign Defense': Shield,
  'Growth Intelligence': TrendingUp,
};

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'Cognitive Synthesis': { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  'Creative Force': { border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400' },
  'Structural Logic': { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  'Sovereign Defense': { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
  'Growth Intelligence': { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
};

const TIER_ACCENT: Record<string, string> = {
  free: 'bg-emerald-500',
  starter: 'bg-sky-500',
  professional: 'bg-amber-500',
  elite: 'bg-gradient-to-r from-rose-500 to-violet-500',
};

function priceLabel(item: CognitiveItem): string {
  if (item.isFree) return 'FREE';
  return `$${item.priceCents / 100}`;
}

function bundleLabel(item: CognitiveItem): string {
  if (item.isFree) return 'FREE';
  return `$${item.bundlePriceCents / 100} bundled`;
}

/* ───── Main Page ───── */
export default function ComposableCognitives() {
  const [searchParams] = useSearchParams();
  const [chosenName, setChosenName] = useState("");
  const [dreamOpen, setDreamOpen] = useState(false);
  const [bundleMode, setBundleMode] = useState(false);
  const canceled = searchParams.get("canceled") === "1";

  const handleBuy = useCallback(async (sku: string) => {
    const item = PUBLIC_CATALOG.find(c => c.sku === sku);
    if (item?.isFree) {
      // Free agents skip name validation
    } else {
      const validation = validateCognitiveName(chosenName);
      if (!validation.valid) {
        pushToast({ message: validation.error || "Name your Mind first", variant: "warning", anchor: "center", durationMs: 5000 });
        return;
      }
    }
    try {
      const { data, error } = await supabase.functions.invoke("agent-checkout", {
        body: { agent_id: sku, agent_name: item?.displayName || sku, chosen_name: chosenName, bundle_with_engine: bundleMode },
      });
      if (error) throw error;
      if (data?.free && data?.redirect) { window.location.href = data.redirect; return; }
      if (data?.url) { window.location.href = data.url; }
    } catch (err) {
      console.error("Checkout error:", err);
      pushToast({ message: "Checkout failed. Please try again.", variant: "error", anchor: "center", durationMs: 5000 });
    }
  }, [chosenName]);

  const grouped = AGENTS_BY_CATEGORY();
  const categoryOrder: AgentCategory[] = [
    'Cognitive Synthesis', 'Creative Force', 'Structural Logic', 'Sovereign Defense', 'Growth Intelligence'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Composable Minds — CMPSBL®</title>
        <meta name="description" content="20 Sealed Runtime Agents with DREAM Synthesis. Persistent memory, tiered pricing, and autonomous learning. Download once. Run forever." />
      </Helmet>

      <PublicNav />

      {/* Breadcrumb trail */}
      <div className="container mx-auto px-4 pt-20">
        <PublicBreadcrumb />
      </div>
      {/* ═══ HERO ═══ */}
      <section className="relative pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="font-mono text-[10px] tracking-[0.2em] border-primary/20 bg-primary/5 px-4 py-1.5">
              20 SEALED RUNTIMES • DREAM SYNTHESIS • OWN FOREVER
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              <span className="block">Minds that remember,</span>
              <span className="block glow-text mt-1">learn, and evolve.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Each agent is a <span className="text-foreground font-semibold">sealed cognitive runtime</span> with 
              persistent memory, DREAM Synthesis for autonomous improvement, and a unique personality archetype. 
              <span className="text-foreground font-semibold"> 40% off when bundled with a CMPSBL Engine.</span>
            </p>

            {/* Tier pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {(['free', 'starter', 'professional', 'elite'] as const).map(t => (
                <div key={t} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50">
                  <div className={cn("w-2 h-2 rounded-full", TIER_ACCENT[t])} />
                  <span className={cn("text-xs font-bold", TIER_CONFIG[t].color)}>{TIER_CONFIG[t].label}</span>
                  <span className="text-xs text-muted-foreground">{TIER_CONFIG[t].price}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ DREAM SYNTHESIS ═══ */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => setDreamOpen(!dreamOpen)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold">DREAM Synthesis</h2>
                <p className="text-xs text-muted-foreground">Every agent learns, adapts, and improves autonomously</p>
              </div>
            </div>
            {dreamOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {dreamOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-6">
                  {DREAM_ABILITY.phases.map((phase) => (
                    <div key={phase.letter} className="p-3 rounded-lg border border-primary/10 bg-primary/5 text-center">
                      <div className="text-2xl font-black text-primary">{phase.letter}</div>
                      <div className="text-xs font-bold mt-1">{phase.word}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{phase.detail}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ NAME CHOOSER ═══ */}
      <section className="container mx-auto px-4 py-8">
        <NameChooser value={chosenName} onChange={setChosenName} />
      </section>

      {canceled && (
        <div className="container mx-auto px-4 pb-4">
          <Alert variant="destructive"><AlertDescription>Checkout was canceled. Your Mind is still available.</AlertDescription></Alert>
        </div>
      )}

      {/* ═══ AGENT GRID — BY CATEGORY ═══ */}
      {categoryOrder.map(category => {
        const agents = grouped[category];
        if (!agents || agents.length === 0) return null;
        const catConfig = CATEGORY_COLORS[category];
        const CatIcon = CATEGORY_ICONS[category] || Brain;

        return (
          <section key={category} className="container mx-auto px-4 pb-16">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", catConfig.bg, catConfig.border, "border")}>
                <CatIcon className={cn("w-4 h-4", catConfig.text)} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">{category}</h2>
                <p className="text-xs text-muted-foreground">{CATEGORY_CONFIG[category].description}</p>
              </div>
            </div>

            {/* Agent flip cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((item, i) => {
                const tierCfg = TIER_CONFIG[item.tier];
                return (
                  <FlipCard
                    key={item.sku}
                    className="h-[290px]"
                    index={i}
                    frontTitle={item.displayName}
                    frontSubtitle={`"${item.personality.motto}" — ${item.personality.tone}`}
                    frontIcon={
                      <img src={IMAGE_MAP[item.imagePath] || hybridImg} alt={item.displayName} className="w-8 h-8 object-contain" />
                    }
                    frontBadge={tierCfg.label}
                    frontBadgeClass={cn(
                      item.tier === 'free' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      item.tier === 'starter' && 'bg-sky-500/10 text-sky-400 border-sky-500/30',
                      item.tier === 'professional' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      item.tier === 'elite' && 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    )}
                    frontAccentBar={TIER_ACCENT[item.tier]}
                    frontStats={[
                      { label: 'caps', value: String(item.capabilities.length), icon: <Sparkles className="w-3 h-3 text-amber-500" /> },
                      { label: '', value: 'DREAM', icon: <Brain className="w-3 h-3 text-primary" /> },
                    ]}
                    backCapabilities={item.capabilities}
                    backPrice={priceLabel(item)}
                    backPriceLabel={item.isFree ? '' : `${bundleLabel(item)} w/ engine`}
                    backCta={item.isFree
                      ? { label: 'Free Download', href: '#' }
                      : { label: `Acquire — ${priceLabel(item)}`, href: '#' }
                    }
                    borderClass={catConfig.border}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ═══ BUNDLE CTA ═══ */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
          <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary mb-4">
            BUNDLE DEAL
          </Badge>
          <h2 className="text-2xl font-black mb-2">40% Off Every Agent</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Combine any agent with a CMPSBL Composable Engine and save 40% on the agent price. 
            Elite agents drop from $159 to $95. Professional from $129 to $77.
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/engines">
              <Zap className="w-4 h-4" />
              Browse Engines
            </a>
          </Button>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
