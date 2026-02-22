/**
 * Evolution Mesh — Shadow Probe
 * Execute candidate code paths in parallel without risk.
 */

export interface ShadowResult<T = any> {
  baseline: T;
  candidate: T | null;
  candidateError?: string;
  match: boolean;
  durationMs: { baseline: number; candidate: number };
}

/**
 * Run a function in shadow mode: execute both baseline and candidate,
 * return baseline result but capture candidate for comparison.
 */
export async function shadow<TInput extends Record<string, unknown>, TOutput>(
  baseline: (input: TInput) => Promise<TOutput>,
  candidate: (input: TInput) => Promise<TOutput>,
  input: TInput,
): Promise<ShadowResult<TOutput>> {
  const baselineStart = performance.now();
  const baselineResult = await baseline(input);
  const baselineDuration = performance.now() - baselineStart;

  let candidateResult: TOutput | null = null;
  let candidateError: string | undefined;
  const candidateStart = performance.now();

  try {
    candidateResult = await candidate(input);
  } catch (err) {
    candidateError = err instanceof Error ? err.message : 'unknown';
  }

  const candidateDuration = performance.now() - candidateStart;

  // Simple equality check (deep comparison would be a premium feature)
  let match = false;
  try {
    match = JSON.stringify(baselineResult) === JSON.stringify(candidateResult);
  } catch {
    match = false;
  }

  return {
    baseline: baselineResult,
    candidate: candidateResult,
    candidateError,
    match,
    durationMs: {
      baseline: Math.round(baselineDuration),
      candidate: Math.round(candidateDuration),
    },
  };
}
