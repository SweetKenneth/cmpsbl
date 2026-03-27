/**
 * Careers — Join the CMPSBL Team
 * Aligned with investor GTM hiring plan: technical co-lead, 3 engineers, head of sales
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import {
  ArrowRight, Heart, Sparkles, Globe, Brain, Hammer,
  Code, ShieldCheck, Megaphone, Terminal, Cpu, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

// ─── Values ──────────────────────────────────────────────────
const values = [
  {
    icon: Brain,
    title: "Think in Primitives",
    description:
      "We build cognitive architecture — 40 primitives across Organs, Layers, Engines, and Agents. Every contribution shapes the substrate.",
    gradient: "from-neon-purple to-neon-purple",
  },
  {
    icon: Heart,
    title: "Care About the Craft",
    description:
      "From the Evolution Engine's $0.06 bug fixes to SEBA's 7-gate governance — quality is structural, not aspirational.",
    gradient: "from-neon-magenta to-neon-magenta",
  },
  {
    icon: Sparkles,
    title: "Dream Boldly",
    description:
      "CMPSBL exists because someone believed machines could learn overnight, evolve under governance, and discover capabilities autonomously via the Memory Stream.",
    gradient: "from-neon-amber to-neon-amber",
  },
  {
    icon: Globe,
    title: "Work Anywhere",
    description:
      "Fully remote, async-first. We hire exceptional minds regardless of geography. Results matter, not hours logged.",
    gradient: "from-neon-cyan to-neon-blue",
  },
];

// ─── Open Roles (aligned with investor GTM hiring plan) ──────
interface OpenRole {
  title: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  location: string;
  summary: string;
  bullets: string[];
  priority: "critical" | "high" | "open";
}

const openRoles: OpenRole[] = [
  {
    title: "Technical Co-Lead",
    type: "Full-Time · Engineering",
    icon: Cpu,
    location: "Remote (US preferred)",
    priority: "critical",
    summary:
      "Partner with the founder to own the substrate's core runtime — 40 primitives, the INTENT mesh, NEXUS multi-provider routing, and the Evolution Engine.",
    bullets: [
      "Deep systems experience: runtimes, compilers, or distributed systems",
      "Strong TypeScript / Deno / PostgreSQL background",
      "Comfort owning architectural decisions across the full stack",
      "Interest in AI orchestration, governance, and self-improving systems",
    ],
  },
  {
    title: "Senior Systems Engineer",
    type: "Full-Time · Engineering",
    icon: Terminal,
    location: "Remote",
    priority: "high",
    summary:
      "Build and harden production infrastructure — DEFENSE threat scoring, Ironclad resilience, CLM training pipelines, and the 14-provider NEXUS routing layer.",
    bullets: [
      "Production infrastructure experience (observability, resilience, security)",
      "Familiarity with edge functions, PostgreSQL, and real-time systems",
      "Passion for building systems that self-heal and self-improve",
      "Bonus: experience with AI model routing or multi-provider orchestration",
    ],
  },
  {
    title: "Full-Stack Engineer",
    type: "Full-Time · Engineering",
    icon: Code,
    location: "Remote",
    priority: "high",
    summary:
      "Ship user-facing surfaces — the Substrate Dashboard, Memory Stream visualizations, Agent Marketplace, and Ascension export pipeline UI.",
    bullets: [
      "React + TypeScript proficiency with an eye for polished UI",
      "Experience building dashboards, real-time data views, or developer tools",
      "Comfort working across the stack (frontend → edge functions → database)",
      "Bonus: experience with npm package publishing or open-source maintenance",
    ],
  },
  {
    title: "Platform Engineer",
    type: "Full-Time · Engineering",
    icon: Layers,
    location: "Remote",
    priority: "open",
    summary:
      "Own the npm ecosystem (@cmpsbl), Ascension single-file export engine, and black-box IP protection pipeline across 25 target languages.",
    bullets: [
      "Strong Node.js / TypeScript and build-tooling experience",
      "Familiarity with code generation, AST transforms, or polyglot compilation",
      "Interest in IP protection, licensing, and artifact distribution",
      "Bonus: experience with HDL or embedded systems",
    ],
  },
  {
    title: "Head of Sales & GTM",
    type: "Full-Time · Revenue",
    icon: Megaphone,
    location: "Remote (US preferred)",
    priority: "critical",
    summary:
      "Lead go-to-market for a $35B+ TAM — developer adoption through the npm ecosystem, enterprise pilots, and the 5-tier subscription model (Builder → Governor).",
    bullets: [
      "Track record selling developer tools, infrastructure, or platform products",
      "Comfort with technical concepts — you'll demo the substrate to CTOs",
      "Experience building sales pipelines from scratch (seed-stage mindset)",
      "Bonus: network in AI/ML, DevOps, or enterprise software communities",
    ],
  },
  {
    title: "Security Researcher",
    type: "Full-Time · Security",
    icon: ShieldCheck,
    location: "Remote",
    priority: "open",
    summary:
      "Harden the DEFENSE Layer, IMMUNITY Sentinel, and SEBA governance pipeline. Build the security story that unlocks enterprise adoption.",
    bullets: [
      "Threat modeling, penetration testing, or behavioral analysis background",
      "Familiarity with zero-trust architectures and audit chain verification",
      "Interest in AI safety, governed mutation, and tamper-evident systems",
      "Bonus: experience with Merkle chain integrity or anomaly detection",
    ],
  },
];

const priorityBadge = (p: OpenRole["priority"]) => {
  switch (p) {
    case "critical":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] uppercase tracking-widest font-bold">
          Priority Hire
        </Badge>
      );
    case "high":
      return (
        <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-neon-amber/40 text-neon-amber font-bold">
          High Priority
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold">
          Open
        </Badge>
      );
  }
};

// ─── Page ────────────────────────────────────────────────────
export default function Careers() {
  return (
    <>
      <SEO
        title="Careers — Join CMPSBL"
        description="We're hiring our founding team: technical co-lead, engineers, head of sales, and security researchers. Build the cognitive infrastructure layer for AI. Remote-first."
        canonical="https://cmpsbl.com/careers"
        keywords={[
          "CMPSBL careers",
          "AI infrastructure jobs",
          "cognitive systems engineer",
          "remote AI startup",
          "founding team",
        ]}
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-40 left-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-2"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-40 right-1/4 w-[300px] h-[300px] rounded-full animate-hero-orb-3"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20 relative z-10">
          <motion.div {...fadeUp}>
            <Badge
              variant="outline"
              className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5"
            >
              <Hammer className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase">
                Founding Team
              </span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Build the <span className="text-primary">Substrate</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-3 leading-relaxed">
              CMPSBL is hiring its founding team — the engineers, leaders, and
              builders who will ship the cognitive infrastructure layer for
              production AI.
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-8">
              40 primitives. 14-provider routing. Self-evolving code. 25-language
              exports. The technology is built — now we need the team to take it
              to market.
            </p>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Link to="/contact">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Values */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              What Drives Us
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden card-lift shimmer-on-hover glass-edge"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${val.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                />
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${val.gradient} flex items-center justify-center mb-4 shadow-md`}
                >
                  <val.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{val.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open Roles */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Open Positions
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Seed-stage founding roles — equity, impact, and ownership from day one
            </p>
          </motion.div>

          <div className="space-y-4">
            {openRoles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group relative p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden glass-edge hover:border-primary/20 transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <role.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground text-lg">
                        {role.title}
                      </h3>
                      {priorityBadge(role.priority)}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{role.type}</span>
                      <span className="text-border">·</span>
                      <span>{role.location}</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {role.summary}
                </p>

                {/* Bullets */}
                <ul className="space-y-1.5 mb-5">
                  {role.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <Link to="/contact">
                    Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Perks */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Why Join Now
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "🌍", label: "Fully Remote" },
              { emoji: "📈", label: "Founding Equity" },
              { emoji: "🧠", label: "AI Stipend" },
              { emoji: "🏗️", label: "Build from Zero" },
              { emoji: "⏰", label: "Async-First" },
              { emoji: "💰", label: "Competitive Pay" },
              { emoji: "📚", label: "Learning Budget" },
              { emoji: "🚀", label: "Ship Daily" },
            ].map((perk, i) => (
              <motion.div
                key={perk.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm text-center hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 glass-edge"
              >
                <span className="text-2xl mb-2 block">{perk.emoji}</span>
                <span className="text-xs font-semibold text-foreground">
                  {perk.label}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-3xl px-4 mb-20 relative z-10">
          <motion.div
            {...fadeUp}
            className="relative p-8 rounded-2xl border border-border/40 bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm text-center overflow-hidden glass-edge"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-30" />
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 tracking-tight">
              Don't See Your Role?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-lg mx-auto">
              We're building something unprecedented. If you believe in
              self-evolving infrastructure and want to shape the founding team,
              reach out — we'd love to hear from you.
            </p>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Link to="/contact">
                Send Us Your Story <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
      <PageSEOBlock path="/careers" title="Careers" />
      <EnhancedFooter />
    </>
  );
}
