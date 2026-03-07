/**
 * Pipeline Details Page Generator
 * Creates an HTML details page for each exported pipeline artifact.
 * Includes in-depth description, use cases, and AI valuation with disclaimer.
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

  // Always include general use cases
  base.push(
    'Integration into existing enterprise software architectures',
    'Standalone deployment as a containerized microservice',
    'Research and development for novel software capabilities',
  );

  // Deduplicate
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

export function generatePipelineDetailsHTML(input: PipelineDetailsInput): string {
  const functionalDesc = getFunctionalDescription(input.name, input.systemChain);
  const useCases = getUseCases(input.category, input.name, input.systemChain);
  const tier = getTierFromScore(input.score);
  const valuation = getValuationBreakdown(input.score, input.category, input.systemChain.length);
  const exportDate = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(input.name)} — Pipeline Details</title>
  <style>
    :root {
      --bg: #0a0a0b;
      --surface: #111113;
      --border: #1e1e22;
      --text: #e4e4e7;
      --muted: #71717a;
      --primary: #10b981;
      --primary-dim: #10b98133;
      --amber: #f59e0b;
      --amber-dim: #f59e0b22;
      --red: #ef4444;
      --red-dim: #ef444422;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      padding: 2rem;
      max-width: 860px;
      margin: 0 auto;
    }
    h1 { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
    h2 { font-size: 1.1rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.15em; margin: 2.5rem 0 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    h3 { font-size: 0.95rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
    p { margin-bottom: 1rem; color: var(--muted); font-size: 0.875rem; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid; }
    .badge-primary { color: var(--primary); background: var(--primary-dim); border-color: var(--primary); }
    .badge-amber { color: var(--amber); background: var(--amber-dim); border-color: var(--amber); }
    .badge-muted { color: var(--muted); background: var(--border); border-color: var(--border); }
    .score { font-size: 3rem; font-weight: 900; color: var(--primary); }
    .score-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.15em; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }
    .stat-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1rem; font-weight: 700; color: var(--text); }
    ul { list-style: none; padding: 0; }
    ul li { position: relative; padding-left: 1.25rem; margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--muted); }
    ul li::before { content: '→'; position: absolute; left: 0; color: var(--primary); font-weight: bold; }
    .disclaimer { background: var(--red-dim); border: 1px solid var(--red); border-radius: 0.75rem; padding: 1.25rem; margin: 2rem 0; }
    .disclaimer-title { color: var(--red); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .disclaimer p { color: var(--muted); font-size: 0.8rem; margin-bottom: 0.5rem; }
    .disclaimer p:last-child { margin-bottom: 0; }
    .valuation-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .valuation-table td { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .valuation-table td:last-child { text-align: right; font-weight: 700; color: var(--text); }
    .valuation-table tr:last-child td { border-bottom: 2px solid var(--primary); }
    .valuation-total { font-size: 1.5rem; font-weight: 900; color: var(--primary); }
    .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.7rem; color: var(--muted); text-align: center; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0; }
  </style>
</head>
<body>

  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem;">
    <div>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
        <span class="badge badge-primary">${escapeHtml(tier)} Tier</span>
        <span class="badge badge-amber">CJPI ${input.score}</span>
        <span class="badge badge-muted">${escapeHtml(input.category.toUpperCase())}</span>
      </div>
      <h1>${escapeHtml(input.name)}</h1>
      <p style="color: var(--text); font-size: 0.95rem; margin-bottom: 0.25rem;">${escapeHtml(functionalDesc)}</p>
      ${input.fingerprint ? `<p style="font-size: 0.7rem; color: var(--muted);">Fingerprint: ${escapeHtml(input.fingerprint)}</p>` : ''}
    </div>
    <div style="text-align: right;">
      <div class="score">${input.score}</div>
      <div class="score-label">CJPI Score${input.score === 100 ? ' · Perfect' : ''}</div>
    </div>
  </div>

  <h2>What This Pipeline Does</h2>
  <div class="card">
    <p style="color: var(--text); font-size: 0.9rem; line-height: 1.8;">
      ${escapeHtml(input.description)}
    </p>
    <p style="margin-top: 1rem;">
      This pipeline was autonomously discovered by the Memory Stream — a recursive engine that
      monitors substrate system behavior and crystallizes viable software configurations into
      production-grade pipelines. It was not designed by a human; it emerged from the interaction
      of ${input.systemChain.length} substrate system${input.systemChain.length !== 1 ? 's' : ''} 
      operating in concert.
    </p>
    <div class="tag-list">
      ${input.systemChain.map(s => `<span class="badge badge-muted">${escapeHtml(s)}</span>`).join('\n      ')}
    </div>
  </div>

  <h2>Where This Could Be Useful</h2>
  <div class="card">
    <ul>
      ${useCases.map(uc => `<li>${escapeHtml(uc)}</li>`).join('\n      ')}
    </ul>
  </div>

  <h2>Quality Assessment</h2>
  <div class="grid-2">
    <div class="card">
      <div class="stat-label">CJPI Score</div>
      <div class="stat-value" style="color: var(--primary); font-size: 1.5rem;">${input.score} / 100</div>
      <p style="margin-top: 0.5rem; font-size: 0.8rem;">
        The Crown Jewel Pipeline Index (CJPI) is a composite quality score evaluating novelty,
        utility, complexity, and composability. Scores above 95 qualify for Apex tier.
      </p>
    </div>
    <div class="card">
      <div class="stat-label">Tier Classification</div>
      <div class="stat-value">${escapeHtml(tier)}</div>
      <p style="margin-top: 0.5rem; font-size: 0.8rem;">
        ${tier === 'Apex' ? 'Apex tier represents the top ~5% of all discoveries — pipelines with exceptional quality, novelty, and practical utility.' :
          tier === 'Enterprise' ? 'Enterprise tier pipelines demonstrate high quality and are suitable for production deployment in commercial environments.' :
          tier === 'Architect' ? 'Architect tier pipelines show strong fundamentals and can serve as building blocks for larger systems.' :
          'Creator tier pipelines provide functional capabilities suitable for development and experimentation.'}
      </p>
    </div>
  </div>

  <h2>AI Valuation Estimate</h2>

  <div class="disclaimer">
    <div class="disclaimer-title">⚠ AI-Generated Estimate — Not Financial Advice</div>
    <p>
      The valuation below is generated by an AI model using heuristic scoring based on the pipeline's
      CJPI score, category, and complexity. <strong>This estimate may be significantly inaccurate</strong>
      and should not be used as the basis for any financial, investment, or business decision.
    </p>
    <p>
      Actual market value depends on factors this model cannot assess, including market demand,
      competitive landscape, implementation cost, regulatory requirements, and integration complexity.
      Treat this as a rough directional indicator only.
    </p>
  </div>

  <div class="card">
    <table class="valuation-table">
      <tr>
        <td style="color: var(--muted);">Base value (CJPI ${input.score})</td>
        <td>${formatMarketValue(valuation.baseValue)}</td>
      </tr>
      <tr>
        <td style="color: var(--muted);">Category multiplier (${escapeHtml(input.category)})${valuation.categoryLabel ? ` — ${escapeHtml(valuation.categoryLabel)}` : ''}</td>
        <td>×${valuation.categoryMultiplier.toFixed(1)}</td>
      </tr>
      <tr>
        <td style="color: var(--muted);">Complexity factor (${input.systemChain.length} systems)</td>
        <td>×${valuation.complexityMultiplier.toFixed(2)}</td>
      </tr>
      ${valuation.apexMultiplier > 1 ? `<tr>
        <td style="color: var(--muted);">Apex tier premium</td>
        <td>×${valuation.apexMultiplier.toFixed(1)}</td>
      </tr>` : ''}
      <tr>
        <td style="color: var(--primary); font-weight: 700;">Estimated Value</td>
        <td class="valuation-total">${valuation.formatted}</td>
      </tr>
    </table>
    <p style="margin-top: 1rem; font-size: 0.75rem; color: var(--muted); font-style: italic;">
      Methodology: Base value scales exponentially with CJPI (range $5K–$500K). Category, complexity, 
      and tier multipliers are applied based on historical demand patterns. This is a heuristic model, 
      not a market appraisal.
    </p>
  </div>

  <h2>Export Details</h2>
  <div class="grid-2">
    <div class="card">
      <div class="stat-label">Available Languages</div>
      <div class="tag-list">
        ${input.exportLanguages.map(l => `<span class="badge badge-muted">${escapeHtml(l)}</span>`).join('\n        ')}
      </div>
    </div>
    <div class="card">
      <div class="stat-label">Export Metadata</div>
      <div style="font-size: 0.8rem; color: var(--muted); line-height: 2;">
        Source: ${escapeHtml(input.source || 'Memory Stream')}<br>
        ${input.obtainedAt ? `Crystallized: ${escapeHtml(new Date(input.obtainedAt).toLocaleDateString())}<br>` : ''}
        Exported: ${escapeHtml(new Date(exportDate).toLocaleDateString())}<br>
        Systems: ${input.systemChain.length}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Generated by the CMPSBL Memory Stream Export System</p>
    <p style="margin-top: 0.25rem;">Pipeline details are auto-generated. Descriptions and valuations are AI estimates and may contain inaccuracies.</p>
    <p style="margin-top: 0.25rem;">${escapeHtml(exportDate)}</p>
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
