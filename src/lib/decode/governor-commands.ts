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

  /** Query mesh_comms for recent inter-primitive communication */
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

  /** Recent DREAM syntheses derived from your governor intents (with full lineage) */
  dream: async () => {
    const { data: syn, error } = await supabase
      .from('dream_intent_syntheses')
      .select('id, insight_text, synthesis_kind, source_intent_ids, matched_fragment_ids, scoring, confidence, tags, status, cycle_id, metadata, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) return formatBlock('DREAM — ERROR', [error.message]);
    if (!syn || syn.length === 0) {
      return formatBlock('DREAM — NO SYNTHESES YET', [
        'DREAM has not yet promoted any intent clusters above the floor.',
        '',
        'Cycles run every 30m on captured governor intents.',
        'Use /dream-tune to inspect scoring weights and floor.',
      ]);
    }

    const lines: string[] = [];
    for (const s of syn) {
      const conf = (Number(s.confidence) * 100).toFixed(1);
      lines.push(`◈ [${conf}% · ${s.synthesis_kind}] ${(s.insight_text || '').slice(0, 220)}`);
      lines.push(`  sources: ${(s.source_intent_ids || []).length} intents · fragments: ${(s.matched_fragment_ids || []).length} · tags: ${(s.tags || []).slice(0, 5).join(', ') || '—'}`);
      const sc: any = s.scoring || {};
      lines.push(`  breakdown: tag=${sc.tag_overlap ?? '–'} vec=${sc.vector_resonance ?? '–'} pri=${sc.priority_weight ?? '–'} rec=${sc.recency_weight ?? '–'} → ${sc.total ?? '–'} (floor ${sc.promotion_floor ?? '–'})`);
      lines.push(`  id: ${s.id.slice(0, 8)} · cycle: ${s.cycle_id} · ${timeAgo(s.created_at)}`);
      lines.push('');
    }
    lines.push('Use /dream <id-prefix> to see full lineage including the source intent text.');
    return formatBlock(`DREAM SYNTHESES — ${syn.length} ACTIVE`, lines);
  },

  /** Show DREAM scoring weights and tunables */
  'dream-tune': async () => {
    // Pull cycle stats from recent syntheses to surface live distribution
    const { data: recent } = await supabase
      .from('dream_intent_syntheses')
      .select('confidence, scoring, created_at')
      .order('created_at', { ascending: false })
      .limit(40);

    const confs = (recent || []).map((r: any) => Number(r.confidence)).filter((n) => !isNaN(n));
    const avg = confs.length ? (confs.reduce((a, b) => a + b, 0) / confs.length) : 0;
    const min = confs.length ? Math.min(...confs) : 0;
    const max = confs.length ? Math.max(...confs) : 0;

    return formatBlock('DREAM TUNABLES — LIVE', [
      'engine:           dream-from-intent v1.0.0',
      'method:           algorithmic · deterministic · no LLM',
      '',
      '── weights ──',
      '  W_TAG          0.40   (jaccard tag overlap)',
      '  W_VECTOR       0.30   (cosine on intent embeddings)',
      '  W_PRIORITY     0.20   (avg normalized priority 1-10)',
      '  W_RECENCY      0.10   (exp decay, half-life ~36h)',
      '',
      '── thresholds ──',
      '  PROMOTION_FLOOR  0.55',
      '  MIN_CLUSTER_SIZE 2',
      '  MAX_CLUSTERS     8',
      '  RECENT_INTENTS   50',
      '',
      `── recent (n=${confs.length}) ──`,
      `  avg confidence  ${avg.toFixed(3)}`,
      `  min/max         ${min.toFixed(3)} / ${max.toFixed(3)}`,
      '',
      'To tune: edit supabase/functions/dream-from-intent/index.ts.',
    ]);
  },

  /** Force a DREAM cycle now */
  'dream-run': async () => {
    const { data, error } = await supabase.functions.invoke('dream-from-intent', { body: {} });
    if (error) return formatBlock('DREAM RUN — ERROR', [error.message || String(error)]);
    const d: any = data || {};
    return formatBlock('DREAM CYCLE EXECUTED', [
      `cycle:           ${d.cycle_id || '?'}`,
      `intents scanned: ${d.intents_scanned ?? 0}`,
      `clusters found:  ${d.clusters_found ?? 0}`,
      `promoted:        ${d.promoted ?? 0}`,
      `below floor:     ${d.below_floor ?? 0}`,
      `elapsed:         ${d.elapsed_ms ?? '?'}ms`,
      '',
      'Run /dream to view promoted syntheses.',
    ]);
  },

  /** Query audit_logs filtered to intent-related actions */
  intents: async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, entity_type, entity_id, details, created_at')
      .like('action', '%intent%')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !data || data.length === 0) {
      return formatBlock('INTENT ACTIVITY', ['No intent-related audit entries found.']);
    }

    const lines = data.map(r => {
      return `  ${timeAgo(r.created_at).padEnd(8)} ${(r.action || '?').padEnd(20)} ${r.entity_type || ''}`;
    });

    return formatBlock(`INTENT ACTIVITY — LAST ${data.length} ENTRIES`, lines);
  },
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
    '/dream [id]       — DREAM syntheses from your intents (lineage)',
    '/dream-tune       — DREAM scoring weights & live distribution',
    '/dream-run        — force a DREAM cycle now',
    '',
    'All commands query live database tables.',
    'Non-command messages still route to LLM.',
  ]);
}

// ─── Lineage drill-down for a single synthesis ──────────────────

async function dreamLineage(idPrefix: string): Promise<string> {
  const { data: rows, error } = await supabase
    .from('dream_intent_syntheses')
    .select('id, insight_text, synthesis_kind, source_intent_ids, matched_fragment_ids, scoring, confidence, tags, status, cycle_id, metadata, created_at')
    .ilike('id', `${idPrefix}%`)
    .limit(1);
  if (error) return formatBlock('DREAM LINEAGE — ERROR', [error.message]);
  const s: any = rows?.[0];
  if (!s) return formatBlock('DREAM LINEAGE — NOT FOUND', [`No synthesis matching "${idPrefix}".`]);

  const { data: intents } = await supabase
    .from('governor_intent_stream')
    .select('id, intent_text, scope, priority, tags, created_at')
    .in('id', s.source_intent_ids || []);

  const sc = s.scoring || {};
  const conf = (Number(s.confidence) * 100).toFixed(1);
  const lines: string[] = [
    `id:        ${s.id}`,
    `cycle:     ${s.cycle_id}`,
    `kind:      ${s.synthesis_kind}`,
    `confidence: ${conf}%   (floor ${sc.promotion_floor ?? '–'})`,
    `created:   ${timeAgo(s.created_at)}`,
    '',
    '── insight ──',
    s.insight_text,
    '',
    '── scoring breakdown ──',
    `  tag_overlap     ${sc.tag_overlap ?? '–'}   × W_TAG ${sc.weights?.W_TAG ?? '–'}`,
    `  vector_resonance ${sc.vector_resonance ?? '–'}  × W_VECTOR ${sc.weights?.W_VECTOR ?? '–'}`,
    `  priority_weight ${sc.priority_weight ?? '–'}   × W_PRIORITY ${sc.weights?.W_PRIORITY ?? '–'}`,
    `  recency_weight  ${sc.recency_weight ?? '–'}   × W_RECENCY ${sc.weights?.W_RECENCY ?? '–'}`,
    `  → total          ${sc.total ?? '–'}`,
    '',
    `── source intents (${(intents || []).length}) ──`,
  ];
  for (const it of (intents || []) as any[]) {
    const txt = (it.intent_text || '').replace(/\s+/g, ' ').trim();
    lines.push(`  • [pri ${it.priority} · ${it.scope}] ${txt.length > 200 ? txt.slice(0, 197) + '…' : txt}`);
    lines.push(`     tags: ${(it.tags || []).join(', ') || '—'}   ${timeAgo(it.created_at)}   id: ${it.id.slice(0, 8)}`);
  }
  return formatBlock('DREAM LINEAGE — FULL TRACE', lines);
}

// ─── Public Router ──────────────────────────────────────────────

export function isGovernorCommand(input: string): boolean {
  const cmd = input.trim().slice(1).trim().toLowerCase().split(/\s+/)[0];
  return [
    'govern', 'set-mode', 'health', 'caps', 'comms',
    'nexus', 'budget', 'audit', 'intents',
    'enable', 'disable', 'gov-help',
    'dream', 'dream-tune', 'dream-run',
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
    case 'dream':
      output = arg ? await dreamLineage(arg) : await GOVERNOR_COMMANDS.dream();
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
