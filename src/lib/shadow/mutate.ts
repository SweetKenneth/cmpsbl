/**
 * Shadow Mesh — Adversarial Input Mutation (v2)
 * 
 * Enhanced with archetype-aware mutations that test each
 * repair pathway more thoroughly.
 */

/**
 * Generate adversarial inputs based on a seed input.
 * v2: Expanded to cover all input archetypes for thorough testing.
 */
export function generateAdversarialInputs(seed?: Record<string, unknown>): Record<string, unknown>[] {
  const inputs: Record<string, unknown>[] = [
    // ── empty_shell archetype ──
    {},
    { content: null },
    { target: null, url: null },
    { content: '', target: '', url: '' },
    { content: undefined, userId: undefined },

    // ── type_mismatch archetype ──
    { content: 12345 },
    { content: true },
    { content: [1, 2, 3] },
    { target: { nested: 'object' } },
    { wcagLevel: 999 },
    { preferences: 'not-an-object' },
    { preferences: [1, 2, 3] },
    { userId: { __proto__: 'polluted' } },
    { ariaLabel: [1, 2, 3] },
    { content: { deeply: { nested: { value: 'here' } } } },

    // ── missing_required archetype ──
    { irrelevant_key: 'value' },
    { metadata: 'something', extra: true },
    { wcagLevel: 'AA' }, // has wcagLevel but no target/url/domain

    // ── oversized archetype ──
    { content: 'x'.repeat(100_000) },
    { content: '🔥'.repeat(5000) },
    { content: 'a\n'.repeat(500) },
    { target: 'a'.repeat(50_000) },

    // ── injection_attempt archetype ──
    { target: '<script>alert(1)</script>' },
    { content: '"; DROP TABLE users; --' },
    { url: 'javascript:alert(1)' },
    { content: '<img onerror="alert(1)" src=x>' },
    { domain: '../../etc/passwd' },
    { content: 'SELECT * FROM users WHERE 1=1; --' },

    // ── shape_alien archetype ──
    { foo: 'bar', baz: 42 },
    { x: null, y: null, z: null },

    // ── partial_valid archetype ──
    { content: 'valid content', wcagLevel: 'INVALID' },
    { url: 'https://example.com', content: null, target: 12345 },
    { userId: 'user-1', preferences: 'should-be-object' },
    { content: 'good', ariaLabel: [1, 2, 3], target: 'self' },

    // ── well_formed (should pass through) ──
    { content: 'Hello world', target: 'self' },
    { url: 'https://example.com', wcagLevel: 'AA' },
    { userId: 'user-123', preferences: { theme: 'dark' } },
    { content: 'Test content', ariaLabel: 'Test label' },

    // ── edge cases ──
    { content: '\x00\x01\x02\x03' },
    { content: '\u200B\u200C\u200D' }, // zero-width chars
    { content: 'NaN' },
    { content: 'undefined' },
    { content: '() => alert(1)' },
    { content: '&amp;lt;script&amp;gt;' }, // double-encoded
    { userId: '{}', preferences: '[]' },
  ];

  // If seed provided, add mutated variants
  if (seed && typeof seed === 'object') {
    inputs.push(
      { ...seed, content: null },
      { ...seed, target: undefined },
      { ...seed, wcagLevel: 999 },
      { ...seed, content: '<script>xss</script>' },
      { ...seed, userId: '' },
    );
  }

  return inputs;
}
