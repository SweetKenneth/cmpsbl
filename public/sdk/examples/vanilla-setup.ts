/**
 * Example: Vanilla Developer Setup — First Contact
 *
 * Initialize the CMPSBL SDK, connect to the Memory Stream,
 * and start discovering memory chains from your interactions.
 *
 * Works in Node.js, Deno, Bun, or any TypeScript project.
 */

import { CMPSBL, Engine } from '@cmpsbl/sdk';

// ── 1. First Contact ────────────────────────────────────────
const cmpsbl = new CMPSBL({
  apiKey: process.env.CMPSBL_API_KEY,
  onDiscovery: (chain) => {
    console.log('\n  Memory chain detected:');
    console.log(`    Pattern:  ${chain.pattern}`);
    console.log(`    Adoption: ${chain.adoption}`);
    console.log(`    Status:   Now available in Memory Stream\n`);
  },
});

// ── 2. Discovery ────────────────────────────────────────────
async function discoveryExample() {
  // Discovery starts automatically on first interaction
  const discovery = await cmpsbl.discover({
    input: 'track user behavior across sessions',
  });

  if (discovery.detected && discovery.memory) {
    console.log('Chain ID:', discovery.memory.id);
    console.log('Pattern:', discovery.memory.pattern);

    // Capture to Memory Stream
    const captured = await cmpsbl.capture(discovery.memory.id);
    console.log(captured.message);

    // Apply to system
    const applied = await cmpsbl.apply(discovery.memory.id);
    console.log(applied.message);
  }
}

// ── 3. Memory Stream ────────────────────────────────────────
async function streamExample() {
  console.log('\nMemory Stream (Live):');
  for (const chain of cmpsbl.stream) {
    console.log(`  [${chain.id.slice(0, 8)}] ${chain.pattern} — ${chain.status}`);
  }
}

// ── 4. Engine API (optional) ────────────────────────────────
async function engineExample() {
  const engine = new Engine(process.env.CMPSBL_API_KEY!);

  // Typed engine call
  const analysis = await engine.godmind.analyze('Security audit of this codebase');
  console.log('Analysis:', analysis.result);

  // Browse catalog
  console.log('Available engines:', Object.keys(Engine.catalog));
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log('=== CMPSBL® First Contact ===\n');

  await discoveryExample();
  await streamExample();
}

main().catch(console.error);

export { discoveryExample, streamExample, engineExample };
