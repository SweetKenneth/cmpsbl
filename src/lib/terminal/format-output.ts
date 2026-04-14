/**
 * Unified Output Formatter
 * pf-substrate returns structured JSON → each surface formats for its display
 * 
 * Terminal: box-drawing characters
 * CLI: chalk/color (handled in @cmpsbl/cli)
 * API: raw JSON passthrough
 */

export type OutputFormat = 'terminal' | 'cli' | 'json';

export interface FormattedOutput {
  lines: string[];
  raw: unknown;
}

/**
 * Format a substrate response for terminal display
 * Detects shape and renders with box-drawing characters
 */
export function formatForTerminal(data: Record<string, unknown>): FormattedOutput {
  // If already has formatted output, pass through
  if (data.formatted && Array.isArray(data.formatted)) {
    return { lines: data.formatted as string[], raw: data };
  }

  // If has string output, split into lines
  if (typeof data.output === 'string') {
    return { lines: data.output.split('\n'), raw: data };
  }

  // Status response pattern
  if ('module' in data && 'health' in data) {
    return formatStatusResponse(data);
  }

  // List/array pattern
  if ('items' in data && Array.isArray(data.items)) {
    return formatListResponse(data);
  }

  // Error pattern
  if (data.success === false && data.error) {
    return formatErrorResponse(data);
  }

  // Generic key-value fallback
  return formatGenericResponse(data);
}

function formatStatusResponse(data: Record<string, unknown>): FormattedOutput {
  const mod = String(data.module || 'unknown').toUpperCase();
  const health = data.health as number ?? 0;
  const status = String(data.status || 'unknown');
  const version = data.version ? ` v${data.version}` : '';
  const personality = data.personality ? `  ${data.personality}` : '';
  const latency = data.latency_ms ? `${data.latency_ms}ms` : '—';

  const healthBar = renderHealthBar(health);

  const lines = [
    '',
    `┌─ ${mod}${version} ${'─'.repeat(Math.max(1, 50 - mod.length - version.length))}`,
    `│`,
    `│  Status:      ${status === 'healthy' ? '✅' : '⚠️'}  ${status.toUpperCase()}`,
    `│  Health:      ${healthBar} ${health}%`,
    `│  Latency:     ${latency}`,
  ];

  if (personality) {
    lines.push(`│  Personality: ${personality}`);
  }

  // Extract diagnostics if present
  const diag = data.diagnostics as Record<string, unknown> | undefined;
  if (diag) {
    lines.push(`│`);
    lines.push(`│  ┌─ Diagnostics ─────────────────────────────`);
    for (const [key, val] of Object.entries(diag)) {
      if (val !== null && val !== undefined && typeof val !== 'object') {
        lines.push(`│  │  ${key.padEnd(20)} ${String(val)}`);
      }
    }
    lines.push(`│  └──────────────────────────────────────────`);
  }

  // Extract capabilities if present
  const caps = data.capabilities as string[] | undefined;
  if (caps && Array.isArray(caps) && caps.length > 0) {
    lines.push(`│`);
    lines.push(`│  Capabilities: ${caps.length}`);
  }

  lines.push(`│`);
  lines.push(`└${'─'.repeat(55)}`);
  lines.push('');

  return { lines, raw: data };
}

function formatListResponse(data: Record<string, unknown>): FormattedOutput {
  const items = data.items as Array<Record<string, unknown>>;
  const title = String(data.title || data.module || 'Results').toUpperCase();

  const lines = [
    '',
    `┌─ ${title} (${items.length}) ${'─'.repeat(Math.max(1, 45 - title.length))}`,
    `│`,
  ];

  for (const item of items.slice(0, 50)) {
    const name = String(item.name || item.id || '—');
    const status = item.status ? ` [${String(item.status)}]` : '';
    lines.push(`│  • ${name}${status}`);
  }

  if (items.length > 50) {
    lines.push(`│  ... and ${items.length - 50} more`);
  }

  lines.push(`│`);
  lines.push(`└${'─'.repeat(55)}`);
  lines.push('');

  return { lines, raw: data };
}

function formatErrorResponse(data: Record<string, unknown>): FormattedOutput {
  const lines = [
    '',
    `┌─ ERROR ${'─'.repeat(48)}`,
    `│`,
    `│  ❌ ${String(data.error)}`,
    `│`,
    `└${'─'.repeat(55)}`,
    '',
  ];
  return { lines, raw: data };
}

function formatGenericResponse(data: Record<string, unknown>): FormattedOutput {
  const lines = [
    '',
    `┌─ RESPONSE ${'─'.repeat(44)}`,
    `│`,
  ];

  for (const [key, val] of Object.entries(data)) {
    if (key === 'success') continue;
    if (val === null || val === undefined) continue;
    if (typeof val === 'object') {
      lines.push(`│  ${key}: [${Array.isArray(val) ? `${(val as unknown[]).length} items` : 'object'}]`);
    } else {
      lines.push(`│  ${key.padEnd(18)} ${String(val)}`);
    }
  }

  lines.push(`│`);
  lines.push(`└${'─'.repeat(55)}`);
  lines.push('');

  return { lines, raw: data };
}

function renderHealthBar(health: number): string {
  const filled = Math.round(health / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

/**
 * Format for JSON output (API surface — passthrough)
 */
export function formatForJson(data: Record<string, unknown>): unknown {
  return data;
}

/**
 * Auto-format based on target surface
 */
export function formatSubstrateOutput(
  data: Record<string, unknown>,
  format: OutputFormat = 'terminal'
): FormattedOutput | unknown {
  switch (format) {
    case 'terminal':
      return formatForTerminal(data);
    case 'json':
      return formatForJson(data);
    case 'cli':
      // CLI handles its own formatting via chalk
      return formatForJson(data);
    default:
      return formatForTerminal(data);
  }
}
