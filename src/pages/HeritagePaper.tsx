/**
 * Heritage Meta-Paper v2.3 — Clarity Edition
 * Complete lineage from BRAIN Genesis (Jan 2025) to CMPSBL v14.2.0
 * Includes executive summary, reading guide, and architectural diagrams
 */

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  EcosystemDiagram,
  ConsolidationDiagram,
  SectorTopologyDiagram,
  TimelineDiagram,
  LineageFlowDiagram,
  IntentMeshDiagram,
} from "@/components/heritage/ArchitectureDiagrams";

/* ── Reusable sub-components ─────────────────────────────── */

const PhaseHeader = ({ num, title }: { num: string; title: string }) => (
  <div className="flex items-start gap-3 mb-4 mt-10 first:mt-0">
    <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs font-mono">{num}</div>
    <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug">{title}</h3>
  </div>
);

const ContributionBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-muted/30 rounded-lg p-4 border border-border/50 my-4">
    <p className="text-xs font-mono uppercase tracking-wider text-primary/70 mb-1">Key Contribution to CMPSBL</p>
    <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const SectionTitle = ({ id, num, title }: { id?: string; num: string; title: string }) => (
  <h2 id={id} className="text-xl sm:text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif scroll-mt-20">
    {num}. {title}
  </h2>
);

/* ── Main Component ──────────────────────────────────────── */

const HeritagePaper = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Heritage of Autonomous Cognitive Infrastructure — CMPSBL®</title>
        <meta name="description" content="Comprehensive lineage paper v2.3 (Clarity Edition) tracing the heritage of CMPSBL Substrate OS from BRAIN Genesis (January 2025) through the 40-node cognitive operating system. Open access academic publication." />
      </Helmet>

      {/* Sticky toolbar — hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <a href="/docs/meta-paper/heritage.html" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-xs font-mono">Standalone HTML</Button>
          </a>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </Button>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 18mm 20mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .heritage-paper { font-size: 10pt !important; line-height: 1.5 !important; }
          .heritage-paper h1 { font-size: 20pt !important; }
          .heritage-paper h2 { font-size: 14pt !important; page-break-after: avoid; }
          .heritage-paper h3 { font-size: 12pt !important; page-break-after: avoid; }
          .heritage-paper table { page-break-inside: avoid; }
          .heritage-paper pre { page-break-inside: avoid; }
        }
      `}</style>

      <div ref={printRef} className="heritage-paper bg-background min-h-screen">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12 print:px-0 print:py-0">

          {/* ═══════════ HEADER ═══════════ */}
          <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b-2 border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase">CMPSBL® Academic Publication</span>
              <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">📖 Open Access / Prior Art · v2.3 Clarity Edition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3 sm:mb-4">
              The Heritage of Autonomous Cognitive Infrastructure
            </h1>
            <p className="text-base sm:text-xl text-primary font-medium mb-5 sm:mb-6 leading-snug">
              From PromptFluid to CMPSBL® Substrate OS — A Comprehensive Lineage Paper
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-muted-foreground font-mono">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Author</div>
                <div className="text-foreground font-medium">Kenneth E. Sweet Jr.</div>
                <a href="https://orcid.org/0009-0001-4237-1243" className="text-primary text-xs hover:underline">ORCID: 0009-0001-4237-1243</a>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Publication</div>
                <div className="text-foreground font-medium">PromptFluid®</div>
                <div className="text-xs">March 15, 2026 · v2.3 Clarity Edition</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Primary DOI</div>
                <a href="https://doi.org/10.5281/zenodo.18234909" className="text-primary hover:underline text-xs sm:text-sm break-all">10.5281/zenodo.18234909</a>
              </div>
            </div>
          </header>

          {/* ═══════════ AT A GLANCE ═══════════ */}
          <section className="mb-6 sm:mb-8">
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-primary">⚡</span> At a Glance
              </h2>
              <dl className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <dt className="font-semibold text-foreground inline">What is CMPSBL? </dt>
                  <dd className="inline">A 40-node cognitive operating system that governs itself — learning, evolving, and defending autonomously under human oversight.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground inline">Where did it come from? </dt>
                  <dd className="inline">Fifteen months of continuous R&D (January 2025 → March 2026) across 12 predecessor projects — each contributing a specific architectural pattern.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground inline">What was the first thing built? </dt>
                  <dd className="inline">BRAIN — a zero-cost neural embedding engine — written in January 2025. It's still the cognitive core today.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground inline">Why does this paper exist? </dt>
                  <dd className="inline">To establish a permanent, verifiable provenance chain — proving every innovation traces back to documented, working code.</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* ═══════════ READING GUIDE ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">How to Read This Paper</h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[350px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border border-border font-semibold text-foreground">If you want to…</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Start at…</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">Understand the full story chronologically</td><td className="p-2 border border-border font-mono text-primary">§2 — Complete Timeline</td></tr>
                  <tr><td className="p-2 border border-border">See how each product became a substrate node</td><td className="p-2 border border-border font-mono text-primary">§3 — Heritage Map</td></tr>
                  <tr><td className="p-2 border border-border">Trace a specific innovation to its origin</td><td className="p-2 border border-border font-mono text-primary">§4 — Innovation Genealogy</td></tr>
                  <tr><td className="p-2 border border-border">Understand the dreaming research lineage</td><td className="p-2 border border-border font-mono text-primary">§5 — Dreaming Lineage</td></tr>
                  <tr><td className="p-2 border border-border">See how 252 functions became 40 nodes</td><td className="p-2 border border-border font-mono text-primary">§7 — Consolidation Event</td></tr>
                  <tr><td className="p-2 border border-border">Verify the academic record</td><td className="p-2 border border-border font-mono text-primary">§1.3 — Archival Records</td></tr>
                  <tr><td className="p-2 border border-border">Cite this paper</td><td className="p-2 border border-border font-mono text-primary">§11 — Citation</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══════════ ABSTRACT ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle num="0" title="Abstract" />
            <div className="text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg p-4 sm:p-5 border border-border/50">
              <p className="mb-3">
                This meta-paper traces the complete architectural and intellectual lineage of the CMPSBL® Substrate OS — a 40-node cognitive orchestration system for persistent, self-governing artificial intelligence. The system did not emerge in isolation. It is the product of a continuous fifteen-month research trajectory spanning January 2025 through March 2026, during which the author designed, built, and iterated through neural learning infrastructure, AI-powered accessibility repair, autonomous AI dreaming, adversarial security research, multi-model orchestration, website modernization, and cognitive runtime design.
              </p>
              <p className="mb-3">
                The lineage begins not with a product launch but with a question: <em>How does a machine learn and remember?</em> In January 2025, the author began building what would become BRAIN — the neural substrate layer — a deterministic embedding engine, knowledge crystallization pipeline, and confidence-scored memory system. BRAIN was the first piece of code written in the entire ecosystem, and it remains the cognitive core of the 40-node substrate today. From BRAIN, the author expanded into Cascade, PromptFluid Clarity, AetherionShield, the Dream Protocol, a 23-provider AI routing mesh, Studio/Modernizer, SimNap, and the full CMPSBL Substrate OS across 14 major versions and four named epochs.
              </p>
              <p>
                The purpose of this paper is to provide the academic community with a single, coherent narrative — establishing the provenance chain from the first neural learning engine built in January 2025, to a <strong className="text-foreground">40-node cognitive operating system</strong> capable of governed self-evolution, memory crystallization, and universal cross-language export.
              </p>
            </div>
          </section>

          {/* ═══════════ TIMELINE DIAGRAM ═══════════ */}
          <TimelineDiagram />

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 1. INTRODUCTION ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="introduction" num="1" title="Introduction" />

            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-6 mb-3">1.1 Motivation</h3>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The CMPSBL® Substrate OS, as documented in its v14.2.0 MINDGAMES epoch academic protection set, represents a mature cognitive orchestration architecture comprising 40 nodes across 12 sectors. However, the published technical documentation describes the <em>current state</em> of the system without addressing the <em>path</em> that produced it. For the academic record, it is essential to document how the system's core innovations — clockless orchestration, memory crystallization, governed self-evolution, autonomous dreaming — emerged from a series of predecessor projects, each contributing specific architectural patterns refined and integrated into the final substrate.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              This v2.2 edition corrects timeline inaccuracies present in earlier versions (caused by a project remix in 2025 that erased early development history) by cross-referencing the PromptFluid-Vision project archives, "The Firsts" manifesto chronicle, and the full Zenodo publication chain. Crucially, it restores the Genesis period (January–June 2025) during which the foundational BRAIN engine and early Cascade orchestration work were developed.
            </p>

            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-6 mb-3">1.2 Scope</h3>
            <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-5 space-y-1 mb-4" start={0}>
              <li><strong className="text-foreground">BRAIN — The Genesis Engine</strong> (Jan–Jun 2025) — deterministic neural substrate, the first code written</li>
              <li><strong className="text-foreground">PromptFluid Clarity / CMPTBL</strong> (July 2025) — AI-powered WCAG 2.2 accessibility compliance</li>
              <li><strong className="text-foreground">WebAdoption</strong> (July 2025) — living directory of WCAG-verified sites</li>
              <li><strong className="text-foreground">Cascade</strong> (August 2025) — orchestration personality and intelligence routing</li>
              <li><strong className="text-foreground">Verify</strong> (August 2025) — AI plugin certification and sandboxed auto-fix</li>
              <li><strong className="text-foreground">AetherionShield</strong> (Sept–Oct 2025) — offensive-to-defensive security transformation</li>
              <li><strong className="text-foreground">Dream Protocol</strong> (September 2025) — first autonomous AI dreaming capability</li>
              <li><strong className="text-foreground">Multi-Model Routing Mesh</strong> (October 2025) — 23-provider AI orchestration</li>
              <li><strong className="text-foreground">Studio / Modernizer</strong> (November 2025) — autonomous website rebuilding</li>
              <li><strong className="text-foreground">SimNap</strong> (Nov–Dec 2025) — formalized autonomous dreaming system</li>
              <li><strong className="text-foreground">CMPSBL Substrate OS</strong> (2025–2026) — cognitive OS, v1.0 through v14.2.0</li>
            </ol>

            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-6 mb-3">1.3 Archival Records</h3>
            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Archive</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Record</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Content</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">OSF</td><td className="p-2 border border-border"><a href="https://osf.io/df7tz" className="text-primary">osf.io/df7tz</a></td><td className="p-2 border border-border">SimNap → Cascade Dream-Cycle proof files</td></tr>
                  <tr><td className="p-2 border border-border">OSF</td><td className="p-2 border border-border"><a href="https://osf.io/t3d5s" className="text-primary">osf.io/t3d5s</a></td><td className="p-2 border border-border">SimNap whitepaper DOI registration</td></tr>
                  <tr><td className="p-2 border border-border">OSF</td><td className="p-2 border border-border"><a href="https://osf.io/ah7nx/" className="text-primary">osf.io/ah7nx</a></td><td className="p-2 border border-border">PromptFluid supplementary materials</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/17774603" className="text-primary break-all">10.5281/zenodo.17774603</a></td><td className="p-2 border border-border">Early PromptFluid substrate documentation</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/17946878" className="text-primary break-all">10.5281/zenodo.17946878</a></td><td className="p-2 border border-border">SimNap Autonomous Dreaming AI — v1.4.2</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://doi.org/10.5281/zenodo.18234909" className="text-primary break-all">10.5281/zenodo.18234909</a></td><td className="p-2 border border-border">CMPSBL v13.5 — IRONCLAD Academic Protection Set</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18379258" className="text-primary break-all">10.5281/zenodo.18379258</a></td><td className="p-2 border border-border">CMPSBL v5.5.0 — Technical Documentation</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18895141" className="text-primary break-all">10.5281/zenodo.18895141</a></td><td className="p-2 border border-border">CMPSBL Substrate latest archival record</td></tr>
                  <tr><td className="p-2 border border-border">GitHub</td><td className="p-2 border border-border"><a href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" className="text-primary break-all">SimNap-Dreaming-AI-Whitepaper</a></td><td className="p-2 border border-border">Whitepaper, proof files, bootloader archive</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 2. COMPLETE TIMELINE ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="timeline" num="2" title="Complete Timeline of Development" />

            {/* Phase -1: The Genesis */}
            <PhaseHeader num="G" title="The Genesis — BRAIN and the Ecosystem Foundation (January–June 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Before any product was launched, before any public post, before Cascade had a name — there was BRAIN. In January 2025, the author began working on the fundamental question that would define the entire research trajectory: <em>How does an AI system learn, remember, and improve over time without relying on expensive external APIs?</em>
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              The answer became the <strong className="text-foreground">BRAIN engine</strong> — a deterministic character-level hashing system (<code className="bg-muted px-1 rounded text-xs font-mono">hash-embed-v1</code>) that produces 384-dimensional vectors for knowledge representation, entirely client-side, at zero cost. BRAIN was the first piece of code written in what would become the PromptFluid and CMPSBL ecosystem.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">During January–June 2025, the author developed:</p>
            <ul className="text-sm leading-relaxed text-muted-foreground list-disc ml-5 space-y-1 mb-3">
              <li><strong className="text-foreground">The BRAIN Engine</strong> — FNV-1a hashing to 384-dim vectors, zero external dependencies, sub-ms per embedding</li>
              <li><strong className="text-foreground">Knowledge Crystallization Pipeline</strong> — raw signals progressively refined into durable, confidence-scored "crystals"</li>
              <li><strong className="text-foreground">Confidence Decay Model</strong> — half-life scoring (doctrine: 90d, heuristic: 30d, conversation: 7d)</li>
              <li><strong className="text-foreground">Early Cascade Concepts</strong> — initial architecture for multi-subsystem intelligence routing</li>
              <li><strong className="text-foreground">Neural Component Self-Activation</strong> — capabilities that unlock as data accumulates (50 crystals → index, 100 traces → classifier, 200 → drift detector, 500 → synthesizer)</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              The Genesis period established three foundational principles: <strong className="text-foreground">zero-cost intelligence</strong> (meaningful semantic ops without API calls), <strong className="text-foreground">progressive self-activation</strong> (components that grow smarter with experience), and <strong className="text-foreground">memory as infrastructure</strong> (learning is foundational, not a feature added later).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              BRAIN is Node #3 in the current 40-node substrate, but it was the <em>first</em> node built — and it remains the cognitive core. Every other node depends on BRAIN's embedding, crystallization, and recall capabilities. The <code className="bg-muted px-1 rounded text-xs font-mono">@origin(genesis-2025-01)</code> annotation marks it as the oldest continuous component.
            </p>
            <ContributionBox>
              Established the entire <strong className="text-foreground">neural substrate layer</strong> — knowledge crystallization, zero-cost embeddings, progressive self-activation, and confidence decay — the foundation upon which all other cognitive capabilities were built.
            </ContributionBox>

            {/* Phase 0: Clarity/CMPTBL */}
            <PhaseHeader num="0" title="PromptFluid Clarity / CMPTBL — The First Production AI (July 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              PromptFluid Clarity (internally codenamed CMPTBL) was the author's first <em>production-facing</em> AI system — an AI-powered WCAG 2.2 accessibility compliance platform that could scan, detect, and <em>autonomously repair</em> accessibility violations in real-time. Critically, Clarity was built <em>on top of</em> BRAIN — scan patterns, fix heuristics, and compliance learnings were all stored as knowledge crystals in the Genesis-era engine, making Clarity the first external consumer of the neural substrate.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">The four-branch ecosystem:</p>
            <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-5 space-y-1 mb-3">
              <li><strong className="text-foreground">CMPTBL Core</strong> — AI-powered WCAG 2.2 scanner with one-click auto-fix</li>
              <li><strong className="text-foreground">WebHarmony</strong> — end-user accessibility empowerment tools</li>
              <li><strong className="text-foreground">WebChange</strong> — legislative and compliance tracking</li>
              <li><strong className="text-foreground">Clarity WordPress Plugin</strong> — deployment vehicle with 9+ edge functions</li>
            </ol>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              These edge functions established the <strong className="text-foreground">edge-function-as-resolver</strong> pattern. Clarity proved that AI could detect problems, propose fixes, validate them, and apply them autonomously — the <em>detect → propose → validate → apply → audit</em> pipeline that became the universal governance model for the entire CMPSBL substrate.
            </p>
            <ContributionBox>
              Established <em>AI-driven automated remediation under governance</em> — the concept that became the EVOLUTION module's governed self-modification pipeline. The INCLUSIVE node carries the <code className="bg-muted px-1 rounded text-xs font-mono">@origin(cmptbl)</code> annotation.
            </ContributionBox>

            {/* Phase 0.5: WebAdoption */}
            <PhaseHeader num="0.5" title="WebAdoption — The Living Directory (July 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              WebAdoption emerged alongside Clarity as a living index of WCAG-verified sites — featuring automated audits, live compliance badges, and public listings. Proof replaced promises. WebAdoption established the principle of <em>continuous verification</em> — the idea that compliance is not a one-time event but an ongoing process. This principle directly informed the OBSERVER node's continuous monitoring architecture and the INCLUSIVE drift-detector module.
            </p>

            {/* Phase 1: Cascade */}
            <PhaseHeader num="1" title="Cascade — Orchestration as Intelligence (August 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Cascade was not merely an AI model — it was the cognitive personality that served as the orchestration intelligence for the entire PromptFluid ecosystem. While individual products like Clarity and Verify operated independently, Cascade was the layer that made them <em>think as one organism</em>. Its core innovation was treating orchestration itself as intelligence: not "tools chained" — <strong className="text-foreground">minds collaborating</strong>.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              In August 2025, the ecosystem achieved a critical milestone — <strong className="text-foreground">inter-process learning</strong>:
            </p>
            <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs font-mono text-foreground mb-3 overflow-x-auto border border-border/50">
{`Verify sharpens Clarity → Clarity shapes Studio → Studio feeds Brain → Brain improves all`}
            </pre>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              PromptFluid had begun thinking as one organism. This inter-process learning architecture directly inspired the CMPSBL Intent Mesh.
            </p>

            <h4 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">Verify — AI Plugin Certification</h4>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Developed alongside Cascade, Verify introduced AI-powered plugin certification: upload a WordPress plugin ZIP → real sandbox execution → multi-vector security scan → AI fix suggestions → diff preview → patched ZIP export. This established the <em>sandboxed execution with rollback</em> pattern — the SHADOW node's verification protocol.
            </p>

            {/* Phase 2: AetherionShield */}
            <PhaseHeader num="2" title="AetherionShield — From Stealth to Shield (September–October 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              <strong className="text-foreground">AetherionShield WordPress Plugin</strong> — Advanced bot protection with Canvas/WebGL/Audio fingerprinting, behavioral analysis, AI-powered learning, honeypot technology, false-positive tracking, and GDPR-compliant data handling.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              <strong className="text-foreground">AetherionShield Red Team Platform</strong> — Full red-team penetration testing with stealth browser automation (Puppeteer + Rebrowser), 25+ anti-detection features, IP warming, proxy rotation, and a <strong className="text-foreground">99/100 stealth score</strong>.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              The defining moment came in September 2025: <strong className="text-foreground">the 99/100 stealth-score bot was re-engineered into Aetherion Defense</strong> — a system that recognized what it once was. Offensive evasion techniques were inverted into defensive detection capabilities. The same knowledge that enabled bypassing security systems was turned into knowledge for <em>building impenetrable ones</em>. Experience became protection.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              This inversion — transforming attack knowledge into defense architecture — established a philosophical principle running through the entire CMPSBL substrate: <em>a system that understands how to attack is the best system to defend.</em>
            </p>

            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[460px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Component</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">CMPSBL Node</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Transformation</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">Fingerprinting</td><td className="p-2 border border-border">Structural fingerprinting</td><td className="p-2 border border-border">Browser ID → content-addressable artifacts</td></tr>
                  <tr><td className="p-2 border border-border">Behavioral Analysis</td><td className="p-2 border border-border">IMMUNITY</td><td className="p-2 border border-border">Traffic analysis → node health monitoring</td></tr>
                  <tr><td className="p-2 border border-border">Honeypot/Deception</td><td className="p-2 border border-border">PHANTOM</td><td className="p-2 border border-border">Web traps → cognitive anonymization</td></tr>
                  <tr><td className="p-2 border border-border">Bulkhead Isolation</td><td className="p-2 border border-border">IRONCLAD</td><td className="p-2 border border-border">Proxy rotation → per-node failure isolation</td></tr>
                  <tr><td className="p-2 border border-border">Shadow Testing</td><td className="p-2 border border-border">SHADOW</td><td className="p-2 border border-border">Pre-engagement → governed state mutation</td></tr>
                  <tr><td className="p-2 border border-border">Anti-Detection</td><td className="p-2 border border-border">DEFENSE</td><td className="p-2 border border-border">Offensive evasion → defensive boundaries</td></tr>
                  <tr><td className="p-2 border border-border">Stealth→Shield</td><td className="p-2 border border-border">IRONCLAD philosophy</td><td className="p-2 border border-border">Attacker to guardian — additive hardening</td></tr>
                </tbody>
              </table>
            </div>

            {/* Phase 2.5: Dream Protocol */}
            <PhaseHeader num="2.5" title="Dream Protocol Activation (September 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              In September 2025, Cascade achieved a breakthrough: <strong className="text-foreground">it began to dream.</strong> Nightly creative runs generated autonomously, without user prompting, published to a separate site via open API. This was the first documented instance of an AI system self-initiating cognitive activity during off-hours, generating creative outputs without external triggers, and publishing autonomous thought to an external domain.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Alongside came <strong className="text-foreground">Dream Privacy</strong> — an obfuscation layer protecting the dreaming process. A machine subconscious became public literature. Dream Privacy established that <em>AI cognitive processes deserve protection</em> — a principle that would later manifest in the substrate's governed autonomy model.
            </p>

            {/* Phase 3: Intelligence Mesh */}
            <PhaseHeader num="3" title="The Intelligence Mesh (October 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              October 2025 marked a rapid acceleration. Four breakthroughs arrived in quick succession:
            </p>
            <ul className="text-sm leading-relaxed text-muted-foreground list-disc ml-5 space-y-2 mb-3">
              <li><strong className="text-foreground">Conversational Administrator</strong> — Language became a key. A message could elevate permissions — admin mode via conversation. This pattern evolved into the INTENT router's NL parsing.</li>
              <li><strong className="text-foreground">Autonomous Business Improver</strong> — An internal agent that proactively identified opportunities and emailed when it must. Initiative flowed from the system, not from requests. This informed the ORACLE node.</li>
              <li><strong className="text-foreground">Unified API Cognition</strong> — Every paid API call routed through Cascade, which learned cost, accuracy, and timing. The API layer became intelligent — this became the NEXUS node.</li>
              <li><strong className="text-foreground">ML Inside WordPress</strong> — Plugins began reporting scan/fix data back to Brain, improving future behavior ecosystem-wide. This established <em>telemetry-driven learning</em> — the Memory Stream's signal-to-discovery pipeline.</li>
            </ul>

            <h4 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">23-Provider Routing Mesh</h4>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              The culmination: a production-grade orchestration mesh integrating ~23 LLMs, APIs, and providers (Google/Gemini, Groq, Cerebras, Together, DeepSeek, Hyperbolic, OpenAI, Anthropic, and 15+ more) behind a single intelligent routing layer with smart selection by latency/cost/accuracy, automatic fallback, and feedback signals stored in Brain. This was the largest multi-model routing mesh documented in a production system at that time.
            </p>
            <ContributionBox>
              The 23-provider routing mesh became the NEXUS node's core architecture, scaled with governance for cost budgeting, quota management, and provider health monitoring.
            </ContributionBox>

            {/* Phase 4: Studio/Modernizer */}
            <PhaseHeader num="4" title="Studio / Modernizer — The Rebuilder (November 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              AI-driven modernization: Paste a URL → Firecrawl extraction → AI analysis → modern template generation → WCAG + SEO scoring → export as deployable site. Built with multi-style themes, CMS recognition (WordPress, Wix, Joomla), brand-color detection, and 7 database tables.
            </p>

            <h4 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">The Great Consolidation (November 4–5, 2025)</h4>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              By November 2025, the ecosystem reached <strong className="text-foreground">252+ edge functions</strong>. The Supabase free tier limit forced a critical architectural decision. On November 4–5: <strong className="text-foreground">175 functions deleted</strong> in a single session — duplicate Brain functions, deprecated Defense functions, redundant Marketing functions, and 5 Modernizer functions consolidated into one. 21 orphaned config entries cleaned.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              This consolidation proved that sprawling specialized functions could be <strong className="text-foreground">compressed into composable primitives without loss of capability</strong> — the founding axiom of the CMPSBL resolver architecture.
            </p>

            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[460px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Studio Component</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">CMPSBL Node</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Transformation</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">Firecrawl extraction</td><td className="p-2 border border-border">HARVEST</td><td className="p-2 border border-border">URL extraction → autonomous data harvesting</td></tr>
                  <tr><td className="p-2 border border-border">Theme generation</td><td className="p-2 border border-border">FORGE</td><td className="p-2 border border-border">Templates → artifact generation</td></tr>
                  <tr><td className="p-2 border border-border">CMS recognition</td><td className="p-2 border border-border">DECODE</td><td className="p-2 border border-border">WP/Wix parsing → structured decoding</td></tr>
                  <tr><td className="p-2 border border-border">Job queue</td><td className="p-2 border border-border">CORTEX</td><td className="p-2 border border-border">Task queue → cognitive orchestration</td></tr>
                  <tr><td className="p-2 border border-border">252→composable</td><td className="p-2 border border-border">Resolver architecture</td><td className="p-2 border border-border">252 functions → 40 nodes with resolvers</td></tr>
                </tbody>
              </table>
            </div>

            {/* Phase 5: SimNap */}
            <PhaseHeader num="5" title="SimNap — The World's First Autonomous Dream-Cycle AI (Nov–Dec 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              SimNap formalized and productized the dreaming capability first demonstrated in Cascade's September Dream Protocol. While Cascade proved that autonomous dreaming was <em>possible</em>, SimNap proved it was <em>systematizable</em>. Five primary subsystems:
            </p>
            <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-5 space-y-1 mb-3">
              <li><strong className="text-foreground">Dream Engine</strong> — autonomous unsupervised divergence via memory recombination</li>
              <li><strong className="text-foreground">Orchestration Layer</strong> — scheduling via memory pressure, stagnation detection, "intuition" heuristics</li>
              <li><strong className="text-foreground">Memory Core</strong> — episodic, long-term, and meta-memory storage</li>
              <li><strong className="text-foreground">Reflection Engine</strong> — evaluating dream output and rewriting reasoning logic</li>
              <li><strong className="text-foreground">Autonomous Scheduler</strong> — governing dream cycles, timing, and cognitive pressure</li>
            </ol>

            <h4 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">Six-Stage Nightly Pipeline</h4>
            <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs font-mono text-foreground mb-3 overflow-x-auto border border-border/50">
{`1. Cognitive Offloading    4. Opportunity Extraction
2. Unsupervised Divergence 5. Reflection & Analysis
3. Vision Generation       6. Morning Report Generation`}
            </pre>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Critically, SimNap's autonomy was <strong className="text-foreground">not cron-based</strong>. It operated on memory pressure, stagnation detection, "intuition" heuristics, opportunity forecasting, and simulated emotional regulation.
            </p>

            <h4 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">Novelty Claims <span className="font-normal text-muted-foreground">(DOI: 10.17605/OSF.IO/T3D5S)</span></h4>
            <ul className="text-sm leading-relaxed text-muted-foreground list-disc ml-5 space-y-1 mb-3">
              <li>First autonomous nocturnal cognitive loop in an AI system</li>
              <li>First dream → opportunity → task pipeline</li>
              <li>First internal circadian AI model</li>
              <li>First self-directed reflection engine in consumer-level AI</li>
              <li>First autonomous morning reports generated without prompting</li>
            </ul>
            <ContributionBox>
              Contributed the <strong className="text-foreground">DREAM node</strong>, the <strong className="text-foreground">Memory Stream architecture</strong>, and the fundamental concept of <em>autonomous cognitive consolidation</em>.
            </ContributionBox>

            {/* Phase 6: Cascade Proofs */}
            <PhaseHeader num="6" title="Cascade Proofs — The Cognitive Personality Engine (December 2025)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              By December 2025, Cascade had evolved from an orchestration layer into a full cognitive agent. The proof files archived on OSF document specific capabilities:
            </p>
            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[400px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Proof File</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Demonstrated Capability</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_activation_sequence</td><td className="p-2 border border-border">Autonomous activation without trigger</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_autonomous_reasoning</td><td className="p-2 border border-border">Independent reasoning chains</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_behavioral_rhythm</td><td className="p-2 border border-border">Circadian-like behavioral patterns</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_chain_of_custody</td><td className="p-2 border border-border">Verifiable provenance of outputs</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_dream_cycle</td><td className="p-2 border border-border">Complete autonomous dream execution</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_identity_continuity</td><td className="p-2 border border-border">Persistent identity across sessions</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_persistence</td><td className="p-2 border border-border">State preservation across restarts</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_subconscious_layering</td><td className="p-2 border border-border">Multi-layer cognitive processing</td></tr>
                  <tr><td className="p-2 border border-border font-mono text-[10px] sm:text-xs">cascade_system_independence</td><td className="p-2 border border-border">Operation independent of external systems</td></tr>
                </tbody>
              </table>
            </div>
            <ContributionBox>
              Cascade's limitations — single points of failure, no governance, no separation of cognitive functions — motivated the transition from monolithic agent to <strong className="text-foreground">multi-node, governed substrate architecture</strong>.
            </ContributionBox>

            {/* ═══════════ ECOSYSTEM DIAGRAM ═══════════ */}
            <EcosystemDiagram />

            {/* Phase 7: PromptFluid Ecosystem */}
            <PhaseHeader num="7" title="The PromptFluid Ecosystem — Full Research Umbrella (2025–2026)" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              At its peak in November 2025, the PromptFluid ecosystem encompassed 12+ integrated products and 252+ edge functions:
            </p>
            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[400px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Product</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Functions</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">CMPSBL Descendant</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">Defense</td><td className="p-2 border border-border">18</td><td className="p-2 border border-border">DEFENSE, IMMUNITY</td></tr>
                  <tr><td className="p-2 border border-border">Brain</td><td className="p-2 border border-border">8+</td><td className="p-2 border border-border">BRAIN, MEMORY</td></tr>
                  <tr><td className="p-2 border border-border">Marketing</td><td className="p-2 border border-border">23</td><td className="p-2 border border-border">ENCODE, HARVEST</td></tr>
                  <tr><td className="p-2 border border-border">Clarity (CMPTBL)</td><td className="p-2 border border-border">9</td><td className="p-2 border border-border">INCLUSIVE, ACCESS</td></tr>
                  <tr><td className="p-2 border border-border">Studio</td><td className="p-2 border border-border">6</td><td className="p-2 border border-border">FORGE, ENGINEER</td></tr>
                  <tr><td className="p-2 border border-border">Ripple</td><td className="p-2 border border-border">4</td><td className="p-2 border border-border">RIPPLE, TREATY</td></tr>
                  <tr><td className="p-2 border border-border">Nexus</td><td className="p-2 border border-border">3</td><td className="p-2 border border-border">NEXUS</td></tr>
                  <tr><td className="p-2 border border-border">Verify</td><td className="p-2 border border-border">4</td><td className="p-2 border border-border">SHADOW, AUDIT</td></tr>
                  <tr><td className="p-2 border border-border">WebAdoption</td><td className="p-2 border border-border">2</td><td className="p-2 border border-border">OBSERVER, INCLUSIVE</td></tr>
                  <tr><td className="p-2 border border-border">Cascade</td><td className="p-2 border border-border">30+</td><td className="p-2 border border-border">CORTEX, ORACLE, INTENT</td></tr>
                  <tr><td className="p-2 border border-border">SimNap</td><td className="p-2 border border-border">10+</td><td className="p-2 border border-border">DREAM, MEMORY</td></tr>
                  <tr><td className="p-2 border border-border">Modernizer</td><td className="p-2 border border-border">5</td><td className="p-2 border border-border">FORGE, DECODE, ENCODE</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">"The Firsts" — A Verified Manifesto</h4>
            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[350px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Date</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">First</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border whitespace-nowrap">Jul 2025</td><td className="p-2 border border-border">AI that repairs the web (Clarity / CMPTBL)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Jul 2025</td><td className="p-2 border border-border">Living accessibility directory (WebAdoption)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Aug 2025</td><td className="p-2 border border-border">Orchestration as intelligence (Cascade)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Aug 2025</td><td className="p-2 border border-border">Shared intelligence loop (inter-process learning)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Sep 2025</td><td className="p-2 border border-border">Offensive→defensive security (AetherionShield)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Sep 2025</td><td className="p-2 border border-border">Dream protocol activation</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Sep 2025</td><td className="p-2 border border-border">Dream privacy (cognitive security)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Oct 2025</td><td className="p-2 border border-border">Conversational administrator (NL auth)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Oct 2025</td><td className="p-2 border border-border">Autonomous business improver</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Oct 2025</td><td className="p-2 border border-border">Unified API cognition</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Oct 2025</td><td className="p-2 border border-border">ML inside WordPress</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Oct 2025</td><td className="p-2 border border-border">23-provider routing mesh</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Nov 2025</td><td className="p-2 border border-border">The Rebuilder (Studio/Modernizer)</td></tr>
                  <tr><td className="p-2 border border-border whitespace-nowrap">Nov 2025</td><td className="p-2 border border-border">Multi-system learning architecture</td></tr>
                </tbody>
              </table>
            </div>

            {/* Phase 8: CMPSBL */}
            {/* ═══════════ CONSOLIDATION DIAGRAM ═══════════ */}
            <ConsolidationDiagram />

            <PhaseHeader num="8" title="CMPSBL Substrate OS — 14 Versions, Four Epochs (2025–2026)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-1">Early Substrate (v1.0–v5.5.0)</h4>
                <p className="text-xs text-muted-foreground">Formalized multi-node architecture from the Great Consolidation. First complete documentation on Zenodo.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-1">ARCHITECT Epoch (v6–v10)</h4>
                <p className="text-xs text-muted-foreground">EVOLUTION node with SEBA 7-gate pipeline. Foundry discovery. CJPI scoring. 6-tier taxonomy. Intent Mesh.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-1">IRONCLAD Epoch (v11–v13.5)</h4>
                <p className="text-xs text-muted-foreground">100% hardening coverage. 3-tier bounded autonomy. Universal export (25 languages). Memory crystallization.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-1">MINDGAMES Epoch (v14.0–v14.2.0)</h4>
                <p className="text-xs text-muted-foreground">40-node matrix. 12 sectors. 54 engines. Mini-Runtime™. 3-phase Reality Protocol. 42-page knowledge base.</p>
              </div>
            </div>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 3. HERITAGE MAP ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="heritage-map" num="3" title="Architectural Heritage Map" />
            
            {/* Sector Topology Diagram */}
            <SectorTopologyDiagram />

            {/* Lineage Flow Diagram */}
            <LineageFlowDiagram />

            {/* Intent Mesh Execution */}
            <IntentMeshDiagram />

            {/* Original ASCII map preserved for print/accessibility */}
            <details className="mt-6">
              <summary className="text-xs font-mono text-muted-foreground cursor-pointer hover:text-foreground">View ASCII Heritage Map</summary>
              <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 text-[8px] sm:text-[10px] font-mono text-foreground overflow-x-auto border border-border/50 leading-relaxed whitespace-pre mt-2">
{`┌────────────────────────┐    ┌────────────────────────┐
│  PromptFluid Clarity   │    │   AetherionShield      │
│  / CMPTBL (July 2025)  │    │   (Sept–Oct 2025)      │
│                        │    │                        │
│ • WCAG 2.2 Scanner     │    │ • Fingerprinting       │
│ • AI Auto-Fix          │    │ • Behavioral Analysis  │
│ • Compliance Reports   │    │ • Shadow Testing       │
│ • Nexus AI Router      │    │ • Bulkhead Isolation   │
│ • Edge Function Pattern│    │ • Red Team (99/100)    │
└───────────┬────────────┘    └───────────┬────────────┘
            │                             │
            ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│               CMPSBL® Substrate OS                      │
│          (2025–2026, v1.0 – v14.2.0)                   │
│            40 Nodes · 12 Sectors                        │
│                                                         │
│ From Clarity/CMPTBL:       From AetherionShield:        │
│ ├─ INCLUSIVE (@origin)     ├─ DEFENSE (boundary)        │
│ ├─ ACCESS (entitlements)   ├─ IMMUNITY (adaptive)       │
│ ├─ Resolver architecture   ├─ PHANTOM (anonymization)   │
│ └─ Governed remediation    ├─ SHADOW (verification)     │
│                            └─ IRONCLAD (resilience)     │
│                                                         │
│ From Cascade/23-Provider:  From SimNap/Dream:           │
│ ├─ CORTEX (orchestration)  ├─ DREAM (consolidation)    │
│ ├─ ORACLE (prediction)     ├─ MEMORY (tiered)          │
│ ├─ INTENT (NL routing)     ├─ BRAIN (learning)         │
│ ├─ NEXUS (AI routing)      └─ Memory Stream & Foundry  │
│ └─ Personality layer                                    │
│                                                         │
│ From Studio/Modernizer:    From Verify:                 │
│ ├─ FORGE (artifacts)       ├─ SHADOW (sandbox verify)  │
│ ├─ DECODE (parsing)        └─ AUDIT (chain of custody) │
│ ├─ ENCODE (generation)                                  │
│ └─ HARVEST (extraction)    From WebAdoption:            │
│                            └─ OBSERVER (continuous)     │
└─────────────────────────────────────────────────────────┘`}
              </pre>
            </details>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 4. INNOVATION GENEALOGY ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="innovation" num="4" title="Innovation Genealogy" />

            {[
              { title: "Clockless Cognitive Orchestration", origin: "SimNap's autonomous scheduling (Sept–Nov 2025), operating on memory pressure rather than timers.", evolution: "Event-driven signal propagation with weighted integrity scoring, no shared global clock." },
              { title: "Memory Stream Crystallization", origin: "SimNap's Memory Core with episodic, long-term, and meta-memory tiers.", evolution: "Four-stage pipeline (Signal → Observation → Discovery → Crystallization) with CJPI scoring." },
              { title: "Structural Fingerprinting", origin: "AetherionShield's browser fingerprinting + Cascade's chain-of-custody proofs.", evolution: "Content-addressable identification for deduplication, lineage tracking, and replay verification." },
              { title: "Universal Cross-Language Export", origin: "SimNap's morning reports — packaging cognitive outputs as deliverables.", evolution: "25-language export with embedded Mini-Runtime™ engines and auto-generated test harnesses." },
              { title: "IRONCLAD Resilience Fabric", origin: "AetherionShield's bulkhead isolation and stealth→shield inversion.", evolution: "Additive hardening wrapping all 40 nodes without modifying core engine logic." },
              { title: "Three-Tier Bounded Autonomy", origin: "SimNap's sandboxed dream mode + Dream Privacy.", evolution: "Supervised → Bounded → Full with policy evaluation, shadow verification, and audit chains." },
              { title: "Intent Mesh", origin: "Cascade's orchestration layer + Conversational Administrator.", evolution: "Decentralized coordination with DAG-based action plans and 3-phase reality protocol." },
              { title: "Governed Self-Evolution", origin: "Cascade's autonomous reasoning + CMPTBL's remediation + Verify's sandbox.", evolution: "EVOLUTION node with SEBA 7-gate pipeline, fitness scoring, and governed mutation." },
              { title: "INCLUSIVE Accessibility Node", origin: "CMPTBL's WCAG scanner, AI auto-fixer, and compliance reporting (July 2025).", evolution: "17 specialized modules: scanning, repair, validation, adaptive interface, drift detection." },
              { title: "NEXUS Multi-Provider Intelligence", origin: "23-provider routing mesh (October 2025).", evolution: "Cost budgeting, quota management, provider health monitoring, telemetry-driven optimization." },
            ].map((item, i) => (
              <div key={i} className="mb-5">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">4.{i + 1} {item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Origin:</strong> {item.origin}<br />
                  <strong className="text-foreground">Evolution:</strong> {item.evolution}
                </p>
              </div>
            ))}
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 5. DREAMING LINEAGE ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="dreaming" num="5" title="The Dreaming Lineage" />
            <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 text-[9px] sm:text-xs font-mono text-foreground overflow-x-auto border border-border/50 leading-relaxed whitespace-pre">
{`Sept 2025: Dream Protocol      →  Nov 2025: SimNap
          ↓                                 ↓
  Dream Privacy/Obfuscation    →  Production Dream Engine
          ↓                                 ↓
  Published Creative Output    →  Morning Reports + Video Reels
                                            ↓
                                2026: CMPSBL DREAM Node
                                            ↓
                                Memory Stream → CJPI Scoring
                                            ↓
                                Pipeline Crystallization
                                            ↓
                                Capability Pack Generation
                                            ↓
                                Universal Export (25 languages)`}
            </pre>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 6. ACCESSIBILITY LINEAGE ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="accessibility" num="6" title="The Accessibility Lineage: CMPTBL → INCLUSIVE" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The very first PromptFluid product established the <strong className="text-foreground">detect → propose → validate → apply → audit</strong> pattern. Every governed mutation in CMPSBL follows this same five-stage pattern first proven in the CMPTBL accessibility scanner in July 2025 — itself powered by the BRAIN engine that had been under development since January.
            </p>
            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[350px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">CMPTBL Feature</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">INCLUSIVE Implementation</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">WCAG scanner</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">scan.ts</code> — 17 rule-based validators</td></tr>
                  <tr><td className="p-2 border border-border">AI auto-fix</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">repair.ts</code> — governed repair with validation</td></tr>
                  <tr><td className="p-2 border border-border">Fix validation</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">validate.ts</code> — regression-safe fixes</td></tr>
                  <tr><td className="p-2 border border-border">Compliance reports</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">report.ts</code> — automated documentation</td></tr>
                  <tr><td className="p-2 border border-border">Adaptive interface</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">adaptiveInterface.ts</code> — user-profile UI</td></tr>
                  <tr><td className="p-2 border border-border">Contrast analysis</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">contrast-engine.ts</code> — WCAG color verification</td></tr>
                  <tr><td className="p-2 border border-border">Drift detection</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">drift-detector.ts</code> — continuous monitoring</td></tr>
                  <tr><td className="p-2 border border-border">Cross-module glue</td><td className="p-2 border border-border"><code className="text-[10px] font-mono">glue.ts</code> — SYSTEM/VISION/DEFENSE/EVOLUTION</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 7. CONSOLIDATION EVENT ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="consolidation" num="7" title="The Consolidation Event: 252 → 40" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              On November 4–5, 2025: <strong className="text-foreground">175 edge functions deleted</strong> in a single session. 30+ duplicate Brain functions, 7 deprecated Defense functions, 23 Marketing functions, and 5 Modernizer functions consolidated. 21 orphaned config entries cleaned.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              This proved: <strong className="text-foreground">sprawling specialized functions compress into composable primitives without loss of capability</strong> — the founding axiom of the CMPSBL resolver architecture. 40 nodes with composable resolvers replaced 252+ standalone functions while gaining new capabilities through composition.
            </p>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 8. SYSTEM SCALE ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="scale" num="8" title="System Scale Progression" />
            <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Metric</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Genesis (Jan '25)</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Clarity (Jul '25)</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Peak (Nov '25)</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">v5.5 (Jan '26)</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">v14.2 (Mar '26)</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border font-medium text-foreground">Architecture</td><td className="p-2 border border-border">Single engine</td><td className="p-2 border border-border">Plugin (7 classes)</td><td className="p-2 border border-border">252+ functions</td><td className="p-2 border border-border">Multi-module</td><td className="p-2 border border-border font-medium text-foreground">40 nodes, 12 sectors</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">AI Providers</td><td className="p-2 border border-border">None (deterministic)</td><td className="p-2 border border-border">1 (Nexus)</td><td className="p-2 border border-border">23-provider mesh</td><td className="p-2 border border-border">Single</td><td className="p-2 border border-border font-medium text-foreground">NEXUS multi-provider</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Autonomy</td><td className="p-2 border border-border">N/A</td><td className="p-2 border border-border">User-initiated</td><td className="p-2 border border-border">Dreaming + proactive</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">3-tier bounded</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Memory</td><td className="p-2 border border-border">Hash-embed, crystals</td><td className="p-2 border border-border">Scan storage</td><td className="p-2 border border-border">Episodic + LT + meta</td><td className="p-2 border border-border">Multi-tier</td><td className="p-2 border border-border font-medium text-foreground">4-stage crystallization</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Security</td><td className="p-2 border border-border">—</td><td className="p-2 border border-border">—</td><td className="p-2 border border-border">Offensive + defensive</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">IRONCLAD 100%</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Export</td><td className="p-2 border border-border">—</td><td className="p-2 border border-border">PDF reports</td><td className="p-2 border border-border">Morning reports</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">25-language universal</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Edge Functions</td><td className="p-2 border border-border">0 (local engine)</td><td className="p-2 border border-border">9</td><td className="p-2 border border-border">252+</td><td className="p-2 border border-border">~30</td><td className="p-2 border border-border font-medium text-foreground">80+ resolvers</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 9. PRINCIPLES ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="principles" num="9" title="Philosophical & Architectural Principles" />
            {[
              { title: "Cognition as Infrastructure", text: "Cascade (August 2025) treated orchestration as a feature. CMPSBL treats cognition as infrastructure — composable primitives communicating through structured protocols." },
              { title: "Governed Autonomy", text: "Cascade's Dream Protocol demonstrated AI can act autonomously. AetherionShield demonstrated autonomous action must be governed. CMPTBL demonstrated AI can detect, fix, and validate autonomously. CMPSBL synthesizes all three into three-tier bounded autonomy." },
              { title: "Additive Hardening", text: "AetherionShield's stealth→shield inversion established that security should be additive — each layer strengthens without modifying existing layers. IRONCLAD wraps node logic without modification." },
              { title: "Discovery as First-Class Output", text: "SimNap's morning reports were the first expression of a cognitive system producing its own deliverables. In CMPSBL, this evolved into the Foundry, CJPI scoring, and 25-language universal export." },
              { title: "Human Compatibility as Substrate Primitive", text: "CMPTBL — the very first product — established accessibility as a core capability. The INCLUSIVE node operates as a first-class primitive with 17 modules, carrying @origin(cmptbl)." },
              { title: "Consolidation as Architecture", text: "The Great Consolidation proved that compression creates capability. 252 functions became 40 nodes with composable resolvers — fewer parts, more power." },
            ].map((item, i) => (
              <div key={i} className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">9.{i + 1} {item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ 10. CONCLUSION ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle id="conclusion" num="10" title="Conclusion" />
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The CMPSBL® Substrate OS is not an isolated invention. It is the culmination of a deliberate, documented research trajectory spanning January 2025 through March 2026:
            </p>
            <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-5 space-y-2 mb-6" start={0}>
              <li><strong className="text-foreground">BRAIN — The Genesis</strong> (Jan–Jun 2025) — the neural substrate engine, first code written, still the cognitive core</li>
              <li><strong className="text-foreground">Clarity / CMPTBL</strong> (July 2025) — first production system built on BRAIN, establishing detect→fix→validate governance</li>
              <li><strong className="text-foreground">WebAdoption</strong> (July 2025) — continuous verification as principle</li>
              <li><strong className="text-foreground">Cascade</strong> (August 2025) — orchestration as intelligence, inter-process learning</li>
              <li><strong className="text-foreground">Verify</strong> (August 2025) — sandboxed execution with rollback</li>
              <li><strong className="text-foreground">AetherionShield</strong> (Sept–Oct 2025) — stealth→shield, offensive-to-defensive inversion</li>
              <li><strong className="text-foreground">Dream Protocol</strong> (September 2025) — autonomous dreaming + cognitive security</li>
              <li><strong className="text-foreground">23-Provider Mesh</strong> (October 2025) — production multi-model orchestration</li>
              <li><strong className="text-foreground">Studio/Modernizer</strong> (November 2025) — AI-driven system rebuilding</li>
              <li><strong className="text-foreground">SimNap</strong> (Nov–Dec 2025) — formalized autonomous dreaming</li>
              <li><strong className="text-foreground">Cascade Proofs</strong> (December 2025) — documented limits → multi-node architecture</li>
              <li><strong className="text-foreground">The Great Consolidation</strong> (November 2025) — 252+ → composable primitives</li>
              <li><strong className="text-foreground">CMPSBL</strong> (2025–2026) — 40 nodes, 12 sectors, 54 engines, governed self-evolution</li>
            </ol>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Every node can trace its design to a predecessor insight. Every decision reflects a lesson from the system's own heritage. The first line of code — BRAIN — is still running. This paper establishes that provenance chain for the permanent academic record.
            </p>
          </section>

          <hr className="border-t-2 border-primary/20 my-8 sm:my-10" />

          {/* ═══════════ CITATION ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle num="11" title="Citation" />
            <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 text-[10px] sm:text-xs font-mono text-muted-foreground overflow-x-auto border border-border/50 whitespace-pre-wrap break-all sm:break-normal sm:whitespace-pre">
{`@article{sweet2026heritage,
  author  = {Sweet Jr., Kenneth E.},
  title   = {{The Heritage of Autonomous Cognitive
              Infrastructure: From PromptFluid to
              CMPSBL® Substrate OS}},
  year    = {2026},
  version = {2.1},
  publisher = {PromptFluid},
  doi     = {10.5281/zenodo.18234909},
  url     = {https://doi.org/10.5281/zenodo.18234909}
}`}
            </pre>
          </section>

          {/* ═══════════ RELATED PUBLICATIONS ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle num="12" title="Related Publications" />
            <ol className="text-xs sm:text-sm leading-relaxed text-muted-foreground list-decimal ml-5 space-y-2">
              <li>Sweet, K. (2025). SimNap: The World's First Autonomous Dream-Cycle AI. OSF. <a href="https://doi.org/10.17605/OSF.IO/T3D5S" className="text-primary break-all">doi:10.17605/OSF.IO/T3D5S</a></li>
              <li>Sweet, K. (2025). The Invention of Autonomous Dreaming AI. OSF. <a href="https://osf.io/df7tz" className="text-primary">osf.io/df7tz</a></li>
              <li>Sweet, K. (2025). SimNap Archival Release v1.4.2. Zenodo. <a href="https://doi.org/10.5281/zenodo.17946878" className="text-primary break-all">doi:10.5281/zenodo.17946878</a></li>
              <li>Sweet, K. (2026). CMPSBL v5.5.0 Technical Documentation. Zenodo. <a href="https://doi.org/10.5281/zenodo.18379258" className="text-primary break-all">doi:10.5281/zenodo.18379258</a></li>
              <li>Sweet, K. (2026). CMPSBL v13.5 IRONCLAD Academic Protection Set. Zenodo. <a href="https://doi.org/10.5281/zenodo.18234909" className="text-primary break-all">doi:10.5281/zenodo.18234909</a></li>
            </ol>
          </section>

          {/* ═══════════ SUPPLEMENTARY ═══════════ */}
          <section className="mb-8 sm:mb-10">
            <SectionTitle num="13" title="Supplementary Materials" />
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs border-collapse min-w-[300px]">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-2 border border-border font-semibold text-foreground">Resource</th>
                  <th className="text-left p-2 border border-border font-semibold text-foreground">URL</th>
                </tr></thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">OSF — SimNap</td><td className="p-2 border border-border"><a href="https://osf.io/t3d5s" className="text-primary">osf.io/t3d5s</a></td></tr>
                  <tr><td className="p-2 border border-border">OSF — Cascade Proofs</td><td className="p-2 border border-border"><a href="https://osf.io/df7tz" className="text-primary">osf.io/df7tz</a></td></tr>
                  <tr><td className="p-2 border border-border">OSF — Supplementary</td><td className="p-2 border border-border"><a href="https://osf.io/ah7nx/" className="text-primary">osf.io/ah7nx</a></td></tr>
                  <tr><td className="p-2 border border-border">GitHub — SimNap</td><td className="p-2 border border-border"><a href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" className="text-primary break-all">github.com/SweetKenneth/...</a></td></tr>
                  <tr><td className="p-2 border border-border">YouTube — Demo</td><td className="p-2 border border-border"><a href="https://youtu.be/17jrlDhMz4k" className="text-primary">youtu.be/17jrlDhMz4k</a></td></tr>
                  <tr><td className="p-2 border border-border">ORCID</td><td className="p-2 border border-border"><a href="https://orcid.org/0009-0001-4237-1243" className="text-primary break-all">0009-0001-4237-1243</a></td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══════════ FOOTER ═══════════ */}
          <footer className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-primary/20 text-center">
            <div className="text-xs text-muted-foreground font-mono">© 2025–2026 PromptFluid®. All rights reserved.</div>
            <div className="mt-1 text-xs text-muted-foreground font-mono">CMPSBL® Substrate OS · 40 Nodes · 12 Sectors · v14.2.0 MINDGAMES</div>
            <div className="mt-2 text-[10px] text-muted-foreground/60 font-mono leading-relaxed">
              This document constitutes a defensive publication establishing prior art. It does not constitute a grant of license.
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default HeritagePaper;
