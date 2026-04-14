/**
 * Expansion Module Terminal Handlers
 * 16 expansion modules ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

let registered = false;

const EXPANSION_MODULES = [
  { id: 'sovereign',  name: 'SOVEREIGN',  codename: 'Dominion',   desc: 'Jurisdictional compliance & data sovereignty' },
  { id: 'oracle',     name: 'ORACLE',     codename: 'Pythia',     desc: 'Predictive analytics & forecasting' },
  { id: 'conscience', name: 'CONSCIENCE', codename: 'Arbiter',    desc: 'Ethical governance & bias detection' },
  { id: 'phantom',    name: 'PHANTOM',    codename: 'Specter',    desc: 'Privacy engineering & data masking' },
  { id: 'forge',      name: 'FORGE',      codename: 'Foundry',    desc: 'Artifact manufacturing & code generation' },
  { id: 'lingua',     name: 'LINGUA',     codename: 'Rosetta',    desc: 'Translation & multi-language support' },
  { id: 'compass',    name: 'COMPASS',    codename: 'Meridian',   desc: 'Strategic navigation & trend analysis' },
  { id: 'echo',       name: 'ECHO',       codename: 'Resonance',  desc: 'Event replay & temporal simulation' },
  { id: 'treaty',     name: 'TREATY',     codename: 'Accord',     desc: 'Inter-system agreements & SLA management' },
  { id: 'harvest',    name: 'HARVEST',    codename: 'Reaper',     desc: 'Data collection & ETL pipelines' },
  { id: 'reflex',     name: 'REFLEX',     codename: 'Impulse',    desc: 'Edge computing & real-time response' },
  { id: 'medic',      name: 'MEDIC',      codename: 'Triage',     desc: 'Autonomous diagnostics & node recovery' },
  { id: 'nerve',      name: 'NERVE',      codename: 'Synapse',    desc: 'Inter-node signaling & event propagation' },
  { id: 'evolution',  name: 'EVOLUTION',  codename: 'Darwin',     desc: 'Mutation pipeline & governed upgrades' },
  { id: 'immunity',   name: 'IMMUNITY',   codename: 'Sentinel',   desc: 'Self-healing mesh & threat correlation' },
  { id: 'shadow',     name: 'SHADOW',     codename: 'Umbra',      desc: 'Shadow environment validation & staging' },
] as const;

// Domain commands per expansion module
const DOMAIN_COMMANDS: Record<string, string[]> = {
  sovereign: ['jurisdictions', 'compliance', 'classify', 'residency', 'transfer', 'policies', 'violations'],
  oracle: ['predict', 'forecasts', 'accuracy', 'bayesian', 'anomalies', 'confidence', 'retrain'],
  conscience: ['evaluate', 'bias', 'fairness', 'audit', 'framework', 'overrides', 'score'],
  phantom: ['anonymize', 'mask', 'vault', 'compliance'],
  forge: ['templates', 'build', 'artifacts', 'queue'],
  lingua: ['translate', 'bridges', 'schemas'],
  compass: ['bearing', 'regions', 'forecast', 'patterns'],
  echo: ['simulate', 'twins', 'replay', 'scenarios'],
  treaty: ['contracts', 'sla', 'negotiate', 'penalties', 'compliance', 'enforce', 'terms'],
  harvest: ['pipelines', 'ingest', 'schedule', 'sources'],
  reflex: ['latency', 'rules', 'nodes', 'decisions'],
  medic: ['diagnose', 'prescribe', 'triage', 'repairs'],
  nerve: ['signals', 'consensus', 'propagate', 'channels'],
  evolution: ['proposals', 'mutations', 'gate', 'canary', 'rollback'],
  immunity: ['mesh', 'signatures', 'cascade', 'training'],
  shadow: ['compare', 'promote', 'validate', 'runs'],
};

export function registerExpansionHandlers(): void {
  if (registered) return;
  registered = true;

  // Overview command
  registerHandler('expansion.status', bridge('expansion', 'status'));
  registerHandler('expansion.list', bridge('expansion', 'list'));

  // Per-module: generic + domain commands
  for (const mod of EXPANSION_MODULES) {
    const lower = mod.id;
    const domainCmds = DOMAIN_COMMANDS[lower] ?? [];

    // Standard commands
    registerHandler(`${lower}.status`, bridge(lower, 'status'));
    registerHandler(`${lower}.health`, bridge(lower, 'health'));
    registerHandler(`${lower}.hardening`, bridge(lower, 'hardening'));
    registerHandler(`${lower}.resilience`, bridge(lower, 'resilience'));

    // Domain-specific commands
    for (const action of domainCmds) {
      registerHandler(`${lower}.${action}`, bridge(lower, action));
    }

    // Help (local UI formatting)
    const allCommands = ['status', 'health', 'hardening', 'resilience', ...domainCmds];
    registerHandler(`${lower}.help`, async () => ({
      success: true,
      output: `${mod.name} (${mod.codename}) — ${mod.desc}\n\nCommands:\n${allCommands.map(c => `  ${lower}.${c}`).join('\n')}`,
    }));
  }

  // Aggregate status command
  registerHandler('expansion.health', bridge('expansion', 'health'));

  log.info('terminal', 'Expansion handlers registered via substrate bridge (16 modules)', { count: EXPANSION_MODULES.length * 6 + 3 });
}
