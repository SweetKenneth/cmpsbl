/**
 * DECODE Governor Commands — Real System Operations
 * These commands query actual database tables and return real data.
 * Governor-only: gated by identityRole check before invocation.
 */

import { supabase } from '@/integrations/supabase/client';

export interface GovernorCommandResult {
  handled: boolean;
  output: string;
  async: true;
}

type GovernorHandler = () => Promise<string>;

function formatBlock(title: string, lines: string[]): string {
  const divider = '─'.repeat(Math.max(title.length, 32));
  return ['```', title, divider, ...lines, '```'].join('\n');
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}

// ─── Real Database Queries ──────────────────────────────────────

const GOVERNOR_COMMANDS: Record<string, GovernorHandler> = {

  /** Fetch governance mode from the governance_mode table */
  govern: async () => {
    const { data, error } = await supabase
      .from('governance_mode')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return formatBlock('GOVERNANCE MODE', ['⚠ Unable to read governance state.', error?.message || '']);
    }

    const d = data as any;
    return formatBlock('GOVERNANCE MODE — LIVE', [
      `mode:            ${d.mode || 'UNKNOWN'}`,
      `updated:         ${timeAgo(d.updated_at)}`,
      `changed by:      ${d.changed_by || 'system'}`,
      `reason:          ${d.reason || '—'}`,
      '',
      'Available: ACTIVE · OBSERVE · LOCKDOWN · EVOLVE',
      'Use /set-mode <MODE> to change.',
    ]);
  },

  /** Query atlas_capabilities for real capability states */
  caps: async () => {
    const { data, error } = await supabase
      .from('atlas_capabilities')
      .select('key, enabled, description, updated_at')
      .order('key')
      .limit(50);

    if (error || !data) {
      return formatBlock('CAPABILITIES', ['⚠ Unable to read capabilities.', error?.message || '']);
    }

    const enabled = data.filter(c => c.enabled);
    const disabled = data.filter(c => !c.enabled);

    return formatBlock(`ATLAS CAPABILITIES — ${data.length} REGISTERED`, [
      `enabled:   ${enabled.length}`,
      `disabled:  ${disabled.length}`,
      '',
      '── ENABLED ──',
      ...enabled.slice(0, 20).map(c => `  ✓ ${c.key}`),
      ...(enabled.length > 20 ? [`  ... +${enabled.length - 20} more`] : []),
      '',
      '── DISABLED ──',
      ...disabled.slice(0, 10).map(c => `  ✗ ${c.key}`),
      ...(disabled.length > 10 ? [`  ... +${disabled.length - 10} more`] : []),
    ]);
  },

  /** Query mesh_comms for recent inter-node communication */
  comms: async () => {
    const { data, error } = await supabase
      .from('mesh_comms')
      .select('source_module, target_module, category, translated_voice, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !data || data.length === 0) {
      return formatBlock('MESH COMMUNICATIONS', ['No recent mesh activity recorded.']);
    }

    const lines = data.map(c => {
      const time = timeAgo(c.created_at);
      const arrow = `${(c.source_module || '?').padEnd(10)} → ${(c.target_module || '?').padEnd(10)}`;
      return `  ${time.padEnd(8)} ${arrow} [${c.category || '?'}]`;
    });

    return formatBlock(`MESH COMMS — LAST ${data.length} EVENTS`, [
      ...lines,
      '',
      `Most recent: ${timeAgo(data[0]?.created_at)}`,
    ]);
  },

  /** Query analytics_snapshots for system health */
  health: async () => {
    const { data, error } = await supabase
      .from('analytics_snapshots')
      .select('snapshot_type, health_score, error_rate, active_modules, total_events, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) {
      return formatBlock('SYSTEM HEALTH', ['No health snapshots available.']);
    }

    const latest = data[0];
    const lines = [
      `health score:    ${latest.health_score ?? '—'}%`,
      `error rate:      ${latest.error_rate ?? '—'}%`,
      `active modules:  ${latest.active_modules ?? '—'}`,
      `total events:    ${latest.total_events?.toLocaleString() ?? '—'}`,
      `snapshot type:   ${latest.snapshot_type}`,
      `captured:        ${timeAgo(latest.created_at)}`,
    ];

    if (data.length > 1) {
      lines.push('', '── TREND (last 5) ──');
      data.forEach((s, i) => {
        lines.push(`  ${i + 1}. health=${s.health_score ?? '?'}%  err=${s.error_rate ?? '?'}%  ${timeAgo(s.created_at)}`);
      });
    }

    return formatBlock('SYSTEM HEALTH — LIVE', lines);
  },

  /** Query ai_usage_log for cost and provider metrics */
  nexus: async () => {
    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('provider, model, tokens_used, cost, success, response_time_ms, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      return formatBlock('NEXUS FLEET', ['No AI usage data available.']);
    }

    // Aggregate by provider
    const byProvider: Record<string, { calls: number; tokens: number; cost: number; failures: number }> = {};
    for (const row of data) {
      const p = row.provider || 'unknown';
      if (!byProvider[p]) byProvider[p] = { calls: 0, tokens: 0, cost: 0, failures: 0 };
      byProvider[p].calls++;
      byProvider[p].tokens += row.tokens_used || 0;
      byProvider[p].cost += row.cost || 0;
      if (!row.success) byProvider[p].failures++;
    }

    const lines: string[] = [];
    for (const [provider, stats] of Object.entries(byProvider)) {
      lines.push(`  ${provider.padEnd(16)} calls=${stats.calls}  tokens=${stats.tokens.toLocaleString()}  cost=$${(stats.cost / 100).toFixed(3)}  fail=${stats.failures}`);
    }

    const totalCost = data.reduce((s, r) => s + (r.cost || 0), 0);
    const avgLatency = Math.round(data.reduce((s, r) => s + (r.response_time_ms || 0), 0) / data.length);

    return formatBlock(`NEXUS FLEET — LAST ${data.length} CALLS`, [
      ...lines,
      '',
      `total cost:      $${(totalCost / 100).toFixed(3)}`,
      `avg latency:     ${avgLatency}ms`,
      `success rate:    ${Math.round((data.filter(r => r.success).length / data.length) * 100)}%`,
      `most recent:     ${timeAgo(data[0]?.created_at)}`,
    ]);
  },

  /** Query ai_daily_quota for budget status */
  budget: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('ai_daily_quota')
      .select('provider, calls_used, calls_budget, tokens_used, category, date')
      .order('date', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return formatBlock('AI BUDGET', ['No quota data available.']);
    }

    const todayData = data.filter(d => d.date === today);
    const lines = (todayData.length > 0 ? todayData : data.slice(0, 5)).map(q => {
      const pct = q.calls_budget ? Math.round(((q.calls_used || 0) / q.calls_budget) * 100) : 0;
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      return `  ${(q.provider || '?').padEnd(14)} ${bar} ${pct}%  (${q.calls_used || 0}/${q.calls_budget || '∞'})`;
    });

    return formatBlock(`AI BUDGET — ${todayData.length > 0 ? 'TODAY' : 'RECENT'}`, [
      ...lines,
      '',
      `date: ${todayData.length > 0 ? today : data[0]?.date || '?'}`,
    ]);
  },

  /** Query audit_logs for recent system actions */
  audit: async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, entity_type, entity_id, performed_by, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !data || data.length === 0) {
      return formatBlock('AUDIT LOG', ['No audit entries found.']);
    }

    const lines = data.map(a => {
      const time = timeAgo(a.created_at);
      return `  ${time.padEnd(8)} ${(a.action || '?').padEnd(20)} ${a.entity_type || ''}/${(a.entity_id || '').slice(0, 8)}`;
    });

    return formatBlock(`AUDIT LOG — LAST ${data.length} ENTRIES`, lines);
  },

  /** Query intent_receipts for recent intent execution */
  intents: async () => {
    const { data, error } = await supabase
      .from('intent_receipts')
      .select('intent_type, source_module, resolved_by, success, duration_ms, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !data || data.length === 0) {
      return formatBlock('INTENT RECEIPTS', ['No intent receipts found.']);
    }

    const successCount = data.filter(r => r.success).length;
    const avgDuration = Math.round(data.reduce((s, r) => s + (r.duration_ms || 0), 0) / data.length);

    const lines = data.map(r => {
      const icon = r.success ? '✓' : '✗';
      return `  ${icon} ${(r.intent_type || '?').padEnd(16)} ${(r.source_module || '?').padEnd(10)} → ${(r.resolved_by || '?').padEnd(10)} ${r.duration_ms || '?'}ms`;
    });

    return formatBlock(`INTENT MESH — LAST ${data.length} RECEIPTS`, [
      `success rate:    ${Math.round((successCount / data.length) * 100)}%`,
      `avg duration:    ${avgDuration}ms`,
      '',
      ...lines,
    ]);
  },

  /** Toggle a capability in atlas_capabilities */
  // Handled specially — see routeGovernorCommand
};

// ─── Governance Mode Setter ─────────────────────────────────────

async function setGovernanceMode(modeArg: string): Promise<string> {
  const validModes = ['ACTIVE', 'OBSERVE', 'LOCKDOWN', 'EVOLVE'];
  const target = modeArg.toUpperCase();
  if (!validModes.includes(target)) {
    return formatBlock('SET MODE — ERROR', [
      `"${modeArg}" is not a valid governance mode.`,
      '',
      `Valid modes: ${validModes.join(' · ')}`,
    ]);
  }

  const { error } = await supabase
    .from('governance_mode')
    .update({ mode: target, updated_at: new Date().toISOString() } as any)
    .not('id', 'is', null); // update all rows (singleton)

  if (error) {
    return formatBlock('SET MODE — FAILED', [`Database error: ${error.message}`]);
  }

  return formatBlock('GOVERNANCE MODE UPDATED', [
    `mode:    ${target}`,
    `at:      ${new Date().toISOString()}`,
    '',
    target === 'LOCKDOWN' ? '⚠ System in LOCKDOWN — evolution frozen, critical ops only.' :
    target === 'EVOLVE' ? '⚡ EVOLVE mode active — increased mutation velocity.' :
    target === 'OBSERVE' ? '👁 OBSERVE mode — read-only, no mutations.' :
    '✓ ACTIVE — normal operation resumed.',
  ]);
}

// ─── Capability Toggle ──────────────────────────────────────────

async function toggleCapability(key: string, enable: boolean): Promise<string> {
  const { data: existing } = await supabase
    .from('atlas_capabilities')
    .select('key, enabled')
    .eq('key', key)
    .maybeSingle();

  if (!existing) {
    return formatBlock('CAPABILITY — NOT FOUND', [`"${key}" is not a registered capability.`, '', 'Use /caps to see all registered capabilities.']);
  }

  if (existing.enabled === enable) {
    return formatBlock('CAPABILITY — NO CHANGE', [`"${key}" is already ${enable ? 'enabled' : 'disabled'}.`]);
  }

  const { error } = await supabase
    .from('atlas_capabilities')
    .update({ enabled: enable, updated_at: new Date().toISOString() } as any)
    .eq('key', key);

  if (error) {
    return formatBlock('CAPABILITY — ERROR', [error.message]);
  }

  return formatBlock(`CAPABILITY ${enable ? 'ENABLED' : 'DISABLED'}`, [
    `key:     ${key}`,
    `state:   ${enable ? '✓ ENABLED' : '✗ DISABLED'}`,
    `at:      ${new Date().toISOString()}`,
  ]);
}

// ─── Governor Help ──────────────────────────────────────────────

function governorHelp(): string {
  return formatBlock('GOVERNOR COMMANDS — LIVE SYSTEM', [
    '/govern           — governance mode (live query)',
    '/set-mode <MODE>  — change governance mode',
    '/health           — system health snapshots',
    '/caps             — atlas capability registry',
    '/enable <key>     — enable a capability',
    '/disable <key>    — disable a capability',
    '/comms            — recent mesh communications',
    '/nexus            — AI fleet usage & costs',
    '/budget           — daily AI quota status',
    '/audit            — recent audit log entries',
    '/intents          — intent mesh receipts',
    '',
    'All commands query live database tables.',
    'Non-command messages still route to LLM.',
  ]);
}

// ─── Public Router ──────────────────────────────────────────────

export function isGovernorCommand(input: string): boolean {
  const cmd = input.trim().slice(1).trim().toLowerCase().split(/\s+/)[0];
  return [
    'govern', 'set-mode', 'health', 'caps', 'comms',
    'nexus', 'budget', 'audit', 'intents',
    'enable', 'disable', 'gov-help',
  ].includes(cmd);
}

export async function routeGovernorCommand(input: string): Promise<GovernorCommandResult> {
  const parts = input.trim().slice(1).trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  let output: string;

  switch (cmd) {
    case 'gov-help':
      output = governorHelp();
      break;
    case 'set-mode':
      output = await setGovernanceMode(arg);
      break;
    case 'enable':
      output = await toggleCapability(arg, true);
      break;
    case 'disable':
      output = await toggleCapability(arg, false);
      break;
    default: {
      const handler = GOVERNOR_COMMANDS[cmd];
      if (!handler) {
        output = formatBlock('UNKNOWN GOVERNOR COMMAND', [`"${cmd}" not recognized.`, '', 'Type /gov-help for available commands.']);
      } else {
        output = await handler();
      }
    }
  }

  return { handled: true, output, async: true };
}
