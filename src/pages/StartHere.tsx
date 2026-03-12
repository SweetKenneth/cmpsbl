/**
 * Start Here — Onboarding Landing Page
 * Balanced: Build on the Substrate + Explore the Memory Stream
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageTransition } from "@/components/PageTransition";
import {
  ArrowRight, Sparkles, Brain, Code, Zap, BookOpen, CheckCircle2,
  Moon, RefreshCw, TrendingUp, Shield, Layers, Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay },
});

const buildCapabilities = [
  {
    icon: Moon,
    title: "DREAM",
    description: "Your systems synthesize patterns and consolidate memory while idle — learning without active compute.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: RefreshCw,
    title: "ADAPT",
    description: "Governed self-modification adjusts routing, cost allocation, and operational parameters based on real performance.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: TrendingUp,
    title: "EVOLVE",
    description: "Every interaction feeds back. Memories crystallize into reusable intelligence. Your infrastructure gets smarter over time.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Brain,
    title: "REMEMBER",
    description: "Three-tier persistent memory (hot, warm, cold) gives every agent permanent recall across sessions and deployments.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const quickStarts = [
  { icon: Brain, text: "Add persistent memory to any AI agent", link: "/persistent-memory" },
  { icon: Moon, text: "Enable DREAM cycles for offline synthesis", link: "/documentation" },
  { icon: Zap, text: "Download a Mind — a production AI agent you own", link: "/composable-cognitives" },
  { icon: Code, text: "Activate memory packs for advanced capabilities", link: "/foundry" },
  { icon: Shield, text: "Deploy with governed evolution and rollback", link: "/evolution" },
  { icon: BookOpen, text: "Explore the full technical documentation", link: "/documentation" },
];

export default function StartHere() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Start Here — CMPSBL"
        description="New to CMPSBL? Build on the substrate. Add persistent memory, DREAM cycles, governed evolution, and intelligent routing to any AI application — free."
        canonical="https://cmpsbl.com/start-here"
        keywords={['CMPSBL getting started', 'build on substrate', 'DREAM cycles', 'AI evolution', 'persistent memory', 'governed adaptation']}
      />
      <PublicNav />

      {/* Ambient background — CSS only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%)" }}
        />
      </div>

      <main className="flex-1 relative z-10">
        <PageTransition>
        <div className="container mx-auto px-4 py-20 sm:py-28 max-w-5xl">
          {/* Badge */}
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary gap-1.5 px-4 py-1.5">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-semibold">New to CMPSBL?</span>
            </Badge>
          </motion.div>

          {/* H1 */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1]"
            {...stagger(0.1)}
          >
            Build on the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Substrate
            </span>
          </motion.h1>

          {/* Intro — balanced narrative */}
          <motion.p {...stagger(0.15)} className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-3">
            CMPSBL is composable cognitive infrastructure. You build on the substrate — adding persistent memory, DREAM cycles, governed evolution, and intelligent routing to any AI application.
          </motion.p>
          <motion.p {...stagger(0.2)} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-12">
            The Memory Stream captures and crystallizes what your systems learn. But the real power is what you build with it — systems that dream, adapt, and improve themselves over time. Everything below is free.
          </motion.p>

          {/* ═══ TWO SIDES — Build + Stream ═══ */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* LEFT — Build on the Substrate */}
            <motion.div
              {...stagger(0.25)}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-500 shimmer-on-hover card-lift gradient-border-reveal"
            >
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-emerald-500 to-amber-500" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Hammer className="w-5 h-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Build on the Substrate</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  The substrate is the living engine underneath. Your systems don't just run — they dream, adapt, and evolve within governed boundaries.
                </p>
                <div className="space-y-4">
                  {buildCapabilities.map((cap, idx) => (
                    <motion.div
                      key={cap.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.06 }}
                      className="flex items-start gap-3"
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cap.bg)}>
                        <cap.icon className={cn("w-4 h-4", cap.color)} />
                      </div>
                      <div>
                        <span className={cn("text-xs font-mono font-bold tracking-wider", cap.color)}>{cap.title}</span>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{cap.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT — The Memory Stream */}
            <motion.div
              {...stagger(0.3)}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-500 shimmer-on-hover card-lift gradient-border-reveal"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary via-cyan-500 to-primary" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">The Memory Stream</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  The Memory Stream is the continuous output of the substrate — a river of crystallized software, scored pipelines, and compounding intelligence.
                </p>
                <div className="space-y-3">
                  {quickStarts.map((item, idx) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                    >
                      <Link
                        to={item.link}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm sm:text-base text-foreground/80 font-medium group-hover:text-foreground transition-colors">
                          {item.text}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 ml-auto mt-1 shrink-0 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Free-tier callout */}
          <motion.div {...stagger(0.4)} className="callout-accent rounded-xl p-5 mb-8">
            <p className="text-foreground font-semibold text-base sm:text-lg flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              Free users are first-class builders here. 3 memory slots. Full runtime. No credit card.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div {...stagger(0.45)} className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="rounded-xl font-bold gap-2 px-6 sm:px-8 h-12 sm:h-13 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link to="/persistent-memory">
                <Brain className="w-4 h-4" />
                Try Persistent Memory
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
             <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold gap-2 px-6 sm:px-8 h-12 sm:h-13">
              <Link to="/evolution">
                <RefreshCw className="w-4 h-4" />
                Explore EVOLUTION
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold gap-2 px-6 sm:px-8 h-12 sm:h-13">
              <Link to="/composable-cognitives">
                <Zap className="w-4 h-4" />
                Browse Minds
              </Link>
            </Button>
          </motion.div>

          {/* Section divider */}
          <div className="section-divider w-full mt-16 mb-8" />

          {/* Footer Note */}
          <motion.div
            {...stagger(0.55)}
          >
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              The substrate compounds because of the architecture — DREAM cycles synthesize, ADAPT governs, EVOLUTION improves, and the Memory Stream captures it all. Start with one build. See for yourself.
            </p>
          </motion.div>
        </div>
        </PageTransition>
      </main>
      <EnhancedFooter />
    </div>
  );
}
