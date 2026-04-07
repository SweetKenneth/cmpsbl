/**
 * Software Symbiosis — The Layer Below All Software
 * Showcases the Universal Adhesion Layer (Layer 2) vision.
 * Content sourced from Vol. 13 of the Substrate Mastery Library.
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Layers,
  Globe,
  Zap,
  Lock,
  RefreshCw,
  Server,
  FileCode,
  Building2,
  Brain,
  Banknote,
  Eye,
  Cpu,
  Rocket,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EnhancedFooter = lazy(() =>
  import("@/components/EnhancedFooter").then((m) => ({ default: m.EnhancedFooter }))
);

/* ─── Historical Infrastructure Parallels ─── */
const INFRASTRUCTURE_LAYERS = [
  { name: "TCP/IP", year: "1983", did: "Universal packet routing", impact: "Enabled the entire internet economy" },
  { name: "SSL/TLS", year: "1995", did: "Invisible encryption wrapping HTTP", impact: "Enabled $4.9T e-commerce" },
  { name: "DNS", year: "1985", did: "Name-to-address translation", impact: "Invisible to users, runs everything" },
  { name: "ARM ISA", year: "1985", did: "Universal processor instruction set", impact: "$66B NVIDIA acquisition attempt" },
  { name: "Docker", year: "2013", did: "Container layer wrapping apps", impact: "$100B+ container ecosystem" },
  { name: "Stripe", year: "2011", did: "Payment abstraction layer", impact: "$50B+ valuation" },
  { name: "CMPSBL®", year: "2025", did: "Universal code adhesion — any code, any language, no cooperation", impact: "Infrastructure category creator", highlight: true },
] as const;

/* ─── SSL Parallel Table ─── */
const SSL_COMPARISON = [
  { property: "Layer Position", ssl: "Below HTTP (transport)", cmpsbl: "Below application code (function boundary)" },
  { property: "Visibility", ssl: "Transparent — HTTP doesn't know", cmpsbl: "Transparent — host code doesn't know" },
  { property: "What It Wraps", ssl: "Network packets", cmpsbl: "Function calls" },
  { property: "What It Adds", ssl: "Encryption only", cmpsbl: "Anything — security, payments, compliance, telemetry" },
  { property: "Host Modification", ssl: "None", cmpsbl: "None" },
  { property: "Universality", ssl: "Any HTTP application", cmpsbl: "Any codebase, any language" },
  { property: "Deterministic", ssl: "Yes", cmpsbl: "Yes" },
] as const;

/* ─── Case Studies ─── */
const CASE_STUDIES = [
  { name: "HuggingFace modeling_utils.py", serial: "CMPSBL-MNKQ1LXE-X0ZD", lang: "Python", domain: "AI/ML", badge: "APEX · CJPI 100", stat: "126M+ downloads/month", desc: "The most-downloaded AI model loading utility on Earth. Layer 2 identified critical vulnerabilities (torch.load, trust_remote_code) and wrapped them — without changing a single line." },
  { name: "OpenSSL TLS 1.3 Engine", serial: "CMPSBL-MNJB00F5-626R", lang: "C", domain: "Cryptography", badge: "Critical Infra", desc: "The encryption engine that secures most of the internet. Layer 2 wrapped the handshake and cipher functions — adding a meta-layer around the layer that already secures HTTP." },
  { name: "IBM Qiskit ConsolidateBlocks", serial: "CMPSBL-MNJ4Y3JG-CQOW", lang: "Python", domain: "Quantum", badge: "IBM", desc: "Quantum computing transpiler pass. Layer 2 wrapped circuit optimization without affecting gate consolidation. Quantum infrastructure accepts the layer." },
  { name: "Metasploit Exploit::Remote::Tcp", serial: "CMPSBL-MNJ5AB71-71MP", lang: "Ruby", domain: "Security", badge: "Stress Test", desc: "Penetration testing exploit module. Layer 2 attached GOVERNANCE hooks to network exploitation functions. Even adversarial tooling accepts the layer." },
  { name: "Meta PyTorch functional.py", serial: "CMPSBL-MNJDRL4I-0DD8", lang: "Python", domain: "AI/ML", badge: "Meta", desc: "The functional API powering deep learning research. Layer 2 wrapped tensor operation dispatch. Meta's core AI training infrastructure accepts the layer." },
  { name: "Google OR-Tools CP-SAT", serial: "CMPSBL-MNJDGI57-L2XP", lang: "Python", domain: "Optimization", badge: "Google", desc: "Constraint satisfaction solver for logistics and scheduling. Layer 2 wrapped constraint propagation boundaries." },
  { name: "QuantLib Gaussian 1D Models", serial: "CMPSBL-MNJD2A7W-DMM8", lang: "C++", domain: "Finance", badge: "Banking", desc: "Derivatives pricing and risk modeling used by banks worldwide. Financial infrastructure accepts the layer." },
  { name: "ArduPilot Vehicle Test Suite", serial: "CMPSBL-MNJBTP5Q-V0OK", lang: "Python", domain: "Aerospace", badge: "Embedded", desc: "Autonomous vehicle control test harness. Safety-critical embedded systems accept the layer — aerospace, automotive, robotics." },
] as const;

/* ─── Use Cases ─── */
const USE_CASES = [
  { icon: Shield, title: "Universal Security", desc: "Attach enterprise-grade defense to any codebase — hospitals, banks, government — without touching their source code. Upgrade 20-year-old infrastructure to 2026 security standards overnight.", color: "neon-cyan" },
  { icon: Banknote, title: "Payment Integration", desc: "Attach payment processing to any application. No SDK. No API integration. No developer needed. The payment logic rides on the layer.", color: "neon-magenta" },
  { icon: Eye, title: "Surveillance & Monitoring", desc: "Law enforcement and intelligence agencies can monitor flagged software without requiring cooperation from Layer 1. The layer observes. The code doesn't know.", color: "neon-purple" },
  { icon: Building2, title: "Legacy System Revival", desc: "Banks running 40-year-old COBOL can't rewrite it. But they can wrap it. Modern capabilities through adhesion, not replacement. $3T in daily transactions still run on COBOL.", color: "neon-cyan" },
  { icon: RefreshCw, title: "Recursive Upgrades", desc: "V2 wraps V1. V3 wraps V2. Each version is additive. Roll back by removing a layer. Zero downtime. Zero regression. The end of rip-and-replace.", color: "neon-magenta" },
  { icon: Brain, title: "AI Memory & Governance", desc: "LLMs are stateless — they forget everything. Layer 2 wraps inference and adds persistent state. Plus ethical boundaries, bias detection, and content gates — all deterministic.", color: "neon-purple" },
  { icon: Cpu, title: "Autonomous Agent Toolkits", desc: "AI agents carry Layer 2 as a built-in toolkit. Security scanning, data validation, API calling — tools that travel with the agent. No external APIs needed.", color: "neon-cyan" },
  { icon: Globe, title: "Compliance by Default", desc: "HIPAA. SOX. GDPR. Compliance isn't a document — it's a function boundary gate compiled into Layer 2. The compliance travels with the code to every deployment environment.", color: "neon-magenta" },
] as const;

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
        {children}
      </h2>
      {sub && (
        <p className="mt-3 text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto">{sub}</p>
      )}
    </div>
  );
}

export default function SoftwareSymbiosis() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="Software Symbiosis — The Layer Below All Software | CMPSBL®"
        description="A universal software adhesion layer that wraps any codebase, in any language, without modification. Attach security, payments, telemetry, governance — to software that doesn't even know you're there. Patent Pending."
        canonical="https://cmpsbl.com/software-symbiosis"
        keywords={["universal adhesion layer", "layer 2", "software symbiosis", "code hardening", "infrastructure licensing", "patent pending", "SSL for software"]}
      />

      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[80dvh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%)" }}
          />
          <div className="absolute inset-0 substrate-grid-bg opacity-20" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Patent Pending · U.S. App. No. 64/029,678</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="block text-foreground">Software</span>
            <span
              className="block"
              style={{
                backgroundImage: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Symbiosis.
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/80 font-medium max-w-3xl mx-auto mb-3 leading-relaxed">
            The layer below all software that travels with it.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/60 max-w-2xl mx-auto mb-8 leading-relaxed">
            A single-file adhesion layer that wraps any codebase, in any language, without modifying it.
            Attach anything — security, payments, telemetry, governance — to software that doesn't even know you're there.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button asChild size="lg" className="gap-2 px-8 h-12 text-sm font-bold rounded-xl">
              <Link to="/case-studies">
                See Proof — 16 Real Codebases
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-6 h-12 text-sm font-medium rounded-xl border-border/50">
              <a href="mailto:layer2@cmpsbl.com">
                <Mail className="w-4 h-4" />
                Inquire About Licensing
              </a>
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground/40 tracking-wide">
            No SDK required in host · No permission needed from Layer 1 · 54+ language adapters · Deterministic · Recursive
          </p>
        </div>
      </section>

      {/* ═══ THE THESIS ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <SectionHeading sub="Forget what you think this is. It's not a scanner. It's not a security product. Those are things you can build on it.">
            What This Actually Is
          </SectionHeading>

          <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 sm:p-10 mb-10">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase">
              The Core Innovation
            </div>
            <blockquote className="text-base sm:text-lg md:text-xl text-foreground/90 font-medium leading-relaxed italic">
              "A universal software adhesion layer — an invisible, autonomous second layer that wraps around any codebase in any language, travels with it, integrates into it, can influence it, but never modifies it."
            </blockquote>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: "🔉", title: "Focused Radio Wave", desc: "The building (Layer 1) stands untouched. The wave (Layer 2) surrounds it, carries signals through it. Security, payments, telemetry — all travel on the wave." },
              { icon: "🛡️", title: "Invisible Forcefield", desc: "An energy boundary that wraps software at function boundaries. It can intercept, inject, observe, and protect. But it never rewires. The host runs exactly as before." },
              { icon: "📦", title: "Single-File Artifact", desc: "Layer 2 deploys as a single file alongside the host code. No SDK installation. No API integration. No host-side cooperation. It just attaches." },
            ].map((m) => (
              <div key={m.title} className="rounded-xl border border-border/40 bg-card/30 p-5 sm:p-6">
                <div className="text-2xl mb-3">{m.icon}</div>
                <h3 className="text-sm font-bold text-foreground mb-2">{m.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SSL PARALLEL ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading sub="SSL wraps network traffic at the transport layer. CMPSBL® wraps function calls at the application layer. The parallel is exact.">
            SSL for All Software
          </SectionHeading>

          <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/30 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">SSL/TLS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-primary uppercase tracking-wider">CMPSBL®</th>
                </tr>
              </thead>
              <tbody>
                {SSL_COMPARISON.map((row) => (
                  <tr key={row.property} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground/90 text-xs sm:text-sm">{row.property}</td>
                    <td className="px-4 py-3 text-muted-foreground/70 text-xs sm:text-sm">{row.ssl}</td>
                    <td className="px-4 py-3 text-foreground/90 font-medium text-xs sm:text-sm">{row.cmpsbl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[hsl(var(--neon-purple)/0.3)] bg-[hsl(var(--neon-purple)/0.04)] p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
              SSL enabled the <strong className="text-foreground">$4.9 trillion</strong> e-commerce economy by solving <em>one</em> problem (encryption) at the bottom layer.
              CMPSBL® solves <strong className="text-foreground">every integration problem</strong> at the bottom layer.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU CAN BUILD ON THE LAYER ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading sub="Security, payments, compliance, surveillance, upgrades — the layer carries anything. Layer 1 never knows.">
            Connect Anything to Any Software
          </SectionHeading>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="group rounded-xl border border-border/30 bg-card/20 p-5 sm:p-6 hover:border-[hsl(var(--${uc.color})/0.4)] hover:bg-[hsl(var(--${uc.color})/0.03)] transition-all duration-300"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors",
                  "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))]",
                  uc.color === "neon-magenta" && "bg-[hsl(var(--neon-magenta)/0.1)] text-[hsl(var(--neon-magenta))]",
                  uc.color === "neon-purple" && "bg-[hsl(var(--neon-purple)/0.1)] text-[hsl(var(--neon-purple))]",
                )}>
                  <uc.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{uc.title}</h3>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROOF — CASE STUDIES ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading sub="These are real codebases from real companies processed through Ascension. The layer attaches to all of them.">
            16 Real Codebases. One Layer.
          </SectionHeading>

          <div className="grid sm:grid-cols-2 gap-4">
            {CASE_STUDIES.map((cs) => (
              <div key={cs.serial} className="rounded-xl border border-border/30 bg-card/30 p-5 hover:border-border/60 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-foreground leading-tight">{cs.name}</h4>
                  <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{cs.badge}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-muted-foreground/50">{cs.serial}</span>
                  {cs.stat && <span className="text-[10px] font-bold text-[hsl(var(--neon-cyan))]">{cs.stat}</span>}
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">{cs.desc}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] font-medium text-muted-foreground/50 border border-border/30 rounded px-1.5 py-0.5">{cs.lang}</span>
                  <span className="text-[10px] font-medium text-muted-foreground/50 border border-border/30 rounded px-1.5 py-0.5">{cs.domain}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
              <Link to="/case-studies">
                View All 16 Case Studies
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ INFRASTRUCTURE PRECEDENT ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <SectionHeading sub="Every era gets one universal layer. TCP/IP for packets. SSL for encryption. CMPSBL® for application code.">
            Infrastructure Layers That Changed Everything
          </SectionHeading>

          <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Layer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">What It Did</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Impact</th>
                </tr>
              </thead>
              <tbody>
                {INFRASTRUCTURE_LAYERS.map((l) => (
                  <tr
                    key={l.name}
                    className={cn(
                      "border-b border-border/20 transition-colors",
                      l.highlight
                        ? "bg-primary/[0.04] hover:bg-primary/[0.08]"
                        : "hover:bg-muted/20"
                    )}
                  >
                    <td className={cn("px-4 py-3 font-bold text-xs sm:text-sm", l.highlight ? "text-primary" : "text-foreground/90")}>{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground/60 text-xs sm:text-sm font-mono">{l.year}</td>
                    <td className="px-4 py-3 text-foreground/80 text-xs sm:text-sm">{l.did}</td>
                    <td className={cn("px-4 py-3 text-xs sm:text-sm font-medium", l.highlight ? "text-primary" : "text-muted-foreground/70")}>{l.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ THE LICENSING MODEL ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <SectionHeading sub="ARM doesn't make chips. ARM licenses the architecture. CMPSBL® doesn't make products. CMPSBL® licenses the layer.">
            ARM, Not Apple.
          </SectionHeading>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
            <div className="rounded-xl border border-border/40 bg-card/30 p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">What Gets Licensed</h3>
              <ul className="space-y-3">
                {[
                  "The Dual-Layer Mechanism (patented)",
                  "54+ Language Adapter Registry",
                  "The Ascension Scanner",
                  "Convex Core™ Deterministic Runtime",
                  "Recursive Layering Property",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/80">
                    <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/30 p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">What the Licensee Provides</h3>
              <ul className="space-y-3">
                {[
                  "Stripe → Payment logic that rides on the layer",
                  "CrowdStrike → Security logic at function boundaries",
                  "Datadog → Telemetry without SDK installation",
                  "Any vendor → Their IP, attached to any codebase",
                  "Your company → Whatever you need to integrate",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/80">
                    <Rocket className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[hsl(var(--neon-magenta))]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/20"><td className="px-4 py-3 font-bold text-foreground/90">Platform License</td><td className="px-4 py-3 text-muted-foreground/70">Annual enterprise licensing</td><td className="px-4 py-3 text-muted-foreground/70">$1M–$50M/yr</td></tr>
                <tr className="border-b border-border/20"><td className="px-4 py-3 font-bold text-foreground/90">Per-Wrap Fee</td><td className="px-4 py-3 text-muted-foreground/70">Micro-fee per codebase wrapped</td><td className="px-4 py-3 text-muted-foreground/70">$0.01–$1.00 per Ascension</td></tr>
                <tr className="border-b border-border/20"><td className="px-4 py-3 font-bold text-foreground/90">Adapter Licensing</td><td className="px-4 py-3 text-muted-foreground/70">Per-language adapter access</td><td className="px-4 py-3 text-muted-foreground/70">Core free, specialized premium</td></tr>
                <tr><td className="px-4 py-3 font-bold text-foreground/90">Revenue Share</td><td className="px-4 py-3 text-muted-foreground/70">Percentage of licensee layer revenue</td><td className="px-4 py-3 text-muted-foreground/70">2–5% of downstream value</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ RECURSIVE UPGRADES ═══ */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading sub="V2 wraps V1. V3 wraps V2. Roll back by removing a layer. Zero downtime. Zero regression.">
            The End of Rip-and-Replace
          </SectionHeading>

          <div className="flex flex-col items-center gap-3 mb-10">
            {[
              { label: "Layer 1 — Host Code", desc: "Your original software. Untouched.", color: "border-border/60 bg-card/40" },
              { label: "Layer 2 v1 — Security & Compliance", desc: "Defense, governance, audit trails.", color: "border-primary/30 bg-primary/[0.04]" },
              { label: "Layer 2 v2 — Payments & Telemetry", desc: "New capabilities added. V1 stays.", color: "border-[hsl(var(--neon-cyan)/0.3)] bg-[hsl(var(--neon-cyan)/0.04)]" },
              { label: "Layer 2 v3 — AI Features", desc: "Another layer. Remove it anytime.", color: "border-[hsl(var(--neon-magenta)/0.3)] bg-[hsl(var(--neon-magenta)/0.04)]" },
            ].map((layer, i) => (
              <div key={layer.label} className={cn("w-full max-w-lg rounded-xl border p-4 sm:p-5 transition-all", layer.color)} style={{ transform: `scale(${1 - i * 0.02})` }}>
                <p className="text-xs sm:text-sm font-bold text-foreground">{layer.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">{layer.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground/60 max-w-xl mx-auto">
            We proved this by wrapping <strong className="text-foreground/80">CMPSBL® with itself</strong> — Layer 2 wrapping Layer 2. The recursive property isn't theoretical. We did it.
          </p>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.05] to-transparent p-8 sm:p-12">
            <Layers className="w-10 h-10 text-primary mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
              Build on the Layer.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Whether you're a security company, a payment processor, or an enterprise that needs to modernize without risk — the adhesion layer is how software evolves from now on.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button asChild size="lg" className="gap-2 px-8 h-12 text-sm font-bold rounded-xl">
                <a href="mailto:layer2@cmpsbl.com">
                  <Mail className="w-4 h-4" />
                  Contact for Licensing
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-6 h-12 text-sm font-medium rounded-xl">
                <Link to="/ascension">
                  Try Ascension Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground/50">
                Patent Pending — U.S. Application No. 64/029,678
              </p>
              <p className="text-xs text-muted-foreground/40">
                For licensing inquiries, enterprise partnerships, or future vision: <a href="mailto:layer2@cmpsbl.com" className="text-primary/70 hover:text-primary transition-colors underline underline-offset-2">layer2@cmpsbl.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
