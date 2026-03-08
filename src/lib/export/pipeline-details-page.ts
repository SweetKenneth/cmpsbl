/**
 * Pipeline Details Page Generator
 * Creates a beautifully styled, print-ready HTML document for each exported pipeline.
 * Designed to look like a professional certificate/license with seal, typography, and layout.
 */

import { getFunctionalDescription } from '@/lib/pipeline-descriptions';
import {
  estimateMarketValue,
  formatMarketValue,
  getCategoryMultiplierLabel,
  getTierFromScore,
  CATEGORY_MARKET_MULTIPLIERS,
} from '@/lib/pipeline-valuation';

export interface PipelineDetailsInput {
  name: string;
  description: string;
  category: string;
  score: number;
  tier: string;
  systemChain: string[];
  fingerprint?: string | null;
  exportLanguages: string[];
  obtainedAt?: string;
  source?: string;
}

function getUseCases(category: string, name: string, systemChain: string[]): string[] {
  const cat = category.toLowerCase();
  const base: string[] = [];

  if (cat === 'security' || systemChain.some(s => s.toUpperCase() === 'DEFENSE'))
    base.push(
      'Automated threat detection and response systems',
      'Runtime security policy enforcement in production environments',
      'Vulnerability scanning pipelines for CI/CD integration',
    );
  if (cat === 'governance' || systemChain.some(s => s.toUpperCase() === 'GOVERNANCE'))
    base.push(
      'Regulatory compliance automation for financial services',
      'Audit trail generation and policy verification',
      'Automated governance reporting for enterprise deployments',
    );
  if (cat === 'cognitive' || systemChain.some(s => ['BRAIN', 'CORTEX'].includes(s.toUpperCase())))
    base.push(
      'Intelligent decision support systems',
      'Automated reasoning and analysis pipelines',
      'Knowledge extraction from unstructured data sources',
    );
  if (cat === 'evolution' || systemChain.some(s => s.toUpperCase() === 'EVOLUTION'))
    base.push(
      'Self-optimizing system configurations',
      'Adaptive algorithm tuning for changing environments',
      'Automated A/B testing and strategy selection',
    );
  if (cat === 'routing' || systemChain.some(s => ['NEXUS', 'RIPPLE'].includes(s.toUpperCase())))
    base.push(
      'High-throughput message routing and load balancing',
      'Event-driven microservice orchestration',
      'Real-time signal processing and distribution',
    );
  if (cat === 'learning' || systemChain.some(s => s.toUpperCase() === 'DREAM'))
    base.push(
      'Continuous learning and model improvement pipelines',
      'Simulation-driven strategy exploration',
      'Hyperparameter optimization across distributed systems',
    );
  if (cat === 'observability' || systemChain.some(s => ['VISION', 'MEMORY'].includes(s.toUpperCase())))
    base.push(
      'Full-stack observability and anomaly detection',
      'Pattern recognition across system telemetry',
      'Predictive alerting based on historical behavior',
    );

  base.push(
    'Integration into existing enterprise software architectures',
    'Standalone deployment as a containerized microservice',
    'Research and development for novel software capabilities',
  );

  return [...new Set(base)];
}

function getValuationBreakdown(score: number, category: string, moduleChainLength: number) {
  const normalized = Math.max(0, score - 60) / 40;
  const baseValue = 5000 + Math.pow(normalized, 2.5) * 495000;
  const catMult = CATEGORY_MARKET_MULTIPLIERS[category.toLowerCase()] ?? 1.0;
  const complexityMult = 1 + (Math.min(moduleChainLength, 6) - 1) * 0.08;
  const apexMult = score >= 95 ? 1.5 : score >= 92 ? 1.2 : 1.0;
  const total = estimateMarketValue(score, category, moduleChainLength);

  return {
    baseValue: Math.round(baseValue),
    categoryMultiplier: catMult,
    categoryLabel: getCategoryMultiplierLabel(category),
    complexityMultiplier: complexityMult,
    apexMultiplier: apexMult,
    total,
    formatted: formatMarketValue(total),
  };
}

function generateSealSVG(score: number, tier: string): string {
  const tierColor = tier === 'Apex' ? '#c9a84c' : tier === 'Enterprise' ? '#94a3b8' : tier === 'Architect' ? '#a78bfa' : '#6ee7b7';
  const tierColorDark = tier === 'Apex' ? '#a67c00' : tier === 'Enterprise' ? '#64748b' : tier === 'Architect' ? '#7c3aed' : '#059669';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="140" height="140">
    <defs>
      <radialGradient id="sealGrad" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="${tierColor}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${tierColorDark}" stop-opacity="0.15"/>
      </radialGradient>
      <filter id="emboss">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.7" specularExponent="15" result="spec">
          <fePointLight x="80" y="60" z="120"/>
        </feSpecularLighting>
        <feComposite in="SourceGraphic" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
      </filter>
    </defs>
    <!-- Outer ring -->
    <circle cx="100" cy="100" r="95" fill="none" stroke="${tierColor}" stroke-width="2.5" opacity="0.6"/>
    <circle cx="100" cy="100" r="88" fill="none" stroke="${tierColor}" stroke-width="0.5" opacity="0.35"/>
    <!-- Inner fill -->
    <circle cx="100" cy="100" r="85" fill="url(#sealGrad)"/>
    <!-- Decorative notches -->
    ${Array.from({length: 36}, (_, i) => {
      const angle = (i * 10) * Math.PI / 180;
      const x1 = 100 + 90 * Math.cos(angle);
      const y1 = 100 + 90 * Math.sin(angle);
      const x2 = 100 + 95 * Math.cos(angle);
      const y2 = 100 + 95 * Math.sin(angle);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${tierColor}" stroke-width="1" opacity="0.4"/>`;
    }).join('\n    ')}
    <!-- Star points -->
    ${Array.from({length: 8}, (_, i) => {
      const angle = (i * 45 - 90) * Math.PI / 180;
      const x = 100 + 78 * Math.cos(angle);
      const y = 100 + 78 * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${tierColor}" opacity="0.5"/>`;
    }).join('\n    ')}
    <!-- Center text -->
    <text x="100" y="72" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="9" fill="${tierColor}" letter-spacing="3" font-weight="600" text-transform="uppercase">CMPSBL®</text>
    <text x="100" y="108" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="32" fill="${tierColor}" font-weight="700">${score}</text>
    <text x="100" y="125" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="8" fill="${tierColor}" letter-spacing="2" opacity="0.8">CJPI SCORE</text>
    <text x="100" y="148" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="11" fill="${tierColor}" letter-spacing="4" font-weight="600">${tier.toUpperCase()}</text>
    <!-- Circular text path -->
    <path id="topArc" d="M 30,100 a 70,70 0 0,1 140,0" fill="none"/>
    <text font-family="Georgia, serif" font-size="7" fill="${tierColor}" letter-spacing="2.5" opacity="0.55">
      <textPath href="#topArc" startOffset="50%" text-anchor="middle">VERIFIED PIPELINE ARTIFACT</textPath>
    </text>
    <path id="bottomArc" d="M 30,100 a 70,70 0 0,0 140,0" fill="none"/>
    <text font-family="Georgia, serif" font-size="7" fill="${tierColor}" letter-spacing="2" opacity="0.55">
      <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">MEMORY STREAM DISCOVERY</textPath>
    </text>
  </svg>`;
}

export function generatePipelineDetailsHTML(input: PipelineDetailsInput): string {
  const functionalDesc = getFunctionalDescription(input.name, input.systemChain);
  const useCases = getUseCases(input.category, input.name, input.systemChain);
  const tier = getTierFromScore(input.score);
  const valuation = getValuationBreakdown(input.score, input.category, input.systemChain.length);
  const exportDate = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const sealSVG = generateSealSVG(input.score, tier);

  const tierAccent = tier === 'Apex' ? '#c9a84c' : tier === 'Enterprise' ? '#94a3b8' : tier === 'Architect' ? '#a78bfa' : '#6ee7b7';
  const tierAccentDim = tier === 'Apex' ? 'rgba(201,168,76,0.08)' : tier === 'Enterprise' ? 'rgba(148,163,184,0.08)' : tier === 'Architect' ? 'rgba(167,139,250,0.08)' : 'rgba(110,231,183,0.08)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(input.name)} — Pipeline Certificate</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --ink: #1a1a1f;
      --ink-light: #3a3a42;
      --ink-muted: #6b6b78;
      --ink-faint: #9b9baa;
      --cream: #faf9f6;
      --cream-warm: #f5f3ee;
      --parchment: #edeae3;
      --accent: ${tierAccent};
      --accent-dim: ${tierAccentDim};
      --rule: rgba(26, 26, 31, 0.12);
      --rule-strong: rgba(26, 26, 31, 0.25);
    }

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 1.8cm 2cm;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--cream);
      color: var(--ink);
      line-height: 1.7;
      font-size: 14px;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 3.5rem 4rem;
      background: white;
      min-height: 100vh;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }

    @media (max-width: 680px) {
      .page { padding: 2rem 1.5rem; }
    }

    /* ─── Typography ─── */

    .serif { font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; }
    .mono { font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace; font-size: 0.85em; }

    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.4rem;
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--ink);
      margin-bottom: 0.3rem;
    }

    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--ink);
      margin: 2.8rem 0 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--rule);
      letter-spacing: 0.01em;
    }

    h3 {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ink-muted);
      margin-bottom: 0.6rem;
    }

    p {
      margin-bottom: 1rem;
      color: var(--ink-light);
      font-size: 0.925rem;
      line-height: 1.75;
    }

    /* ─── Header / Certificate Top ─── */

    .certificate-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      padding-bottom: 2.5rem;
      border-bottom: 2px solid var(--ink);
      margin-bottom: 0.75rem;
    }

    .certificate-header .meta {
      flex: 1;
    }

    .certificate-issuer {
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: var(--ink-muted);
      margin-bottom: 1.2rem;
    }

    .certificate-subtitle {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.05rem;
      font-weight: 400;
      font-style: italic;
      color: var(--ink-muted);
      line-height: 1.65;
      margin-top: 0.6rem;
    }

    .seal-container {
      flex-shrink: 0;
      opacity: 0.85;
    }

    .seal-container svg {
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.08));
    }

    /* ─── Sub-header line ─── */
    .certificate-meta-line {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      padding: 0.9rem 0;
      border-bottom: 1px solid var(--rule);
      margin-bottom: 2rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .meta-label {
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ink-faint);
    }

    .meta-value {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--ink);
    }

    /* ─── Content sections ─── */

    .section-card {
      background: var(--cream);
      border: 1px solid var(--rule);
      border-radius: 6px;
      padding: 1.5rem 1.75rem;
      margin-bottom: 1.25rem;
    }

    .section-card p:last-child { margin-bottom: 0; }

    .description-lead {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.15rem;
      font-weight: 400;
      line-height: 1.7;
      color: var(--ink);
    }

    .provenance-note {
      font-size: 0.82rem;
      color: var(--ink-muted);
      font-style: italic;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--rule);
    }

    /* ─── Modules ─── */

    .module-chain {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .module-tag {
      display: inline-block;
      padding: 0.25rem 0.7rem;
      border: 1px solid var(--rule-strong);
      border-radius: 3px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-muted);
      background: white;
    }

    /* ─── Use cases ─── */

    .use-case-list {
      list-style: none;
      padding: 0;
    }

    .use-case-list li {
      position: relative;
      padding: 0.65rem 0 0.65rem 1.6rem;
      font-size: 0.9rem;
      color: var(--ink-light);
      border-bottom: 1px solid var(--rule);
    }

    .use-case-list li:last-child { border-bottom: none; }

    .use-case-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border: 1.5px solid var(--accent);
      border-radius: 50%;
    }

    /* ─── Quality grid ─── */

    .quality-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 580px) { .quality-grid { grid-template-columns: 1fr; } }

    .quality-card {
      background: white;
      border: 1px solid var(--rule);
      border-radius: 6px;
      padding: 1.5rem;
    }

    .quality-score {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.6rem;
      font-weight: 700;
      color: var(--accent);
      line-height: 1;
    }

    .quality-tier {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--ink);
    }

    /* ─── Valuation ─── */

    .valuation-disclaimer {
      background: #fef9ee;
      border: 1px solid #e8d5a8;
      border-left: 4px solid #c9a84c;
      border-radius: 4px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .valuation-disclaimer .title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #92722a;
      margin-bottom: 0.5rem;
    }

    .valuation-disclaimer p {
      font-size: 0.82rem;
      color: #7a6324;
      line-height: 1.65;
      margin-bottom: 0.5rem;
    }

    .valuation-disclaimer p:last-child { margin-bottom: 0; }

    .valuation-table {
      width: 100%;
      border-collapse: collapse;
    }

    .valuation-table tr { border-bottom: 1px solid var(--rule); }
    .valuation-table tr:last-child { border-bottom: 2px solid var(--ink); }

    .valuation-table td {
      padding: 0.75rem 0;
      font-size: 0.88rem;
    }

    .valuation-table td:first-child { color: var(--ink-muted); }
    .valuation-table td:last-child { text-align: right; font-weight: 600; color: var(--ink); }

    .valuation-total {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent);
    }

    .valuation-methodology {
      font-size: 0.78rem;
      color: var(--ink-faint);
      font-style: italic;
      margin-top: 1rem;
      line-height: 1.6;
    }

    /* ─── Export details ─── */

    .language-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .lang-tag {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      background: var(--cream-warm);
      border: 1px solid var(--rule);
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--ink-muted);
    }

    .export-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 580px) { .export-meta-grid { grid-template-columns: 1fr; } }

    /* ─── Footer / Colophon ─── */

    .colophon {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 2px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .colophon-text {
      font-size: 0.72rem;
      color: var(--ink-faint);
      line-height: 1.8;
    }

    .colophon-mark {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--ink-faint);
      letter-spacing: 0.05em;
    }

    /* ─── Decorative rules ─── */

    .ornament {
      text-align: center;
      font-size: 1.2rem;
      color: var(--rule-strong);
      margin: 2rem 0;
      letter-spacing: 0.5em;
    }

    .fine-rule {
      border: none;
      border-top: 1px solid var(--rule);
      margin: 2rem 0;
    }
  </style>
</head>
<body>

<div class="page">

  <!-- ═══════ Certificate Header ═══════ -->
  <header class="certificate-header">
    <div class="meta">
      <div class="certificate-issuer">CMPSBL® Memory Stream — Pipeline Certificate of Discovery</div>
      <h1>${escapeHtml(input.name)}</h1>
      <div class="certificate-subtitle">${escapeHtml(functionalDesc)}</div>
    </div>
    <div class="seal-container">
      ${sealSVG}
    </div>
  </header>

  <!-- ═══════ Meta Line ═══════ -->
  <div class="certificate-meta-line">
    <div class="meta-item">
      <span class="meta-label">Tier</span>
      <span class="meta-value">${escapeHtml(tier)}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Category</span>
      <span class="meta-value">${escapeHtml(input.category.charAt(0).toUpperCase() + input.category.slice(1))}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">CJPI</span>
      <span class="meta-value">${input.score} / 100</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Systems</span>
      <span class="meta-value">${input.systemChain.length}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Date Issued</span>
      <span class="meta-value">${formattedDate}</span>
    </div>
    ${input.fingerprint ? `<div class="meta-item">
      <span class="meta-label">Fingerprint</span>
      <span class="meta-value mono">${escapeHtml(input.fingerprint.slice(0, 12))}…</span>
    </div>` : ''}
  </div>

  <!-- ═══════ Pipeline Description ═══════ -->
  <h2>About This Pipeline</h2>
  <div class="section-card">
    <p class="description-lead">${escapeHtml(input.description)}</p>
    <p class="provenance-note">
      This pipeline was autonomously discovered by the Memory Stream — a recursive engine that
      monitors substrate system behavior and crystallizes viable software configurations into
      production-grade pipelines. It was not designed by a human; it emerged from the interaction
      of ${input.systemChain.length} substrate module${input.systemChain.length !== 1 ? 's' : ''} 
      operating in concert.
    </p>
    <div class="module-chain">
      ${input.systemChain.map(s => `<span class="module-tag">${escapeHtml(s)}</span>`).join('\n      ')}
    </div>
  </div>

  <!-- ═══════ Use Cases ═══════ -->
  <h2>Applicable Domains</h2>
  <ul class="use-case-list">
    ${useCases.map(uc => `<li>${escapeHtml(uc)}</li>`).join('\n    ')}
  </ul>

  <div class="ornament">· · ·</div>

  <!-- ═══════ Quality Assessment ═══════ -->
  <h2>Quality Assessment</h2>
  <div class="quality-grid">
    <div class="quality-card">
      <h3>CJPI Score</h3>
      <div class="quality-score">${input.score}</div>
      <p style="margin-top: 0.75rem; font-size: 0.82rem;">
        The Crown Jewel Pipeline Index evaluates novelty,
        utility, complexity, and composability on a 100-point scale.
        ${input.score >= 95 ? 'This score qualifies for the highest tier.' : ''}
      </p>
    </div>
    <div class="quality-card">
      <h3>Tier Classification</h3>
      <div class="quality-tier">${escapeHtml(tier)}</div>
      <p style="margin-top: 0.75rem; font-size: 0.82rem;">
        ${tier === 'Apex' ? 'Apex tier represents the top ~5% of all discoveries — pipelines with exceptional quality, novelty, and practical utility.' :
          tier === 'Enterprise' ? 'Enterprise tier pipelines demonstrate high quality and are suitable for production deployment in commercial environments.' :
          tier === 'Architect' ? 'Architect tier pipelines show strong fundamentals and can serve as building blocks for larger systems.' :
          'Creator tier pipelines provide functional capabilities suitable for development and experimentation.'}
      </p>
    </div>
  </div>

  <!-- ═══════ Valuation ═══════ -->
  <h2>AI Valuation Estimate</h2>

  <div class="valuation-disclaimer">
    <div class="title">⚠ AI-Generated Estimate — Not Financial Advice</div>
    <p>
      The valuation below is produced by a heuristic model using the pipeline's
      CJPI score, category, and complexity as inputs. <strong>This estimate may be significantly 
      inaccurate</strong> and should not be relied upon for financial, investment, or business decisions.
    </p>
    <p>
      Actual market value depends on factors this model cannot assess: market demand,
      competitive landscape, implementation cost, regulatory requirements, and integration complexity.
    </p>
  </div>

  <div class="section-card">
    <table class="valuation-table">
      <tr>
        <td>Base value (CJPI ${input.score})</td>
        <td>${formatMarketValue(valuation.baseValue)}</td>
      </tr>
      <tr>
        <td>Category multiplier · ${escapeHtml(input.category)}${valuation.categoryLabel ? ` (${escapeHtml(valuation.categoryLabel)})` : ''}</td>
        <td>×${valuation.categoryMultiplier.toFixed(1)}</td>
      </tr>
      <tr>
        <td>Complexity factor · ${input.systemChain.length} module${input.systemChain.length !== 1 ? 's' : ''}</td>
        <td>×${valuation.complexityMultiplier.toFixed(2)}</td>
      </tr>
      ${valuation.apexMultiplier > 1 ? `<tr>
        <td>Apex tier premium</td>
        <td>×${valuation.apexMultiplier.toFixed(1)}</td>
      </tr>` : ''}
      <tr>
        <td style="font-weight: 600; color: var(--ink);">Estimated Market Value</td>
        <td class="valuation-total">${valuation.formatted}</td>
      </tr>
    </table>
    <p class="valuation-methodology">
      Methodology: Base value scales exponentially with CJPI score (range $5K–$500K). Category, complexity, 
      and tier multipliers are applied based on historical demand patterns. This is a heuristic model — 
      not a market appraisal.
    </p>
  </div>

  <!-- ═══════ Export Details ═══════ -->
  <h2>Export Manifest</h2>
  <div class="export-meta-grid">
    <div class="section-card">
      <h3>Available Languages</h3>
      <div class="language-grid">
        ${input.exportLanguages.map(l => `<span class="lang-tag">${escapeHtml(l)}</span>`).join('\n        ')}
      </div>
    </div>
    <div class="section-card">
      <h3>Provenance</h3>
      <p style="font-size: 0.82rem; line-height: 2; margin-bottom: 0;">
        Source: ${escapeHtml(input.source || 'Memory Stream')}<br>
        ${input.obtainedAt ? `Crystallized: ${escapeHtml(new Date(input.obtainedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}<br>` : ''}
        Exported: ${formattedDate}<br>
        Systems: ${input.systemChain.join(' → ')}
      </p>
    </div>
  </div>

  <!-- ═══════ Colophon ═══════ -->
  <footer class="colophon">
    <div class="colophon-text">
      Generated by the CMPSBL® Memory Stream Export System<br>
      Pipeline details and valuations are AI-generated estimates and may contain inaccuracies.<br>
      <span class="mono">${escapeHtml(exportDate)}</span>
    </div>
    <div class="colophon-mark">CMPSBL®</div>
  </footer>

</div>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
