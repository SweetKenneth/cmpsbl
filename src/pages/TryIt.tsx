/**
 * Try It — Experience the substrate firsthand.
 * Leads with Ascension, proves dual-layer value, converts with clear next steps.
 */
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Terminal,
  Package,
  Zap,
  Brain,
  Shield,
  ExternalLink,
  Layers,
  Eye,
  Lock,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/* ─── Value props ─── */
const VALUE_PROPS = [
  {
    icon: Layers,
    title: "Dual-layer architecture",
    desc: "Layer 2 wraps Layer 1. Your original code stays byte-for-byte identical — verified by SHA-256.",
  },
  {
    icon: Shield,
    title: "Governance built in",
    desc: "Every operation passes through Lex — the layer's conscience. Ethics are architectural.",
  },
  {
    icon: Brain,
    title: "Zero external AI",
    desc: "Ascension uses zero external AI calls. Deterministic. Same input, same output. Every time.",
  },
  {
    icon: Zap,
    title: "90+ languages supported",
    desc: "TypeScript to COBOL. Python to Rust. Every language, same dual-layer semantics.",
  },
];

/* ─── Three paths to try ─── */
const TRY_PATHS = [
  {
    icon: Wrench,
    title: "Ascend Your Code",
    desc: "Upload any codebase. The substrate scans, diagnoses, and collides it against 40 primitives — producing a hardened, governed Layer 2.",
    cta: "Start Ascension",
    href: "/ascension-v2",
    accent: "--primary",
    featured: true,
  },
  {
    icon: Eye,
    title: "Explore the Showroom",
    desc: "Browse discoveries from the Memory Stream — autonomous capabilities scored by CJPI and ready to deploy.",
    cta: "View Discoveries",
    href: "/showroom",
    accent: "--neon-cyan",
  },
  {
    icon: Lock,
    title: "See Mana in Action",
    desc: "Watch Layer 2 silently attach to a live codebase. No modification. No cooperation required. Cryptographic proof included.",
    cta: "View Mana",
    href: "/mana",
    accent: "--neon-purple",
  },
];

export default function TryIt() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Try CMPSBL — Ascend Your Code in Minutes"
        description="Experience dual-layer technology firsthand. Upload your code, watch 40 primitives collide, and receive a hardened, governed Layer 2 — without changing a single line. Free diagnostic."
        keywords={[
          "code ascension",
          "dual layer technology",
          "software hardening",
          "governed cognitive infrastructure",
          "CMPSBL substrate",
        ]}
      />
      <PublicNav />

      <main className="container mx-auto max-w-5xl px-4 pt-28 sm:pt-32 pb-20">
        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 border-primary/30 bg-primary/5 px-4 py-1.5"
          >
            <Wrench className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">Free Diagnostic</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            Your code stays unchanged.
            <br />
            <span className="text-primary">Everything around it evolves.</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
            Upload any codebase. The substrate diagnoses vulnerabilities, collides against 40 primitives, and produces a governed Layer&nbsp;2 — without touching your original&nbsp;source.
          </p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row justify-center gap-3"
          >
            <Button asChild size="lg" className="gap-2 px-8 h-12 text-sm font-bold rounded-xl">
              <Link to="/ascension-v2">
                <Wrench className="w-4 h-4" />
                Ascend Your Code
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-6 h-12 text-sm rounded-xl border-border/50">
              <Link to="/case-studies">
                View Case Studies
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* ─── Three paths to try ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-4 mb-16"
        >
          {TRY_PATHS.map((path) => (
            <Link
              key={path.title}
              to={path.href}
              className={cn(
                "group relative rounded-xl border p-6 transition-all duration-300 hover:-translate-y-0.5",
                path.featured
                  ? "border-primary/30 bg-card/50 shadow-lg shadow-primary/5"
                  : "border-border/30 bg-card/40 backdrop-blur-sm hover:border-primary/20"
              )}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `hsl(var(${path.accent}) / 0.1)` }}
              >
                <path.icon className="w-5 h-5" style={{ color: `hsl(var(${path.accent}))` }} />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">{path.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{path.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: `hsl(var(${path.accent}))` }}>
                {path.cta}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              {path.featured && (
                <div className="absolute -top-px inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-xl" />
              )}
            </Link>
          ))}
        </motion.div>

        {/* ─── Value props ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm"
            >
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-bold mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Stats bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-16 py-8 border-y border-border/20"
        >
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">40</p>
              <p className="text-xs text-muted-foreground mt-1">cognitive primitives</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">90+</p>
              <p className="text-xs text-muted-foreground mt-1">languages supported</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">8hr</p>
              <p className="text-xs text-muted-foreground mt-1">autonomous cycles</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-1">external AI calls</p>
            </div>
          </div>
        </motion.div>

        {/* ─── How it works ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              How Ascension Works
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Upload code. Receive a governed, hardened version — with your original source untouched.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Upload", desc: "Paste or upload any codebase. JavaScript to COBOL — we handle it all." },
              { step: "02", title: "Diagnose", desc: "40 primitives scan for vulnerabilities, missing governance, and structural gaps." },
              { step: "03", title: "Collide", desc: "Your code collides against the substrate. Layer 2 crystallizes around Layer 1." },
              { step: "04", title: "Export", desc: "Download your ascended code — hardened, governed, and certified with CJPI scoring." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-border/20 bg-card/30 p-5">
                <span className="text-[10px] font-black text-primary/40 tracking-wider">{item.step}</span>
                <h3 className="text-sm font-bold text-foreground/90 mt-2 mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to ascend?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Free diagnostic. No signup required. Your code is never stored or reused.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2 min-h-[48px] text-sm">
              <Link to="/ascension-v2">
                <Wrench className="w-4 h-4" />
                Ascend Your Code
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 min-h-[48px] text-sm">
              <Link to="/documentation">
                Read the Docs
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 min-h-[48px] text-sm">
              <Link to="/showroom">
                <Package className="w-4 h-4" />
                Browse Discoveries
              </Link>
            </Button>
          </div>

          {/* Tier quick-reference */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
            {[
              { name: "Builder", price: "Free" },
              { name: "Studio", price: "$29" },
              { name: "Creator", price: "$49" },
              { name: "Architect", price: "$79" },
            ].map((t, i) => (
              <span key={t.name} className="text-[10px] sm:text-xs text-muted-foreground/60 font-mono font-medium">
                {i > 0 && <span className="mr-2 sm:mr-3 text-muted-foreground/20">·</span>}
                <span className="text-foreground/80 font-bold">{t.name}</span> {t.price}
              </span>
            ))}
          </div>
        </motion.div>
      </main>

      <PageSEOBlock
        path="/try"
        title="Try CMPSBL — Dual-Layer Code Ascension"
        faq={[
          {
            question: "What is code ascension?",
            answer:
              "Ascension transforms code by colliding it against 40 substrate primitives. A governed Layer 2 wraps around your original code (Layer 1), adding security, governance, and new capabilities — without modifying the source.",
          },
          {
            question: "Can I try CMPSBL without signing up?",
            answer:
              "Yes. The diagnostic is free and requires no signup. Upload your code and receive a full vulnerability and capability analysis in seconds.",
          },
          {
            question: "What languages does CMPSBL support?",
            answer:
              "CMPSBL supports 90+ languages including JavaScript, TypeScript, Python, Rust, Go, Java, COBOL, and 7 hardware description languages via the Ascension Engine.",
          },
          {
            question: "Does CMPSBL use external AI?",
            answer:
              "No. The substrate's core engines (Ascension, DREAM, Memory Stream) use zero external AI calls. Everything is deterministic — same input, same output, every time.",
          },
        ]}
      />
      <EnhancedFooter />
    </div>
  );
}
