/**
 * Runtime Agents — Full Marketplace
 * 5 Fused Meta-Agents with spy-vs-spy 2026 aesthetic
 */

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Download, Sparkles, Shield, Zap, CheckCircle, Lock,
  Brain, Code, Palette, TrendingUp, ChevronDown, ChevronUp, Package,
  ArrowRight, Star, Users, Clock, HelpCircle, Briefcase, Cog,
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
  PUBLIC_CATALOG, DREAM_ABILITY, TIER_CONFIG, CATEGORY_CONFIG,
  type CognitiveItem, type AgentCategory,
} from "@/lib/cognitives/catalog";
import { validateCognitiveName } from "@/lib/cognitives/nameGen";
import { supabase } from "@/integrations/supabase/client";
import { pushToast } from "@/components/toast/SmartToastStore";
import { cn } from "@/lib/utils";

import primitiveImg from "@/assets/agents/primitive.png";
import wraithImg from "@/assets/agents/wraith.png";
import obsidianImg from "@/assets/agents/obsidian.png";
import monolithImg from "@/assets/agents/monolith.png";
import raptorImg from "@/assets/agents/raptor.png";

const IMAGE_MAP: Record<string, string> = {
  primitive: primitiveImg,
  wraith: wraithImg,
  obsidian: obsidianImg,
  monolith: monolithImg,
  raptor: raptorImg,
};

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  'Foundation': Cog,
  'Engineering': Code,
  'Defense': Shield,
  'Intelligence': Brain,
  'Growth': Briefcase,
};

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'Foundation': { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Engineering': { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  'Defense': { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
  'Intelligence': { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  'Growth': { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
};

const TIER_ACCENT: Record<string, string> = {
  free: 'bg-emerald-500',
  starter: 'bg-sky-500',
  professional: 'bg-amber-500',
  elite: 'bg-gradient-to-r from-rose-500 to-violet-500',
  apex: 'bg-gradient-to-r from-fuchsia-500 to-cyan-500',
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
    q: "What is a Meta-Agent?",
    a: "A Meta-Agent is a sealed fusion of multiple specialized runtimes into one powerful cognitive program. Each combines 3–5 original agent capabilities with persistent memory, DREAM Synthesis, and a unique personality. Purchase once — own forever.",
  },
  {
    q: "What does DREAM Synthesis actually do?",
    a: "DREAM (Distill, Recognize, Encode, Apply, Measure) is a five-phase learning loop built into every agent. It distills patterns from your interactions, encodes them into persistent memory, applies improvements in real-time, and measures the performance delta.",
  },
  {
    q: "How does the 40% bundle discount work?",
    a: "When you purchase any agent with a CMPSBL Composable Engine, the agent price drops by 40%. Toggle 'Bundle with Engine' above to see discounted prices.",
  },
  {
    q: "Can I use agents without a CMPSBL Engine?",
    a: "Absolutely. Every agent works standalone with any LLM provider (OpenAI, Anthropic, Groq, etc.). The engine is optional but unlocks deeper orchestration.",
  },
  {
    q: "What's included in the free PRIMITIVE agent?",
    a: "PRIMITIVE is a four-runtime fusion (Hybrid + Educator + Writer + Translator) with the same core sealed runtime, DREAM Synthesis, and persistent memory as paid agents. No credit card required.",
  },
  {
    q: "What original agents are fused into each Meta-Agent?",
    a: "PRIMITIVE = Hybrid + Educator + Writer + Translator. WRAITH = Coding + Designer + DevOps + Data-Engineer. OBSIDIAN = Guardian + Security + Support + Ops + Legal. MONOLITH = Memory + Analyst + Research + Strategist + Product. RAPTOR = Sales + Marketing + Recruiter + Finance.",
  },
];

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

  useEffect(() => {
    if (licensedAgent && sessionId) {
      supabase.functions.invoke("agent-verify", {
        body: { session_id: sessionId, agent_id: licensedAgent },
      }).then(({ data }) => {
        if ((data as any)?.success) {
          setPurchaseSuccess((data as any).agent || licensedAgent.toUpperCase());
          pushToast({
            message: `${(data as any).agent || licensedAgent.toUpperCase()} Meta-Agent activated!`,
            variant: "success", anchor: "center", durationMs: 8000,
          });
        }
      }).catch(() => {});
    }
    const activated = searchParams.get("activated");
    if (activated) {
      setPurchaseSuccess(activated.toUpperCase());
      pushToast({ message: `${activated.toUpperCase()} Meta-Agent activated!`, variant: "success", anchor: "center", durationMs: 5000 });
    }
  }, [licensedAgent, sessionId, searchParams]);

  const handleBuy = useCallback(async (sku: string) => {
    const item = PUBLIC_CATALOG.find(c => c.sku === sku);
    if (!item?.isFree) {
      const validation = validateCognitiveName(chosenName);
      if (!validation.valid) {
        pushToast({ message: validation.error || "Name your agent first", variant: "warning", anchor: "center", durationMs: 5000 });
        return;
      }
    }
    try {
      const { data, error } = await supabase.functions.invoke("agent-checkout", {
        body: { agent_id: sku, agent_name: item?.displayName || sku, chosen_name: chosenName, bundle_with_engine: bundleMode },
      });
      if (error) throw error;
      if (data?.free) {
        setPurchaseSuccess(sku.toUpperCase());
        pushToast({ message: `🎉 ${item?.displayName || sku.toUpperCase()} activated!`, variant: "success", anchor: "center", durationMs: 6000 });
        navigate(`/composable-cognitives?activated=${sku}`, { replace: true });
        return;
      }
      if (data?.url) { window.location.href = data.url; }
    } catch (err) {
      console.error("Checkout error:", err);
      pushToast({ message: "Checkout failed. Please try again.", variant: "error", anchor: "center", durationMs: 5000 });
    }
  }, [chosenName, bundleMode, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Meta-Agents — 5 Fused Runtime Agents | CMPSBL®</title>
        <meta name="description" content="5 fused Meta-Agents with sealed runtimes, DREAM synthesis, and persistent memory. Each is a fusion of multiple specialized AI runtimes. Own forever from free to $249." />
      </Helmet>

      <PublicNav />

      <div className="container mx-auto px-4 pt-20">
        <PublicBreadcrumb />
      </div>

      {purchaseSuccess && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-emerald-300">
              <strong>{purchaseSuccess}</strong> Meta-Agent activated successfully!
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
              5 FUSED META-AGENTS • DREAM SYNTHESIS • OWN FOREVER
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              <span className="block">Many minds.</span>
              <span className="block glow-text mt-1">One agent.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Each Meta-Agent is a <span className="text-foreground font-semibold">sealed fusion of multiple specialized runtimes</span> with 
              persistent memory, DREAM Synthesis, and always-on learning.
              Purchase once — own forever.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {[
                { icon: Shield, text: 'Source-blocked & tamper-proof' },
                { icon: Brain, text: 'DREAM learning in every agent' },
                { icon: Clock, text: 'Perpetual license' },
                { icon: Users, text: '5 fused meta-agents' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-primary/60" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {(['free', 'starter', 'professional', 'elite', 'apex'] as const).map(t => (
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
          <Alert variant="destructive"><AlertDescription>Checkout was canceled. Your agent is still available.</AlertDescription></Alert>
        </div>
      )}

      {/* ═══ ALL 5 AGENTS ═══ */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PUBLIC_CATALOG.map((item, i) => {
            const tierCfg = TIER_CONFIG[item.tier];
            const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Foundation'];
            return (
              <FlipCard
                key={item.sku}
                className="h-[320px]"
                index={i}
                frontTitle={item.displayName}
                frontSubtitle={item.tagline}
                frontIcon={
                  <img src={IMAGE_MAP[item.imagePath] || primitiveImg} alt={item.displayName} className="w-16 h-16 object-cover object-top rounded-xl" />
                }
                frontBadge={tierCfg.label}
                frontBadgeClass={cn(
                  item.tier === 'free' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                  item.tier === 'starter' && 'bg-sky-500/10 text-sky-400 border-sky-500/30',
                  item.tier === 'professional' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  item.tier === 'elite' && 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                  item.tier === 'apex' && 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
                )}
                frontAccentBar={TIER_ACCENT[item.tier]}
                frontStats={[
                  { label: 'fused', value: String(item.fusedFrom.length), icon: <Sparkles className="w-3 h-3 text-amber-500" /> },
                  { label: '', value: 'META', icon: <Brain className="w-3 h-3 text-primary" /> },
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

      {/* ═══ CROSS-SELL ═══ */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
          <Badge variant="outline" className="font-mono text-[11px] border-primary/30 text-primary mb-4">
            BUNDLE DEAL
          </Badge>
          <h2 className="text-2xl font-black mb-2">40% Off Every Meta-Agent When Bundled</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Combine any Meta-Agent with a CMPSBL Composable Engine for deeper orchestration, cross-agent memory, and priority routing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
              <a href="/engines">
                <Zap className="w-4 h-4" />
                Browse Engines
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
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
