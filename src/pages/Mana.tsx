/**
 * Mana — The Silent Attachment Layer
 * Patent Pending: U.S. App. No. 64/031,637
 * Visual-first, full-bleed hero page
 */

import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FAQ } from "@/components/FAQ";
import { CodeWrapAnimation } from "@/components/mana/CodeWrapAnimation";
import { ManaStats } from "@/components/mana/ManaStats";
import { motion } from "framer-motion";
import {
  Shield,
  Layers,
  Eye,
  ArrowRight,
  Lock,
  Globe,
  Zap,
  Scale,
  Cpu,
  Mail,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroWrap from "@/assets/mana/hero-wrap.jpg";
import dualLayer from "@/assets/mana/dual-layer.jpg";
import defenseGate from "@/assets/mana/defense-gate.jpg";
import rfc1Timeline from "@/assets/mana/rfc1-timeline.jpg";

const PATENT_APP_NO = "64/031,637";

/* ── Fade variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

/* ── Capabilities ── */
const CAPABILITIES = [
  { icon: Shield, title: "Universal Attachment", desc: "Attach to any software. 54+ languages. No cooperation required." },
  { icon: Lock, title: "Non-Intrusive", desc: "Host code stays byte-for-byte identical. Verifiable by SHA-256." },
  { icon: Globe, title: "Language-Agnostic", desc: "TypeScript to COBOL. Python to Rust. Every language, same semantics." },
  { icon: Zap, title: "Recursive Layers", desc: "V3 wraps V2 wraps V1. Each independently detachable." },
  { icon: Eye, title: "Governed by Lex", desc: "Every operation passes through governance. Ethics are architectural." },
  { icon: Cpu, title: "Deterministic", desc: "No AI in the pipeline. Same input, same output. Every time." },
];

/* ── FAQ ── */
const FAQ_ITEMS = [
  { question: "What is Mana?", answer: "Mana is a silent software attachment layer — the foundational technology that powers CMPSBL's Ascension engine. It enables capabilities to be attached to any existing software without modifying a single line of the original code." },
  { question: "Does Mana modify my source code?", answer: "Never. The foundational principle of Mana is that the Legacy Host remains in its original state throughout attachment, operation, and detachment. Your code is byte-for-byte identical before and after." },
  { question: "What is Lex?", answer: "Lex is the governance engine — Mana's internal conscience. It autonomously monitors every attachment operation, enforces ethical and security policies, validates host integrity, and maintains immutable audit chains." },
  { question: "Is Mana patented?", answer: "Yes. Protected by U.S. Provisional Patent Application No. 64/031,637, filed April 7, 2026, invented by Kenneth E. Sweet Jr." },
];

export default function Mana() {
  return (
    <>
      <Helmet>
        <title>Mana — The Silent Software Attachment Layer | CMPSBL®</title>
        <meta name="description" content="Mana silently attaches capabilities to any software without modifying source code. Patent pending. The foundation behind Ascension." />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen">
        {/* ═══ FULL-BLEED HERO ═══ */}
        <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Background image */}
          <img
            src={heroWrap}
            alt="Code being silently wrapped by Mana's Layer 2"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />

          <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center py-32">
            <motion.div initial="hidden" animate="visible" className="max-w-4xl mx-auto">
              <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center gap-2 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 text-sm font-bold text-white backdrop-blur-sm">
                  <Award className="w-4 h-4" />
                  Patent Pending · U.S. App. No. {PATENT_APP_NO}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
              >
                <span className="block text-white drop-shadow-lg">Wrap anything.</span>
                <span className="block bg-gradient-to-r from-primary via-[hsl(var(--neon-cyan,190_100%_60%))] to-primary bg-clip-text text-transparent drop-shadow-lg">
                  Modify nothing.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-md"
              >
                Mana silently attaches capabilities to any existing software — security, telemetry,
                governance — without changing a single line of source code.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-xl h-14 px-10 text-lg font-bold shadow-lg shadow-primary/20">
                  <Link to="/mana/proof">
                    See It Live
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl h-14 px-10 text-lg font-semibold backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link to="/ascension">Experience Ascension</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ═══ STATS BAR ═══ */}
        <section className="relative z-10 -mt-16 container mx-auto px-4 lg:px-6 mb-24">
          <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-xl">
            <ManaStats />
          </div>
        </section>

        {/* ═══ CODE WRAPPING — LIVE ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                Watch it happen
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Mana scans function boundaries, attaches capabilities, and never touches the host.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1}>
              <CodeWrapAnimation />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ DUAL LAYER IMAGE ═══ */}
        <section className="relative w-full mb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
          <img
            src={dualLayer}
            alt="Two-layer architecture: pristine host below, luminous Mana layer above"
            width={1920}
            height={800}
            loading="lazy"
            className="w-full h-[50vh] md:h-[60vh] object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center px-4"
            >
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                Two layers. Zero intrusion.
              </h2>
              <p className="text-lg text-white/80 max-w-lg mx-auto drop-shadow-md">
                Layer 1 runs untouched. Layer 2 wraps at function boundaries. The host never knows.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ THREE PILLARS — VISUAL ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Scale, title: "Legacy Host", sub: "Layer 1 — Untouched", desc: "Your original software. Byte-for-byte unmodified. Never aware Mana exists." },
                { icon: Layers, title: "Mana", sub: "Layer 2 — Silent", desc: "Deterministic attachment at function boundaries. Attaches. Operates. Detaches." },
                { icon: Eye, title: "Lex", sub: "The Conscience", desc: "Governance engine enforcing ethics, security, and immutable audit chains." },
              ].map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <Card className="h-full border-border/40 hover:border-primary/30 transition-colors bg-card/50">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <pillar.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{pillar.title}</h3>
                      <p className="text-sm font-semibold text-primary mb-3">{pillar.sub}</p>
                      <p className="text-muted-foreground leading-relaxed">{pillar.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DEFENSE GATE IMAGE ═══ */}
        <section className="relative w-full mb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
          <img
            src={defenseGate}
            alt="DEFENSE Gate forming a protective shield around source code"
            width={1920}
            height={900}
            loading="lazy"
            className="w-full h-[50vh] md:h-[60vh] object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center px-4"
            >
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                DEFENSE gates. Silently.
              </h2>
              <p className="text-lg text-white/80 max-w-lg mx-auto drop-shadow-md">
                Block exploit paths without patching source. The host code stays pristine.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ CAPABILITIES GRID ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-14"
            >
              What Mana enables
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Card className="h-full border-border/40 hover:border-primary/20 transition-colors group">
                    <CardContent className="p-6">
                      <cap.icon className="w-5 h-5 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-base font-bold mb-2">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ RFC 1 CALLOUT ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-primary/20 bg-primary/[0.03] overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-6">
                  April 7 — A day that changed computing. Twice.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  On April 7, 1969, <strong className="text-foreground">RFC 1</strong> was published — the
                  foundational protocol layer that became the internet.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  On April 7, 2026, we filed the patent for <strong className="text-foreground">Mana</strong> — a
                  foundational layer for software itself. Where RFC 1 gave applications a universal
                  communication protocol, Mana gives them a universal capability and governance protocol.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ═══ INVESTOR CTA ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Accepting Select Investors
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                  Two patents pending. 200,000+ lines of production code. A working product.
                  A solo founder who built it all.
                </p>
                <a
                  href="mailto:investors@cmpsbl.com"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Mail className="w-4 h-4" />
                  investors@cmpsbl.com
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">FAQ</h2>
            <FAQ items={FAQ_ITEMS} />
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <section className="container mx-auto px-4 lg:px-6 pb-12">
          <div className="max-w-3xl mx-auto text-center border-t border-border pt-10">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              © 2025–2026 CMPSBL®. A PromptFluid™ Product. All rights reserved.
              <br />
              Mana™, Lex™, Ascension™ are trademarks of PromptFluid™ TX.
              <br />
              Protected by U.S. Patent Applications No. 64/029,678 and No. {PATENT_APP_NO}.
              <br />
              Inventor: Kenneth E. Sweet Jr. (ORCID: 0009-0001-4237-1243)
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
