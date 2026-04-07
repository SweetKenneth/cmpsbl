/**
 * ManaHome — Subdomain landing for mana.cmpsbl.com
 * The dedicated hub for the Mana silent attachment layer.
 * Patent Pending: U.S. App. No. 64/031,637
 */

import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { motion } from "framer-motion";
import {
  Layers,
  Shield,
  Eye,
  Zap,
  Scale,
  Globe,
  ArrowRight,
  Mail,
  ExternalLink,
  FileText,
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const PROOF_TARGETS = [
  {
    name: "Coming Soon",
    description: "The first public demonstration of Mana attaching capabilities to world-class open source software — without modifying a single line.",
    status: "Preparing",
  },
];

const CAPABILITIES = [
  { icon: Layers, title: "Silent Attachment", desc: "Wraps function boundaries without modifying host source code" },
  { icon: Shield, title: "Universal Coverage", desc: "54+ programming languages with identical attachment semantics" },
  { icon: Scale, title: "Governed by Lex", desc: "Every operation passes through an autonomous ethical governance engine" },
  { icon: Eye, title: "Host Integrity", desc: "The Legacy Host runs identically before, during, and after attachment" },
  { icon: Zap, title: "Recursive Composition", desc: "Layer upon layer — each independently detachable" },
  { icon: Globe, title: "Deterministic", desc: "No AI in the pipeline. Same input, same output, every time" },
];

export default function ManaHome() {
  return (
    <>
      <Helmet>
        <title>Mana — The Silent Software Attachment Layer</title>
        <meta
          name="description"
          content="Mana is the patent-pending universal software attachment layer. Attach capabilities to any existing software without modifying a single line of code."
        />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        {/* ═══ HEADER BAR ═══ */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <CmpsblLogo size="sm" />
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">Mana</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  PATENT PENDING
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://cmpsbl.com/mana"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Learn More <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://cmpsbl.com/ascension"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Try Ascension <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>

        {/* ═══ HERO ═══ */}
        <section className="pt-32 pb-20 container mx-auto px-4 lg:px-6">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.div variants={fade} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-widest uppercase text-primary">
                <FileText className="w-3.5 h-3.5" />
                U.S. App. No. 64/031,637 · April 7, 2026
              </span>
            </motion.div>

            <motion.h1
              variants={fade}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-6"
            >
              The Silent
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Attachment Layer
              </span>
            </motion.h1>

            <motion.p variants={fade} custom={2} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              Attach capabilities to any existing software — across 54+ languages — without modifying
              a single line of the original code. Silent. Deterministic. Governed.
            </motion.p>

            <motion.p variants={fade} custom={3} className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10">
              On April 7, 1969, RFC 1 gave the world a universal communication protocol.
              Exactly 57 years later, Mana gives software a universal capability protocol.
            </motion.p>

            <motion.div variants={fade} custom={4} className="flex flex-wrap justify-center gap-4">
              <a
                href="https://cmpsbl.com/mana"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Read the Announcement
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:investors@cmpsbl.com"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card font-semibold hover:bg-secondary transition-colors"
              >
                <Mail className="w-4 h-4" />
                Investor Inquiries
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ CAPABILITIES GRID ═══ */}
        <section className="pb-20 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-5xl mx-auto"
          >
            <motion.h2 variants={fade} custom={0} className="text-2xl font-bold tracking-tight text-center mb-10">
              What Mana Does
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAPABILITIES.map((cap, i) => (
                <motion.div key={cap.title} variants={fade} custom={i + 1}>
                  <Card className="h-full border-border/60 hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <cap.icon className="w-5 h-5 text-primary mb-3" />
                      <h3 className="text-sm font-bold mb-1">{cap.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ PROOF SECTION ═══ */}
        <section className="pb-20 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fade} custom={0} className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight mb-3">
                Proof Is Coming
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We're preparing the first public demonstrations of Mana attaching capabilities
                to the world's most widely-used open source software. Stay tuned.
              </p>
            </motion.div>

            {PROOF_TARGETS.map((target, i) => (
              <motion.div key={target.name} variants={fade} custom={i + 1}>
                <Card className="border-primary/20 bg-primary/[0.03]">
                  <CardContent className="p-8 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary mb-4">
                      {target.status}
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {target.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══ INVESTOR CTA ═══ */}
        <section className="pb-20 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fade} custom={0}>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 sm:p-12">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-3">Accepting Select Investors</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Two patents pending. 200,000+ lines of production code. A working product.
                    If you see the vision for a universal software attachment layer, we'd like to hear from you.
                  </p>
                  <a
                    href="mailto:investors@cmpsbl.com"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    investors@cmpsbl.com
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-border py-10 container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <CmpsblLogo size="sm" className="mx-auto mb-4" />
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              © 2025–2026 CMPSBL®. A PromptFluid™ Product. All rights reserved.
              <br />
              Protected by U.S. Patent Applications No. 64/029,678 and No. 64/031,637.
              <br />
              Inventor: Kenneth E. Sweet Jr.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
