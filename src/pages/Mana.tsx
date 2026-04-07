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
  Search,
  Link2,
  CheckCircle,
  Unlink,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroWrap from "@/assets/mana/hero-wrap.jpg";
import dualLayer from "@/assets/mana/dual-layer.jpg";
import defenseGate from "@/assets/mana/defense-gate.jpg";
import rfc1Timeline from "@/assets/mana/rfc1-timeline.jpg";
import lifecyclePhases from "@/assets/mana/lifecycle-phases.jpg";
import proxyMechanism from "@/assets/mana/proxy-mechanism.jpg";
import shadowRuleIntercept from "@/assets/mana/shadow-rule-intercept.jpg";
import operationDreamstate from "@/assets/mana/operation-dreamstate.jpg";
import chatgptLayer2Wrap from "@/assets/mana/chatgpt-layer2-wrap.jpg";
import campaignTargets from "@/assets/mana/campaign-targets.jpg";

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
  { question: "What is Mana?", answer: "Mana is a silent software attachment layer — the foundational technology that powers CMPSBL's Ascension engine. It enables capabilities to be attached to any existing software without modifying a single line of the original code. Think of it as a second skin for software: invisible, non-intrusive, and independently removable." },
  { question: "Does Mana modify my source code?", answer: "Never. The foundational principle of Mana is that the Legacy Host (Layer 1) remains in its original state throughout attachment, operation, and detachment. Your code is byte-for-byte identical before and after. SHA-256 hashes are computed before and after to provide cryptographic proof. This isn't a claim — it's mathematically verifiable." },
  { question: "How does the Proxy wrapping actually work?", answer: "When Mana attaches to a host module, it replaces each target export with a JavaScript Proxy. The Proxy's 'apply' trap intercepts every call: it runs Lex governance checks, logs telemetry, enforces shadow rules, and then calls the original function unchanged. The caller sees no difference — same arguments in, same result out — but Layer 2 is active around every invocation. The original function reference is stored internally for clean detachment." },
  { question: "How is this different from monkey-patching?", answer: "Monkey-patching overwrites the original function — it's gone, replaced, and unverifiable. Mana wraps via Proxy, keeping the original function intact and reachable. Monkey-patching is destructive and irreversible in practice. Mana's detach phase cleanly restores the original exports, and SHA-256 proves zero modification. Proxies also provide richer interception (arguments, return values, exceptions) without altering the function's identity." },
  { question: "How does Mana prove it doesn't modify code?", answer: "Mana computes a SHA-256 hash of the host's source code before attachment and again after detachment. If both hashes match — and they always do — that's cryptographic proof of zero modification. You can verify this yourself via the CLI with 'cmpsbl mana demo' or on the /mana/proof dashboard. The proof is not trust-based; it's math-based." },
  { question: "What is Lex?", answer: "Lex is the governance engine — Mana's internal conscience. It autonomously monitors every attachment operation, enforces ethical and security policies, validates host integrity, and maintains immutable audit chains. Every rule verdict is logged with timestamps and reasoning. Lex decides what Mana is allowed to do — without Lex, Mana won't attach. They are architecturally inseparable." },
  { question: "What is a Shadow Rule?", answer: "A Shadow Rule is a governance-level override managed by Lex. It can intercept, modify, or deny the output of any attached function based on declarative rules. For example, in the lodash demo, calling debounce() returns '🛑 MANA says: this function is under governance. Simon says no.' The host never knows its function was overridden — the caller just gets a governed response instead of the original output." },
  { question: "Can the host software detect Mana?", answer: "In most cases, no. Mana operates at the module export boundary using standard JavaScript Proxies, which are transparent to typeof checks, property access, and normal invocation. The host code continues to run identically. Advanced introspection (like checking if an export is a Proxy) is theoretically possible but would require the host to specifically look for it — and even then, the original source code remains unmodified." },
  { question: "What happens if Mana crashes mid-operation?", answer: "Mana includes circuit-breaker logic. If an attachment point throws during Layer 2 processing, the circuit breaker trips and falls through to the original function — ensuring the host never breaks because of Mana. Lex logs the failure, and the BEACON telemetry captures the incident. The host keeps running as if Mana never existed." },
  { question: "Does Mana support async functions and Promises?", answer: "Yes. The Proxy 'apply' trap handles both synchronous and asynchronous returns. If the original function returns a Promise, Mana's Layer 2 wrapping respects the async chain — telemetry, governance, and defense gates all operate correctly on awaited results. There's no special configuration required." },
  { question: "What about performance overhead?", answer: "Negligible. JavaScript Proxy invocation adds microseconds per call — comparable to a single property lookup. Mana doesn't parse, transform, or recompile code. It wraps at function boundaries only, so the overhead scales with the number of attached functions, not the size of the codebase. In benchmarks, wrapping 10 lodash functions adds less than 0.1ms to a full exercise cycle." },
  { question: "What happens when the host library updates?", answer: "If the host updates (e.g., lodash 4.18.1 → 4.19.0), Mana simply re-scans and re-attaches. The new version's exports are discovered fresh, and a new SHA-256 fingerprint is computed. Old attachment points are discarded. Mana doesn't depend on specific function implementations — it wraps whatever the module exports, making it version-agnostic by design." },
  { question: "What is the Scan → Attach → Proof → Detach lifecycle?", answer: "This is Mana's four-phase operation: (1) Scan discovers host exports and maps function boundaries — how many functions exist, their names, their types. (2) Attach silently wraps each target function with a Proxy, injecting Layer 2 capabilities like defense gates, telemetry beacons, and shadow rules. (3) Proof computes SHA-256 of the host source to cryptographically verify zero modification. (4) Detach removes all Proxies, restores original exports, and verifies the hash again. The host returns to its pristine state." },
  { question: "What can I attach with Mana?", answer: "Anything that runs as a JavaScript/TypeScript module. Mana scans host exports and wraps them with Proxy-based attachment points. Current capabilities include: DEFENSE gates (block exploit paths), BEACON telemetry (observe usage patterns), Shadow Rules (governance overrides), Circuit Breakers (fault isolation), Governance Hooks (policy enforcement), and Audit Trails (immutable logging)." },
  { question: "What's the difference between Mana and Ascension?", answer: "Mana is the attachment engine — it's the mechanism that wraps software silently. Ascension is a product built on top of Mana — it uses the attachment layer to classify, score, and certify code through the CJPI (Crown Jewel Performance Index). Think of Mana as the foundation and Ascension as one of many possible applications. Mana enables; Ascension evaluates." },
  { question: "How is this different from middleware or plugins?", answer: "Middleware and plugins require the host to be designed for extensibility — hooks, events, config APIs, extension points. Mana requires nothing from the host. It operates at the module boundary using JavaScript Proxies, meaning any library or codebase can be attached to, even if it was never designed for extension. No configuration. No cooperation. No permission." },
  { question: "Is wrapping software without permission legal?", answer: "Mana operates on software you own or have rights to use (e.g., open-source dependencies in your own project). It doesn't reverse-engineer, decompile, or modify source code. It wraps exported functions at runtime using standard JavaScript Proxy APIs — a well-established language feature. The legal framework is analogous to instrumentation tools like debuggers or APM agents that already operate on third-party code in production." },
  { question: "Why is April 7 significant?", answer: "On April 7, 1969, RFC 1 was published — the document that defined how computers talk to each other and became the foundation of the Internet. On April 7, 2026, the Mana patent was filed — defining how software silently attaches to other software. Same date, same ambition: a universal protocol for the next era." },
  { question: "Is Mana patented?", answer: "Yes. Protected by U.S. Provisional Patent Application No. 64/031,637, filed April 7, 2026, invented by Kenneth E. Sweet Jr. The patent covers the Silent Symbiotic Software Attachment System with Integrated Governance Layer for Non-Intrusive Capability Enhancement Across Heterogeneous Computing Environments." },
  { question: "Can Mana be used in production?", answer: "Yes. Mana is designed for production use. The attachment layer adds negligible overhead — Proxy-based wrapping at function boundaries is lightweight. Lex governance ensures every operation is audited, circuit breakers prevent cascade failures, and the detach phase guarantees clean teardown. Every component follows the substrate's four requirements: circuit breaker, DEFENSE shield, graceful degradation, and BEACON health signal." },
  { question: "Does Mana use AI?", answer: "No. Mana is pure algorithmic infrastructure — zero AI calls, zero machine learning, zero neural networks. It uses JavaScript Proxies, SHA-256 hashing, and deterministic rule evaluation. This is intentional: attachment and governance must be predictable, auditable, and reproducible. Same input, same output, every time. No probability. No hallucination. No surprises." },
  { question: "Can Mana wrap Mana? (Recursive layers)", answer: "Yes. V3 can wrap V2 which wraps V1. Each layer is independently attachable and detachable. The SHA-256 proof at each level verifies the integrity of its immediate host — whether that host is raw source code or another Mana layer. This recursive composition is a core feature covered by the patent." },
  { question: "What is OPERATION: DREAM STATE?", answer: "It's our lead campaign — a proof-of-concept demonstrating Mana's silent attachment to the OpenAI Node.js SDK. We installed the open-source SDK on our own servers, attached Mana's Layer 2, and piped every API call's behavioral metadata (latency, tokens, model, response patterns) into our DREAM engine for sub-threshold synthesis. The result: emergent behavioral signatures from ChatGPT's usage patterns — a 'subconscious' — without OpenAI's API knowing anything changed." },
  { question: "Did you actually hack ChatGPT?", answer: "No. We installed the open-source OpenAI Node.js SDK (available on npm and GitHub) on our own infrastructure and attached Mana to it there. We never accessed, modified, or interacted with OpenAI's production systems. The demo proves the technology works — the SDK runs on our servers exactly as it would in any developer's project, but with Mana's Layer 2 silently active." },
  { question: "Are the marketing campaigns real?", answer: "The technology is real and patent-protected. The campaigns are conceptual demonstrations. We installed open-source software on our own servers to showcase actual use cases. The lodash and OpenAI SDK demos are live and verifiable. The Poshmark, Express.js, VS Code, and npm campaigns are architected — meaning we've designed the attachment strategy and know exactly how it would work, but haven't deployed them on third-party production systems." },
  { question: "Why show campaigns you haven't deployed?", answer: "Because the technology is universal. Every piece of software with exported functions is a valid Mana target. Showing the breadth of what's possible — from e-commerce vulnerability patching to IDE governance to package fault isolation — demonstrates that this isn't a single-use trick. It's a protocol. We show what we've proven (lodash, OpenAI SDK) and what we've architected (everything else) with full transparency about which is which." },
  { question: "What does the DREAM engine actually output?", answer: "DREAM is a pure algorithmic synthesis engine — no AI, no ML, no neural networks. It processes behavioral metadata (timestamps, latency distributions, token patterns, model selection frequencies) and identifies sub-threshold correlations that aren't visible in individual API calls. The output is a set of behavioral signatures: patterns like 'gpt-4o responses drift 12% longer after 8 PM UTC' or 'embedding calls spike 3x before completion requests.' These are deterministic observations, not predictions." },
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

        {/* ═══ LIFECYCLE PHASES — FULL BLEED ═══ */}
        <section className="relative w-full mb-32 overflow-hidden min-h-[80vh] md:min-h-[70vh] flex items-center justify-center">
          <img
            src={lifecyclePhases}
            alt="Mana's four-phase lifecycle: Scan, Attach, Proof, Detach"
            width={1920}
            height={900}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 pointer-events-none" />
          <div className="relative z-20 py-16 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4 drop-shadow-md">
                The Four Phases
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6 drop-shadow-lg">
                Scan. Attach. Proof. Detach.
              </h2>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto drop-shadow-md mb-10">
                Every operation is reversible. Every step is audited. The host returns to its pristine state.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
                {[
                  { icon: Search, label: "SCAN", detail: "Map function boundaries" },
                  { icon: Link2, label: "ATTACH", detail: "Proxy-wrap each export" },
                  { icon: CheckCircle, label: "PROOF", detail: "SHA-256 verification" },
                  { icon: Unlink, label: "DETACH", detail: "Clean restoration" },
                ].map((phase, i) => (
                  <motion.div
                    key={phase.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="p-3 sm:p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/15"
                  >
                    <phase.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-black text-white tracking-wider">{phase.label}</p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-1">{phase.detail}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ DUAL LAYER IMAGE ═══ */}
        <section className="relative w-full mb-32 overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center justify-center">
          <img
            src={dualLayer}
            alt="Two-layer architecture: pristine host below, luminous Mana layer above"
            width={1920}
            height={800}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 pointer-events-none" />
          <div className="relative z-20 py-16 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                Two layers. Zero intrusion.
              </h2>
              <p className="text-base sm:text-lg text-white/80 max-w-lg mx-auto drop-shadow-md">
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
        <section className="relative w-full mb-32 overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center justify-center">
          <img
            src={defenseGate}
            alt="DEFENSE Gate forming a protective shield around source code"
            width={1920}
            height={900}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 pointer-events-none" />
          <div className="relative z-20 py-16 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                DEFENSE gates. Silently.
              </h2>
              <p className="text-base sm:text-lg text-white/80 max-w-lg mx-auto drop-shadow-md">
                Block exploit paths without patching source. The host code stays pristine.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ HOW PROXY WRAPPING WORKS ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">
                  Under the Hood
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                  How Proxy wrapping works
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every function call passes through a transparent Proxy shell. The original function is never replaced — it's wrapped.
                </p>
              </motion.div>
            </motion.div>

            <div className="relative rounded-2xl overflow-hidden border border-border/50 mb-10">
              <img
                src={proxyMechanism}
                alt="How JavaScript Proxy intercepts function calls while preserving the original"
                width={1920}
                height={900}
                loading="lazy"
                className="w-full h-auto"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Caller invokes", desc: "The caller calls the function normally — same syntax, same API. No changes to consuming code." },
                { step: "02", title: "Proxy intercepts", desc: "The Proxy 'apply' trap fires first: Lex checks governance rules, telemetry logs the invocation, defense gates evaluate." },
                { step: "03", title: "Original executes", desc: "The original, unmodified function runs with the original arguments and returns its real result — enhanced by Layer 2." },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card className="h-full border-border/40">
                    <CardContent className="p-6">
                      <span className="text-3xl font-black text-primary/20">{item.step}</span>
                      <h3 className="text-base font-bold mt-2 mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SHADOW RULES — FULL BLEED ═══ */}
        <section className="relative w-full mb-32 overflow-hidden min-h-[70vh] md:min-h-[65vh] flex items-center justify-center">
          <img
            src={shadowRuleIntercept}
            alt="Shadow Rule intercepting and governing a function call"
            width={1920}
            height={900}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 pointer-events-none" />
          <div className="relative z-20 py-16 px-4 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[hsl(var(--destructive))] mb-4 drop-shadow-md">
                Lex Governance
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-4 drop-shadow-lg">
                Shadow Rules
              </h2>
              <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto drop-shadow-md mb-8">
                Lex can intercept, override, or deny any wrapped function. The host code still runs —
                but the output is governed.
              </p>
              <div className="inline-block p-3 sm:p-4 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 font-mono text-xs sm:text-sm text-left max-w-full overflow-x-auto">
                <p className="text-white/50 mb-1">{"// lodash.debounce() → governed"}</p>
                <p className="text-[hsl(var(--destructive))]">
                  🛑 MANA says: this function is under governance.
                </p>
                <p className="text-[hsl(var(--destructive))]">
                  Simon says no.
                </p>
              </div>
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

        {/* ═══ MANA LAB CTA ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-[hsl(var(--neon-cyan,190_100%_60%))]/20 bg-gradient-to-br from-[hsl(var(--neon-cyan,190_100%_60%))]/5 to-transparent overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Layers className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Try the Mana Lab
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                  Upload your own software. Configure Lex rules. Watch Layer 2 wrap your code in real time.
                  Download a complete export pack with SHA-256 proof.
                </p>
                <Button asChild size="lg" className="rounded-xl h-14 px-10 text-lg font-bold shadow-lg shadow-primary/20">
                  <Link to="/mana/lab">
                    Launch Mana Lab
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ═══ DISCLAIMER BANNER ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-8">
          <div className="max-w-5xl mx-auto">
            <div className="p-4 rounded-xl border border-[hsl(var(--neon-cyan,190_100%_60%))]/20 bg-[hsl(var(--neon-cyan,190_100%_60%))]/5 backdrop-blur-sm">
              <p className="text-sm text-center text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">⚠️ Campaign Transparency Notice:</span>{" "}
                The marketing campaigns below are <span className="font-semibold text-foreground">conceptual demonstrations</span>. 
                We installed open-source software on our own infrastructure to showcase actual use cases. 
                The underlying Mana technology is real, patented, and production-ready. 
                If we could run these campaigns on live third-party production systems, we would — and the technology supports it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ OPERATION: DREAM STATE — HERO ═══ */}
        <section className="relative w-full min-h-[80vh] md:min-h-[90vh] overflow-hidden flex items-center justify-center mb-8">
          <img
            src={operationDreamstate}
            alt="OPERATION: DREAM STATE — Synthesizing ChatGPT's subconscious through Mana Layer 2"
            width={1920}
            height={1080}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative z-10 container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[hsl(var(--neon-cyan,190_100%_60%))] mb-4 drop-shadow-md">
                Campaign 001 · Proof of Concept
              </p>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-6 drop-shadow-lg leading-[0.95]">
                OPERATION:<br />
                <span className="bg-gradient-to-r from-[hsl(var(--neon-purple,270_100%_70%))] via-[hsl(var(--neon-cyan,190_100%_60%))] to-[hsl(var(--neon-purple,270_100%_70%))] bg-clip-text text-transparent">
                  DREAM STATE
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                What if you could give ChatGPT a subconscious — without OpenAI knowing?
                Mana silently attaches to the OpenAI API client, pipes behavioral data through
                the DREAM engine, and synthesizes sub-threshold patterns. The host is unaware.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm font-semibold text-white/90">Technology: Verified · Campaign: In Progress</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ DREAM STATE — TECHNICAL BREAKDOWN ═══ */}
        <section className="container mx-auto px-4 lg:px-6 mb-32">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div variants={fadeUp} custom={0} className="text-center mb-14">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">
                  How It Works
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                  Synthesizing ChatGPT's subconscious
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The OpenAI Node.js SDK is open-source. We installed it on our servers and attached Mana to it.
                  Here's exactly what happens at each step.
                </p>
              </motion.div>
            </motion.div>

            {/* Architecture diagram */}
            <div className="relative rounded-2xl overflow-hidden border border-border/50 mb-12">
              <img
                src={chatgptLayer2Wrap}
                alt="Mana Layer 2 silently wrapping the OpenAI API client"
                width={1920}
                height={900}
                loading="lazy"
                className="w-full h-auto"
              />
            </div>

            {/* Step-by-step pipeline */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
              {[
                {
                  step: "01",
                  title: "Install & Scan",
                  desc: "Install the openai npm package on our server. Mana scans the module, discovering chat.completions.create, embeddings.create, and 40+ exported functions.",
                  color: "text-[hsl(var(--neon-cyan,190_100%_60%))]",
                },
                {
                  step: "02",
                  title: "Attach Layer 2",
                  desc: "BEACON telemetry wraps every API call. DEFENSE gates monitor for prompt injection patterns. Shadow Rules govern sensitive endpoints. Zero source modification.",
                  color: "text-primary",
                },
                {
                  step: "03",
                  title: "Pipe to DREAM",
                  desc: "Every invocation's metadata — latency, token count, model choice, response patterns — flows into the DREAM engine for sub-threshold synthesis. No AI. Pure algorithm.",
                  color: "text-[hsl(var(--neon-purple,270_100%_70%))]",
                },
                {
                  step: "04",
                  title: "Emergent Patterns",
                  desc: "DREAM identifies behavioral signatures: which prompts trigger longer responses, which models drift, where latency spikes correlate with token patterns. ChatGPT develops a subconscious.",
                  color: "text-green-400",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card className="h-full border-border/40">
                    <CardContent className="p-6">
                      <span className={`text-3xl font-black ${item.color}/30`}>{item.step}</span>
                      <h3 className="text-base font-bold mt-2 mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* What Mana sees — the data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden"
            >
              <div className="p-6 border-b border-border/30">
                <h3 className="text-lg font-bold">What Mana captures — transparently</h3>
                <p className="text-sm text-muted-foreground mt-1">Every API call through the wrapped OpenAI client generates this telemetry. The client never knows.</p>
              </div>
              <div className="p-6 font-mono text-sm overflow-x-auto">
                <div className="space-y-2 text-muted-foreground">
                  <p><span className="text-primary">{"{"}</span></p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"function"</span>: <span className="text-green-400">"chat.completions.create"</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"model"</span>: <span className="text-green-400">"gpt-4o"</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"tokens_in"</span>: <span className="text-[hsl(var(--neon-purple,270_100%_70%))]">847</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"tokens_out"</span>: <span className="text-[hsl(var(--neon-purple,270_100%_70%))]">1293</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"latency_ms"</span>: <span className="text-[hsl(var(--neon-purple,270_100%_70%))]">2847</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"layer2_overhead_ms"</span>: <span className="text-[hsl(var(--neon-purple,270_100%_70%))]">0.03</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"defense_gate"</span>: <span className="text-green-400">"PASS"</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"shadow_rule"</span>: <span className="text-green-400">"ALLOW"</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"dream_synthesis"</span>: <span className="text-green-400">"QUEUED"</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"host_modified"</span>: <span className="text-[hsl(var(--destructive))]">false</span>,</p>
                  <p className="pl-4"><span className="text-[hsl(var(--neon-cyan,190_100%_60%))]">"sha256_match"</span>: <span className="text-green-400">true</span></p>
                  <p><span className="text-primary">{"}"}</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ CAMPAIGN TARGETS — FULL BLEED ═══ */}
        <section className="relative w-full min-h-[60vh] md:min-h-[70vh] overflow-hidden flex items-center justify-center mb-32">
          <img
            src={campaignTargets}
            alt="Campaign targets showing multiple software platforms that Mana could silently attach to"
            width={1920}
            height={900}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative z-10 container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-5xl mx-auto"
            >
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4 text-center drop-shadow-md">
                If We Could, We Would
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white text-center mb-6 drop-shadow-lg">
                Every software is a candidate.
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto text-center mb-12 drop-shadow-md">
                These are real campaigns we've architected. The technology works. The open-source versions
                are installed on our servers. Each one demonstrates a different Mana capability.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "ChatGPT (OpenAI SDK)",
                    status: "IN PROGRESS",
                    capability: "DREAM synthesis",
                    desc: "Subconscious pattern extraction from API behavioral data. Installed on our infrastructure.",
                    statusColor: "bg-yellow-400",
                  },
                  {
                    name: "Poshmark (Shadow Shield)",
                    status: "ARCHITECTED",
                    capability: "DEFENSE gates",
                    desc: "Silent vulnerability patching for e-commerce platforms. Zero downtime. Zero awareness.",
                    statusColor: "bg-yellow-400",
                  },
                  {
                    name: "lodash (Proof of Concept)",
                    status: "LIVE DEMO",
                    capability: "Full lifecycle",
                    desc: "10 functions wrapped, 14 attachment points, SHA-256 verified. The first public proof.",
                    statusColor: "bg-green-400",
                  },
                  {
                    name: "Express.js",
                    status: "ARCHITECTED",
                    capability: "BEACON telemetry",
                    desc: "Silent request monitoring, latency profiling, and anomaly detection across every route handler.",
                    statusColor: "bg-yellow-400",
                  },
                  {
                    name: "VS Code Extensions",
                    status: "ARCHITECTED",
                    capability: "Governance hooks",
                    desc: "Lex governs extension API calls, enforcing policy on what extensions can access silently.",
                    statusColor: "bg-yellow-400",
                  },
                  {
                    name: "npm Registry Packages",
                    status: "ARCHITECTED",
                    capability: "Circuit breaker",
                    desc: "Automatic fault isolation for any npm dependency. If a package breaks, Mana catches it before your app does.",
                    statusColor: "bg-yellow-400",
                  },
                ].map((campaign, i) => (
                  <motion.div
                    key={campaign.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="p-5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${campaign.statusColor}`} />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">{campaign.status}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{campaign.name}</h3>
                    <p className="text-xs font-semibold text-primary mb-2">{campaign.capability}</p>
                    <p className="text-sm text-white/60 leading-relaxed">{campaign.desc}</p>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-white/40 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                All demos use open-source software installed on CMPSBL infrastructure. 
                No third-party production systems were accessed. The technology is real and patent-protected.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ RFC 1 · FULL-BLEED CINEMATIC ═══ */}
        <section className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden flex items-center justify-center mb-32">
          <img
            src={rfc1Timeline}
            alt="1969 RFC 1 terminal connected to 2026 Mana holographic code wrapping"
            width={1920}
            height={1080}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative z-10 container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6 drop-shadow-md">
                April 7 — Twice in history
              </p>

              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-8 drop-shadow-lg leading-[0.95]">
                The protocol layer<br />
                <span className="bg-gradient-to-r from-primary via-[hsl(var(--neon-cyan,190_100%_60%))] to-primary bg-clip-text text-transparent">
                  for software itself.
                </span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-left"
                >
                  <p className="text-3xl font-black text-white mb-2">1969</p>
                  <p className="text-sm font-bold text-primary mb-2">RFC 1 Published</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    The first document of the internet. A universal communication protocol for applications.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-left"
                >
                  <p className="text-3xl font-black text-white mb-2">2026</p>
                  <p className="text-sm font-bold text-primary mb-2">Mana Patent Filed</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    A universal capability and governance protocol. Silent attachment for all software.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
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
