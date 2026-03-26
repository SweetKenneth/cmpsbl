import { describe, expect, it } from 'vitest';

import { shadow } from './probe';

describe('shadow probe', () => {
  it('runs baseline and candidate in parallel', async () => {
    const baseline = async (_input: { value: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 60));
      return { source: 'baseline' };
    };

    const candidate = async (_input: { value: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 60));
      return { source: 'candidate' };
    };

    const startedAt = performance.now();
    const result = await shadow(baseline, candidate, { value: 'x' });
    const elapsedMs = performance.now() - startedAt;

    expect(result.baseline).toEqual({ source: 'baseline' });
    expect(result.candidate).toEqual({ source: 'candidate' });
    expect(result.match).toBe(false);
    expect(elapsedMs).toBeLessThan(115);
  });

  it('preserves baseline result when candidate throws', async () => {
    const result = await shadow(
      async () => ({ ok: true }),
      async () => {
        throw new Error('candidate exploded');
      },
      {},
    );

    expect(result.baseline).toEqual({ ok: true });
    expect(result.candidate).toBeNull();
    expect(result.candidateError).toBe('candidate exploded');
    expect(result.match).toBe(false);
  });
});