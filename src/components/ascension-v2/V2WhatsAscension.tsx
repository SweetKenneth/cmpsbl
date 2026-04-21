/**
 * V2WhatsAscension — "What's Ascension?" explainer section
 *
 * Sits below the cinematic hero on /ascension-v2. Explains:
 *   1. The CMPSBL® Hardening Layer — the standard code upgrade every file
 *      receives, no matter the tier.
 *   2. What Ascension does for free for everyone.
 *   3. The 9 shipping languages today + others coming soon.
 *
 * Uses semantic tokens only. No live numbers — fully static copy.
 *
 * © CMPSBL® — All rights reserved.
 */

import { Shield, Sparkles, Layers, FileCheck, GitBranch, Lock, Check } from 'lucide-react';
import {
  getCanonicalLanguages,
  getBetaPolyglotLanguages,
  getComingSoonLanguages,
} from '@/lib/export/language-parity-tiers';

// ─── Static copy (no dynamic metrics) ───────────────────────────────────────

const HARDENING_PILLARS = [
  {
    icon: Shield,
    title: 'Defense-in-depth wrapper',
    body: 'Every file gets a circuit breaker, retry/backoff, timeout guard, graceful degradation, structured error envelope, and trace IDs — wired in canonical phase order around your original code.',
  },
  {
    icon: Lock,
    title: 'Caller isolation',
    body: 'Inputs are cloned before execution. Internal sidecars are stripped before output. Your callers never see CMPSBL machinery leak into their results.',
  },
  {
    icon: GitBranch,
    title: 'Phase-locked chain',
    body: 'Hardening → Governance → Foresight → Resilience → Security → Intelligence → Performance → [your code] → Evolution → Audit → Compliance. Same order, every language.',
  },
  {
    icon: FileCheck,
    title: 'Byte-perfect Layer 1',
    body: 'Your original source is preserved verbatim inside the ascended artifact and sealed with a deterministic integrity hash. Reproducible builds, every time.',
  },
] as const;

const FREE_FOR_EVERYONE = [
  'Upload any code — files or paste — in 9 supported languages.',
  'Automatic language + ecosystem detection with semantic drift analysis.',
  '40-Primitive collision scan that classifies your code as Primitive #41.',
  'A single ascended artifact you can download with the CMPSBL® Hardening Layer attached.',
  'Deterministic integrity seal so any consumer can verify the artifact wasn\'t tampered with.',
  'Audit chain entry for every upload — your run is traceable end-to-end.',
] as const;

export function V2WhatsAscension() {
  const canonical = getCanonicalLanguages();
  const beta = getBetaPolyglotLanguages();
  const comingSoon = getComingSoonLanguages();

  return (
    <section
      aria-labelledby="whats-ascension-heading"
      className="relative mb-10 sm:mb-14 rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/60 overflow-hidden"
    >
      {/* Soft accent glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,_hsl(var(--primary)/0.10)_0%,_transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 -left-16 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,_hsl(var(--primary)/0.08)_0%,_transparent_60%)] blur-2xl" />
      </div>

      <div className="relative px-4 sm:px-8 py-8 sm:py-12">
        {/* Eyebrow */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/[0.06] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-primary">
            <Sparkles className="w-3 h-3" />
            What's Ascension
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-3">
          <h2
            id="whats-ascension-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
          >
            The CMPSBL® Hardening Layer — every file, every tier.
          </h2>
        </div>
        <p className="text-center text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Ascension takes any source file and bonds it to the CMPSBL® Hardening Layer — a
          deterministic, phase-locked wrapper that turns ordinary code into a governed,
          self-defending artifact. Your bytes stay intact. The substrate moves around them.
        </p>

        {/* ─── Pillars ─────────────────────────────────────────────────── */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {HARDENING_PILLARS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm p-4 sm:p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Free-for-everyone block ─────────────────────────────────── */}
        <div className="mt-8 sm:mt-10 rounded-xl border border-primary/30 bg-primary/[0.04] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Free for everyone — no account required to try
            </h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {FREE_FOR_EVERYONE.map((line) => (
              <li key={line} className="flex items-start gap-2 text-xs sm:text-[13px] text-foreground/85 leading-relaxed">
                <Check className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ─── Languages ───────────────────────────────────────────────── */}
        <div className="mt-8 sm:mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Supported Languages
            </h3>
            <span className="text-[11px] sm:text-xs font-mono text-muted-foreground uppercase tracking-[0.18em]">
              {canonical.length} canonical · {beta.length} beta · {comingSoon.length} coming soon
            </span>
          </div>

          {/* Canonical row */}
          <p className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-primary/80 mb-1.5">
            Canonical · byte-locked
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {canonical.map((lang) => (
              <span
                key={lang.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-primary/30 bg-primary/[0.08] text-[11px] sm:text-xs font-medium text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang.label}
              </span>
            ))}
          </div>

          {/* Beta polyglot row */}
          {beta.length > 0 && (
            <>
              <p className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-4 mb-1.5">
                Polyglot · Beta
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {beta.map((lang) => (
                  <span
                    key={lang.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-muted/40 text-[11px] sm:text-xs font-medium text-foreground"
                    title="Native file via the V1 polyglot engine — Beta tier, not byte-locked yet"
                  >
                    {lang.label}
                    <span className="px-1 py-px rounded text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider bg-foreground/10 text-foreground/70">
                      Beta
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}

          <details className="mt-4 group">
            <summary className="cursor-pointer text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              <span>View {comingSoon.length} coming-soon languages</span>
              <span className="transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {comingSoon.map((lang) => (
                <span
                  key={lang.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-muted/30 text-[10.5px] sm:text-[11px] text-muted-foreground"
                  title={lang.roadmapNote}
                >
                  {lang.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground/80 leading-relaxed">
              Canonical languages are byte-locked by golden-file regression. Beta polyglot
              languages emit native files via the V1 polyglot engine and embed your source
              verbatim, but aren&apos;t byte-locked yet. Coming-soon languages stay disabled
              until their polyglot body lands.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
