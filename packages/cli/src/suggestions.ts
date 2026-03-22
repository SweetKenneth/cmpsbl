/**
 * @cmpsbl/cli — Contextual Suggestions Engine
 * Smart next-step hints and error recovery.
 *
 * © CMPSBL® — All rights reserved.
 */

export interface Suggestion {
  command: string;
  description: string;
}

const COMMAND_GRAPH: Record<string, Suggestion[]> = {
  init: [
    { command: 'cmpsbl status', description: 'Check your substrate status' },
    { command: 'cmpsbl discover "your domain"', description: 'Start live discovery' },
    { command: 'cmpsbl doctor', description: 'Run diagnostics on your setup' },
  ],
  discover: [
    { command: 'cmpsbl stream', description: 'View discovered memory chains' },
    { command: 'cmpsbl discover "another topic"', description: 'Discover more patterns' },
    { command: 'cmpsbl export', description: 'Export discoveries as artifact pack' },
  ],
  stream: [
    { command: 'cmpsbl discover "topic"', description: 'Discover more memory chains' },
    { command: 'cmpsbl export cmpsbl-manifest.json', description: 'Export current chains' },
    { command: 'cmpsbl score 80 90 70 85', description: 'Score a capability with CJPI' },
  ],
  status: [
    { command: 'cmpsbl health', description: 'Detailed health report across all nodes' },
    { command: 'cmpsbl nodes', description: 'Browse the full node registry' },
    { command: 'cmpsbl benchmark', description: 'Run latency benchmarks' },
  ],
  health: [
    { command: 'cmpsbl inspect <NODE>', description: 'Deep-inspect an underperforming node' },
    { command: 'cmpsbl doctor', description: 'Run full diagnostic suite' },
    { command: 'cmpsbl ping <NODE>', description: 'Ping a specific node' },
  ],
  nodes: [
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect a node in detail' },
    { command: 'cmpsbl ping <NODE>', description: 'Ping a node for latency' },
    { command: 'cmpsbl topology', description: 'View sector topology map' },
  ],
  ping: [
    { command: 'cmpsbl inspect <NODE>', description: 'Get full node details' },
    { command: 'cmpsbl benchmark', description: 'Benchmark all nodes' },
    { command: 'cmpsbl health', description: 'Check overall health' },
  ],
  inspect: [
    { command: 'cmpsbl route "intent"', description: 'Trace how intents route through this node' },
    { command: 'cmpsbl logs <NODE>', description: 'View recent logs for this node' },
    { command: 'cmpsbl watch <NODE>', description: 'Live-watch node activity' },
  ],
  topology: [
    { command: 'cmpsbl nodes CCR', description: 'Filter nodes by sector' },
    { command: 'cmpsbl route "intent"', description: 'Trace intent routing path' },
    { command: 'cmpsbl benchmark', description: 'Benchmark all sectors' },
  ],
  route: [
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect a node from the route' },
    { command: 'cmpsbl discover "related topic"', description: 'Discover related patterns' },
    { command: 'cmpsbl benchmark', description: 'Benchmark route latency' },
  ],
  doctor: [
    { command: 'cmpsbl init', description: 'Initialize missing configuration' },
    { command: 'cmpsbl login', description: 'Authenticate if API key is missing' },
    { command: 'cmpsbl health', description: 'Check node health' },
  ],
  watch: [
    { command: 'cmpsbl logs <NODE>', description: 'View historical logs' },
    { command: 'cmpsbl health', description: 'Check overall health' },
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect node state' },
  ],
  logs: [
    { command: 'cmpsbl watch <NODE>', description: 'Watch live activity' },
    { command: 'cmpsbl inspect <NODE>', description: 'Deep inspect' },
    { command: 'cmpsbl health', description: 'Overall health report' },
  ],
  score: [
    { command: 'cmpsbl discover "related input"', description: 'Find related patterns' },
    { command: 'cmpsbl export', description: 'Export as artifact' },
    { command: 'cmpsbl stream', description: 'View memory stream' },
  ],
  config: [
    { command: 'cmpsbl whoami', description: 'Check your identity' },
    { command: 'cmpsbl status', description: 'View substrate status' },
    { command: 'cmpsbl doctor', description: 'Verify configuration' },
  ],
  validate: [
    { command: 'cmpsbl export <file>', description: 'Generate export bundle' },
    { command: 'cmpsbl score', description: 'Score with CJPI' },
    { command: 'cmpsbl diff', description: 'Compare manifest versions' },
  ],
  export: [
    { command: 'cmpsbl validate <file>', description: 'Validate the export' },
    { command: 'cmpsbl stream', description: 'Review memory chains' },
    { command: 'cmpsbl discover "new topic"', description: 'Continue discovering' },
  ],
  benchmark: [
    { command: 'cmpsbl health', description: 'Correlate with health data' },
    { command: 'cmpsbl inspect <NODE>', description: 'Inspect slowest node' },
    { command: 'cmpsbl topology', description: 'View sector layout' },
  ],
  diff: [
    { command: 'cmpsbl validate <file>', description: 'Validate a manifest' },
    { command: 'cmpsbl export <file>', description: 'Export updated manifest' },
    { command: 'cmpsbl changelog', description: 'View CLI changelog' },
  ],
  login: [
    { command: 'cmpsbl init', description: 'Initialize your project' },
    { command: 'cmpsbl whoami', description: 'Verify your identity' },
    { command: 'cmpsbl status', description: 'Check substrate status' },
  ],
  logout: [
    { command: 'cmpsbl login', description: 'Re-authenticate' },
    { command: 'cmpsbl whoami', description: 'Check identity state' },
  ],
  whoami: [
    { command: 'cmpsbl config', description: 'View configuration' },
    { command: 'cmpsbl login', description: 'Authenticate or re-auth' },
    { command: 'cmpsbl status', description: 'Substrate status' },
  ],
  changelog: [
    { command: 'cmpsbl version', description: 'Check current version' },
    { command: 'cmpsbl help', description: 'View all commands' },
  ],
  shell: [
    { command: 'status', description: 'Check substrate status (no prefix needed in shell)' },
    { command: 'discover "topic"', description: 'Start discovery' },
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
  console.log('  ─── Next steps ────────────────────────────');
  for (const s of suggestions) {
    console.log(`    → ${s.command}`);
    console.log(`      ${s.description}`);
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
  {
    pattern: /api.key|CMPSBL_API_KEY|unauthorized|401/i,
    recovery: {
      message: 'API key is missing or invalid.',
      fix: 'Run `cmpsbl login` or set CMPSBL_API_KEY environment variable.',
    },
  },
  {
    pattern: /not found|404|no such/i,
    recovery: {
      message: 'Resource not found.',
      fix: 'Run `cmpsbl nodes` to see available nodes, or `cmpsbl help` for commands.',
    },
  },
  {
    pattern: /manifest|cmpsbl-manifest/i,
    recovery: {
      message: 'Manifest file is missing or invalid.',
      fix: 'Run `cmpsbl init` to create a new project manifest.',
    },
  },
  {
    pattern: /timeout|ETIMEDOUT|ECONNREFUSED/i,
    recovery: {
      message: 'Connection timed out.',
      fix: 'Check your network, or set CMPSBL_ENDPOINT for a custom endpoint.',
    },
  },
  {
    pattern: /permission|forbidden|403/i,
    recovery: {
      message: 'Permission denied.',
      fix: 'Your API key may lack the required scope. Check `cmpsbl whoami` for details.',
    },
  },
  {
    pattern: /rate.limit|429|too many/i,
    recovery: {
      message: 'Rate limit reached.',
      fix: 'Wait a moment and retry, or upgrade your tier for higher limits.',
    },
  },
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
    console.log('\n  ⚠ An unexpected error occurred. Run `cmpsbl doctor` for diagnostics.\n');
    return;
  }
  console.log('');
  console.log(`  ⚠ ${recovery.message}`);
  console.log(`  ↳ ${recovery.fix}`);
  console.log('');
}
