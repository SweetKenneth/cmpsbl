/**
 * Mana — The Silent Attachment Layer
 * Patent Pending: U.S. App. No. 64/031,637
 * Announced April 7, 2026
 */

import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FAQ } from "@/components/FAQ";
import { motion } from "framer-motion";
import {
  Shield,
  Layers,
  Eye,
  ArrowRight,
  FileText,
  Lock,
  Globe,
  Zap,
  Scale,
  Cpu,
  Mail,
  Calendar,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

const FILING_DATE = "April 7, 2026";
const PATENT_APP_NO = "64/031,637";
const PATENT_TITLE =
  "Silent Symbiotic Software Attachment System with Integrated Governance Layer for Non-Intrusive Capability Enhancement Across Heterogeneous Computing Environments";

/* ── Fade-in variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

/* ── Three pillars ── */
const PILLARS = [
  {
    icon: FileText,
    title: "Legacy Host",
    subtitle: "Layer 1 — Untouched",
    description:
      "Your original software. Byte-for-byte unmodified. Never instrumented, never altered, never aware that Mana exists. It runs exactly the same before, during, and after attachment.",
  },
  {
    icon: Layers,
    title: "Mana",
    subtitle: "Layer 2 — The Silent Layer",
    description:
      "A deterministic capability attachment layer that wraps function boundaries, creating interception points without modifying underlying code. Attaches. Operates. Detaches. The host never knows.",
  },
  {
    icon: Scale,
    title: "Lex",
    subtitle: "The Conscience",
    description:
      "An autonomous governance engine that monitors every Mana operation, enforces ethical constraints, validates host integrity, and maintains immutable audit chains. Lex is the layer's internal conscience.",
  },
];

/* ── What Mana enables ── */
const CAPABILITIES = [
  {
    icon: Shield,
    title: "Universal Attachment",
    description:
      "Attach capabilities to any existing software across 54+ programming languages — without requiring cooperation from the host, access to source code, or modification of any kind.",
  },
  {
    icon: Lock,
    title: "Non-Intrusive Enhancement",
    description:
      "Security hardening, persistent memory, self-healing, telemetry, compliance — added silently. The host application's behavior, output, and performance remain verifiably unchanged.",
  },
  {
    icon: Globe,
    title: "Language-Agnostic",
    description:
      "From modern TypeScript microservices to legacy COBOL systems, from Python ML pipelines to embedded C firmware. Mana speaks every language.",
  },
  {
    icon: Zap,
    title: "Recursive Composition",
    description:
      "Layer upon layer. V3 wraps V2 wraps V1 — each independently detachable without affecting other layers or the Legacy Host. Capabilities compound without complexity.",
  },
  {
    icon: Eye,
    title: "Governance by Default",
    description:
      "Every operation passes through Lex. Ethical constraints, jurisdictional compliance, and precedent-based decision-making are not optional — they are architectural.",
  },
  {
    icon: Cpu,
    title: "Deterministic & Reproducible",
    description:
      "No AI in the attachment pipeline. Same input produces the same output, every time. Auditable, predictable, and patent-protected.",
  },
];

/* ── FAQ ── */
const FAQ_ITEMS = [
  {
    question: "What is Mana?",
    answer:
      "Mana is a silent software attachment layer — the foundational technology that powers CMPSBL's Ascension engine. It enables capabilities to be attached to any existing software without modifying a single line of the original code.",
  },
  {
    question: "How does Mana relate to Ascension?",
    answer:
      "Ascension is the product. Mana is the mechanism. When you run code through Ascension, Mana is the technology that wraps function boundaries, attaches capability chains, and produces the hardened Layer 2 artifact — all without touching Layer 1.",
  },
  {
    question: "Does Mana modify my source code?",
    answer:
      "Never. The foundational principle of Mana is that the Legacy Host remains in its original state throughout attachment, operation, and detachment of the Mana layer. Your code is byte-for-byte identical before and after.",
  },
  {
    question: "What languages does Mana support?",
    answer:
      "Mana supports 54+ programming languages with identical attachment semantics — from Python, TypeScript, and Rust to COBOL, Fortran, and VHDL. The language adapter registry ensures universal coverage.",
  },
  {
    question: "What is Lex?",
    answer:
      "Lex is the governance engine — Mana's internal conscience. It autonomously monitors every attachment operation, enforces ethical and security policies, validates host integrity, and maintains immutable audit chains.",
  },
  {
    question: "Is Mana patented?",
    answer:
      "Yes. Mana is protected by U.S. Provisional Patent Application No. 64/031,637, filed April 7, 2026, in addition to the existing Dual-Layer patent (U.S. App. No. 64/029,678). Both are invented by Kenneth E. Sweet Jr.",
  },
];

export default function Mana() {
  return (
    <>
      <Helmet>
        <title>Mana — The Silent Software Attachment Layer | CMPSBL®</title>
        <meta
          name="description"
          content="Mana is the patent-pending technology that enables silent, non-intrusive capability attachment to any existing software. The foundation behind Ascension."
        />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen pt-28 pb-20">
        {/* ═══ HERO ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            {/* Date badge */}
            <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary">
                <Calendar className="w-4 h-4" />
                {FILING_DATE}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground">
                <Award className="w-4 h-4" />
                Patent Pending
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Introducing{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Mana
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed"
            >
              Ascension has proven it can enhance, repair, and protect any software.
              Today, we release the name and patent protection for the technology that makes it all possible.
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-base text-muted-foreground/80 max-w-2xl mx-auto mb-10"
            >
              U.S. Provisional Patent Application No. {PATENT_APP_NO} — filed {FILING_DATE} by Kenneth E. Sweet Jr.
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-xl h-12 px-8 font-semibold shadow-md shadow-primary/15">
                <Link to="/ascension">
                  Experience Ascension
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl h-12 px-8 font-semibold">
                <Link to="/case-studies">View Case Studies</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ THE PROBLEM ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                The Problem With Software Integration
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every existing method of enhancing software — APIs, SDKs, plugins, middleware — requires
                the host application to <em>cooperate</em>. To expose interfaces. To accept modifications.
                To participate.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1}>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-8">
                  <ul className="space-y-4 text-base">
                    {[
                      "Host software must be designed or modified to accept external capabilities",
                      "Most enhancements require access to and modification of source code",
                      "Integrations break when host software is updated",
                      "Security and compliance are applied inconsistently across integration boundaries",
                      "Adding capabilities requires replacing or substantially modifying existing code",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 w-2 h-2 rounded-full bg-destructive shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ THREE PILLARS ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Three-Component Architecture
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Mana introduces a paradigm where capabilities are <em>attached</em>, not integrated.
                The host never changes. The layer never intrudes. The conscience never sleeps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {PILLARS.map((pillar, i) => (
                <motion.div key={pillar.title} variants={fadeUp} custom={i + 1}>
                  <Card className="h-full border-border/60 hover:border-primary/30 transition-colors">
                    <CardContent className="p-8">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                        <pillar.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{pillar.title}</h3>
                      <p className="text-sm font-medium text-primary mb-3">{pillar.subtitle}</p>
                      <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ WHAT MANA ENABLES ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                What Mana Enables
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A universal adhesion layer for software — silent, deterministic, governed.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CAPABILITIES.map((cap, i) => (
                <motion.div key={cap.title} variants={fadeUp} custom={i + 1}>
                  <Card className="h-full border-border/60 hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <cap.icon className="w-5 h-5 text-primary mb-4" />
                      <h3 className="text-base font-bold mb-2">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ PATENT TIMELINE ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Patent Portfolio
              </h2>
              <p className="text-lg text-muted-foreground">
                Two patent applications. One vision. Zero compromises on IP protection.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  date: "April 4, 2026",
                  appNo: "64/029,678",
                  conf: "8985",
                  title: "Dual-Layer Deterministic Software Evolution System for Autonomous Primitive-Based Code Hardening Without Source Modification",
                  label: "Ascension",
                },
                {
                  date: "April 7, 2026",
                  appNo: "64/031,637",
                  conf: "8236",
                  title: PATENT_TITLE,
                  label: "Mana",
                  highlight: true,
                },
              ].map((patent, i) => (
                <motion.div key={patent.appNo} variants={fadeUp} custom={i + 1}>
                  <Card
                    className={
                      patent.highlight
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60"
                    }
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {patent.label}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {patent.date}
                        </span>
                        {patent.highlight && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mb-1">
                        U.S. App. No. {patent.appNo} · Confirmation #{patent.conf}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{patent.title}"
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Inventor: Kenneth E. Sweet Jr. · Filed Pro Se
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ THE VISION ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                The Future of Software
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="space-y-6 text-lg text-muted-foreground leading-relaxed text-left">
              <p>
                SSL/TLS gave the internet a universal encryption layer — invisible, essential, everywhere.
                Every packet, every connection, every transaction passes through it without developers
                thinking about it.
              </p>
              <p>
                Mana is the same paradigm shift, but for <strong className="text-foreground">logic</strong>.
                A universal governance and capability layer that wraps any software — silently attaching
                security hardening, persistent memory, self-healing, compliance, and intelligence —
                without the host ever knowing it's there.
              </p>
              <p>
                Where SSL protects data in transit, Mana protects and enhances <strong className="text-foreground">code in operation</strong>.
              </p>
              <p>
                The implications are significant: third-party vendors — payment processors, security firms,
                compliance providers — could autonomously attach their logic to any host codebase using
                the Mana layer. No API required. No SDK. No cooperation from the host developer.
              </p>
              <p>
                CMPSBL is building the infrastructure to make this a reality.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ INVESTOR CTA ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                    Accepting Select Investors
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed">
                    We are selectively engaging with investors who understand the magnitude of a universal
                    software attachment layer — and who share our conviction that this technology
                    will reshape how software is built, secured, and governed.
                  </p>
                  <p className="text-base text-muted-foreground/80 max-w-lg mx-auto mb-8">
                    Two patents pending. 200,000+ lines of production code. A working product.
                    A solo founder who built it all. If you see the vision, we'd like to hear from you.
                  </p>
                  <a
                    href="mailto:investors@cmpsbl.com"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    investors@cmpsbl.com
                  </a>
                  <p className="text-xs text-muted-foreground/60 mt-6">
                    CMPSBL® · A PromptFluid™ Product · Abilene, TX
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <FAQ items={FAQ_ITEMS} />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ FOOTER NOTE ═══ */}
        <section className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center border-t border-border pt-10">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              © 2025–2026 CMPSBL®. A PromptFluid™ Product. All rights reserved.
              <br />
              Mana™, Lex™, Ascension™, and the Dual-Layer Architecture are trademarks of PromptFluid™ TX.
              <br />
              Protected by U.S. Patent Applications No. 64/029,678 and No. 64/031,637.
              <br />
              Inventor: Kenneth E. Sweet Jr. (ORCID: 0009-0001-4237-1243)
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
