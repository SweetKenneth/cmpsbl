/**
 * @cmpsbl/cli — Contextual Suggestions Engine
 * Smart next-step hints and error recovery with brand colors.
 *
 * © CMPSBL® — All rights reserved.
 */

import { c } from './ui';

export interface Suggestion {
  command: string;
  description: string;
}

const COMMAND_GRAPH: Record<string, Suggestion[]> = {
  init: [
    { command: 'cmpsbl dream', description: 'Trigger your first dream cycle' },
    { command: 'cmpsbl status', description: 'Check your substrate status' },
    { command: 'cmpsbl demo', description: 'Take a 2-minute guided tour' },
  ],
  dream: [
    { command: 'cmpsbl stream', description: 'View discovered memory chains' },
    { command: 'cmpsbl loadout', description: 'Browse & deploy pre-built loadouts' },
    { command: 'cmpsbl reflect', description: 'Reflect on resonance patterns' },
  ],
  discover: [
    { command: 'cmpsbl stream', description: 'View discovered memory chains' },
    { command: 'cmpsbl dream', description: 'Dream on what you discovered' },
    { command: 'cmpsbl export', description: 'Export discoveries as artifact pack' },
  ],
  stream: [
    { command: 'cmpsbl discover "topic"', description: 'Discover more memory chains' },
    { command: 'cmpsbl remember "input"', description: 'Store something in memory' },
    { command: 'cmpsbl dream', description: 'Run a dream cycle on current chains' },
  ],
  think: [
    { command: 'cmpsbl dream', description: 'Let the substrate synthesize autonomously' },
    { command: 'cmpsbl reflect', description: 'Replay resonance patterns' },
    { command: 'cmpsbl predict "scenario"', description: 'Forecast outcomes' },
  ],
  reflect: [
    { command: 'cmpsbl think "prompt"', description: 'Deep reasoning on a topic' },
    { command: 'cmpsbl dream', description: 'Dream on reflected patterns' },
    { command: 'cmpsbl stream', description: 'View accumulated chains' },
  ],
  remember: [
    { command: 'cmpsbl stream', description: 'View memory stream' },
    { command: 'cmpsbl forget <id>', description: 'Prune a memory chain' },
    { command: 'cmpsbl think "about it"', description: 'Reason about stored memory' },
  ],
  forget: [
    { command: 'cmpsbl stream', description: 'View remaining chains' },
    { command: 'cmpsbl remember "new input"', description: 'Store something new' },
  ],
  forge: [
    { command: 'cmpsbl explain FORGE', description: 'Learn about Signal Forge' },
    { command: 'cmpsbl dream', description: 'Dream to feed more discoveries' },
    { command: 'cmpsbl export', description: 'Export blueprints' },
  ],
  harvest: [
    { command: 'cmpsbl remember "findings"', description: 'Store extracted data' },
    { command: 'cmpsbl think "about data"', description: 'Reason about harvested signals' },
  ],
  translate: [
    { command: 'cmpsbl think "deeper analysis"', description: 'Deep reasoning on text' },
    { command: 'cmpsbl scan', description: 'Check accessibility of content' },
  ],
  sandbox: [
    { command: 'cmpsbl threat "code"', description: 'Threat-check execution output' },
    { command: 'cmpsbl audit', description: 'Compliance report on execution' },
  ],
  scan: [
    { command: 'cmpsbl explain INCLUSIVE', description: 'Learn about the INCLUSIVE Agent' },
    { command: 'cmpsbl audit', description: 'Run compliance audit' },
    { command: 'cmpsbl predict "remediation impact"', description: 'Predict fix outcomes' },
  ],
  predict: [
    { command: 'cmpsbl think "scenario"', description: 'Reason about predictions' },
    { command: 'cmpsbl dream', description: 'Synthesize from prediction signals' },
  ],
  audit: [
    { command: 'cmpsbl govern', description: 'Check governance policies' },
    { command: 'cmpsbl treaty', description: 'Review trust contracts' },
    { command: 'cmpsbl cost', description: 'Usage and cost report' },
  ],
  cost: [
    { command: 'cmpsbl audit', description: 'Compliance audit' },
    { command: 'cmpsbl benchmark', description: 'Benchmark latencies' },
    { command: 'cmpsbl govern', description: 'Check cost policies' },
  ],
  threat: [
    { command: 'cmpsbl immune', description: 'Check immunity system' },
    { command: 'cmpsbl explain DEFENSE', description: 'Learn about DEFENSE Layer' },
  ],
  immune: [
    { command: 'cmpsbl threat "test input"', description: 'Run threat analysis' },
    { command: 'cmpsbl health', description: 'Full health report' },
  ],
  govern: [
    { command: 'cmpsbl treaty', description: 'Review trust contracts' },
    { command: 'cmpsbl audit', description: 'Compliance audit' },
  ],
  treaty: [
    { command: 'cmpsbl govern', description: 'Check governance mode' },
    { command: 'cmpsbl explain TREATY', description: 'Learn about TREATY Layer' },
  ],
  demo: [
    { command: 'cmpsbl explain <PRIMITIVE>', description: 'Learn about any of the 40 primitives' },
    { command: 'cmpsbl shell', description: 'Interactive exploration' },
    { command: 'cmpsbl dream', description: 'Run your own dream cycle' },
  ],
  explain: [
    { command: 'cmpsbl demo', description: 'Take the guided tour' },
    { command: 'cmpsbl topology', description: 'View category topology' },
  ],
  status: [
    { command: 'cmpsbl health', description: 'Detailed health report across all nodes' },
    { command: 'cmpsbl nodes', description: 'Browse the full node registry' },
    { command: 'cmpsbl benchmark', description: 'Run latency benchmarks' },
  ],
  health: [
    { command: 'cmpsbl inspect <NODE>', description: 'Deep-inspect an underperforming node' },
    { command: 'cmpsbl doctor', description: 'Run full diagnostic suite' },
    { command: 'cmpsbl immune', description: 'Check immunity system' },
  ],
  nodes: [
    { command: 'cmpsbl explain <NODE>', description: 'Learn about a primitive' },
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect a node in detail' },
    { command: 'cmpsbl topology', description: 'View sector topology map' },
  ],
  ping: [
    { command: 'cmpsbl inspect <NODE>', description: 'Get full node details' },
    { command: 'cmpsbl benchmark', description: 'Benchmark all nodes' },
  ],
  inspect: [
    { command: 'cmpsbl explain <NODE>', description: 'Quick reference for this primitive' },
    { command: 'cmpsbl route "intent"', description: 'Trace intent routing' },
    { command: 'cmpsbl logs <NODE>', description: 'View recent logs' },
  ],
  topology: [
    { command: 'cmpsbl explain <NODE>', description: 'Learn about any primitive' },
    { command: 'cmpsbl nodes', description: 'Full node registry' },
  ],
  route: [
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect a node from the route' },
    { command: 'cmpsbl explain INTENT', description: 'Learn about intent resolution' },
  ],
  doctor: [
    { command: 'cmpsbl init', description: 'Initialize missing configuration' },
    { command: 'cmpsbl login', description: 'Authenticate if API key is missing' },
    { command: 'cmpsbl health', description: 'Check node health' },
  ],
  watch: [
    { command: 'cmpsbl logs <NODE>', description: 'View historical logs' },
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect node state' },
  ],
  logs: [
    { command: 'cmpsbl watch <NODE>', description: 'Watch live activity' },
    { command: 'cmpsbl inspect <NODE>', description: 'Deep inspect' },
  ],
  score: [
    { command: 'cmpsbl loadout', description: 'Browse & deploy pre-built loadouts' },
    { command: 'cmpsbl stream', description: 'View memory stream' },
  ],
  config: [
    { command: 'cmpsbl whoami', description: 'Check your identity' },
    { command: 'cmpsbl doctor', description: 'Verify configuration' },
  ],
  validate: [
    { command: 'cmpsbl export <file>', description: 'Generate export bundle' },
    { command: 'cmpsbl diff', description: 'Compare manifest versions' },
  ],
  export: [
    { command: 'cmpsbl validate <file>', description: 'Validate the export' },
    { command: 'cmpsbl stream', description: 'Review memory chains' },
  ],
  benchmark: [
    { command: 'cmpsbl health', description: 'Correlate with health data' },
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect slowest node' },
  ],
  diff: [
    { command: 'cmpsbl validate <file>', description: 'Validate a manifest' },
    { command: 'cmpsbl changelog', description: 'View CLI changelog' },
  ],
  login: [
    { command: 'cmpsbl init', description: 'Initialize your project' },
    { command: 'cmpsbl whoami', description: 'Verify your identity' },
    { command: 'cmpsbl demo', description: 'Take the guided tour' },
  ],
  logout: [
    { command: 'cmpsbl login', description: 'Re-authenticate' },
  ],
  whoami: [
    { command: 'cmpsbl config', description: 'View configuration' },
    { command: 'cmpsbl status', description: 'Substrate status' },
  ],
  changelog: [
    { command: 'cmpsbl version', description: 'Check current version' },
    { command: 'cmpsbl help', description: 'View all commands' },
  ],
  shell: [
    { command: 'status', description: 'Check substrate status (no prefix needed)' },
    { command: 'explain BRAIN', description: 'Learn about a primitive' },
    { command: 'exit', description: 'Leave REPL mode' },
  ],
};

export function getSuggestions(command: string): Suggestion[] {
  return COMMAND_GRAPH[command] ?? COMMAND_GRAPH.status ?? [];
}

export function printSuggestions(command: string): void {
  const suggestions = getSuggestions(command);
  if (suggestions.length === 0) return;

  console.log('');
  console.log(`  ${c.muted('─── Next steps ────────────────────────────')}`);
  for (const s of suggestions) {
    console.log(`    ${c.cyan('→')} ${c.bold(s.command)}`);
    console.log(`      ${c.muted(s.description)}`);
  }
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Error Recovery
// ═══════════════════════════════════════════════════════════════

export interface RecoverySuggestion {
  message: string;
  fix: string;
}

const ERROR_PATTERNS: Array<{ pattern: RegExp; recovery: RecoverySuggestion }> = [
  { pattern: /api.key|CMPSBL_API_KEY|unauthorized|401/i, recovery: { message: 'API key is missing or invalid.', fix: 'Run `cmpsbl login` or set CMPSBL_API_KEY environment variable.' } },
  { pattern: /not found|404|no such/i, recovery: { message: 'Resource not found.', fix: 'Run `cmpsbl nodes` to see available nodes, or `cmpsbl help` for commands.' } },
  { pattern: /manifest|cmpsbl-manifest/i, recovery: { message: 'Manifest file is missing or invalid.', fix: 'Run `cmpsbl init` to create a new project manifest.' } },
  { pattern: /timeout|ETIMEDOUT|ECONNREFUSED/i, recovery: { message: 'Connection timed out.', fix: 'Check your network, or set CMPSBL_ENDPOINT for a custom endpoint.' } },
  { pattern: /permission|forbidden|403/i, recovery: { message: 'Permission denied.', fix: 'Your API key may lack the required scope. Check `cmpsbl whoami` for details.' } },
  { pattern: /rate.limit|429|too many/i, recovery: { message: 'Rate limit reached.', fix: 'Wait a moment and retry, or upgrade your tier for higher limits.' } },
];

export function getErrorRecovery(error: string | Error): RecoverySuggestion | null {
  const msg = typeof error === 'string' ? error : error.message;
  for (const { pattern, recovery } of ERROR_PATTERNS) {
    if (pattern.test(msg)) return recovery;
  }
  return null;
}

export function printErrorRecovery(error: string | Error): void {
  const recovery = getErrorRecovery(error);
  if (!recovery) {
    console.log(`\n  ${c.warn('⚠')} An unexpected error occurred. Run ${c.cyan('cmpsbl doctor')} for diagnostics.\n`);
    return;
  }
  console.log('');
  console.log(`  ${c.error('⚠')} ${recovery.message}`);
  console.log(`  ${c.cyan('↳')} ${recovery.fix}`);
  console.log('');
}
