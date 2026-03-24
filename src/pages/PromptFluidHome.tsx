/**
 * PromptFluidHome — Business portfolio page shown when visitors enter via promptfluid.com
 * Showcases PromptFluid as the creator brand, Kenneth E Sweet Jr as founder, 
 * and CMPSBL as the flagship product.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Code2,
  Cpu,
  Globe,
  Layers,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Zap,
  Award,
  BookOpen,
  Building2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const milestones = [
  { year: "2009", title: "CMPSBL Founded", description: "Started as a vision for intelligent, composable software systems." },
  { year: "2023", title: "AI Infrastructure Pivot", description: "Shifted focus to cognitive architecture and persistent memory systems." },
  { year: "2024", title: "Cognitive Platform Launched", description: "Launched the composable AI platform — 40 primitives across 4 categories, powered by persistent memory." },
  { year: "2025", title: "200k+ Lines of Code", description: "Grew to a full cognitive runtime with multi-provider AI routing and composable infrastructure." },
  { year: "2026", title: "CONTACT Epoch Complete", description: "All 40 primitives upgraded to Ultimate architecture. Hot-swappable with circuit-breaker isolation and autonomous evolution." },
];

const capabilities = [
  { icon: Brain, title: "Persistent Memory", description: "AI systems that remember across sessions — vector recall, knowledge graphs, and four-tier memory architecture (hot/warm/cold/glacier)." },
  { icon: Cpu, title: "Multi-Provider Routing", description: "Health-weighted AI provider selection with a 12-step free-tier fallback chain via the NEXUS Organ. Never locked into a single vendor." },
  { icon: Layers, title: "40 Primitives", description: "12 Organs, 12 Layers, 8 Engines, and 8 Agents with circuit-breaker isolation — the canonical substrate matrix." },
  { icon: Shield, title: "Self-Evolving Platform", description: "The EVOLUTION Layer scans, proposes, and patches — the platform continuously improves itself under GOVERNANCE Layer oversight." },
  { icon: Zap, title: "Governed Runtime", description: "Every operation passes through governance checks. Budget, safety, and scope constraints enforced at the runtime level." },
  { icon: Globe, title: "Model Agnostic", description: "OpenAI, Anthropic, Google AI, and open-source models — automatically routes to the best provider for every task via NEXUS." },
];

const services = [
  { icon: Code2, title: "AI Infrastructure Consulting", description: "Architecture reviews, memory system design, and multi-provider routing strategies for enterprise AI deployments." },
  { icon: Building2, title: "Custom Runtime Agents", description: "Sealed runtime agents built to your specifications — persistent memory, local execution, MIT licensed." },
  { icon: Lightbulb, title: "Research & Development", description: "Peer-reviewed AI research published via Zenodo. Pushing the boundaries of cognitive infrastructure." },
  { icon: Users, title: "Enterprise Partnerships", description: "White-label substrate licensing, OEM integrations, and dedicated support for large-scale deployments." },
];

export default function PromptFluidHome() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="PromptFluid — AI Infrastructure & Cognitive Systems Studio"
        description="PromptFluid is the AI infrastructure studio behind CMPSBL®. Building persistent memory, self-learning AI, and cognitive operating systems."
        canonical="https://promptfluid.com"
        keywords={["PromptFluid", "AI infrastructure", "cognitive systems", "CMPSBL", "AI consulting", "persistent memory"]}
      />

      <PublicNav />

      {/* Ambient Background — CSS only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%)" }}
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-16 sm:pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary">
              <Rocket className="w-4 h-4" />
              AI Infrastructure Studio
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-foreground">Prompt</span>
            <span className="text-primary">Fluid</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed"
          >
            We build cognitive infrastructure that gives AI{" "}
            <span className="text-foreground font-semibold">persistent memory</span>,{" "}
            <span className="text-foreground font-semibold">self-learning</span>, and{" "}
            <span className="text-foreground font-semibold">multi-provider intelligence</span>.
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-muted-foreground/80 max-w-2xl mx-auto mb-10"
          >
            Engineering the future of AI operating systems since 2009.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="h-14 px-8 text-base font-bold gap-2">
              <Link to="/contact">
                <Building2 className="w-5 h-5" />
                Work With Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base font-semibold gap-2 border-primary/30 hover:bg-primary/5">
              <a href="https://cmpsbl.com" target="_blank" rel="noopener noreferrer">
                <Sparkles className="w-5 h-5" />
                Explore CMPSBL
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOUNDER SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-neon-purple/5 p-8 sm:p-12"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-neon-cyan flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black text-primary-foreground">PF</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">CMPSBL Studio</h2>
                  <p className="text-primary font-semibold">AI Infrastructure Lab — Dallas, TX</p>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                  CMPSBL® is a cognitive operating system with 40 matrix nodes across 4 categories spanning 200,000+ lines of production code. 
                  Our team focuses on persistent memory architectures, autonomous self-evolution, and model-agnostic AI routing. 
                  We serve as the canonical architects and technical experts for all substrate development.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["AI Architecture", "Persistent Memory", "Cognitive Systems", "Multi-Provider Routing", "Self-Evolving Code"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* WHAT WE BUILD — CAPABILITIES */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Cpu className="w-3 h-3" />
              What We Build
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Cognitive Infrastructure{" "}
              <span className="text-primary">at Scale</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The technology stack behind CMPSBL® — our flagship cognitive operating system.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 group shimmer-on-hover"
              >
                <cap.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* TIMELINE / MILESTONES */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="w-3 h-3" />
              Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Building the{" "}
              <span className="text-primary">Future</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent sm:-translate-x-px" />

            <div className="space-y-8 sm:space-y-12">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative flex items-start gap-6 sm:gap-0 ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background -translate-x-1.5 sm:-translate-x-1.5 mt-1.5 z-10" />

                  {/* Content */}
                  <div className={`ml-10 sm:ml-0 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                    <span className="text-primary font-mono font-bold text-sm">{milestone.year}</span>
                    <h3 className="text-lg font-bold text-foreground mt-1">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden sm:block sm:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SERVICES */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Lightbulb className="w-3 h-3" />
              Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              How We Can{" "}
              <span className="text-primary">Help</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From consulting to custom cognitive agents — we bring production-grade AI infrastructure to your organization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 shimmer-on-hover"
              >
                <svc.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{svc.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{svc.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CMPSBL CTA — Flagship Product */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-14 sm:py-24">
        <motion.div
          {...fadeUp}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-neon-purple" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            />
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-[80px]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative p-6 sm:p-14 md:p-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-8"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white/90">Our Flagship Project</span>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 leading-[1.1]">
                Meet{" "}
                 <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                   CMPSBL®
                 </span>
              </h2>
              <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
                The world's first public cognitive operating system — 40 primitives across 4 categories, 
                persistent memory, self-evolving architecture, and 200k+ lines of production code. 
                Free to start.
              </p>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
                {[
                  { value: "40", label: "Primitives" },
                  { value: "675+", label: "Capabilities" },
                  { value: "4", label: "Categories" },
                  { value: "Free", label: "To Start" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="px-8 h-14 text-base bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <a href="https://cmpsbl.com" target="_blank" rel="noopener noreferrer">
                    <Terminal className="w-5 h-5 mr-2" />
                    Explore CMPSBL
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-8 h-14 text-base border-white/30 text-white hover:bg-white/10 font-semibold backdrop-blur-sm"
                >
                  <Link to="/blog">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read Our Research
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* PUBLICATIONS / CREDIBILITY */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <FileText className="w-3 h-3" />
              Publications & Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Research-Backed{" "}
              <span className="text-primary">Innovation</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Zenodo Publication", description: "Peer-reviewed research documentation on cognitive substrate architecture.", link: "/publication", icon: FileText },
              { title: "Open Standards", description: "Published namespace, foundations, and llms.txt for transparent AI infrastructure.", link: "/namespace", icon: Globe },
              { title: "48+ Articles", description: "Technical blog covering AI infrastructure, persistent memory, and self-evolving systems.", link: "/blog", icon: BookOpen },
            ].map((pub, i) => (
              <motion.div
                key={pub.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={pub.link}
                  className="block rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full shimmer-on-hover"
                >
                  <pub.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground">{pub.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CONTACT CTA */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-20 px-4">
        <motion.div
          {...fadeUp}
          className="max-w-3xl mx-auto text-center space-y-6 p-8 sm:p-12 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">Ready to Build Something Cognitive?</h2>
          <p className="text-muted-foreground text-lg">
            Whether you're looking for AI consulting, custom cognitive agents, or enterprise partnerships — let's talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-6 font-bold gap-2">
              <Link to="/contact">
                Get In Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 font-semibold gap-2 border-primary/30">
              <Link to="/investors">
                Investor Information
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground/60">
            <a href="tel:+17603584324" className="text-primary hover:underline">(760) FLUID-AI</a>
            {" · "}
            <a href="mailto:help@cmpsbl.com" className="text-primary hover:underline">help@CMPSBL.com</a>
          </p>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
