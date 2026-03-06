/**
 * About — First-class page, mobile-first design
 * Balanced: Substrate (build, dream, adapt, evolve) + Memory Stream
 */

import { Link } from "react-router-dom";
import { useMetric } from "@/stores/publicMetricsStore";
import { PageTransition } from "@/components/PageTransition";
import {
  Shield, Brain, Zap, ArrowRight, Mail, Phone,
  Sparkles, Moon, Layers, Activity, Wrench, Eye,
  Accessibility, GitBranch, RefreshCw, TrendingUp, Hammer,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import founderPhoto from "@/assets/founder-kenneth-sweet.png";
import { COMPANY_PHONE, COMPANY_PHONE_TEL } from "@/data/team";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const PILLARS = [
  {
    icon: Moon,
    name: "DREAM",
    verb: "Synthesize while idle",
    description: "Nocturnal cycles consolidate memory, fuse cross-domain patterns, and generate novel insights — all without active compute.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: RefreshCw,
    name: "ADAPT",
    verb: "Governed self-modification",
    description: "Routing, cost allocation, and operational parameters adjust automatically — within strict governance boundaries.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    name: "EVOLVE",
    verb: "Compound over time",
    description: "Every interaction feeds back. Heuristics mutate and improve. Your infrastructure gets smarter the more it runs.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Brain,
    name: "REMEMBER",
    verb: "Memory that survives restarts",
    description: "Three-tier persistent memory (hot, warm, cold) gives every agent permanent recall across sessions and deployments.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500 to-blue-600",
  },
];

const SYSTEMS = [
  { icon: Brain, name: "MEMORY", desc: "Multi-tier persistent recall" },
  { icon: Moon, name: "DREAM", desc: "Offline synthesis cycles" },
  { icon: Zap, name: "NEXUS", desc: "Intelligent multi-model router" },
  { icon: Shield, name: "DEFENSE", desc: "Adaptive threat detection" },
  { icon: Eye, name: "VISION", desc: "Real-time observability" },
  { icon: GitBranch, name: "EVOLUTION", desc: "Governed self-improvement" },
  { icon: Accessibility, name: "INCLUSIVE", desc: "WCAG 2.2 compliance" },
  { icon: Sparkles, name: "STREAM", desc: "Crystallized software output" },
];

const DEPARTMENTS = [
  { name: "General Inquiries", email: "hello@CMPSBL.com", description: "Partnerships, questions, getting started" },
  { name: "Sales & Enterprise", email: "sales@CMPSBL.com", description: "Custom deployments, licensing, volume pricing" },
  { name: "Engineering", email: "engineering@CMPSBL.com", description: "Technical support, API access, integrations" },
  { name: "AI Research", email: "research@CMPSBL.com", description: "Research partnerships, academic collaborations" },
  { name: "Security", email: "security@CMPSBL.com", description: "Vulnerability reports, compliance, audits" },
  { name: "Press", email: "press@CMPSBL.com", description: "Media inquiries, press kits, speaking" },
  { name: "Careers", email: "hr@CMPSBL.com", description: "Open positions, internships, culture" },
];

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

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function About() {
  const codename = useMetric('codename');
  const linesOfCodeDisplay = useMetric('linesOfCodeDisplay');

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About CMPSBL — Cognitive Infrastructure for AI"
        description="Build on the substrate. CMPSBL is composable cognitive infrastructure with persistent memory, DREAM cycles, governed evolution, and the Memory Stream."
        canonical="https://cmpsbl.com/about"
        image="https://cmpsbl.com/og/about.jpg"
        keywords={['about CMPSBL', 'cognitive infrastructure', 'AI substrate', 'dream cycles', 'governed evolution']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'About', url: 'https://cmpsbl.com/about' },
        ]}
        faq={[
          { question: 'What is the CMPSBL substrate?', answer: 'A composable cognitive operating system with persistent memory, dream cycles, intelligent routing, and governed orchestration.' },
          { question: 'What are DREAM cycles?', answer: 'Offline synthesis periods where the substrate consolidates memory, extracts patterns, and generates novel insights without active compute.' },
          { question: 'Can I build on the substrate?', answer: 'Yes. Activate pipeline packs, enable DREAM cycles, and let your systems adapt and evolve. Start free with 3 pipeline slots.' },
        ]}
      />

      <PublicNav />

      {/* Ambient glow — CSS only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-20 left-1/4 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-40 right-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%)" }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
         HERO — Mobile-first, full-bleed gradient
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden">
        <PageTransition>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />

        <div className="relative px-5 pt-24 pb-14 sm:pt-32 sm:pb-20 max-w-4xl mx-auto">
          {/* Back link */}
          <motion.div {...fadeUp}>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mb-8 sm:mb-12"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div {...stagger(0.05)}>
            <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary gap-1.5 px-3 py-1">
              <Hammer className="w-3 h-3" />
              <span className="text-[10px] sm:text-xs font-semibold">Build on the Substrate</span>
            </Badge>
          </motion.div>

          <motion.h1
            {...stagger(0.1)}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-5"
          >
            Cognitive{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Infrastructure
            </span>
            <br className="hidden sm:block" />
            {" "}for AI
          </motion.h1>

          <motion.p
            {...stagger(0.15)}
            className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8"
          >
            CMPSBL is the substrate — composable cognitive infrastructure where your systems
            dream, adapt, evolve, and remember. The Memory Stream captures what they learn.
          </motion.p>

          {/* Stat chips — mobile-friendly horizontal scroll */}
          <motion.div
            {...stagger(0.2)}
            className="flex flex-wrap gap-2 sm:gap-3"
          >
            {[
              { label: codename || "—", sub: "Epoch" },
              { label: linesOfCodeDisplay || "—", sub: "Lines" },
              { label: "8", sub: "Systems" },
              { label: "Free", sub: "To Start" },
            ].map((s) => (
              <div
                key={s.sub}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm"
              >
                <span className="text-sm sm:text-base font-black text-foreground">{s.label}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </PageTransition>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOUR PILLARS — Dream · Adapt · Evolve · Remember
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3">
              Systems That{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Dream · Adapt · Evolve
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Most AI platforms process and forget. When you build on the substrate, your systems
              learn during downtime, self-modify under governance, and compound intelligence with every interaction.
            </p>
          </motion.div>

          {/* Cards — stacks on mobile, 2-col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {PILLARS.map((pillar, idx) => (
              <motion.div
                key={pillar.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className={cn(
                  "relative rounded-2xl border bg-card/50 backdrop-blur-sm p-5 sm:p-7",
                  "transition-all duration-300 card-lift gradient-border-reveal",
                  pillar.border,
                  "hover:border-opacity-60"
                )}
              >
                {/* Top accent */}
                <div className={cn("absolute top-0 left-5 right-5 h-px bg-gradient-to-r opacity-40", pillar.gradient)} />

                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", pillar.bg)}>
                    <pillar.icon className={cn("w-5 h-5", pillar.color)} />
                  </div>
                  <div>
                    <span className={cn("text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase", pillar.color)}>{pillar.name}</span>
                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">{pillar.verb}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         THE TWO SIDES — Substrate + Memory Stream
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3">
              Two Sides. One System.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The substrate is the engine — it dreams, adapts, and evolves.
              The Memory Stream is the output — crystallized, scored, production-ready software.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* The Substrate */}
            <motion.div
              {...stagger(0.1)}
              className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden card-lift gradient-border-reveal"
            >
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-emerald-500 to-amber-500" />
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hammer className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">The Substrate</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A cognitive operating system organized across 12 sectors. MEMORY persists context. DREAM consolidates knowledge. DEFENSE adapts to threats. NEXUS routes every call to the optimal provider.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The substrate doesn't just run — it <span className="text-foreground font-medium">evolves</span>. Pattern mutation, heuristic tuning, and self-upgrade pipelines mean every cycle makes the system smarter. Governed, auditable, autonomous.
                </p>
                <div className="flex items-center gap-2 text-xs text-primary mt-5 pt-4 border-t border-border/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-medium">{codename} Epoch · {linesOfCodeDisplay} lines</span>
                </div>
              </div>
            </motion.div>

            {/* The Memory Stream */}
            <motion.div
              {...stagger(0.15)}
              className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary via-cyan-500 to-primary" />
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">The Memory Stream</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A continuous river of evolving software. The Memory Stream isn't a marketplace — it's the living output of the substrate's own dream and evolution cycles.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every pipeline has a quality floor of 68+. Every pull is real software with provenance. Materialize pipelines, export them, build on top — or let the stream feed back into your substrate's memory.
                </p>
                <div className="flex items-center gap-2 text-xs text-primary mt-5 pt-4 border-t border-border/30">
                  <Moon className="w-3.5 h-3.5" />
                  <span className="font-medium">Quality floor: 68+ · Every pull is real software</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         SYSTEMS INSIDE — Compact grid, mobile-optimized
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">The Systems Inside</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Every capability is independently deployable, governed, and evolving.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {SYSTEMS.map((sys, idx) => (
              <motion.div
                key={sys.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                className="rounded-xl border border-border/50 bg-card/50 p-4 sm:p-5 hover:border-primary/25 transition-all duration-300 shimmer-on-hover card-lift gradient-border-reveal"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <sys.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-0.5">{sys.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">{sys.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         BLOCKQUOTE — Full-width cinematic
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-14 sm:py-20 px-5">
          <motion.blockquote
            {...fadeUp}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-tight tracking-tight">
              "Infrastructure that{" "}
              <span className="text-primary">dreams</span>,{" "}
              <span className="text-primary">evolves</span>, and{" "}
              <span className="text-primary">compounds</span> — every day it runs, it gets better."
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOUNDER
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 sm:p-8 md:p-10"
          >
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start">
              <img
                src={founderPhoto}
                alt="Kenneth E Sweet Jr — Founder of CMPSBL"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-2 ring-primary/20 shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 text-foreground">About the Founder</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                  I've been shipping software since 2009. CMPSBL is the answer to a question I kept running into: why does every AI team rebuild the same infrastructure from scratch?
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                  So I built the layer that should already exist — persistent memory, intelligent routing, adaptive security, DREAM cycles, and governed orchestration. One substrate. Every AI application.
                </p>
                <blockquote className="border-l-2 border-primary/40 pl-4 my-4 italic text-sm sm:text-base text-foreground/80">
                  "AI should amplify human capability, not replace human judgment."
                </blockquote>
                <div className="pt-3 border-t border-border/30">
                  <p className="text-sm sm:text-base text-foreground font-bold">Kenneth E Sweet Jr</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Founder & Chief Architect</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         DEPARTMENTS — Clean, touch-friendly
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Get in Touch</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Reach the right department directly. Every team is available by email and phone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {DEPARTMENTS.map((dept, i) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="rounded-xl border border-border/50 bg-card/60 p-4 sm:p-5 hover:border-primary/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{dept.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 leading-relaxed">{dept.description}</p>
                <div className="space-y-1.5 pt-3 border-t border-border/30">
                  <a
                    href={`mailto:${dept.email}`}
                    className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:underline min-h-[36px] sm:min-h-0"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {dept.email}
                  </a>
                  <a
                    href={COMPANY_PHONE_TEL}
                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[36px] sm:min-h-0"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {COMPANY_PHONE}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FINAL CTA
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            className="rounded-2xl overflow-hidden"
          >
            <div className="relative bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 sm:p-10 md:p-14 text-center">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />

              <div className="relative">
                <Badge className="mb-5 px-3 py-1 text-[10px] sm:text-xs bg-white/15 text-white border-white/20 font-semibold">
                  Signal → Silicon
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                  Ready to Build?
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
                  Start free with 3 pipeline slots. Activate packs, trigger DREAM cycles, and let the substrate evolve.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/20 hover:scale-[1.02] transition-all"
                  >
                    <Link to="/start-here">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Here
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base border-white/30 text-white hover:bg-white/10 font-semibold"
                  >
                    <Link to="/upgrade">
                      View Plans
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
