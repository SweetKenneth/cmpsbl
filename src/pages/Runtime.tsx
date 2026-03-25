/**
 * /runtime — Baseline Runtime Overview
 * Horizontal-scroll category layout matching /upgrade pattern.
 */
import { useRef, useState } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BASELINE_PILLARS, type BaselinePillar } from '@/lib/substrate/baseline-pillars';
import {
  Brain, Route, ShieldCheck, Workflow, Activity, Scale,
  Dna, Fingerprint, Radio, Lightbulb, ArrowRight, Layers,
  Package, Zap, Lock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Route, ShieldCheck, Workflow, Activity, Scale,
  Dna, Fingerprint, Radio, Lightbulb,
};

/* ─── Category rows that group pillars ─── */
interface PillarCategory {
  id: string;
  title: string;
  description: string;
  pillarIds: string[];
  accent: string;
}

const PILLAR_CATEGORIES: PillarCategory[] = [
  {
    id: 'foundation',
    title: 'Foundation Layer',
    description: 'Memory, identity, and governance — the bedrock every capability builds on.',
    pillarIds: ['memory', 'identity', 'governance'],
    accent: 'from-neon-blue/20 to-neon-cyan/20',
  },
  {
    id: 'intelligence',
    title: 'Intelligence Layer',
    description: 'Routing, cognition, and orchestration — the thinking and coordination core.',
    pillarIds: ['routing', 'cognition', 'orchestration'],
    accent: 'from-neon-purple/20 to-neon-magenta/20',
  },
  {
    id: 'resilience',
    title: 'Resilience Layer',
    description: 'Defense, observability, events, and autonomous evolution — the self-healing surface.',
    pillarIds: ['defense', 'observability', 'communication', 'evolution'],
    accent: 'from-neon-green/20 to-neon-cyan/20',
  },
];

/* ─── Horizontal scroll row component ─── */
function PillarRow({ category, pillars }: { category: PillarCategory; pillars: BaselinePillar[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section className="mb-16 last:mb-0">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{category.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">{category.description}</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="h-8 w-8 rounded-full border-border/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="h-8 w-8 rounded-full border-border/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] pb-4 no-scrollbar"
      >
        {pillars.map((pillar, i) => {
          const PIcon = ICON_MAP[pillar.icon] || Brain;
          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="snap-start shrink-0 w-[300px] sm:w-[340px]"
            >
              <Card className={cn(
                "h-full border-border/50 hover:border-primary/30 transition-all group",
                "bg-gradient-to-br", category.accent, "backdrop-blur-sm"
              )}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <PIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{pillar.name}</h3>
                      <Badge variant="outline" className="text-[10px] mt-0.5 border-primary/20 text-muted-foreground">
                        Always Active
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.summary}</p>
                  <ul className="space-y-2">
                    {pillar.highlights.map(h => (
                      <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Architecture cards (horizontal scroll too) ─── */
const ARCH_CARDS = [
  {
    icon: Layers,
    title: 'One Runtime for All',
    description: 'Every plan runs the same full substrate — all 40 primitives active. No stripped-down versions, no feature fragmentation.',
  },
  {
    icon: Package,
    title: 'Memory Packs Add Power',
    description: 'Packs bundle related capabilities into purpose-built memory chains. Each pack uses 1 memory slot.',
  },
  {
    icon: Zap,
    title: 'Plans Scale Capacity',
    description: 'Higher plans let you activate more packs simultaneously — the substrate itself never changes.',
  },
];

export default function Runtime() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Baseline Runtime — What Every Plan Includes | CMPSBL"
        description="Every CMPSBL plan includes the full platform runtime: persistent memory, smart AI routing, self-improvement cycles, security monitoring, evolution engine, and governed orchestration. No features gated."
      />
      <PublicNav />

      <main className="pt-24 md:pt-28 pb-16 md:pb-20">
        {/* ═══ HERO ═══ */}
        <section className="container mx-auto px-4 text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
              <Layers className="w-3 h-3 mr-1.5 inline" />
              12 Organs · 12 Layers · 8 Engines · 8 Agents
            </Badge>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              What You Get. <span className="text-primary">Always.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Every user gets the full substrate — all 40 primitives, all capabilities. No features are locked behind paywalls.
              Plans include memory packs, priority routing, and expanded capacity.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button asChild>
                <Link to="/store?tab=plans">See Plans <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/docs/runtime">Developer Reference</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ═══ ARCHITECTURE — horizontal scroll row ═══ */}
        <section className="mb-12 md:mb-20">
          <div className="container mx-auto px-4 mb-6">
         <h2 className="text-2xl md:text-3xl font-bold">Unified Substrate</h2>
            <p className="text-sm text-muted-foreground mt-1">
              One substrate. Every tier. No stripped-down versions.
            </p>
          </div>
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] pb-4 no-scrollbar">
            {ARCH_CARDS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-start shrink-0 w-[300px] sm:w-[340px]"
              >
                <Card className="h-full border-border/50 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6 space-y-3">
                    <item.icon className="w-8 h-8 text-primary" />
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ CAPABILITY PILLARS — grouped horizontal rows ═══ */}
        <div className="mb-12 md:mb-20">
          <div className="container mx-auto px-4 text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
              <Lock className="w-3 h-3 mr-1.5 inline" />
              Always Active
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Always-On Primitives</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              These capabilities run across all 40 primitives for every user on every plan — no exceptions. Scroll each layer to explore.
            </p>
          </div>

          {PILLAR_CATEGORIES.map((cat) => {
            const pillars = cat.pillarIds
              .map(id => BASELINE_PILLARS.find(p => p.id === id))
              .filter(Boolean) as BaselinePillar[];
            return <PillarRow key={cat.id} category={cat} pillars={pillars} />;
          })}
        </div>

        {/* ═══ CAPABILITY PACKS CTA ═══ */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="max-w-3xl mx-auto text-center p-6 md:p-10 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-background">
            <Package className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold">How Memory Packs Extend the Substrate</h3>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Memory packs bundle multiple baseline primitives into ready-to-use memory chains.
              They don't replace the substrate — they build on top of it.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button asChild>
                <Link to="/store?tab=plans">Browse Packs <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/packs">Manage Active Packs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <RelatedCapabilities />
      <AuthorityLinkBlock currentPath="/runtime" />
      <EnhancedFooter />
    </div>
  );
}
