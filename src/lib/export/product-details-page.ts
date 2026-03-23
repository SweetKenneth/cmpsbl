/**
 * Product Details Page Generator
 * Creates beautifully styled, print-ready HTML documents for engine and agent exports.
 * Matches the cinematic quality of the Pipeline Details page used by memory exports.
 */

export interface ProductDetailsInput {
  name: string;
  subtitle: string;
  kind: 'engine' | 'agent';
  tier: string;
  price: string;
  version: string;
  capabilities: string[];
  briefing?: string;
  longDescription?: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getTierAccent(tier: string): { accent: string; accentDim: string } {
  const t = tier.toLowerCase();
  if (t === 'apex') return { accent: '#c9a84c', accentDim: 'rgba(201,168,76,0.08)' };
  if (t === 'meta') return { accent: '#f59e0b', accentDim: 'rgba(245,158,11,0.08)' };
  if (t === 'elite') return { accent: '#a855f7', accentDim: 'rgba(168,85,247,0.08)' };
  if (t === 'pro') return { accent: '#3b82f6', accentDim: 'rgba(59,130,246,0.08)' };
  if (t === 'starter') return { accent: '#94a3b8', accentDim: 'rgba(148,163,184,0.08)' };
  if (t === 'free') return { accent: '#6ee7b7', accentDim: 'rgba(110,231,183,0.08)' };
  if (t === 'core') return { accent: '#06b6d4', accentDim: 'rgba(6,182,212,0.08)' };
  return { accent: '#71717a', accentDim: 'rgba(113,113,122,0.08)' };
}

function getFunctionalDescription(input: ProductDetailsInput): string {
  const kind = input.kind === 'engine' ? 'Composable Engine' : 'Meta-Agent';
  if (input.longDescription) return input.longDescription;
  if (input.briefing) return input.briefing;
  return `${input.name} is a ${input.tier.toUpperCase()}-tier ${kind} from the CMPSBL® Substrate. ${input.subtitle}. It delivers sealed, production-grade cognitive capabilities designed for integration into commercial software products and enterprise workflows.`;
}

function getUseCases(input: ProductDetailsInput): string[] {
  const base: string[] = [];
  const caps = input.capabilities.map(c => c.toLowerCase());

  if (caps.some(c => c.includes('security') || c.includes('threat') || c.includes('defense')))
    base.push('Automated threat detection and incident response', 'Runtime security policy enforcement', 'Vulnerability assessment and continuous scanning');
  if (caps.some(c => c.includes('research') || c.includes('web') || c.includes('crawl')))
    base.push('Automated competitive intelligence gathering', 'Real-time market and trend analysis', 'Data enrichment pipelines for CRM and analytics');
  if (caps.some(c => c.includes('code') || c.includes('engineer') || c.includes('build')))
    base.push('Automated code generation and refactoring', 'CI/CD pipeline integration and optimization', 'Technical documentation generation');
  if (caps.some(c => c.includes('reason') || c.includes('brain') || c.includes('think')))
    base.push('Intelligent decision support systems', 'Automated analysis and reasoning pipelines', 'Complex multi-step problem solving');
  if (caps.some(c => c.includes('memory') || c.includes('oracle') || c.includes('cortex')))
    base.push('Long-term knowledge retention and retrieval', 'Context-aware intelligent assistance', 'Enterprise knowledge management');
  if (caps.some(c => c.includes('monitor') || c.includes('observ') || c.includes('alert')))
    base.push('Real-time system monitoring and alerting', 'Performance anomaly detection', 'Infrastructure health dashboards');

  if (base.length === 0) {
    base.push(
      `Production-grade ${input.kind} integration for commercial software`,
      'Enterprise workflow automation and orchestration',
      'AI-powered process optimization',
    );
  }

  return base;
}

function generateSealSVG(tier: string): string {
  const { accent } = getTierAccent(tier);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="110" height="110">
    <circle cx="100" cy="100" r="92" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.3"/>
    <circle cx="100" cy="100" r="82" fill="none" stroke="${accent}" stroke-width="0.75" opacity="0.2"/>
    <circle cx="100" cy="100" r="72" fill="${accent}" fill-opacity="0.06"/>
    <text x="100" y="90" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="${accent}" letter-spacing="3">CMPSBL®</text>
    <text x="100" y="110" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="${accent}" opacity="0.6" letter-spacing="2">${new Date().getFullYear()}</text>
    <path id="topArc" d="M 30,100 a 70,70 0 0,1 140,0" fill="none"/>
    <text font-family="Georgia, serif" font-size="7" fill="${accent}" letter-spacing="2" opacity="0.45">
      <textPath href="#topArc" startOffset="50%" text-anchor="middle">SEALED RUNTIME ARTIFACT</textPath>
    </text>
    <path id="bottomArc" d="M 30,100 a 70,70 0 0,0 140,0" fill="none"/>
    <text font-family="Georgia, serif" font-size="7" fill="${accent}" letter-spacing="2" opacity="0.45">
      <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">${tier.toUpperCase()} TIER</textPath>
    </text>
  </svg>`;
}

export function generateProductDetailsHTML(input: ProductDetailsInput): string {
  const { accent, accentDim } = getTierAccent(input.tier);
  const kindLabel = input.kind === 'engine' ? 'Composable Engine' : 'Meta-Agent';
  const functionalDesc = getFunctionalDescription(input);
  const useCases = getUseCases(input);
  const sealSVG = generateSealSVG(input.tier);
  const exportDate = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(input.name)} — ${kindLabel} Certificate</title>
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
      --accent: ${accent};
      --accent-dim: ${accentDim};
      --rule: rgba(26, 26, 31, 0.12);
    }

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 1.8cm 2cm; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--cream);
      color: var(--ink);
      line-height: 1.7;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
      overflow-wrap: break-word;
    }

    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 3.5rem 4rem;
      background: white;
      min-height: 100vh;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
    }

    @media print { body { background: white; } .page { box-shadow: none; padding: 0; max-width: 100%; } }
    @media (max-width: 680px) { .page { padding: 2rem 1.5rem; } }

    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }

    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2rem;
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 0.3rem;
      word-break: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }

    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.35rem;
      font-weight: 600;
      margin: 2.8rem 0 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--rule);
    }

    h3 {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ink-muted);
      margin-bottom: 0.6rem;
    }

    p { margin-bottom: 0.9rem; color: var(--ink-light); }

    .header-rule { border: none; height: 2px; background: var(--ink); margin: 2rem 0 1.5rem; }
    .issuer { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3em; color: var(--ink-faint); margin-bottom: 1.2rem; text-align: center; }
    .subtitle { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.1rem; font-style: italic; color: var(--ink-muted); margin-top: 0.4rem; }

    .seal-area { display: flex; justify-content: center; margin: 1.5rem 0 2rem; }
    .tier-badge {
      display: inline-block; padding: 0.25rem 1rem; font-size: 0.65rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.2em; border-radius: 2px;
      color: var(--accent); border: 1.5px solid var(--accent); background: var(--accent-dim);
    }

    .meta-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem; margin: 1.5rem 0; padding: 1.25rem 1.5rem;
      background: var(--cream); border-radius: 6px; border: 1px solid var(--rule);
    }
    .meta-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-faint); }
    .meta-value { font-size: 0.88rem; font-weight: 500; color: var(--ink); margin-top: 0.15rem; }

    .section-card {
      background: var(--cream); border: 1px solid var(--rule); border-radius: 6px;
      padding: 1.5rem 1.75rem; margin-bottom: 1.25rem;
    }
    .section-card p:last-child { margin-bottom: 0; }

    .capability-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem; margin-top: 0.75rem;
    }
    .capability-item {
      padding: 0.6rem 1rem; background: var(--accent-dim); border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
      border-radius: 4px; font-size: 0.82rem; font-weight: 500; color: var(--ink-light);
    }

    .use-case-list { list-style: none; padding: 0; counter-reset: uc; }
    .use-case-list li {
      counter-increment: uc; padding: 0.65rem 0; border-bottom: 1px solid rgba(26,26,31,0.06);
      font-size: 0.88rem; color: var(--ink-light); display: flex; gap: 0.75rem; align-items: baseline;
    }
    .use-case-list li::before {
      content: counter(uc, decimal-leading-zero); font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem; color: var(--accent); font-weight: 500; min-width: 1.5rem;
    }

    .bundle-contents {
      display: grid; grid-template-columns: 140px 1fr; gap: 0.25rem 1.5rem;
      font-size: 0.82rem; margin: 0.5rem 0;
    }
    .bundle-file { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 500; color: var(--ink); padding: 0.35rem 0; border-bottom: 1px solid rgba(26,26,31,0.06); }
    .bundle-desc { color: var(--ink-muted); padding: 0.35rem 0; border-bottom: 1px solid rgba(26,26,31,0.06); }

    .colophon {
      margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--ink);
      text-align: center; font-size: 0.72rem; color: var(--ink-faint); line-height: 1.9;
    }
    .colophon-mark { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 600; margin-top: 0.5rem; }

    .ornament { text-align: center; font-size: 1.2rem; color: rgba(26,26,31,0.15); margin: 2.5rem 0; letter-spacing: 0.5em; }
  </style>
</head>
<body>
<div class="page">

  <div class="issuer">CMPSBL® · ${kindLabel}</div>
  <div style="text-align:center;">
    <h1>${esc(input.name)}</h1>
    <div class="subtitle">${esc(input.subtitle)}</div>
    <div style="margin-top:1rem;"><span class="tier-badge">${esc(input.tier.toUpperCase())} TIER</span></div>
  </div>

  <hr class="header-rule">

  <div class="seal-area">${sealSVG}</div>

  <div class="meta-grid">
    <div><div class="meta-label">Product</div><div class="meta-value">${esc(input.name)}</div></div>
    <div><div class="meta-label">Type</div><div class="meta-value">${esc(kindLabel)}</div></div>
    <div><div class="meta-label">Tier</div><div class="meta-value">${esc(input.tier.toUpperCase())}</div></div>
    <div><div class="meta-label">Version</div><div class="meta-value">${esc(input.version)}</div></div>
    <div><div class="meta-label">Price</div><div class="meta-value">${esc(input.price)}</div></div>
    <div><div class="meta-label">Exported</div><div class="meta-value">${formattedDate}</div></div>
  </div>

  <h2>Functional Description</h2>
  <div class="section-card">
    <p>${esc(functionalDesc)}</p>
  </div>

  <h2>Capabilities</h2>
  <div class="capability-grid">
    ${input.capabilities.map(c => `<div class="capability-item">${esc(c)}</div>`).join('\n    ')}
  </div>

  <h2>Expected Use Cases</h2>
  <ol class="use-case-list">
    ${useCases.map(u => `<li>${esc(u)}</li>`).join('\n    ')}
  </ol>

  <h2>Bundle Contents</h2>
  <div class="bundle-contents">
    <div class="bundle-file">manifest.json</div><div class="bundle-desc">CMPSBL® software manifest with metadata</div>
    <div class="bundle-file">README.md</div><div class="bundle-desc">Usage instructions and quick-start guide</div>
    <div class="bundle-file">README.html</div><div class="bundle-desc">Print-ready documentation (this style)</div>
    <div class="bundle-file">LICENSE</div><div class="bundle-desc">CMPSBL® proprietary license terms</div>
    <div class="bundle-file">LICENSE.html</div><div class="bundle-desc">Formatted license certificate</div>
    <div class="bundle-file">DETAILS.html</div><div class="bundle-desc">This product specification document</div>
    <div class="bundle-file">src/</div><div class="bundle-desc">Sealed runtime entry point</div>
    <div class="bundle-file">_runtime/</div><div class="bundle-desc">CMPSBL® Mini-Runtime™ Engine</div>
    <div class="bundle-file">test/</div><div class="bundle-desc">Auto-generated test harness</div>
  </div>

  <div class="ornament">· · ·</div>

  <h2>Runtime Information</h2>
  <div class="section-card">
    <p>
      This ${input.kind} includes the <strong>CMPSBL® Mini-Runtime™ Engine</strong> — a zero-dependency, 
      pure TypeScript in-memory runtime providing CJPI scoring, auto-tiering, Saga orchestration, 
      memory chain composition, and finite state machine capabilities. It supports the full 
      40-primitive taxonomy: Organs (infrastructure), Layers (governance), Engines (processing), 
      and Agents (autonomous actors).
    </p>
    <p style="font-size: 0.82rem; color: var(--ink-muted); font-style: italic;">
      The runtime is delivered as a sealed distribution to protect proprietary cognitive logic. 
      It operates independently and requires no external infrastructure.
    </p>
  </div>

  <div class="colophon">
    Generated by the CMPSBL® Export System<br>
    <span class="mono">${esc(exportDate)}</span><br>
    © ${new Date().getFullYear()} CMPSBL®. All rights reserved.
    <div class="colophon-mark">CMPSBL®</div>
  </div>

</div>
</body>
</html>`;
}
