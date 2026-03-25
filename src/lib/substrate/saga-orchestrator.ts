/**
 * Saga Orchestrator — Multi-step transaction coordination with compensation
 * Ensures all-or-nothing semantics across distributed substrate operations
 */

type StepFn<C> = (context: C) => Promise<C>;

interface SagaStep<C> {
  name: string;
  execute: StepFn<C>;
  compensate: StepFn<C>;
}

interface SagaResult<C> {
  success: boolean;
  context: C;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  compensated: boolean;
}

export class Saga<C> {
  private steps: SagaStep<C>[] = [];
  readonly id: string;

  constructor(id: string) { this.id = id; }

  step(name: string, execute: StepFn<C>, compensate: StepFn<C>): this {
    this.steps.push({ name, execute, compensate });
    return this;
  }

  async run(initialContext: C): Promise<SagaResult<C>> {
    let context = initialContext;
    const completed: string[] = [];

    for (const step of this.steps) {
      try {
        context = await step.execute(context);
        completed.push(step.name);
      } catch (err) {
        // Compensate in reverse order using index (O(1) lookup vs O(n) find)
        let compensated = true;
        for (let i = completed.length - 1; i >= 0; i--) {
          try {
            context = await this.steps[i].compensate(context);
          } catch {
            compensated = false;
          }
        }

        return {
          success: false,
          context,
          completedSteps: completed,
          failedStep: step.name,
          error: err instanceof Error ? err.message : String(err),
          compensated,
        };
      }
    }

    return { success: true, context, completedSteps: completed, compensated: false };
  }
}

/** Factory */
export function createSaga<C>(id: string): Saga<C> {
  return new Saga<C>(id);
}

/**
 * Example usage:
 * const saga = createSaga<{ snapshotId?: string }>('evolution')
 *   .step('snapshot', async (ctx) => { ctx.snapshotId = 'abc'; return ctx; }, async (ctx) => { delete ctx.snapshotId; return ctx; })
 *   .step('apply', async (ctx) => ctx, async (ctx) => ctx);
 * const result = await saga.run({});
 */
