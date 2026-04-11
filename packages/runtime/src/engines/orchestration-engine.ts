export function wrapOrchestration<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function (this: any, ...args: any[]) {
    return targetFn.apply(this, args);
  } as T;
}
