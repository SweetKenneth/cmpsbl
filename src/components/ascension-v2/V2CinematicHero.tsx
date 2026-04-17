/**
 * V2CinematicHero — Cinematic hero for Ascension V2
 *
 * A full-color animated SVG diagram showing the Ascension flow:
 *   YOUR CODE → ENHANCE (Mana layers attach) → ANALYZE (40-Primitive collision)
 *   → ASCENDED ARTIFACT
 *
 * Pure CSS + SMIL animation, no deps. Sits above the stepper "machine".
 *
 * © CMPSBL® — All rights reserved.
 */

import { ArrowDown, Sparkles } from 'lucide-react';

export function V2CinematicHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-8 sm:mb-12 border border-border/40 bg-gradient-to-br from-background via-background to-background">
      {/* ═══ Aurora background ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,_hsl(195_100%_55%/0.22)_0%,_transparent_60%)] blur-2xl animate-[v2hero-drift-a_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,_hsl(280_85%_60%/0.20)_0%,_transparent_60%)] blur-2xl animate-[v2hero-drift-b_18s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-[radial-gradient(ellipse,_hsl(310_85%_60%/0.14)_0%,_transparent_70%)] blur-2xl animate-[v2hero-drift-c_22s_ease-in-out_infinite]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
      </div>

      <div className="relative px-4 sm:px-8 py-10 sm:py-16">
        {/* ═══ Eyebrow ═══ */}
        <div className="flex justify-center mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/[0.08] backdrop-blur-sm shadow-[0_0_24px_-8px_hsl(var(--primary)/0.5)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-primary uppercase tracking-[0.24em]">
              Ascension V2 · Live Pipeline
            </span>
          </div>
        </div>

        {/* ═══ Headline ═══ */}
        <div className="text-center max-w-3xl mx-auto mb-3 sm:mb-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.02em] leading-[1.05]">
            <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Attach. Collide.
            </span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_hsl(280_85%_60%/0.45)]">
              Ascend.
            </span>
          </h1>
        </div>
        <div className="text-center max-w-xl mx-auto mb-7 sm:mb-12 px-2 space-y-3">
          <p className="text-base sm:text-lg text-foreground font-semibold leading-snug">
            Same code. New behavior.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/85 leading-relaxed">
            Attach runtime layers that upgrade your software — without modifying a single line.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/60 font-mono uppercase tracking-wider pt-1">
            Powered by a deterministic, phase-locked runtime pipeline.
          </p>
        </div>

        {/* ═══ THE CINEMATIC DIAGRAM ═══ */}
        <div className="relative mx-auto w-full max-w-3xl aspect-[16/10] sm:aspect-[16/8]">
          <CinematicDiagram />
        </div>

        {/* ═══ Stage tag row ═══ */}
        <div className="mt-5 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-3 max-w-3xl mx-auto">
          {[
            { num: '01', label: 'Ingest', tone: 'from-cyan-400/20 to-cyan-400/5 border-cyan-400/30 text-cyan-200' },
            { num: '02', label: 'Attach + Collide', tone: 'from-fuchsia-400/20 to-fuchsia-400/5 border-fuchsia-400/30 text-fuchsia-200' },
            { num: '03', label: 'Ascend + Export', tone: 'from-amber-300/20 to-amber-300/5 border-amber-300/30 text-amber-100' },
          ].map((s) => (
            <div
              key={s.num}
              className={`rounded-lg border bg-gradient-to-br ${s.tone} backdrop-blur-sm px-3 py-2.5 text-center`}
            >
              <div className="font-mono text-[10px] tracking-[0.2em] opacity-70">{s.num}</div>
              <div className="text-[11px] sm:text-xs font-bold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ Caption + arrow down to machine ═══ */}
        <div className="mt-7 sm:mt-10 flex flex-col items-center gap-2">
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            Begin the ascension below
          </p>
          <ArrowDown className="w-4 h-4 text-primary animate-bounce" />
        </div>
      </div>

      {/* ═══ Animations ═══ */}
      <style>{`
        @keyframes v2hero-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes v2hero-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.1); }
        }
        @keyframes v2hero-drift-c {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -20px) scale(1.05); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * CinematicDiagram — pure SVG, animated with SMIL
 * Stages (left → right):
 *   1. CODE BLOCK (your upload)
 *   2. MANA LAYERS (4 colored slabs slot in)
 *   3. SUBSTRATE COLLISION (orbiting primitives)
 *   4. ASCENDED ARTIFACT (crystal)
 * ═══════════════════════════════════════════════════════════════ */
function CinematicDiagram() {
  return (
    <svg
      viewBox="0 0 800 400"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Ascension pipeline: your code attaches Mana layers, collides with the 40-primitive substrate, and emerges as an ascended artifact."
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="g-code" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(195 100% 65%)" />
          <stop offset="100%" stopColor="hsl(210 90% 50%)" />
        </linearGradient>
        <linearGradient id="g-layer-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(160 80% 55%)" />
          <stop offset="100%" stopColor="hsl(180 85% 60%)" />
        </linearGradient>
        <linearGradient id="g-layer-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(40 95% 60%)" />
          <stop offset="100%" stopColor="hsl(20 90% 60%)" />
        </linearGradient>
        <linearGradient id="g-layer-3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(280 80% 65%)" />
          <stop offset="100%" stopColor="hsl(310 80% 60%)" />
        </linearGradient>
        <linearGradient id="g-layer-4" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(340 85% 65%)" />
          <stop offset="100%" stopColor="hsl(0 90% 60%)" />
        </linearGradient>
        <radialGradient id="g-substrate" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(280 100% 75%)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="hsl(220 90% 55%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(220 80% 30%)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-crystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(48 100% 75%)" />
          <stop offset="50%" stopColor="hsl(20 100% 65%)" />
          <stop offset="100%" stopColor="hsl(310 100% 65%)" />
        </linearGradient>

        {/* Filter — soft glow */}
        <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="f-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Flow path: code → substrate → crystal */}
        <path id="flow-path" d="M 130 200 Q 280 200 400 200 Q 540 200 670 200" fill="none" />
      </defs>

      {/* ═══ Connecting beam ═══ */}
      <path
        d="M 130 200 L 670 200"
        stroke="hsl(var(--primary))"
        strokeOpacity="0.18"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.2s" repeatCount="indefinite" />
      </path>

      {/* ═══ STAGE 1 — YOUR CODE ═══ */}
      <g transform="translate(70, 140)">
        <rect
          x="0" y="0" width="120" height="120" rx="14"
          fill="url(#g-code)"
          filter="url(#f-glow)"
          opacity="0.95"
        >
          <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Code lines */}
        <g opacity="0.9">
          <rect x="14" y="22" width="60" height="4" rx="2" fill="white" opacity="0.85" />
          <rect x="14" y="34" width="80" height="4" rx="2" fill="white" opacity="0.7" />
          <rect x="22" y="46" width="50" height="4" rx="2" fill="white" opacity="0.65" />
          <rect x="22" y="58" width="70" height="4" rx="2" fill="white" opacity="0.7" />
          <rect x="14" y="70" width="40" height="4" rx="2" fill="white" opacity="0.6" />
          <rect x="14" y="82" width="74" height="4" rx="2" fill="white" opacity="0.75" />
          <rect x="22" y="94" width="56" height="4" rx="2" fill="white" opacity="0.65" />
        </g>
        <text x="60" y="148" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600" fontFamily="ui-monospace, monospace">
          YOUR CODE
        </text>
        <text x="60" y="162" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8.5" fontFamily="ui-monospace, monospace" letterSpacing="0.1em">
          PRIMITIVE #41
        </text>
      </g>

      {/* ═══ STAGE 2 — MANA LAYERS attaching ═══ */}
      {/* 4 stacked slabs that slide into place */}
      <g transform="translate(220, 130)">
        {/* Layer slab 1 — slides in from above */}
        <g>
          <rect x="0" y="0" width="140" height="22" rx="6" fill="url(#g-layer-1)" opacity="0.95" filter="url(#f-glow)">
            <animate attributeName="x" values="-220;0;0" dur="6s" keyTimes="0;0.18;1" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.95;0.95" dur="6s" keyTimes="0;0.18;1" repeatCount="indefinite" />
          </rect>
          <text x="10" y="15" fill="white" fontSize="9.5" fontWeight="700" fontFamily="ui-monospace, monospace" letterSpacing="0.08em">
            ⛨ DEFENSE
          </text>
        </g>

        {/* Layer slab 2 */}
        <g>
          <rect x="0" y="28" width="140" height="22" rx="6" fill="url(#g-layer-2)" opacity="0.95" filter="url(#f-glow)">
            <animate attributeName="x" values="-220;-220;0;0" dur="6s" keyTimes="0;0.22;0.36;1" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0;0.95;0.95" dur="6s" keyTimes="0;0.22;0.36;1" repeatCount="indefinite" />
          </rect>
          <text x="10" y="43" fill="white" fontSize="9.5" fontWeight="700" fontFamily="ui-monospace, monospace" letterSpacing="0.08em">
            ⚡ NEXUS
          </text>
        </g>

        {/* Layer slab 3 */}
        <g>
          <rect x="0" y="56" width="140" height="22" rx="6" fill="url(#g-layer-3)" opacity="0.95" filter="url(#f-glow)">
            <animate attributeName="x" values="-220;-220;-220;0;0" dur="6s" keyTimes="0;0.36;0.46;0.56;1" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0;0;0.95;0.95" dur="6s" keyTimes="0;0.36;0.46;0.56;1" repeatCount="indefinite" />
          </rect>
          <text x="10" y="71" fill="white" fontSize="9.5" fontWeight="700" fontFamily="ui-monospace, monospace" letterSpacing="0.08em">
            ◆ ATLAS
          </text>
        </g>

        {/* Layer slab 4 */}
        <g>
          <rect x="0" y="84" width="140" height="22" rx="6" fill="url(#g-layer-4)" opacity="0.95" filter="url(#f-glow)">
            <animate attributeName="x" values="-220;-220;-220;-220;0;0" dur="6s" keyTimes="0;0.46;0.56;0.66;0.76;1" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0;0;0;0.95;0.95" dur="6s" keyTimes="0;0.46;0.56;0.66;0.76;1" repeatCount="indefinite" />
          </rect>
          <text x="10" y="99" fill="white" fontSize="9.5" fontWeight="700" fontFamily="ui-monospace, monospace" letterSpacing="0.08em">
            ✦ EVOLUTION
          </text>
        </g>

        {/* Plug ports — connect to code block on the left */}
        <g stroke="hsl(195 100% 65%)" strokeWidth="1.2" opacity="0.4">
          <line x1="-30" y1="11" x2="0" y2="11">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" repeatCount="indefinite" />
          </line>
          <line x1="-30" y1="39" x2="0" y2="39">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
          </line>
          <line x1="-30" y1="67" x2="0" y2="67">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="-30" y1="95" x2="0" y2="95">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
          </line>
        </g>

        <text x="70" y="128" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600" fontFamily="ui-monospace, monospace">
          MANA LAYERS
        </text>
        <text x="70" y="142" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8.5" fontFamily="ui-monospace, monospace" letterSpacing="0.1em">
          ATTACH · WRAP
        </text>
      </g>

      {/* ═══ STAGE 3 — SUBSTRATE COLLISION (orbital) ═══ */}
      <g transform="translate(440, 200)">
        {/* Glow halo */}
        <circle cx="0" cy="0" r="100" fill="url(#g-substrate)" />

        {/* Outer rings */}
        <circle cx="0" cy="0" r="72" fill="none" stroke="hsl(195 100% 65%)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 5">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="54" fill="none" stroke="hsl(280 80% 65%)" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 6">
          <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="14s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="38" fill="none" stroke="hsl(310 80% 65%)" strokeOpacity="0.35" strokeWidth="1" />

        {/* 12 orbiting primitive nodes (representative of 40) */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 72;
            const y = Math.sin(angle) * 72;
            const hue = 180 + i * 18;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill={`hsl(${hue} 90% 65%)`} filter="url(#f-glow)">
                  <animate attributeName="r" values="4;6;4" dur="2.4s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
        </g>

        {/* Inner core — #41 collision */}
        <circle cx="0" cy="0" r="22" fill="hsl(195 100% 65%)" opacity="0.25" filter="url(#f-glow-strong)">
          <animate attributeName="r" values="20;26;20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="14" fill="hsl(195 100% 75%)" filter="url(#f-glow)">
          <animate attributeName="r" values="13;16;13" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="ui-monospace, monospace">
          #41
        </text>

        {/* Collision sparks — short lines flashing radially */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x1 = Math.cos(angle) * 20;
          const y1 = Math.sin(angle) * 20;
          const x2 = Math.cos(angle) * 36;
          const y2 = Math.sin(angle) * 36;
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(48 100% 75%)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0"
            >
              <animate attributeName="opacity" values="0;1;0" dur="1.6s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </line>
          );
        })}

        <text x="0" y="125" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600" fontFamily="ui-monospace, monospace">
          40-PRIMITIVE COLLISION
        </text>
        <text x="0" y="139" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8.5" fontFamily="ui-monospace, monospace" letterSpacing="0.1em">
          DISCOVER · DEDUP · LOCK
        </text>
      </g>

      {/* ═══ Energy particles flowing along the beam ═══ */}
      {[0, 0.6, 1.2, 1.8, 2.4].map((delay, i) => (
        <circle key={i} r="3" fill="hsl(48 100% 70%)" filter="url(#f-glow)" opacity="0.95">
          <animateMotion dur="3s" begin={`${delay}s`} repeatCount="indefinite" rotate="auto">
            <mpath href="#flow-path" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ═══ STAGE 4 — ASCENDED ARTIFACT (crystal) ═══ */}
      <g transform="translate(670, 200)">
        {/* Halo */}
        <circle cx="0" cy="0" r="56" fill="url(#g-crystal)" opacity="0.18" filter="url(#f-glow-strong)">
          <animate attributeName="opacity" values="0.12;0.28;0.12" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Crystal — diamond shape */}
        <g filter="url(#f-glow-strong)">
          <polygon
            points="0,-44 32,-12 18,40 -18,40 -32,-12"
            fill="url(#g-crystal)"
            stroke="hsl(48 100% 80%)"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          >
            <animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur="4s" repeatCount="indefinite" />
          </polygon>
          {/* Facet highlights */}
          <polyline
            points="0,-44 -32,-12 -18,40"
            fill="none"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <polyline
            points="0,-44 32,-12 18,40"
            fill="none"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <line x1="0" y1="-44" x2="0" y2="40" stroke="white" strokeOpacity="0.35" strokeWidth="0.8" />
        </g>

        {/* Sparkle */}
        <g>
          <circle cx="-8" cy="-20" r="1.5" fill="white" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="14" cy="6" r="1.2" fill="white" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="1.0s" repeatCount="indefinite" />
          </circle>
          <circle cx="-6" cy="22" r="1" fill="white" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>
        </g>

        <text x="0" y="68" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600" fontFamily="ui-monospace, monospace">
          ASCENDED ARTIFACT
        </text>
        <text x="0" y="82" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8.5" fontFamily="ui-monospace, monospace" letterSpacing="0.1em">
          EXPORT · PORTABLE
        </text>
      </g>

      {/* ═══ Phase numbers ═══ */}
      <g fontFamily="ui-monospace, monospace" fontSize="9" fontWeight="700" letterSpacing="0.15em">
        <text x="130" y="60" textAnchor="middle" fill="hsl(195 100% 65%)" opacity="0.7">01 · INGEST</text>
        <text x="290" y="60" textAnchor="middle" fill="hsl(40 95% 65%)" opacity="0.7">02 · ENHANCE</text>
        <text x="440" y="60" textAnchor="middle" fill="hsl(310 80% 70%)" opacity="0.7">03 · ASCEND</text>
        <text x="670" y="60" textAnchor="middle" fill="hsl(48 100% 70%)" opacity="0.7">04 · EXPORT</text>
      </g>
    </svg>
  );
}
