/**
 * V2Faq — Frequently Asked Questions for Ascension V2
 *
 * Lives at the bottom of /ascension-v2. Answers the questions developers
 * actually ask before uploading code. Uses native <details> for zero-JS
 * accessibility and emits a JSON-LD FAQPage block for SEO.
 *
 * © CMPSBL® — All rights reserved.
 */

import { HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: ReadonlyArray<FaqItem> = [
  {
    q: 'What is Ascension and what does it do for free?',
    a: 'Ascension is the CMPSBL® pipeline that takes your source code and bonds it to the Hardening Layer — a deterministic, phase-locked wrapper around your original file. The free tier lets anyone upload code in a supported language, run the 40-Primitive collision scan, and download a single ascended artifact with the Hardening Layer attached and an integrity seal — no account required to try.',
  },
  {
    q: 'What is the CMPSBL® Hardening Layer?',
    a: 'It\'s the standard code upgrade every ascended file receives. The wrapper adds defense-in-depth (circuit breaker, retry/backoff, timeout guard, graceful degradation, structured error envelope, trace IDs), caller isolation (input cloning + sidecar scrubbing), and a phase-locked execution chain. Your original Layer 1 source is preserved byte-for-byte inside the artifact.',
  },
  {
    q: 'Which languages are supported today?',
    a: 'V2 ships two real tiers. CANONICAL: TypeScript, JavaScript, Python, and PHP — each emits a byte-locked single-file runtime with native implementations of all 20 layers and a deterministic chain executor. BETA POLYGLOT: every other supported language (Rust, Go, Java, Kotlin, C#, Swift, C, C++, Zig, Scala, Ruby, Lua, R, Dart, Elixir, Haskell, plus the HDL/GPU/blockchain families) emits via the V1 polyglot template engine — a hand-tuned native kernel with your Layer 1 source embedded verbatim. Beta artifacts are not yet golden-file-locked like the canonical four, but every visible language emits a real downloadable file — no doc-only stubs.',
  },
  {
    q: 'Why aren\'t more languages shipping yet?',
    a: 'Each language has to clear a hard parity gate: native implementations of every layer, a deterministic phase-ordered chain executor, and green parity tests against the TypeScript canon. We refuse to ship stubs that look real but aren\'t — the gate exists to prevent that failure mode.',
  },
  {
    q: 'Does Ascension change my code?',
    a: 'No. Your original source is the artifact\'s Layer 1 and is preserved verbatim. The Hardening Layer wraps around your code; it does not edit, rewrite, or obfuscate Layer 1. Real-world stress tests across 50 OSS files (Apache Commons, JUnit, Mockito, Netty, RxJava, .NET runtime, Vapor, swift-nio, Arrow, kotlinx, and more) confirm byte-perfect preservation across all 4 newest languages and all 5 layer profiles.',
  },
  {
    q: 'How many layers can I attach?',
    a: 'There are 20 selectable Crown Jewel layers plus the CMPSBL® Hardening Layer that\'s built into every ascension run. You pick which of the 20 to stack — the Hardening Layer is always there.',
  },
  {
    q: 'What\'s the integrity seal?',
    a: 'Every ascended artifact ends with a deterministic CONVEX CORE™ INTEGRITY block: a hash, a sealed-on date, and a redistribution notice. Any consumer can recompute the hash to verify the artifact came out of Ascension and hasn\'t been tampered with.',
  },
  {
    q: 'Is uploading code safe?',
    a: 'Yes. Uploads are scoped to your run, recorded in the audit chain, and isolated by user. The Hardening Layer\'s caller-isolation invariants apply to the pipeline itself: your input is cloned, internal sidecars are stripped before output, and CMPSBL machinery never leaks into your final artifact.',
  },
  {
    q: 'What do I get when I download?',
    a: 'A single self-contained file in your selected language. It includes the canonical cmpsblExecute entry point, your Layer 1 source untouched, the Layer 2 implementations of every layer you selected, helper functions for input cloning and sidecar scrubbing, and the integrity seal at the end.',
  },
  {
    q: 'How do I unlock more layers and the full Mana attachment flow?',
    a: 'The Builder (free) tier unlocks the core ascension run with the Hardening Layer. Creator and Architect tiers unlock the Mana attachment step (Step 2 — Enhance), additional layer combinations, and access to the broader 40-Primitive substrate.',
  },
];

export function V2Faq() {
  // Build the FAQPage JSON-LD payload — answers should be plain text only.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section
      aria-labelledby="ascension-v2-faq-heading"
      className="mt-12 sm:mt-16 mb-4 rounded-2xl border border-border/50 bg-card/40 px-4 sm:px-8 py-8 sm:py-10"
    >
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="w-4 h-4 text-primary" />
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-primary">
          FAQ
        </span>
      </div>
      <h2
        id="ascension-v2-faq-heading"
        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2"
      >
        Frequently asked questions
      </h2>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8 max-w-2xl">
        Honest answers about what Ascension does, what ships today, and what stays untouched in
        your code.
      </p>

      <div className="divide-y divide-border/60 border-y border-border/60">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-3 sm:py-4">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
              <span className="text-sm sm:text-base font-medium text-foreground group-open:text-primary transition-colors">
                {f.q}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 mt-0.5 w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground transition-transform group-open:rotate-45 group-open:text-primary group-open:border-primary"
              >
                +
              </span>
            </summary>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      {/* SEO — emit a FAQPage block so search engines can render rich results */}
      <script
        type="application/ld+json"
        // Static, sanitized payload built from the FAQS const above.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
