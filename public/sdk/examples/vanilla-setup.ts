/**
 * Example: Vanilla Developer Setup
 *
 * Traditional integration — no AI agents, no vibe coding.
 * Install the SDK, configure, call. That's it.
 *
 * Works in Node.js, Deno, Bun, or any TypeScript project.
 */

import { SubstrateClient } from '../substrate-client';

// ── 1. Initialize ───────────────────────────────────────────
const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!,
  appId: process.env.APP_ID!,
});

// ── 2. Persistent Memory ────────────────────────────────────
async function memoryExample() {
  // Store knowledge
  await substrate.brain.remember(
    'Customer prefers weekly email digests',
    'preference',
    0.9
  );

  // Retrieve by semantic search
  const results = await substrate.brain.query('customer preferences', 5);
  console.log('Memories:', results.data);

  // Trigger reflection (consolidates and prunes)
  await substrate.brain.reflect();
}

// ── 3. AI Routing ───────────────────────────────────────────
async function routingExample() {
  // Auto-routes to fastest/cheapest available provider
  const response = await substrate.nexus.route(
    'Summarize this document in 3 bullet points'
  );
  console.log('AI Response:', response.data?.content);

  // Check which providers are online
  const providers = await substrate.nexus.providers();
  console.log('Available providers:', providers.data);
}

// ── 4. Security / Bot Detection ─────────────────────────────
async function securityExample(requestIp: string, headers: Record<string, string>) {
  // Analyze an incoming request
  const check = await substrate.defense.analyze({
    fingerprint: headers,
    ip: requestIp,
  });

  if (!check.data?.allowed) {
    console.warn('Request blocked:', check.data?.reason);
    return false;
  }

  // IP reputation lookup
  const rep = await substrate.defense.reputation(requestIp);
  console.log('IP Reputation:', rep.data);

  return true;
}

// ── 5. Observability ────────────────────────────────────────
async function healthExample() {
  // Quick health check (great for /healthz endpoints)
  const snapshot = await substrate.vision.healthSnapshot();
  console.log('System health:', snapshot.data?.overall_health);

  // Full metrics
  const metrics = await substrate.vision.metrics();
  console.log('Metrics:', metrics.data);

  // Recent logs filtered by module
  const logs = await substrate.vision.logs('brain', 25);
  console.log('Brain logs:', logs.data);
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log('=== Vanilla Developer Setup ===\n');

  await memoryExample();
  await routingExample();
  await healthExample();
}

main().catch(console.error);

export { memoryExample, routingExample, securityExample, healthExample };
