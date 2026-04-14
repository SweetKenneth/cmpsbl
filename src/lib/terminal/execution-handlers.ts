/**
 * Execution Layer Terminal Handlers
 * DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, EVOLUTION
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerExecutionHandlers(): void {
  // ═══ DECODE ═══
  registerHandler('decode.status', bridge('decode', 'status'));
  registerHandler('decode.interpret', bridge('decode', 'interpret'));
  registerHandler('decode.personality', bridge('decode', 'personality'));
  registerHandler('decode.personality_set', bridge('decode', 'personality_set'));
  registerHandler('decode.personality_detect', bridge('decode', 'personality_detect'));
  registerHandler('decode.personality_lock', bridge('decode', 'personality_lock'));
  registerHandler('decode.personality_unlock', bridge('decode', 'personality_unlock'));
  registerHandler('decode.health', bridge('decode', 'health'));

  // ═══ NEXUS ═══
  registerHandler('nexus.status', bridge('nexus', 'status'));
  registerHandler('nexus.query', bridge('nexus', 'query'));
  registerHandler('nexus.routes', bridge('nexus', 'routes'));
  registerHandler('nexus.budget', bridge('nexus', 'budget'));
  registerHandler('nexus.providers', bridge('nexus', 'providers'));
  registerHandler('nexus.health', bridge('nexus', 'health'));

  // ═══ VISION ═══
  registerHandler('vision.status', bridge('vision', 'status'));
  registerHandler('vision.scan', bridge('vision', 'scan'));
  registerHandler('vision.screenshot', bridge('vision', 'screenshot'));
  registerHandler('vision.accessibility', bridge('vision', 'accessibility'));
  registerHandler('vision.health', bridge('vision', 'health'));

  // ═══ CORTEX ═══
  registerHandler('cortex.status', bridge('cortex', 'status'));
  registerHandler('cortex.pipeline', bridge('cortex', 'pipeline'));
  registerHandler('cortex.pipelines', bridge('cortex', 'pipelines'));
  registerHandler('cortex.cognitive', bridge('cortex', 'cognitive'));
  registerHandler('cortex.health', bridge('cortex', 'health'));

  // ═══ INCLUSIVE ═══
  registerHandler('inclusive.status', bridge('inclusive', 'status'));
  registerHandler('inclusive.scan', bridge('inclusive', 'scan'));
  registerHandler('inclusive.report', bridge('inclusive', 'report'));
  registerHandler('inclusive.health', bridge('inclusive', 'health'));

  // ═══ INTEGRATION ═══
  registerHandler('integration.status', bridge('integration', 'status'));
  registerHandler('integration.pulse', bridge('integration', 'pulse'));
  registerHandler('integration.adapters', bridge('integration', 'adapters'));
  registerHandler('integration.connections', bridge('integration', 'connections'));
  registerHandler('integration.discovered', bridge('integration', 'discovered'));
  registerHandler('integration.mapped_commands', bridge('integration', 'mapped_commands'));
  registerHandler('integration.policies', bridge('integration', 'policies'));
  registerHandler('integration.audit_log', bridge('integration', 'audit_log'));
  registerHandler('integration.connect', bridge('integration', 'connect'));
  registerHandler('integration.disconnect', bridge('integration', 'disconnect'));
  registerHandler('integration.health', bridge('integration', 'health'));

  // ═══ EVOLUTION (canonical + legacy modernizer.* aliases) ═══
  registerHandler('evolution.status', bridge('evolution', 'status'));
  registerHandler('evolution.scan', bridge('evolution', 'scan'));
  registerHandler('evolution.propose', bridge('evolution', 'propose'));
  registerHandler('evolution.apply', bridge('evolution', 'apply'));
  registerHandler('evolution.verify', bridge('evolution', 'verify'));
  registerHandler('evolution.plans', bridge('evolution', 'plans'));
  registerHandler('evolution.runs', bridge('evolution', 'runs'));
  registerHandler('evolution.health', bridge('evolution', 'health'));
  registerHandler('evolution.evolve', bridge('evolution', 'evolve'));

  // Legacy aliases
  registerHandler('modernizer.status', bridge('evolution', 'status'));
  registerHandler('modernizer.scan', bridge('evolution', 'scan'));
  registerHandler('modernizer.propose', bridge('evolution', 'propose'));
  registerHandler('modernizer.apply', bridge('evolution', 'apply'));
  registerHandler('modernizer.verify', bridge('evolution', 'verify'));
  registerHandler('modernizer.plans', bridge('evolution', 'plans'));
  registerHandler('modernizer.runs', bridge('evolution', 'runs'));
  registerHandler('modernizer.health', bridge('evolution', 'health'));

  // ═══ HELP COMMANDS (local UI formatting) ═══

  registerHandler('decode.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ DECODE — Intent Translator ───────────────┐',
      '│  decode.status           Module status          │',
      '│  decode.interpret <t>    Parse intent           │',
      '│  decode.personality      Current personality    │',
      '│  decode.personality_set  Set personality        │',
      '│  decode.inbox            CLM inbox              │',
      '│  decode.health           Health score           │',
      '│  decode.hardening        Hardening (Cipher)     │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('nexus.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ NEXUS — AI Router ────────────────────────┐',
      '│  nexus.status     Module status                │',
      '│  nexus.query <p>  Route AI query               │',
      '│  nexus.routes     Route statistics             │',
      '│  nexus.budget     Budget status                │',
      '│  nexus.providers  Provider fleet               │',
      '│  nexus.health     Health score                 │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('vision.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ VISION — Perception Engine ───────────────┐',
      '│  vision.status          Module status           │',
      '│  vision.scan <url>      Scan URL               │',
      '│  vision.screenshot      Screenshot URL         │',
      '│  vision.accessibility   A11y scan              │',
      '│  vision.health          Health score           │',
      '│  vision.hardening       Hardening (Sentinel)   │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('cortex.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ CORTEX — Orchestrator ────────────────────┐',
      '│  cortex.status     Module status               │',
      '│  cortex.pipeline   Pipeline details            │',
      '│  cortex.pipelines  List all pipelines          │',
      '│  cortex.cognitive  Cognitive cycle             │',
      '│  cortex.health     Health score                │',
      '│  cortex.hardening  Hardening (Conductor)       │',
      '│  cortex.synergy.*  200 synergy pipelines       │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('inclusive.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ INCLUSIVE — Accessibility ─────────────────┐',
      '│  inclusive.status   Module status               │',
      '│  inclusive.scan     Accessibility scan          │',
      '│  inclusive.report   Latest report               │',
      '│  inclusive.health   Health score                │',
      '│  inclusive.hardening Hardening (Clarity)        │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('integration.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ INTEGRATION — Enterprise Adapters ────────┐',
      '│  integration.status      Module status          │',
      '│  integration.pulse       Heartbeat              │',
      '│  integration.adapters    Adapter registry       │',
      '│  integration.connections Active connections     │',
      '│  integration.discovered  Discovered services    │',
      '│  integration.policies    Policies               │',
      '│  integration.audit_log   Audit trail            │',
      '│  integration.health      Health score           │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('modernizer.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ EVOLUTION — Self-Improvement Engine ──────┐',
      '│  evolution.status    Primitive status            │',
      '│  evolution.scan      Scan for upgrades          │',
      '│  evolution.propose   Propose evolution          │',
      '│  evolution.apply     Apply plan                 │',
      '│  evolution.verify    Verify run                 │',
      '│  evolution.plans     Active plans               │',
      '│  evolution.runs      Run history                │',
      '│  evolution.health    Health score               │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('evolution.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ EVOLUTION — Self-Improvement Engine ──────┐',
      '│  evolution.status    Primitive status            │',
      '│  evolution.scan      Scan for upgrades          │',
      '│  evolution.propose   Propose evolution          │',
      '│  evolution.apply     Apply plan                 │',
      '│  evolution.verify    Verify run                 │',
      '│  evolution.plans     Active plans               │',
      '│  evolution.runs      Run history                │',
      '│  evolution.health    Health score               │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Execution handlers registered via substrate bridge (DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, EVOLUTION)', { count: 75 });
}
