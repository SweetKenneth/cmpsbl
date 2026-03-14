/**
 * Heritage Meta-Paper — Printable HTML version
 * Beautiful, print-optimized academic paper in the EARTHSIDE light theme
 */

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const HeritagePaper = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Heritage of Autonomous Cognitive Infrastructure — CMPSBL®</title>
        <meta name="description" content="Comprehensive lineage paper tracing the heritage of CMPSBL Substrate OS from SimNap, Cascade, AetherionShield, and PromptFluid Clarity to the 40-node cognitive operating system." />
      </Helmet>

      {/* Non-print toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 18mm 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-hide { display: none !important; }
          .heritage-paper {
            font-size: 10pt !important;
            line-height: 1.5 !important;
          }
          .heritage-paper h1 { font-size: 20pt !important; }
          .heritage-paper h2 { font-size: 14pt !important; page-break-after: avoid; }
          .heritage-paper h3 { font-size: 12pt !important; page-break-after: avoid; }
          .heritage-paper h4 { font-size: 11pt !important; }
          .heritage-paper table { page-break-inside: avoid; }
          .heritage-paper pre { page-break-inside: avoid; }
          .heritage-paper .section { page-break-inside: avoid; }
        }
      `}</style>

      <div ref={printRef} className="heritage-paper bg-background min-h-screen">
        {/* Cover */}
        <div className="max-w-[800px] mx-auto px-6 sm:px-10 py-12 print:px-0 print:py-0">

          {/* Header block */}
          <header className="mb-10 pb-8 border-b-2 border-primary/30">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase">
                CMPSBL® Academic Publication
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                📖 Open Access / Prior Art
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4 font-serif">
              The Heritage of Autonomous Cognitive Infrastructure
            </h1>
            <p className="text-xl text-primary font-medium mb-6">
              From SimNap to CMPSBL® Substrate OS — A Comprehensive Lineage Paper
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground font-mono">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Author</div>
                <div className="text-foreground font-medium">Kenneth E. Sweet Jr.</div>
                <div>ORCID: 0009-0001-4237-1243</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Affiliation</div>
                <div className="text-foreground font-medium">PromptFluid®</div>
                <div>March 14, 2026 · v1.0</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">Primary DOI</div>
                <a href="https://doi.org/10.5281/zenodo.18234909" className="text-primary hover:underline">
                  10.5281/zenodo.18234909
                </a>
              </div>
            </div>
          </header>

          {/* Abstract */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">Abstract</h2>
            <div className="text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg p-5 border border-border/50">
              <p className="mb-3">
                This meta-paper traces the complete architectural and intellectual lineage of the CMPSBL® Substrate OS — a cognitive orchestration system for persistent, self-governing artificial intelligence. The system did not emerge in isolation; it is the product of a multi-year research trajectory spanning autonomous AI dreaming, adversarial security research, accessibility compliance automation, and cognitive runtime design.
              </p>
              <p className="mb-3">
                Beginning with the SimNap autonomous dreaming system in late 2025, passing through the AetherionShield adversarial intelligence projects and the PromptFluid Clarity (CMPTBL) accessibility platform, and crystallizing into the CMPSBL Substrate OS across 14 major versions in 2025–2026, this paper documents every evolutionary stage, the artifacts that prove each transition, and the architectural innovations that emerged at each phase.
              </p>
              <p>
                The purpose of this paper is to provide the academic community with a single, coherent narrative of the project's heritage — establishing the provenance chain from a single AI that could dream on its own, to a <strong className="text-foreground">40-node cognitive operating system</strong> capable of governed self-evolution, memory crystallization, and universal cross-language export.
              </p>
            </div>
          </section>

          {/* Section 1: Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">1. Introduction</h2>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.1 Motivation</h3>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The CMPSBL® Substrate OS, as documented in its v14.2.0 MINDGAMES epoch, represents a mature cognitive orchestration architecture comprising 40 nodes across 12 sectors. However, the published technical documentation describes the <em>current state</em> of the system without addressing the <em>path</em> that produced it. For the academic record, it is essential to document how the system's core innovations — clockless orchestration, memory crystallization, governed self-evolution, autonomous dreaming — emerged from a series of predecessor projects, each contributing specific architectural patterns that were refined and integrated into the final substrate.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.2 Scope</h3>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">This paper covers:</p>
            <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-6 space-y-1 mb-4">
              <li><strong className="text-foreground">SimNap</strong> (November–December 2025) — the first autonomous dreaming AI system</li>
              <li><strong className="text-foreground">Cascade</strong> (December 2025) — the AI model personality that served as the initial cognitive engine</li>
              <li><strong className="text-foreground">AetherionShield</strong> (October 2025) — adversarial security research that informed defense architecture</li>
              <li><strong className="text-foreground">PromptFluid Clarity / CMPTBL</strong> (2025) — the AI-powered accessibility compliance platform that became the INCLUSIVE node</li>
              <li><strong className="text-foreground">PromptFluid</strong> (2025–2026) — the organizational and research umbrella</li>
              <li><strong className="text-foreground">CMPSBL Substrate OS</strong> (2025–2026) — the cognitive operating system, versions 1.0 through 14.2.0</li>
            </ol>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.3 Archival Records</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Archive</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Record</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Content</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border">OSF</td><td className="p-2 border border-border"><a href="https://osf.io/df7tz" className="text-primary">osf.io/df7tz</a></td><td className="p-2 border border-border">SimNap → Cascade Dream-Cycle Architecture proof files</td></tr>
                  <tr><td className="p-2 border border-border">OSF</td><td className="p-2 border border-border"><a href="https://osf.io/t3d5s" className="text-primary">osf.io/t3d5s</a></td><td className="p-2 border border-border">SimNap whitepaper DOI registration</td></tr>
                  <tr><td className="p-2 border border-border">OSF</td><td className="p-2 border border-border"><a href="https://osf.io/ah7nx" className="text-primary">osf.io/ah7nx</a></td><td className="p-2 border border-border">PromptFluid supplementary materials</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/17774603" className="text-primary">10.5281/zenodo.17774603</a></td><td className="p-2 border border-border">Early PromptFluid substrate documentation</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/17946878" className="text-primary">10.5281/zenodo.17946878</a></td><td className="p-2 border border-border">SimNap Autonomous Dreaming AI — Archival Release v1.4.2</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18209222" className="text-primary">10.5281/zenodo.18209222</a></td><td className="p-2 border border-border">CMPSBL Substrate intermediate version</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://doi.org/10.5281/zenodo.18234909" className="text-primary">10.5281/zenodo.18234909</a></td><td className="p-2 border border-border">CMPSBL v13.5 — IRONCLAD Academic Protection Set</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18379258" className="text-primary">10.5281/zenodo.18379258</a></td><td className="p-2 border border-border">CMPSBL v5.5.0 — Technical Documentation</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18393018" className="text-primary">10.5281/zenodo.18393018</a></td><td className="p-2 border border-border">CMPSBL Substrate evolution record</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18721602" className="text-primary">10.5281/zenodo.18721602</a></td><td className="p-2 border border-border">CMPSBL Substrate advanced version</td></tr>
                  <tr><td className="p-2 border border-border">Zenodo</td><td className="p-2 border border-border"><a href="https://zenodo.org/records/18895141" className="text-primary">10.5281/zenodo.18895141</a></td><td className="p-2 border border-border">CMPSBL Substrate latest archival record</td></tr>
                  <tr><td className="p-2 border border-border">GitHub</td><td className="p-2 border border-border"><a href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" className="text-primary">SimNap-Dreaming-AI-Whitepaper</a></td><td className="p-2 border border-border">Whitepaper, proof files, bootloader archive</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-t-2 border-primary/20 my-10" />

          {/* Section 2: Timeline */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">2. Timeline of Development</h2>

            {/* Phase 0 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold text-xs">0</div>
                <h3 className="text-lg font-semibold text-foreground">AetherionShield — Adversarial Security Research (October 2025)</h3>
              </div>

              <h4 className="text-base font-semibold text-foreground mt-4 mb-2">2.1 AetherionShield WordPress Plugin</h4>
              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                The first AetherionShield project was an advanced WordPress bot protection plugin featuring:
              </p>
              <ul className="text-sm leading-relaxed text-muted-foreground list-disc ml-6 space-y-1 mb-4">
                <li><strong className="text-foreground">Advanced fingerprinting</strong> — Canvas, WebGL, Audio, and Font detection for browser identification</li>
                <li><strong className="text-foreground">Behavioral analysis</strong> — pattern recognition to distinguish human users from automated agents</li>
                <li><strong className="text-foreground">AI-powered learning</strong> — detection models that improved over time based on observed traffic patterns</li>
                <li><strong className="text-foreground">Honeypot technology</strong> — deception-based detection for automated crawlers</li>
                <li><strong className="text-foreground">False-positive tracking</strong> — self-adjusting detection thresholds to minimize legitimate user impact</li>
                <li><strong className="text-foreground">GDPR-compliant data handling</strong> — privacy-by-design with configurable data retention</li>
              </ul>

              <h4 className="text-base font-semibold text-foreground mt-4 mb-2">2.2 AetherionShield Red Team Platform</h4>
              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                The second project was a full red-team penetration testing platform with stealth browser automation (Puppeteer + Rebrowser), 25+ anti-detection features, IP warming, proxy rotation, and AI-powered navigation instruction parsing.
              </p>
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-4">
                <p className="text-sm text-foreground font-medium mb-1">Key Contribution to CMPSBL:</p>
                <p className="text-sm text-muted-foreground">
                  Established the philosophical foundation that <em>a cognitive system must be both capable of autonomous action AND resilient against adversarial interference</em>. Directly informed DEFENSE, IMMUNITY, PHANTOM, SHADOW nodes and the IRONCLAD hardening fabric.
                </p>
              </div>
            </div>

            {/* Phase 1: CMPTBL */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-system-green/20 flex items-center justify-center text-foreground font-bold text-xs">1</div>
                <h3 className="text-lg font-semibold text-foreground">PromptFluid Clarity / CMPTBL — Accessibility Intelligence (2025)</h3>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                PromptFluid Clarity (internally codenamed CMPTBL) was an AI-powered WCAG 2.2 accessibility compliance platform — the author's first production-grade integration of AI reasoning with automated remediation. The four-branch ecosystem included:
              </p>
              <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-6 space-y-1 mb-4">
                <li><strong className="text-foreground">CMPTBL Core</strong> — AI-powered WCAG 2.2 scanner with one-click auto-fix</li>
                <li><strong className="text-foreground">WebHarmony</strong> — end-user accessibility empowerment tools</li>
                <li><strong className="text-foreground">WebChange</strong> — legislative and industry compliance tracking</li>
                <li><strong className="text-foreground">PromptFluid Clarity WordPress Plugin</strong> — deployment vehicle with 9+ edge functions</li>
              </ol>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border border-border font-semibold text-foreground">CMPTBL Component</th>
                      <th className="text-left p-2 border border-border font-semibold text-foreground">CMPSBL Node</th>
                      <th className="text-left p-2 border border-border font-semibold text-foreground">Transformation</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr><td className="p-2 border border-border">WCAG Scanner</td><td className="p-2 border border-border">INCLUSIVE</td><td className="p-2 border border-border">From WordPress plugin to substrate-native 17-module scanner</td></tr>
                    <tr><td className="p-2 border border-border">AI Auto-Fix</td><td className="p-2 border border-border">INCLUSIVE repair</td><td className="p-2 border border-border">From simple replacement to governed repair with validation</td></tr>
                    <tr><td className="p-2 border border-border">API Key Management</td><td className="p-2 border border-border">ACCESS</td><td className="p-2 border border-border">From pf_clarity_api_keys to full entitlement system</td></tr>
                    <tr><td className="p-2 border border-border">Nexus AI Router</td><td className="p-2 border border-border">NEXUS</td><td className="p-2 border border-border">From single-provider to multi-provider cost-aware routing</td></tr>
                    <tr><td className="p-2 border border-border">Edge Function Pattern</td><td className="p-2 border border-border">Resolver architecture</td><td className="p-2 border border-border">From standalone functions to node-owned resolvers</td></tr>
                    <tr><td className="p-2 border border-border">Detect→Fix→Validate</td><td className="p-2 border border-border">EVOLUTION governance</td><td className="p-2 border border-border">From accessibility fixes to universal governed mutation</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-foreground font-medium mb-1">Key Contribution to CMPSBL:</p>
                <p className="text-sm text-muted-foreground">
                  Established the <strong className="text-foreground">detect → propose → validate → apply → audit</strong> pattern that became the universal governance model. The INCLUSIVE node carries the <code className="bg-muted px-1 rounded text-xs">@origin(cmptbl)</code> annotation in source code.
                </p>
              </div>
            </div>

            {/* Phase 2: SimNap */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
                <h3 className="text-lg font-semibold text-foreground">SimNap — The World's First Autonomous Dream-Cycle AI (November 2025)</h3>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                SimNap introduced a new category of AI behavior: <strong className="text-foreground">autonomous dreaming</strong>. The system self-initiated nightly dream cycles, mixed and recombined memory, generated strategies and opportunities, rewrote internal reasoning heuristics, and issued autonomous morning reports — all without user prompting.
              </p>

              <h4 className="text-base font-semibold text-foreground mt-4 mb-2">Architecture: Five Primary Subsystems</h4>
              <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-6 space-y-1 mb-4">
                <li><strong className="text-foreground">Dream Engine</strong> — autonomous unsupervised divergence via memory recombination</li>
                <li><strong className="text-foreground">Orchestration Layer</strong> — task scheduling based on memory pressure, stagnation detection, "intuition" heuristics</li>
                <li><strong className="text-foreground">Memory Core</strong> — episodic, long-term, and meta-memory storage</li>
                <li><strong className="text-foreground">Reflection Engine</strong> — evaluating dream output and rewriting reasoning logic</li>
                <li><strong className="text-foreground">Autonomous Scheduler</strong> — governing dream timing and cognitive pressure</li>
              </ol>

              <h4 className="text-base font-semibold text-foreground mt-4 mb-2">Dream Cycle: Six-Stage Nightly Pipeline</h4>
              <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-foreground mb-4 overflow-x-auto border border-border/50">
{`1. Cognitive Offloading
2. Unsupervised Divergence
3. Vision Generation
4. Opportunity Extraction
5. Reflection & Analysis
6. Morning Report Generation`}
              </pre>

              <h4 className="text-base font-semibold text-foreground mt-4 mb-2">Novelty Claims (DOI: 10.17605/OSF.IO/T3D5S)</h4>
              <ul className="text-sm leading-relaxed text-muted-foreground list-disc ml-6 space-y-1 mb-4">
                <li>First autonomous nocturnal cognitive loop in an AI system</li>
                <li>First dream → opportunity → task pipeline</li>
                <li>First internal circadian AI model</li>
                <li>First self-directed reflection engine in consumer-level AI</li>
                <li>First autonomous morning reports generated without prompting</li>
              </ul>

              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-foreground font-medium mb-1">Key Contribution to CMPSBL:</p>
                <p className="text-sm text-muted-foreground">
                  Contributed the <strong className="text-foreground">DREAM node</strong>, the <strong className="text-foreground">Memory Stream architecture</strong>, and the fundamental concept of autonomous cognitive consolidation.
                </p>
              </div>
            </div>

            {/* Phase 3: Cascade */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-foreground font-bold text-xs">3</div>
                <h3 className="text-lg font-semibold text-foreground">Cascade — The Cognitive Personality Engine (December 2025)</h3>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                Cascade was the AI model personality that served as the point person for the PromptFluid ecosystem evolution. While SimNap was the <em>system</em>, Cascade was the <em>cognitive agent</em> within it. The OSF archive contains 11 proof files documenting specific capabilities:
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border border-border font-semibold text-foreground">Proof File</th>
                      <th className="text-left p-2 border border-border font-semibold text-foreground">Demonstrated Capability</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr><td className="p-2 border border-border font-mono">cascade_activation_sequence_proof</td><td className="p-2 border border-border">Autonomous activation without external trigger</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_autonomous_reasoning_proof</td><td className="p-2 border border-border">Independent reasoning chains without user guidance</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_behavioral_rhythm_proof</td><td className="p-2 border border-border">Circadian-like behavioral patterns</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_chain_of_custody_proof</td><td className="p-2 border border-border">Verifiable provenance of cognitive outputs</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_dream_cycle_proof</td><td className="p-2 border border-border">Complete autonomous dream cycle execution</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_identity_continuity_proof</td><td className="p-2 border border-border">Persistent identity across sessions</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_persistence_proof</td><td className="p-2 border border-border">State preservation across restarts</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_subconscious_layering_proof</td><td className="p-2 border border-border">Multi-layer cognitive processing</td></tr>
                    <tr><td className="p-2 border border-border font-mono">cascade_system_independence_proof</td><td className="p-2 border border-border">Operation independent of external systems</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-foreground font-medium mb-1">Key Contribution to CMPSBL:</p>
                <p className="text-sm text-muted-foreground">
                  Cascade's limitations — single points of failure, no governance, no separation of cognitive functions — motivated the transition from a monolithic agent to the <strong className="text-foreground">multi-node, governed substrate architecture</strong>.
                </p>
              </div>
            </div>

            {/* Phase 4: PromptFluid Ecosystem */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">4</div>
                <h3 className="text-lg font-semibold text-foreground">PromptFluid — The Research Umbrella & Ecosystem (2025–2026)</h3>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                At its peak, the PromptFluid ecosystem encompassed 7 integrated products with 50+ edge functions, all of which were consolidated into the 40-node CMPSBL architecture:
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border border-border font-semibold text-foreground">Product</th>
                      <th className="text-left p-2 border border-border font-semibold text-foreground">Functions</th>
                      <th className="text-left p-2 border border-border font-semibold text-foreground">CMPSBL Descendant</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr><td className="p-2 border border-border">Defense</td><td className="p-2 border border-border">18</td><td className="p-2 border border-border">DEFENSE, IMMUNITY nodes</td></tr>
                    <tr><td className="p-2 border border-border">Brain</td><td className="p-2 border border-border">8</td><td className="p-2 border border-border">BRAIN, MEMORY nodes</td></tr>
                    <tr><td className="p-2 border border-border">Marketing</td><td className="p-2 border border-border">23</td><td className="p-2 border border-border">ENCODE, HARVEST nodes</td></tr>
                    <tr><td className="p-2 border border-border">Clarity (CMPTBL)</td><td className="p-2 border border-border">9</td><td className="p-2 border border-border">INCLUSIVE, ACCESS nodes</td></tr>
                    <tr><td className="p-2 border border-border">Studio</td><td className="p-2 border border-border">6</td><td className="p-2 border border-border">FORGE, ENGINEER nodes</td></tr>
                    <tr><td className="p-2 border border-border">Ripple</td><td className="p-2 border border-border">4</td><td className="p-2 border border-border">RIPPLE, TREATY nodes</td></tr>
                    <tr><td className="p-2 border border-border">Nexus</td><td className="p-2 border border-border">3</td><td className="p-2 border border-border">NEXUS node</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase 5: CMPSBL */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">5</div>
                <h3 className="text-lg font-semibold text-foreground">CMPSBL Substrate OS — Evolution Through 14 Versions (2025–2026)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Early Substrate (v1.0–v5.5.0)</h4>
                  <p className="text-xs text-muted-foreground">Formalized multi-node architecture from SimNap/Cascade/CMPTBL lessons. First complete technical documentation on Zenodo.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2">ARCHITECT Epoch (v6–v10)</h4>
                  <p className="text-xs text-muted-foreground">EVOLUTION node with SEBA 7-gate pipeline. Pipeline Discovery via Foundry. CJPI scoring. 6-tier taxonomy. Intent Mesh.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2">IRONCLAD Epoch (v11–v13.5)</h4>
                  <p className="text-xs text-muted-foreground">100% IRONCLAD hardening. 3-tier bounded autonomy. Universal export to 25 languages. Memory Stream crystallization.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2">MINDGAMES Epoch (v14.0–v14.2.0)</h4>
                  <p className="text-xs text-muted-foreground">40-node matrix. 12 sectors. 54-engine taxonomy. Mini-Runtime™. 3-phase Intent Mesh Reality Protocol. 42-page knowledge base.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-t-2 border-primary/20 my-10" />

          {/* Section 3: Architecture Heritage Map */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">3. Architectural Heritage Map</h2>
            <pre className="bg-muted/50 rounded-lg p-4 text-[10px] font-mono text-foreground overflow-x-auto border border-border/50 leading-relaxed">
{`┌───────────────────────┐     ┌───────────────────────┐
│   AetherionShield     │     │ PromptFluid Clarity    │
│  (October 2025)       │     │ / CMPTBL (2025)        │
│  • Fingerprinting     │     │ • WCAG 2.2 Scanner     │
│  • Behavioral Analysis│     │ • AI Auto-Fix          │
│  • Shadow Testing     │     │ • Compliance Reports   │
│  • Bulkhead Isolation │     │ • Nexus AI Router      │
│  • Red Team Automation│     │ • Edge Function Pattern│
└──────────┬────────────┘     └──────────┬─────────────┘
           │                             │
           ▼                             ▼
┌────────────────────────────────────────────────────────┐
│              CMPSBL® Substrate OS                      │
│         (2025–2026, v1.0 – v14.2.0)                   │
│            40 Nodes · 12 Sectors                       │
│                                                        │
│ From AetherionShield:      From CMPTBL/Clarity:        │
│ ├─ DEFENSE (boundary)      ├─ INCLUSIVE (@origin)      │
│ ├─ IMMUNITY (adaptive)     ├─ ACCESS (entitlements)    │
│ ├─ PHANTOM (anon)          ├─ NEXUS (AI routing)       │
│ ├─ SHADOW (verification)   ├─ Resolver architecture    │
│ └─ IRONCLAD (resilience)   └─ Governed remediation     │
│                                                        │
│ From SimNap:               From Cascade:               │
│ ├─ DREAM (consolidation)   ├─ AUDIT (chain)            │
│ ├─ MEMORY/BRAIN (tiered)   ├─ GOVERNANCE (policy)      │
│ ├─ CORTEX (orchestration)  ├─ Personality layer        │
│ ├─ INTENT Mesh (routing)   ├─ ORACLE (prediction)      │
│ └─ Memory Stream & Foundry └─ Clockless architecture   │
└────────────────────────────────────────────────────────┘
           ▲                             ▲
           │                             │
┌──────────┴────────────┐     ┌──────────┴─────────────┐
│      SimNap           │     │     Cascade             │
│ (November 2025)       │     │ (December 2025)         │
│ • Dream Engine        │     │ • Identity Continuity   │
│ • Memory Core         │     │ • Autonomous Reasoning  │
│ • Reflection Engine   │     │ • Personality Layer     │
│ • Orchestration Layer │     │ • Chain of Custody      │
│ • Autonomous Scheduler│     │ • 11 Documented Proofs  │
└───────────────────────┘     └────────────────────────┘`}
            </pre>
          </section>

          {/* Divider */}
          <hr className="border-t-2 border-primary/20 my-10" />

          {/* Section 9: System Scale */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">4. System Scale Progression</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border border-border font-semibold text-foreground">Metric</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">SimNap</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">CMPTBL</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">v5.5</th>
                    <th className="text-left p-2 border border-border font-semibold text-foreground">v14.2</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr><td className="p-2 border border-border font-medium text-foreground">Architecture</td><td className="p-2 border border-border">5 subsystems</td><td className="p-2 border border-border">7 classes</td><td className="p-2 border border-border">Multi-module</td><td className="p-2 border border-border font-medium text-foreground">40 nodes, 12 sectors</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Autonomy</td><td className="p-2 border border-border">Sandboxed</td><td className="p-2 border border-border">User-initiated</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">3-tier bounded</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Memory</td><td className="p-2 border border-border">3-tier</td><td className="p-2 border border-border">Scan storage</td><td className="p-2 border border-border">Multi-tier</td><td className="p-2 border border-border font-medium text-foreground">4-stage crystallization</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Security</td><td className="p-2 border border-border">API restrict</td><td className="p-2 border border-border">—</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">IRONCLAD 100%</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Export</td><td className="p-2 border border-border">Morning reports</td><td className="p-2 border border-border">PDF reports</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">25-language universal</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Discovery</td><td className="p-2 border border-border">—</td><td className="p-2 border border-border">—</td><td className="p-2 border border-border">Basic</td><td className="p-2 border border-border font-medium text-foreground">Foundry + CJPI + 6-tier</td></tr>
                  <tr><td className="p-2 border border-border font-medium text-foreground">Edge Functions</td><td className="p-2 border border-border">~10</td><td className="p-2 border border-border">9</td><td className="p-2 border border-border">~30</td><td className="p-2 border border-border font-medium text-foreground">80+ resolvers</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-t-2 border-primary/20 my-10" />

          {/* Section: Conclusion */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">5. Conclusion</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The CMPSBL® Substrate OS is not an isolated invention. It is the culmination of a deliberate, documented research trajectory:
            </p>
            <ol className="text-sm leading-relaxed text-muted-foreground list-decimal ml-6 space-y-2 mb-6">
              <li><strong className="text-foreground">AetherionShield</strong> established the security consciousness — the understanding that autonomous systems must be resilient against adversarial interference</li>
              <li><strong className="text-foreground">PromptFluid Clarity / CMPTBL</strong> proved that AI-driven automated remediation under governance is viable — that a system can detect, fix, validate, and audit autonomously</li>
              <li><strong className="text-foreground">SimNap</strong> proved that autonomous AI cognition is achievable and documentable — that an AI can dream, reflect, and generate value without human prompting</li>
              <li><strong className="text-foreground">Cascade</strong> demonstrated the limits of monolithic cognitive agents and motivated the transition to a multi-node architecture</li>
              <li><strong className="text-foreground">PromptFluid</strong> provided the organizational infrastructure, the 50+ edge function ecosystem, and the academic publication pipeline</li>
              <li><strong className="text-foreground">CMPSBL</strong> synthesized all preceding work into a governed, resilient, self-evolving cognitive operating system with 40 nodes, 12 sectors, and 54 engines</li>
            </ol>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Every node in the current substrate can trace its design rationale to a specific insight from a predecessor project. Every architectural decision reflects a lesson learned from the system's own heritage. This meta-paper establishes that provenance chain for the permanent academic record.
            </p>
          </section>

          {/* Citation */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border font-serif">Citation</h2>
            <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto border border-border/50">
{`@article{sweet2026heritage,
  author  = {Sweet Jr., Kenneth E.},
  title   = {{The Heritage of Autonomous Cognitive Infrastructure:
              From SimNap to CMPSBL® Substrate OS}},
  year    = {2026},
  publisher = {PromptFluid},
  doi     = {10.5281/zenodo.18234909},
  url     = {https://doi.org/10.5281/zenodo.18234909}
}`}
            </pre>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t-2 border-primary/20 text-center">
            <div className="text-xs text-muted-foreground font-mono">
              © 2025–2026 PromptFluid®. All rights reserved.
            </div>
            <div className="mt-1 text-xs text-muted-foreground font-mono">
              CMPSBL® Substrate OS · 40 Nodes · 12 Sectors · v14.2.0 MINDGAMES
            </div>
            <div className="mt-2 text-xs text-muted-foreground/60 font-mono">
              This document constitutes a defensive publication. It does not constitute a grant of license or warranty of any kind.
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default HeritagePaper;
