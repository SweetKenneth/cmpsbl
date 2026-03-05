import { Link } from "react-router-dom";
import { useMetric } from "@/stores/publicMetricsStore";
import {
  Shield, Brain, Zap, ArrowRight, Mail, Phone,
  Sparkles, Moon, Layers, Activity, Wrench, Eye,
  Users, Server, Accessibility, GitBranch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/hero/neon-data-center.jpg";
import earthWindowImage from "@/assets/hero/neon-dream-cosmos.jpg";
import founderPhoto from "@/assets/founder-kenneth-sweet.png";
import { COMPANY_PHONE, COMPANY_PHONE_TEL } from "@/data/team";

const DEPARTMENTS = [
  {
    name: "General Inquiries",
    email: "hello@CMPSBL.com",
    description: "Partnership opportunities, general questions, and getting started.",
  },
  {
    name: "Sales & Enterprise",
    email: "sales@CMPSBL.com",
    description: "Custom deployments, enterprise licensing, and volume pricing.",
  },
  {
    name: "Engineering & Support",
    email: "engineering@CMPSBL.com",
    description: "Technical support, API access, integration guidance, and developer relations.",
  },
  {
    name: "AI Research",
    email: "research@CMPSBL.com",
    description: "Research collaborations, academic partnerships, and publication inquiries.",
  },
  {
    name: "Security",
    email: "security@CMPSBL.com",
    description: "Vulnerability reports, security audits, and compliance certifications.",
  },
  {
    name: "Press & Communications",
    email: "press@CMPSBL.com",
    description: "Media inquiries, press kits, speaking engagements, and interview requests.",
  },
  {
    name: "Careers",
    email: "hr@CMPSBL.com",
    description: "Open positions, internships, and workplace culture inquiries.",
  },
];

const SUBSTRATE_CAPABILITIES = [
  {
    icon: Brain,
    name: "MEMORY",
    description: "Multi-tier persistent memory that survives sessions. Your AI never forgets a user, a preference, or a pattern — context compounds over time.",
  },
  {
    icon: Moon,
    name: "DREAM",
    description: "Nocturnal processing cycles that consolidate knowledge, fuse cross-domain patterns, and synthesize new insights while the system rests.",
  },
  {
    icon: GitBranch,
    name: "Evolution & Mutation",
    description: "Patterns don't stay static. The substrate mutates, tests, and evolves its own heuristics — producing better strategies with every cycle.",
  },
  {
    icon: Sparkles,
    name: "Memory Stream",
    description: "A continuous substrate of evolving software systems. Crystallize scored pipelines from the stream — real, production-ready software you can export and use.",
  },
  {
    icon: Server,
    name: "NEXUS Router",
    description: "Intelligent multi-provider routing that picks the optimal AI model for every request. Cost, latency, and capability — balanced automatically.",
  },
  {
    icon: Shield,
    name: "DEFENSE",
    description: "Adaptive threat detection, behavioral fingerprinting, and governance rules baked into every layer. Security that learns and responds.",
  },
  {
    icon: Eye,
    name: "VISION",
    description: "Full observability across every system — latency, cost, throughput, health dashboards, and real-time telemetry.",
  },
  {
    icon: Accessibility,
    name: "INCLUSIVE",
    description: "WCAG 2.2 scanning, AI-powered remediation, and accessibility compliance — built in, not bolted on.",
  },
];

const BUILD_ON_SUBSTRATE = [
  {
    icon: Layers,
    title: "Activate Pipeline Packs",
    description: "24 pipeline packs across 6 strategic domains. Each pack unlocks a specific set of capabilities — governed by slots, swappable anytime.",
  },
  {
    icon: Activity,
    title: "Let It Dream",
    description: "DREAM cycles consolidate your system's memory, detect cross-pattern insights, and mutate strategies autonomously. The longer it runs, the smarter it gets.",
  },
  {
    icon: Sparkles,
    title: "Crystallize from the Stream",
    description: "The Memory Stream is a living substrate of scored software. Pull crystallized pipelines — real code with provenance, quality floors, and production readiness.",
  },
  {
    icon: Wrench,
    title: "Self-Evolving Infrastructure",
    description: "The MODERNIZER module applies self-upgrade pipelines. Your substrate doesn't just run — it improves itself, governed and auditable.",
  },
];

export default function About() {
  const codename = useMetric('codename');
  const linesOfCodeDisplay = useMetric('linesOfCodeDisplay');

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About CMPSBL — Cognitive Infrastructure for AI"
        description="CMPSBL builds composable cognitive infrastructure: persistent memory, dream cycles, evolution, and the Memory Stream. Build on the substrate — ship AI that compounds."
        canonical="https://cmpsbl.com/about"
        image="https://cmpsbl.com/og/about.jpg"
        keywords={['about CMPSBL', 'cognitive infrastructure', 'AI substrate', 'memory stream', 'dream cycles', 'Dallas AI company']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'About', url: 'https://cmpsbl.com/about' },
        ]}
        faq={[
          { question: 'What is the CMPSBL substrate?', answer: 'A composable cognitive operating system with persistent memory, dream cycles, intelligent routing, and governed orchestration — the infrastructure layer for AI applications.' },
          { question: 'What is the Memory Stream?', answer: 'A continuous substrate of evolving software systems. Developers crystallize scored, production-ready pipelines from the stream and export them for use.' },
          { question: 'Can I build on the substrate?', answer: 'Yes. Activate pipeline packs, let the system dream and evolve, and crystallize real software from the Memory Stream. Start free with 3 pipeline slots.' },
        ]}
      />

      <PublicNav />

      {/* Ambient glow — CSS only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
        />
      </div>

      {/* ── Hero ── */}
      <section className="relative w-full">
        <img
          src={heroImage}
          alt="CMPSBL cognitive infrastructure — composable AI substrate"
          className="absolute inset-0 w-full h-[60vh] object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />

        <div className="relative container mx-auto px-4 pt-32 pb-20 max-w-4xl">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground [text-shadow:_0_2px_20px_hsl(var(--background))]">
            CMPSBL<sup className="text-lg">®</sup>
          </h1>
          <p className="text-xl text-foreground/90 max-w-3xl leading-relaxed [text-shadow:_0_2px_10px_hsl(var(--background))]">
            Cognitive infrastructure for AI. Persistent memory, dream cycles, governed evolution, and the Memory Stream — a composable substrate where software learns, adapts, and compounds.
          </p>
        </div>
      </section>

      {/* ── Two Sides: Substrate + Memory Stream ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Two Sides of the Same System</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The substrate is the engine. The Memory Stream is the output. Together they form a continuous loop — your AI remembers, dreams, evolves, and crystallizes real software.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: The Substrate */}
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">The Substrate</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A 38-node cognitive operating system organized across 12 sectors. MEMORY persists context across sessions. DREAM consolidates knowledge during low-activity periods. DEFENSE adapts to threats in real time. NEXUS routes every AI call to the optimal provider.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The substrate doesn't just run — it <span className="text-foreground font-medium">evolves</span>. Pattern mutation, heuristic tuning, and self-upgrade pipelines mean every cycle makes the system smarter. Governed, auditable, and autonomous.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">{codename} Epoch · {linesOfCodeDisplay} lines of production code</span>
              </div>
            </div>

            {/* Right: The Memory Stream */}
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">The Memory Stream</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A continuous substrate of evolving software systems. The Memory Stream isn't a marketplace or a library — it's a living river of scored, crystallized pipelines produced by the substrate's own dream and evolution cycles.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every pipeline has a quality floor of 68+. Every pull is real software with provenance. You can materialize pipelines, export them, and build on top of them — or let the stream feed back into your own substrate's memory.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Moon className="w-4 h-4" />
                <span className="font-medium">Quality floor: 68+ · Every pull is real software</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Earth Window Quote ── */}
      <section className="relative w-full h-[45vh] overflow-hidden">
        <img
          src={earthWindowImage}
          alt="Cosmos representing the dream cycle — autonomous learning synthesis"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-5xl font-bold text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.8)]">
              "Infrastructure that dreams, evolves, and compounds — every day it runs, it gets better."
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── What You Can Build ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Build on the Substrate</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The substrate isn't a black box — it's a platform. Activate packs, trigger dream cycles, crystallize pipelines, and let your AI evolve on its own.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {BUILD_ON_SUBSTRATE.map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Substrate Capabilities Grid ── */}
      <section className="py-20 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">The Systems Inside</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every capability is independently deployable, governed, and evolving.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUBSTRATE_CAPABILITIES.map((cap, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{cap.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img
                src={founderPhoto}
                alt="Kenneth E Sweet Jr — Founder of CMPSBL"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-primary/20 flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4 text-foreground">About the Founder</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  I've been shipping software since 2009. CMPSBL is the answer to a question I kept running into: why does every AI team rebuild the same infrastructure from scratch?
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  So I built the layer that should already exist — persistent memory, intelligent routing, adaptive security, dream cycles, and governed orchestration. One substrate. Every AI application. Infrastructure that compounds.
                </p>
                <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-foreground/90">
                  "AI should amplify human capability, not replace human judgment. We build systems that think alongside you, not instead of you."
                </blockquote>
                <div className="pt-4 border-t border-border">
                  <p className="text-foreground font-semibold">Kenneth E Sweet Jr</p>
                  <p className="text-sm text-muted-foreground">Founder & Chief Architect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Departments ── */}
      <section className="py-20 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reach the right department directly. Every team is available by email and phone.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEPARTMENTS.map((dept, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
              >
                <h3 className="font-semibold text-foreground mb-2">{dept.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{dept.description}</p>
                <div className="space-y-2 pt-3 border-t border-border">
                  <a
                    href={`mailto:${dept.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {dept.email}
                  </a>
                  <a
                    href={COMPANY_PHONE_TEL}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {COMPANY_PHONE}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/30">
            Composable Cognitive Infrastructure
          </Badge>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Build?</h2>
          <p className="text-xl text-muted-foreground mb-4">
            Start free with 3 pipeline slots. Activate packs, trigger dream cycles, and let the substrate evolve.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Builder (free) · Creator ($29/mo) · Architect ($79/mo)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upgrade">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                View Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/start">
              <Button size="lg" variant="outline">
                Start Here
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
