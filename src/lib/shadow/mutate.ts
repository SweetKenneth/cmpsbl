/**
 * Shadow Mesh — Adversarial Input Mutation
 * Generates adversarial/edge-case inputs for shadow probing pilot executors
 */

/**
 * Generate adversarial inputs based on a seed input
 */
export function generateAdversarialInputs(seed?: Record<string, unknown>): Record<string, unknown>[] {
  const inputs: Record<string, unknown>[] = [
    // Nulls / undefined
    {},
    { content: null },
    { target: null, url: null },
    // Empty strings
    { content: '' },
    { target: '', url: '' },
    // Huge strings
    { content: 'x'.repeat(100_000) },
    // Wrong types
    { content: 12345 },
    { content: true },
    { content: [1, 2, 3] },
    { target: { nested: 'object' } },
    { wcagLevel: 'ZZZZ' },
    { preferences: 'not-an-object' },
    // Unicode / special chars
    { content: '🔥'.repeat(1000) },
    { content: '\x00\x01\x02\x03' },
    { target: '<script>alert(1)</script>' },
    { content: '"; DROP TABLE users; --' },
    // Missing expected fields
    { irrelevant_key: 'value' },
    // Prototype pollution attempt
    { userId: { __proto__: 'polluted' } },
    // Array instead of object fields
    { ariaLabel: [1, 2, 3] },
  ];

  // If seed provided, add mutated variants
  if (seed && typeof seed === 'object') {
    inputs.push(
      { ...seed, content: null },
      { ...seed, target: undefined },
      { ...seed, wcagLevel: 999 },
    );
  }

  return inputs;
}
