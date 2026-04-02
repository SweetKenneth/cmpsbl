/**
 * Code Assembly Service Page
 * Full-service code reconstruction, splicing, and component integration.
 * ENCODE + MEDIC + ENGINEER primitives — no AI in the output.
 */

import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  ArrowRight, 
  Shield, 
  Puzzle, 
  HardDrive, 
  FileSearch, 
  Package, 
  Layers,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    problem: "Corrupted or partial backups",
    solution: "MEDIC reconstructs missing structures from file signatures and AST patterns. We rebuild what's broken, not replace it.",
    primitive: "MEDIC",
    color: "--neon-magenta",
  },
  {
    icon: Package,
    problem: "Dependency nightmares",
    solution: "ENGINEER resolves version conflicts, rebuilds lockfiles, and untangles dependency graphs — deterministically, no guessing.",
    primitive: "ENGINEER",
    color: "--neon-cyan",
  },
  {
    icon: Puzzle,
    problem: "Don't know how to integrate components",
    solution: "Buy components from our Showroom and we'll splice them directly into your codebase. Plug-and-play delivery — zero dev knowledge required.",
    primitive: "ENCODE",
    color: "--primary",
  },
  {
    icon: FileSearch,
    problem: "Half-lost restorations or legacy code",
    solution: "Tell us what you had. DECODE maps your description to primitives, ENCODE builds the reconstruction plan. We piece it back together.",
    primitive: "DECODE + ENCODE",
    color: "--neon-purple",
  },
  {
    icon: HardDrive,
    problem: "Fragmented files across backups",
    solution: "Hash-chain provenance reconstructs file lineage. MEDIC fills structural gaps with certified substrate scaffolding.",
    primitive: "MEMORY + MEDIC",
    color: "--neon-cyan",
  },
  {
    icon: Layers,
    problem: "Need features but can't build them",
    solution: "Select capabilities from the Showroom — we handle installation, wiring, testing, and delivery. Your code, enhanced.",
    primitive: "ARCHITECT",
    color: "--neon-magenta",
  },
] as const;

const TIERS: Array<{
  name: string;
  price: string;
  description: string;
  scope: string;
  includes: string[];
  featured?: boolean;
}> = [
  {
    name: "Splice",
    price: "$299",
    description: "Component integration",
    scope: "1–3 components spliced into your existing codebase",
    includes: ["Component installation", "Dependency resolution", "Basic testing", "Integration docs"],
  },
  {
    name: "Rebuild",
    price: "$499–799",
    description: "Major reconstruction",
    scope: "Full reconstruction from fragments, backups, or partial code",
    includes: ["Structural analysis", "Missing code reconstruction", "Full test suite", "Refurbishment report", "3-day evaluation"],
    featured: true,
  },
  {
    name: "Full Service",
    price: "$999+",
    description: "Assembly + Refurbishment",
    scope: "Reconstruct, enhance, harden, and certify — complete transformation",
    includes: ["Everything in Rebuild", "CJPI certification", "IP protection", "25-language export", "Priority support"],
  },
];

export default function Assembly() {
  return (
    <>
      <Helmet>
        <title>Code Assembly — CMPSBL® Software Refurbishment Center</title>
        <meta name="description" content="Full-service code reconstruction, splicing, and component integration. Bring us your broken, fragmented, or incomplete code — we'll piece it back together." />
      </Helmet>

      <PublicNav />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
          <div className="absolute inset-0 substrate-grid-bg opacity-20" />
          <div className="absolute inset-0 texture-noise" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-card/40 mb-6">
              <Puzzle className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide">Coming Soon</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-foreground">Code </span>
              <span 
                className="inline-block"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Assembly
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mb-4">
              You don't need to understand code to get it fixed.{' '}
              <span className="text-foreground/90 font-medium">
                Bring us what you have
              </span>{' '}
              — half a backup, a folder of files, a vague description of what it used to do.
            </p>
            <p className="text-base text-muted-foreground/60 max-w-xl mx-auto leading-relaxed mb-10">
              Our specialists diagnose, reconstruct, and deliver working software. No AI rewrites. No "start over." We restore what's yours and fill the gaps with certified components.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2 px-8 h-12 text-sm font-bold rounded-xl">
                <Link to="/ascension">
                  <Wrench className="w-4 h-4" />
                  Start with a Consultation
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-6 h-12 text-sm rounded-xl border-border/50">
                <Link to="/showroom">
                  Browse Components
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* The Geek Squad Pitch */}
        <section className="py-16 sm:py-20 px-4 border-t border-border/15">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-foreground">
                The One-Stop Shop for Code
              </h2>
              <p className="text-muted-foreground/70 max-w-xl mx-auto">
                Issues. Improvements. Assembly. We handle every pain point so you don't have to.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PAIN_POINTS.map((point) => (
                <div 
                  key={point.problem}
                  className="group relative rounded-xl border border-border/20 bg-card/30 p-5 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `hsl(var(${point.color}) / 0.1)` }}
                    >
                      <point.icon className="w-4 h-4" style={{ color: `hsl(var(${point.color}))` }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground/90 mb-0.5">{point.problem}</h3>
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: `hsl(var(${point.color}) / 0.6)` }}
                      >
                        {point.primitive}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">{point.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Assembly Works */}
        <section className="py-16 sm:py-20 px-4 border-t border-border/15 bg-card/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-foreground">
                How It Works
              </h2>
              <p className="text-muted-foreground/70 max-w-lg mx-auto text-sm">
                Six steps from broken code to working software. No developer knowledge needed.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Consultation", desc: "Tell DECODE what you have and what you need. Upload files, describe from memory — anything works.", icon: FileSearch },
                { step: "02", title: "Diagnostic", desc: "MEDIC + ENGINEER scan your code for structural integrity, missing dependencies, and recoverable patterns.", icon: Zap },
                { step: "03", title: "Assembly Plan", desc: "ENCODE builds a detailed reconstruction plan — what can be restored, what needs substrate components, and the cost.", icon: Layers },
                { step: "04", title: "Approval", desc: "You review and approve the plan before any work begins. No surprises.", icon: Shield },
                { step: "05", title: "Assembly", desc: "Our specialists splice, reconstruct, and wire everything together. Classic development tactics, certified components.", icon: Puzzle },
                { step: "06", title: "Debrief", desc: "DECODE walks you through the finished product — what was restored, what was added, and how to use it.", icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border/20 bg-card/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black text-primary/40 tracking-wider">{item.step}</span>
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground/90 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-16 sm:py-20 px-4 border-t border-border/15">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-foreground">
                Assembly Tiers
              </h2>
              <p className="text-muted-foreground/70 max-w-lg mx-auto text-sm">
                From quick component splicing to full-service reconstruction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {TIERS.map((tier) => (
                <div 
                  key={tier.name}
                  className={cn(
                    "rounded-xl border p-6 transition-all duration-300 hover:-translate-y-0.5",
                    tier.featured 
                      ? "border-primary/30 bg-card/50 shadow-lg shadow-primary/5" 
                      : "border-border/20 bg-card/30"
                  )}
                >
                  {tier.featured && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Most Popular</span>
                  )}
                  <h3 className="text-lg font-black text-foreground mb-1">{tier.name}</h3>
                  <div className="text-2xl font-black text-foreground mb-1">{tier.price}</div>
                  <p className="text-xs text-muted-foreground/60 mb-4">{tier.description}</p>
                  <p className="text-xs text-muted-foreground/70 mb-4 pb-4 border-b border-border/15">{tier.scope}</p>
                  <ul className="space-y-2">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                        <CheckCircle2 className="w-3 h-3 text-primary/50 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 px-4 border-t border-border/15 bg-card/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-foreground">
              Got Broken Code?
            </h2>
            <p className="text-muted-foreground/70 mb-8 max-w-lg mx-auto">
              Start with a free consultation. Tell us what you have and we'll tell you exactly what we can do.
            </p>
            <Button asChild size="lg" className="gap-2 px-10 h-13 text-sm font-bold rounded-xl">
              <Link to="/ascension">
                <Wrench className="w-4 h-4" />
                Book a Consultation
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
      <EnhancedFooter />
    </>
  );
}
