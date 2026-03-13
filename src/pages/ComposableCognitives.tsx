/**
 * Composable Minds — Full Marketplace
 * Flip cards with personality fronts & sales backs
 * Grouped by abstract role categories
 * All 20 agents with DREAM Synthesis
 */

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Download, Sparkles, Shield, Zap, CheckCircle, Lock,
  Brain, Code, Palette, TrendingUp, ChevronDown, ChevronUp, Package,
  ArrowRight, Star, Users, Clock, HelpCircle,
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
  return `$${item.bundlePriceCents / 100}`;
}

const FAQ_ITEMS = [
  {
    q: "What is a Sealed Runtime Agent?",
    a: "A self-contained cognitive program with persistent memory, autonomous learning (DREAM Synthesis), and a unique personality. It's minted at purchase — capturing all capabilities as a versioned artifact you own forever.",
  },
  {
    q: "What does DREAM Synthesis actually do?",
    a: "DREAM (Distill, Recognize, Encode, Apply, Measure) is a five-phase learning loop built into every agent. It distills patterns from your interactions, encodes them into persistent memory, applies improvements in real-time, and measures the performance delta. Your agent gets better every time you use it.",
  },
  {
    q: "How does the 40% bundle discount work?",
    a: "When you purchase any agent with a CMPSBL Composable Engine, the agent price drops by 40%. Elite agents go from $159 → $95. Professional from $129 → $77. Toggle 'Bundle with Engine' above to see discounted prices.",
  },
  {
    q: "Can I use agents without a CMPSBL Engine?",
    a: "Absolutely. Every agent works standalone with any LLM provider (OpenAI, Anthropic, Groq, etc.). The engine is optional but unlocks deeper orchestration, cross-agent memory, and priority routing.",
  },
  {
    q: "What's included in a free agent?",
    a: "Free agents include the same core runtime, DREAM Synthesis, and persistent memory as paid agents. They have 3–5 capabilities and work with any provider. No credit card required.",
  },
  {
    q: "Do I need an account to purchase?",
    a: "No. You can checkout as a guest. Your license, ownership certificate, and download link are emailed instantly after purchase.",
  },
];

/* ───── Main Page ───── */
export default function ComposableCognitives() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [chosenName, setChosenName] = useState("");
  const [dreamOpen, setDreamOpen] = useState(false);
  const [bundleMode, setBundleMode] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const canceled = searchParams.get("canceled") === "1";
  const licensedAgent = searchParams.get("licensed");
  const sessionId = searchParams.get("session_id");

  // ── Post-purchase verification ──
  useEffect(() => {
    if (licensedAgent && sessionId) {
      supabase.functions.invoke("agent-verify", {
        body: { session_id: sessionId, agent_id: licensedAgent },
      }).then(({ data }) => {
        if ((data as any)?.success) {
          setPurchaseSuccess((data as any).agent || licensedAgent.toUpperCase());
          pushToast({
            message: `${(data as any).agent || licensedAgent.toUpperCase()} Agent activated! Check your email for your ownership certificate.`,
            variant: "success",
            anchor: "center",
            durationMs: 8000,
          });
        }
      }).catch(() => {});
    }
    // Free agent activation
    const activated = searchParams.get("activated");
    if (activated) {
      setPurchaseSuccess(activated.toUpperCase());
      pushToast({
        message: `${activated.toUpperCase()} Agent activated! Ready to use.`,
        variant: "success",
        anchor: "center",
        durationMs: 5000,
      });
    }
  }, [licensedAgent, sessionId, searchParams]);

  const handleBuy = useCallback(async (sku: string) => {
    const item = PUBLIC_CATALOG.find(c => c.sku === sku);
    if (!item?.isFree) {
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
      if (data?.free) {
        // Free agent — activate instantly with toast instead of full-page reload
        setPurchaseSuccess(sku.toUpperCase());
        pushToast({
          message: `🎉 ${item?.displayName || sku.toUpperCase()} activated! Mint ID: ${data.mint_id || 'generated'}`,
          variant: "success",
          anchor: "center",
          durationMs: 6000,
        });
        // Update URL without reload so bookmarking works
        navigate(`/composable-cognitives?activated=${sku}`, { replace: true });
        return;
      }
      if (data?.url) { window.location.href = data.url; }
    } catch (err) {
      console.error("Checkout error:", err);
      pushToast({ message: "Checkout failed. Please try again.", variant: "error", anchor: "center", durationMs: 5000 });
    }
  }, [chosenName, bundleMode, navigate]);

  const grouped = AGENTS_BY_CATEGORY();
  const categoryOrder: AgentCategory[] = [
    'Cognitive Synthesis', 'Creative Force', 'Structural Logic', 'Sovereign Defense', 'Growth Intelligence'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Composable Agents — 20 AI Cognitives | CMPSBL®</title>
        <meta name="description" content="20 composable AI agents with sealed runtimes, DREAM synthesis, and persistent memory. Own forever from free to $159. Each cognitive learns autonomously and consolidates memories overnight." />
      </Helmet>

      <PublicNav />

      {/* Breadcrumb trail */}
      <div className="container mx-auto px-4 pt-20">
        <PublicBreadcrumb />
      </div>

      {/* ═══ SUCCESS BANNER ═══ */}
      {purchaseSuccess && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-emerald-300">
              <strong>{purchaseSuccess} Agent</strong> activated successfully! Your ownership certificate and download link have been emailed.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section className="relative pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="font-mono text-[11px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] border-primary/20 bg-primary/5 px-3 sm:px-4 py-1.5">
              20 SEALED RUNTIMES • DREAM SYNTHESIS • OWN FOREVER
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              <span className="block">Minds that remember,</span>
              <span className="block glow-text mt-1">learn, and evolve.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Each agent is a <span className="text-foreground font-semibold">sealed cognitive runtime</span> with 
              persistent memory, DREAM Synthesis for autonomous improvement, and a unique personality archetype.
              Purchase once — own forever. No subscriptions.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {[
                { icon: Shield, text: 'Source-blocked & tamper-proof' },
                { icon: Brain, text: 'DREAM learning in every agent' },
                { icon: Clock, text: 'Perpetual license' },
                { icon: Users, text: '20 specialized archetypes' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-primary/60" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

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

      {/* ═══ TIER COMPARISON ═══ */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              { tier: 'free' as const, powers: '3–5', agents: '3', highlight: 'Start free' },
              { tier: 'starter' as const, powers: '5', agents: '5', highlight: 'Best value' },
              { tier: 'professional' as const, powers: '5', agents: '9', highlight: 'Full stack' },
              { tier: 'elite' as const, powers: '5', agents: '3', highlight: 'Maximum power' },
            ]).map(({ tier, powers, agents, highlight }) => (
              <div key={tier} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center space-y-2 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
                <div className={cn("w-3 h-3 rounded-full mx-auto", TIER_ACCENT[tier])} />
                <div className={cn("text-sm font-black", TIER_CONFIG[tier].color)}>{TIER_CONFIG[tier].label}</div>
                <div className="text-2xl font-black">{TIER_CONFIG[tier].price}</div>
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  <div>{powers} Apex Discovery powers</div>
                  <div>{agents} agents</div>
                  <div>DREAM Synthesis included</div>
                  <div>Persistent memory</div>
                </div>
                <div className="text-[11px] font-semibold text-primary">{highlight}</div>
              </div>
            ))}
          </div>
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
                       <div className="text-[11px] text-muted-foreground mt-1">{phase.detail}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ NAME CHOOSER + BUNDLE TOGGLE ═══ */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <div className="flex-1 w-full">
            <NameChooser value={chosenName} onChange={setChosenName} />
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 shrink-0">
            <div>
              <p className="text-sm font-bold">Bundle with CMPSBL Engine</p>
              <p className="text-[11px] text-muted-foreground">Save 40% — pairs with any Composable Engine</p>
            </div>
            <Switch checked={bundleMode} onCheckedChange={setBundleMode} />
          </div>
        </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {agents.map((item, i) => {
                const tierCfg = TIER_CONFIG[item.tier];
                return (
                  <FlipCard
                    key={item.sku}
                    className="h-[290px]"
                    index={i}
                    frontTitle={item.displayName}
                    frontSubtitle={`${item.tagline}`}
                    frontIcon={
                      <img src={IMAGE_MAP[item.imagePath] || hybridImg} alt={item.displayName} className="w-14 h-14 object-contain rounded-xl" />
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
                    backPrice={bundleMode && !item.isFree ? bundleLabel(item) : priceLabel(item)}
                    backPriceLabel={item.isFree ? 'No card required' : bundleMode ? '40% bundle discount' : `${bundleLabel(item)} w/ engine`}
                    backCta={{
                      label: item.isFree ? 'Activate Free' : `Acquire — ${bundleMode ? bundleLabel(item) : priceLabel(item)}`,
                    }}
                    onAction={() => handleBuy(item.sku)}
                    borderClass={catConfig.border}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ═══ CROSS-SELL: ENGINES ═══ */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
          <Badge variant="outline" className="font-mono text-[11px] border-primary/30 text-primary mb-4">
            BUNDLE DEAL
          </Badge>
          <h2 className="text-2xl font-black mb-2">40% Off Every Agent When Bundled</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Combine any agent with a CMPSBL Composable Engine — the sealed runtime that powers orchestration, routing, 
            self-healing, and security. Elite agents drop from $159 → $95. Professional from $129 → $77.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <a href="/engines">
                <Zap className="w-4 h-4" />
                Browse 20 Engines
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 hover:border-primary/30 transition-colors">
              <a href="/cmpsbl-engine">
                <Star className="w-4 h-4" />
                ARCHITECT Engine — $999/yr
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="border border-border/50 rounded-xl overflow-hidden hover:border-primary/15 transition-colors duration-200">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="text-sm font-semibold pr-4">{faq.q}</span>
                  {faqOpen === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
