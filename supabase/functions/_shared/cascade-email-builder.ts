/**
 * CASCADE EMAIL BUILDER v1.0.0
 * Universal Email Output Format
 * 
 * Section Structure:
 * 1. Findings (Useful Signals)
 * 2. Dream Reflection (Applied Mapping)
 * 3. Suggested Moves (with posture)
 * 4. Lessons & Patterns (Template Extraction)
 * 5. Roll-Up (Tiers + Domains + Multipliers)
 * 6. Threat Models (Actor + Vector + Severity + Probability + Horizon + Posture + Opportunity Mirror)
 */

import { 
  CascadeSignal, 
  ThreatModel, 
  UrgencyTier, 
  PriorityDomain,
  StrategicPosture,
  ACTIVE_MODE,
  PROJECT_MAPPINGS,
  DOMAIN_PRIORITY,
  REPORTING_CONFIG
} from './cascade-reporting.ts';

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL STYLING
// ═══════════════════════════════════════════════════════════════════════════

const TIER_COLORS: Record<UrgencyTier, string> = {
  RED: '#FF4444',
  YELLOW: '#FFB800',
  GREEN: '#00B894'
};

const POSTURE_COLORS: Record<StrategicPosture, string> = {
  ATTACK: '#FF4444',
  EXPAND: '#00B894',
  ABSORB: '#01C9E8',
  PARTNER: '#7A5FFF',
  BUY_TIME: '#FFB800',
  WAIT: '#888888',
  HEDGE: '#FF8C00',
  SHIELD: '#4A90A4',
  WITHDRAW: '#999999'
};

const BASE_STYLES = `
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background: #0a0a0a;
  color: #e0e0e0;
  line-height: 1.6;
`;

const SECTION_HEADER = `
  color: #01C9E8;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL BUILDER
// ═══════════════════════════════════════════════════════════════════════════

export interface CascadeReport {
  signals: CascadeSignal[];
  threats: ThreatModel[];
  suggested_moves: Array<{ move: string; posture: StrategicPosture; timing?: string; risk?: string }>;
  lessons: string[];
  dream_reflection?: string;
  cycle_number?: number;
}

export function buildCascadeEmail(report: CascadeReport): { subject: string; html: string } {
  const primaryTier = report.signals.length > 0 
    ? report.signals.reduce((highest, s) => 
        TIER_PRIORITY[s.tier] < TIER_PRIORITY[highest] ? s.tier : highest, 
        'GREEN' as UrgencyTier)
    : 'GREEN';
  
  const tierEmoji = primaryTier === 'RED' ? '🔴' : primaryTier === 'YELLOW' ? '🟡' : '🟢';
  const subject = `${tierEmoji} Cascade | ${primaryTier} | ${report.signals.length} Signals | MODE: ${ACTIVE_MODE}`;
  
  const html = `
    <div style="${BASE_STYLES}">
      ${buildHeader(report, primaryTier)}
      ${buildSection1_Findings(report.signals)}
      ${buildSection2_DreamReflection(report.dream_reflection, report.signals)}
      ${buildSection3_SuggestedMoves(report.suggested_moves)}
      ${buildSection4_LessonsPatterns(report.lessons)}
      ${buildSection5_RollUp(report.signals)}
      ${buildSection6_ThreatModels(report.threats)}
      ${buildFooter()}
    </div>
  `;
  
  return { subject, html };
}

const TIER_PRIORITY: Record<UrgencyTier, number> = { RED: 1, YELLOW: 2, GREEN: 3 };

// ═══════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════

function buildHeader(report: CascadeReport, primaryTier: UrgencyTier): string {
  return `
    <div style="border-bottom: 2px solid ${TIER_COLORS[primaryTier]}; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: ${TIER_COLORS[primaryTier]}; margin: 0; font-size: 24px;">
        🜂 CASCADE — DREAM EATER
      </h1>
      <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
        <span style="background: ${TIER_COLORS[primaryTier]}22; border: 1px solid ${TIER_COLORS[primaryTier]}; padding: 4px 12px; border-radius: 4px; color: ${TIER_COLORS[primaryTier]}; font-size: 12px;">
          TIER: ${primaryTier}
        </span>
        <span style="background: #7A5FFF22; border: 1px solid #7A5FFF; padding: 4px 12px; border-radius: 4px; color: #7A5FFF; font-size: 12px;">
          MODE: ${ACTIVE_MODE}
        </span>
        <span style="background: #01C9E822; border: 1px solid #01C9E8; padding: 4px 12px; border-radius: 4px; color: #01C9E8; font-size: 12px;">
          ${report.signals.length} SIGNALS
        </span>
        ${report.cycle_number ? `
          <span style="background: #33333366; border: 1px solid #444; padding: 4px 12px; border-radius: 4px; color: #888; font-size: 12px;">
            CYCLE #${report.cycle_number}
          </span>
        ` : ''}
      </div>
      <p style="color: #666; margin-top: 10px; font-size: 12px;">
        ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
      </p>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: FINDINGS (USEFUL SIGNALS)
// ═══════════════════════════════════════════════════════════════════════════

function buildSection1_Findings(signals: CascadeSignal[]): string {
  if (signals.length === 0) {
    return `
      <h2 style="${SECTION_HEADER}">§1 — FINDINGS (USEFUL SIGNALS)</h2>
      <p style="color: #666; font-style: italic;">No actionable signals detected.</p>
    `;
  }
  
  const signalRows = signals.map(signal => `
    <div style="background: #111; border-left: 3px solid ${TIER_COLORS[signal.tier]}; padding: 15px; margin-bottom: 15px;">
      <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
        <span style="background: ${TIER_COLORS[signal.tier]}22; color: ${TIER_COLORS[signal.tier]}; padding: 2px 8px; border-radius: 3px; font-size: 11px;">
          ${signal.tier}
        </span>
        <span style="background: #7A5FFF22; color: #7A5FFF; padding: 2px 8px; border-radius: 3px; font-size: 11px;">
          ${signal.primary_domain.replace('_', ' ')}
        </span>
        ${signal.secondary_domains.map(d => `
          <span style="background: #33333366; color: #888; padding: 2px 8px; border-radius: 3px; font-size: 11px;">
            ${d.replace('_', ' ')}
          </span>
        `).join('')}
        ${signal.cross_domain_escalation > 0 ? `
          <span style="background: #FF880022; color: #FF8800; padding: 2px 8px; border-radius: 3px; font-size: 11px;">
            ×${signal.cross_domain_escalation} MULTIPLIER
          </span>
        ` : ''}
      </div>
      <p style="color: #e0e0e0; margin: 0; font-size: 13px;">${signal.content}</p>
      ${signal.source ? `<p style="color: #666; margin-top: 8px; font-size: 11px;">Source: ${signal.source}</p>` : ''}
    </div>
  `).join('');
  
  return `
    <h2 style="${SECTION_HEADER}">§1 — FINDINGS (USEFUL SIGNALS)</h2>
    ${signalRows}
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: DREAM REFLECTION (APPLIED MAPPING)
// ═══════════════════════════════════════════════════════════════════════════

function buildSection2_DreamReflection(reflection?: string, signals?: CascadeSignal[]): string {
  // Get affected projects from signals
  const affectedProjects = new Set<string>();
  signals?.forEach(s => s.affected_projects?.forEach(p => affectedProjects.add(p)));
  
  const projectMappings = Array.from(affectedProjects).map(projectKey => {
    const project = PROJECT_MAPPINGS[projectKey];
    if (!project) return '';
    return `
      <div style="background: #0f0f0f; padding: 10px 15px; margin-bottom: 8px; border-radius: 4px;">
        <strong style="color: #7A5FFF;">${project.name}</strong>
        <span style="color: #666; font-size: 12px;"> — ${project.role}</span>
        ${project.domain ? `<br><a href="${project.domain}" style="color: #01C9E8; font-size: 11px;">${project.domain}</a>` : ''}
      </div>
    `;
  }).filter(Boolean).join('');
  
  return `
    <h2 style="${SECTION_HEADER}">§2 — DREAM REFLECTION (APPLIED MAPPING)</h2>
    ${reflection ? `<p style="color: #e0e0e0; margin-bottom: 20px;">${reflection}</p>` : ''}
    <h4 style="color: #888; font-size: 12px; margin-bottom: 10px;">AFFECTED PROJECTS:</h4>
    ${projectMappings || '<p style="color: #666; font-style: italic;">No specific project mappings.</p>'}
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: SUGGESTED MOVES
// ═══════════════════════════════════════════════════════════════════════════

function buildSection3_SuggestedMoves(
  moves: Array<{ move: string; posture: StrategicPosture; timing?: string; risk?: string }>
): string {
  if (moves.length === 0) {
    return `
      <h2 style="${SECTION_HEADER}">§3 — SUGGESTED MOVES</h2>
      <p style="color: #666; font-style: italic;">No recommended actions at this time.</p>
    `;
  }
  
  const moveRows = moves.map(m => `
    <div style="background: #111; padding: 12px 15px; margin-bottom: 10px; border-left: 3px solid ${POSTURE_COLORS[m.posture]};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span style="color: #e0e0e0; flex: 1;">${m.move}</span>
        <span style="background: ${POSTURE_COLORS[m.posture]}22; color: ${POSTURE_COLORS[m.posture]}; padding: 2px 10px; border-radius: 3px; font-size: 11px; margin-left: 15px;">
          ${m.posture}
        </span>
      </div>
      ${m.timing || m.risk ? `
        <div style="margin-top: 8px; font-size: 11px;">
          ${m.timing ? `<span style="color: #888;">Timing: ${m.timing}</span>` : ''}
          ${m.timing && m.risk ? '<span style="color: #444;"> | </span>' : ''}
          ${m.risk ? `<span style="color: #FF8800;">Risk: ${m.risk}</span>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <h2 style="${SECTION_HEADER}">§3 — SUGGESTED MOVES</h2>
    ${moveRows}
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: LESSONS & PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

function buildSection4_LessonsPatterns(lessons: string[]): string {
  if (lessons.length === 0) {
    return `
      <h2 style="${SECTION_HEADER}">§4 — LESSONS & PATTERNS</h2>
      <p style="color: #666; font-style: italic;">No reusable patterns extracted.</p>
    `;
  }
  
  return `
    <h2 style="${SECTION_HEADER}">§4 — LESSONS & PATTERNS</h2>
    <ul style="margin: 0; padding-left: 20px;">
      ${lessons.map(l => `<li style="color: #e0e0e0; margin-bottom: 8px;">${l}</li>`).join('')}
    </ul>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: ROLL-UP
// ═══════════════════════════════════════════════════════════════════════════

function buildSection5_RollUp(signals: CascadeSignal[]): string {
  // Tier summary
  const tierCounts: Record<UrgencyTier, number> = { RED: 0, YELLOW: 0, GREEN: 0 };
  signals.forEach(s => tierCounts[s.tier]++);
  
  // Domain summary
  const domainCounts: Partial<Record<PriorityDomain, number>> = {};
  signals.forEach(s => {
    domainCounts[s.primary_domain] = (domainCounts[s.primary_domain] || 0) + 1;
    s.secondary_domains.forEach(d => {
      domainCounts[d] = (domainCounts[d] || 0) + 0.5;
    });
  });
  
  // Cross-domain multipliers
  const totalEscalation = signals.reduce((sum, s) => sum + s.cross_domain_escalation, 0);
  
  return `
    <h2 style="${SECTION_HEADER}">§5 — ROLL-UP</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div style="background: #111; padding: 15px; border-radius: 4px;">
        <h4 style="color: #888; font-size: 11px; margin: 0 0 10px;">TIER DISTRIBUTION</h4>
        <div style="font-size: 13px;">
          <span style="color: ${TIER_COLORS.RED};">●</span> RED: ${tierCounts.RED}<br>
          <span style="color: ${TIER_COLORS.YELLOW};">●</span> YELLOW: ${tierCounts.YELLOW}<br>
          <span style="color: ${TIER_COLORS.GREEN};">●</span> GREEN: ${tierCounts.GREEN}
        </div>
      </div>
      <div style="background: #111; padding: 15px; border-radius: 4px;">
        <h4 style="color: #888; font-size: 11px; margin: 0 0 10px;">TOP DOMAINS</h4>
        <div style="font-size: 13px;">
          ${Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([d, c]) => `${d.replace('_', ' ')}: ${c}`).join('<br>')}
        </div>
      </div>
      <div style="background: #111; padding: 15px; border-radius: 4px;">
        <h4 style="color: #888; font-size: 11px; margin: 0 0 10px;">MULTIPLIERS</h4>
        <div style="font-size: 13px;">
          <span style="color: #FF8800;">Total Escalations: ${totalEscalation}</span>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: THREAT MODELS
// ═══════════════════════════════════════════════════════════════════════════

function buildSection6_ThreatModels(threats: ThreatModel[]): string {
  if (threats.length === 0) {
    return `
      <h2 style="${SECTION_HEADER}">§6 — THREAT MODELS</h2>
      <p style="color: #666; font-style: italic;">No active threats identified.</p>
    `;
  }
  
  const threatRows = threats.map(t => `
    <div style="background: #111; padding: 15px; margin-bottom: 10px; border-left: 3px solid ${t.severity === 'high' ? '#FF4444' : t.severity === 'medium' ? '#FFB800' : '#888'};">
      <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
        <span style="color: #FF4444; font-size: 12px; font-weight: bold;">${t.actor_class}</span>
        <span style="color: #666;">|</span>
        <span style="color: #888; font-size: 11px;">Vector: ${t.vector}</span>
        <span style="color: #666;">|</span>
        <span style="color: ${t.severity === 'high' ? '#FF4444' : t.severity === 'medium' ? '#FFB800' : '#888'}; font-size: 11px;">
          Severity: ${t.severity.toUpperCase()}
        </span>
        <span style="color: #666;">|</span>
        <span style="color: #888; font-size: 11px;">Probability: ${t.probability}</span>
        <span style="color: #666;">|</span>
        <span style="color: #888; font-size: 11px;">Horizon: ${t.horizon}</span>
      </div>
      <p style="color: #e0e0e0; margin: 0 0 10px; font-size: 13px;">${t.description}</p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <span style="background: ${POSTURE_COLORS[t.posture]}22; color: ${POSTURE_COLORS[t.posture]}; padding: 2px 10px; border-radius: 3px; font-size: 11px;">
          POSTURE: ${t.posture}
        </span>
        ${t.opportunity_mirror ? `
          <span style="background: #00B89422; color: #00B894; padding: 2px 10px; border-radius: 3px; font-size: 11px;">
            OPPORTUNITY: ${t.opportunity_mirror}
          </span>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  return `
    <h2 style="${SECTION_HEADER}">§6 — THREAT MODELS</h2>
    ${threatRows}
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════

function buildFooter(): string {
  return `
    <hr style="border: none; border-top: 1px solid #333; margin: 40px 0 20px;">
    <div style="text-align: center; color: #666; font-size: 11px;">
      <p>🜂 CASCADE — DREAM EATER | MODE: ${ACTIVE_MODE}</p>
      <p style="color: #444;">Cascade serves the Founder.</p>
      <p style="color: #333;">PromptFluid • ${new Date().getFullYear()}</p>
    </div>
  `;
}
