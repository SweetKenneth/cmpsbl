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
  const candidateStart = performance.now();

  const baselineRun = baseline(input).then((result) => ({
    result,
    duration: performance.now() - baselineStart,
  }));

  const candidateRun = candidate(input)
    .then((result) => ({
      result,
      error: undefined,
      duration: performance.now() - candidateStart,
    }))
    .catch((err) => ({
      result: null,
      error: err instanceof Error ? err.message : 'unknown',
      duration: performance.now() - candidateStart,
    }));

  const [baselineOutcome, candidateOutcome] = await Promise.allSettled([baselineRun, candidateRun]);

  if (baselineOutcome.status === 'rejected') {
    throw baselineOutcome.reason;
  }

  const baselineResult = baselineOutcome.value.result;
  const baselineDuration = baselineOutcome.value.duration;
  const candidateResult = candidateOutcome.status === 'fulfilled' ? candidateOutcome.value.result : null;
  const candidateError = candidateOutcome.status === 'fulfilled' ? candidateOutcome.value.error : 'unknown';
  const candidateDuration = candidateOutcome.status === 'fulfilled' ? candidateOutcome.value.duration : performance.now() - candidateStart;

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
